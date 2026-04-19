import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { getPostBySlug, createPost, updatePost } from '../../../api/postApi';
import { getCategories } from '../../../api/categoryApi';

import { Form, Input, Upload, message, Select, Switch } from 'antd';
import { ArrowLeft, UploadCloud, Save } from 'lucide-react';
import Editor from '../../../components/Editor';

const PostFormPage = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();

  // ✅ Lấy slug từ URL (Ví dụ: /admin/posts/edit/bai-viet-moi)
  const { slug } = useParams();

  const [loading, setLoading] = useState(false);
  const [fileList, setFileList] = useState([]);
  const [categories, setCategories] = useState([]);

  // ✅ Lưu ID thật của bài viết để phục vụ việc Update
  const [postId, setPostId] = useState(null);

  // ================= LOAD DANH MỤC =================
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await getCategories();
        const data = res?.data?.data || [];
        setCategories(data.filter((x) => x.type === 'Blog'));
      } catch {
        message.error('Không tải được danh mục');
      }
    };
    fetchCategories();
  }, []);

  // ================= LOAD DỮ LIỆU BÀI VIẾT =================
  useEffect(() => {
    const fetchPost = async () => {
      if (!slug) return; // Nếu không có slug trên URL thì đây là trang tạo mới

      try {
        setLoading(true);
        const res = await getPostBySlug(slug);
        const post = res?.data?.data;

        if (post) {
          setPostId(post.id); // Lưu ID để dùng cho hàm updatePost sau này

          form.setFieldsValue({
            title: post.title,
            slug: post.slug,
            content: post.content,
            authorName: post.authorName,
            categoryId: post.categoryId,
            isPublished: post.isPublished,
          });

          if (post.thumbnail) {
            setFileList([
              {
                uid: '-1',
                name: 'thumbnail.png',
                status: 'done',
                url: post.thumbnail,
              },
            ]);
          }
        }
      } catch (err) {
        message.error('Không thể tải bài viết');
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [slug, form]);

  // ================= XỬ LÝ LƯU DỮ LIỆU =================
  const onFinish = async (values) => {
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('title', values.title);
      formData.append('slug', values.slug);
      formData.append('content', values.content || '');
      formData.append('authorName', values.authorName || '');
      formData.append('categoryId', values.categoryId || '');
      formData.append('isPublished', values.isPublished || false);

      const file = fileList?.[0]?.originFileObj;
      if (file) formData.append('thumbnail', file);

      if (postId) {
        // Nếu có postId -> Đang ở chế độ chỉnh sửa
        await updatePost(postId, formData);
        message.success('Cập nhật bài viết thành công');
      } else {
        // Không có postId -> Đang ở chế độ tạo mới
        await createPost(formData);
        message.success('Tạo bài viết thành công');
      }
      navigate('/admin/posts');
    } catch {
      message.error('Có lỗi xảy ra khi lưu bài viết');
    } finally {
      setLoading(false);
    }
  };

  // ================= TỰ ĐỘNG TẠO SLUG KHI NHẬP TIÊU ĐỀ =================
  const handleTitleChange = (e) => {
    const value = e.target.value;
    form.setFieldsValue({
      title: value,
      slug: value
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Khử dấu tiếng Việt
        .replace(/[đĐ]/g, 'd')
        .replace(/([^0-9a-z-\s])/g, '')
        .replace(/(\s+)/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-+|-+$/g, ''),
    });
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] text-slate-900">
      {/* HEADER CỐ ĐỊNH */}
      <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/admin/posts')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-500 border-0 cursor-pointer bg-transparent"
            >
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-xl font-bold tracking-tight text-gray-800">
              {postId ? 'Chỉnh sửa nội dung' : 'Tạo nội dung mới'}
            </h1>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => navigate('/admin/posts')}
              className="px-4 py-2 bg-white border border-gray-200 text-gray-600 text-sm font-semibold rounded-lg hover:bg-gray-50 transition-all cursor-pointer"
            >
              Hủy
            </button>
            <button
              onClick={() => form.submit()}
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-all shadow-sm shadow-blue-200 border-0 cursor-pointer flex items-center gap-2"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Save size={16} />
              )}
              Lưu bài viết
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 lg:p-8">
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <div className="flex flex-col lg:flex-row gap-8 items-start">
            {/* CỘT TRÁI: NỘI DUNG CHÍNH */}
            <div className="flex-1 w-full space-y-6">
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 lg:p-8">
                <Form.Item
                  name="title"
                  label={
                    <span className="text-xs font-bold uppercase text-gray-400 tracking-wider">
                      Tiêu đề bài viết
                    </span>
                  }
                  rules={[{ required: true, message: 'Vui lòng nhập tiêu đề' }]}
                >
                  <Input
                    size="large"
                    placeholder="Nhập tiêu đề hấp dẫn..."
                    onChange={handleTitleChange}
                    className="rounded-lg border-gray-200 py-3 text-lg font-semibold focus:border-blue-500"
                  />
                </Form.Item>

                <Form.Item
                  name="slug"
                  label={
                    <span className="text-xs font-bold uppercase text-gray-400 tracking-wider">
                      Đường dẫn (URL Slug)
                    </span>
                  }
                  rules={[{ required: true }]}
                >
                  <Input
                    prefix={<span className="text-gray-300">/</span>}
                    className="rounded-lg bg-gray-50 border-gray-200 font-mono text-gray-500"
                  />
                </Form.Item>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                  <span className="text-xs font-bold uppercase text-gray-500 tracking-wider">
                    Trình soạn thảo nội dung
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

            {/* CỘT PHẢI: THIẾT LẬP PHỤ */}
            <div className="w-full lg:w-80 space-y-6">
              {/* Card Trạng thái */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-700">
                    Hiển thị công khai
                  </span>
                  <Form.Item
                    name="isPublished"
                    valuePropName="checked"
                    className="mb-0"
                  >
                    <Switch />
                  </Form.Item>
                </div>
                <p className="text-[12px] text-gray-400 mt-2 leading-relaxed">
                  Khi bật, bài viết sẽ hiển thị trực tiếp trên trang chủ.
                </p>
              </div>

              {/* Card Phân loại */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                <h3 className="text-xs font-bold uppercase text-gray-400 tracking-wider mb-4">
                  Thông tin bổ sung
                </h3>
                <Form.Item
                  name="categoryId"
                  label={
                    <span className="text-sm font-medium text-gray-600">
                      Danh mục
                    </span>
                  }
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

                <Form.Item
                  name="authorName"
                  label={
                    <span className="text-sm font-medium text-gray-600">
                      Tác giả bài viết
                    </span>
                  }
                >
                  <Input
                    size="large"
                    placeholder="Tên tác giả"
                    className="rounded-lg border-gray-200"
                  />
                </Form.Item>
              </div>

              {/* Card Ảnh */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                <h3 className="text-xs font-bold uppercase text-gray-400 tracking-wider mb-4">
                  Ảnh đại diện
                </h3>
                <Form.Item className="mb-0 text-center">
                  <Upload
                    listType="picture-card"
                    fileList={fileList}
                    onChange={({ fileList }) => setFileList(fileList)}
                    beforeUpload={() => false}
                    maxCount={1}
                    className="mx-auto"
                  >
                    {fileList.length < 1 && (
                      <div className="flex flex-col items-center gap-1 text-gray-400">
                        <UploadCloud size={24} strokeWidth={1.5} />
                        <span className="text-[11px] font-bold">CHỌN ẢNH</span>
                      </div>
                    )}
                  </Upload>
                </Form.Item>
              </div>
            </div>
          </div>
        </Form>
      </div>
    </div>
  );
};

export default PostFormPage;
