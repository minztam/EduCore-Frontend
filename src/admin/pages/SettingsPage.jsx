import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  Input,
  Button,
  Upload,
  message,
  Divider,
  Typography,
} from 'antd';
import { User, Mail, Lock, Camera, Save } from 'lucide-react';
import { updateUserProfile } from '../../api/userApi';

const { Title, Text } = Typography;

const SettingsPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem('user')) || {}
  );
  const [previewImage, setPreviewImage] = useState(null);
  const [file, setFile] = useState(null);
  const [name, setName] = useState(user.name || '');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const handleBeforeUpload = (file) => {
    const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
    if (!isJpgOrPng) {
      message.error('Bạn chỉ có thể tải lên file JPG/PNG!');
      return false;
    }
    setFile(file);
    const reader = new FileReader();
    reader.onload = () => setPreviewImage(reader.result);
    reader.readAsDataURL(file);
    return false;
  };

  const handleUpdate = async () => {
    if (!name.trim())
      return message.warning('Tên hiển thị không được để trống!');

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('name', name);

      // KHẮC PHỤC LỖI: Gửi key 'password' để khớp với tham số Back-end C#
      if (newPassword) {
        formData.append('password', newPassword);
      }

      // KHẮC PHỤC LỖI: Gửi key 'avata' (không có r) để khớp với Back-end C#
      if (file) {
        formData.append('avata', file);
      }

      const response = await updateUserProfile(user.id, formData);
      const updatedData = response.data;

      if (newPassword) {
        // Nếu có đổi mật khẩu thành công -> Bắt đăng nhập lại
        message.success('Đổi mật khẩu thành công! Vui lòng đăng nhập lại.');
        localStorage.clear();
        setTimeout(() => navigate('/login'), 1500);
      } else {
        // Cập nhật thông tin vào bộ nhớ trình duyệt
        const newUser = {
          ...user,
          name: updatedData.name || name,
          avatarUrl: updatedData.avatarUrl || user.avatarUrl,
        };

        localStorage.setItem('user', JSON.stringify(newUser));
        setUser(newUser); // Cập nhật giao diện tại trang hiện tại

        // Phát tín hiệu cho Sidebar cập nhật ngay lập tức
        window.dispatchEvent(new Event('userUpdate'));

        message.success('Cập nhật hồ sơ thành công!');
        setOldPassword('');
        setNewPassword('');
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Cập nhật thất bại!';
      message.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <Title level={2}>Cài đặt tài khoản</Title>
        <Text type="secondary">
          Quản lý thông tin cá nhân và thiết lập bảo mật.
        </Text>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Cột trái: Avatar */}
        <Card className="md:col-span-1 text-center shadow-sm rounded-2xl border-none">
          <div className="relative inline-block group">
            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-blue-50 shadow-lg mb-4 bg-slate-100 flex items-center justify-center">
              <img
                src={
                  previewImage ||
                  user.avatarUrl ||
                  `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`
                }
                alt="Avatar"
                className="w-full h-full object-cover"
              />
            </div>
            <Upload showUploadList={false} beforeUpload={handleBeforeUpload}>
              <div className="absolute bottom-4 right-0 bg-blue-600 p-2 rounded-full text-white cursor-pointer hover:scale-110 transition-transform shadow-md">
                <Camera size={16} />
              </div>
            </Upload>
          </div>
          <Title level={5} className="mt-2">
            {user.name}
          </Title>
          <Text
            type="secondary"
            className="text-xs uppercase font-bold text-slate-400"
          >
            {user.role || 'Admin'}
          </Text>
        </Card>

        {/* Cột phải: Thông tin & Mật khẩu */}
        <Card className="md:col-span-2 shadow-sm rounded-2xl border-none">
          <section className="mb-8">
            <div className="flex items-center gap-2 mb-6 text-blue-600 font-semibold">
              <User size={18} />
              <span>Thông tin cá nhân</span>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase ml-1">
                  Email
                </label>
                <Input
                  prefix={<Mail size={16} />}
                  value={user.email}
                  disabled
                  className="rounded-lg h-11 bg-slate-50 mt-1"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase ml-1">
                  Tên hiển thị
                </label>
                <Input
                  prefix={<User size={16} />}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="rounded-lg h-11 mt-1 focus:border-blue-500"
                />
              </div>
            </div>
          </section>

          <Divider />

          <section className="mb-8">
            <div className="flex items-center gap-2 mb-6 text-orange-500 font-semibold">
              <Lock size={18} />
              <span>Đổi mật khẩu (Để trống nếu không đổi)</span>
            </div>
            <div className="grid grid-cols-1 gap-4">
              <Input.Password
                placeholder="Mật khẩu hiện tại"
                className="rounded-lg h-11"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
              />
              <Input.Password
                placeholder="Mật khẩu mới"
                className="rounded-lg h-11"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
          </section>

          <Button
            type="primary"
            size="large"
            icon={<Save size={18} />}
            className="w-full bg-blue-600 hover:bg-blue-700 border-none rounded-lg h-12 font-semibold shadow-lg transition-all mt-4"
            loading={loading}
            onClick={handleUpdate}
          >
            Lưu thay đổi
          </Button>
        </Card>
      </div>
    </div>
  );
};

export default SettingsPage;
