param(
    [string[]]$Databases
)

. "$PSScriptRoot\lib.ps1"

Add-LocalMongoToolsPath
Assert-CommandAvailable -Name "ssh"
Assert-CommandAvailable -Name "scp"
Assert-CommandAvailable -Name "tar"
Assert-CommandAvailable -Name "mongorestore"

$config = Get-DexappDeployConfig -RequiredKeys @("SSH_TARGET")
$dbNames = Get-DbNamesFromConfig -Config $config -Override $Databases
$root = Get-DexappRoot
Set-Location $root

Assert-RemoteSafeValue -Value $config.REMOTE_BACKUP_DIR -Name "REMOTE_BACKUP_DIR"

$stamp = Get-Date -Format "yyyyMMdd-HHmmss"
$remoteBaseDir = $config.REMOTE_BACKUP_DIR.TrimEnd("/")
$remoteDumpDir = "$remoteBaseDir/dexapp-db-$stamp"
$remoteArchive = "$remoteDumpDir.tgz"
$localDir = Join-Path $root "backups\live-sync\$stamp"
$localArchive = Join-Path $localDir "live-db.tgz"
$extractDir = Join-Path $localDir "dump"

New-Item -ItemType Directory -Force -Path $localDir, $extractDir | Out-Null

$dumpCommands = @(
    "set -e"
    "mkdir -p '$remoteDumpDir'"
)

foreach ($db in $dbNames) {
    $remoteMongoUri = ConvertTo-ShellSingleQuoted -Value $config.REMOTE_MONGO_BASE_URI
    $dumpCommands += "mongodump --uri=$remoteMongoUri --db='$db' --out='$remoteDumpDir'"
}

$dumpCommands += "tar -czf '$remoteArchive' -C '$remoteDumpDir' ."
$remoteDumpCommand = $dumpCommands -join " && "

& ssh $config.SSH_TARGET $remoteDumpCommand
if ($LASTEXITCODE -ne 0) {
    throw "Remote mongodump failed. Check REMOTE_MONGO_BASE_URI credentials in .deploy.env."
}

& scp "$($config.SSH_TARGET):$remoteArchive" $localArchive
if ($LASTEXITCODE -ne 0) {
    throw "Could not copy remote dump archive from $remoteArchive."
}

& tar -xzf $localArchive -C $extractDir
if ($LASTEXITCODE -ne 0) {
    throw "Could not extract local dump archive $localArchive."
}

foreach ($db in $dbNames) {
    $dbPath = Join-Path $extractDir $db
    if (-not (Test-Path -LiteralPath $dbPath)) {
        throw "Dump for database '$db' was not found in $extractDir."
    }
    & mongorestore --uri=$config.LOCAL_MONGO_BASE_URI --drop --db=$db $dbPath
    if ($LASTEXITCODE -ne 0) {
        throw "mongorestore failed for database '$db'."
    }
}

ssh $config.SSH_TARGET "rm -rf '$remoteDumpDir' '$remoteArchive'" | Out-Null
Write-Host "Live database copied to local MongoDB: $($dbNames -join ', ')"
