@echo off
echo ============================================
echo Adding 16 Speaking Practice Topics
echo ============================================
echo.
echo Enter MySQL root password when prompted...
echo.

"C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -u root -p quiz_generator < "D:\THESIS\AIQuiz_fullstack\BE_quiz\backend\insert-topics-simple.sql"

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ============================================
    echo SUCCESS! Topics added to database
    echo ============================================
    echo.
    echo Refresh your Speaking Practice page to see new topics!
) else (
    echo.
    echo ============================================
    echo FAILED! Could not add topics
    echo ============================================
    echo.
    echo Please check MySQL connection and try again.
)

pause
