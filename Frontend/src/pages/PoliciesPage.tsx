import React from 'react';
import { FileCheck2, Shield, Wallet } from 'lucide-react';
import { Seo } from '../components/Seo';
import { SITE_NAME, SITE_URL } from '../constants/site';

const sections = [
  {
    icon: FileCheck2,
    title: 'Điều khoản sử dụng',
    content:
      'Người dùng cần sử dụng tài khoản đúng mục đích học tập, không chia sẻ trái phép nội dung, file tài liệu hoặc quyền truy cập khóa học cho bên thứ ba.',
  },
  {
    icon: Wallet,
    title: 'Đăng ký và thanh toán',
    content:
      'Một số khóa học hiện được xác nhận theo hình thức thanh toán thủ công qua kênh tư vấn của GHTXDBK. Quyền truy cập được cấp sau khi đội ngũ xác minh thông tin đăng ký.',
  },
  {
    icon: Shield,
    title: 'Nội dung và quyền riêng tư',
    content:
      'Thông tin tài khoản và hành vi sử dụng trên website được dùng để vận hành nền tảng, hỗ trợ học viên và cải thiện trải nghiệm học tập. Nội dung kỹ thuật có thể được cập nhật khi có thay đổi về tài liệu hoặc phạm vi triển khai.',
  },
];

export const PoliciesPage: React.FC = () => {
  return (
    <div className="container reveal">
      <Seo
        title={`Chính sách và điều khoản | ${SITE_NAME}`}
        description="Tổng hợp điều khoản sử dụng, nguyên tắc thanh toán, quyền truy cập nội dung và định hướng bảo mật thông tin trên GHTXDBK."
        path="/policies"
        keywords={['chinh sach GHTXDBK', 'dieu khoan khoa hoc truc tuyen', 'thanh toan khoa hoc']}
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'WebPage',
          name: `Chính sách và điều khoản ${SITE_NAME}`,
          url: `${SITE_URL}/policies`,
        }}
      />

      <section className="hero">
        <h1 className="hero-title">Chính sách và điều khoản</h1>
        <p className="hero-subtitle">
          Đây là bộ khung chính sách cơ bản để người dùng hiểu cách GHTXDBK vận hành nền tảng, xác nhận truy cập và quản lý nội dung học tập.
        </p>
      </section>

      <section className="section">
        <div className="grid grid-3">
          {sections.map((section) => {
            const Icon = section.icon;
            return (
              <article key={section.title} className="card" style={{ padding: '1.2rem', display: 'grid', gap: '0.75rem' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)', fontWeight: 700 }}>
                  <Icon size={18} /> {section.title}
                </div>
                <p className="muted">{section.content}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="section">
        <article className="card" style={{ padding: '1.2rem', display: 'grid', gap: '0.75rem' }}>
          <h2 style={{ fontSize: '1.2rem' }}>Lưu ý triển khai</h2>
          <p className="muted">
            Đây là phiên bản chính sách nền để tăng độ rõ ràng cho website ở giai đoạn hiện tại. Nếu sau này GHTXDBK triển khai hoàn tiền, học thử,
            điều kiện bảo hành nội dung hoặc email hỗ trợ riêng, trang này nên được cập nhật chi tiết hơn.
          </p>
        </article>
      </section>
    </div>
  );
};
