import React, { useEffect, useMemo, useState } from 'react';
import { Award, BookOpenCheck, Building2, GraduationCap, Users } from 'lucide-react';
import { Seo } from '../components/Seo';
import {
  FACEBOOK_URL,
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_URL,
  defaultOrganizationSchema,
  defaultWebsiteSchema,
} from '../constants/site';
import api from '../services/api';
import type { BlogPost } from '../types/content';

interface CourseSummary {
  id: string;
  title: string;
  instructorName: string;
}

const values = [
  {
    icon: Building2,
    title: 'Học để làm được việc',
    description: 'Nội dung được tổ chức theo nhóm kỹ năng mà sinh viên xây dựng và kỹ sư trẻ thường gặp trong môn học, đồ án và giai đoạn đi làm đầu tiên.',
  },
  {
    icon: BookOpenCheck,
    title: 'Bám sát tài liệu và thực hành',
    description: 'Khóa học được đi kèm bài viết hướng dẫn, tài liệu tham khảo và công cụ hỗ trợ để người học không bị đứt mạch giữa lý thuyết và thực hành.',
  },
  {
    icon: Award,
    title: 'Ưu tiên tính ứng dụng',
    description: 'Các chủ đề trọng tâm xoay quanh Revit, ETABS, đồ án, tiêu chuẩn và kỹ năng triển khai công việc học thuật lẫn bán chuyên nghiệp.',
  },
];

export const AboutPage: React.FC = () => {
  const [courses, setCourses] = useState<CourseSummary[]>([]);
  const [posts, setPosts] = useState<BlogPost[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [coursesResponse, postsResponse] = await Promise.all([
          api.get('/courses?page=1&pageSize=12'),
          api.get('/blogposts'),
        ]);
        setCourses(coursesResponse.data.items ?? []);
        setPosts(postsResponse.data ?? []);
      } catch (error) {
        console.error('Failed to load about page data', error);
      }
    };

    void fetchData();
  }, []);

  const creators = useMemo(() => {
    const map = new Map<string, { name: string; topics: string[] }>();

    for (const course of courses) {
      const current = map.get(course.instructorName) ?? { name: course.instructorName, topics: [] };
      current.topics.push(course.title);
      map.set(course.instructorName, current);
    }

    for (const post of posts) {
      const current = map.get(post.instructorName) ?? { name: post.instructorName, topics: [] };
      if (post.courseTitle) {
        current.topics.push(post.courseTitle);
      }
      map.set(post.instructorName, current);
    }

    return Array.from(map.values()).map((item) => ({
      ...item,
      topics: Array.from(new Set(item.topics)).slice(0, 3),
    }));
  }, [courses, posts]);

  return (
    <div className="container reveal">
      <Seo
        title={`Giới thiệu | ${SITE_NAME}`}
        description="Tìm hiểu GHTXDBK là gì, đang đào tạo chủ đề nào và đội ngũ đang xuất bản nội dung trên nền tảng."
        path="/about"
        keywords={['gioi thieu GHTXDBK', 'doi ngu xay dung', 'hoc Revit ETABS']}
        jsonLd={[
          defaultOrganizationSchema,
          defaultWebsiteSchema,
          {
            '@context': 'https://schema.org',
            '@type': 'AboutPage',
            name: `Giới thiệu ${SITE_NAME}`,
            url: `${SITE_URL}/about`,
            description: SITE_DESCRIPTION,
          },
        ]}
      />

      <section className="hero">
        <h1 className="hero-title">GHTXDBK là gì?</h1>
        <p className="hero-subtitle">
          GHTXDBK là nền tảng học tập xây dựng tập trung vào khóa học, tài liệu, bài viết hướng dẫn và công cụ hỗ trợ
          dành cho sinh viên, người làm đồ án và kỹ sư trẻ cần một lộ trình học thực tế hơn.
        </p>
        <div className="hero-actions">
          <a href={FACEBOOK_URL} className="btn btn-primary" target="_blank" rel="noreferrer">
            Nhận tư vấn qua Facebook
          </a>
          <a href="/" className="btn btn-secondary">Xem hệ sinh thái nội dung</a>
        </div>
      </section>

      <section className="section">
        <h2 className="section-title">Định hướng nội dung</h2>
        <p className="section-subtitle">
          Website được tổ chức để Google và người học cùng hiểu rõ GHTXDBK đang cung cấp gì và phù hợp với ai.
        </p>
        <div className="grid grid-3">
          {values.map((value) => {
            const Icon = value.icon;
            return (
              <article key={value.title} className="card info-card">
                <Icon color="var(--accent)" />
                <h3>{value.title}</h3>
                <p>{value.description}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="section">
        <h2 className="section-title">Đội ngũ đang xuất bản nội dung</h2>
        <p className="section-subtitle">
          Đây là các tên đang xuất hiện trên nội dung hiện có của nền tảng. Hồ sơ chi tiết có thể tiếp tục được cập nhật ở bước sau.
        </p>

        {creators.length === 0 ? (
          <div className="card" style={{ padding: '1.2rem', textAlign: 'center' }}>
            Thông tin đội ngũ đang được đồng bộ từ dữ liệu khóa học và blog.
          </div>
        ) : (
          <div className="grid grid-3">
            {creators.map((creator) => (
              <article key={creator.name} className="card" style={{ padding: '1.1rem', display: 'grid', gap: '0.8rem' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)', fontWeight: 700 }}>
                  <GraduationCap size={18} /> {creator.name}
                </div>
                <p className="muted">
                  Đang xuất bản nội dung liên quan đến các chủ đề học tập và triển khai kỹ thuật trên GHTXDBK.
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.55rem' }}>
                  {creator.topics.length === 0 ? (
                    <span className="topic-chip">Chủ đề đang cập nhật</span>
                  ) : (
                    creator.topics.map((topic) => (
                      <span key={topic} className="topic-chip">{topic}</span>
                    ))
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="section">
        <div className="grid grid-3">
          <article className="card" style={{ padding: '1.2rem' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', color: 'var(--primary)', fontWeight: 700, marginBottom: '0.7rem' }}>
              <Users size={18} /> Dành cho ai
            </div>
            <p className="muted">
              Sinh viên xây dựng, người đang làm đồ án, người mới học phần mềm chuyên ngành và kỹ sư trẻ cần tài liệu, quy trình và ví dụ dễ áp dụng.
            </p>
          </article>
          <article className="card" style={{ padding: '1.2rem' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', color: 'var(--primary)', fontWeight: 700, marginBottom: '0.7rem' }}>
              <BookOpenCheck size={18} /> Đang có gì trên site
            </div>
            <p className="muted">
              Khóa học, bài viết hướng dẫn, thư viện tài liệu và các gói công cụ hoặc file hỗ trợ học tập theo từng nhóm chủ đề chuyên ngành.
            </p>
          </article>
          <article className="card" style={{ padding: '1.2rem' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', color: 'var(--primary)', fontWeight: 700, marginBottom: '0.7rem' }}>
              <Award size={18} /> Cam kết nội dung
            </div>
            <p className="muted">
              Nội dung trên website được xây theo hướng học để ứng dụng, có liên kết nội bộ giữa khóa học, blog và tài liệu để giảm cảm giác học rời rạc.
            </p>
          </article>
        </div>
      </section>
    </div>
  );
};
