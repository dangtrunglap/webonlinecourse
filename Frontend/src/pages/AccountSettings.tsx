import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Laptop,
  ShieldCheck,
  Download,
  Trash2,
  RefreshCw,
  AlertTriangle,
  ExternalLink,
  ShieldAlert,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { PrivacyPolicyModal } from '../components/PrivacyPolicyModal';

interface AccountProfile {
  id: string;
  email: string;
  name: string;
  role: string;
  plan: string;
  maxDevices: number;
  isActive: boolean;
  consentGiven: boolean;
  consentVersion: string;
  consentTimestamp: string | null;
  created?: string;
}

interface DeviceItem {
  id: string;
  machineName: string;
  lastSeenAt: string | null;
  isBlocked: boolean;
}

export const AccountSettings: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState<AccountProfile | null>(null);
  const [devices, setDevices] = useState<DeviceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshingDevices, setRefreshingDevices] = useState(false);
  const [activeTab, setActiveTab] = useState<'devices' | 'privacy'>('devices');

  // Modal Policy
  const [isPolicyModalOpen, setIsPolicyModalOpen] = useState(false);

  // Unlink Device Confirmation
  const [deviceToUnlink, setDeviceToUnlink] = useState<DeviceItem | null>(null);
  const [unlinking, setUnlinking] = useState(false);

  // Account Deletion
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteError, setDeleteError] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);

  // Notifications
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    void loadAccountData();
  }, []);

  const loadAccountData = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const [profileRes, devicesRes] = await Promise.all([
        api.get('/account/profile'),
        api.get('/account/devices'),
      ]);
      setProfile(profileRes.data);
      setDevices(devicesRes.data ?? []);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.response?.data?.message || 'Không thể tải thông tin tài khoản.');
    } finally {
      setLoading(false);
    }
  };

  const handleRefreshDevices = async () => {
    setRefreshingDevices(true);
    try {
      const { data } = await api.get('/account/devices');
      setDevices(data ?? []);
      setSuccessMsg('Đã làm mới danh sách thiết bị.');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err: any) {
      setErrorMsg('Không thể làm mới danh sách thiết bị.');
    } finally {
      setRefreshingDevices(false);
    }
  };

  const handleUnlinkDevice = async () => {
    if (!deviceToUnlink) return;
    setUnlinking(true);
    setErrorMsg('');
    try {
      await api.delete(`/account/devices/${deviceToUnlink.id}`);
      setSuccessMsg(`Đã hủy liên kết thiết bị "${deviceToUnlink.machineName}" thành công.`);
      setDeviceToUnlink(null);
      await handleRefreshDevices();
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Không thể hủy liên kết thiết bị.');
    } finally {
      setUnlinking(false);
    }
  };

  const handleExportData = async () => {
    try {
      const { data } = await api.get('/account/export');
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `NEXT_Personal_Data_${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      setSuccessMsg('Dữ liệu cá nhân đã được xuất thành công dưới dạng file JSON.');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err: any) {
      setErrorMsg('Không thể xuất dữ liệu cá nhân.');
    }
  };

  const handleDeleteAccount = async () => {
    if (!deletePassword) {
      setDeleteError('Vui lòng nhập mật khẩu tài khoản để xác nhận.');
      return;
    }

    setDeleting(true);
    setDeleteError('');
    try {
      await api.post('/account/delete', { password: deletePassword });
      setShowDeleteConfirmModal(false);
      logout();
      alert('Tài khoản và toàn bộ dữ liệu cá nhân đã được xóa vĩnh viễn theo Nghị định 13/2023/NĐ-CP.');
      navigate('/login');
    } catch (err: any) {
      setDeleteError(err.response?.data?.message || 'Không thể xóa tài khoản. Vui lòng kiểm tra lại mật khẩu.');
    } finally {
      setDeleting(false);
    }
  };

  const formatDateTime = (val?: string | null) => {
    if (!val) return 'Chưa rõ';
    try {
      return new Date(val).toLocaleString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return val;
    }
  };

  return (
    <div className="container reveal" style={{ maxWidth: '1000px', margin: '0 auto', paddingBottom: '4rem' }}>
      <section className="hero" style={{ padding: '2.5rem 1.5rem', marginBottom: '1.5rem' }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: 'rgba(30, 58, 138, 0.08)',
            color: 'var(--primary)',
            padding: '0.35rem 0.9rem',
            borderRadius: '999px',
            fontSize: '0.84rem',
            fontWeight: 700,
            marginBottom: '0.75rem',
          }}
        >
          <ShieldCheck size={16} /> Tuân thủ Nghị định 13/2023/NĐ-CP
        </div>
        <h1 className="hero-title" style={{ fontSize: 'clamp(1.8rem, 4vw, 2.5rem)', marginBottom: '0.6rem' }}>
          Quản lý Tài khoản & Quyền Dữ liệu
        </h1>
        <p className="hero-subtitle" style={{ fontSize: '1rem', maxWidth: '680px' }}>
          Quản lý thiết bị liên kết bản quyền phần mềm Next Structural và thực thi các quyền của Chủ thể dữ liệu theo Nghị định 13/2023/NĐ-CP.
        </p>

        {/* Tab switchers */}
        <div style={{ display: 'inline-flex', background: '#e2e8f0', borderRadius: '12px', padding: '4px' }}>
          <button
            type="button"
            onClick={() => setActiveTab('devices')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.55rem 1.25rem',
              borderRadius: '9px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: activeTab === 'devices' ? 700 : 500,
              background: activeTab === 'devices' ? '#ffffff' : 'transparent',
              color: activeTab === 'devices' ? 'var(--primary)' : '#64748b',
              boxShadow: activeTab === 'devices' ? 'var(--shadow-sm)' : 'none',
              transition: 'all 0.2s ease',
            }}
          >
            <Laptop size={16} /> Thiết bị đã liên kết ({devices.length}/{profile?.maxDevices ?? 1})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('privacy')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.55rem 1.25rem',
              borderRadius: '9px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: activeTab === 'privacy' ? 700 : 500,
              background: activeTab === 'privacy' ? '#ffffff' : 'transparent',
              color: activeTab === 'privacy' ? 'var(--primary)' : '#64748b',
              boxShadow: activeTab === 'privacy' ? 'var(--shadow-sm)' : 'none',
              transition: 'all 0.2s ease',
            }}
          >
            <ShieldCheck size={16} /> Quyền riêng tư & Xóa tài khoản
          </button>
        </div>
      </section>

      {/* Notifications */}
      {successMsg && <div className="alert alert-success" style={{ marginBottom: '1.25rem' }}>{successMsg}</div>}
      {errorMsg && <div className="alert alert-error" style={{ marginBottom: '1.25rem' }}>{errorMsg}</div>}

      {/* Account Summary Banner */}
      <div
        className="card"
        style={{
          padding: '1.2rem 1.5rem',
          marginBottom: '1.5rem',
          background: 'linear-gradient(135deg, #f8fafc, #ffffff)',
          borderLeft: '4px solid var(--primary)',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
        }}
      >
        <div>
          <div style={{ fontSize: '0.9rem', color: '#64748b' }}>Tài khoản đang đăng nhập:</div>
          <div style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--primary)' }}>
            {profile?.name || user?.name} ({profile?.email || user?.email})
          </div>
          <div style={{ display: 'flex', gap: '1rem', marginTop: '0.35rem', fontSize: '0.85rem', color: '#475569' }}>
            <span>
              Gói bản quyền: <strong>{profile?.plan?.toUpperCase() || 'FREE'}</strong>
            </span>
            <span>•</span>
            <span>
              Thiết bị tối đa: <strong>{profile?.maxDevices ?? 1}</strong>
            </span>
            <span>•</span>
            <span>
              Chính sách NĐ 13:{' '}
              {profile?.consentGiven ? (
                <strong style={{ color: '#16a34a' }}>Đã đồng ý (v{profile?.consentVersion || '1.0'})</strong>
              ) : (
                <strong style={{ color: '#f59e0b' }}>Chưa cập nhật</strong>
              )}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={loadAccountData}
          disabled={loading}
          className="btn btn-secondary"
          style={{ fontSize: '0.86rem', padding: '0.45rem 0.85rem' }}
        >
          <RefreshCw size={14} className={loading ? 'spin' : ''} /> Tải lại dữ liệu
        </button>
      </div>

      {/* Tab 1: Device Management */}
      {activeTab === 'devices' && (
        <div className="card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.2rem' }}>
            <div>
              <h3 style={{ fontSize: '1.15rem', margin: 0, color: 'var(--foreground)' }}>
                Danh sách thiết bị kết nối bản quyền phần mềm
              </h3>
              <p className="muted" style={{ fontSize: '0.86rem', margin: '0.2rem 0 0' }}>
                Đang sử dụng {devices.length} / {profile?.maxDevices ?? 1} thiết bị cho phép. Bạn có thể hủy liên kết để giải phóng slot máy.
              </p>
            </div>
            <button
              type="button"
              onClick={handleRefreshDevices}
              disabled={refreshingDevices}
              className="btn btn-secondary"
              style={{ fontSize: '0.85rem', padding: '0.45rem 0.8rem' }}
            >
              <RefreshCw size={14} className={refreshingDevices ? 'spin' : ''} /> Làm mới
            </button>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '2.5rem', color: '#64748b' }}>Đang tải danh sách thiết bị...</div>
          ) : devices.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                padding: '3rem 1.5rem',
                background: '#f8fafc',
                borderRadius: '10px',
                border: '1px dashed var(--border)',
              }}
            >
              <Laptop size={36} style={{ color: '#94a3b8', marginBottom: '0.5rem' }} />
              <h4 style={{ margin: 0, color: '#475569' }}>Chưa có thiết bị nào được liên kết</h4>
              <p className="muted" style={{ fontSize: '0.86rem', marginTop: '0.3rem' }}>
                Khi bạn đăng nhập trên phần mềm kỹ thuật kết cấu Next Structural, thông số máy tính sẽ được tự động kích hoạt tại đây.
              </p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{ background: '#f1f5f9', borderBottom: '1px solid var(--border)' }}>
                    <th style={{ padding: '0.75rem 1rem' }}>Tên thiết bị (Machine Name)</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Lần truy cập cuối</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Trạng thái</th>
                    <th style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {devices.map((device) => (
                    <tr key={device.id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '0.85rem 1rem', fontWeight: 600, color: '#1e293b' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <Laptop size={16} style={{ color: 'var(--primary)' }} />
                          {device.machineName}
                        </div>
                      </td>
                      <td style={{ padding: '0.85rem 1rem', color: '#64748b' }}>
                        {formatDateTime(device.lastSeenAt)}
                      </td>
                      <td style={{ padding: '0.85rem 1rem' }}>
                        {device.isBlocked ? (
                          <span
                            style={{
                              background: '#fee2e2',
                              color: '#b91c1c',
                              padding: '0.2rem 0.55rem',
                              borderRadius: '6px',
                              fontSize: '0.8rem',
                              fontWeight: 600,
                            }}
                          >
                            Đã khóa
                          </span>
                        ) : (
                          <span
                            style={{
                              background: '#dcfce7',
                              color: '#15803d',
                              padding: '0.2rem 0.55rem',
                              borderRadius: '6px',
                              fontSize: '0.8rem',
                              fontWeight: 600,
                            }}
                          >
                            Đang hoạt động
                          </span>
                        )}
                      </td>
                      <td style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>
                        <button
                          type="button"
                          onClick={() => setDeviceToUnlink(device)}
                          className="btn"
                          style={{
                            background: '#fff1f2',
                            color: '#e11d48',
                            border: '1px solid #fecdd3',
                            padding: '0.35rem 0.75rem',
                            fontSize: '0.82rem',
                          }}
                        >
                          Hủy liên kết
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Privacy Rights & Account Deletion */}
      {activeTab === 'privacy' && (
        <div style={{ display: 'grid', gap: '1.25rem' }}>
          {/* Card 1: View Privacy Policy */}
          <div
            className="card"
            style={{
              padding: '1.3rem 1.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '1rem',
              flexWrap: 'wrap',
            }}
          >
            <div>
              <h3 style={{ fontSize: '1.05rem', margin: 0, color: 'var(--foreground)' }}>
                Chính sách Bảo vệ Dữ liệu Cá nhân & Điều khoản
              </h3>
              <p className="muted" style={{ fontSize: '0.86rem', margin: '0.25rem 0 0' }}>
                Xem chi tiết các cam kết bảo vệ dữ liệu, mục đích xử lý và quyền của bạn theo Nghị định 13/2023/NĐ-CP.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsPolicyModalOpen(true)}
              className="btn btn-secondary"
              style={{ fontSize: '0.88rem' }}
            >
              <ExternalLink size={15} /> Xem Chính sách
            </button>
          </div>

          {/* Card 2: Right to Data Portability */}
          <div
            className="card"
            style={{
              padding: '1.3rem 1.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '1rem',
              flexWrap: 'wrap',
            }}
          >
            <div>
              <h3 style={{ fontSize: '1.05rem', margin: 0, color: 'var(--foreground)' }}>
                Quyền Cung cấp Dữ liệu (Right to Data Portability)
              </h3>
              <p className="muted" style={{ fontSize: '0.86rem', margin: '0.25rem 0 0' }}>
                Tải về toàn bộ bản sao lưu trữ dữ liệu tài khoản, khóa học và danh sách thiết bị phần cứng của bạn dưới dạng file .JSON chuẩn.
              </p>
            </div>
            <button
              type="button"
              onClick={handleExportData}
              className="btn btn-secondary"
              style={{ fontSize: '0.88rem' }}
            >
              <Download size={15} /> Xuất Dữ liệu (.JSON)
            </button>
          </div>

          {/* Card 3: Right to Erasure (Delete Account Permanently) */}
          <div
            className="card"
            style={{
              padding: '1.5rem',
              background: '#fff5f5',
              border: '1px solid #fecaca',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
              <ShieldAlert size={26} style={{ color: '#dc2626', flexShrink: 0, marginTop: '2px' }} />
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: '1.15rem', margin: 0, color: '#991b1b', fontWeight: 700 }}>
                  Xóa Tài khoản & Dữ liệu Vĩnh viễn (Right to Erasure)
                </h3>
                <p style={{ fontSize: '0.88rem', color: '#7f1d1d', lineHeight: 1.6, margin: '0.5rem 0 1rem' }}>
                  <strong>CẢNH BÁO THEO NGHỊ ĐỊNH 13/2023/NĐ-CP:</strong> Khi bạn yêu cầu xóa tài khoản, toàn bộ thông tin cá nhân (Email, Họ và tên), thông tin định danh phần cứng máy tính (Hardware Fingerprint WMI), quyền truy cập khóa học và lịch sử bản quyền sẽ bị xóa vĩnh viễn khỏi toàn bộ hệ thống máy chủ. Hành động này <strong>KHÔNG THỂ HOÀN TÁC</strong>!
                </p>

                <button
                  type="button"
                  onClick={() => {
                    setDeletePassword('');
                    setDeleteError('');
                    setShowDeleteConfirmModal(true);
                  }}
                  className="btn"
                  style={{
                    background: '#dc2626',
                    color: '#ffffff',
                    fontWeight: 700,
                    padding: '0.65rem 1.25rem',
                  }}
                >
                  <Trash2 size={16} /> Yêu cầu Xóa Tài khoản & Dữ liệu Vĩnh viễn
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Unlinking Device */}
      {deviceToUnlink && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
          }}
          onClick={() => setDeviceToUnlink(null)}
        >
          <div
            className="card"
            style={{ maxWidth: '480px', width: '100%', padding: '1.5rem', background: '#ffffff', borderRadius: '14px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ margin: 0, color: '#0f172a', fontSize: '1.15rem' }}>Xác nhận hủy liên kết thiết bị</h3>
            <p className="muted" style={{ fontSize: '0.9rem', lineHeight: 1.6, margin: '0.8rem 0 1.2rem' }}>
              Bạn có chắc chắn muốn hủy liên kết thiết bị <strong>{deviceToUnlink.machineName}</strong>?
              <br />
              Sau khi hủy, máy tính này sẽ không còn quyền sử dụng phần mềm và cần kích hoạt lại từ đầu.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button type="button" onClick={() => setDeviceToUnlink(null)} className="btn btn-secondary">
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleUnlinkDevice}
                disabled={unlinking}
                className="btn"
                style={{ background: '#e11d48', color: '#fff' }}
              >
                {unlinking ? 'Đang hủy...' : 'Xác nhận Hủy liên kết'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Permanent Account Deletion */}
      {showDeleteConfirmModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            backgroundColor: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(5px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
          }}
          onClick={() => setShowDeleteConfirmModal(false)}
        >
          <div
            className="card"
            style={{
              maxWidth: '520px',
              width: '100%',
              padding: '1.8rem',
              background: '#ffffff',
              borderRadius: '16px',
              border: '2px solid #ef4444',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#dc2626', marginBottom: '0.8rem' }}>
              <AlertTriangle size={26} />
              <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#991b1b' }}>
                Xác nhận Xóa Vĩnh viễn Tài khoản
              </h3>
            </div>

            <p style={{ fontSize: '0.88rem', color: '#475569', lineHeight: 1.6 }}>
              Theo Nghị định 13/2023/NĐ-CP, việc xóa tài khoản sẽ hủy bỏ toàn bộ quyền truy cập và dữ liệu cá nhân của bạn vĩnh viễn. Để đảm bảo an toàn, vui lòng <strong>nhập mật khẩu tài khoản hiện tại</strong> của bạn để xác nhận:
            </p>

            {deleteError && (
              <div className="alert alert-error" style={{ margin: '0.8rem 0', fontSize: '0.86rem' }}>
                {deleteError}
              </div>
            )}

            <div className="field" style={{ margin: '1rem 0' }}>
              <label style={{ fontWeight: 600, fontSize: '0.88rem' }}>Mật khẩu xác nhận</label>
              <input
                type="password"
                required
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
                placeholder="Nhập mật khẩu tài khoản hiện tại"
                autoFocus
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.4rem' }}>
              <button
                type="button"
                onClick={() => setShowDeleteConfirmModal(false)}
                className="btn btn-secondary"
                disabled={deleting}
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleDeleteAccount}
                disabled={deleting}
                className="btn"
                style={{ background: '#dc2626', color: '#fff', fontWeight: 700 }}
              >
                {deleting ? 'Đang thực hiện xóa...' : 'Xóa Vĩnh viễn Tài khoản'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Privacy Policy */}
      <PrivacyPolicyModal isOpen={isPolicyModalOpen} onClose={() => setIsPolicyModalOpen(false)} />
    </div>
  );
};
