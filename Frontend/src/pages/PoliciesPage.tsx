import React, { useState } from 'react';
import { ShieldCheck, FileText, CheckCircle2, Server, Lock, Cpu, UserCheck } from 'lucide-react';
import { Seo } from '../components/Seo';
import { SITE_NAME, SITE_URL } from '../constants/site';

export const PoliciesPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'privacy' | 'terms'>('privacy');

  return (
    <div className="container reveal">
      <Seo
        title={`Chính sách Bảo vệ Dữ liệu Cá nhân (NĐ 13/2023) & Điều khoản | ${SITE_NAME}`}
        description="Chính sách bảo vệ dữ liệu cá nhân theo Nghị định 13/2023/NĐ-CP và Điều khoản dịch vụ của GHTXDBK & NEXT Solution."
        path="/policies"
        keywords={['nghi dinh 13 2023', 'chinh sach bao ve du lieu', 'quyen rieng tu', 'dieu khoan GHTXDBK']}
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'WebPage',
          name: `Chính sách và điều khoản ${SITE_NAME}`,
          url: `${SITE_URL}/policies`,
        }}
      />

      <section className="hero">
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: 'rgba(30, 58, 138, 0.08)',
            color: 'var(--primary)',
            padding: '0.4rem 1rem',
            borderRadius: '999px',
            fontSize: '0.88rem',
            fontWeight: 700,
            marginBottom: '1rem',
          }}
        >
          <ShieldCheck size={18} /> Nghị định 13/2023/NĐ-CP về Bảo vệ dữ liệu cá nhân
        </div>
        <h1 className="hero-title">Chính sách & Điều khoản Dịch vụ</h1>
        <p className="hero-subtitle">
          GHTXDBK và NEXT Solution cam kết minh bạch tuyệt đối về quy trình thu thập, xử lý và bảo vệ dữ liệu cá nhân theo quy định của pháp luật Việt Nam.
        </p>

        {/* Tab switcher */}
        <div style={{ display: 'inline-flex', background: '#e2e8f0', borderRadius: '12px', padding: '4px', marginTop: '0.5rem' }}>
          <button
            type="button"
            onClick={() => setActiveTab('privacy')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.6rem 1.4rem',
              borderRadius: '9px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: activeTab === 'privacy' ? 700 : 500,
              background: activeTab === 'privacy' ? '#ffffff' : 'transparent',
              color: activeTab === 'privacy' ? 'var(--primary)' : '#64748b',
              boxShadow: activeTab === 'privacy' ? 'var(--shadow-sm)' : 'none',
              transition: 'all 0.2s ease',
            }}
          >
            <ShieldCheck size={18} /> Chính sách Bảo vệ Dữ liệu (NĐ 13/2023)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('terms')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.6rem 1.4rem',
              borderRadius: '9px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: activeTab === 'terms' ? 700 : 500,
              background: activeTab === 'terms' ? '#ffffff' : 'transparent',
              color: activeTab === 'terms' ? 'var(--primary)' : '#64748b',
              boxShadow: activeTab === 'terms' ? 'var(--shadow-sm)' : 'none',
              transition: 'all 0.2s ease',
            }}
          >
            <FileText size={18} /> Điều khoản Dịch vụ
          </button>
        </div>
      </section>

      {activeTab === 'privacy' ? (
        <div style={{ display: 'grid', gap: '1.5rem', marginBottom: '3rem' }}>
          {/* Box 1: Compliance Commitment */}
          <article className="card" style={{ padding: '1.8rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem', color: 'var(--primary)' }}>
              <CheckCircle2 size={24} />
              <h2 style={{ fontSize: '1.35rem', margin: 0 }}>1. Cam kết tuân thủ Nghị định 13/2023/NĐ-CP</h2>
            </div>
            <p className="muted" style={{ lineHeight: 1.7, fontSize: '1rem' }}>
              NEXT Solution và nền tảng đào tạo GHTXDBK cam kết bảo vệ dữ liệu cá nhân của người dùng phù hợp với quy định của <strong>Nghị định số 13/2023/NĐ-CP</strong> của Chính phủ Việt Nam về Bảo vệ dữ liệu cá nhân. Chúng tôi tôn trọng quyền riêng tư, minh bạch toàn bộ các hoạt động thu thập, xử lý và lưu trữ dữ liệu cá nhân của học viên và khách hàng.
            </p>
          </article>

          {/* Box 2: Data Collected */}
          <article className="card" style={{ padding: '1.8rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem', color: 'var(--primary)' }}>
              <Cpu size={24} />
              <h2 style={{ fontSize: '1.35rem', margin: 0 }}>2. Các loại dữ liệu cá nhân thu thập</h2>
            </div>
            <div className="grid grid-3" style={{ marginTop: '1rem' }}>
              <div style={{ background: '#f8fafc', padding: '1.2rem', borderRadius: '10px', border: '1px solid var(--border)' }}>
                <h3 style={{ fontSize: '1.05rem', color: 'var(--primary)', marginBottom: '0.5rem' }}>Thông tin tài khoản</h3>
                <p className="muted" style={{ fontSize: '0.92rem', lineHeight: 1.6 }}>
                  Địa chỉ Email, Họ và tên (nếu cung cấp), Mật khẩu (được mã hóa một chiều qua thuật toán bảo mật an toàn BCrypt/Argon2 trước khi lưu trữ, không thể giải mã ngược).
                </p>
              </div>

              <div style={{ background: '#f8fafc', padding: '1.2rem', borderRadius: '10px', border: '1px solid var(--border)' }}>
                <h3 style={{ fontSize: '1.05rem', color: 'var(--primary)', marginBottom: '0.5rem' }}>Hardware Fingerprint</h3>
                <p className="muted" style={{ fontSize: '0.92rem', lineHeight: 1.6 }}>
                  Thông số kỹ thuật phần cứng máy tính gồm CPU ID, Serial BIOS, Serial bo mạch chủ (BaseBoard) qua Windows WMI khi sử dụng phần mềm kỹ thuật kết cấu Next Structural. Dữ liệu này được băm (hash SHA-256) và chỉ dùng duy nhất cho mục đích quản lý số lượng thiết bị đăng nhập theo gói bản quyền (License Entitlement).
                </p>
              </div>

              <div style={{ background: '#f8fafc', padding: '1.2rem', borderRadius: '10px', border: '1px solid var(--border)' }}>
                <h3 style={{ fontSize: '1.05rem', color: 'var(--primary)', marginBottom: '0.5rem' }}>Dữ liệu phiên làm việc</h3>
                <p className="muted" style={{ fontSize: '0.92rem', lineHeight: 1.6 }}>
                  Thời điểm truy cập gần nhất (lastSeenAt), tên máy tính (MachineName) và địa chỉ IP truy cập máy chủ để kiểm soát an ninh hệ thống và ngăn ngừa truy cập trái phép.
                </p>
              </div>
            </div>
          </article>

          {/* Box 3: Purposes */}
          <article className="card" style={{ padding: '1.8rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem', color: 'var(--primary)' }}>
              <Lock size={24} />
              <h2 style={{ fontSize: '1.35rem', margin: 0 }}>3. Mục đích xử lý dữ liệu</h2>
            </div>
            <p className="muted" style={{ lineHeight: 1.7, fontSize: '1rem', marginBottom: '0.8rem' }}>
              Dữ liệu cá nhân chỉ được xử lý cho các mục đích hợp pháp sau:
            </p>
            <ul style={{ paddingLeft: '1.4rem', display: 'grid', gap: '0.6rem', color: '#334155', lineHeight: 1.65 }}>
              <li>
                <strong>Xác thực danh tính & Quản lý phiên:</strong> Duy trì phiên đăng nhập an toàn, quản lý thông tin học tập của học viên trên website.
              </li>
              <li>
                <strong>Cấp phép và kiểm soát bản quyền:</strong> Cấp phép và kiểm soát bản quyền phần mềm kỹ thuật kết cấu Next Structural theo số lượng thiết bị đã đăng ký của gói dịch vụ.
              </li>
              <li>
                <strong>Hỗ trợ kỹ thuật & Vận hành:</strong> Giải quyết sự cố kỹ thuật, phản hồi thắc mắc, gửi thông báo cập nhật bài giảng và tính năng mới quan trọng.
              </li>
            </ul>
          </article>

          {/* Box 4: Security Measures */}
          <article className="card" style={{ padding: '1.8rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem', color: 'var(--primary)' }}>
              <Server size={24} />
              <h2 style={{ fontSize: '1.35rem', margin: 0 }}>4. Biện pháp bảo vệ an toàn thông tin & Vị trí máy chủ</h2>
            </div>
            <ul style={{ paddingLeft: '1.4rem', display: 'grid', gap: '0.75rem', color: '#334155', lineHeight: 1.65 }}>
              <li>
                <strong>Phía máy khách:</strong> Token và cache đăng nhập cục bộ được bảo vệ bởi Windows Data Protection API (DPAPI) trên ứng dụng desktop và chuẩn lưu trữ an toàn trên trình duyệt web.
              </li>
              <li>
                <strong>Đường truyền mạng:</strong> Mọi kết nối giữa ứng dụng/website và máy chủ đều được mã hóa bằng giao thức HTTPS/TLS 1.2+ toàn trình, bảo đảm không bị can thiệp hay nghe lén.
              </li>
              <li>
                <strong>Hạ tầng máy chủ nội địa:</strong> Toàn bộ dữ liệu cơ sở dữ liệu PocketBase và web được đặt tại Trung tâm dữ liệu tại Việt Nam (TP. Hồ Chí Minh - Interdigi JSC, IP: 36.50.54.248), tuân thủ tuyệt đối quy định về lưu trữ dữ liệu tại Việt Nam. Cấu hình phân quyền nghiêm ngặt, sao lưu bảo mật và tuyệt đối không chia sẻ cho bất kỳ bên thứ ba nào.
              </li>
            </ul>
          </article>

          {/* Box 5: Data Subject Rights */}
          <article className="card" style={{ padding: '1.8rem', borderLeft: '4px solid var(--primary)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem', color: 'var(--primary)' }}>
              <UserCheck size={24} />
              <h2 style={{ fontSize: '1.35rem', margin: 0 }}>5. Quyền của Chủ thể dữ liệu (Điều 9 NĐ 13/2023/NĐ-CP)</h2>
            </div>
            <p className="muted" style={{ lineHeight: 1.7, fontSize: '1rem', marginBottom: '0.8rem' }}>
              Người dùng có đầy đủ các quyền hợp pháp theo quy định tại Điều 9 Nghị định 13/2023/NĐ-CP:
            </p>
            <div className="grid grid-2" style={{ gap: '0.8rem' }}>
              <div style={{ padding: '0.9rem', background: '#f8fafc', borderRadius: '8px' }}>
                <strong style={{ color: 'var(--primary)' }}>Quyền được biết & Quyền đồng ý:</strong> Được biết rõ các loại dữ liệu thu thập, mục đích xử lý và có quyền chủ động đồng ý hoặc từ chối.
              </div>
              <div style={{ padding: '0.9rem', background: '#f8fafc', borderRadius: '8px' }}>
                <strong style={{ color: 'var(--primary)' }}>Quyền truy cập & Chỉnh sửa:</strong> Xem và chỉnh sửa thông tin tài khoản cá nhân bất kỳ lúc nào trên trang quản lý tài khoản.
              </div>
              <div style={{ padding: '0.9rem', background: '#f8fafc', borderRadius: '8px' }}>
                <strong style={{ color: 'var(--primary)' }}>Quyền Cung cấp Dữ liệu (Data Portability):</strong> Xuất và tải về toàn bộ bản sao dữ liệu cá nhân, danh sách thiết bị dưới dạng file định dạng tiêu chuẩn (.JSON).
              </div>
              <div style={{ padding: '0.9rem', background: '#f8fafc', borderRadius: '8px' }}>
                <strong style={{ color: '#dc2626' }}>Quyền Xóa Dữ liệu (Right to Erasure):</strong> Yêu cầu xóa vĩnh viễn tài khoản và toàn bộ dữ liệu định danh phần cứng, email, lịch sử bản quyền khỏi hệ thống.
              </div>
            </div>
          </article>

          {/* Box 6: Contact Channel */}
          <article className="card" style={{ padding: '1.8rem' }}>
            <h2 style={{ fontSize: '1.35rem', color: 'var(--primary)', marginBottom: '0.75rem' }}>6. Kênh liên hệ hỗ trợ</h2>
            <p className="muted" style={{ lineHeight: 1.7, fontSize: '1rem' }}>
              Mọi thắc mắc, phản ánh hoặc yêu cầu thực thi các quyền của Chủ thể dữ liệu cá nhân, vui lòng liên hệ quản trị viên GHTXDBK qua mục Liên hệ trên website hoặc qua email chính thức của bộ phận hỗ trợ kỹ thuật.
            </p>
          </article>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '1.5rem', marginBottom: '3rem' }}>
          <article className="card" style={{ padding: '1.8rem' }}>
            <h2 style={{ fontSize: '1.35rem', color: 'var(--primary)', marginBottom: '0.75rem' }}>1. Quyền sở hữu trí tuệ</h2>
            <p className="muted" style={{ lineHeight: 1.7, fontSize: '1rem' }}>
              Toàn bộ mã nguồn, thuật toán tính toán kết cấu, tài liệu hướng dẫn, giáo trình và video đào tạo thuộc quyền sở hữu trí tuệ của GHTXDBK và NEXT Solution. Người dùng được cấp quyền sử dụng phần mềm và tham gia các khóa học theo gói bản quyền đã đăng ký hợp lệ.
            </p>
          </article>

          <article className="card" style={{ padding: '1.8rem' }}>
            <h2 style={{ fontSize: '1.35rem', color: 'var(--primary)', marginBottom: '0.75rem' }}>2. Trách nhiệm chuyên môn của kỹ sư</h2>
            <p className="muted" style={{ lineHeight: 1.7, fontSize: '1rem' }}>
              NEXT Solution là công cụ phần mềm hỗ trợ tính toán, thiết kế và mô hình hóa kết cấu công trình. Kết quả tính toán do phần mềm xuất ra cần được kỹ sư chủ trì / người có chuyên môn thẩm tra, đánh giá và chịu trách nhiệm phù hợp với tiêu chuẩn, quy chuẩn xây dựng hiện hành của Việt Nam.
            </p>
          </article>

          <article className="card" style={{ padding: '1.8rem' }}>
            <h2 style={{ fontSize: '1.35rem', color: 'var(--primary)', marginBottom: '0.75rem' }}>3. Quản lý tài khoản và thiết bị</h2>
            <p className="muted" style={{ lineHeight: 1.7, fontSize: '1rem' }}>
              Người dùng có trách nhiệm bảo mật thông tin đăng nhập của mình, không chia sẻ tài khoản cho người khác sử dụng trái với số lượng thiết bị cho phép của gói bản quyền. Hệ thống có quyền khóa thiết bị hoặc tạm ngưng tài khoản nếu phát hiện hành vi gian lận chia sẻ bản quyền trái phép.
            </p>
          </article>

          <article className="card" style={{ padding: '1.8rem' }}>
            <h2 style={{ fontSize: '1.35rem', color: 'var(--primary)', marginBottom: '0.75rem' }}>4. Sửa đổi và cập nhật điều khoản</h2>
            <p className="muted" style={{ lineHeight: 1.7, fontSize: '1rem' }}>
              GHTXDBK và NEXT Solution có quyền cập nhật các điều khoản dịch vụ và chính sách khi cần thiết để phù hợp với quy định pháp luật và nâng cao chất lượng dịch vụ. Mọi thay đổi lớn sẽ được thông báo rõ ràng đến người dùng trên nền tảng.
            </p>
          </article>
        </div>
      )}
    </div>
  );
};
