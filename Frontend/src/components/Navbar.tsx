import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, LayoutDashboard, LogOut, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="container nav-inner">
        <Link to="/" className="brand">
          <span className="brand-badge">G</span>
          <span>GHTXDBK</span>
        </Link>

        <div className="nav-links">
          <Link to="/" className="nav-link">Khóa học</Link>
          {isAuthenticated && user?.role === 'Student' && <Link to="/my-courses" className="nav-link">Khóa của tôi</Link>}
          {isAuthenticated && (user?.role === 'Instructor' || user?.role === 'Admin') && (
            <Link to="/admin/courses" className="nav-link">Bảng điều khiển</Link>
          )}
        </div>

        <div className="nav-actions">
          {!isAuthenticated ? (
            <>
              <Link to="/login" className="btn btn-secondary">Đăng nhập</Link>
              <Link to="/register" className="btn btn-primary">Đăng ký</Link>
            </>
          ) : (
            <>
              <span className="nav-link" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                <User size={16} /> {user?.name}
              </span>
              {(user?.role === 'Instructor' || user?.role === 'Admin') && (
                <Link to="/admin/courses" className="btn btn-secondary">
                  <LayoutDashboard size={16} /> Quản lý
                </Link>
              )}
              <button type="button" onClick={handleLogout} className="btn btn-secondary">
                <LogOut size={16} /> Đăng xuất
              </button>
            </>
          )}
          <BookOpen size={18} color="var(--primary)" />
        </div>
      </div>
    </nav>
  );
};
