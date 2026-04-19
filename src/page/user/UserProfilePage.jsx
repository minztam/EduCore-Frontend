import React, { useEffect, useState, useCallback } from 'react';
import { getUserById, updateUserProfile } from '../../api/userApi';
import { getMyCourses } from '../../api/enrollmentApi';
import {
  Loader2,
  Camera,
  Save,
  BookOpen,
  Clock,
  LayoutDashboard,
  LogOut,
  ArrowRight,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/HeaderComponent';
import { Spin, ConfigProvider } from 'antd';

const UserProfilePage = () => {
  const navigate = useNavigate();
  const currentUser = JSON.parse(localStorage.getItem('user') || 'null');
  const userId = currentUser?.id;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [myCourses, setMyCourses] = useState([]);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      const [userRes, enrollRes] = await Promise.all([
        getUserById(userId),
        getMyCourses(userId),
      ]);

      const user = userRes.data.data;
      // Đã loại bỏ setProfile để tránh lỗi "assigned a value but never used"
      setName(user.name || '');
      setEmail(user.email || '');
      setAvatarPreview(user.avatarUrl || '');
      setMyCourses(enrollRes?.data?.data || []);
    } catch (error) {
      setMessage({ type: 'error', text: 'Không tải được thông tin hồ sơ' });
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return navigate('/login');
    }
    fetchProfile();
  }, [userId, fetchProfile, navigate]);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const formData = new FormData();
      if (name?.trim()) formData.append('name', name.trim());
      if (password?.trim()) formData.append('password', password.trim());
      if (avatarFile) formData.append('avata', avatarFile);

      await updateUserProfile(userId, formData);
      const updatedRes = await getUserById(userId);
      const updatedUser = updatedRes.data.data;

      localStorage.setItem('user', JSON.stringify(updatedUser));
      setMessage({ type: 'success', text: 'Cập nhật thành công!' });
      setPassword('');
      setAvatarFile(null);
      await fetchProfile();
    } catch (error) {
      setMessage({ type: 'error', text: 'Cập nhật thất bại' });
    } finally {
      setSaving(false);
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    }
  };

  if (loading)
    return (
      <div className="h-screen flex items-center justify-center bg-white">
        <Spin size="large" />
      </div>
    );

  return (
    <ConfigProvider theme={{ token: { fontFamily: 'Inter, sans-serif' } }}>
      <div className="bg-white min-h-screen font-sans text-slate-900">
        <Header />

        <main className="max-w-7xl mx-auto px-6 pt-32 pb-20">
          <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-100 pb-10">
            <div>
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 mb-4">
                <LayoutDashboard size={12} /> BẢNG ĐIỀU KHIỂN TÀI KHOẢN
              </div>
              <h1 className="text-5xl font-black uppercase tracking-tighter text-slate-900">
                Hồ sơ cá nhân
              </h1>
            </div>
            <button
              onClick={() => {
                localStorage.clear();
                navigate('/login');
              }}
              className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-red-500 hover:text-red-700 transition-colors"
            >
              Đăng xuất <LogOut size={14} />
            </button>
          </div>

          <div className="grid lg:grid-cols-12 gap-16">
            <aside className="lg:col-span-4 space-y-12">
              <div className="space-y-8">
                {/* Khu vực ảnh đại diện */}
                <div className="relative group w-fit mx-auto lg:mx-0">
                  <div className="w-48 h-48 bg-slate-50 overflow-hidden rounded-sm border border-slate-100">
                    <img
                      src={
                        avatarPreview ||
                        `https://ui-avatars.com/api/?name=${name}&background=f8fafc&color=000`
                      }
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      alt="Ảnh đại diện"
                    />
                  </div>
                  <label className="absolute -bottom-4 -right-4 bg-blue-600 text-white p-4 cursor-pointer hover:bg-slate-900 transition-colors shadow-xl">
                    <Camera size={20} />
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleAvatarChange}
                    />
                  </label>
                </div>

                <div className="grid grid-cols-2 border-y border-slate-100 py-8">
                  <div className="space-y-1">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">
                      Đang học
                    </span>
                    <span className="text-xl font-black">
                      {myCourses.length} Khóa học
                    </span>
                  </div>
                  <div className="space-y-1 border-l border-slate-100 pl-8">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">
                      Chứng chỉ
                    </span>
                    <span className="text-xl font-black text-blue-600">
                      {
                        myCourses.filter((c) => c.progressPercent === 100)
                          .length
                      }{' '}
                      Đã nhận
                    </span>
                  </div>
                </div>

                <div className="space-y-6">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600">
                    Thông tin cơ bản
                  </h3>

                  {message.text && (
                    <div
                      className={`p-4 text-[11px] font-black uppercase tracking-widest ${message.type === 'success' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}
                    >
                      {message.text}
                    </div>
                  )}

                  <div className="space-y-6">
                    {/* Tên hiển thị */}
                    <div className="group">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">
                        Tên hiển thị
                      </label>
                      <input
                        className="w-full bg-slate-50 border-b border-slate-200 py-3 pl-6 pr-0 font-bold text-slate-800 outline-none focus:border-blue-600 transition-colors uppercase text-xs tracking-wider"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                      />
                    </div>

                    {/* Địa chỉ Email */}
                    <div className="group opacity-50">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">
                        Địa chỉ Email
                      </label>
                      <input
                        className="w-full bg-transparent border-b border-slate-100 py-3 pl-6 pr-0 font-bold text-slate-400 outline-none cursor-not-allowed text-xs"
                        value={email}
                        disabled
                      />
                    </div>

                    {/* Mật khẩu mới */}
                    <div className="group">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">
                        Mật khẩu mới
                      </label>
                      <input
                        type="password"
                        placeholder="••••••••"
                        className="w-full bg-slate-50 border-b border-slate-200 py-3 pl-6 pr-0 font-bold text-slate-800 outline-none focus:border-blue-600 transition-colors text-xs tracking-widest"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                    </div>
                  </div>

                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="w-full bg-slate-900 text-white py-5 text-[11px] font-black uppercase tracking-[0.2em] hover:bg-blue-600 transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
                  >
                    {saving ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <Save size={16} />
                    )}
                    Lưu hồ sơ
                  </button>
                </div>
              </div>
            </aside>

            <div className="lg:col-span-8">
              <div className="space-y-10">
                <div className="flex items-center justify-between border-b border-slate-100 pb-6">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600">
                    Lộ trình học tập
                  </h3>
                </div>

                <div className="grid grid-cols-1 gap-6">
                  {myCourses.length > 0 ? (
                    myCourses.map((item) => (
                      <div
                        key={item.id}
                        className="group border border-slate-100 hover:border-blue-100 p-6 transition-all duration-300 flex flex-col md:flex-row gap-8 items-center bg-white"
                      >
                        <div className="w-full md:w-40 aspect-video bg-slate-50 overflow-hidden shrink-0 border border-slate-100">
                          <img
                            src={item.course.thumbnailUrl}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                            alt="Khóa học"
                          />
                        </div>

                        <div className="flex-1 flex flex-col justify-between self-stretch w-full py-1">
                          {/* Phần trên: Tiêu đề và Level */}
                          <div className="flex justify-between items-start gap-4">
                            <h4 className="text-lg font-black uppercase tracking-tight leading-tight group-hover:text-blue-600 transition-colors line-clamp-1 flex-1">
                              {item.course.title}
                            </h4>
                            <span className="text-[9px] font-black bg-slate-100 text-slate-900 px-2 py-1 uppercase whitespace-nowrap">
                              {item.course.level === 'Beginner'
                                ? 'Cơ bản'
                                : item.course.level === 'Intermediate'
                                  ? 'Trung cấp'
                                  : item.course.level === 'Advanced'
                                    ? 'Nâng cao'
                                    : item.course.level}
                            </span>
                          </div>

                          {/* Phần giữa: Thanh tiến độ */}
                          <div className="space-y-2 my-4">
                            <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                              <span className="text-slate-400">Tiến độ</span>
                              <span
                                className={
                                  item.progressPercent === 100
                                    ? 'text-green-500'
                                    : 'text-slate-900'
                                }
                              >
                                {item.progressPercent || 0}%
                              </span>
                            </div>
                            <div className="h-1.5 bg-slate-50 w-full relative rounded-full overflow-hidden">
                              <div
                                className={`h-full transition-all duration-1000 ${
                                  item.progressPercent === 100
                                    ? 'bg-green-500'
                                    : 'bg-blue-600'
                                }`}
                                style={{
                                  width: `${item.progressPercent || 0}%`,
                                }}
                              />
                            </div>
                          </div>

                          {/* Phần dưới: Thời gian và Trạng thái */}
                          <div className="flex items-center gap-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-auto">
                            <span className="flex items-center gap-2">
                              <Clock size={12} /> {item.course.totalDuration}{' '}
                              PHÚT
                            </span>
                            <span
                              className={`flex items-center gap-2 font-black ${
                                item.progressPercent === 100
                                  ? 'text-green-600'
                                  : 'text-slate-600'
                              }`}
                            >
                              <div
                                className={`w-1.5 h-1.5 rounded-full ${
                                  item.progressPercent === 100
                                    ? 'bg-green-500'
                                    : 'bg-blue-600'
                                }`}
                              />
                              {item.progressPercent === 100
                                ? 'ĐÃ HOÀN THÀNH'
                                : 'ĐANG HỌC'}
                            </span>
                          </div>
                        </div>

                        <button
                          onClick={() => navigate(`/learn/${item.course.slug}`)}
                          className="w-full md:w-auto bg-slate-50 border border-slate-100 p-4 hover:bg-blue-600 hover:text-white transition-all flex items-center justify-center"
                        >
                          <ArrowRight size={20} />
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="py-24 border border-dashed border-slate-100 text-center space-y-6">
                      <BookOpen size={40} className="mx-auto text-slate-200" />
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                        Chưa có khóa học nào
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </ConfigProvider>
  );
};

export default UserProfilePage;
