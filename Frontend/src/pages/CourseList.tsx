import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BookMarked, GraduationCap, Search, ShieldCheck, Users } from 'lucide-react';
import api from '../services/api';
import { getMediaUrl } from '../utils/media';

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
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const pageSize = 8;

  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      try {
        const { data } = await api.get(`/courses?search=${search}&page=${page}&pageSize=${pageSize}`);
        setCourses(data.items);
        setTotal(data.totalCount);
      } catch (err) {
        console.error('Failed to load courses', err);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(fetchCourses, 350);
    return () => clearTimeout(timer);
  }, [page, search]);

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
                      <p className="muted line-clamp-3">{course.description}</p>
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
