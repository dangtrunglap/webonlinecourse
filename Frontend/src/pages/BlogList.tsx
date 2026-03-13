import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarDays, PenSquare, Search, Sparkles, User } from 'lucide-react';
import api from '../services/api';
import type { BlogPost } from '../types/content';

export const BlogList: React.FC = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      try {
        const { data } = await api.get('/blogposts');
        setPosts(data ?? []);
      } catch (error) {
        console.error('Failed to load blog posts', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  const filteredPosts = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return posts;

    return posts.filter((post) => {
      return [post.title, post.summary, post.content, post.instructorName, post.courseTitle]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(keyword));
    });
  }, [posts, search]);

  return (
    <div className="container reveal">
      <section className="hero">
        <h1 className="hero-title">Blog giảng viên</h1>
        <p className="hero-subtitle">
          Tổng hợp bài viết chuyên môn, kinh nghiệm đồ án và chia sẻ thực chiến từ đội ngũ giảng viên GHTXDBK.
        </p>
        <div className="hero-actions">
          <Link to="/resources" className="btn btn-secondary">Xem thư viện tài liệu</Link>
          <a href="https://www.facebook.com/civil.engineer.bk/" target="_blank" rel="noreferrer" className="btn btn-primary">
            Tham khảo Facebook
          </a>
        </div>
      </section>

      <section className="section">
        <div className="search-wrap" style={{ marginBottom: '1.4rem' }}>
          <Search className="search-icon" size={18} />
          <input
            type="text"
            placeholder="Tìm theo chủ đề, khóa học, giảng viên..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>

        {loading ? (
          <div className="card" style={{ padding: '2rem', textAlign: 'center' }}>Đang tải bài viết...</div>
        ) : filteredPosts.length === 0 ? (
          <div className="card" style={{ padding: '2rem', textAlign: 'center' }}>Chưa có bài viết phù hợp.</div>
        ) : (
          <div className="grid grid-3">
            {filteredPosts.map((post) => (
              <article key={post.id} className="card" style={{ padding: '1.2rem', display: 'grid', gap: '0.9rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.8rem' }}>
                  <span className="btn btn-secondary" style={{ padding: '0.35rem 0.7rem', cursor: 'default' }}>
                    <PenSquare size={15} /> Blog
                  </span>
                  {post.featured ? (
                    <span className="btn btn-primary" style={{ padding: '0.35rem 0.7rem', cursor: 'default' }}>
                      <Sparkles size={15} /> Nổi bật
                    </span>
                  ) : null}
                </div>
                <div>
                  <h2 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>{post.title}</h2>
                  <p className="muted line-clamp-3">{post.summary}</p>
                </div>
                <div className="muted" style={{ display: 'grid', gap: '0.35rem', fontSize: '0.94rem' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}><User size={15} /> {post.instructorName}</span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}><CalendarDays size={15} /> {new Date(post.publishedAt).toLocaleDateString('vi-VN')}</span>
                  {post.courseTitle ? <span>Khóa học: {post.courseTitle}</span> : <span>Chia sẻ chuyên môn tổng hợp</span>}
                </div>
                <Link to={`/blog/${post.id}`} className="btn btn-secondary" style={{ width: '100%' }}>
                  Đọc bài viết
                </Link>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
