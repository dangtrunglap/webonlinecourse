export const SITE_URL = 'https://ghtxdbk.com';
export const SITE_NAME = 'GHTXDBK';
export const SITE_TITLE = 'GHTXDBK - Góc Học Tập Xây Dựng Bách Khoa';
export const DEFAULT_OG_IMAGE = `${SITE_URL}/asset/GHTXDBK-Icon.png`;
export const FACEBOOK_URL = 'https://www.facebook.com/civil.engineer.bk/';

export const SITE_DESCRIPTION =
  'GHTXDBK là nền tảng học tập xây dựng thực chiến với khóa học, tài liệu, blog chuyên môn và công cụ dành cho sinh viên, kỹ sư trẻ.';

export const TOPIC_CLUSTERS = [
  'Revit cho sinh viên xây dựng',
  'ETABS và tư duy mô hình kết cấu',
  'Đồ án, tiêu chuẩn TCVN và hồ sơ thực hành',
  'Tài liệu, checklist và công cụ hỗ trợ học tập',
];

export const defaultOrganizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: SITE_NAME,
  url: SITE_URL,
  logo: DEFAULT_OG_IMAGE,
  sameAs: [FACEBOOK_URL],
  description: SITE_DESCRIPTION,
};

export const defaultWebsiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: SITE_NAME,
  url: SITE_URL,
  inLanguage: 'vi-VN',
};
