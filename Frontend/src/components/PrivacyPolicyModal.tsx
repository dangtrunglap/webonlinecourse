import React, { useState } from 'react';
import { ShieldCheck, FileText, X, CheckCircle2 } from 'lucide-react';

interface PrivacyPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAccept?: () => void;
  showAcceptButton?: boolean;
}

export const PrivacyPolicyModal: React.FC<PrivacyPolicyModalProps> = ({
  isOpen,
  onClose,
  onAccept,
  showAcceptButton = false,
}) => {
  const [activeTab, setActiveTab] = useState<'privacy' | 'terms'>('privacy');

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
      }}
      onClick={onClose}
    >
      <div
        className="card"
        style={{
          width: '100%',
          maxWidth: '740px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          boxShadow: 'var(--shadow-lg)',
          background: '#ffffff',
          borderRadius: '16px',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '1rem 1.4rem',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'linear-gradient(135deg, #f8fafc, #edf2f7)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: 'rgba(30, 58, 138, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--primary)',
              }}
            >
              <ShieldCheck size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.05rem', margin: 0, color: 'var(--foreground)' }}>
                Chính sách Bảo vệ Dữ liệu & Điều khoản Dịch vụ
              </h3>
              <p className="muted" style={{ fontSize: '0.8rem', margin: 0 }}>
                Tuân thủ Nghị định 13/2023/NĐ-CP của Chính phủ Việt Nam
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="btn btn-secondary"
            style={{ padding: '0.35rem 0.6rem', border: 'none', background: 'transparent' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div
          style={{
            display: 'flex',
            borderBottom: '1px solid var(--border)',
            padding: '0 1.25rem',
            background: '#ffffff',
            gap: '1rem',
          }}
        >
          <button
            type="button"
            onClick={() => setActiveTab('privacy')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.8rem 0.2rem',
              border: 'none',
              background: 'transparent',
              fontSize: '0.92rem',
              fontWeight: activeTab === 'privacy' ? 700 : 500,
              color: activeTab === 'privacy' ? 'var(--primary)' : 'var(--muted-foreground)',
              borderBottom: activeTab === 'privacy' ? '2px solid var(--primary)' : '2px solid transparent',
              cursor: 'pointer',
            }}
          >
            <ShieldCheck size={16} /> Chính sách Quyền riêng tư (NĐ 13/2023)
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('terms')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.8rem 0.2rem',
              border: 'none',
              background: 'transparent',
              fontSize: '0.92rem',
              fontWeight: activeTab === 'terms' ? 700 : 500,
              color: activeTab === 'terms' ? 'var(--primary)' : 'var(--muted-foreground)',
              borderBottom: activeTab === 'terms' ? '2px solid var(--primary)' : '2px solid transparent',
              cursor: 'pointer',
            }}
          >
            <FileText size={16} /> Điều khoản Dịch vụ
          </button>
        </div>

        {/* Scrollable Content */}
        <div
          style={{
            padding: '1.4rem',
            overflowY: 'auto',
            flex: 1,
            fontSize: '0.92rem',
            lineHeight: 1.65,
            color: '#334155',
          }}
        >
          {activeTab === 'privacy' ? (
            <div style={{ display: 'grid', gap: '1.2rem' }}>
              <div
                style={{
                  background: '#f0fdf4',
                  border: '1px solid #bbf7d0',
                  borderRadius: '8px',
                  padding: '0.75rem 1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.6rem',
                  fontSize: '0.86rem',
                  color: '#166534',
                }}
              >
                <CheckCircle2 size={18} style={{ flexShrink: 0 }} />
                <span>
                  Hệ thống cam kết tuân thủ nghiêm ngặt theo <strong>Nghị định 13/2023/NĐ-CP</strong> về Bảo vệ dữ liệu cá nhân.
                </span>
              </div>

              <section>
                <h4 style={{ color: 'var(--primary)', marginBottom: '0.4rem', fontSize: '1rem' }}>
                  1. Cam kết tuân thủ Nghị định 13/2023/NĐ-CP
                </h4>
                <p>
                  GHTXDBK và NEXT Solution cam kết bảo vệ dữ liệu cá nhân của người dùng phù hợp với quy định của Nghị định 13/2023/NĐ-CP của Chính phủ Việt Nam về Bảo vệ dữ liệu cá nhân. Chúng tôi tôn trọng quyền riêng tư và minh bạch mọi hoạt động xử lý dữ liệu.
                </p>
              </section>

              <section>
                <h4 style={{ color: 'var(--primary)', marginBottom: '0.4rem', fontSize: '1rem' }}>
                  2. Các loại dữ liệu cá nhân thu thập
                </h4>
                <ul style={{ paddingLeft: '1.2rem', display: 'grid', gap: '0.4rem' }}>
                  <li>
                    <strong>Thông tin tài khoản:</strong> Địa chỉ Email, Họ và tên, Mật khẩu (được mã hóa một chiều qua thuật toán bảo mật an toàn trước khi lưu trữ).
                  </li>
                  <li>
                    <strong>Dấu vân tay thiết bị (Hardware Fingerprint):</strong> Thông số kỹ thuật phần cứng máy tính gồm CPU ID, Serial BIOS, Serial bo mạch chủ (BaseBoard) qua Windows WMI khi sử dụng bộ công cụ kỹ thuật phần mềm kết cấu Next Structural. Dữ liệu này được băm (hash SHA-256) và chỉ dùng duy nhất cho mục đích quản lý số lượng thiết bị đăng nhập theo gói bản quyền (License Entitlement).
                  </li>
                  <li>
                    <strong>Dữ liệu phiên làm việc:</strong> Thời điểm truy cập gần nhất (lastSeenAt), tên máy tính (MachineName) và địa chỉ IP truy cập máy chủ.
                  </li>
                </ul>
              </section>

              <section>
                <h4 style={{ color: 'var(--primary)', marginBottom: '0.4rem', fontSize: '1rem' }}>
                  3. Mục đích xử lý dữ liệu
                </h4>
                <p>Dữ liệu cá nhân chỉ được xử lý cho các mục đích hợp pháp sau:</p>
                <ul style={{ paddingLeft: '1.2rem', display: 'grid', gap: '0.35rem', marginTop: '0.3rem' }}>
                  <li>Xác thực danh tính và duy trì phiên đăng nhập của người dùng.</li>
                  <li>Cấp phép và kiểm soát bản quyền phần mềm kỹ thuật kết cấu và quyền truy cập khóa học theo số lượng thiết bị đã đăng ký.</li>
                  <li>Hỗ trợ kỹ thuật, giải quyết sự cố, và thông báo cập nhật tính năng mới.</li>
                </ul>
              </section>

              <section>
                <h4 style={{ color: 'var(--primary)', marginBottom: '0.4rem', fontSize: '1rem' }}>
                  4. Biện pháp bảo vệ an toàn thông tin
                </h4>
                <ul style={{ paddingLeft: '1.2rem', display: 'grid', gap: '0.35rem' }}>
                  <li><strong>Trên máy khách:</strong> Token và cache đăng nhập cục bộ được bảo vệ bởi Windows Data Protection API (DPAPI) và cơ chế lưu trữ an toàn.</li>
                  <li><strong>Trên đường truyền:</strong> Mọi kết nối giữa ứng dụng/web và máy chủ đều được mã hóa bằng giao thức HTTPS/TLS 1.2+.</li>
                  <li><strong>Trên máy chủ:</strong> Máy chủ đặt tại Trung tâm dữ liệu nội địa Việt Nam (TP. Hồ Chí Minh), cấu hình phân quyền nghiêm ngặt, sao lưu bảo mật và tuyệt đối không chia sẻ dữ liệu cho bất kỳ bên thứ ba nào khi chưa có sự đồng ý của bạn.</li>
                </ul>
              </section>

              <section>
                <h4 style={{ color: 'var(--primary)', marginBottom: '0.4rem', fontSize: '1rem' }}>
                  5. Quyền của Chủ thể dữ liệu (Điều 9 NĐ 13/2023/NĐ-CP)
                </h4>
                <p>
                  Người dùng có đầy đủ các quyền theo luật định: <strong>Quyền được biết</strong>, <strong>Quyền đồng ý</strong>, <strong>Quyền truy cập và cung cấp dữ liệu (Right to Data Portability)</strong>, <strong>Quyền rút lại sự đồng ý</strong>, và <strong>Quyền yêu cầu xóa tài khoản / xóa vĩnh viễn dữ liệu cá nhân (Right to Erasure)</strong> bất kỳ lúc nào tại mục Cài đặt Tài khoản hoặc qua kênh hỗ trợ kỹ thuật của chúng tôi.
                </p>
              </section>

              <section>
                <h4 style={{ color: 'var(--primary)', marginBottom: '0.4rem', fontSize: '1rem' }}>
                  6. Kênh liên hệ hỗ trợ
                </h4>
                <p>
                  Mọi thắc mắc hoặc yêu cầu liên quan đến dữ liệu cá nhân, vui lòng liên hệ quản trị viên GHTXDBK / NEXT Solution qua email hoặc hotline hỗ trợ kỹ thuật trên trang Liên hệ.
                </p>
              </section>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '1.2rem' }}>
              <section>
                <h4 style={{ color: 'var(--primary)', marginBottom: '0.4rem', fontSize: '1rem' }}>
                  1. Quyền sở hữu trí tuệ
                </h4>
                <p>
                  Toàn bộ mã nguồn, thuật toán tính toán kết cấu, tài liệu hướng dẫn, giáo trình và video đào tạo thuộc quyền sở hữu trí tuệ của GHTXDBK và NEXT Solution. Người dùng được cấp quyền sử dụng phần mềm và tham gia học tập theo gói bản quyền đã đăng ký.
                </p>
              </section>

              <section>
                <h4 style={{ color: 'var(--primary)', marginBottom: '0.4rem', fontSize: '1rem' }}>
                  2. Trách nhiệm chuyên môn của kỹ sư
                </h4>
                <p>
                  NEXT Solution và các công cụ đào tạo trên GHTXDBK là công cụ hỗ trợ tính toán, thiết kế và mô hình hóa kết cấu công trình. Kết quả tính toán do phần mềm xuất ra cần được kỹ sư chủ trì / người có chuyên môn thẩm tra, đánh giá và chịu trách nhiệm phù hợp với tiêu chuẩn, quy chuẩn xây dựng hiện hành.
                </p>
              </section>

              <section>
                <h4 style={{ color: 'var(--primary)', marginBottom: '0.4rem', fontSize: '1rem' }}>
                  3. Quản lý tài khoản và thiết bị
                </h4>
                <p>
                  Người dùng có trách nhiệm bảo mật thông tin đăng nhập của mình, không chia sẻ tài khoản cho người khác sử dụng trái với số lượng thiết bị cho phép của gói bản quyền.
                </p>
              </section>

              <section>
                <h4 style={{ color: 'var(--primary)', marginBottom: '0.4rem', fontSize: '1rem' }}>
                  4. Sửa đổi và cập nhật điều khoản
                </h4>
                <p>
                  Chúng tôi có quyền cập nhật các điều khoản dịch vụ và chính sách khi cần thiết để phù hợp với pháp luật và nâng cao chất lượng dịch vụ. Mọi thay đổi lớn sẽ được thông báo rõ ràng đến người dùng trên nền tảng.
                </p>
              </section>
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '0.9rem 1.4rem',
            borderTop: '1px solid var(--border)',
            background: '#f8fafc',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: '0.75rem',
          }}
        >
          <button type="button" onClick={onClose} className="btn btn-secondary">
            Đóng
          </button>
          {showAcceptButton && onAccept && (
            <button
              type="button"
              onClick={() => {
                onAccept();
                onClose();
              }}
              className="btn btn-primary"
            >
              Tôi đồng ý & Tiếp tục
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
