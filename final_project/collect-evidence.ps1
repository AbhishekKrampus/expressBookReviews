$ErrorActionPreference = 'Stop'
$base = 'http://localhost:5000'
$outDir = Join-Path $PSScriptRoot 'evidence'
New-Item -ItemType Directory -Force -Path $outDir | Out-Null
$cookieJar = Join-Path $outDir 'cookies.txt'
$repoUrl = 'https://api.github.com/repos/AbhishekKrampus/expressBookReviews'

function Save-CurlEvidence([string]$name, [string]$command, [string[]]$curlArgs) {
  $path = Join-Path $outDir $name
  Set-Content -Path $path -Value $command -Encoding utf8
  & curl.exe @curlArgs 2>&1 | Add-Content -Path $path -Encoding utf8
  Write-Host "Saved $path"
}

Save-CurlEvidence 'githubrepo' "curl.exe -s $repoUrl" @('-s', $repoUrl)
Save-CurlEvidence 'getallbooks' "curl.exe -s $base/" @('-s', "$base/")
Save-CurlEvidence 'getbooksbyISBN' "curl.exe -s $base/isbn/1" @('-s', "$base/isbn/1")
Save-CurlEvidence 'getbooksbyauthor' "curl.exe -s $base/author/Chinua%20Achebe" @('-s', "$base/author/Chinua%20Achebe")
Save-CurlEvidence 'getbooksbytitle' "curl.exe -s $base/title/Things%20Fall%20Apart" @('-s', "$base/title/Things%20Fall%20Apart")
Save-CurlEvidence 'getbookreview' "curl.exe -s $base/review/1" @('-s', "$base/review/1")

$username = 'abhi_bookreview_demo'
$password = 'Pass123!'
$registerBody = '{"username":"' + $username + '","password":"' + $password + '"}'
$registerCommand = "curl.exe -s -X POST $base/register -H 'Content-Type: application/json' -d '$registerBody'"
Save-CurlEvidence 'register' $registerCommand @('-s','-X','POST',"$base/register",'-H','Content-Type: application/json','-d',$registerBody)

$loginBody = '{"username":"' + $username + '","password":"' + $password + '"}'
$loginCommand = "curl.exe -s -c `"$cookieJar`" -X POST $base/customer/login -H 'Content-Type: application/json' -d '$loginBody'"
Save-CurlEvidence 'login' $loginCommand @('-s','-c',$cookieJar,'-X','POST',"$base/customer/login",'-H','Content-Type: application/json','-d',$loginBody)

$reviewUrl = "$base/customer/auth/review/1?review=Excellent%20book%20with%20a%20powerful%20message"
$reviewCommand = "curl.exe -s -b `"$cookieJar`" -X PUT `"$reviewUrl`""
$reviewPath = Join-Path $outDir 'reviewadded'
Set-Content -Path $reviewPath -Value $reviewCommand -Encoding utf8
& curl.exe -s -b $cookieJar -X PUT $reviewUrl 2>&1 | Add-Content -Path $reviewPath -Encoding utf8
'curl.exe -s http://localhost:5000/review/1' | Add-Content -Path $reviewPath -Encoding utf8
& curl.exe -s "$base/review/1" 2>&1 | Add-Content -Path $reviewPath -Encoding utf8
Write-Host "Saved $reviewPath"

$deleteUrl = "$base/customer/auth/review/1"
$deletePath = Join-Path $outDir 'deletereview'
Set-Content -Path $deletePath -Value "curl.exe -s -b `"$cookieJar`" -X DELETE $deleteUrl" -Encoding utf8
& curl.exe -s -b $cookieJar -X DELETE $deleteUrl 2>&1 | Add-Content -Path $deletePath -Encoding utf8
'curl.exe -s http://localhost:5000/review/1' | Add-Content -Path $deletePath -Encoding utf8
& curl.exe -s "$base/review/1" 2>&1 | Add-Content -Path $deletePath -Encoding utf8
Write-Host "Saved $deletePath"
Write-Host 'Evidence files created. Check each file in evidence/ before submitting.'
