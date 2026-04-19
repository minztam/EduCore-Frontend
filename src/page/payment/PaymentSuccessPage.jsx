import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  CheckCircle2,
  XCircle,
  ArrowRight,
  Home,
  RefreshCcw,
  Play,
  ShieldCheck,
} from 'lucide-react';
import { getCourseById } from '../../api/courseApi';
import Header from '../../components/HeaderComponent';

// 1. Định nghĩa Sub-component NextStepCard bên ngoài component chính
const NextStepCard = ({ icon, title, desc, action, label }) => (
  <div className="bg-white p-6 rounded-3xl border border-slate-100 hover:border-blue-200 transition-all group shadow-sm hover:shadow-md">
    <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-white group-hover:shadow-sm transition-all">
      {icon}
    </div>
    <h3 className="font-black uppercase text-[11px] tracking-widest mb-2 text-slate-900">
      {title}
    </h3>
    <p className="text-slate-400 text-[12px] leading-relaxed mb-6 font-medium">
      {desc}
    </p>
    <button
      onClick={action}
      className="text-[10px] font-black uppercase tracking-widest text-blue-600 flex items-center gap-2 hover:gap-3 transition-all"
    >
      {label} <ArrowRight size={12} />
    </button>
  </div>
);

const PaymentResultPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const code = searchParams.get('code');
  const courseId = searchParams.get('courseId');

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const isSuccess = code === '00';

  useEffect(() => {
    if (courseId) {
      setLoading(true);
      getCourseById(courseId)
        .then((res) => {
          setCourse(res?.data?.data);
        })
        .catch((err) => console.error('Lỗi lấy thông tin khóa học:', err))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [courseId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fcfcfd] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin"></div>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
            Đang xác thực giao dịch...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fcfcfd] font-sans antialiased text-slate-900">
      <Header />

      <main className="max-w-4xl mx-auto pt-32 px-6 pb-20">
        {/* 1. Card trạng thái chính */}
        <div className="bg-white rounded-[2.5rem] border border-slate-200 p-10 text-center shadow-sm mb-8">
          <div className="flex justify-center mb-6">
            <div
              className={`w-16 h-16 text-white rounded-2xl flex items-center justify-center shadow-lg ${
                isSuccess
                  ? 'bg-emerald-500 shadow-emerald-100'
                  : 'bg-rose-500 shadow-rose-100'
              }`}
            >
              {isSuccess ? <CheckCircle2 size={32} /> : <XCircle size={32} />}
            </div>
          </div>

          <h1 className="text-2xl font-black uppercase tracking-tight mb-2">
            {isSuccess ? 'Thanh toán hoàn tất!' : 'Thanh toán thất bại'}
          </h1>

          <p className="text-slate-500 text-sm font-medium mb-4">
            {isSuccess
              ? `Chào mừng bạn đến với khóa học: ${course?.title || ''}`
              : 'Đã có lỗi xảy ra trong quá trình xử lý giao dịch.'}
          </p>

          <div className="inline-block px-4 py-2 bg-slate-50 rounded-full">
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">
              Mã giao dịch: #EDU-{Math.floor(Math.random() * 100000)}
            </p>
          </div>
        </div>

        {/* 2. Grid hành động dựa trên kết quả */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {isSuccess ? (
            <>
              <NextStepCard
                icon={<Play size={20} className="text-blue-600" />}
                title="Bắt đầu ngay"
                desc="Truy cập bài học đầu tiên của khóa học ngay bây giờ."
                action={() => navigate('/my-courses')}
                label="Vào học"
              />
              <NextStepCard
                icon={<ShieldCheck size={20} className="text-purple-600" />}
                title="Hóa đơn"
                desc="Xem lại chi tiết và tải hóa đơn điện tử của bạn."
                action={() => window.print()}
                label="Xem hóa đơn"
              />
            </>
          ) : (
            <>
              <NextStepCard
                icon={<RefreshCcw size={20} className="text-rose-600" />}
                title="Thanh toán lại"
                desc="Quay lại trang thanh toán để thực hiện lại giao dịch."
                action={() => navigate(`/checkout/${courseId}`)}
                label="Thử lại"
              />
              <NextStepCard
                icon={<ShieldCheck size={20} className="text-slate-600" />}
                title="Hỗ trợ"
                desc="Liên hệ đội ngũ hỗ trợ nếu gặp vấn đề về tài khoản."
                action={() => navigate('/support')}
                label="Liên hệ"
              />
            </>
          )}
          <NextStepCard
            icon={<Home size={20} className="text-orange-600" />}
            title="Trang chủ"
            desc="Tiếp tục khám phá các khóa học hấp dẫn khác."
            action={() => navigate('/')}
            label="Khám phá"
          />
        </div>
      </main>
    </div>
  );
};

export default PaymentResultPage;
