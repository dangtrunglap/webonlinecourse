#!/usr/bin/env bash
set -euo pipefail

stamp="$(date +%Y%m%d_%H%M%S)"
backup_root="/home/adminuser/deploy_backups/$stamp"
publish_dir="/home/adminuser/deploy_build/backend_publish"
source_dir="/home/adminuser/webonlinecourse/Backend"

mkdir -p "$backup_root" "$publish_dir"

echo adminuser | sudo -S rsync -a /var/www/onlinecourseapi/ "$backup_root/onlinecourseapi/"
echo adminuser | sudo -S cp /etc/nginx/sites-available/ghtxdbk.com "$backup_root/ghtxdbk.com.nginx"

dotnet publish "$source_dir/OnlineCoursePlatform.API.csproj" -c Release -o "$publish_dir"

echo adminuser | sudo -S rsync -a --delete \
  --exclude App_Data \
  --exclude courses.db \
  --exclude courses.db-shm \
  --exclude courses.db-wal \
  --exclude appsettings.json \
  --exclude appsettings.Development.json \
  --exclude wwwroot \
  "$publish_dir/" /var/www/onlinecourseapi/

if ! echo adminuser | sudo -S grep -q "client_max_body_size 250M;" /etc/nginx/sites-available/ghtxdbk.com; then
  echo adminuser | sudo -S sed -i '/server_name ghtxdbk.com www.ghtxdbk.com;/a\    client_max_body_size 250M;' /etc/nginx/sites-available/ghtxdbk.com
fi

echo adminuser | sudo -S nginx -t
echo adminuser | sudo -S systemctl restart onlinecourseapi
echo adminuser | sudo -S systemctl reload nginx

systemctl status onlinecourseapi --no-pager -l | head -n 20
curl -I -H "Host: ghtxdbk.com" http://127.0.0.1/api/tools
echo
curl -s -o /dev/null -w "%{http_code}\n" -H "Host: ghtxdbk.com" http://127.0.0.1/api/tools
