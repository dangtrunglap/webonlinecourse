import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { PrivacyPolicyModal } from '../components/PrivacyPolicyModal';

export const Register: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [consentAccepted, setConsentAccepted] = useState(false);
  const [isPolicyModalOpen, setIsPolicyModalOpen] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 8) {
      setError('Mật khẩu phải có ít nhất 8 ký tự.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Xác nhận mật khẩu không khớp.');
      return;
    }

    if (!consentAccepted) {
      setError('Bạn cần đồng ý với Điều khoản dịch vụ và Chính sách bảo vệ dữ liệu cá nhân (NĐ 13/2023/NĐ-CP).');
      return;
    }

    setLoading(true);

    try {
      const { data } = await api.post('/auth/register', {
        name: name.trim(),
        email: email.trim(),
        password,
        role: 'Student',
        consentGiven: true,
        consentVersion: '1.0',
        consentTimestamp: new Date().toISOString(),
      });

      login({ id: data.id, name: data.name, email: data.email, role: data.role }, data.token);
      navigate('/');
    } catch (err: any) {
      if (!err.response) {
        setError('Không kết nối được API backend. Hãy kiểm tra dịch vụ backend có đang chạy không.');
      } else {
        setError(err.response?.data?.message || err.response?.data?.Message || err.message || 'Đăng ký thất bại');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container reveal">
      <div className="card form-panel">
        <aside className="form-showcase">
          <h2>Tạo tài khoản mới</h2>
          <p>Bắt đầu hành trình học tập đúng lộ trình và nhận hỗ trợ trực tiếp từ cộng đồng GHTXDBK.</p>
          <div
            style={{
              marginTop: '2rem',
              padding: '1rem',
              borderRadius: '10px',
              background: 'rgba(255, 255, 255, 0.12)',
              backdropFilter: 'blur(8px)',
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.6rem',
            }}
          >
            <ShieldCheck size={22} style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <strong>Bảo vệ dữ liệu cá nhân:</strong> Thông tin của bạn được lưu trữ và bảo vệ nghiêm ngặt tại hạ tầng máy chủ Việt Nam theo Nghị định 13/2023/NĐ-CP.
            </div>
          </div>
        </aside>

        <section className="form-body">
          <h3 style={{ marginBottom: '1rem' }}>Đăng ký tài khoản</h3>
          {error && <div className="alert alert-error">{error}</div>}
          <form onSubmit={handleSubmit} className="form-grid">
            <div className="field">
              <label>Họ và tên</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ví dụ: Nguyễn Văn A"
              />
            </div>
            <div className="field">
              <label>Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
              />
            </div>
            <div className="field">
              <label>Mật khẩu</label>
              <input
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Tối thiểu 8 ký tự"
              />
            </div>
            <div className="field">
              <label>Xác nhận mật khẩu</label>
              <input
                type="password"
                required
                minLength={8}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Nhập lại mật khẩu vừa đặt"
              />
            </div>
            <div className="field">
              <label>Vai trò</label>
              <input type="text" value="Học viên (Student)" disabled />
            </div>

            {/* Checkbox Nghị định 13/2023/NĐ-CP */}
            <div className="field" style={{ marginTop: '0.25rem' }}>
              <label
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.65rem',
                  cursor: 'pointer',
                  fontWeight: 400,
                  fontSize: '0.88rem',
                  lineHeight: 1.45,
                }}
              >
                <input
                  type="checkbox"
                  required
                  checked={consentAccepted}
                  onChange={(e) => setConsentAccepted(e.target.checked)}
                  style={{
                    marginTop: '0.15rem',
                    width: '18px',
                    height: '18px',
                    accentColor: 'var(--primary)',
                    cursor: 'pointer',
                    flexShrink: 0,
                  }}
                />
                <span>
                  Tôi đồng ý với{' '}
                  <button
                    type="button"
                    onClick={() => setIsPolicyModalOpen(true)}
                    style={{
                      background: 'none',
                      border: 'none',
                      padding: 0,
                      color: 'var(--primary)',
                      fontWeight: 600,
                      cursor: 'pointer',
                      textDecoration: 'underline',
                    }}
                  >
                    Điều khoản & Chính sách bảo vệ dữ liệu cá nhân
                  </button>{' '}
                  (NĐ 13/2023/NĐ-CP)
                </span>
              </label>
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Đang tạo tài khoản...' : 'Tạo tài khoản'}
            </button>
          </form>

          <p className="muted" style={{ marginTop: '1rem', textAlign: 'center' }}>
            Đã có tài khoản?{' '}
            <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 600 }}>
              Đăng nhập ngay
            </Link>
          </p>
        </section>
      </div>

      {/* Modal Chính sách bảo vệ dữ liệu & Điều khoản */}
      <PrivacyPolicyModal
        isOpen={isPolicyModalOpen}
        onClose={() => setIsPolicyModalOpen(false)}
        onAccept={() => setConsentAccepted(true)}
        showAcceptButton={!consentAccepted}
      />
    </div>
  );
};
