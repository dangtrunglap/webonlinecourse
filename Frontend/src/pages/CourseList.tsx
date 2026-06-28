import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BookMarked,
  GraduationCap,
  PenSquare,
  Search,
  ShieldCheck,
  Users,
} from 'lucide-react';
import { Seo } from '../components/Seo';
import api from '../services/api';
import { formatVnd } from '../utils/currency';
import { getMediaUrl } from '../utils/media';
import type { BlogPost } from '../types/content';
import { extractPlainTextFromBlogHtml } from '../utils/blogHtml';
import {
  FACEBOOK_URL,
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_URL,
  TOPIC_CLUSTERS,
  defaultOrganizationSchema,
  defaultWebsiteSchema,
} from '../constants/site';

interface Course {
  id: string;
  title: string;
  description: string;
  price: number;
  thumbnailUrl: string | null;
  instructorName: string;
}

const highlights = [
  {
    icon: Users,
    title: 'Cộng đồng học tập',
    description: 'Kết nối với sinh viên cùng ngành và nhận hỗ trợ trước, trong, sau khóa học.',
  },
  {
    icon: BookMarked,
    title: 'Nội dung chất lượng',
    description: 'Bài học được cập nhật theo bài tập thực tế và hướng dẫn từng bước.',
  },
  {
    icon: GraduationCap,
    title: 'Lộ trình rõ ràng',
    description: 'Từ cơ bản đến nâng cao, bố cục kiến thức dễ học và dễ áp dụng.',
  },
  {
    icon: ShieldCheck,
    title: 'Hỗ trợ tận tâm',
    description: 'Giải đáp nhanh trong quá trình học, đồng hành đến khi hoàn thành đồ án.',
  },
];

const homepageFaqs = [
  {
    question: 'GHTXDBK là gì?',
    answer: 'Đây là website tổng hợp khóa học, bài viết hướng dẫn và công cụ dành cho người học ngành xây dựng.',
  },
  {
    question: 'Dành cho ai?',
    answer: 'Phù hợp với sinh viên, người đang làm đồ án, người cần học Revit, ETABS và kỹ năng triển khai nội dung chuyên ngành.',
  },
  {
    question: 'Hành động chính trên site là gì?',
    answer: 'Bạn có thể khám phá khóa học, đọc blog và liên hệ tư vấn để chọn nội dung phù hợp.',
  },
];

