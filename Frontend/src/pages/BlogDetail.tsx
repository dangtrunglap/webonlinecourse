import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, CalendarDays, User } from 'lucide-react';
import { Seo } from '../components/Seo';
import api from '../services/api';
import type { BlogPost } from '../types/content';
import { sanitizeBlogHtml } from '../utils/blogHtml';
import { getMediaUrl } from '../utils/media';
import { SITE_NAME, SITE_URL, defaultOrganizationSchema } from '../constants/site';

export const BlogDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const { data } = await api.get(`/blogposts/${id}`);
        setPost(data);
      } catch {
        setError('Không thể tải bài viết này.');
      } finally {
        setLoading(false);
      }
    };

    void fetchData();
  }, [id]);

  if (loading) {
    return <div className="container"><div className="card" style={{ padding: '2rem', textAlign: 'center' }}>Đang tải bài viết...</div></div>;
  }

  if (error || !post) {
    return <div className="container"><div className="card" style={{ padding: '2rem', textAlign: 'center' }}>{error || 'Không tìm thấy bài viết.'}</div></div>;
  }

  const coverImage = getMediaUrl(post.coverImageUrl);
  const safeHtml = sanitizeBlogHtml(post.content);

  return (
    <div className="container reveal" style={{ display: 'grid', gap: '1.6rem' }}>
      <Seo
        title={`${post.title} | ${SITE_NAME}`}
        description={post.summary}
        path={`/blog/${post.id}`}
        image={coverImage ?? undefined}
        type="article"
        publishedTime={post.publishedAt}
        modifiedTime={post.updatedAt ?? undefined}
        jsonLd={[
          defaultOrganizationSchema,
          {
            '@context': 'https://schema.org',
            '@type': 'Article',
            headline: post.title,
            description: post.summary,
            image: coverImage ? [coverImage] : undefined,
            datePublished: post.publishedAt,
            dateModified: post.updatedAt ?? post.publishedAt,
            author: {
              '@type': 'Person',
              name: post.instructorName,
            },
            publisher: {
              '@type': 'Organization',
              name: SITE_NAME,
            },
            mainEntityOfPage: `${SITE_URL}/blog/${post.id}`,
          },
        ]}
      />

      <div>
        <Link to="/blog" className="btn btn-secondary">
          <ArrowLeft size={16} /> Quay lại blog
        </Link>
      </div>

      <article className="card" style={{ padding: '1.5rem', display: 'grid', gap: '1rem' }}>
        {coverImage ? (
          <img
            src={coverImage}
            alt={post.title}
            style={{ width: '100%', maxHeight: '420px', objectFit: 'cover', borderRadius: '18px' }}
          />
        ) : null}
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
          {post.updatedAt ? (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
              Cập nhật: {new Date(post.updatedAt).toLocaleDateString('vi-VN')}
            </span>
          ) : null}
        </div>
        <div className="blog-rendered" dangerouslySetInnerHTML={{ __html: safeHtml }} />
      </article>

    </div>
  );
};
