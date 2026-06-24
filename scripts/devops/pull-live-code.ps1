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
Assert-CleanWorkingTree -Context "Pulling live code"

$message = ($MessageParts -join " ").Trim()
if (-not $message) {
    $message = "Live server edits $(Get-Date -Format 'yyyy-MM-dd HH:mm')"
}
Assert-RemoteSafeValue -Value $message -Name "commit message"

$remote = @(
    "set -e"
    "cd '$($config.SERVER_APP_DIR)'"
    "git checkout '$branch'"
    "if [ -n `"$(git status --porcelain)`" ]; then git add -A && git commit -m '$message' && git push origin '$branch'; else git push origin '$branch'; fi"
) -join " && "

ssh $config.SSH_TARGET $remote
git fetch origin
git pull --ff-only origin $branch
