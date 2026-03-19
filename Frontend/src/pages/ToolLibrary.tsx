import React, { useEffect, useMemo, useState } from 'react';
import { Download, HardDriveDownload, MonitorSmartphone, PackageOpen, Search, Sparkles } from 'lucide-react';
import { Seo } from '../components/Seo';
import api from '../services/api';
import type { ToolRelease } from '../types/content';
import { getMediaUrl } from '../utils/media';
import { SITE_NAME, SITE_URL } from '../constants/site';

const formatBytes = (value: number) => {
  if (!value) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const index = Math.min(Math.floor(Math.log(value) / Math.log(1024)), units.length - 1);
  const size = value / Math.pow(1024, index);
  return `${size.toFixed(size >= 10 || index === 0 ? 0 : 1)} ${units[index]}`;
};

const formatReleaseDate = (value: string) => new Date(value).toLocaleDateString('vi-VN', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
});

export const ToolLibrary: React.FC = () => {
  const [releases, setReleases] = useState<ToolRelease[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReleases = async () => {
      setLoading(true);
      try {
        const { data } = await api.get('/tools');
        setReleases(data ?? []);
      } catch (error) {
        console.error('Failed to load tools', error);
      } finally {
        setLoading(false);
      }
    };

    void fetchReleases();
  }, []);

  const filteredReleases = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return releases;

    return releases.filter((release) =>
      [release.appName, release.version, release.releaseNotes, release.fileName, release.uploadedByName]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(keyword)),
    );
  }, [releases, search]);

  const latestRelease = filteredReleases.find((release) => release.isLatest) ?? filteredReleases[0];

  return (
    <div className="container reveal">
      <Seo
        title={`Công cụ | ${SITE_NAME}`}
        description="Theo dõi phiên bản mới nhất của ứng dụng, xem ghi chú cập nhật và tải file cài đặt hoặc gói nén trực tiếp từ nền tảng."
        path="/tools"
        keywords={['cong cu xay dung', 'app hoc xay dung', 'download cong cu Revit ETABS']}
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'CollectionPage',
          name: `Công cụ ${SITE_NAME}`,
          url: `${SITE_URL}/tools`,
        }}
      />

      <section className="hero">
        <h1 className="hero-title">Công cụ</h1>
        <p className="hero-subtitle">
          Theo dõi phiên bản mới nhất của ứng dụng Windows, xem ghi chú cập nhật và tải file `.exe`, `.rar` hoặc `.zip` trực tiếp từ nền tảng.
        </p>
        <div className="hero-actions">
          <span className="btn btn-secondary" style={{ cursor: 'default' }}>
            <MonitorSmartphone size={16} /> Windows app
          </span>
          <span className="btn btn-secondary" style={{ cursor: 'default' }}>
            <PackageOpen size={16} /> `.exe` `.rar` `.zip`
          </span>
          <span className="btn btn-secondary" style={{ cursor: 'default' }}>
            <Sparkles size={16} /> Theo dõi changelog
          </span>
        </div>
      </section>

      <section className="section">
        <div className="search-wrap" style={{ marginBottom: '1.4rem' }}>
          <Search className="search-icon" size={18} />
          <input
            type="text"
            placeholder="Tìm theo tên app, version, ghi chú cập nhật..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>

        {loading ? (
          <div className="card" style={{ padding: '2rem', textAlign: 'center' }}>Đang tải công cụ...</div>
        ) : filteredReleases.length === 0 ? (
          <div className="card" style={{ padding: '2rem', textAlign: 'center' }}>Chưa có bản phát hành nào.</div>
        ) : (
          <div style={{ display: 'grid', gap: '1.2rem' }}>
            {latestRelease ? (
              <article className="card" style={{ padding: '1.4rem', display: 'grid', gap: '1rem', borderColor: '#bfdbfe', background: 'linear-gradient(135deg, rgba(219, 234, 254, 0.5), rgba(255, 237, 213, 0.4))' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', alignItems: 'start', flexWrap: 'wrap' }}>
                  <div style={{ display: 'grid', gap: '0.5rem' }}>
                    <span className="btn btn-primary" style={{ width: 'fit-content', padding: '0.35rem 0.8rem', cursor: 'default' }}>
                      <HardDriveDownload size={16} /> Bản mới nhất
                    </span>
                    <div>
                      <h2 style={{ fontSize: '1.5rem', marginBottom: '0.3rem' }}>{latestRelease.appName}</h2>
                      <p className="muted">Version {latestRelease.version} • Cập nhật {formatReleaseDate(latestRelease.publishedAt)}</p>
                    </div>
                  </div>
                  <a href={getMediaUrl(latestRelease.fileUrl) ?? '#'} target="_blank" rel="noreferrer" className="btn btn-primary">
                    <Download size={16} /> Tải bản mới nhất
                  </a>
                </div>

                <div style={{ display: 'grid', gap: '0.5rem' }}>
                  <strong>Điểm mới</strong>
                  <div className="release-notes">{latestRelease.releaseNotes}</div>
                </div>
              </article>
            ) : null}

            <div className="grid grid-3">
              {filteredReleases.map((release) => {
                const fileUrl = getMediaUrl(release.fileUrl);

                return (
                  <article key={release.id} className="card" style={{ padding: '1.1rem', display: 'grid', gap: '0.9rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.8rem', alignItems: 'start' }}>
                      <div>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)', fontWeight: 700, marginBottom: '0.35rem' }}>
                          <HardDriveDownload size={18} /> {release.appName}
                        </div>
                        <h2 style={{ fontSize: '1.15rem' }}>Version {release.version}</h2>
                      </div>
                      {release.isLatest ? <span className="tool-badge">Latest</span> : null}
                    </div>

                    <div className="muted" style={{ display: 'grid', gap: '0.3rem', fontSize: '0.92rem' }}>
                      <span>File: {release.fileName}</span>
                      <span>Dung lượng: {formatBytes(release.fileSize)}</span>
                      <span>Người đăng: {release.uploadedByName}</span>
                      <span>Ngày phát hành: {formatReleaseDate(release.publishedAt)}</span>
                    </div>

                    <div style={{ display: 'grid', gap: '0.5rem' }}>
                      <strong>Ghi chú cập nhật</strong>
                      <div className="release-notes">{release.releaseNotes}</div>
                    </div>

                    {fileUrl ? (
                      <a href={fileUrl} target="_blank" rel="noreferrer" className="btn btn-primary" style={{ width: '100%' }}>
                        <Download size={16} /> Tải file
                      </a>
                    ) : null}
                  </article>
                );
              })}
            </div>
          </div>
        )}
      </section>
    </div>
  );
};
