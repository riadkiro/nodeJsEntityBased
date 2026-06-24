param(
    [Parameter(ValueFromRemainingArguments = $true)]
    [string[]]$MessageParts
)

. "$PSScriptRoot\lib.ps1"

Assert-CommandAvailable -Name "ssh"
$config = Get-DexappDeployConfig
$root = Get-DexappRoot
Set-Location $root

$branch = $config.GIT_BRANCH
Assert-RemoteSafeValue -Value $branch -Name "GIT_BRANCH"
Assert-RemoteSafeValue -Value $config.SERVER_APP_DIR -Name "SERVER_APP_DIR"

$currentBranch = (git branch --show-current).Trim()
if ($currentBranch -ne $branch) {
    throw "Current branch is '$currentBranch', expected '$branch'."
}

npm run build:all

$status = git status --porcelain
if ($status) {
    if (-not $MessageParts -or $MessageParts.Count -eq 0) {
        throw 'Local changes detected. Run: npm run live:push -- "your commit message"'
    }

    $message = ($MessageParts -join " ").Trim()
    if (-not $message) {
        throw "Commit message is empty."
    }

    git add -A
    git commit -m $message
}

git push origin $branch

$remote = @(
    "set -e"
    "cd '$($config.SERVER_APP_DIR)'"
    "git fetch origin"
    "git checkout '$branch'"
    "git pull --ff-only origin '$branch'"
    $config.SERVER_INSTALL_CMD
    $config.SERVER_BUILD_CMD
    $config.SERVER_RELOAD_CMD
) -join " && "

ssh $config.SSH_TARGET $remote
