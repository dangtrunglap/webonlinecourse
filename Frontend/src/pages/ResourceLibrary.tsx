import React, { useEffect, useMemo, useState } from 'react';
import { Download, FileText, Search, User } from 'lucide-react';
import { Seo } from '../components/Seo';
import api from '../services/api';
import type { ResourceFile } from '../types/content';
import { getMediaUrl } from '../utils/media';
import { SITE_NAME, SITE_URL } from '../constants/site';

const formatBytes = (value: number) => {
  if (!value) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const index = Math.min(Math.floor(Math.log(value) / Math.log(1024)), units.length - 1);
  const size = value / Math.pow(1024, index);
  return `${size.toFixed(size >= 10 || index === 0 ? 0 : 1)} ${units[index]}`;
};

export const ResourceLibrary: React.FC = () => {
  const [resources, setResources] = useState<ResourceFile[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResources = async () => {
      setLoading(true);
      try {
        const { data } = await api.get('/resources');
        setResources(data ?? []);
      } catch (error) {
        console.error('Failed to load resources', error);
      } finally {
        setLoading(false);
      }
    };

    void fetchResources();
  }, []);

  const filteredResources = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return resources;

    return resources.filter((resource) => {
      return [resource.title, resource.description, resource.fileName, resource.instructorName, resource.courseTitle]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(keyword));
    });
  }, [resources, search]);

  return (
    <div className="container reveal">
      <Seo
        title={`Thư viện tài liệu | ${SITE_NAME}`}
        description="File bài tập, tài liệu hướng dẫn, checklist và biểu mẫu được giảng viên GHTXDBK chia sẻ trực tiếp trên nền tảng."
        path="/resources"
        keywords={['tai lieu xay dung', 'tai lieu Revit', 'tai lieu ETABS', 'checklist do an']}
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'CollectionPage',
          name: `Thư viện tài liệu ${SITE_NAME}`,
          url: `${SITE_URL}/resources`,
        }}
      />

      <section className="hero">
        <h1 className="hero-title">Thư viện tài liệu</h1>
        <p className="hero-subtitle">
          File bài tập, tài liệu hướng dẫn, checklist và biểu mẫu được giảng viên chia sẻ trực tiếp trên nền tảng.
        </p>
      </section>

      <section className="section">
        <div className="search-wrap" style={{ marginBottom: '1.4rem' }}>
          <Search className="search-icon" size={18} />
          <input
            type="text"
            placeholder="Tìm theo tên tài liệu, khóa học, giảng viên..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>

        {loading ? (
          <div className="card" style={{ padding: '2rem', textAlign: 'center' }}>Đang tải tài liệu...</div>
        ) : filteredResources.length === 0 ? (
          <div className="card" style={{ padding: '2rem', textAlign: 'center' }}>Chưa có tài liệu phù hợp.</div>
        ) : (
          <div className="grid grid-3">
            {filteredResources.map((resource) => {
              const fileUrl = getMediaUrl(resource.fileUrl);
              return (
                <article key={resource.id} className="card" style={{ padding: '1.1rem', display: 'grid', gap: '0.8rem' }}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.55rem', color: 'var(--primary)', fontWeight: 700 }}>
                    <FileText size={18} /> {resource.fileExtension || 'File'}
                  </div>
                  <div>
                    <h2 style={{ fontSize: '1.1rem', marginBottom: '0.4rem' }}>{resource.title}</h2>
                    <p className="muted line-clamp-3">{resource.description}</p>
                  </div>
                  <div className="muted" style={{ display: 'grid', gap: '0.3rem', fontSize: '0.92rem' }}>
                    <span>Tên file: {resource.fileName}</span>
                    <span>Dung lượng: {formatBytes(resource.fileSize)}</span>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}><User size={15} /> {resource.instructorName}</span>
                    <span>{resource.courseTitle || 'Tài liệu dùng chung'}</span>
                  </div>
                  {fileUrl ? (
                    <a href={fileUrl} target="_blank" rel="noreferrer" className="btn btn-primary" style={{ width: '100%' }}>
                      <Download size={16} /> Tải xuống
                    </a>
                  ) : null}
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};
