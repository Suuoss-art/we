@echo off
REM Script to generate secure, obfuscated admin panel URL for Windows
REM Generates a long, complex URL path that's hard to detect

echo 🔐 Generating secure admin panel URL...

REM Generate random components using PowerShell
for /f %%i in ('powershell -Command "Get-Random -Minimum 100000000000 -Maximum 999999999999"') do set SEGMENT1=%%i
for /f %%i in ('powershell -Command "Get-Random -Minimum 10000000 -Maximum 99999999"') do set SEGMENT2=%%i
for /f %%i in ('powershell -Command "Get-Random -Minimum 1000000000 -Maximum 9999999999"') do set SEGMENT3=%%i
for /f %%i in ('powershell -Command "Get-Random -Minimum 100000000000000 -Maximum 999999999999999"') do set SEGMENT4=%%i
for /f %%i in ('powershell -Command "Get-Random -Minimum 1000000 -Maximum 9999999"') do set SEGMENT5=%%i

REM Add some letters to make it more complex
set SEGMENT1=%SEGMENT1%aBc
set SEGMENT2=%SEGMENT2%dEf
set SEGMENT3=%SEGMENT3%gHi
set SEGMENT4=%SEGMENT4%jKl
set SEGMENT5=%SEGMENT5%mNo

REM Create the obfuscated admin URL path
set ADMIN_URL_PATH=/%SEGMENT1%-%SEGMENT2%-%SEGMENT3%/%SEGMENT4%/%SEGMENT5%

REM Generate admin subdomain
for /f %%i in ('powershell -Command "Get-Random -Minimum 1000000000000000 -Maximum 9999999999999999"') do set ADMIN_SUBDOMAIN=kopma-admin-%%i

echo.
echo ✅ Secure admin URLs generated:
echo.
echo Admin URL Path (for Oracle VPS routing):
echo %ADMIN_URL_PATH%
echo.
echo Admin Subdomain (for Netlify):
echo %ADMIN_SUBDOMAIN%.netlify.app
echo.
echo Full Admin URL Examples:
echo   Local: http://localhost:3000%ADMIN_URL_PATH%
echo   Production: https://kopmaukmunnes.com%ADMIN_URL_PATH%
echo   Netlify: https://%ADMIN_SUBDOMAIN%.netlify.app
echo.
echo 💡 Save these URLs securely! They will be used in:
echo   • .env file (ADMIN_URL_PATH)
echo   • nginx configuration
echo   • netlify.toml configuration
echo.

REM Create output directory
if not exist "admin-config" mkdir admin-config

REM Save to file
echo # Generated Admin Panel Configuration > admin-config\admin-config.env
echo # Generated on: %date% %time% >> admin-config\admin-config.env
echo # KEEP THESE VALUES SECRET! >> admin-config\admin-config.env
echo. >> admin-config\admin-config.env
echo ADMIN_URL_PATH=%ADMIN_URL_PATH% >> admin-config\admin-config.env
echo ADMIN_SUBDOMAIN=%ADMIN_SUBDOMAIN% >> admin-config\admin-config.env
echo ADMIN_NETLIFY_URL=https://%ADMIN_SUBDOMAIN%.netlify.app >> admin-config\admin-config.env

echo ✅ Configuration saved to: admin-config\admin-config.env
echo ⚠️  Keep this file secure and add values to your .env file!
echo.

echo # Add to .env file:
echo ADMIN_URL_PATH=%ADMIN_URL_PATH%
echo ADMIN_SUBDOMAIN=%ADMIN_SUBDOMAIN%
echo ADMIN_NETLIFY_URL=https://%ADMIN_SUBDOMAIN%.netlify.app

pause
