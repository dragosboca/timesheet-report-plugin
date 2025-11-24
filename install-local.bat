@echo off
REM Local Installation Script for Timesheet Report Plugin (Windows)
REM This script installs the plugin locally for testing purposes

setlocal enabledelayedexpansion

REM Colors for output (using echo with special characters)
set "RED=[31m"
set "GREEN=[32m"
set "YELLOW=[33m"
set "BLUE=[34m"
set "NC=[0m"

REM Check if we're in the right directory
if not exist "manifest.json" (
    echo [31m[ERROR][0m This script must be run from the timesheet-report-plugin directory
    echo Current directory: %CD%
    pause
    exit /b 1
)

if not exist "package.json" (
    echo [31m[ERROR][0m This script must be run from the timesheet-report-plugin directory
    echo Current directory: %CD%
    pause
    exit /b 1
)

REM Build the plugin
echo [34m[INFO][0m Building the plugin...
call npm run build
if errorlevel 1 (
    echo [31m[ERROR][0m Failed to build the plugin
    pause
    exit /b 1
)

echo [32m[SUCCESS][0m Plugin built successfully

REM Check if required files exist
if not exist "main.js" (
    echo [31m[ERROR][0m main.js not found. Build may have failed.
    pause
    exit /b 1
)

if not exist "styles.css" (
    echo [31m[ERROR][0m styles.css not found.
    pause
    exit /b 1
)

REM Find Obsidian vaults
echo [34m[INFO][0m Looking for Obsidian vaults...

REM Common Obsidian vault locations on Windows
set "SEARCH_LOCATIONS=%USERPROFILE%\Documents\Obsidian %USERPROFILE%\Obsidian %USERPROFILE%\OneDrive\Obsidian %USERPROFILE%\Dropbox\Obsidian %USERPROFILE%\Desktop\Obsidian"

set VAULT_COUNT=0
set "VAULTS_LIST="

REM Search for vaults
for %%L in (%SEARCH_LOCATIONS%) do (
    if exist "%%L" (
        for /d %%D in ("%%L\*") do (
            if exist "%%D\.obsidian" (
                set /a VAULT_COUNT+=1
                set "VAULT_!VAULT_COUNT!=%%D"
                set "VAULTS_LIST=!VAULTS_LIST! !VAULT_COUNT!"
            )
        )
    )
)

REM If no vaults found, ask user for path
if %VAULT_COUNT%==0 (
    echo [33m[WARNING][0m No Obsidian vaults found automatically.
    echo Please enter the full path to your Obsidian vault:
    set /p VAULT_PATH=

    if not exist "!VAULT_PATH!\.obsidian" (
        echo [31m[ERROR][0m Invalid vault path. No .obsidian directory found.
        pause
        exit /b 1
    )

    set "SELECTED_VAULT=!VAULT_PATH!"
) else (
    REM Show found vaults and let user choose
    echo.
    echo [34m[INFO][0m Found %VAULT_COUNT% Obsidian vault(s):

    for /L %%i in (1,1,%VAULT_COUNT%) do (
        for %%f in ("!VAULT_%%i!") do (
            echo   %%i. %%~nxf (!VAULT_%%i!)
        )
    )

    echo.
    echo Enter the number of the vault you want to install to (or 'q' to quit):
    set /p choice=

    if /i "!choice!"=="q" (
        echo [34m[INFO][0m Installation cancelled.
        pause
        exit /b 0
    )

    REM Validate choice
    if !choice! LSS 1 (
        echo [31m[ERROR][0m Invalid choice. Please run the script again.
        pause
        exit /b 1
    )

    if !choice! GTR %VAULT_COUNT% (
        echo [31m[ERROR][0m Invalid choice. Please run the script again.
        pause
        exit /b 1
    )

    set "SELECTED_VAULT=!VAULT_%choice%!"
)

REM Create plugin directory
set "PLUGIN_DIR=!SELECTED_VAULT!\.obsidian\plugins\timesheet-report"
echo [34m[INFO][0m Creating plugin directory: !PLUGIN_DIR!

if not exist "!PLUGIN_DIR!" mkdir "!PLUGIN_DIR!"

REM Copy plugin files
echo [34m[INFO][0m Copying plugin files...

copy main.js "!PLUGIN_DIR!\" > nul
if errorlevel 1 (
    echo [31m[ERROR][0m Failed to copy main.js
    pause
    exit /b 1
)

copy manifest.json "!PLUGIN_DIR!\" > nul
if errorlevel 1 (
    echo [31m[ERROR][0m Failed to copy manifest.json
    pause
    exit /b 1
)

copy styles.css "!PLUGIN_DIR!\" > nul
if errorlevel 1 (
    echo [31m[ERROR][0m Failed to copy styles.css
    pause
    exit /b 1
)

echo [32m[SUCCESS][0m Plugin files copied successfully!

REM Check if plugin is already enabled
set "COMMUNITY_PLUGINS_FILE=!SELECTED_VAULT!\.obsidian\community-plugins.json"

if exist "!COMMUNITY_PLUGINS_FILE!" (
    findstr /c:"timesheet-report" "!COMMUNITY_PLUGINS_FILE!" > nul
    if !errorlevel!==0 (
        echo [32m[SUCCESS][0m Plugin already enabled in Obsidian
    ) else (
        echo [33m[WARNING][0m Plugin installed but not enabled.
        echo [34m[INFO][0m To enable the plugin:
        echo   1. Open Obsidian
        echo   2. Go to Settings ^> Community Plugins
        echo   3. Find 'Timesheet Report' and toggle it ON
    )
) else (
    echo [33m[WARNING][0m Could not find community-plugins.json
    echo [34m[INFO][0m To enable the plugin:
    echo   1. Open Obsidian
    echo   2. Go to Settings ^> Community Plugins
    echo   3. Find 'Timesheet Report' and toggle it ON
)

echo.
for %%f in ("!SELECTED_VAULT!") do set "VAULT_NAME=%%~nxf"
echo [32m[SUCCESS][0m Installation complete!
echo [34m[INFO][0m Vault: !VAULT_NAME!
echo [34m[INFO][0m Plugin directory: !PLUGIN_DIR!

echo.
echo [34m[INFO][0m Next steps:
echo   1. Restart Obsidian (or reload with Ctrl+R)
echo   2. Enable the plugin in Settings ^> Community Plugins
echo   3. Configure your timesheet folder in plugin settings
echo   4. Create some timesheet files and test the plugin!

echo.
echo [34m[INFO][0m For hot-reload development, consider using:
echo   npm run dev
echo   (Then use the Hot Reload plugin in Obsidian)

echo.
pause
