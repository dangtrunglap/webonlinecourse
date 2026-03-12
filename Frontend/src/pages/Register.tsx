import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

export const Register: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Student');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data } = await api.post('/auth/register', { name, email, password, role });
      login({ name: data.name, email: data.email, role: data.role }, data.token);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || err.response?.data?.Message || 'Đăng ký thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container reveal">
      <div className="card form-panel">
        <aside className="form-showcase">
          <h2>Tạo tài khoản mới</h2>
          <p>Bắt đầu hành trình học tập đúng lộ trình, nhận tài liệu và hỗ trợ trực tiếp từ cộng đồng GHTXDBK.</p>
        </aside>

        <section className="form-body">
          <h3 style={{ marginBottom: '1rem' }}>Đăng ký</h3>
          {error && <div className="alert alert-error">{error}</div>}
          <form onSubmit={handleSubmit} className="form-grid">
            <div className="field">
              <label>Họ và tên</label>
              <input type="text" required value={name} onChange={(e) => setName(e.target.value)} placeholder="Tên của bạn" />
            </div>
            <div className="field">
              <label>Email</label>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@example.com" />
            </div>
            <div className="field">
              <label>Mật khẩu</label>
              <input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Tối thiểu 6 ký tự" />
            </div>
            <div className="field">
              <label>Vai trò</label>
              <select value={role} onChange={(e) => setRole(e.target.value)}>
                <option value="Student">Học viên</option>
                <option value="Instructor">Giảng viên</option>
              </select>
            </div>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Đang tạo tài khoản...' : 'Đăng ký'}
            </button>
          </form>
          <p className="muted" style={{ marginTop: '1rem' }}>
            Đã có tài khoản? <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 600 }}>Đăng nhập</Link>
          </p>
        </section>
      </div>
    </div>
  );
};
