import { Link } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import Header from '../components/HeaderComponent';
import Hero from '../components/HomeHeroSection';
import { BookOpen, Users, PlayCircle, Star, ArrowRight } from 'lucide-react';
import { getCourses } from '../api/courseApi';
import { getCategories } from '../api/categoryApi'; // API lấy danh mục
import { getFeaturedReviews as fetchFeaturedReviews } from '../api/reviewApi';

const HomePage = () => {
  const [featuredCourses, setFeaturedCourses] = useState([]);
  const [featuredReviews, setFeaturedReviews] = useState([]);
  const [categories, setCategories] = useState([]); // State cho danh mục ở Footer
  const [currentReview, setCurrentReview] = useState(0);

  // ================= LOGIC LOAD DATA =================

  // Load Khóa học nổi bật
  useEffect(() => {
    const loadFeaturedCourses = async () => {
      try {
        const res = await getCourses();
        const data = Array.isArray(res.data?.data)
          ? res.data.data
          : res.data?.data?.data || [];
        const hotCourses = data.filter(
          (c) => c.isHost === true && c.isPublished === true
        );
        setFeaturedCourses(hotCourses);
      } catch (err) {
        console.error('Lỗi khi tải khóa học nổi bật:', err);
      }
    };
    loadFeaturedCourses();
  }, []);

  // Load Danh mục cho Footer
  useEffect(() => {
    const fetchFooterCategories = async () => {
      try {
        const res = await getCategories();
        const data = (res?.data?.data || [])
          .filter((x) => x.isActive && !x.parentId)
          .sort((a, b) => a.sortOrder - b.sortOrder)
          .slice(0, 5); // Lấy 5 danh mục chính
        setCategories(data);
      } catch (err) {
        console.error('Lỗi tải danh mục footer:', err);
      }
    };
    fetchFooterCategories();
  }, []);

  // Load Review học viên
  useEffect(() => {
    const loadFeaturedReviews = async () => {
      try {
        let res;
        try {
          res = await fetchFeaturedReviews();
        } catch (err) {
          console.warn('API review lỗi');
        }
        const data =
          res && Array.isArray(res.data?.data)
            ? res.data.data
            : [
                {
                  id: 1,
                  studentName: 'Nguyen Van A',
                  rating: 5,
                  comment: 'Khóa học rất hay!',
                  avatarUrl: 'https://i.pravatar.cc/150?img=1',
                  isFeatured: true,
                },
                {
                  id: 2,
                  studentName: 'Tran Thi B',
                  rating: 4,
                  comment: 'Video dễ hiểu, giáo viên tận tâm.',
                  avatarUrl: 'https://i.pravatar.cc/150?img=2',
                  isFeatured: true,
                },
              ];
        setFeaturedReviews(data.filter((r) => r.isFeatured));
      } catch (err) {
        console.error('Lỗi khi tải review nổi bật:', err);
      }
    };
    loadFeaturedReviews();
  }, []);

  // Slider tự động cho Review
  useEffect(() => {
    if (featuredReviews.length === 0) return;
    const timer = setInterval(() => {
      setCurrentReview((prev) =>
        prev === featuredReviews.length - 1 ? 0 : prev + 1
      );
    }, 4000);
    return () => clearInterval(timer);
  }, [featuredReviews]);

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900">
      <Header />
      <Hero />

      {/* SECTION: WHY CHOOSE */}
      <section className="py-24 px-6 border-y border-slate-100 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            <div className="md:col-span-1">
              <h2 className="text-3xl font-black leading-tight text-slate-900 uppercase tracking-tighter">
                Tại sao là <br /> EduCore?
              </h2>
              <div className="w-12 h-1.5 bg-blue-600 mt-4 rounded-full"></div>
            </div>

            <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-12">
              {[
                {
                  icon: <BookOpen size={32} strokeWidth={1.5} />,
                  title: 'Lộ trình thực tế',
                  desc: 'Thiết kế dựa trên yêu cầu tuyển dụng thực tế từ các doanh nghiệp.',
                },
                {
                  icon: <PlayCircle size={32} strokeWidth={1.5} />,
                  title: 'Video chất lượng',
                  desc: 'Bài giảng HD súc tích, đi thẳng vào vấn đề, tiết kiệm thời gian.',
                },
                {
                  icon: <Users size={32} strokeWidth={1.5} />,
                  title: 'Tài liệu độc quyền',
                  desc: 'Cung cấp đầy đủ Source code và tài liệu PDF cho từng dự án.',
                },
              ].map((item, idx) => (
                <div key={idx} className="group">
                  <div className="text-blue-600 mb-5 group-hover:scale-110 transition-transform duration-300">
                    {item.icon}
                  </div>
                  <h3 className="text-lg font-bold mb-3">{item.title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* SECTION: FEATURED COURSES */}
      <section className="py-24 px-6 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-16 px-2">
            <div>
              <span className="text-blue-600 font-bold text-xs uppercase tracking-widest mb-2 block">
                Cập nhật mới nhất
              </span>
              <h2 className="text-3xl font-black uppercase tracking-tighter">
                Khóa học tiêu biểu
              </h2>
            </div>
            <Link
              to="/khoa-hoc"
              className="text-sm font-bold text-blue-600 border-b-2 border-blue-600 pb-1 hover:text-blue-700 transition-colors"
            >
              Xem tất cả
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {featuredCourses.length === 0 ? (
              <div className="col-span-full text-center py-20 text-slate-400 font-medium">
                Hiện chưa có khóa học nổi bật
              </div>
            ) : (
              featuredCourses.map((course) => (
                <div
                  key={course.id}
                  className="bg-white group overflow-hidden border border-slate-100 hover:border-blue-200 transition-all duration-500 rounded-sm"
                >
                  <div className="relative aspect-video overflow-hidden bg-black">
                    <img
                      src={
                        course.thumbnailUrl ||
                        'https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=2072'
                      }
                      alt={course.title}
                      className="w-full h-full object-cover brightness-90 group-hover:brightness-110 group-hover:scale-105 transition-all duration-700"
                    />
                    {course.price === 0 && (
                      <span className="absolute bottom-4 left-4 bg-black text-white text-[10px] font-bold px-3 py-1 uppercase tracking-widest">
                        Free
                      </span>
                    )}
                  </div>
                  <div className="p-8">
                    <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">
                      <span>{course.students ?? 0} Học viên</span>
                      <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                      <span>{course.totalLessons ?? 0} Bài học</span>
                    </div>
                    <h3 className="text-xl font-bold mb-8 group-hover:text-blue-600 transition-colors line-clamp-1">
                      {course.title}
                    </h3>
                    <Link
                      to={`/khoa-hoc/chi-tiet/${course.slug}`}
                      className="flex items-center justify-between border-t border-slate-50 pt-6 group-hover:translate-x-2 transition-transform duration-300"
                    >
                      <span className="text-xs font-black uppercase tracking-widest text-slate-900">
                        Khám phá ngay
                      </span>
                      <ArrowRight size={18} className="text-blue-600" />
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* SECTION: REVIEWS */}
      <section className="py-24 bg-white border-t border-slate-100 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl font-black uppercase tracking-tighter mb-12 text-slate-900">
            Học viên nói về EduCore
          </h2>
          <div className="relative group">
            <div className="overflow-hidden">
              <div
                className="flex transition-transform duration-700 ease-in-out"
                style={{ transform: `translateX(-${currentReview * 100}%)` }}
              >
                {featuredReviews.map((review) => (
                  <div key={review.id} className="min-w-full px-4">
                    <div className="bg-slate-50 p-10 md:p-12 rounded-sm relative border border-slate-100">
                      <img
                        src={
                          review.avatarUrl ||
                          `https://ui-avatars.com/api/?name=${encodeURIComponent(review.studentName)}&background=random`
                        }
                        className="w-16 h-16 rounded-full mx-auto mb-6 object-cover border-2 border-white shadow-sm"
                        alt={review.studentName}
                      />
                      <p className="text-lg font-medium text-slate-600 italic leading-relaxed mb-6">
                        "{review.comment}"
                      </p>
                      <h4 className="text-xs font-black uppercase tracking-widest text-slate-900">
                        {review.studentName}
                      </h4>
                      <div className="flex justify-center text-yellow-500 mt-2 gap-1">
                        {Array.from({ length: review.rating }).map((_, i) => (
                          <Star key={i} size={12} fill="currentColor" />
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <button
              onClick={() =>
                setCurrentReview((p) =>
                  p === 0 ? featuredReviews.length - 1 : p - 1
                )
              }
              className="absolute -left-4 top-1/2 -translate-y-1/2 bg-white w-10 h-10 border border-slate-100 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10 text-slate-400 hover:text-blue-600"
            >
              ❮
            </button>
            <button
              onClick={() =>
                setCurrentReview((p) =>
                  p === featuredReviews.length - 1 ? 0 : p + 1
                )
              }
              className="absolute -right-4 top-1/2 -translate-y-1/2 bg-white w-10 h-10 border border-slate-100 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10 text-slate-400 hover:text-blue-600"
            >
              ❯
            </button>
          </div>
          <div className="flex justify-center gap-2 mt-8">
            {featuredReviews.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentReview(i)}
                className={`h-1 transition-all rounded-full ${currentReview === i ? 'w-6 bg-blue-600' : 'w-1.5 bg-slate-200'}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-slate-900 py-16 px-6 border-t border-white/5">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-12">
          <div className="text-xl font-black text-white tracking-widest">
            <Link to="/">
              EDUCORE<span className="text-blue-600">.</span>
            </Link>
          </div>

          <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] md:order-2 order-3">
            © 2026 Nền tảng học lập trình trực tuyến
          </p>

          <div className="flex flex-wrap justify-center gap-x-8 gap-y-4 md:order-3 order-2">
            {categories.length > 0 ? (
              categories.map((cat) => (
                <Link
                  key={cat.id}
                  to={`/khoa-hoc/danh-muc/${cat.slug}`}
                  className="text-xs font-black text-slate-400 hover:text-blue-500 uppercase tracking-widest transition-all hover:-translate-y-0.5"
                >
                  {cat.name}
                </Link>
              ))
            ) : (
              <Link
                to="/khoa-hoc"
                className="text-xs font-black text-slate-400 hover:text-white uppercase tracking-widest"
              >
                Khóa học
              </Link>
            )}
            <Link
              to="/y-kien-hoc-vien"
              className="text-xs font-black text-blue-500 hover:text-blue-400 uppercase tracking-widest lg:border-l lg:border-white/10 lg:pl-8"
            >
              Đánh giá
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
