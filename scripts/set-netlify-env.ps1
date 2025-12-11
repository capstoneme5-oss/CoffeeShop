param(
    [Parameter(Mandatory=$true)]
    [string]$SiteId,
    [Parameter(Mandatory=$true)]
    [string]$ServiceAccountPath
)

if (-not (Get-Command netlify -ErrorAction SilentlyContinue)) {
    Write-Error "netlify CLI is not installed. Install with: npm install -g netlify-cli"
    exit 1
}

if (-not $env:NETLIFY_AUTH_TOKEN) {
    Write-Error "Please set environment variable NETLIFY_AUTH_TOKEN with your Netlify personal access token."
    exit 1
}

if (-not (Test-Path $ServiceAccountPath)) {
    Write-Error "Service account file not found: $ServiceAccountPath"
    exit 1
}

$sa = Get-Content $ServiceAccountPath -Raw

Write-Host "Setting USE_FIREBASE=true on site $SiteId"
netlify env:set USE_FIREBASE true --site $SiteId | Out-Null

Write-Host "Setting FIREBASE_SERVICE_ACCOUNT from $ServiceAccountPath (this may take a moment)"
netlify env:set FIREBASE_SERVICE_ACCOUNT "$sa" --site $SiteId | Out-Null

Write-Host "Environment variables set on Netlify for site $SiteId"
Write-Host "Trigger a deploy from Netlify UI or push to main to pick up changes."
