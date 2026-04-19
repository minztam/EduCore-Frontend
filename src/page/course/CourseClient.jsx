import React, { useEffect, useState, useMemo } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Clock3, BookOpen, Search, ChevronRight } from 'lucide-react';
import Header from '../../components/HeaderComponent';
import { getCourses } from '../../api/courseApi';
import { getCategories } from '../../api/categoryApi';
import { Spin, Empty, ConfigProvider } from 'antd';

const CourseClient = () => {
  const { categorySlug } = useParams();
  const navigate = useNavigate();

  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const [activeLevel, setActiveLevel] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [priceRange, setPriceRange] = useState('All');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [resCourses, resCategories] = await Promise.all([
        getCourses(),
        getCategories(),
      ]);
      setCourses(resCourses?.data?.data || []);
      setCategories(resCategories?.data?.data || []);
    } catch (error) {
      console.error('Lỗi tải dữ liệu:', error);
    } finally {
      setLoading(false);
    }
  };

  const courseSubCategories = useMemo(() => {
    return categories
      .filter((cat) => cat.type === 'Course' && cat.parentId !== null)
      .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
  }, [categories]);

  const currentCategory = useMemo(() => {
    if (!categorySlug) return null;
    return categories.find((cat) => cat.slug === categorySlug) || null;
  }, [categorySlug, categories]);

  const filteredCourses = useMemo(() => {
    return courses.filter((course) => {
      const matchCategory =
        !currentCategory || course.categoryId === currentCategory.id;
      const matchLevel = activeLevel === 'All' || course.level === activeLevel;
      const matchSearch = (course.title || '')
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const coursePrice = Number(course.price) || 0;
      const matchPrice =
        priceRange === 'All'
          ? true
          : priceRange === 'Free'
            ? coursePrice === 0
            : coursePrice > 0;
      return matchCategory && matchLevel && matchSearch && matchPrice;
    });
  }, [courses, currentCategory, activeLevel, searchQuery, priceRange]);

  const getLevelLabel = (level) => {
    const map = {
      Beginner: 'Cơ bản',
      Intermediate: 'Trung cấp',
      Advanced: 'Nâng cao',
    };
    return map[level] || level;
  };

  return (
    <div className="bg-white min-h-screen font-sans">
      <Header />
      <ConfigProvider
        theme={{ token: { fontFamily: 'Inter, sans-serif', borderRadius: 2 } }}
      >
        <main className="max-w-7xl mx-auto px-6 pt-32 pb-20">
          <div className="flex flex-col md:flex-row gap-16">
            {/* SIDEBAR FILTER */}
            <aside className="md:w-64 flex-shrink-0">
              <div className="sticky top-32 space-y-12">
                {/* Search Box */}
                <div className="space-y-5">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600">
                    Tìm kiếm
                  </h3>
                  <div className="relative group">
                    <Search
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors"
                      size={14}
                    />
                    <input
                      type="text"
                      placeholder="NHẬP TỪ KHÓA..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-transparent text-[11px] font-bold tracking-widest outline-none focus:bg-white focus:border-blue-600 transition-all uppercase placeholder:text-slate-300"
                    />
                  </div>
                </div>

                {/* Categories Filter */}
                <div className="space-y-5">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600">
                    Danh mục
                  </h3>
                  <div className="flex flex-col gap-1">
                    <button
                      onClick={() => navigate('/khoa-hoc')}
                      className={`flex items-center justify-between px-4 py-3 text-[11px] font-black uppercase tracking-widest transition-all ${
                        !categorySlug
                          ? 'bg-slate-900 text-white shadow-xl translate-x-1'
                          : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                      }`}
                    >
                      Tất cả <ChevronRight size={12} />
                    </button>
                    {courseSubCategories.map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() =>
                          navigate(`/khoa-hoc/danh-muc/${cat.slug}`)
                        }
                        className={`flex items-center justify-between px-4 py-3 text-[11px] font-black uppercase tracking-widest transition-all ${
                          categorySlug === cat.slug
                            ? 'bg-slate-900 text-white shadow-xl translate-x-1'
                            : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                        }`}
                      >
                        {cat.name} <ChevronRight size={12} />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Level Filter */}
                <div className="space-y-5">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600">
                    Trình độ
                  </h3>
                  <div className="flex flex-col gap-1">
                    {['All', 'Beginner', 'Intermediate', 'Advanced'].map(
                      (lvl) => (
                        <button
                          key={lvl}
                          onClick={() => setActiveLevel(lvl)}
                          className={`text-left px-4 py-2 text-[11px] font-black uppercase tracking-widest transition-all ${
                            activeLevel === lvl
                              ? 'text-blue-600 border-l-2 border-blue-600'
                              : 'text-slate-400 hover:text-slate-900 border-l-2 border-transparent'
                          }`}
                        >
                          {lvl === 'All' ? 'Mọi trình độ' : getLevelLabel(lvl)}
                        </button>
                      )
                    )}
                  </div>
                </div>
              </div>
            </aside>

            {/* MAIN CONTENT */}
            <div className="flex-1">
              <div className="mb-16 border-b border-slate-100 pb-10">
                <span className="text-blue-600 font-bold text-xs uppercase tracking-widest mb-3 block">
                  EduCore Academy
                </span>
                <h1 className="text-4xl font-black text-slate-900 uppercase tracking-tighter">
                  {currentCategory ? currentCategory.name : 'Tất cả khóa học'}
                </h1>
              </div>

              {loading ? (
                <div className="py-40 text-center">
                  <Spin size="large" />
                </div>
              ) : filteredCourses.length === 0 ? (
                <div className="py-32 text-center bg-slate-50 rounded-sm border border-dashed border-slate-200">
                  <Empty
                    description={
                      <span className="font-black text-slate-400 text-[10px] uppercase tracking-widest">
                        Không có kết quả
                      </span>
                    }
                  />
                  <button
                    onClick={() => {
                      navigate('/khoa-hoc');
                      setSearchQuery('');
                      setActiveLevel('All');
                      setPriceRange('All');
                    }}
                    className="mt-8 text-blue-600 font-black text-[10px] uppercase tracking-[0.2em] border-b-2 border-blue-600 pb-1"
                  >
                    Xóa bộ lọc
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-10">
                  {filteredCourses.map((course) => (
                    <Link
                      key={course.id}
                      to={`/khoa-hoc/chi-tiet/${course.slug}`}
                      className="group bg-white border border-slate-100 overflow-hidden hover:border-blue-200 transition-all duration-500 flex flex-col rounded-sm"
                    >
                      <div className="relative aspect-video overflow-hidden bg-black">
                        <img
                          src={course.thumbnailUrl}
                          alt={course.title}
                          className="w-full h-full object-cover brightness-90 group-hover:brightness-110 group-hover:scale-105 transition-all duration-700"
                        />
                        <div className="absolute top-4 left-4">
                          <span className="bg-white text-slate-900 text-[9px] font-black px-2 py-1 uppercase tracking-widest">
                            {getLevelLabel(course.level)}
                          </span>
                        </div>
                      </div>

                      <div className="p-8 flex flex-col flex-1">
                        <div className="flex items-center gap-2 text-[9px] font-black text-slate-400 uppercase tracking-widest mb-4">
                          <span className="flex items-center gap-1">
                            <BookOpen size={10} /> {course.totalLessons} Bài
                          </span>
                          <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                          <span className="flex items-center gap-1">
                            <Clock3 size={10} /> {course.totalDuration} Giờ
                          </span>
                        </div>

                        <h2 className="text-base font-black text-slate-900 line-clamp-2 mb-8 group-hover:text-blue-600 transition-colors uppercase tracking-tight leading-tight h-10">
                          {course.title}
                        </h2>

                        <div className="mt-auto pt-6 border-t border-slate-50 flex items-center justify-between">
                          <span className="text-[11px] font-black tracking-[0.15em] uppercase text-slate-900">
                            {Number(course.price) === 0 ? (
                              <span className="text-emerald-600">Miễn phí</span>
                            ) : (
                              `${Number(course.price).toLocaleString()}đ`
                            )}
                          </span>
                          <ChevronRight
                            size={16}
                            className="text-blue-600 group-hover:translate-x-1 transition-transform"
                          />
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>
      </ConfigProvider>
    </div>
  );
};

export default CourseClient;
