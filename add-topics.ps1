# PowerShell script to add speaking topics
Write-Host "Adding 16 speaking topics to database..." -ForegroundColor Cyan

$sqlFile = "D:\THESIS\AIQuiz_fullstack\BE_quiz\backend\migrations\quick-insert-topics.sql"

# Read password securely
$password = Read-Host "Enter MySQL root password" -AsSecureString
$BSTR = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($password)
$plainPassword = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($BSTR)

# Run MySQL command
& "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -u root "-p$plainPassword" quiz_generator -e "source $sqlFile"

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n✓ Topics added successfully!" -ForegroundColor Green
} else {
    Write-Host "`n✗ Failed to add topics" -ForegroundColor Red
}
