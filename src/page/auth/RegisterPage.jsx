import React, { useState } from 'react';
import { registerUser } from '../../api/userApi';
import { Link, useNavigate } from 'react-router-dom';
import { Form, Input, Button, message, Card } from 'antd'; // Import antd
import {
  UserOutlined,
  MailOutlined,
  LockOutlined,
  ArrowRightOutlined,
} from '@ant-design/icons';

const RegisterPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  // ================= LOGIC ĐĂNG KÝ (GIỮ NGUYÊN) =================
  const onFinish = async (values) => {
    try {
      setLoading(true);

      // values đã bao gồm name, email, password từ Form của antd
      await registerUser({
        name: values.name,
        email: values.email,
        password: values.password,
      });

      message.success('Đăng ký tài khoản thành công!');
      navigate('/login');
    } catch (error) {
      message.error(
        error.response?.data?.message || 'Đăng ký thất bại, vui lòng thử lại'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center px-4 relative overflow-hidden">
      {/* Trang trí nền tương tự trang Login */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-green-100/50 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-100/50 rounded-full blur-[120px]" />
      </div>

      <div className="w-full max-w-[480px] relative z-10">
        <Card
          className="shadow-[0_8px_30px_rgb(0,0,0,0.04)] border-none rounded-[2.5rem] p-4 md:p-8"
          bordered={false}
        >
          {/* Header */}
          <div className="text-center mb-10">
            <h2 className="text-4xl font-black tracking-tight text-slate-900 mb-3">
              Đăng ký <span className="text-green-600">.</span>
            </h2>
            <p className="text-slate-500 font-medium">
              Gia nhập cộng đồng học tập EduCore ngay hôm nay
            </p>
          </div>

          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            requiredMark={false}
            scrollToFirstError
          >
            {/* Họ và tên */}
            <Form.Item
              name="name"
              rules={[
                { required: true, message: 'Vui lòng nhập họ tên của bạn!' },
              ]}
            >
              <Input
                prefix={<UserOutlined className="text-slate-400 mr-2" />}
                placeholder="Họ và tên"
                size="large"
                className="rounded-2xl h-14 bg-slate-50 border-none font-medium"
              />
            </Form.Item>

            {/* Email */}
            <Form.Item
              name="email"
              rules={[
                { required: true, message: 'Vui lòng nhập email!' },
                { type: 'email', message: 'Email không hợp lệ!' },
              ]}
            >
              <Input
                prefix={<MailOutlined className="text-slate-400 mr-2" />}
                placeholder="Địa chỉ Email"
                size="large"
                className="rounded-2xl h-14 bg-slate-50 border-none font-medium"
              />
            </Form.Item>

            {/* Mật khẩu */}
            <Form.Item
              name="password"
              rules={[
                { required: true, message: 'Vui lòng nhập mật khẩu!' },
                { min: 6, message: 'Mật khẩu phải từ 6 ký tự trở lên!' },
              ]}
              hasFeedback
            >
              <Input.Password
                prefix={<LockOutlined className="text-slate-400 mr-2" />}
                placeholder="Mật khẩu"
                size="large"
                className="rounded-2xl h-14 bg-slate-50 border-none font-medium"
              />
            </Form.Item>

            {/* Xác nhận mật khẩu */}
            <Form.Item
              name="confirmPassword"
              dependencies={['password']}
              hasFeedback
              rules={[
                { required: true, message: 'Vui lòng xác nhận mật khẩu!' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('password') === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(
                      new Error('Mật khẩu xác nhận không khớp!')
                    );
                  },
                }),
              ]}
            >
              <Input.Password
                prefix={<LockOutlined className="text-slate-400 mr-2" />}
                placeholder="Xác nhận mật khẩu"
                size="large"
                className="rounded-2xl h-14 bg-slate-50 border-none font-medium"
              />
            </Form.Item>

            {/* Button Đăng ký */}
            <Form.Item className="mt-8">
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                block
                className="h-14 bg-green-600 hover:bg-green-700 !rounded-2xl text-lg font-bold flex items-center justify-center gap-2 border-none shadow-lg shadow-green-100"
              >
                Tạo tài khoản <ArrowRightOutlined />
              </Button>
            </Form.Item>
          </Form>

          {/* Footer */}
          <p className="text-center mt-6 text-slate-500 font-medium">
            Đã có tài khoản?{' '}
            <Link
              to="/login"
              className="text-blue-600 font-black hover:underline ml-1"
            >
              Đăng nhập ngay
            </Link>
          </p>
        </Card>
      </div>
    </div>
  );
};

export default RegisterPage;
