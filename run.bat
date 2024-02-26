@echo off
setlocal enabledelayedexpansion

set "currentPath=%~dp0"

for %%A in ("%currentPath%") do set "currDir=%%~nxA"

set "parentPath=%currentPath%\.."

for %%A in ("%parentPath%") do set "prevDir=%%~nxA"


set "grandParentPath=%parentPath%\.."

for %%A in ("%grandParentPath%") do set "grandParentDir=%%~nxA"

set "cmd=pm2 start app.js -n !grandParentDir!-!prevDir!"

echo Command: !cmd!

!cmd!
