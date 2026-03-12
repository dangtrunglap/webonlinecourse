import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data } = await api.post('/auth/login', { email, password });
      login({ name: data.name, email: data.email, role: data.role }, data.token);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || err.response?.data?.Message || 'Đăng nhập thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container reveal">
      <div className="card form-panel">
        <aside className="form-showcase">
          <h2>Chào mừng bạn quay lại</h2>
          <p>
            Đăng nhập để tiếp tục lộ trình học tập của bạn. Theo dõi khóa học, tiến độ và cập nhật nội dung mới nhất.
          </p>
        </aside>

        <section className="form-body">
          <h3 style={{ marginBottom: '1rem' }}>Đăng nhập</h3>
          {error && <div className="alert alert-error">{error}</div>}
          <form onSubmit={handleSubmit} className="form-grid">
            <div className="field">
              <label>Email</label>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@example.com" />
            </div>
            <div className="field">
              <label>Mật khẩu</label>
              <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Nhập mật khẩu" />
            </div>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </button>
          </form>
          <p className="muted" style={{ marginTop: '1rem' }}>
            Chưa có tài khoản? <Link to="/register" style={{ color: 'var(--primary)', fontWeight: 600 }}>Tạo tài khoản</Link>
          </p>
        </section>
      </div>
    </div>
  );
};
