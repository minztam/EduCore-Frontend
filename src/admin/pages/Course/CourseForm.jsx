import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Form,
  Input,
  Upload,
  message,
  Select,
  InputNumber,
  Button,
} from 'antd';
import { ArrowLeft, UploadCloud, Save, PlayCircle } from 'lucide-react';

import { createCourse, updateCourse, getCourses } from '../../../api/courseApi';
import { getCategories } from '../../../api/categoryApi';
import Editor from '../../../components/Editor';

const CourseFormPage = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { id } = useParams(); // Lấy ID từ URL nếu là chỉnh sửa

  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [fileList, setFileList] = useState([]);
  const [videoFile, setVideoFile] = useState(null);

  // ================= LOAD DANH MỤC =================
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await getCategories();
        const data = res?.data?.data || [];
        // Lọc danh mục loại Course
        setCategories(data.filter((x) => x.type === 'Course'));
      } catch {
        message.error('Không tải được danh mục');
      }
    };
    fetchCategories();
  }, []);

  // ================= LOAD DỮ LIỆU KHÓA HỌC =================
  useEffect(() => {
    const fetchCourse = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const res = await getCourses();
        const data = Array.isArray(res.data?.data) ? res.data.data : [];
        const course = data.find((x) => x.id === id);

        if (course) {
          form.setFieldsValue({
            title: course.title,
            slug: course.slug,
            description: course.description,
            content: course.content,
            price: course.price,
            level: course.level,
            language: course.language || 'Tiếng Việt',
            categoryId: course.categoryId,
          });

          if (course.thumbnailUrl) {
            setFileList([
              {
                uid: '-1',
                name: 'thumbnail.png',
                status: 'done',
                url: course.thumbnailUrl,
              },
            ]);
          }
        }
      } catch (err) {
        message.error('Không thể tải thông tin khóa học');
      } finally {
        setLoading(false);
      }
    };
    fetchCourse();
  }, [id, form]);

  // ================= XỬ LÝ LƯU DỮ LIỆU =================
  const onFinish = async (values) => {
    try {
      setLoading(true);
      const formData = new FormData();

      // Map đúng các key backend yêu cầu (Viết hoa chữ cái đầu theo API của bạn)
      formData.append('Title', values.title);
      formData.append('Slug', values.slug);
      formData.append('Description', values.description || '');
      formData.append('Content', values.content || '');
      formData.append('Price', String(values.price || 0));
      formData.append('Level', values.level);
      formData.append('Language', values.language);
      formData.append('InstructorId', '3F86F46A-C665-4AA1-8C95-38D909ACF789'); // ID mặc định

      if (values.categoryId) formData.append('CategoryId', values.categoryId);

      // Xử lý ảnh
      const thumbFile = fileList?.[0]?.originFileObj;
      if (thumbFile) formData.append('Thumbnail', thumbFile);

      // Xử lý Video Preview
      if (videoFile) formData.append('PreviewVideo', videoFile);

      if (id) {
        await updateCourse(id, formData);
        message.success('Cập nhật khóa học thành công');
      } else {
        await createCourse(formData);
        message.success('Tạo khóa học thành công');
      }
      navigate('/admin/course');
    } catch (err) {
      message.error('Có lỗi xảy ra khi lưu dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  // ================= TỰ ĐỘNG TẠO SLUG =================
  const handleTitleChange = (e) => {
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

    form.setFieldsValue({ title: value, slug });
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      {/* HEADER CỐ ĐỊNH */}
      <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/admin/course')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-500 border-0 cursor-pointer bg-transparent"
            >
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-xl font-bold text-gray-800">
              {id ? 'Chỉnh sửa khóa học' : 'Tạo khóa học mới'}
            </h1>
          </div>
          <div className="flex gap-3">
            <Button onClick={() => navigate('/admin/course')} size="large">
              Hủy
            </Button>
            <Button
              type="primary"
              size="large"
              icon={<Save size={18} />}
              loading={loading}
              onClick={() => form.submit()}
              className="bg-blue-600 flex items-center gap-2"
            >
              Lưu khóa học
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 lg:p-8">
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{
            level: 'Beginner',
            language: 'Tiếng Việt',
            price: 0,
          }}
        >
          <div className="flex flex-col lg:flex-row gap-8">
            {/* CỘT TRÁI: THÔNG TIN CHÍNH */}
            <div className="flex-1 space-y-6">
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                <Form.Item
                  name="title"
                  label={
                    <span className="text-xs font-bold uppercase text-gray-400">
                      Tên khóa học
                    </span>
                  }
                  rules={[
                    { required: true, message: 'Vui lòng nhập tên khóa học' },
                  ]}
                >
                  <Input
                    size="large"
                    placeholder="Ví dụ: Lập trình ReactJS thực chiến"
                    onChange={handleTitleChange}
                    className="rounded-lg font-semibold text-lg"
                  />
                </Form.Item>

                <Form.Item
                  name="slug"
                  label={
                    <span className="text-xs font-bold uppercase text-gray-400">
                      Đường dẫn (Slug)
                    </span>
                  }
                  rules={[{ required: true }]}
                >
                  <Input
                    prefix={<span className="text-gray-300">/</span>}
                    className="bg-gray-50 font-mono"
                  />
                </Form.Item>

                <Form.Item
                  name="description"
                  label={
                    <span className="text-xs font-bold uppercase text-gray-400">
                      Mô tả ngắn
                    </span>
                  }
                >
                  <Input.TextArea
                    rows={3}
                    placeholder="Tóm tắt nội dung khóa học..."
                    className="rounded-lg"
                  />
                </Form.Item>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-6 py-3 bg-gray-50 border-b border-gray-100">
                  <span className="text-xs font-bold uppercase text-gray-500">
                    Chi tiết lộ trình học tập
                  </span>
                </div>
                <div className="p-2">
                  <Form.Item
                    name="content"
                    className="mb-0"
                    rules={[{ required: true }]}
                  >
                    <Editor />
                  </Form.Item>
                </div>
              </div>
            </div>

            {/* CỘT PHẢI: CÀI ĐẶT BỔ SUNG */}
            <div className="w-full lg:w-80 space-y-6">
              {/* Card Phân loại & Giá */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-4">
                <h3 className="text-xs font-bold uppercase text-gray-400 mb-4">
                  Cài đặt khóa học
                </h3>

                <Form.Item
                  name="categoryId"
                  label="Danh mục"
                  rules={[{ required: true }]}
                >
                  <Select
                    size="large"
                    placeholder="Chọn danh mục"
                    options={categories.map((c) => ({
                      label: c.name,
                      value: c.id,
                    }))}
                  />
                </Form.Item>

                <Form.Item name="price" label="Học phí (VNĐ)">
                  <InputNumber
                    size="large"
                    className="w-full rounded-lg"
                    formatter={(value) =>
                      `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                    }
                    parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                  />
                </Form.Item>

                <Form.Item name="level" label="Trình độ">
                  <Select size="large">
                    <Select.Option value="Beginner">
                      Cơ bản (Beginner)
                    </Select.Option>
                    <Select.Option value="Intermediate">
                      Trung cấp (Intermediate)
                    </Select.Option>
                    <Select.Option value="Advanced">
                      Nâng cao (Advanced)
                    </Select.Option>
                  </Select>
                </Form.Item>

                <Form.Item name="language" label="Ngôn ngữ">
                  <Input size="large" />
                </Form.Item>
              </div>

              {/* Card Thumbnail */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 text-center">
                <h3 className="text-xs font-bold uppercase text-gray-400 mb-4 text-left">
                  Ảnh đại diện
                </h3>
                <Upload
                  listType="picture-card"
                  fileList={fileList}
                  onChange={({ fileList }) => setFileList(fileList)}
                  beforeUpload={() => false}
                  maxCount={1}
                >
                  {fileList.length < 1 && (
                    <div className="flex flex-col items-center text-gray-400">
                      <UploadCloud size={24} />
                      <span className="text-[10px] font-bold mt-1">
                        TẢI ẢNH
                      </span>
                    </div>
                  )}
                </Upload>
              </div>

              {/* Card Video Preview */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                <h3 className="text-xs font-bold uppercase text-gray-400 mb-4">
                  Video giới thiệu
                </h3>
                <Upload
                  beforeUpload={(file) => {
                    setVideoFile(file);
                    return false;
                  }}
                  maxCount={1}
                  onRemove={() => setVideoFile(null)}
                >
                  <Button
                    icon={<PlayCircle size={16} />}
                    className="w-full flex items-center justify-center gap-2"
                  >
                    Chọn Video
                  </Button>
                </Upload>
                <p className="text-[10px] text-gray-400 mt-2 italic">
                  Hỗ trợ định dạng .mp4, .webm
                </p>
              </div>
            </div>
          </div>
        </Form>
      </div>
    </div>
  );
};

export default CourseFormPage;
