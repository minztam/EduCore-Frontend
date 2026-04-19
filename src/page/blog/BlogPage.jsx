import React, { useEffect, useState, useMemo } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  Clock3,
  Search,
  ChevronRight,
  Calendar,
  Eye,
  BookOpen,
} from 'lucide-react';
import { Spin, Empty, ConfigProvider } from 'antd';
import Header from '../../components/HeaderComponent';
import { getPosts } from '../../api/postApi';
import { getCategories } from '../../api/categoryApi';

const BlogPage = () => {
  const navigate = useNavigate();
  const { categorySlug } = useParams();

  // --- LOGIC: GIỮ NGUYÊN STATE CỦA BẠN ---
  const [blogs, setBlogs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState(''); // Thêm state search để view sidebar hoạt động

  // 1. Fetch Categories (Logic cũ)
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await getCategories();
        const items = (res?.data?.data || []).filter(
          (x) => x.type === 'Blog' && x.isActive && x.parentId
        );
        setCategories([
          { id: null, name: 'Tất cả bài viết', slug: 'all' },
          ...items,
        ]);
      } catch (err) {
        console.error('Load categories failed:', err);
      }
    };
    fetchCategories();
  }, []);

  // 2. Sync URL with State (Logic cũ)
  useEffect(() => {
    if (!categories.length) return;
    const matched = categories.find((x) => x.slug === categorySlug);
    setActiveCategory(matched?.id || null);
  }, [categorySlug, categories]);

  // 3. Fetch Posts when Category changes (Logic cũ)
  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      try {
        const res = await getPosts({
          page: 1,
          pageSize: 12,
          categoryId: activeCategory,
        });
        setBlogs(res?.data?.data?.items || []);
      } catch (err) {
        console.error('Fetch posts error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, [activeCategory]);

  const handleFilter = (cat) => {
    const path =
      !cat.slug || cat.slug === 'all' ? '/bai-viet' : `/bai-viet/${cat.slug}`;
    navigate(path);
  };

  // Logic phụ để tìm tên danh mục hiện tại hiển thị ở Title
  const currentCategoryName = useMemo(() => {
    return (
      categories.find((c) => c.id === activeCategory)?.name || 'Tất cả bài viết'
    );
  }, [categories, activeCategory]);

  return (
    <div className="bg-white min-h-screen font-sans">
      <Header />
      <ConfigProvider
        theme={{ token: { fontFamily: 'Inter, sans-serif', borderRadius: 2 } }}
      >
        <main className="max-w-7xl mx-auto px-6 pt-32 pb-20">
          <div className="flex flex-col md:flex-row gap-16">
            {/* --- VIEW: SIDEBAR ĐỒNG BỘ COURSECLIENT --- */}
            <aside className="md:w-64 flex-shrink-0">
              <div className="sticky top-32 space-y-12">
                {/* Search Box */}
                <div className="space-y-5">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600">
                    Tìm bài viết
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
                    Chuyên mục
                  </h3>
                  <div className="flex flex-col gap-1">
                    {categories.map((cat) => (
                      <button
                        key={cat.id || 'all'}
                        onClick={() => handleFilter(cat)}
                        className={`flex items-center justify-between px-4 py-3 text-[11px] font-black uppercase tracking-widest transition-all ${
                          activeCategory === cat.id
                            ? 'bg-slate-900 text-white shadow-xl translate-x-1'
                            : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                        }`}
                      >
                        {cat.name} <ChevronRight size={12} />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </aside>

            {/* --- VIEW: MAIN CONTENT ĐỒNG BỘ COURSECLIENT --- */}
            <div className="flex-1">
              <div className="mb-16 border-b border-slate-100 pb-10">
                <span className="text-blue-600 font-bold text-xs uppercase tracking-widest mb-3 block">
                  Knowledge Hub
                </span>
                <h1 className="text-4xl font-black text-slate-900 uppercase tracking-tighter">
                  {currentCategoryName}
                </h1>
              </div>

              {loading ? (
                <div className="py-40 text-center">
                  <Spin size="large" />
                </div>
              ) : blogs.length === 0 ? (
                <div className="py-32 text-center bg-slate-50 rounded-sm border border-dashed border-slate-200">
                  <Empty
                    description={
                      <span className="font-black text-slate-400 text-[10px] uppercase tracking-widest">
                        Không tìm thấy nội dung
                      </span>
                    }
                  />
                  <button
                    onClick={() => navigate('/bai-viet')}
                    className="mt-8 text-blue-600 font-black text-[10px] uppercase tracking-[0.2em] border-b-2 border-blue-600 pb-1"
                  >
                    Quay lại tất cả
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-10">
                  {blogs.map((item) => (
                    <Link
                      key={item.id}
                      to={`/bai-viet/chi-tiet/${item.slug}`}
                      className="group bg-white border border-slate-100 overflow-hidden hover:border-blue-200 transition-all duration-500 flex flex-col rounded-sm"
                    >
                      {/* Thumbnail */}
                      <div className="relative aspect-video overflow-hidden bg-black">
                        <img
                          src={item.thumbnail}
                          alt={item.title}
                          className="w-full h-full object-cover brightness-90 group-hover:brightness-110 group-hover:scale-105 transition-all duration-700"
                        />
                        <div className="absolute top-4 left-4">
                          <span className="bg-white text-slate-900 text-[9px] font-black px-2 py-1 uppercase tracking-widest">
                            {item.category?.name || 'Blog'}
                          </span>
                        </div>
                      </div>

                      {/* Info */}
                      <div className="p-8 flex flex-col flex-1">
                        <div className="flex items-center gap-2 text-[9px] font-black text-slate-400 uppercase tracking-widest mb-4">
                          <span className="flex items-center gap-1">
                            <Calendar size={10} />{' '}
                            {new Date(item.createdAt).toLocaleDateString(
                              'vi-VN'
                            )}
                          </span>
                          <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                          <span className="flex items-center gap-1">
                            <Eye size={10} /> {item.viewCount?.toLocaleString()}{' '}
                            Lượt xem
                          </span>
                        </div>

                        <h2 className="text-base font-black text-slate-900 line-clamp-2 mb-8 group-hover:text-blue-600 transition-colors uppercase tracking-tight leading-tight h-10">
                          {item.title}
                        </h2>

                        <div className="mt-auto pt-6 border-t border-slate-50 flex items-center justify-between">
                          <span className="text-[11px] font-black tracking-[0.15em] uppercase text-slate-900 flex items-center gap-2">
                            <Clock3 size={12} /> 10 Phút đọc
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

export default BlogPage;
