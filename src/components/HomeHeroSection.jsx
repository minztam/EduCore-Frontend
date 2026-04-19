import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getFeaturedPosts } from '../api/postApi';
import {
  ChevronLeft,
  ChevronRight,
  Book,
  UserPlus,
  Calendar,
  Eye,
  Loader2,
} from 'lucide-react';

const HomeHeroSection = () => {
  const [slides, setSlides] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const res = await getFeaturedPosts(5);
        if (res?.data?.data) {
          setSlides(res.data.data);
        }
      } catch (error) {
        console.error('Lỗi lấy bài viết nổi bật:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  const nextSlide = useCallback(() => {
    if (slides.length === 0) return;
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  const prevSlide = () => {
    if (slides.length === 0) return;
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
  };

  useEffect(() => {
    if (slides.length > 0) {
      const timer = setInterval(nextSlide, 5000);
      return () => clearInterval(timer);
    }
  }, [nextSlide, slides.length]);

  return (
    <section className="bg-gradient-to-r from-blue-700 to-indigo-900 text-white py-[100px] relative overflow-hidden mt-6">
      <div className="container mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* CỘT TRÁI */}
          <div className="space-y-8">
            <div className="space-y-6 animate-fadeInLeft">
              {/* ĐỒNG BỘ CHỮ: Thêm uppercase và tracking-wider giống phong cách các nút/label */}
              <h1 className="text-4xl md:text-6xl font-black leading-tight tracking-tight text-white uppercase">
                <span className="opacity-80 font-medium text-2xl md:text-3xl block mb-2 tracking-widest">
                  Học Lập Trình
                </span>
                <span className="bg-gradient-to-r from-blue-100 to-white bg-clip-text text-transparent">
                  Trực Tuyến Hiện Đại
                </span>
              </h1>

              <p className="text-lg md:text-xl text-blue-100/80 max-w-lg leading-relaxed font-normal border-l-2 border-blue-400/30 pl-4">
                Nâng cao kỹ năng lập trình của bạn với các khóa học chất lượng
                cao từ các chuyên gia thực chiến.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => navigate('/khoa-hoc')}
                className="bg-white text-blue-800 px-8 py-4 rounded-xl font-black uppercase tracking-wider text-sm hover:bg-blue-50 transition-all shadow-xl shadow-blue-900/20 flex items-center justify-center gap-2 active:scale-95"
              >
                <Book size={18} /> Khám phá khóa học
              </button>
              <button
                onClick={() => navigate('/register')} // Thêm dòng này để điều hướng
                className="border-2 border-white/30 text-white px-8 py-4 rounded-xl font-black uppercase tracking-wider text-sm hover:bg-white hover:text-blue-800 transition-all flex items-center justify-center gap-2 active:scale-95"
              >
                <UserPlus size={18} /> Đăng ký miễn phí
              </button>
            </div>

            {/* Stats */}
            <div className="flex items-center space-x-12 pt-8 border-t border-white/10">
              <div>
                <div className="text-3xl font-black tracking-tighter">50+</div>
                <div className="text-blue-300 text-[10px] uppercase font-bold tracking-[0.2em] mt-1">
                  Khóa học
                </div>
              </div>
              <div>
                <div className="text-3xl font-black tracking-tighter">10K+</div>
                <div className="text-blue-300 text-[10px] uppercase font-bold tracking-[0.2em] mt-1">
                  Học viên
                </div>
              </div>
              <div>
                <div className="text-3xl font-black tracking-tighter">
                  4.8/5
                </div>
                <div className="text-blue-300 text-[10px] uppercase font-bold tracking-[0.2em] mt-1">
                  Đánh giá
                </div>
              </div>
            </div>
          </div>

          {/* CỘT PHẢI: SLIDER */}
          <div className="hidden lg:block relative group">
            {' '}
            {/* Thêm class 'group' ở đây */}
            <div className="relative h-[450px] w-full rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-slate-900 flex items-center justify-center">
              {loading ? (
                <div className="flex flex-col items-center gap-3">
                  <Loader2 className="animate-spin text-blue-400" size={40} />
                  <span className="text-slate-400 font-medium tracking-wide">
                    Đang tải tin tiêu điểm...
                  </span>
                </div>
              ) : slides.length > 0 ? (
                <>
                  {slides.map((slide, index) => (
                    <div
                      key={slide.id}
                      className={`absolute inset-0 transition-all duration-700 ease-in-out ${
                        index === currentIndex
                          ? 'opacity-100 scale-100 visible'
                          : 'opacity-0 scale-105 invisible'
                      }`}
                    >
                      <img
                        src={slide.thumbnail}
                        alt={slide.title}
                        // CẬP NHẬT TẠI ĐÂY: Thêm transition và group-hover:scale-110
                        className="w-full h-full object-cover opacity-80 transition-transform duration-1000 ease-in-out group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent flex items-end p-10">
                        <div className="space-y-4">
                          <span className="bg-blue-600/90 backdrop-blur-sm px-3 py-1 rounded text-[10px] font-black uppercase tracking-[0.2em]">
                            Tiêu điểm
                          </span>
                          <h3
                            onClick={() =>
                              navigate(`bai-viet/chi-tiet/${slide.slug}`)
                            }
                            className="text-3xl font-bold leading-snug hover:text-blue-300 cursor-pointer transition-colors line-clamp-2 tracking-tight"
                          >
                            {slide.title}
                          </h3>
                          <div className="flex items-center gap-6 text-sm text-slate-300 font-medium">
                            <span className="flex items-center gap-2">
                              <Calendar size={16} className="text-blue-400" />
                              {new Date(slide.createdAt).toLocaleDateString(
                                'vi-VN'
                              )}
                            </span>
                            <span className="flex items-center gap-2">
                              <Eye size={16} className="text-blue-400" />
                              {slide.viewCount.toLocaleString()} lượt xem
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Navigation UI */}
                  <button
                    onClick={prevSlide}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/10 backdrop-blur-md p-3 rounded-full hover:bg-white hover:text-blue-900 transition-all z-20 border border-white/20"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <button
                    onClick={nextSlide}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/10 backdrop-blur-md p-3 rounded-full hover:bg-white hover:text-blue-900 transition-all z-20 border border-white/20"
                  >
                    <ChevronRight size={20} />
                  </button>
                </>
              ) : (
                <span className="text-slate-500 font-medium">
                  Không có bài viết nổi bật nào
                </span>
              )}
            </div>
            {/* Dots UI */}
            {!loading && slides.length > 1 && (
              <div className="flex justify-center gap-3 mt-6">
                {slides.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentIndex(index)}
                    className={`h-1.5 transition-all duration-300 rounded-full ${
                      currentIndex === index
                        ? 'w-10 bg-blue-400'
                        : 'w-2 bg-white/20 hover:bg-white/40'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Decorative Blobs */}
      <div className="absolute top-[-10%] right-[-10%] w-[450px] h-[450px] bg-blue-600/20 rounded-full blur-[120px] z-0" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[350px] h-[350px] bg-indigo-600/20 rounded-full blur-[100px] z-0" />

      <style
        dangerouslySetInnerHTML={{
          __html: `
        @keyframes fadeInLeft {
          from { opacity: 0; transform: translateX(-20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        .animate-fadeInLeft {
          animation: fadeInLeft 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `,
        }}
      />
    </section>
  );
};

export default HomeHeroSection;
