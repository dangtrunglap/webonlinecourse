import React from 'react';
import { ArrowRight, Facebook, Mail, MessageCircleMore } from 'lucide-react';
import { Seo } from '../components/Seo';
import { FACEBOOK_URL, SITE_NAME, SITE_URL, defaultOrganizationSchema } from '../constants/site';

const contactSteps = [
  'Xem khóa học hoặc bài viết phù hợp với nhu cầu của bạn.',
  'Nhắn tin qua Facebook để được tư vấn lộ trình và hình thức thanh toán.',
  'Sau khi xác nhận, đội ngũ sẽ hướng dẫn truy cập nội dung phù hợp trên hệ thống.',
];

export const ContactPage: React.FC = () => {
  const onTrack = (location: string) => {
    window.dataLayer?.push({ event: 'contact_facebook_click', location });
    window.gtag?.('event', 'contact_facebook_click', { location });
    window.fbq?.('trackCustom', 'contact_facebook_click', { location });
    window.ttq?.track?.('contact_facebook_click', { location });
  };

  return (
    <div className="container reveal">
      <Seo
        title={`Liên hệ | ${SITE_NAME}`}
        description="Liên hệ GHTXDBK để được tư vấn khóa học, hỗ trợ đăng ký và giải đáp trước khi mua."
        path="/contact"
        keywords={['lien he GHTXDBK', 'tu van khoa hoc xay dung', 'dang ky khoa hoc Revit ETABS']}
        jsonLd={[
          defaultOrganizationSchema,
          {
            '@context': 'https://schema.org',
            '@type': 'ContactPage',
            name: `Liên hệ ${SITE_NAME}`,
            url: `${SITE_URL}/contact`,
            contactPoint: {
              '@type': 'ContactPoint',
              contactType: 'customer support',
              availableLanguage: ['vi'],
              url: FACEBOOK_URL,
            },
          },
        ]}
      />

      <section className="hero">
        <h1 className="hero-title">Liên hệ và tư vấn</h1>
        <p className="hero-subtitle">
          Nếu bạn đang phân vân nên học khóa nào hoặc muốn xác nhận cách đăng ký, đây là trang liên hệ nhanh của GHTXDBK.
        </p>
        <div className="hero-actions">
          <a
            href={FACEBOOK_URL}
            className="btn btn-primary"
            target="_blank"
            rel="noreferrer"
            onClick={() => onTrack('contact_hero')}
          >
            <Facebook size={16} /> Nhắn Facebook
          </a>
          <a href="/register" className="btn btn-secondary">
            Tạo tài khoản <ArrowRight size={16} />
          </a>
        </div>
      </section>

      <section className="section">
        <div className="grid grid-3">
          <article className="card" style={{ padding: '1.2rem', display: 'grid', gap: '0.7rem' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)', fontWeight: 700 }}>
              <MessageCircleMore size={18} /> Kênh phản hồi chính
            </div>
            <p className="muted">Fanpage Facebook hiện là kênh hỗ trợ chính để tư vấn khóa học, xác nhận thanh toán và giải đáp trước khi đăng ký.</p>
            <a
              href={FACEBOOK_URL}
              className="btn btn-primary"
              target="_blank"
              rel="noreferrer"
              onClick={() => onTrack('contact_card')}
            >
              Mở fanpage
            </a>
          </article>

          <article className="card" style={{ padding: '1.2rem', display: 'grid', gap: '0.7rem' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)', fontWeight: 700 }}>
              <Mail size={18} /> Cách gửi yêu cầu
            </div>
            <p className="muted">Khi liên hệ, bạn nên ghi rõ nhu cầu: học phần mềm nào, đang làm đồ án hay mong muốn nhận hỗ trợ theo hướng nào.</p>
            <div className="muted">Ví dụ: “Em cần học ETABS để làm đồ án kết cấu, muốn biết nên bắt đầu từ khóa nào.”</div>
          </article>

          <article className="card" style={{ padding: '1.2rem', display: 'grid', gap: '0.7rem' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)', fontWeight: 700 }}>
              <ArrowRight size={18} /> Điều hướng nhanh
            </div>
            <a href="/" className="btn btn-secondary">Khóa học</a>
            <a href="/blog" className="btn btn-secondary">Bài viết hướng dẫn</a>
          </article>
        </div>
      </section>

      <section className="section">
        <h2 className="section-title">Quy trình tư vấn hiện tại</h2>
        <div className="grid grid-3">
          {contactSteps.map((step, index) => (
            <article key={step} className="card" style={{ padding: '1.2rem', display: 'grid', gap: '0.65rem' }}>
              <strong style={{ color: 'var(--primary)' }}>Bước {index + 1}</strong>
              <p className="muted">{step}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
};
