@echo off
cd /d "D:\2026 CodeSpace\01 Web-antigravity-codex\Webonlinecourse\Backend"
dotnet run --urls http://localhost:5078 >> ".api-manual.out.log" 2>> ".api-manual.err.log"
