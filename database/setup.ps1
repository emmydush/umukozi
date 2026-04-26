# Umukozi Database Setup Script
# PowerShell script to initialize PostgreSQL database and tables

# Database connection parameters
$env:PGPASSWORD = "Jesuslove@12"
$DB_HOST = "localhost"
$DB_PORT = "5432"
$DB_USER = "postgres"
$DB_NAME = "umukozi"

Write-Host "Setting up Umukozi Database..." -ForegroundColor Green
Write-Host ""

# Check if psql is available
try {
    $psqlVersion = & psql --version 2>$null
    Write-Host "PostgreSQL client found: $psqlVersion" -ForegroundColor Cyan
} catch {
    Write-Host "Error: PostgreSQL client (psql) not found!" -ForegroundColor Red
    Write-Host "Please install PostgreSQL or add psql to your PATH" -ForegroundColor Yellow
    exit 1
}

# Create database
Write-Host "Creating database '$DB_NAME'..." -ForegroundColor Yellow
try {
    & psql -h $DB_HOST -p $DB_PORT -U $DB_USER -c "CREATE DATABASE $DB_NAME;" 2>$null
    Write-Host "Database created successfully!" -ForegroundColor Green
} catch {
    Write-Host "Database might already exist or there was an error. Continuing..." -ForegroundColor Yellow
}

Write-Host ""

# Create tables and insert sample data
Write-Host "Creating tables and inserting sample data..." -ForegroundColor Yellow
try {
    & psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f schema.sql
    Write-Host "Tables and sample data created successfully!" -ForegroundColor Green
} catch {
    Write-Host "Error creating tables: $_" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Database setup completed!" -ForegroundColor Green
Write-Host ""
Write-Host "Connection Details:" -ForegroundColor Cyan
Write-Host "  Database: $DB_NAME"
Write-Host "  Host: $DB_HOST"
Write-Host "  Port: $DB_PORT"
Write-Host "  User: $DB_USER"
Write-Host ""
Write-Host "You can now connect to the database using these credentials." -ForegroundColor Green

# Test connection
Write-Host "Testing database connection..." -ForegroundColor Yellow
try {
    $result = & psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "SELECT COUNT(*) FROM users;" -t -A
    Write-Host "Connection successful! Found $result users in database." -ForegroundColor Green
} catch {
    Write-Host "Connection test failed: $_" -ForegroundColor Red
}

Write-Host ""
Write-Host "Press any key to exit..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
