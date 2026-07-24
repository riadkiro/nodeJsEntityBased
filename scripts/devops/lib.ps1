$ErrorActionPreference = "Stop"

function Get-DexappRoot {
    return (Resolve-Path (Join-Path $PSScriptRoot "..\..")).Path
}

function Read-DexappEnvFile {
    param([string]$Path)

    $values = @{}
    if (-not (Test-Path -LiteralPath $Path)) {
        return ,$values
    }

    foreach ($line in Get-Content -LiteralPath $Path) {
        $trimmed = $line.Trim()
        if ($trimmed.Length -eq 0 -or $trimmed.StartsWith("#")) {
            continue
        }

        $idx = $trimmed.IndexOf("=")
        if ($idx -le 0) {
            continue
        }

        $key = $trimmed.Substring(0, $idx).Trim()
        $value = $trimmed.Substring($idx + 1).Trim()
        if (($value.StartsWith('"') -and $value.EndsWith('"')) -or ($value.StartsWith("'") -and $value.EndsWith("'"))) {
            $value = $value.Substring(1, $value.Length - 2)
        }

        $values[$key] = $value
    }

    return ,$values
}

function Get-DexappDeployConfig {
    param([string[]]$RequiredKeys = @("SSH_TARGET", "SERVER_APP_DIR"))

    $root = Get-DexappRoot
    $path = Join-Path $root ".deploy.env"
    if (-not (Test-Path -LiteralPath $path)) {
        throw "Missing .deploy.env. Copy .deploy.env.example to .deploy.env and fill SSH_TARGET and SERVER_APP_DIR."
    }

    $config = Read-DexappEnvFile -Path $path
    $defaults = @{
        GIT_BRANCH = "beta"
        PM2_NAME = "dexioSaas"
        SERVER_INSTALL_CMD = "npm ci"
        SERVER_BUILD_CMD = "npm run build:all"
        SERVER_PRUNE_CMD = "npm prune --omit=dev"
        SERVER_RELOAD_CMD = "pm2 reload dexioSaas --update-env"
        LOCAL_MONGO_BASE_URI = "mongodb://127.0.0.1:27017/"
        REMOTE_MONGO_BASE_URI = "mongodb://127.0.0.1:27017/"
        DB_NAMES = "saasDemo,saas_app_rb_5001"
        REMOTE_BACKUP_DIR = "/tmp/dexapp-sync"
    }

    foreach ($key in $defaults.Keys) {
        if (-not $config.ContainsKey($key) -or [string]::IsNullOrWhiteSpace($config[$key])) {
            $config[$key] = $defaults[$key]
        }
    }

    foreach ($required in $RequiredKeys) {
        if (-not $config.ContainsKey($required) -or [string]::IsNullOrWhiteSpace($config[$required])) {
            throw "Missing $required in .deploy.env."
        }
    }

    return ,$config
}

function Assert-CommandAvailable {
    param([string]$Name)

    if (-not (Get-Command $Name -ErrorAction SilentlyContinue)) {
        throw "Command '$Name' was not found. Install it or add it to PATH."
    }
}

function Add-LocalMongoToolsPath {
    $root = Get-DexappRoot
    $toolsRoot = Join-Path $root ".agent\tools"
    if (-not (Test-Path -LiteralPath $toolsRoot)) {
        return
    }

    $mongoTool = Get-ChildItem -LiteralPath $toolsRoot -Recurse -Filter "mongorestore.exe" -ErrorAction SilentlyContinue | Select-Object -First 1
    if (-not $mongoTool) {
        return
    }

    $binDir = $mongoTool.Directory.FullName
    $paths = $env:PATH -split [IO.Path]::PathSeparator
    if ($paths -notcontains $binDir) {
        $env:PATH = $binDir + [IO.Path]::PathSeparator + $env:PATH
    }
}

function Assert-CleanWorkingTree {
    param([string]$Context)

    $status = git status --porcelain
    if ($status) {
        throw "$Context requires a clean local working tree. Commit or stash local changes first."
    }
}

function Assert-RemoteSafeValue {
    param(
        [string]$Value,
        [string]$Name
    )

    if ($Value -match "[`r`n']") {
        throw "$Name contains unsupported shell characters."
    }
}

function ConvertTo-ShellSingleQuoted {
    param([string]$Value)

    return "'" + ($Value -replace "'", "'\''") + "'"
}

function Get-DbNamesFromConfig {
    param(
        [hashtable]$Config,
        [string[]]$Override
    )

    $dbNames = @()
    if ($Override -and $Override.Count -gt 0) {
        $dbNames = $Override -join ","
        $dbNames = $dbNames -split ","
    } else {
        $dbNames = $Config.DB_NAMES -split ","
    }

    $clean = @()
    foreach ($db in $dbNames) {
        $name = $db.Trim()
        if (-not $name) {
            continue
        }
        if ($name -notmatch "^[A-Za-z0-9_.-]+$") {
            throw "Invalid database name '$name'."
        }
        $clean += $name
    }

    if ($clean.Count -eq 0) {
        throw "No database names configured."
    }

    return $clean
}
