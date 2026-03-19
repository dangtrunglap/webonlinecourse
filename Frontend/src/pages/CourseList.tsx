import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BookMarked, FileText, GraduationCap, PenSquare, Search, ShieldCheck, Users } from 'lucide-react';
import api from '../services/api';
import { getMediaUrl } from '../utils/media';
import type { BlogPost, ResourceFile } from '../types/content';

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
    title: 'Tài liệu chất lượng',
    description: 'Nội dung được cập nhật theo bài tập thực tế và hướng dẫn từng bước.',
  },
  {
    icon: GraduationCap,
    title: 'Lộ trình rõ ràng',
    description: 'Từ cơ bản đến nâng cao, bố cục kiến thức dễ học và dễ ứng dụng.',
  },
  {
    icon: ShieldCheck,
    title: 'Hỗ trợ tận tâm',
    description: 'Giải đáp nhanh trong quá trình học, đồng hành đến khi hoàn thành đồ án.',
  },
];

export const CourseList: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [latestPosts, setLatestPosts] = useState<BlogPost[]>([]);
  const [latestResources, setLatestResources] = useState<ResourceFile[]>([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
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
        const [postsResponse, resourcesResponse] = await Promise.all([
          api.get('/blogposts?limit=3'),
          api.get('/resources?limit=3'),
        ]);
        setLatestPosts(postsResponse.data ?? []);
        setLatestResources(resourcesResponse.data ?? []);
      } catch (err) {
        console.error('Failed to load homepage highlights', err);
      }
    };

    fetchHighlights();
  }, []);

  const maxPage = useMemo(() => Math.max(1, Math.ceil(total / pageSize)), [total]);

  return (
    <div className="container reveal">
      <section className="hero">
        <h1 className="hero-title">Góc Học Tập Xây Dựng Bách Khoa</h1>
        <p className="hero-subtitle">
          Nền tảng khóa học thực chiến dành cho sinh viên xây dựng: Revit, ETABS, kỹ năng đồ án,
          và tư duy làm việc chuyên nghiệp.
        </p>
        <div className="hero-actions">
          <a href="#course-section" className="btn btn-primary">
            Khám phá khóa học <ArrowRight size={16} />
          </a>
          <Link to="/blog" className="btn btn-secondary">
            Xem blog giảng viên
          </Link>
          <a href="https://www.facebook.com/civil.engineer.bk/" className="btn btn-secondary" target="_blank" rel="noreferrer">
            Liên hệ Facebook
          </a>
        </div>
      </section>

      <section className="section">
        <h2 className="section-title">Tại sao chọn GHTXDBK?</h2>
        <p className="section-subtitle">Một hệ sinh thái học tập được thiết kế cho sinh viên xây dựng.</p>
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
        <div style={{ display: 'flex', alignItems: 'end', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.2rem' }}>
          <div>
            <h2 className="section-title" style={{ textAlign: 'left', marginBottom: '0.35rem' }}>Chia sẻ mới từ giảng viên</h2>
            <p className="section-subtitle" style={{ textAlign: 'left', marginBottom: 0 }}>Kinh nghiệm đồ án, mẹo học và tài liệu cập nhật ngay trên nền tảng.</p>
          </div>
          <div style={{ display: 'flex', gap: '0.7rem', flexWrap: 'wrap' }}>
            <Link to="/blog" className="btn btn-secondary">Toàn bộ bài viết</Link>
            <Link to="/resources" className="btn btn-primary">Thư viện tài liệu</Link>
          </div>
        </div>

        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
          <section className="card" style={{ padding: '1.15rem', display: 'grid', gap: '0.9rem' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)', fontWeight: 700 }}>
              <PenSquare size={18} /> Blog giảng viên
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

          <section className="card" style={{ padding: '1.15rem', display: 'grid', gap: '0.9rem' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)', fontWeight: 700 }}>
              <FileText size={18} /> Tài liệu mới
            </div>
            {latestResources.length === 0 ? (
              <p className="muted">Tài liệu mới sẽ xuất hiện tại đây.</p>
            ) : latestResources.map((resource) => (
              <article key={resource.id} className="card" style={{ padding: '0.9rem', display: 'grid', gap: '0.45rem' }}>
                <h3 style={{ fontSize: '1rem' }} className="line-clamp-2">{resource.title}</h3>
                <p className="muted line-clamp-2">{resource.description}</p>
                <span className="muted" style={{ fontSize: '0.9rem' }}>{resource.courseTitle || resource.fileName}</span>
              </article>
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
            <div className="grid grid-4">
              {courses.map((course) => {
                const image = getMediaUrl(course.thumbnailUrl);
                return (
                  <Link key={course.id} to={`/courses/${course.id}`} className="card course-card">
                    <div className="course-image">
                      {image ? <img src={image} alt={course.title} /> : null}
                      <span className="course-badge">${course.price.toFixed(2)}</span>
                    </div>
                    <div className="course-content">
                      <h3 className="line-clamp-2">{course.title}</h3>
                      <p className="muted line-clamp-3 course-description-preview">{course.description}</p>
                      <div className="muted" style={{ fontSize: '0.9rem' }}>Giảng viên: {course.instructorName}</div>
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
    </div>
  );
};
