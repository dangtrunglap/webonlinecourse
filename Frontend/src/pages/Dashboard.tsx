import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { FileArchive, FileText, PenSquare, Plus, ShieldCheck, Trash, Upload } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { RichTextEditor } from '../components/RichTextEditor';
import api from '../services/api';
import type { BlogPost, ResourceFile, ToolRelease } from '../types/content';
import { formatVnd } from '../utils/currency';
import { sanitizeBlogHtml } from '../utils/blogHtml';
import { getMediaUrl } from '../utils/media';

interface Course {
  id: string;
  title: string;
  price: number;
  instructorName?: string;
  thumbnailUrl?: string | null;
}

const allowedToolExtensions = ['.exe', '.rar', '.zip'];
const allowedBlogImageExtensions = ['.jpg', '.jpeg', '.png', '.webp'];

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

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [resources, setResources] = useState<ResourceFile[]>([]);
  const [toolReleases, setToolReleases] = useState<ToolRelease[]>([]);
  const [loading, setLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('0');

  const [editingBlogId, setEditingBlogId] = useState<string | null>(null);
  const [blogTitle, setBlogTitle] = useState('');
  const [blogSummary, setBlogSummary] = useState('');
  const [blogContent, setBlogContent] = useState('');
  const [blogCourseId, setBlogCourseId] = useState('');
  const [featuredBlog, setFeaturedBlog] = useState(false);
  const [blogCoverFile, setBlogCoverFile] = useState<File | null>(null);
  const [blogCoverInputKey, setBlogCoverInputKey] = useState(0);
  const [blogCoverPreview, setBlogCoverPreview] = useState<string | null>(null);
  const [blogExistingCoverUrl, setBlogExistingCoverUrl] = useState<string | null>(null);
  const [removeBlogCover, setRemoveBlogCover] = useState(false);

  const [resourceTitle, setResourceTitle] = useState('');
  const [resourceDescription, setResourceDescription] = useState('');
  const [resourceCourseId, setResourceCourseId] = useState('');
  const [resourceFile, setResourceFile] = useState<File | null>(null);
  const [resourceInputKey, setResourceInputKey] = useState(0);

  const [toolAppName, setToolAppName] = useState('');
  const [toolVersion, setToolVersion] = useState('');
  const [toolReleaseNotes, setToolReleaseNotes] = useState('');
  const [toolFile, setToolFile] = useState<File | null>(null);
  const [toolMarkAsLatest, setToolMarkAsLatest] = useState(true);
  const [toolInputKey, setToolInputKey] = useState(0);
  const [toolFileError, setToolFileError] = useState('');

  const canManageTools = user?.role === 'Instructor' || user?.role === 'Admin';

  useEffect(() => {
    void fetchDashboardData();
  }, [user?.id, user?.role]);

  useEffect(() => {
    if (!blogCoverFile) {
      setBlogCoverPreview(null);
      return;
    }

    const objectUrl = URL.createObjectURL(blogCoverFile);
    setBlogCoverPreview(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [blogCoverFile]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const toolsUrl = user?.role === 'Instructor' && user.id
        ? `/tools?uploadedById=${encodeURIComponent(user.id)}`
        : '/tools';

      const [coursesResponse, blogsResponse, resourcesResponse, toolsResponse] = await Promise.all([
        api.get('/courses?pageSize=50'),
        api.get('/blogposts'),
        api.get('/resources'),
        api.get(toolsUrl),
      ]);

      setCourses(coursesResponse.data.items ?? []);
      setBlogs(blogsResponse.data ?? []);
      setResources(resourcesResponse.data ?? []);
      setToolReleases(toolsResponse.data ?? []);
    } catch (err) {
      console.error(err);
      setErrorMessage('Không thể tải dữ liệu quản trị.');
    } finally {
      setLoading(false);
    }
  };

  const filteredCourses = useMemo(() => {
    if (user?.role === 'Admin') return courses;
    return courses.filter((course) => !course.instructorName || course.instructorName === user?.name);
  }, [courses, user?.name, user?.role]);

  const filteredBlogs = useMemo(() => {
    if (user?.role === 'Admin') return blogs;
    return blogs.filter((blog) => blog.instructorName === user?.name);
  }, [blogs, user?.name, user?.role]);

  const filteredResources = useMemo(() => {
    if (user?.role === 'Admin') return resources;
    return resources.filter((resource) => resource.instructorName === user?.name);
  }, [resources, user?.name, user?.role]);

  const filteredToolReleases = useMemo(() => {
    if (user?.role === 'Admin') return toolReleases;
    if (user?.id) return toolReleases.filter((release) => release.uploadedById === user.id);
    return toolReleases.filter((release) => release.uploadedByName === user?.name);
  }, [toolReleases, user?.id, user?.name, user?.role]);

  const resetMessages = () => {
    setSuccessMessage('');
    setErrorMessage('');
    setToolFileError('');
  };

  const resetBlogForm = () => {
    setEditingBlogId(null);
    setBlogTitle('');
    setBlogSummary('');
    setBlogContent('');
    setBlogCourseId('');
    setFeaturedBlog(false);
    setBlogCoverFile(null);
    setBlogCoverInputKey((value) => value + 1);
    setBlogExistingCoverUrl(null);
    setRemoveBlogCover(false);
  };

  const buildBlogFormData = () => {
    const formData = new FormData();
    formData.append('title', blogTitle);
    formData.append('summary', blogSummary);
    formData.append('content', sanitizeBlogHtml(blogContent));
    formData.append('featured', String(featuredBlog));
    formData.append('removeCoverImage', String(removeBlogCover && !blogCoverFile));

    if (blogCourseId) {
      formData.append('courseId', blogCourseId);
    }

    if (blogCoverFile) {
      formData.append('coverImage', blogCoverFile);
    }

    return formData;
  };
  const uploadInlineBlogImage = async (file: File) => {
    const lowerName = file.name.toLowerCase();
    const isAllowed = allowedBlogImageExtensions.some((extension) => lowerName.endsWith(extension));
    if (!isAllowed) {
      throw new Error('Ảnh trong bài chỉ hỗ trợ .jpg, .jpeg, .png hoặc .webp.');
    }

    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/blogposts/images', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    const url = response.data?.url as string | undefined;
    if (!url) {
      throw new Error('Không nhận được đường dẫn ảnh sau khi tải lên.');
    }

    return getMediaUrl(url) ?? url;
  };

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    resetMessages();

    try {
      await api.post('/courses', { title, description, price: Number(price) || 0 });
      setTitle('');
      setDescription('');
      setPrice('0');
      setSuccessMessage('Tạo khóa học thành công.');
      void fetchDashboardData();
    } catch {
      setErrorMessage('Tạo khóa học thất bại.');
    }
  };

  const handleSubmitBlog = async (e: React.FormEvent) => {
    e.preventDefault();
    resetMessages();

    try {
      const formData = buildBlogFormData();

      if (editingBlogId) {
        try {
          await api.put(`/blogposts/${editingBlogId}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });
        } catch (updateError: any) {
          if (updateError?.response?.status !== 405) {
            throw updateError;
          }

          await api.post(`/blogposts/${editingBlogId}/update`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });
        }

        setSuccessMessage('Cập nhật blog thành công.');
      } else {
        await api.post('/blogposts', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        setSuccessMessage('Đăng bài blog thành công.');
      }

      resetBlogForm();
      void fetchDashboardData();
    } catch (err: any) {
      setErrorMessage(err.response?.data?.message || err.response?.data?.Message || err.message || 'Lưu blog thất bại.');
    }
  };

  const handleEditBlog = (blog: BlogPost) => {
    resetMessages();
    setEditingBlogId(blog.id);
    setBlogTitle(blog.title);
    setBlogSummary(blog.summary);
    setBlogContent(blog.content);
    setBlogCourseId(blog.courseId ?? '');
    setFeaturedBlog(blog.featured);
    setBlogCoverFile(null);
    setBlogCoverInputKey((value) => value + 1);
    setBlogExistingCoverUrl(getMediaUrl(blog.coverImageUrl) ?? null);
    setRemoveBlogCover(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBlogCoverChange = (file: File | null) => {
    if (!file) {
      setBlogCoverFile(null);
      return;
    }

    const lowerName = file.name.toLowerCase();
    const isAllowed = allowedBlogImageExtensions.some((extension) => lowerName.endsWith(extension));
    if (!isAllowed) {
      setErrorMessage('Ảnh blog chỉ hỗ trợ .jpg, .jpeg, .png hoặc .webp.');
      setBlogCoverInputKey((value) => value + 1);
      return;
    }

    resetMessages();
    setBlogCoverFile(file);
    setRemoveBlogCover(false);
  };

  const handleCreateResource = async (e: React.FormEvent) => {
    e.preventDefault();
    resetMessages();

    if (!resourceFile) {
      setErrorMessage('Vui lòng chọn file tài liệu.');
      return;
    }

    const formData = new FormData();
    formData.append('title', resourceTitle);
    formData.append('description', resourceDescription);
    if (resourceCourseId) {
      formData.append('courseId', resourceCourseId);
    }
    formData.append('file', resourceFile);

    try {
      await api.post('/resources', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setResourceTitle('');
      setResourceDescription('');
      setResourceCourseId('');
      setResourceFile(null);
      setResourceInputKey((value) => value + 1);
      setSuccessMessage('Chia sẻ tài liệu thành công.');
      void fetchDashboardData();
    } catch (err: any) {
      setErrorMessage(err.response?.data?.message || err.response?.data?.Message || 'Tải tài liệu thất bại.');
    }
  };

  const handleCreateToolRelease = async (e: React.FormEvent) => {
    e.preventDefault();
    resetMessages();

    if (!toolFile) {
      setToolFileError('Vui lòng chọn file .exe, .rar hoặc .zip từ máy local.');
      setErrorMessage('Vui lòng chọn file .exe, .rar hoặc .zip từ máy local.');
      return;
    }

    const lowerFileName = toolFile.name.toLowerCase();
    const isAllowedFile = allowedToolExtensions.some((extension) => lowerFileName.endsWith(extension));
    if (!isAllowedFile) {
      setToolFileError(`File "${toolFile.name}" không hợp lệ. Hãy chọn .exe, .rar hoặc .zip.`);
      setErrorMessage('Mục Công cụ chỉ hỗ trợ file .exe, .rar hoặc .zip.');
      return;
    }

    const formData = new FormData();
    formData.append('appName', toolAppName);
    formData.append('version', toolVersion);
    formData.append('releaseNotes', toolReleaseNotes);
    formData.append('markAsLatest', String(toolMarkAsLatest));
    formData.append('file', toolFile);

    try {
      await api.post('/tools', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setToolAppName('');
      setToolVersion('');
      setToolReleaseNotes('');
      setToolFile(null);
      setToolMarkAsLatest(true);
      setToolInputKey((value) => value + 1);
      setSuccessMessage('Đã tải app lên thành công.');
      void fetchDashboardData();
    } catch (err: any) {
      const status = err.response?.status;
      const message = status === 413
        ? 'File vượt quá giới hạn upload của server. Hiện tại hãy dùng file nhỏ hơn 250 MB.'
        : err.response?.data?.message || err.response?.data?.Message || 'Tải app thất bại.';
      setErrorMessage(message);
    }
  };

  const handleDeleteCourse = async (id: string) => {
    if (!window.confirm('Bạn có chắc muốn xóa khóa học này?')) return;
    resetMessages();

    try {
      await api.delete(`/courses/${id}`);
      setSuccessMessage('Đã xóa khóa học.');
      void fetchDashboardData();
    } catch {
      setErrorMessage('Xóa khóa học thất bại.');
    }
  };

  const handleDeleteBlog = async (id: string) => {
    if (!window.confirm('Bạn có chắc muốn xóa bài blog này?')) return;
    resetMessages();

    try {
      await api.delete(`/blogposts/${id}`);
      if (editingBlogId === id) {
        resetBlogForm();
      }
      setSuccessMessage('Đã xóa bài blog.');
      void fetchDashboardData();
    } catch {
      setErrorMessage('Xóa bài blog thất bại.');
    }
  };

  const handleDeleteResource = async (id: string) => {
    if (!window.confirm('Bạn có chắc muốn xóa tài liệu này?')) return;
    resetMessages();

    try {
      await api.delete(`/resources/${id}`);
      setSuccessMessage('Đã xóa tài liệu.');
      void fetchDashboardData();
    } catch {
      setErrorMessage('Xóa tài liệu thất bại.');
    }
  };

  const handleDeleteToolRelease = async (id: string) => {
    if (!window.confirm('Bạn có chắc muốn xóa bản phát hành này?')) return;
    resetMessages();

    try {
      await api.delete(`/tools/${id}`);
      setSuccessMessage('Đã xóa bản phát hành công cụ.');
      void fetchDashboardData();
    } catch {
      setErrorMessage('Xóa bản phát hành thất bại.');
    }
  };

  const handleThumbnailUpload = async (id: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    resetMessages();

    try {
      await api.post(`/courses/${id}/thumbnail`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setSuccessMessage('Tải ảnh đại diện thành công.');
      void fetchDashboardData();
    } catch (err: any) {
      const message = err.response?.data?.message || err.response?.data?.Message || 'Tải ảnh đại diện thất bại.';
      setErrorMessage(message);
    }
  };

  const blogPreviewImage = !removeBlogCover ? (blogCoverPreview || blogExistingCoverUrl) : null;
  return (
    <div className="container reveal" style={{ display: 'grid', gap: '1.5rem' }}>
      {successMessage ? <div className="alert alert-success">{successMessage}</div> : null}
      {errorMessage ? <div className="alert alert-error">{errorMessage}</div> : null}

      <section className="hero" style={{ padding: '2.2rem 1.5rem' }}>
        <h1 className="hero-title" style={{ fontSize: 'clamp(1.7rem, 4vw, 2.4rem)' }}>
          {user?.role === 'Admin' ? 'Bảng điều khiển quản trị' : 'Bảng điều khiển nội dung'}
        </h1>
        <p className="hero-subtitle">
          Quản lý khóa học, viết blog chuyên môn, chia sẻ tài liệu và phát hành app hoặc gói cài đặt cho người dùng ngay trong một nơi.
        </p>
      </section>

      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', alignItems: 'start' }}>
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
              <label>Giá (VND)</label>
              <input type="number" step="1000" min="0" value={price} onChange={(e) => setPrice(e.target.value)} required />
            </div>
            <button type="submit" className="btn btn-primary">Tạo khóa học</button>
          </form>
        </section>

        <section className="card" style={{ padding: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.75rem', alignItems: 'center', marginBottom: '0.9rem', flexWrap: 'wrap' }}>
            <h2 style={{ fontSize: '1.2rem', display: 'inline-flex', gap: '0.4rem', alignItems: 'center', margin: 0 }}>
              <PenSquare size={18} /> {editingBlogId ? 'Chỉnh sửa blog' : 'Viết blog'}
            </h2>
            {editingBlogId ? (
              <button type="button" className="btn btn-secondary" onClick={resetBlogForm}>Tạo bài mới</button>
            ) : null}
          </div>

          <form onSubmit={handleSubmitBlog} className="form-grid">
            <div className="field">
              <label>Tiêu đề bài viết</label>
              <input type="text" value={blogTitle} onChange={(e) => setBlogTitle(e.target.value)} required />
            </div>
            <div className="field">
              <label>Tóm tắt</label>
              <textarea rows={3} value={blogSummary} onChange={(e) => setBlogSummary(e.target.value)} required />
            </div>

            <RichTextEditor
              label="Nội dung"
              value={blogContent}
              onChange={setBlogContent}
              onUploadImage={uploadInlineBlogImage}
              placeholder="Viết bài blog, chèn ảnh giữa nội dung, thêm tiêu đề phụ, danh sách..."
            />

            <div className="field">
              <label>Gắn với khóa học (tùy chọn)</label>
              <select value={blogCourseId} onChange={(e) => setBlogCourseId(e.target.value)}>
                <option value="">Bài viết dùng chung</option>
                {filteredCourses.map((course) => (
                  <option key={course.id} value={course.id}>{course.title}</option>
                ))}
              </select>
            </div>
            <div className="field">
              <label>Ảnh bìa blog</label>
              <input
                key={blogCoverInputKey}
                type="file"
                accept=".jpg,.jpeg,.png,.webp"
                onChange={(e) => handleBlogCoverChange(e.target.files?.[0] ?? null)}
              />
              <p className="muted" style={{ fontSize: '0.88rem' }}>
                Hỗ trợ ảnh `.jpg`, `.jpeg`, `.png`, `.webp`. Bạn có thể thay ảnh cũ ngay cả khi bài đã public.
              </p>
            </div>

            {blogPreviewImage ? (
              <div className="field">
                <label>Xem trước ảnh bìa</label>
                <img
                  src={blogPreviewImage}
                  alt="Ảnh bìa blog"
                  style={{ width: '100%', maxHeight: '220px', objectFit: 'cover', borderRadius: '14px', border: '1px solid var(--border)' }}
                />
              </div>
            ) : null}

            {blogExistingCoverUrl ? (
              <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.55rem' }}>
                <input
                  type="checkbox"
                  checked={removeBlogCover}
                  onChange={(e) => setRemoveBlogCover(e.target.checked)}
                />
                Gỡ ảnh bìa hiện tại
              </label>
            ) : null}

            <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.55rem' }}>
              <input type="checkbox" checked={featuredBlog} onChange={(e) => setFeaturedBlog(e.target.checked)} />
              Đánh dấu bài nổi bật
            </label>

            <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
              <button type="submit" className="btn btn-primary">
                {editingBlogId ? 'Lưu chỉnh sửa' : 'Đăng bài'}
              </button>
              {editingBlogId ? (
                <button type="button" className="btn btn-secondary" onClick={resetBlogForm}>Hủy chỉnh sửa</button>
              ) : null}
            </div>
          </form>
        </section>
        <section className="card" style={{ padding: '1rem' }}>
          <h2 style={{ fontSize: '1.2rem', marginBottom: '0.9rem', display: 'inline-flex', gap: '0.4rem', alignItems: 'center' }}>
            <FileText size={18} /> Chia sẻ tài liệu
          </h2>
          <form onSubmit={handleCreateResource} className="form-grid">
            <div className="field">
              <label>Tên tài liệu</label>
              <input type="text" value={resourceTitle} onChange={(e) => setResourceTitle(e.target.value)} required />
            </div>
            <div className="field">
              <label>Mô tả ngắn</label>
              <textarea rows={3} value={resourceDescription} onChange={(e) => setResourceDescription(e.target.value)} required />
            </div>
            <div className="field">
              <label>Gắn với khóa học (tùy chọn)</label>
              <select value={resourceCourseId} onChange={(e) => setResourceCourseId(e.target.value)}>
                <option value="">Tài liệu dùng chung</option>
                {filteredCourses.map((course) => (
                  <option key={course.id} value={course.id}>{course.title}</option>
                ))}
              </select>
            </div>
            <div className="field">
              <label>Chọn file</label>
              <input key={resourceInputKey} type="file" onChange={(e) => setResourceFile(e.target.files?.[0] ?? null)} required />
            </div>
            <button type="submit" className="btn btn-primary">Tải lên tài liệu</button>
          </form>
        </section>

        {canManageTools ? (
          <section className="card" style={{ padding: '1rem' }}>
            <h2 style={{ fontSize: '1.2rem', marginBottom: '0.9rem', display: 'inline-flex', gap: '0.4rem', alignItems: 'center' }}>
              <FileArchive size={18} /> Phát hành công cụ
            </h2>
            <form onSubmit={handleCreateToolRelease} className="form-grid">
              <div className="field">
                <label>Tên ứng dụng</label>
                <input type="text" value={toolAppName} onChange={(e) => setToolAppName(e.target.value)} placeholder="Ví dụ: GHTXDBK Desktop" required />
              </div>
              <div className="field">
                <label>Phiên bản</label>
                <input type="text" value={toolVersion} onChange={(e) => setToolVersion(e.target.value)} placeholder="Ví dụ: 1.2.0" required />
              </div>
              <div className="field">
                <label>Ghi chú cập nhật</label>
                <textarea rows={5} value={toolReleaseNotes} onChange={(e) => setToolReleaseNotes(e.target.value)} placeholder="Mô tả điểm mới, sửa lỗi, hướng dẫn cài đặt..." required />
              </div>
              <div className="field">
                <label>Chọn app từ máy local</label>
                <input
                  key={toolInputKey}
                  type="file"
                  accept=".exe,.rar,.zip"
                  onChange={(e) => {
                    const file = e.target.files?.[0] ?? null;
                    setToolFile(file);
                    if (!file) {
                      setToolFileError('');
                      return;
                    }

                    const lowerFileName = file.name.toLowerCase();
                    const isAllowedFile = allowedToolExtensions.some((extension) => lowerFileName.endsWith(extension));
                    if (!isAllowedFile) {
                      setToolFileError(`Bạn đang chọn "${file.name}". Hãy chọn file .exe, .rar hoặc .zip.`);
                    } else {
                      setToolFileError('');
                    }
                  }}
                  required
                />
                <p className="muted" style={{ fontSize: '0.88rem' }}>
                  Hiện tại nhận file cài đặt hoặc gói nén định dạng `.exe`, `.rar`, `.zip`, tối đa 250 MB.
                </p>
                {toolFileError ? (
                  <div className="alert alert-error" style={{ marginBottom: 0 }}>
                    {toolFileError}
                  </div>
                ) : null}
              </div>
              <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.55rem' }}>
                <input type="checkbox" checked={toolMarkAsLatest} onChange={(e) => setToolMarkAsLatest(e.target.checked)} />
                <ShieldCheck size={16} /> Đặt làm bản mới nhất
              </label>
              <button type="submit" className="btn btn-primary">Tải app lên</button>
            </form>
          </section>
        ) : null}
      </div>

      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', alignItems: 'start' }}>
        <section className="card" style={{ padding: '1rem' }}>
          <h2 style={{ fontSize: '1.2rem', marginBottom: '0.9rem' }}>Khóa học của bạn</h2>
          {loading ? (
            <p className="muted">Đang tải danh sách khóa học...</p>
          ) : filteredCourses.length === 0 ? (
            <p className="muted">Chưa có khóa học nào.</p>
          ) : (
            <div className="form-grid">
              {filteredCourses.map((course) => {
                const image = getMediaUrl(course.thumbnailUrl);
                return (
                  <article key={course.id} className="card" style={{ padding: '0.85rem', display: 'grid', gap: '0.8rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.8rem' }}>
                      <div>
                        <h3 style={{ fontSize: '1rem' }}>{course.title}</h3>
                        <p className="muted">{formatVnd(course.price)}</p>
                      </div>
                      {image ? <img src={image} alt={course.title} style={{ width: '72px', height: '52px', objectFit: 'cover', borderRadius: '10px' }} /> : null}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexWrap: 'wrap' }}>
                      <label className="btn btn-secondary" style={{ padding: '0.52rem' }} title="Tải ảnh đại diện">
                        <Upload size={16} />
                        <input
                          type="file"
                          style={{ display: 'none' }}
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) void handleThumbnailUpload(course.id, file);
                          }}
                        />
                      </label>
                      <Link to={`/courses/${course.id}`} className="btn btn-secondary">Xem</Link>
                      <button type="button" className="btn btn-secondary" style={{ padding: '0.52rem', color: 'var(--danger)' }} onClick={() => void handleDeleteCourse(course.id)}>
                        <Trash size={16} />
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
        <section className="card" style={{ padding: '1rem' }}>
          <h2 style={{ fontSize: '1.2rem', marginBottom: '0.9rem' }}>Bài blog đã đăng</h2>
          {loading ? (
            <p className="muted">Đang tải bài blog...</p>
          ) : filteredBlogs.length === 0 ? (
            <p className="muted">Bạn chưa đăng bài blog nào.</p>
          ) : (
            <div className="form-grid">
              {filteredBlogs.map((blog) => {
                const coverImage = getMediaUrl(blog.coverImageUrl);

                return (
                  <article key={blog.id} className="card" style={{ padding: '0.9rem', display: 'grid', gap: '0.7rem' }}>
                    {coverImage ? (
                      <img
                        src={coverImage}
                        alt={blog.title}
                        style={{ width: '100%', height: '160px', objectFit: 'cover', borderRadius: '12px' }}
                      />
                    ) : null}
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.8rem' }}>
                      <div>
                        <h3 style={{ fontSize: '1rem' }}>{blog.title}</h3>
                        <p className="muted line-clamp-2">{blog.summary}</p>
                      </div>
                      {blog.featured ? <span className="btn btn-primary" style={{ padding: '0.35rem 0.65rem', cursor: 'default' }}>Nổi bật</span> : null}
                    </div>
                    <span className="muted" style={{ fontSize: '0.9rem' }}>{blog.courseTitle || 'Bài viết dùng chung'}</span>
                    <div style={{ display: 'flex', gap: '0.45rem', flexWrap: 'wrap' }}>
                      <button type="button" className="btn btn-secondary" onClick={() => handleEditBlog(blog)}>
                        <PenSquare size={16} /> Sửa
                      </button>
                      <Link to={`/blog/${blog.id}`} className="btn btn-secondary">Xem</Link>
                      <button type="button" className="btn btn-secondary" style={{ color: 'var(--danger)' }} onClick={() => void handleDeleteBlog(blog.id)}>
                        <Trash size={16} /> Xóa
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        <section className="card" style={{ padding: '1rem' }}>
          <h2 style={{ fontSize: '1.2rem', marginBottom: '0.9rem' }}>Tài liệu đã chia sẻ</h2>
          {loading ? (
            <p className="muted">Đang tải tài liệu...</p>
          ) : filteredResources.length === 0 ? (
            <p className="muted">Bạn chưa chia sẻ tài liệu nào.</p>
          ) : (
            <div className="form-grid">
              {filteredResources.map((resource) => (
                <article key={resource.id} className="card" style={{ padding: '0.9rem', display: 'grid', gap: '0.55rem' }}>
                  <div>
                    <h3 style={{ fontSize: '1rem' }}>{resource.title}</h3>
                    <p className="muted line-clamp-2">{resource.description}</p>
                  </div>
                  <span className="muted" style={{ fontSize: '0.9rem' }}>{resource.courseTitle || resource.fileName}</span>
                  <div style={{ display: 'flex', gap: '0.45rem', flexWrap: 'wrap' }}>
                    <a href={getMediaUrl(resource.fileUrl) ?? '#'} target="_blank" rel="noreferrer" className="btn btn-secondary">Mở file</a>
                    <button type="button" className="btn btn-secondary" style={{ color: 'var(--danger)' }} onClick={() => void handleDeleteResource(resource.id)}>
                      <Trash size={16} /> Xóa
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        {canManageTools ? (
          <section className="card" style={{ padding: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.8rem', alignItems: 'center', marginBottom: '0.9rem', flexWrap: 'wrap' }}>
              <h2 style={{ fontSize: '1.2rem' }}>
                {user?.role === 'Admin' ? 'Bản phát hành công cụ' : 'App bạn đã tải lên'}
              </h2>
              <Link to="/tools" className="btn btn-secondary">Xem trang công khai</Link>
            </div>

            {loading ? (
              <p className="muted">Đang tải bản phát hành...</p>
            ) : filteredToolReleases.length === 0 ? (
              <p className="muted">Chưa có bản phát hành nào.</p>
            ) : (
              <div className="form-grid">
                {filteredToolReleases.map((release) => (
                  <article key={release.id} className="card" style={{ padding: '0.9rem', display: 'grid', gap: '0.6rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.8rem', alignItems: 'start' }}>
                      <div>
                        <h3 style={{ fontSize: '1rem' }}>{release.appName}</h3>
                        <p className="muted">Version {release.version}</p>
                      </div>
                      {release.isLatest ? <span className="tool-badge">Latest</span> : null}
                    </div>

                    <div className="muted" style={{ display: 'grid', gap: '0.25rem', fontSize: '0.9rem' }}>
                      <span>{release.fileName}</span>
                      <span>{formatBytes(release.fileSize)} • {formatReleaseDate(release.publishedAt)}</span>
                    </div>

                    <div className="release-notes">{release.releaseNotes}</div>

                    <div style={{ display: 'flex', gap: '0.45rem', flexWrap: 'wrap' }}>
                      <a href={getMediaUrl(release.fileUrl) ?? '#'} target="_blank" rel="noreferrer" className="btn btn-secondary">Tải file</a>
                      <button type="button" className="btn btn-secondary" style={{ color: 'var(--danger)' }} onClick={() => void handleDeleteToolRelease(release.id)}>
                        <Trash size={16} /> Xóa
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        ) : null}
      </div>
    </div>
  );
};

