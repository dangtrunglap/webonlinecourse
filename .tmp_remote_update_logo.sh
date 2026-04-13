#!/usr/bin/env bash
set -euo pipefail

sudo_password='adminuser'
stamp="$(date +%Y%m%d_%H%M%S)"
backup_dir="/var/www/onlinecourse_frontend_backup_${stamp}"
site_root="/var/www/onlinecourse_frontend"
asset_dir="$site_root/asset"

echo "$sudo_password" | sudo -S mkdir -p "$backup_dir"
echo "$sudo_password" | sudo -S rsync -a "$site_root/" "$backup_dir/"

echo "$sudo_password" | sudo -S mkdir -p "$asset_dir"
echo "$sudo_password" | sudo -S cp /home/adminuser/GHTXDBK-Icon.png "$asset_dir/GHTXDBK-Icon.png"
echo "$sudo_password" | sudo -S chown root:root "$asset_dir/GHTXDBK-Icon.png"
echo "$sudo_password" | sudo -S chmod 644 "$asset_dir/GHTXDBK-Icon.png"

cat <<'PY' >/home/adminuser/.tmp_patch_frontend_logo.py
from pathlib import Path

site_root = Path("/var/www/onlinecourse_frontend")
icon_url = "/asset/GHTXDBK-Icon.png"
icon_abs_url = "https://ghtxdbk.com/asset/GHTXDBK-Icon.png"

replacements = {
    "/asset/Logo_GHTXDBK.jpg": icon_url,
    "./asset/Logo_GHTXDBK.jpg": "./asset/GHTXDBK-Icon.png",
    "https://ghtxdbk.com/og-default.svg": icon_abs_url,
    '"logo":"https://ghtxdbk.com/og-default.svg"': f'"logo":"{icon_abs_url}"',
    'type="image/jpeg" href="/asset/GHTXDBK-Icon.png"': 'type="image/png" href="/asset/GHTXDBK-Icon.png"',
    'type="image/jpeg" href="./asset/GHTXDBK-Icon.png"': 'type="image/png" href="./asset/GHTXDBK-Icon.png"',
}

for path in site_root.rglob("index.html"):
    text = path.read_text(encoding="utf-8")
    original = text
    for old, new in replacements.items():
        text = text.replace(old, new)
    path.write_text(text, encoding="utf-8")

for path in site_root.glob("assets/*.css"):
    text = path.read_text(encoding="utf-8")
    text = text.replace("/asset/Logo_GHTXDBK.jpg", icon_url)
    path.write_text(text, encoding="utf-8")
PY

python3 /home/adminuser/.tmp_patch_frontend_logo.py

echo "=== VERIFY FILES ==="
echo "$sudo_password" | sudo -S test -f "$asset_dir/GHTXDBK-Icon.png"
grep -R -n "GHTXDBK-Icon.png\|og-default.svg\|Logo_GHTXDBK.jpg" "$site_root" | head -n 40 || true

echo "=== HTTP CHECK ==="
curl -I -H "Host: ghtxdbk.com" http://127.0.0.1/
echo "=== ICON CHECK ==="
curl -I -H "Host: ghtxdbk.com" http://127.0.0.1/asset/GHTXDBK-Icon.png
