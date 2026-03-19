import React from 'react';
import { Link, Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { FACEBOOK_URL } from '../constants/site';

export const Layout: React.FC = () => {
  return (
    <div className="page-shell">
      <Navbar />
      <main className="page-main">
        <Outlet />
      </main>
      <footer className="footer">
        <div className="container">
          <div className="footer-grid">
            <div>
              <h4>GHTXDBK</h4>
              <p>Nền tảng khóa học, tài liệu, blog và công cụ cho sinh viên xây dựng.</p>
            </div>
            <div>
              <h5>Điều hướng</h5>
              <Link to="/about">Giới thiệu</Link>
              <Link to="/contact">Liên hệ</Link>
              <Link to="/faq">FAQ</Link>
            </div>
            <div>
              <h5>Chủ đề</h5>
              <p>Revit</p>
              <p>ETABS</p>
              <p>Đồ án và TCVN</p>
            </div>
            <div>
              <h5>Chính sách</h5>
              <Link to="/policies">Chính sách và điều khoản</Link>
              <a href={FACEBOOK_URL} target="_blank" rel="noreferrer">Facebook</a>
            </div>
          </div>
          <small>&copy; 2026 GHTXDBK. All rights reserved.</small>
        </div>
      </footer>
      <div className="mobile-sticky-cta">
        <Link to="/" className="btn btn-secondary">Xem khóa học</Link>
        <a href={FACEBOOK_URL} className="btn btn-primary" target="_blank" rel="noreferrer">Nhận tư vấn</a>
      </div>
    </div>
  );
};
