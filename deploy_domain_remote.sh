#!/usr/bin/env bash
set -euo pipefail

stamp="$(date +%Y%m%d_%H%M%S)"

mkdir -p /home/adminuser/deploy_domain/backend_stage /home/adminuser/deploy_domain/frontend_stage
rm -rf /home/adminuser/deploy_domain/backend_stage/* /home/adminuser/deploy_domain/frontend_stage/*

tar -xzf /home/adminuser/backend_domain_publish.tar.gz -C /home/adminuser/deploy_domain/backend_stage
tar -xzf /home/adminuser/frontend_domain_dist.tar.gz -C /home/adminuser/deploy_domain/frontend_stage

echo adminuser | sudo -S mkdir -p "/var/www/onlinecourseapi_backup_${stamp}" "/var/www/onlinecourse_frontend_backup_${stamp}"
echo adminuser | sudo -S rsync -a /var/www/onlinecourseapi/ "/var/www/onlinecourseapi_backup_${stamp}/"
echo adminuser | sudo -S rsync -a /var/www/onlinecourse_frontend/ "/var/www/onlinecourse_frontend_backup_${stamp}/"

echo adminuser | sudo -S rsync -a --delete \
  --exclude App_Data \
  --exclude courses.db \
  --exclude courses.db-shm \
  --exclude courses.db-wal \
  --exclude appsettings.json \
  --exclude appsettings.Development.json \
  --exclude wwwroot \
  /home/adminuser/deploy_domain/backend_stage/ /var/www/onlinecourseapi/

echo adminuser | sudo -S rsync -a --delete /home/adminuser/deploy_domain/frontend_stage/ /var/www/onlinecourse_frontend/

cat <<'EOF' >/home/adminuser/ghtxdbk.com.nginx
server {
    listen 80;
    listen [::]:80;
    server_name ghtxdbk.com www.ghtxdbk.com;

    root /var/www/onlinecourse_frontend;
    index index.html;

    location /api/ {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /thumbnails/ {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /uploads/ {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location / {
        try_files $uri $uri/ /index.html;
    }
}
EOF

echo adminuser | sudo -S mv /home/adminuser/ghtxdbk.com.nginx /etc/nginx/sites-available/ghtxdbk.com
echo adminuser | sudo -S ln -sfn /etc/nginx/sites-available/ghtxdbk.com /etc/nginx/sites-enabled/ghtxdbk.com

echo adminuser | sudo -S nginx -t
echo adminuser | sudo -S systemctl restart onlinecourseapi
echo adminuser | sudo -S systemctl reload nginx

echo "=== HTTP CHECK ==="
curl -I -H "Host: ghtxdbk.com" http://127.0.0.1/
echo "=== API CHECK ==="
curl -s -H "Host: ghtxdbk.com" "http://127.0.0.1/api/courses?page=1&pageSize=1" | head -c 500
echo
