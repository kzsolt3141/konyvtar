git checkout .
git pull

$filePath = './entrypoint.exe'
$dbDir = 'database'

if (Test-Path $filePath -PathType Leaf) {
    # If the file exists, delete it
    Remove-Item $filePath
    Write-Host "File deleted: $filePath"
} else {
    Write-Host "File does not exist: $filePath"
}

npm install

pkg entrypoint.js -t node18

if (-not (Test-Path -Path $dbDir -PathType Container)) {
    # If the directory doesn't exist, create it
    New-Item -Path $dbDir -ItemType Directory
    Write-Host "Directory created: $dbDir"
} else {
    Write-Host "Directory already exists: $dbDir"
}

Start-Process -FilePath ./entrypoint.exe -NoNewWindow
Start-Process localhost.url