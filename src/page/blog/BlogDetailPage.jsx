import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ChevronLeft,
  Share2,
  Calendar,
  Bookmark,
  MessageSquare,
  Clock,
  Eye,
} from 'lucide-react';
import Header from '../../components/HeaderComponent';
import { getPostBySlug } from '../../api/postApi';
import { Typography, Spin, Button, Avatar, Divider } from 'antd';

const { Text } = Typography;

const BlogDetailPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();

  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);

  // Chống React StrictMode gọi API 2 lần trong môi trường dev
  const fetchedSlugRef = useRef(null);

  useEffect(() => {
    if (fetchedSlugRef.current === slug) return;
    fetchedSlugRef.current = slug;

    const fetchBlog = async () => {
      try {
        setLoading(true);
        const res = await getPostBySlug(slug);
        setBlog(res?.data?.data);
      } catch (err) {
        console.error('Load blog detail failed:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBlog();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [slug]);

  if (loading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-white">
        <Spin size="large" />
        <p className="mt-4 text-slate-500 font-bold uppercase tracking-widest text-[10px]">
          Đang tải bài viết...
        </p>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#f8fafc] font-bold uppercase">
        Không tìm thấy bài viết
      </div>
    );
  }

  return (
    <div className="bg-[#f8fafc] min-h-screen pb-20 font-sans antialiased">
      <Header />

      {/* BACKGROUND DECOR - No rounding */}
      <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-blue-50 to-transparent -z-10" />
      <main className="mx-auto px-4 pt-10 md:pt-32">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* LEFT CONTENT */}
          <div className="lg:w-2/3">
            {/* BACK BUTTON - Square */}
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-all font-black text-xs mb-6 uppercase tracking-widest border-l-2 border-blue-600 pl-4"
            >
              <ChevronLeft size={16} />
              <span>Bài viết / {blog.category?.name}</span>
            </button>

            {/* TITLE */}
            <h1 className="text-3xl md:text-5xl font-black text-slate-900 leading-tight mb-10 tracking-tight">
              {blog.title}
            </h1>

            {/* FEATURED IMAGE - Removed rounded-[2rem] and shadow rounding */}
            <div className="relative mb-10 overflow-hidden border border-slate-200 shadow-lg">
              <img
                src={blog.thumbnail}
                alt={blog.title}
                className="w-full h-[450px] object-cover"
              />
            </div>

            {/* CONTENT ARTICLE - Removed all rounded classes */}
            <article
              className="bg-white p-8 md:p-14 border border-slate-100 shadow-sm prose prose-slate prose-lg max-w-none
                prose-p:text-slate-600 prose-p:leading-relaxed
                prose-headings:text-slate-900 prose-headings:font-black
                prose-blockquote:border-l-4 prose-blockquote:border-blue-600 prose-blockquote:bg-slate-50 prose-blockquote:rounded-none"
              dangerouslySetInnerHTML={{ __html: blog.content }}
            />
          </div>

          {/* RIGHT SIDEBAR */}
          <div className="lg:w-1/3">
            <div className="sticky top-24 space-y-6">
              {/* AUTHOR BOX - Removed rounded-3xl */}
              <div className="bg-white p-8 border border-slate-200 shadow-sm">
                <Text className="text-[10px] uppercase font-black text-slate-400 tracking-[0.2em] block mb-6">
                  Tác giả biên soạn
                </Text>

                <div className="flex items-center gap-4 mb-6">
                  {/* Avatar - antd Avatar still has circle option but container is square */}
                  <Avatar
                    size={64}
                    shape="square"
                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${blog.authorName}`}
                    className="bg-blue-100 border border-slate-200"
                  />
                  <div>
                    <Text
                      strong
                      className="text-lg block text-slate-900 leading-none"
                    >
                      {blog.authorName}
                    </Text>
                    <Text className="text-[10px] uppercase font-bold text-blue-600 tracking-wider">
                      Expert Contributor
                    </Text>
                  </div>
                </div>

                <Divider className="my-6 border-slate-100" />

                <div className="grid grid-cols-2 gap-px bg-slate-200 border border-slate-200">
                  <div className="bg-white p-4 text-center">
                    <div className="flex justify-center items-center gap-2 mb-1 text-slate-400">
                      <Eye size={14} />
                      <span className="text-[9px] uppercase font-black tracking-widest">
                        Lượt xem
                      </span>
                    </div>
                    <Text strong className="text-blue-600 text-lg">
                      {blog.viewCount?.toLocaleString('vi-VN')}
                    </Text>
                  </div>
                  <div className="bg-white p-4 text-center">
                    <div className="flex justify-center items-center gap-2 mb-1 text-slate-400">
                      <Clock size={14} />
                      <span className="text-[9px] uppercase font-black tracking-widest">
                        Thời gian
                      </span>
                    </div>
                    <Text strong className="text-blue-600 text-lg">
                      15 Phút
                    </Text>
                  </div>
                </div>
              </div>

              {/* ACTIONS BOX - Removed rounded-3xl */}
              <div className="bg-[#0f172a] p-8 text-white border border-slate-800 shadow-xl">
                <h3 className="text-white font-black text-xl mb-2 tracking-tight">
                  Tương tác bài viết
                </h3>
                <p className="text-slate-400 text-sm mb-8 leading-relaxed">
                  Chia sẻ cho cộng đồng hoặc lưu lại trong bộ sưu tập cá nhân
                  của bạn.
                </p>

                <div className="space-y-3">
                  <Button
                    block
                    size="large"
                    icon={<Share2 size={18} />}
                    className="h-12 border-none bg-blue-600 hover:bg-blue-700 text-white font-black uppercase text-[11px] tracking-[0.15em] rounded-none shadow-none"
                  >
                    Chia sẻ bài viết
                  </Button>

                  <Button
                    block
                    size="large"
                    ghost
                    icon={<Bookmark size={18} />}
                    className="h-12 border-slate-600 text-white font-black uppercase text-[11px] tracking-[0.15em] rounded-none hover:bg-white hover:text-slate-900"
                  >
                    Lưu vào bộ sưu tập
                  </Button>
                </div>
              </div>

              {/* META INFO - Removed rounded-xl */}
              <div className="px-2 space-y-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-white border border-slate-200 text-blue-600">
                    <Calendar size={20} />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-black text-slate-400 tracking-widest block mb-1">
                      Cập nhật cuối
                    </span>
                    <span className="text-sm font-bold text-slate-700">
                      {new Date(
                        blog.updatedAt || blog.createdAt
                      ).toLocaleDateString('vi-VN')}
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-3 bg-white border border-slate-200 text-blue-600">
                    <MessageSquare size={20} />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-black text-slate-400 tracking-widest block mb-1">
                      Hỗ trợ chuyên gia
                    </span>
                    <span className="text-sm font-bold text-slate-700">
                      Trực tuyến 24/7
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default BlogDetailPage;
