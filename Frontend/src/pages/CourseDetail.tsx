import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { CreditCard, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
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

export const CourseDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [enrollLoading, setEnrollLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [showPayment, setShowPayment] = useState(false);
  const [card, setCard] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const { data } = await api.get(`/courses/${id}`);
        setCourse(data);
      } catch {
        setError('Không thể tải thông tin khóa học.');
      } finally {
        setLoading(false);
      }
    };
    fetchCourse();
  }, [id]);

  const handleEnrollClick = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    setShowPayment(true);
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setEnrollLoading(true);
    setError('');

    try {
      await api.post(`/enrollments/${id}/enroll`, {
        cardNumber: card,
        expiryDate: expiry,
        cvv,
      });
      setShowPayment(false);
      setSuccess('Đăng ký khóa học thành công. Bạn đã có thể truy cập toàn bộ nội dung.');
    } catch (err: any) {
      setError(err.response?.data?.message || err.response?.data?.Message || 'Đăng ký khóa học thất bại.');
    } finally {
      setEnrollLoading(false);
    }
  };

  if (loading) {
    return <div className="container"><div className="card" style={{ padding: '2rem', textAlign: 'center' }}>Đang tải...</div></div>;
  }

  if (!course) {
    return <div className="container"><div className="card" style={{ padding: '2rem', textAlign: 'center' }}>Không tìm thấy khóa học.</div></div>;
  }

  const image = getMediaUrl(course.thumbnailUrl);

  return (
    <div className="container reveal">
      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', alignItems: 'start' }}>
        <article className="card" style={{ padding: '1.4rem' }}>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.85rem' }}>{course.title}</h1>
          <p className="muted" style={{ marginBottom: '1rem' }}>{course.description}</p>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', marginBottom: '1.2rem' }}>
            <User size={16} /> <span>Giảng viên: {course.instructorName}</span>
          </div>
          <div className="card" style={{ padding: '1rem', background: '#f8fafc' }}>
            <h3 style={{ marginBottom: '0.6rem' }}>Nội dung khóa học</h3>
            <p className="muted">{success ? 'Tất cả bài học đã được mở trong mục Khóa học của tôi.' : 'Đăng ký để mở toàn bộ bài học và tài liệu thực hành.'}</p>
          </div>
        </article>

        <aside className="card" style={{ padding: '1rem', position: 'sticky', top: '90px' }}>
          <div className="course-image" style={{ borderRadius: '12px', overflow: 'hidden', height: '200px' }}>
            {image ? <img src={image} alt={course.title} /> : null}
          </div>
          <h2 style={{ fontSize: '2rem', color: 'var(--primary)', margin: '1rem 0 0.8rem' }}>${course.price.toFixed(2)}</h2>

          {!showPayment ? (
            <button type="button" className="btn btn-primary" style={{ width: '100%' }} onClick={handleEnrollClick} disabled={!!success}>
              {success ? 'Đã đăng ký' : 'Đăng ký ngay'}
            </button>
          ) : (
            <form onSubmit={handlePayment} className="form-grid" style={{ marginTop: '0.8rem' }}>
              <h3 style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem' }}>
                <CreditCard size={16} /> Thanh toán an toàn
              </h3>
              <div className="field">
                <input type="text" required minLength={12} value={card} onChange={(e) => setCard(e.target.value)} placeholder="Số thẻ" />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
                <div className="field">
                  <input type="text" required value={expiry} onChange={(e) => setExpiry(e.target.value)} placeholder="MM/YY" />
                </div>
                <div className="field">
                  <input type="text" required value={cvv} onChange={(e) => setCvv(e.target.value)} placeholder="CVV" />
                </div>
              </div>
              <button type="submit" className="btn btn-primary" disabled={enrollLoading}>
                {enrollLoading ? 'Đang xử lý...' : `Thanh toán $${course.price.toFixed(2)}`}
              </button>
              <button type="button" className="btn btn-secondary" onClick={() => setShowPayment(false)}>
                Hủy
              </button>
            </form>
          )}
        </aside>
      </div>
    </div>
  );
};
