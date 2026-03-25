#!/usr/bin/env bash
set -euo pipefail

sudo_password='adminuser'
stamp="$(date +%Y%m%d_%H%M%S)"
backup_dir="/var/www/onlinecourse_frontend_backup_${stamp}"
css_file="/var/www/onlinecourse_frontend/assets/index-qQIvNNLY.css"

echo "$sudo_password" | sudo -S mkdir -p "$backup_dir"
echo "$sudo_password" | sudo -S rsync -a /var/www/onlinecourse_frontend/ "$backup_dir/"

echo "$sudo_password" | sudo -S mkdir -p /var/www/onlinecourse_frontend/asset
echo "$sudo_password" | sudo -S cp /home/adminuser/Logo_GHTXDBK.jpg /var/www/onlinecourse_frontend/asset/Logo_GHTXDBK.jpg

if ! grep -q 'codex live ui patch' "$css_file"; then
cat <<'EOF' | sh -c "echo \"$sudo_password\" | sudo -S tee -a $css_file >/dev/null"

/* codex live ui patch */
.brand-badge{width:48px!important;height:48px!important;border-radius:50%!important;background:#fff url('/asset/Logo_GHTXDBK.jpg') center/cover no-repeat!important;border:1px solid rgba(30,58,138,.12)!important;overflow:hidden!important;color:transparent!important;font-size:0!important;line-height:0!important;text-indent:-9999px!important}
.section:has(.topic-grid) .section-title{max-width:860px;margin:0 auto .75rem!important;display:block!important;font-size:0!important;line-height:1!important;text-align:center}
.section:has(.topic-grid) .section-title::after{content:'Góc học tập xây dựng có gì?';display:block;font-size:clamp(1.6rem,4vw,2.3rem);line-height:1.2;color:var(--foreground)}
.section:has(.topic-grid) .section-subtitle{max-width:760px;margin:0 auto 1.5rem!important;font-size:0!important;text-align:center}
.section:has(.topic-grid) .section-subtitle::after{content:'Đây là các chủ đề đang được GHTXDBK tập trung nghiên cứu nhằm đem lại chất lượng tốt nhất cho các bạn';font-size:1rem;line-height:1.6;color:var(--muted-foreground)}
.topic-card{min-height:112px;display:flex;align-items:center;text-align:left;transition:transform .2s ease,box-shadow .2s ease,border-color .2s ease}
.topic-card:hover{transform:translateY(-3px);box-shadow:var(--shadow-md);border-color:#cbdcfb}
.topic-card h3{line-height:1.35}
#course-section .grid.grid-4{grid-template-columns:repeat(2,minmax(0,1fr))!important}
@media (max-width:720px){#course-section .grid.grid-4{grid-template-columns:1fr!important}}
EOF
fi

cat <<'PY' >/home/adminuser/.tmp_patch_html.py
from pathlib import Path

root = Path("/var/www/onlinecourse_frontend")
inline_style = (
    '<style id="codex-live-inline">'
    '.brand-badge{width:48px!important;height:48px!important;border-radius:50%!important;'
    'background:#fff url("/asset/Logo_GHTXDBK.jpg") center/cover no-repeat!important;'
    'border:1px solid rgba(30,58,138,.12)!important;overflow:hidden!important;color:transparent!important;'
    'font-size:0!important;line-height:0!important;text-indent:-9999px!important}'
    '.section:has(.topic-grid) .section-title{max-width:860px;margin:0 auto .75rem!important;display:block!important;'
    'font-size:0!important;line-height:1!important;text-align:center}'
    '.section:has(.topic-grid) .section-title::after{content:"Góc học tập xây dựng có gì?";display:block;'
    'font-size:clamp(1.6rem,4vw,2.3rem);line-height:1.2;color:var(--foreground)}'
    '.section:has(.topic-grid) .section-subtitle{max-width:760px;margin:0 auto 1.5rem!important;font-size:0!important;text-align:center}'
    '.section:has(.topic-grid) .section-subtitle::after{content:"Đây là các chủ đề đang được GHTXDBK tập trung nghiên cứu nhằm đem lại chất lượng tốt nhất cho các bạn";font-size:1rem;line-height:1.6;color:var(--muted-foreground)}'
    '.topic-card{min-height:112px;display:flex;align-items:center;text-align:left;transition:transform .2s ease,box-shadow .2s ease,border-color .2s ease}'
    '.topic-card:hover{transform:translateY(-3px);box-shadow:var(--shadow-md);border-color:#cbdcfb}'
    '.topic-card h3{line-height:1.35}'
    '#course-section .grid.grid-4{grid-template-columns:repeat(2,minmax(0,1fr))!important}'
    '@media (max-width:720px){#course-section .grid.grid-4{grid-template-columns:1fr!important}}'
    '</style>'
)

for path in root.rglob("index.html"):
    text = path.read_text(encoding="utf-8")
    text = text.replace('/assets/index-qQIvNNLY.css', '/assets/index-qQIvNNLY.css?v=20260324c')
    text = text.replace('<link rel="icon" type="image/svg+xml" href="/vite.svg" >', '<link rel="icon" type="image/jpeg" href="/asset/Logo_GHTXDBK.jpg" />\n    <link rel="apple-touch-icon" href="/asset/Logo_GHTXDBK.jpg" />')
    text = text.replace('<link rel="icon" type="image/svg+xml" href="/vite.svg" />', '<link rel="icon" type="image/jpeg" href="/asset/Logo_GHTXDBK.jpg" />\n    <link rel="apple-touch-icon" href="/asset/Logo_GHTXDBK.jpg" />')
    if 'id="codex-live-inline"' not in text and '</head>' in text:
        text = text.replace('</head>', f'{inline_style}</head>')
    path.write_text(text, encoding="utf-8")
PY

python3 /home/adminuser/.tmp_patch_html.py

echo "$sudo_password" | sudo -S test -f /var/www/onlinecourse_frontend/asset/Logo_GHTXDBK.jpg
grep -n 'codex-live-inline' /var/www/onlinecourse_frontend/index.html | head -n 1
grep -n 'Logo_GHTXDBK.jpg' /var/www/onlinecourse_frontend/index.html | head -n 2
