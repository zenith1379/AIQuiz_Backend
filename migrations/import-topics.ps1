# PowerShell script to import speaking topics
# Run this from backend directory

Write-Host "Importing speaking practice topics..." -ForegroundColor Green

$mysqlPath = "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe"
$scriptPath = "D:\THESIS\AIQuiz_fullstack\BE_quiz\backend\migrations\add_more_speaking_topics.sql"

if (Test-Path $mysqlPath) {
    Write-Host "Found MySQL at: $mysqlPath" -ForegroundColor Cyan
    
    # Run the SQL script
    & $mysqlPath -u root -p quiz_generator -e "source $scriptPath"
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "`n✓ Topics imported successfully!" -ForegroundColor Green
        
        # Verify
        Write-Host "`nVerifying topics count..." -ForegroundColor Cyan
        & $mysqlPath -u root -p quiz_generator -e "SELECT difficulty_level, COUNT(*) as count FROM speaking_practice_topics GROUP BY difficulty_level;"
    } else {
        Write-Host "`n✗ Import failed. Exit code: $LASTEXITCODE" -ForegroundColor Red
    }
} else {
    Write-Host "✗ MySQL not found at: $mysqlPath" -ForegroundColor Red
    Write-Host "Please check your MySQL installation path." -ForegroundColor Yellow
}
