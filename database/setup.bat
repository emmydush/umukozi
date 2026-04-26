@echo off
echo Setting up Umukozi Database...
echo.

REM Database connection parameters
set PGPASSWORD=Jesuslove@12
set DB_HOST=localhost
set DB_PORT=5432
set DB_USER=postgres
set DB_NAME=umukozi

echo Creating database...
psql -h %DB_HOST% -p %DB_PORT% -U %DB_USER% -c "CREATE DATABASE %DB_NAME%;" 2>nul

echo Database created successfully!
echo.

echo Creating tables and inserting sample data...
psql -h %DB_HOST% -p %DB_PORT% -U %DB_USER% -d %DB_NAME% -f schema.sql

echo.
echo Database setup completed!
echo.
echo Database: %DB_NAME%
echo Host: %DB_HOST%
echo Port: %DB_PORT%
echo User: %DB_USER%
echo.
pause
