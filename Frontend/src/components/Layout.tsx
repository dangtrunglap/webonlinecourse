import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';

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
              <p>Góc Học Tập Xây Dựng Bách Khoa.</p>
            </div>
            <div>
              <h5>Khóa học</h5>
              <p>Revit</p>
              <p>ETABS</p>
              <p>Đồ án</p>
            </div>
            <div>
              <h5>Hỗ trợ</h5>
              <p>Tư vấn học tập</p>
              <p>Tài liệu chuyên sâu</p>
              <p>Cộng đồng sinh viên</p>
            </div>
            <div>
              <h5>Kết nối</h5>
              <a href="https://www.facebook.com/civil.engineer.bk/" target="_blank" rel="noreferrer">Facebook</a>
            </div>
          </div>
          <small>&copy; 2026 GHTXDBK. All rights reserved.</small>
        </div>
      </footer>
    </div>
  );
};
