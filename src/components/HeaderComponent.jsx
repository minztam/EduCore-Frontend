import { useEffect, useMemo, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  ChevronDown,
  LogOut,
  LayoutDashboard,
  User,
  BookOpen,
  MessageSquare, // Đã thay Settings bằng MessageSquare
} from 'lucide-react';
import { getCategories } from '../api/categoryApi';

const Header = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const menuRef = useRef(null);

  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || 'null');

  // Xử lý hiệu ứng scroll đổi màu header
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Đóng menu khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Lấy danh mục khóa học/blog từ API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await getCategories();
        const data = (res?.data?.data || [])
          .filter((x) => x.isActive)
          .sort((a, b) => a.sortOrder - b.sortOrder);
        setCategories(data);
      } catch (err) {
        console.error('Load header categories failed:', err);
      }
    };
    fetchCategories();
  }, []);

  const groupedChildren = useMemo(() => {
    const map = {};
    categories.forEach((item) => {
      const key = item.parentId || 'root';
      if (!map[key]) map[key] = [];
      map[key].push(item);
    });
    return map;
  }, [categories]);

  const rootMenus = groupedChildren['root'] || [];

  const getMenuLink = (item) => {
    if (item.slug === '/') return '/';
    switch (item.type) {
      case 'Course':
        return item.parentId ? `/khoa-hoc/danh-muc/${item.slug}` : '/khoa-hoc';
      case 'Blog':
        return item.slug === 'bai-viet'
          ? '/bai-viet'
          : `/bai-viet/${item.slug}`;
      default:
        return `/${item.slug}`;
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ${
        isScrolled
          ? 'bg-white/90 backdrop-blur-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] py-3'
          : 'bg-white py-5'
      }`}
    >
      <div className="max-w-[1440px] mx-auto px-8 flex items-center justify-between gap-10">
        {/* ===== LOGO ===== */}
        <Link to="/" className="flex items-center gap-2.5 group shrink-0">
          <div className="w-10 h-10 bg-gradient-to-tr from-blue-700 to-blue-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-200 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
            <span className="text-xl font-black">E</span>
          </div>
          <span className="text-2xl font-black tracking-tight text-slate-900">
            Edu<span className="text-blue-600">Core</span>
          </span>
        </Link>

        {/* ===== MAIN NAV ===== */}
        <nav className="hidden lg:flex items-center gap-1 font-bold text-[14px] text-slate-600">
          {rootMenus.map((item) => {
            const children = groupedChildren[item.id] || [];
            const hasChildren = children.length > 0;

            return (
              <div key={item.id} className="relative group">
                <Link
                  to={getMenuLink(item)}
                  className="flex items-center gap-1.5 px-4 py-2 hover:text-blue-600 transition-all rounded-full hover:bg-blue-50"
                >
                  {item.name}
                  {hasChildren && (
                    <ChevronDown
                      size={14}
                      className="group-hover:rotate-180 transition-transform duration-500 text-slate-400"
                    />
                  )}
                </Link>

                {hasChildren && (
                  <div className="absolute top-full left-0 pt-3 opacity-0 invisible translate-y-2 group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 transition-all duration-300">
                    <div className="w-64 bg-white rounded-none shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-slate-100 overflow-hidden p-2">
                      {children.map((child) => (
                        <Link
                          key={child.id}
                          to={getMenuLink(child)}
                          className="flex items-center gap-3 px-4 py-3 text-sm font-semibold text-slate-600 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition-all"
                        >
                          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                          {child.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* ===== SEARCH BAR ===== */}
        <div className="hidden md:flex flex-1 max-w-md items-center bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 group focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-100 focus-within:border-blue-300 transition-all">
          <Search
            size={18}
            className="text-slate-400 group-focus-within:text-blue-600 transition-colors"
          />
          <input
            type="text"
            placeholder="Tìm kiếm cảm hứng học tập..."
            className="bg-transparent border-none outline-none px-3 text-sm w-full font-semibold text-slate-700 placeholder:text-slate-400 placeholder:font-medium"
          />
        </div>

        {/* ===== AUTH & USER MENU ===== */}
        <div className="flex items-center gap-4" ref={menuRef}>
          {!token ? (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="px-5 py-2.5 text-sm font-black text-slate-600 hover:text-blue-600 transition-colors"
              >
                Đăng nhập
              </Link>
              <Link
                to="/register"
                className="bg-slate-900 text-white px-7 py-3 rounded-2xl text-sm font-black hover:bg-blue-600 transition-all active:scale-95"
              >
                Bắt đầu ngay
              </Link>
            </div>
          ) : (
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-3 p-1 pr-4 bg-white hover:bg-slate-50 transition-all border border-slate-200 shadow-sm rounded-lg"
              >
                {user?.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={user.name}
                    className="w-10 h-10 object-cover border border-slate-100 rounded-none"
                  />
                ) : (
                  <div className="w-10 h-10 bg-slate-900 text-white flex items-center justify-center font-black text-sm rounded-none uppercase">
                    {user?.name?.charAt(0)}
                  </div>
                )}

                <div className="hidden sm:flex flex-col justify-center items-start text-left">
                  <span className="text-[13px] font-black text-slate-900 leading-tight block truncate max-w-[140px]">
                    {user?.name || 'Học viên'}
                  </span>
                  <span className="text-[9px] font-bold text-blue-600 lowercase tracking-wider mt-1 truncate max-w-[140px]">
                    {user?.email}
                  </span>
                </div>

                <ChevronDown
                  size={14}
                  className={`text-slate-400 transition-transform duration-300 ${showUserMenu ? 'rotate-180' : ''}`}
                />
              </button>

              {showUserMenu && (
                <div className="absolute right-0 top-[115%] w-60 bg-white border border-slate-200 shadow-xl z-50 rounded-none overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="p-1">
                    {[
                      {
                        to: '/profile',
                        icon: <User size={16} />,
                        label: 'Hồ sơ cá nhân',
                      },
                      {
                        to: '/my-learning',
                        icon: <BookOpen size={16} />,
                        label: 'Khóa học của tôi',
                      },
                      {
                        to: '/chat', // Thay đổi đường dẫn
                        icon: <MessageSquare size={16} />, // Thay đổi icon
                        label: 'Trò chuyện', // Thay đổi tên hiển thị
                      },
                    ].map((m, idx) => (
                      <Link
                        key={idx}
                        to={m.to}
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center gap-4 px-5 py-3.5 text-[11px] font-black uppercase tracking-[0.15em] text-slate-600 hover:bg-slate-50 hover:text-blue-600 border-l-4 border-transparent hover:border-blue-600 transition-all"
                      >
                        <span className="text-slate-400 group-hover:text-blue-600">
                          {m.icon}
                        </span>
                        {m.label}
                      </Link>
                    ))}

                    {user?.role === 'Admin' && (
                      <Link
                        to="/admin"
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center gap-4 px-5 py-3.5 text-[11px] font-black uppercase tracking-[0.15em] text-indigo-600 bg-indigo-50/50 hover:bg-indigo-50 border-l-4 border-indigo-600 transition-all mt-1"
                      >
                        <LayoutDashboard size={16} />
                        Quản trị hệ thống
                      </Link>
                    )}

                    <div className="mt-1 border-t border-slate-100">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-4 px-5 py-4 text-[11px] font-black uppercase tracking-[0.15em] text-red-500 hover:bg-red-50 border-l-4 border-transparent hover:border-red-500 transition-all"
                      >
                        <LogOut size={16} />
                        Đăng xuất
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
