# create_backend_venv.ps1

$ErrorActionPreference = "Stop"

$projectRoot = Resolve-Path "."
$backendDir = Join-Path $projectRoot "backend"
$oldVenv = Join-Path $projectRoot ".venv"
$newVenv = Join-Path $backendDir ".venv"

Write-Host "Project root: $projectRoot"

if (-Not (Test-Path $backendDir)) {
    Write-Error "Backend directory not found: $backendDir"
}

Set-Location $backendDir

Write-Host "Creating virtual environment..."

if (-Not (Test-Path $newVenv)) {

    if (Get-Command py -ErrorAction SilentlyContinue) {
        py -3 -m venv $newVenv
    }
    elseif (Get-Command python -ErrorAction SilentlyContinue) {
        python -m venv $newVenv
    }
    else {
        Write-Error "Python not found"
    }

} else {
    Write-Host ".venv already exists"
}

$pythonExe = Join-Path $newVenv "Scripts\python.exe"

if (-Not (Test-Path $pythonExe)) {
    Write-Error "python.exe not found"
}

Write-Host "Upgrading pip..."
& $pythonExe -m pip install --upgrade pip

$req = Join-Path $backendDir "requirements.txt"

if (Test-Path $req) {
    Write-Host "Installing requirements..."
    & $pythonExe -m pip install -r $req
} else {
    Write-Host "requirements.txt not found"
}

Write-Host "Python version:"
& $pythonExe --version

Write-Host ""
$confirm = Read-Host "Delete old .venv? (Y/N)"

if ($confirm -match "^[Yy]$") {
    if (Test-Path $oldVenv) {
        Remove-Item -Recurse -Force $oldVenv
        Write-Host "Deleted old .venv"
    } else {
        Write-Host "Old .venv not found"
    }
}

Write-Host "Done"