import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router';
import { AuthProvider } from './contexts/AuthContext';
import { AppRoutes } from './AppRoutes';
import { DEFAULT_OG_IMAGE, SITE_DESCRIPTION, SITE_NAME, SITE_URL } from './constants/site';

type HeadMetadata = {
  title: string;
  description: string;
  canonical: string;
  image?: string;
};

const routeHead: Record<string, HeadMetadata> = {
  '/': {
    title: `${SITE_NAME} | Khóa học xây dựng, tài liệu và blog thực chiến`,
    description: SITE_DESCRIPTION,
    canonical: `${SITE_URL}/`,
  },
  '/blog': {
    title: `Blog chuyên môn | ${SITE_NAME}`,
    description: 'Tổng hợp bài viết chuyên môn, kinh nghiệm đồ án và chia sẻ thực chiến từ đội ngũ GHTXDBK.',
    canonical: `${SITE_URL}/blog`,
  },
  '/resources': {
    title: `Thư viện tài liệu | ${SITE_NAME}`,
    description: 'File bài tập, tài liệu hướng dẫn, checklist và biểu mẫu được GHTXDBK chia sẻ trực tiếp trên nền tảng.',
    canonical: `${SITE_URL}/resources`,
  },
  '/tools': {
    title: `Công cụ | ${SITE_NAME}`,
    description: 'Theo dõi phiên bản mới nhất của ứng dụng, xem ghi chú cập nhật và tải file cài đặt hoặc gói nén trực tiếp từ nền tảng.',
    canonical: `${SITE_URL}/tools`,
  },
  '/about': {
    title: `Giới thiệu | ${SITE_NAME}`,
    description: 'Tìm hiểu GHTXDBK là gì, đang đào tạo chủ đề nào và đội ngũ đang xuất bản nội dung trên nền tảng.',
    canonical: `${SITE_URL}/about`,
  },
  '/contact': {
    title: `Liên hệ | ${SITE_NAME}`,
    description: 'Liên hệ GHTXDBK để được tư vấn khóa học, tài liệu, hỗ trợ đăng ký và giải đáp trước khi mua.',
    canonical: `${SITE_URL}/contact`,
  },
  '/faq': {
    title: `FAQ | ${SITE_NAME}`,
    description: 'Giải đáp các câu hỏi thường gặp về khóa học, tài liệu, cách đăng ký và phạm vi nội dung của GHTXDBK.',
    canonical: `${SITE_URL}/faq`,
  },
  '/policies': {
    title: `Chính sách và điều khoản | ${SITE_NAME}`,
    description: 'Tổng hợp điều khoản sử dụng, nguyên tắc thanh toán, quyền truy cập nội dung và định hướng bảo mật thông tin trên GHTXDBK.',
    canonical: `${SITE_URL}/policies`,
  },
};

const apiBaseUrl = `${SITE_URL}/api`;

const toAbsoluteMediaUrl = (value?: string | null) => {
  if (!value) return undefined;
  if (value.startsWith('http://') || value.startsWith('https://')) return value;
  return `${SITE_URL}${value.startsWith('/') ? value : `/${value}`}`;
};

const trimText = (value: string | undefined, maxLength = 180) => {
  if (!value) return SITE_DESCRIPTION;
  return value.length > maxLength ? `${value.slice(0, maxLength - 1).trim()}…` : value;
};

const loadDynamicMetadata = async (url: string): Promise<HeadMetadata | null> => {
  if (url.startsWith('/courses/')) {
    const id = url.replace('/courses/', '').replace(/\/$/, '');
    const response = await fetch(`${apiBaseUrl}/courses/${id}`);
    if (!response.ok) return null;
    const course = await response.json() as {
      id: string;
      title: string;
      description: string;
      thumbnailUrl?: string | null;
    };

    return {
      title: `${course.title} | ${SITE_NAME}`,
      description: trimText(course.description),
      canonical: `${SITE_URL}/courses/${course.id}`,
      image: toAbsoluteMediaUrl(course.thumbnailUrl) ?? DEFAULT_OG_IMAGE,
    };
  }

  if (url.startsWith('/blog/')) {
    const id = url.replace('/blog/', '').replace(/\/$/, '');
    const response = await fetch(`${apiBaseUrl}/blogposts/${id}`);
    if (!response.ok) return null;
    const post = await response.json() as {
      id: string;
      title: string;
      summary: string;
      coverImageUrl?: string | null;
    };

    return {
      title: `${post.title} | ${SITE_NAME}`,
      description: trimText(post.summary),
      canonical: `${SITE_URL}/blog/${post.id}`,
      image: toAbsoluteMediaUrl(post.coverImageUrl) ?? DEFAULT_OG_IMAGE,
    };
  }

  return null;
};

export async function prerender({ url }: { url: string }) {
  const metadata = (await loadDynamicMetadata(url)) ?? routeHead[url] ?? routeHead['/'];
  const html = renderToString(
    <AuthProvider>
      <StaticRouter location={url}>
        <AppRoutes />
      </StaticRouter>
    </AuthProvider>,
  );

  return {
    html,
    head: {
      lang: 'vi',
      title: metadata.title,
      elements: new Set([
        { type: 'meta', props: { name: 'description', content: metadata.description } },
        { type: 'meta', props: { property: 'og:title', content: metadata.title } },
        { type: 'meta', props: { property: 'og:description', content: metadata.description } },
        { type: 'meta', props: { property: 'og:url', content: metadata.canonical } },
        { type: 'meta', props: { property: 'og:image', content: metadata.image ?? DEFAULT_OG_IMAGE } },
        { type: 'meta', props: { name: 'twitter:title', content: metadata.title } },
        { type: 'meta', props: { name: 'twitter:description', content: metadata.description } },
        { type: 'meta', props: { name: 'twitter:image', content: metadata.image ?? DEFAULT_OG_IMAGE } },
        { type: 'link', props: { rel: 'canonical', href: metadata.canonical } },
      ]),
    },
  };
}
