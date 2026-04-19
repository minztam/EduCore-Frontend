import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  ShieldCheck,
  CreditCard,
  Wallet,
  Landmark,
  ChevronRight,
} from 'lucide-react';
import { createPaymentUrl } from '../../api/paymentApi';
import { getCourseById } from '../../api/courseApi';
import Header from '../../components/HeaderComponent';

const CheckoutPage = () => {
  const { courseId } = useParams();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [method, setMethod] = useState('vnpay');

  useEffect(() => {
    getCourseById(courseId).then((res) => setCourse(res?.data?.data));
  }, [courseId]);

  const onProcessPayment = async () => {
    try {
      setLoading(true);
      const user = JSON.parse(localStorage.getItem('user'));
      if (!user) return alert('Vui lòng đăng nhập để thực hiện thanh toán!');

      if (method === 'momo') {
        alert('Cổng thanh toán MoMo đang được tích hợp. Vui lòng chọn VNPAY!');
        setLoading(false);
        return;
      }

      const res = await createPaymentUrl({
        courseId,
        studentId: user.id,
        amount: course.price,
      });

      if (res.data?.paymentUrl) {
        window.location.href = res.data.paymentUrl;
      }
    } catch (e) {
      alert('Không thể khởi tạo giao dịch. Vui lòng thử lại sau!');
    } finally {
      setLoading(false);
    }
  };

  if (!course) return null;

  return (
    <div className="min-h-screen bg-[#fcfcfd] font-sans antialiased text-slate-900">
      <Header />

      <main className="max-w-5xl mx-auto pt-32 px-6 pb-20">
        {/* HEADER SECTION */}
        <div className="mb-10">
          <h1 className="text-3xl font-black tracking-tight text-slate-900 uppercase">
            Thanh toán
          </h1>
          <p className="text-slate-500 text-sm font-medium mt-1">
            Hoàn tất bước cuối cùng để bắt đầu hành trình học tập của bạn.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-12">
          {/* CỘT TRÁI: PHƯƠNG THỨC */}
          <div className="flex-1 space-y-8">
            <section>
              <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-lg shadow-blue-100">
                  <CreditCard size={18} />
                </div>
                <h2 className="text-sm font-black uppercase tracking-[0.15em] text-slate-800">
                  Phương thức thanh toán
                </h2>
              </div>

              <div className="grid gap-4">
                {/* VNPAY */}
                <PaymentOption
                  active={method === 'vnpay'}
                  onClick={() => setMethod('vnpay')}
                  icon={
                    <Wallet
                      className={
                        method === 'vnpay' ? 'text-blue-600' : 'text-slate-400'
                      }
                      size={20}
                    />
                  }
                  title="Ví VNPAY / Ngân hàng"
                  subtitle="Hỗ trợ thẻ ATM, QR Code, Visa/Mastercard"
                  logo="https://stcd02206177151.cloud.edgevnpay.vn/assets/images/logo-icon/logo-app-vnpay.png"
                  color="blue"
                />

                {/* MOMO */}
                <PaymentOption
                  active={method === 'momo'}
                  onClick={() => setMethod('momo')}
                  icon={
                    <Wallet
                      className={
                        method === 'momo' ? 'text-pink-600' : 'text-slate-400'
                      }
                      size={20}
                    />
                  }
                  title="Ví MoMo"
                  subtitle="Thanh toán siêu nhanh qua ứng dụng MoMo"
                  logo="https://developers.momo.vn/v3/img/logo.svg"
                  color="pink"
                />

                {/* BANK TRANSFER */}
                <PaymentOption
                  active={method === 'bank'}
                  onClick={() => setMethod('bank')}
                  icon={
                    <Landmark
                      className={
                        method === 'bank' ? 'text-slate-900' : 'text-slate-400'
                      }
                      size={20}
                    />
                  }
                  title="Chuyển khoản thủ công"
                  subtitle="Xử lý trong vòng 24h làm việc"
                  color="slate"
                />
              </div>
            </section>

            <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <ShieldCheck className="text-emerald-500" size={20} />
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                Bảo mật tiêu chuẩn SSL 256-bit • Thanh toán an toàn tuyệt đối
              </p>
            </div>
          </div>

          {/* CỘT PHẢI: TÓM TẮT ĐƠN HÀNG */}
          <div className="w-full lg:w-[380px]">
            <div className="bg-white rounded-3xl border border-slate-200 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden sticky top-32">
              <div className="p-6">
                <h2 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-6">
                  Tóm tắt đơn hàng
                </h2>

                <div className="flex gap-4 mb-8">
                  <div className="w-24 h-16 shrink-0 rounded-xl overflow-hidden bg-slate-100 border border-slate-100">
                    <img
                      src={course.thumbnailUrl}
                      className="w-full h-full object-cover"
                      alt={course.title}
                    />
                  </div>
                  <div className="flex flex-col justify-center">
                    <h3 className="font-bold text-sm leading-snug line-clamp-2 text-slate-800">
                      {course.title}
                    </h3>
                  </div>
                </div>

                <div className="space-y-4 border-t border-slate-50 pt-6 mb-8">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-slate-500">
                      Giá gốc
                    </span>
                    <span className="text-sm font-bold text-slate-900 tabular-nums">
                      {Number(course.price).toLocaleString()}đ
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-slate-500">
                      Giảm giá
                    </span>
                    <span className="text-sm font-bold text-emerald-500 uppercase tracking-tight">
                      0đ
                    </span>
                  </div>
                  <div className="flex justify-between items-end pt-4 border-t border-slate-100">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.1em]">
                      Tổng thanh toán
                    </span>
                    <span className="text-2xl font-black text-blue-600 tabular-nums leading-none">
                      {Number(course.price).toLocaleString()}đ
                    </span>
                  </div>
                </div>

                <button
                  onClick={onProcessPayment}
                  disabled={loading}
                  className={`group relative w-full py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all overflow-hidden ${
                    loading
                      ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                      : 'bg-slate-900 text-white hover:bg-blue-600 hover:shadow-xl hover:shadow-blue-200'
                  }`}
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    {loading ? 'Đang kết nối...' : 'Xác nhận thanh toán'}
                    {!loading && (
                      <ChevronRight
                        size={14}
                        className="group-hover:translate-x-1 transition-transform"
                      />
                    )}
                  </span>
                </button>

                <p className="text-[10px] text-slate-400 mt-6 text-center font-medium leading-relaxed">
                  Bằng cách nhấn thanh toán, bạn đồng ý với <br />
                  <span className="text-slate-900 underline cursor-pointer">
                    Điều khoản & Chính sách của EduCore
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

// Sub-component cho từng option thanh toán để code sạch hơn
const PaymentOption = ({
  active,
  onClick,
  icon,
  title,
  subtitle,
  logo,
  color,
}) => {
  const colorMap = {
    blue: 'border-blue-600 bg-blue-50/20',
    pink: 'border-pink-600 bg-pink-50/20',
    slate: 'border-slate-900 bg-slate-50',
  };

  return (
    <div
      onClick={onClick}
      className={`group flex items-center justify-between p-5 rounded-2xl border-2 cursor-pointer transition-all duration-300 ${
        active
          ? colorMap[color]
          : 'border-slate-100 bg-white hover:border-slate-200 hover:shadow-md'
      }`}
    >
      <div className="flex items-center gap-4">
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
            active
              ? 'bg-white shadow-sm'
              : 'bg-slate-50 group-hover:bg-slate-100'
          }`}
        >
          {icon}
        </div>
        <div>
          <span
            className={`text-sm font-black uppercase tracking-tight block ${active ? 'text-slate-900' : 'text-slate-600'}`}
          >
            {title}
          </span>
          <span className="text-[11px] text-slate-500 font-medium">
            {subtitle}
          </span>
        </div>
      </div>
      {logo && (
        <img
          src={logo}
          className="h-6 w-6 object-contain grayscale-[0.5] group-hover:grayscale-0 transition-all"
          alt="logo"
        />
      )}
      {!logo && <div className="w-6 h-6" />}
    </div>
  );
};

export default CheckoutPage;
