import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { getMediaUrl } from '../utils/media';

interface Enrollment {
  id: string;
  title: string;
  thumbnailUrl: string | null;
  enrollmentDate: string;
}

export const MyCourses: React.FC = () => {
  const [courses, setCourses] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMyCourses = async () => {
      try {
        const { data } = await api.get('/enrollments/my-courses');
        setCourses(data);
      } catch (err) {
        console.error('Failed to load enrolled courses', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMyCourses();
  }, []);

  return (
    <div className="container reveal">
      <section className="hero" style={{ padding: '2.2rem 1.5rem' }}>
        <h1 className="hero-title" style={{ fontSize: 'clamp(1.7rem, 4vw, 2.4rem)' }}>Khóa học của tôi</h1>
        <p className="hero-subtitle">Theo dõi các khóa học đã đăng ký và tiếp tục học từ vị trí đang dở.</p>
      </section>

      {loading ? (
        <div className="card" style={{ padding: '2rem', textAlign: 'center' }}>Đang tải danh sách khóa học...</div>
      ) : courses.length === 0 ? (
        <div className="card" style={{ padding: '2rem', textAlign: 'center' }}>
          <h3 style={{ marginBottom: '0.65rem' }}>Bạn chưa đăng ký khóa học nào.</h3>
          <Link to="/" className="btn btn-primary">Khám phá khóa học</Link>
        </div>
      ) : (
        <div className="grid grid-3">
          {courses.map((course) => {
            const image = getMediaUrl(course.thumbnailUrl);
            return (
              <Link to={`/courses/${course.id}`} key={course.id} className="card course-card">
                <div className="course-image" style={{ height: '170px' }}>{image ? <img src={image} alt={course.title} /> : null}</div>
                <div className="course-content">
                  <h3 className="line-clamp-2">{course.title}</h3>
                  <p className="muted" style={{ fontSize: '0.9rem' }}>Đăng ký ngày {new Date(course.enrollmentDate).toLocaleDateString('vi-VN')}</p>
                  <div style={{ marginTop: '0.2rem', height: '6px', borderRadius: '999px', background: '#e2e8f0' }}>
                    <div style={{ width: '8%', height: '100%', borderRadius: '999px', background: 'var(--primary)' }} />
                  </div>
                  <p className="muted" style={{ textAlign: 'right', fontSize: '0.84rem' }}>8% hoàn thành</p>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};
