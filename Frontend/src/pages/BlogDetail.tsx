import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, CalendarDays, User } from 'lucide-react';
import api from '../services/api';
import type { BlogPost, ResourceFile } from '../types/content';
import { getMediaUrl } from '../utils/media';

export const BlogDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [resources, setResources] = useState<ResourceFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const { data } = await api.get(`/blogposts/${id}`);
        setPost(data);
        if (data?.courseId) {
          const resourcesResponse = await api.get(`/resources?courseId=${data.courseId}&limit=4`);
          setResources(resourcesResponse.data ?? []);
        } else {
          setResources([]);
        }
      } catch {
        setError('Không thể tải bài viết này.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (loading) {
    return <div className="container"><div className="card" style={{ padding: '2rem', textAlign: 'center' }}>Đang tải bài viết...</div></div>;
  }

  if (error || !post) {
    return <div className="container"><div className="card" style={{ padding: '2rem', textAlign: 'center' }}>{error || 'Không tìm thấy bài viết.'}</div></div>;
  }

  return (
    <div className="container reveal" style={{ display: 'grid', gap: '1.6rem' }}>
      <div>
        <Link to="/blog" className="btn btn-secondary">
          <ArrowLeft size={16} /> Quay lại blog
        </Link>
      </div>

      <article className="card" style={{ padding: '1.5rem', display: 'grid', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
          <span className="btn btn-secondary" style={{ padding: '0.35rem 0.7rem', cursor: 'default' }}>
            {post.courseTitle || 'Chia sẻ chuyên môn'}
          </span>
          {post.featured ? <span className="btn btn-primary" style={{ padding: '0.35rem 0.7rem', cursor: 'default' }}>Bài nổi bật</span> : null}
        </div>
        <div>
          <h1 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.6rem)', marginBottom: '0.8rem' }}>{post.title}</h1>
          <p className="muted" style={{ fontSize: '1.04rem' }}>{post.summary}</p>
        </div>
        <div className="muted" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', fontSize: '0.94rem' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}><User size={15} /> {post.instructorName}</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}><CalendarDays size={15} /> {new Date(post.publishedAt).toLocaleDateString('vi-VN')}</span>
        </div>
        <div style={{ whiteSpace: 'pre-line', lineHeight: 1.8, color: 'var(--foreground)' }}>
          {post.content}
        </div>
      </article>

      {resources.length > 0 ? (
        <section className="section" style={{ marginBottom: 0 }}>
          <h2 className="section-title" style={{ textAlign: 'left', fontSize: '1.5rem' }}>Tài liệu liên quan</h2>
          <div className="grid grid-3">
            {resources.map((resource) => {
              const fileUrl = getMediaUrl(resource.fileUrl);
              return (
                <article key={resource.id} className="card" style={{ padding: '1rem', display: 'grid', gap: '0.8rem' }}>
                  <div>
                    <h3 style={{ fontSize: '1.05rem', marginBottom: '0.3rem' }}>{resource.title}</h3>
                    <p className="muted line-clamp-3">{resource.description}</p>
                  </div>
                  <div className="muted" style={{ fontSize: '0.9rem' }}>
                    File: {resource.fileName}
                  </div>
                  {fileUrl ? (
                    <a href={fileUrl} target="_blank" rel="noreferrer" className="btn btn-secondary" style={{ width: '100%' }}>
                      Tải tài liệu
                    </a>
                  ) : null}
                </article>
              );
            })}
          </div>
        </section>
      ) : null}
    </div>
  );
};
