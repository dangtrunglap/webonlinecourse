import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { CheckCircle2, FileText, PenSquare, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Seo } from '../components/Seo';
import api from '../services/api';
import { formatVnd } from '../utils/currency';
import { getMediaUrl } from '../utils/media';
import type { BlogPost, ResourceFile } from '../types/content';
import { FACEBOOK_URL, SITE_NAME, SITE_URL, defaultOrganizationSchema } from '../constants/site';

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
    answer: 'Phù hợp với người đang cần một lộ trình học có ví dụ thực hành, tài liệu kèm theo và định hướng rõ cách áp dụng vào môn học hoặc đồ án.',
  },
  {
    question: 'Đăng ký như thế nào?',
    answer: 'Bạn có thể nhắn fanpage Facebook để được hướng dẫn thanh toán thủ công, sau đó quản trị viên sẽ xác nhận và cấp quyền truy cập.',
  },
  {
    question: 'Có tài liệu đi kèm không?',
    answer: 'Nếu khóa học đã được gắn tài liệu bổ trợ, bạn sẽ thấy ngay trong phần tài liệu liên quan của trang này.',
  },
];

export const CourseDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [course, setCourse] = useState<Course | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([]);
  const [relatedResources, setRelatedResources] = useState<ResourceFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const { data } = await api.get(`/courses/${id}`);
        setCourse(data);

        const [postsResponse, resourcesResponse] = await Promise.all([
          api.get(`/blogposts?courseId=${id}&limit=3`),
          api.get(`/resources?courseId=${id}&limit=4`),
        ]);
        setRelatedPosts(postsResponse.data ?? []);
        setRelatedResources(resourcesResponse.data ?? []);
      } catch {
        setError('Không thể tải thông tin khóa học.');
      } finally {
        setLoading(false);
      }
    };

    void fetchCourse();
  }, [id]);

  const handleEnrollClick = () => {
    window.dataLayer?.push({ event: 'course_cta_click', courseId: id, location: 'course_sidebar' });
    window.gtag?.('event', 'course_cta_click', { course_id: id, location: 'course_sidebar' });
    window.fbq?.('trackCustom', 'course_cta_click', { courseId: id, location: 'course_sidebar' });
    window.ttq?.track?.('course_cta_click', { courseId: id, location: 'course_sidebar' });

    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    window.open(FACEBOOK_URL, '_blank', 'noopener,noreferrer');
  };

  const image = getMediaUrl(course?.thumbnailUrl) ?? undefined;
  const benefitPoints = useMemo(() => {
    if (!course) return [];

    return [
      `Lộ trình xoay quanh chủ đề: ${course.title}.`,
      'Có liên kết sang bài viết và tài liệu liên quan để bạn học liền mạch hơn.',
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
    <div className="container reveal" style={{ display: 'grid', gap: '1.5rem' }}>
      <Seo
        title={`${course.title} | ${SITE_NAME}`}
        description={course.description}
        path={`/courses/${course.id}`}
        image={image}
        type="product"
        jsonLd={[
          defaultOrganizationSchema,
          {
            '@context': 'https://schema.org',
            '@type': 'Course',
            name: course.title,
            description: course.description,
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

      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', alignItems: 'start' }}>
        <article className="card" style={{ padding: '1.4rem' }}>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.85rem' }}>{course.title}</h1>
          <p className="muted course-description" style={{ marginBottom: '1rem' }}>{course.description}</p>
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

        <aside className="card" style={{ padding: '1rem', position: 'sticky', top: '90px', display: 'grid', gap: '1rem' }}>
          <div className="course-image" style={{ borderRadius: '12px', overflow: 'hidden', height: '200px' }}>
            {image ? <img src={image} alt={course.title} /> : null}
          </div>
          <h2 style={{ fontSize: '2rem', color: 'var(--primary)' }}>{formatVnd(course.price)}</h2>
          <button type="button" className="btn btn-primary" style={{ width: '100%' }} onClick={handleEnrollClick}>
            Liên hệ Facebook để đăng ký
          </button>
          <p className="muted" style={{ margin: 0, fontSize: '0.95rem' }}>
            Hãy nhắn tin qua Facebook để được hướng dẫn thanh toán thủ công và xác nhận đăng ký khóa học.
          </p>

          <div className="card" style={{ padding: '1rem', background: '#f8fafc', display: 'grid', gap: '0.75rem' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', fontWeight: 700, color: 'var(--primary)' }}>
              <FileText size={17} /> Tài liệu khóa học
            </div>
            {relatedResources.length === 0 ? (
              <p className="muted">Tài liệu sẽ được cập nhật tại đây.</p>
            ) : relatedResources.map((resource) => {
              const fileUrl = getMediaUrl(resource.fileUrl);
              return (
                <a key={resource.id} href={fileUrl ?? '#'} target="_blank" rel="noreferrer" className="btn btn-secondary" style={{ width: '100%' }}>
                  {resource.title}
                </a>
              );
            })}
          </div>
        </aside>
      </div>
    </div>
  );
};
