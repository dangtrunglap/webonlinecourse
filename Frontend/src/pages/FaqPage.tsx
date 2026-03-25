import React from 'react';
import { Seo } from '../components/Seo';
import { SITE_NAME, SITE_URL } from '../constants/site';

const faqs = [
  {
    question: 'GHTXDBK phù hợp với ai?',
    answer: 'Phù hợp với sinh viên xây dựng, người đang làm đồ án, người mới học Revit hoặc ETABS và kỹ sư trẻ muốn có thêm tài liệu thực hành.',
  },
  {
    question: 'Website đang cung cấp những gì?',
    answer: 'Hiện tại nền tảng có khóa học, blog chuyên môn, thư viện tài liệu và khu vực công cụ hoặc gói hỗ trợ học tập.',
  },
  {
    question: 'Đăng ký khóa học như thế nào?',
    answer: 'Bạn có thể xem trang chi tiết khóa học rồi liên hệ fanpage Facebook để được hướng dẫn thanh toán và xác nhận quyền truy cập.',
  },
  {
    question: 'Tôi có thể đọc blog hoặc tải tài liệu trước khi mua không?',
    answer: 'Có. Website đã tách riêng blog và thư viện tài liệu để bạn đọc trước nội dung chuyên môn, từ đó đánh giá mức độ phù hợp.',
  },
  {
    question: 'Site có nội dung về Revit, ETABS, TCVN và đồ án không?',
    answer: 'Có. Đây là các nhóm chủ đề cốt lõi mà GHTXDBK đang gom thành cụm nội dung để người học dễ tìm hiểu và để công cụ tìm kiếm hiểu đúng phạm vi website.',
  },
  {
    question: 'Nếu cần tư vấn trước khi chọn khóa thì liên hệ ở đâu?',
    answer: 'Bạn có thể dùng trang Liên hệ hoặc nhắn trực tiếp fanpage Facebook của GHTXDBK.',
  },
];

export const FaqPage: React.FC = () => {
  return (
    <div className="container reveal">
      <Seo
        title={`FAQ | ${SITE_NAME}`}
        description="Giải đáp các câu hỏi thường gặp về khóa học, tài liệu, cách đăng ký và phạm vi nội dung của GHTXDBK."
        path="/faq"
        keywords={['faq GHTXDBK', 'hoi dap khoa hoc xay dung', 'huong dan dang ky khoa hoc']}
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: faqs.map((faq) => ({
            '@type': 'Question',
            name: faq.question,
            acceptedAnswer: {
              '@type': 'Answer',
              text: faq.answer,
            },
          })),
          url: `${SITE_URL}/faq`,
        }}
      />

      <section className="hero">
        <h1 className="hero-title">Câu hỏi thường gặp</h1>
        <p className="hero-subtitle">
          Trang này giúp người học mới hiểu nhanh website đang có gì, hỗ trợ gì và nên bắt đầu từ đâu.
        </p>
      </section>

      <section className="section">
        <div className="grid" style={{ maxWidth: '960px', margin: '0 auto' }}>
          {faqs.map((faq) => (
            <article key={faq.question} className="card" style={{ padding: '1.2rem', display: 'grid', gap: '0.65rem' }}>
              <h2 style={{ fontSize: '1.08rem' }}>{faq.question}</h2>
              <p className="muted">{faq.answer}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
};
