#!/usr/bin/env bash
set -euo pipefail

stamp="$(date +%Y%m%d_%H%M%S)"
echo "=== BẮT ĐẦU DEPLOY GHTXDBK ($stamp) ==="

# 1. Backup hiện tại
echo "--> 1. Sao lưu hệ thống hiện tại..."
mkdir -p "/root/deploy_backups/$stamp"
rsync -a /var/www/onlinecourseapi/ "/root/deploy_backups/$stamp/onlinecourseapi/"
rsync -a /var/www/onlinecourse_frontend/ "/root/deploy_backups/$stamp/onlinecourse_frontend/"
echo "Sao lưu hoàn tất vào /root/deploy_backups/$stamp"

# 2. Giải nén vào staging
echo "--> 2. Giải nén các gói cập nhật..."
mkdir -p /root/deploy_stage/backend /root/deploy_stage/frontend
rm -rf /root/deploy_stage/backend/* /root/deploy_stage/frontend/*

tar -xzf /root/backend_domain_publish.tar.gz -C /root/deploy_stage/backend
tar -xzf /root/frontend_domain_dist.tar.gz -C /root/deploy_stage/frontend
echo "Giải nén hoàn tất."

# 3. Deploy Backend (bảo lưu dữ liệu quan trọng)
echo "--> 3. Cập nhật Backend API..."
rsync -a --delete \
  --exclude App_Data \
  --exclude courses.db \
  --exclude courses.db-shm \
  --exclude courses.db-wal \
  --exclude appsettings.json \
  --exclude appsettings.Development.json \
  --exclude wwwroot \
  /root/deploy_stage/backend/ /var/www/onlinecourseapi/

# 4. Deploy Frontend
echo "--> 4. Cập nhật Frontend..."
rsync -a --delete /root/deploy_stage/frontend/ /var/www/onlinecourse_frontend/

# 5. Phân quyền thư mục
echo "--> 5. Cấu hình quyền thư mục..."
chown -R root:root /var/www/onlinecourse_frontend /var/www/onlinecourseapi
chmod -R 755 /var/www/onlinecourse_frontend /var/www/onlinecourseapi

# 6. Restart dịch vụ
echo "--> 6. Khởi động lại dịch vụ..."
systemctl restart onlinecourseapi
nginx -t
systemctl reload nginx

# 7. Kiểm tra trạng thái
echo "--> 7. Kiểm tra trạng thái dịch vụ..."
sleep 2
systemctl is-active onlinecourseapi
curl -s -o /dev/null -w "Mã phản hồi API: %{http_code}\n" http://127.0.0.1:5000/api/tools
echo "=== DEPLOY HOÀN TẤT THÀNH CÔNG ==="
