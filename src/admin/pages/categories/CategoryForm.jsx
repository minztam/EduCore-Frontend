import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Form, Input, message, Select, InputNumber, Button, Spin } from 'antd';
import { ArrowLeft, Save, FolderTree, Globe } from 'lucide-react';

import {
  createCategory,
  updateCategory,
  getCategories,
} from '../../../api/categoryApi';

const CategoryFormPage = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { id } = useParams();

  const isEdit = !!id;
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [categories, setCategories] = useState([]);

  // ================= LOAD DATA =================
  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true);
        const res = await getCategories();
        const list = res?.data?.data || [];
        setCategories(list);

        if (isEdit) {
          const data = list.find((x) => x.id === id);
          if (!data) {
            message.error('Không tìm thấy danh mục');
            navigate('/admin/categories');
            return;
          }

          // Đổ dữ liệu vào form của Ant Design
          form.setFieldsValue({
            name: data.name,
            slug: data.slug,
            type: data.type,
            parentId: data.parentId || null,
            sortOrder: data.sortOrder,
          });
        }
      } catch (err) {
        message.error('Có lỗi khi tải dữ liệu');
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [id, isEdit, navigate, form]);

  // ================= SUBMIT =================
  const onFinish = async (values) => {
    try {
      setSubmitLoading(true);
      const payload = {
        ...values,
        name: values.name.trim(),
        slug: values.slug.trim(),
        parentId: values.parentId || null,
        sortOrder: Number(values.sortOrder),
      };

      if (isEdit) {
        await updateCategory(id, payload);
        message.success('Cập nhật danh mục thành công');
      } else {
        await createCategory(payload);
        message.success('Tạo danh mục thành công');
      }
      navigate('/admin/categories');
    } catch (err) {
      message.error('Thao tác thất bại');
    } finally {
      setSubmitLoading(false);
    }
  };

  // ================= AUTO GENERATE SLUG =================
  const handleNameChange = (e) => {
    const value = e.target.value;
    const slug = value
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[đĐ]/g, 'd')
      .replace(/([^0-9a-z-\s])/g, '')
      .replace(/(\s+)/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '');

    form.setFieldsValue({ name: value, slug });
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spin size="large" tip="Đang tải dữ liệu..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      {/* HEADER CỐ ĐỊNH (Sticky) */}
      <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/admin/categories')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-500 border-0 cursor-pointer bg-transparent"
            >
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-xl font-bold text-gray-800">
              {isEdit ? 'Cập nhật danh mục' : 'Thêm danh mục mới'}
            </h1>
          </div>
          <div className="flex gap-3">
            <Button onClick={() => navigate('/admin/categories')} size="large">
              Hủy
            </Button>
            <Button
              type="primary"
              size="large"
              icon={<Save size={18} />}
              loading={submitLoading}
              onClick={() => form.submit()}
              className="bg-blue-600 flex items-center gap-2"
            >
              {isEdit ? 'Lưu thay đổi' : 'Tạo danh mục'}
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto p-6 lg:p-8">
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{
            type: 'Course',
            sortOrder: 1,
            parentId: null,
          }}
        >
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* CỘT TRÁI: THÔNG TIN CHÍNH */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                <Form.Item
                  name="name"
                  label={
                    <span className="text-xs font-bold uppercase text-gray-400">
                      Tên danh mục
                    </span>
                  }
                  rules={[
                    { required: true, message: 'Tên không được để trống' },
                  ]}
                >
                  <Input
                    size="large"
                    placeholder="Ví dụ: Lập trình Web"
                    onChange={handleNameChange}
                    className="rounded-lg font-semibold"
                  />
                </Form.Item>

                <Form.Item
                  name="slug"
                  label={
                    <span className="text-xs font-bold uppercase text-gray-400">
                      Đường dẫn (Slug)
                    </span>
                  }
                  rules={[
                    { required: true, message: 'Slug không được để trống' },
                  ]}
                >
                  <Input
                    prefix={<Globe size={14} className="text-gray-300" />}
                    className="bg-gray-50 font-mono rounded-lg"
                    placeholder="lap-trinh-web"
                  />
                </Form.Item>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                <Form.Item
                  name="parentId"
                  label={
                    <span className="text-xs font-bold uppercase text-gray-400">
                      Danh mục cha (Cấp bậc)
                    </span>
                  }
                >
                  <Select
                    size="large"
                    placeholder="-- Chọn danh mục gốc (Root) --"
                    allowClear
                    suffixIcon={<FolderTree size={16} />}
                    className="w-full"
                    options={[
                      { label: 'Không có (Là danh mục gốc)', value: null },
                      ...categories
                        .filter((c) => c.id !== id) // Không chọn chính nó làm cha
                        .map((c) => ({
                          label: c.name,
                          value: c.id,
                        })),
                    ]}
                  />
                </Form.Item>
                <p className="text-[11px] text-gray-400 italic mt-2">
                  * Nếu chọn danh mục cha, danh mục này sẽ hiển thị như một menu
                  con.
                </p>
              </div>
            </div>

            {/* CỘT PHẢI: CẤU HÌNH PHỤ */}
            <div className="space-y-6">
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-4">
                <h3 className="text-xs font-bold uppercase text-gray-400 mb-4">
                  Cài đặt hiển thị
                </h3>

                <Form.Item
                  name="type"
                  label="Loại danh mục"
                  rules={[{ required: true }]}
                >
                  <Select size="large" className="w-full">
                    <Select.Option value="Course">
                      Khóa học (Course)
                    </Select.Option>
                    <Select.Option value="Blog">Bài viết (Blog)</Select.Option>
                    <Select.Option value="Tournament">
                      Giải đấu (Tournament)
                    </Select.Option>
                  </Select>
                </Form.Item>

                <Form.Item
                  name="sortOrder"
                  label="Thứ tự hiển thị"
                  rules={[{ required: true }]}
                >
                  <InputNumber
                    size="large"
                    min={1}
                    className="w-full rounded-lg"
                    placeholder="1"
                  />
                </Form.Item>
              </div>

              <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                <div className="flex gap-3">
                  <FolderTree className="text-blue-500 shrink-0" size={20} />
                  <div>
                    <h4 className="text-sm font-bold text-blue-900">Mẹo nhỏ</h4>
                    <p className="text-xs text-blue-700 mt-1 leading-relaxed">
                      Sử dụng <b>Thứ tự hiển thị</b> để sắp xếp danh mục trên
                      menu chính. Số nhỏ hơn sẽ xuất hiện trước.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Form>
      </div>
    </div>
  );
};

export default CategoryFormPage;
