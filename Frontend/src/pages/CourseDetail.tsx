import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { CheckCircle2, FileText, PenSquare, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Seo } from '../components/Seo';
import api from '../services/api';
import { formatVnd } from '../utils/currency';
import { getMediaUrl } from '../utils/media';
import type { BlogPost } from '../types/content';
import { FACEBOOK_URL, SITE_NAME, SITE_URL, defaultOrganizationSchema } from '../constants/site';
import { extractPlainTextFromBlogHtml, sanitizeBlogHtml } from '../utils/blogHtml';

interface Course {
  id: string;
  title: string;
  description: string;
  price: number;
  thumbnailUrl: string | null;
  instructorName: string;
}

const defaultFaqs = [
  {
    question: 'Khóa học này phù hợp với ai?',
    answer: 'Phù hợp với người đang cần một lộ trình học có ví dụ thực hành và định hướng rõ cách áp dụng vào môn học hoặc đồ án.',
  },
  {
    question: 'Đăng ký như thế nào?',
    answer: 'Bạn có thể nhắn fanpage Facebook để được hướng dẫn thanh toán thủ công, sau đó quản trị viên sẽ xác nhận và cấp quyền truy cập.',
  },
  {
    question: 'Có hỗ trợ sau khi đăng ký không?',
    answer: 'Bạn có thể liên hệ fanpage để được hướng dẫn lộ trình và giải đáp các phần cần làm rõ trong quá trình học.',
  },
];

export const CourseDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [course, setCourse] = useState<Course | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const { data } = await api.get(`/courses/${id}`);
        setCourse(data);

        const postsResponse = await api.get(`/blogposts?courseId=${id}&limit=3`);
        setRelatedPosts(postsResponse.data ?? []);
      } catch {
        setError('Không thể tải thông tin khóa học.');
      } finally {
        setLoading(false);
      }
    };

    void fetchCourse();
  }, [id]);

  const handleEnrollClick = () => {
    window.dataLayer?.push({ event: 'course_cta_click', courseId: id, location: 'course_footer' });
    window.gtag?.('event', 'course_cta_click', { course_id: id, location: 'course_footer' });
    window.fbq?.('trackCustom', 'course_cta_click', { courseId: id, location: 'course_footer' });
    window.ttq?.track?.('course_cta_click', { courseId: id, location: 'course_footer' });

    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    window.open(FACEBOOK_URL, '_blank', 'noopener,noreferrer');
  };

  const image = getMediaUrl(course?.thumbnailUrl) ?? undefined;
  const safeDescriptionHtml = useMemo(() => sanitizeBlogHtml(course?.description), [course?.description]);
  const descriptionText = useMemo(() => extractPlainTextFromBlogHtml(course?.description), [course?.description]);
  const benefitPoints = useMemo(() => {
    if (!course) return [];

    return [
      `Lộ trình xoay quanh chủ đề: ${course.title}.`,
      'Có liên kết sang bài viết liên quan để bạn học liền mạch hơn.',
      'Phù hợp để dùng cho học phần, đồ án hoặc tự nâng cấp kỹ năng nền.',
    ];
  }, [course]);

  if (loading) {
    return <div className="container"><div className="card" style={{ padding: '2rem', textAlign: 'center' }}>Đang tải...</div></div>;
  }

  if (!course) {
    return <div className="container"><div className="card" style={{ padding: '2rem', textAlign: 'center' }}>Không tìm thấy khóa học.</div></div>;
  }

  return (
    <div className="container reveal course-detail-shell">
      <Seo
        title={`${course.title} | ${SITE_NAME}`}
        description={descriptionText}
        path={`/courses/${course.id}`}
        image={image}
        type="product"
        jsonLd={[
          defaultOrganizationSchema,
          {
            '@context': 'https://schema.org',
            '@type': 'Course',
            name: course.title,
            description: descriptionText,
            provider: {
              '@type': 'Organization',
              name: SITE_NAME,
              url: SITE_URL,
            },
            instructor: {
              '@type': 'Person',
              name: course.instructorName,
            },
            offers: {
              '@type': 'Offer',
              price: course.price,
              priceCurrency: 'VND',
              availability: 'https://schema.org/InStock',
              url: `${SITE_URL}/courses/${course.id}`,
            },
          },
          {
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: defaultFaqs.map((faq) => ({
              '@type': 'Question',
              name: faq.question,
              acceptedAnswer: {
                '@type': 'Answer',
                text: faq.answer,
              },
            })),
          },
        ]}
      />

      {error && <div className="alert alert-error">{error}</div>}

      <div className="course-detail-layout">
        <article className="card course-detail-main">
          <h1 style={{ fontSize: '2rem', marginBottom: '0.85rem' }}>{course.title}</h1>
          <div className="muted course-description blog-rendered" style={{ marginBottom: '1rem' }} dangerouslySetInnerHTML={{ __html: safeDescriptionHtml }} />
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', marginBottom: '1.2rem' }}>
            <User size={16} /> <span>Người hướng dẫn: {course.instructorName}</span>
          </div>

          <div className="card" style={{ padding: '1rem', background: '#f8fafc', marginBottom: '1rem' }}>
            <h3 style={{ marginBottom: '0.6rem' }}>Bạn sẽ nhận được gì?</h3>
            <div style={{ display: 'grid', gap: '0.55rem' }}>
              {benefitPoints.map((point) => (
                <div key={point} style={{ display: 'inline-flex', alignItems: 'start', gap: '0.5rem' }}>
                  <CheckCircle2 size={17} color="var(--accent)" style={{ marginTop: '0.15rem', flexShrink: 0 }} />
                  <span className="muted">{point}</span>
                </div>
              ))}
            </div>
          </div>

          {relatedPosts.length > 0 ? (
            <section style={{ display: 'grid', gap: '0.8rem', marginTop: '1rem' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', fontWeight: 700, color: 'var(--primary)' }}>
                <PenSquare size={17} /> Blog liên quan
              </div>
              {relatedPosts.map((post) => (
                <Link key={post.id} to={`/blog/${post.id}`} className="card" style={{ padding: '0.9rem', display: 'grid', gap: '0.35rem' }}>
                  <h3 style={{ fontSize: '1rem' }}>{post.title}</h3>
                  <p className="muted line-clamp-2">{post.summary}</p>
                </Link>
              ))}
            </section>
          ) : null}

          <section style={{ display: 'grid', gap: '0.8rem', marginTop: '1rem' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', fontWeight: 700, color: 'var(--primary)' }}>
              <FileText size={17} /> FAQ
            </div>
            {defaultFaqs.map((faq) => (
              <article key={faq.question} className="card" style={{ padding: '0.9rem', display: 'grid', gap: '0.35rem' }}>
                <h3 style={{ fontSize: '1rem' }}>{faq.question}</h3>
                <p className="muted">{faq.answer}</p>
              </article>
            ))}
          </section>
        </article>

        <aside className="card course-enroll-card">
          <div className="course-image course-enroll-image">
            {image ? <img src={image} alt={course.title} /> : null}
          </div>
          <h2 style={{ fontSize: '2rem', color: 'var(--primary)' }}>{formatVnd(course.price)}</h2>
          <button type="button" className="btn btn-primary" style={{ width: '100%' }} onClick={handleEnrollClick}>
            Liên hệ Facebook để đăng ký
          </button>
          <p className="muted" style={{ margin: 0, fontSize: '0.95rem' }}>
            Hãy nhắn tin qua Facebook để được hướng dẫn thanh toán thủ công và xác nhận đăng ký khóa học.
          </p>
        </aside>
      </div>
    </div>
  );
};

