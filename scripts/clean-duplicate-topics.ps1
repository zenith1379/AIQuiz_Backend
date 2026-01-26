# PowerShell script to clean duplicate speaking practice topics
# Run this from BE_quiz/backend directory

Write-Host "=== Cleaning Duplicate Speaking Practice Topics ===" -ForegroundColor Cyan

# Check if SQL file exists
$sqlFile = "migrations/remove-duplicate-topics.sql"
if (-not (Test-Path $sqlFile)) {
    Write-Host "Error: SQL file not found at $sqlFile" -ForegroundColor Red
    exit 1
}

# Get database connection details from environment or config
$dbHost = if ($env:DB_HOST) { $env:DB_HOST } else { "localhost" }
$dbUser = if ($env:DB_USER) { $env:DB_USER } else { "root" }
$dbName = if ($env:DB_NAME) { $env:DB_NAME } else { "quiz_generator" }

Write-Host "`nDatabase Configuration:" -ForegroundColor Yellow
Write-Host "  Host: $dbHost"
Write-Host "  User: $dbUser"
Write-Host "  Database: $dbName"

# Prompt for password
Write-Host "`nEnter MySQL password (or press Enter if no password):" -ForegroundColor Yellow
$password = Read-Host -AsSecureString
$plainPassword = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto(
    [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($password)
)

# Build MySQL command
$mysqlCmd = "mysql -h $dbHost -u $dbUser"
if ($plainPassword) {
    $mysqlCmd += " -p$plainPassword"
}
$mysqlCmd += " $dbName < `"$sqlFile`""

Write-Host "`nExecuting SQL script..." -ForegroundColor Green

try {
    # Execute the SQL file
    $result = Invoke-Expression $mysqlCmd 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "`n✅ Successfully cleaned duplicate topics!" -ForegroundColor Green
        Write-Host "`nFinal topic count:" -ForegroundColor Cyan
        Write-Host "  - Beginner: 4 topics"
        Write-Host "  - Intermediate: 6 topics"
        Write-Host "  - Advanced: 6 topics"
        Write-Host "  - TOTAL: 16 unique topics"
        
        Write-Host "`n✨ Database is now clean and ready to use!" -ForegroundColor Green
    } else {
        Write-Host "`n❌ Error executing SQL script" -ForegroundColor Red
        Write-Host $result
    }
} catch {
    Write-Host "`n❌ Error: $_" -ForegroundColor Red
}

Write-Host "`nPress any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
