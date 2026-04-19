import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  ListTree,
  BookOpen,
  Users,
  ImagePlus,
  Newspaper,
  Star,
  Settings,
} from 'lucide-react';

const Sidebar = () => {
  const { pathname } = useLocation();

  // Khởi tạo state an toàn
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('user')) || {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    const handleUpdateUser = () => {
      try {
        const updatedUser = JSON.parse(localStorage.getItem('user')) || {};
        setUser(updatedUser);
      } catch (err) {
        // Chỉ log lỗi nếu thực sự cần thiết, còn không thì im lặng
      }
    };

    // Lắng nghe các sự kiện để cập nhật UI
    window.addEventListener('userUpdate', handleUpdateUser);
    window.addEventListener('storage', handleUpdateUser);

    return () => {
      window.removeEventListener('userUpdate', handleUpdateUser);
      window.removeEventListener('storage', handleUpdateUser);
    };
  }, []);

  const menu = [
    { name: 'Dashboard', path: '/admin', icon: <LayoutDashboard size={18} /> },
    {
      name: 'Danh mục',
      path: '/admin/categories',
      icon: <ListTree size={18} />,
    },
    { name: 'Khóa học', path: '/admin/course', icon: <BookOpen size={18} /> },
    { name: 'Người dùng', path: '/admin/users', icon: <Users size={18} /> },
    { name: 'Review', path: '/admin/review', icon: <Star size={18} /> },
    { name: 'Bài viết', path: '/admin/posts', icon: <Newspaper size={18} /> },
    {
      name: 'Home Hero',
      path: '/admin/home-hero',
      icon: <ImagePlus size={18} />,
    },
    {
      name: 'Tài chính',
      path: `/admin/tai-chinh`,
      icon: <Settings size={18} />,
    },
  ];

  const avatarImage = user.avatarUrl
    ? user.avatarUrl
    : `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name || 'Admin'}`;

  return (
    <div className="fixed top-0 left-0 w-56 h-screen bg-slate-950 text-white px-4 py-5 shadow-2xl flex flex-col z-50">
      <div className="flex-1">
        <h2 className="text-xl font-bold tracking-tight mb-8 text-center text-blue-500">
          EduCore{' '}
          <span className="text-white text-xs block font-light">
            ADMIN PANEL
          </span>
        </h2>

        <nav>
          <ul className="space-y-1">
            {menu.map((item) => {
              const isActive =
                item.path === '/admin'
                  ? pathname === '/admin'
                  : pathname.startsWith(item.path);
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20'
                        : 'text-slate-400 hover:bg-slate-900 hover:text-white'
                    }`}
                  >
                    {item.icon}
                    <span className="text-sm font-medium">{item.name}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>

      <div className="mt-auto border-t border-slate-800 pt-6">
        <div className="bg-slate-900/50 rounded-2xl p-4 flex flex-col items-center border border-slate-800">
          <div className="relative">
            <img
              src={avatarImage}
              alt="avatar"
              className="w-12 h-12 rounded-full object-cover ring-2 ring-blue-500 bg-slate-800"
            />
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-slate-900 rounded-full"></div>
          </div>

          <div className="mt-3 text-center w-full px-2">
            <h3 className="text-sm font-semibold truncate text-white">
              {user.name || 'Người dùng'}
            </h3>
            <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mt-1">
              Administrator
            </p>
          </div>

          <Link
            to={`/admin/cai-dat/${user.id}`}
            className="mt-4 w-full text-center text-xs bg-slate-800 hover:bg-blue-600 transition-all rounded-lg py-2.5 font-medium text-white"
          >
            Quản lý hồ sơ
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
