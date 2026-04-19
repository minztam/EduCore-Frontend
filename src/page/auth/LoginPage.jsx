import React, { useEffect, useRef, useState } from 'react';
import { loginUser, googleLogin } from '../../api/userApi';
import { FcGoogle } from 'react-icons/fc';
import { Link, useNavigate } from 'react-router-dom';
import { Form, Input, Button, Divider, message } from 'antd'; // Import antd
import {
  MailOutlined,
  LockOutlined,
  ArrowRightOutlined,
} from '@ant-design/icons';

const LoginPage = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm(); // Antd form instance
  const googleButtonRef = useRef(null);
  const googleInitialized = useRef(false);
  const [loading, setLoading] = useState(false);

  // ================= SAVE AUTH & REDIRECT (GIỮ NGUYÊN) =================
  const saveAuthData = (data) => {
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data));
  };

  const redirectByRole = (role) => {
    if (role === 'Admin') navigate('/admin');
    else navigate('/');
  };

  // ================= LOGIN LOCAL (ANTD ONFINISH) =================
  const onFinish = async (values) => {
    try {
      setLoading(true);
      const res = await loginUser(values);
      const data = res.data.data;

      saveAuthData(data);
      message.success('Đăng nhập thành công'); // Dùng message của antd thay alert
      redirectByRole(data.role);
    } catch (error) {
      message.error(error.response?.data?.message || 'Đăng nhập thất bại');
    } finally {
      setLoading(false);
    }
  };

  // ================= GOOGLE LOGIC (GIỮ NGUYÊN) =================
  const handleGoogleSuccess = async (response) => {
    try {
      const res = await googleLogin(response.credential);
      const data = res.data.data;
      saveAuthData(data);
      message.success(
        data.isNewUser
          ? 'Đăng ký Google thành công'
          : 'Đăng nhập Google thành công'
      );
      redirectByRole(data.role);
    } catch (error) {
      message.error('Google auth failed');
    }
  };

  useEffect(() => {
    if (!window.google || googleInitialized.current) return;
    googleInitialized.current = true;
    window.google.accounts.id.initialize({
      client_id:
        '466580879746-obbtvcg0rmud8inbcsbuq26ludvbjmml.apps.googleusercontent.com',
      callback: handleGoogleSuccess,
    });
    window.google.accounts.id.renderButton(googleButtonRef.current, {
      theme: 'outline',
      size: 'large',
    });
  }, []);

  const handleCustomGoogleLogin = () => {
    const googleBtn =
      googleButtonRef.current?.querySelector('div[role=button]');
    if (googleBtn) googleBtn.click();
  };

  return (
    <div className="min-h-screen bg-[#f0f2f5] flex items-center justify-center px-4">
      <div className="bg-white shadow-2xl rounded-3xl w-full max-w-[450px] overflow-hidden flex flex-col p-10">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-2">
            Đăng nhập
          </h2>
          <p className="text-slate-500">Tiếp tục học tập cùng EduCore</p>
        </div>

        {/* Ant Design Form */}
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          requiredMark={false}
          className="w-full"
        >
          {/* Email */}
          <Form.Item
            name="email"
            rules={[
              { required: true, message: 'Vui lòng nhập email!' },
              { type: 'email', message: 'Email không đúng định dạng!' },
            ]}
          >
            <Input
              prefix={<MailOutlined className="text-gray-400 mr-2" />}
              placeholder="Email của bạn"
              size="large"
              className="rounded-xl h-12"
            />
          </Form.Item>

          {/* Password */}
          <Form.Item
            name="password"
            rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
          >
            <Input.Password
              prefix={<LockOutlined className="text-gray-400 mr-2" />}
              placeholder="Mật khẩu"
              size="large"
              className="rounded-xl h-12"
            />
          </Form.Item>

          <div className="flex justify-end mb-6">
            <Link
              to="/forgot-password"
              size="small"
              className="text-blue-600 font-bold hover:underline"
            >
              Quên mật khẩu?
            </Link>
          </div>

          {/* Submit Button */}
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
              size="large"
              className="bg-blue-600 hover:bg-blue-700 h-12 rounded-xl font-bold flex items-center justify-center gap-2"
            >
              Đăng nhập ngay <ArrowRightOutlined />
            </Button>
          </Form.Item>
        </Form>

        <Divider
          plain
          className="text-gray-400 font-bold uppercase text-[10px] tracking-[0.2em] my-6"
        >
          Hoặc
        </Divider>

        {/* Google Login */}
        <div ref={googleButtonRef} className="hidden" />
        <Button
          block
          size="large"
          icon={<FcGoogle className="inline-block mr-2" size={20} />}
          onClick={handleCustomGoogleLogin}
          className="h-12 rounded-xl font-bold flex items-center justify-center border-2 border-gray-100 hover:border-blue-500"
        >
          Tiếp tục với Google
        </Button>

        {/* Footer */}
        <p className="text-center mt-8 text-slate-500 font-medium">
          Chưa có tài khoản?{' '}
          <Link
            to="/register"
            className="text-blue-600 font-black hover:underline"
          >
            Đăng ký ngay
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
