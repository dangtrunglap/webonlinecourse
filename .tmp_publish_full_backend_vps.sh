#!/usr/bin/env bash
set -euo pipefail

src="/home/adminuser/deploy_tmp/backend_src_20260318_221459/Backend"
pub="/home/adminuser/deploy_build/backend_publish_full"

mkdir -p "$pub"
dotnet publish "$src/OnlineCoursePlatform.API.csproj" -c Release -o "$pub"
test -f "$pub/OnlineCoursePlatform.API.dll"
echo "PUBLISH_OK"
ls -la "$pub" | head
