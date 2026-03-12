import React, { useEffect, useState } from 'react';
import { Plus, Trash, Upload } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

interface Course {
  id: string;
  title: string;
  price: number;
}

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState(0);

  useEffect(() => {
    fetchMyCourses();
  }, []);

  const fetchMyCourses = async () => {
    try {
      const { data } = await api.get('/courses?pageSize=50');
      setCourses(data.items);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/courses', { title, description, price });
      setTitle('');
      setDescription('');
      setPrice(0);
      fetchMyCourses();
    } catch {
      alert('Tạo khóa học thất bại');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Bạn có chắc muốn xóa khóa học này?')) return;
    try {
      await api.delete(`/courses/${id}`);
      fetchMyCourses();
    } catch {
      alert('Xóa khóa học thất bại');
    }
  };

  const handleThumbnailUpload = async (id: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      await api.post(`/courses/${id}/thumbnail`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      alert('Tải ảnh đại diện thành công.');
    } catch {
      alert('Tải ảnh đại diện thất bại');
    }
  };

  return (
    <div className="container reveal">
      <section className="hero" style={{ padding: '2.2rem 1.5rem' }}>
        <h1 className="hero-title" style={{ fontSize: 'clamp(1.7rem, 4vw, 2.4rem)' }}>
          {user?.role === 'Admin' ? 'Bảng điều khiển quản trị' : 'Bảng điều khiển giảng viên'}
        </h1>
        <p className="hero-subtitle">Tạo khóa học mới, tải ảnh đại diện và quản lý danh sách khóa học của bạn.</p>
      </section>

      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))' }}>
        <section className="card" style={{ padding: '1rem' }}>
          <h2 style={{ fontSize: '1.2rem', marginBottom: '0.9rem', display: 'inline-flex', gap: '0.4rem', alignItems: 'center' }}>
            <Plus size={18} /> Tạo khóa học
          </h2>
          <form onSubmit={handleCreateCourse} className="form-grid">
            <div className="field">
              <label>Tiêu đề</label>
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required />
            </div>
            <div className="field">
              <label>Mô tả</label>
              <textarea rows={4} value={description} onChange={(e) => setDescription(e.target.value)} required />
            </div>
            <div className="field">
              <label>Giá</label>
              <input type="number" step="0.01" value={price} onChange={(e) => setPrice(parseFloat(e.target.value))} required />
            </div>
            <button type="submit" className="btn btn-primary">Tạo khóa học</button>
          </form>
        </section>

        <section className="card" style={{ padding: '1rem' }}>
          <h2 style={{ fontSize: '1.2rem', marginBottom: '0.9rem' }}>Quản lý khóa học</h2>
          {loading ? (
            <p className="muted">Đang tải danh sách khóa học...</p>
          ) : courses.length === 0 ? (
            <p className="muted">Chưa có khóa học nào.</p>
          ) : (
            <div className="form-grid">
              {courses.map((course) => (
                <article key={course.id} className="card" style={{ padding: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.8rem' }}>
                  <div>
                    <h3 style={{ fontSize: '1rem' }}>{course.title}</h3>
                    <p className="muted">${course.price.toFixed(2)}</p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                    <label className="btn btn-secondary" style={{ padding: '0.52rem' }} title="Tải ảnh đại diện">
                      <Upload size={16} />
                      <input
                        type="file"
                        style={{ display: 'none' }}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleThumbnailUpload(course.id, file);
                        }}
                      />
                    </label>
                    <button type="button" className="btn btn-secondary" style={{ padding: '0.52rem', color: 'var(--danger)' }} onClick={() => handleDelete(course.id)}>
                      <Trash size={16} />
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};