export const CourseList: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [latestPosts, setLatestPosts] = useState<BlogPost[]>([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const pageSize = 8;

  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      try {
        const { data } = await api.get(`/courses?search=${encodeURIComponent(search)}&page=${page}&pageSize=${pageSize}`);
        setCourses(data.items ?? []);
        setTotal(data.totalCount ?? 0);
      } catch (err) {
        console.error('Failed to load courses', err);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(fetchCourses, 350);
    return () => clearTimeout(timer);
  }, [page, search]);

  useEffect(() => {
    const fetchHighlights = async () => {
      try {
        const postsResponse = await api.get('/blogposts?limit=3');
        setLatestPosts(postsResponse.data ?? []);
      } catch (err) {
        console.error('Failed to load homepage highlights', err);
      }
    };

    void fetchHighlights();
  }, []);

  const maxPage = useMemo(() => Math.max(1, Math.ceil(total / pageSize)), [total]);

  const liveStats = [
    { label: 'Khóa học đang hiển thị', value: String(total || courses.length || 0) },
    { label: 'Bài viết gần đây', value: String(latestPosts.length) },
  ];

  return (
    <div className="container reveal">
      <Seo
        title={`${SITE_NAME} | Khóa học xây dựng và blog thực chiến`}
        description={SITE_DESCRIPTION}
        path="/"
        keywords={['GHTXDBK', 'khoa hoc Revit', 'khoa hoc ETABS', 'do an xay dung', 'TCVN']}
        jsonLd={[
          defaultOrganizationSchema,
          defaultWebsiteSchema,
          {
            '@context': 'https://schema.org',
            '@type': 'CollectionPage',
            name: SITE_NAME,
            url: SITE_URL,
            description: SITE_DESCRIPTION,
            about: TOPIC_CLUSTERS,
          },
          {
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: homepageFaqs.map((faq) => ({
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

      <section className="hero">
        <h1 className="hero-title">Khóa học xây dựng thực chiến từ GHTXDBK</h1>
        <p className="hero-subtitle">
          GHTXDBK dành cho sinh viên xây dựng, người đang làm đồ án và kỹ sư trẻ muốn học Revit, ETABS, tiêu chuẩn,
          bài học thực hành và cách triển khai công việc theo hướng dễ áp dụng hơn.
        </p>
        <div className="hero-actions">
          <a href="#course-section" className="btn btn-primary">
            Khám phá khóa học <ArrowRight size={16} />
          </a>
          <a href={FACEBOOK_URL} className="btn btn-secondary" target="_blank" rel="noreferrer">
            Inbox tư vấn
          </a>
        </div>
      </section>

      <section className="section">
        <div className="trust-panel">
          {liveStats.map((stat) => (
            <article key={stat.label} className="trust-stat">
              <strong>{stat.value}</strong>
              <span>{stat.label}</span>
            </article>
          ))}
        </div>
      </section>

      <section className="section">
        <h2 className="section-title">Tại sao chọn GHTXDBK?</h2>
        <p className="section-subtitle">Một hệ sinh thái học tập được thiết kế cho sinh viên xây dựng học đúng thứ mình đang cần.</p>
        <div className="grid grid-4">
          {highlights.map((item) => {
            const Icon = item.icon;
            return (
              <article key={item.title} className="card info-card">
                <Icon color="var(--accent)" />
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="section">
        <h2 className="section-title">Cụm nội dung trọng tâm</h2>
        <p className="section-subtitle">Đây là các nhóm chủ đề nên tiếp tục được đẩy mạnh để tận dụng nhu cầu tìm kiếm và footprint nội dung hiện có.</p>
        <div className="topic-grid">
          {TOPIC_CLUSTERS.map((topic) => (
            <article key={topic} className="card topic-card">
              <h3>{topic}</h3>
            </article>
          ))}
        </div>
      </section>

      <section className="section">
        <div style={{ display: 'flex', alignItems: 'end', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.2rem' }}>
          <div>
            <h2 className="section-title" style={{ textAlign: 'left', marginBottom: '0.35rem' }}>Chia sẻ mới từ GHTXDBK</h2>
            <p className="section-subtitle" style={{ textAlign: 'left', marginBottom: 0 }}>
              Kinh nghiệm đồ án và mẹo học cập nhật ngay trên nền tảng.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.7rem', flexWrap: 'wrap' }}>
            <Link to="/blog" className="btn btn-secondary">Toàn bộ bài viết</Link>
          </div>
        </div>

        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
          <section className="card" style={{ padding: '1.15rem', display: 'grid', gap: '0.9rem' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)', fontWeight: 700 }}>
              <PenSquare size={18} /> Blog mới
            </div>
            {latestPosts.length === 0 ? (
              <p className="muted">Bài viết mới sẽ xuất hiện tại đây.</p>
            ) : latestPosts.map((post) => (
              <Link key={post.id} to={`/blog/${post.id}`} className="card" style={{ padding: '0.9rem', display: 'grid', gap: '0.45rem' }}>
                <h3 style={{ fontSize: '1rem' }} className="line-clamp-2">{post.title}</h3>
                <p className="muted line-clamp-2">{post.summary}</p>
                <span className="muted" style={{ fontSize: '0.9rem' }}>{post.courseTitle || post.instructorName}</span>
              </Link>
            ))}
          </section>
        </div>
      </section>

      <section id="course-section" className="section">
        <h2 className="section-title">Khóa học nổi bật</h2>
        <p className="section-subtitle">Tìm khóa học phù hợp nhu cầu của bạn.</p>

        <div className="search-wrap" style={{ marginBottom: '1.4rem' }}>
          <Search className="search-icon" size={18} />
          <input
            type="text"
            placeholder="Tìm theo tên khóa học hoặc từ khóa..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>

        {loading ? (
          <div className="card" style={{ padding: '2rem', textAlign: 'center' }}>Đang tải danh sách khóa học...</div>
        ) : courses.length === 0 ? (
          <div className="card" style={{ padding: '2rem', textAlign: 'center' }}>Không tìm thấy khóa học phù hợp.</div>
        ) : (
          <>
            <div className="grid course-grid">
              {courses.map((course) => {
                const image = getMediaUrl(course.thumbnailUrl);
                return (
                  <Link key={course.id} to={`/courses/${course.id}`} className="card course-card">
                    <div className="course-image">
                      {image ? <img src={image} alt={course.title} /> : null}
                      <span className="course-badge">{formatVnd(course.price)}</span>
                    </div>
                    <div className="course-content">
                      <h3 className="line-clamp-2">{course.title}</h3>
                      <p className="muted line-clamp-3 course-description-preview">{extractPlainTextFromBlogHtml(course.description)}</p>
                      <div className="muted" style={{ fontSize: '0.9rem' }}>Người hướng dẫn: {course.instructorName}</div>
                      <button type="button" className="btn btn-secondary" style={{ width: '100%' }}>
                        Xem chi tiết
                      </button>
                    </div>
                  </Link>
                );
              })}
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.8rem', marginTop: '1.4rem' }}>
              <button type="button" className="btn btn-secondary" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                Trước
              </button>
              <span className="muted">Trang {page} / {maxPage}</span>
              <button type="button" className="btn btn-secondary" disabled={page >= maxPage} onClick={() => setPage((p) => p + 1)}>
                Sau
              </button>
            </div>
          </>
        )}
      </section>

      <section className="section">
        <h2 className="section-title">FAQ nhanh</h2>
        <div className="grid grid-3">
          {homepageFaqs.map((faq) => (
            <article key={faq.question} className="card" style={{ padding: '1.15rem', display: 'grid', gap: '0.6rem' }}>
              <h3 style={{ fontSize: '1.05rem' }}>{faq.question}</h3>
              <p className="muted">{faq.answer}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
};

