import React, { useEffect, useState, useCallback } from 'react';
import homeHeroApi from '../../../api/homeHeroApi';
import { Save, RefreshCcw, ImagePlus, Eye, EyeOff } from 'lucide-react';

const HomeHeroPage = () => {
  const [form, setForm] = useState({
    title: '',
    subTitle: '',
    description: '',
    primaryButtonText: '',
    primaryButtonLink: '',
    secondaryButtonText: '',
    secondaryButtonLink: '',
    image: null,
    isActive: true,
  });

  const [preview, setPreview] = useState('');
  const [loading, setLoading] = useState(false);

  const loadHomeHero = useCallback(async () => {
    try {
      setLoading(true);
      const res = await homeHeroApi.getHomeHero();
      const data = res.data?.data;
      if (!data) return;

      setForm({
        title: data.title || '',
        subTitle: data.subTitle || '',
        description: data.description || '',
        primaryButtonText: data.primaryButtonText || '',
        primaryButtonLink: data.primaryButtonLink || '',
        secondaryButtonText: data.secondaryButtonText || '',
        secondaryButtonLink: data.secondaryButtonLink || '',
        image: null,
        isActive: data.isActive ?? true,
      });

      setPreview(data.bannerImage || '');
    } catch (error) {
      console.error('Load HomeHero failed:', error);
      alert('Không tải được dữ liệu Home Hero');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadHomeHero();
  }, [loadHomeHero]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setForm((prev) => ({ ...prev, image: file }));
    setPreview(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    try {
      setLoading(true);

      const formData = new FormData();
      formData.append('Title', form.title || '');
      formData.append('SubTitle', form.subTitle || '');
      formData.append('Description', form.description || '');
      formData.append('PrimaryButtonText', form.primaryButtonText || '');
      formData.append('PrimaryButtonLink', form.primaryButtonLink || '');
      formData.append('SecondaryButtonText', form.secondaryButtonText || '');
      formData.append('SecondaryButtonLink', form.secondaryButtonLink || '');
      if (form.image) formData.append('BannerImage', form.image);

      const res = await homeHeroApi.saveHomeHero(formData);
      alert(res.data?.message || 'Lưu thành công');
      loadHomeHero();
    } catch (error) {
      console.error('Save HomeHero failed:', error.response?.data);
      alert(error.response?.data?.message || 'Lưu thất bại');
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async () => {
    try {
      setLoading(true);
      const res = await homeHeroApi.toggleHomeHero();
      alert(res.data?.message || 'Cập nhật trạng thái thành công');
      loadHomeHero();
    } catch (error) {
      console.error('Toggle failed:', error);
      alert('Không thể đổi trạng thái');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="bg-white rounded-2xl shadow-sm border p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">Quản lý Home Hero</h1>
            <p className="text-gray-500 text-sm mt-1">
              Chỉnh sửa banner hero hiển thị trang chủ
            </p>
          </div>
          <button
            onClick={loadHomeHero}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border hover:bg-gray-50"
          >
            <RefreshCcw size={18} /> Tải lại
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* LEFT */}
          <div className="space-y-5">
            <div>
              <label className="block mb-2 font-medium">Tiêu đề</label>
              <input
                type="text"
                name="title"
                value={form.title}
                onChange={handleChange}
                className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block mb-2 font-medium">Mô tả phụ</label>
              <textarea
                name="subTitle"
                value={form.subTitle}
                onChange={handleChange}
                rows="2"
                className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block mb-2 font-medium">Mô tả chi tiết</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows="3"
                className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Primary CTA */}
            <div>
              <label className="block mb-2 font-medium">Primary CTA Text</label>
              <input
                type="text"
                name="primaryButtonText"
                value={form.primaryButtonText}
                onChange={handleChange}
                className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
              />
              <label className="block mt-2 mb-1 text-sm text-gray-500">
                Primary CTA Link
              </label>
              <input
                type="text"
                name="primaryButtonLink"
                value={form.primaryButtonLink}
                onChange={handleChange}
                className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="/courses"
              />
            </div>

            {/* Secondary CTA */}
            <div>
              <label className="block mb-2 font-medium">
                Secondary CTA Text
              </label>
              <input
                type="text"
                name="secondaryButtonText"
                value={form.secondaryButtonText}
                onChange={handleChange}
                className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
              />
              <label className="block mt-2 mb-1 text-sm text-gray-500">
                Secondary CTA Link
              </label>
              <input
                type="text"
                name="secondaryButtonLink"
                value={form.secondaryButtonLink}
                onChange={handleChange}
                className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="/courses"
              />
            </div>

            {/* Buttons */}
            <div className="flex gap-4 pt-4">
              <button
                onClick={handleSave}
                disabled={loading}
                className="flex items-center gap-2 bg-blue-600 text-white px-5 py-3 rounded-xl hover:bg-blue-700"
              >
                <Save size={18} /> Lưu
              </button>
              <button
                onClick={handleToggle}
                disabled={loading}
                className="flex items-center gap-2 bg-gray-900 text-white px-5 py-3 rounded-xl hover:bg-black"
              >
                {form.isActive ? <EyeOff size={18} /> : <Eye size={18} />}
                {form.isActive ? 'Ẩn Hero' : 'Hiện Hero'}
              </button>
            </div>
          </div>

          {/* RIGHT */}
          <div>
            <label className="block mb-2 font-medium">Banner Image</label>
            <label className="border-2 border-dashed rounded-2xl min-h-[350px] flex items-center justify-center cursor-pointer overflow-hidden">
              {preview ? (
                <img
                  src={preview}
                  alt="preview"
                  className="w-full h-[350px] object-cover"
                />
              ) : (
                <div className="text-center text-gray-500">
                  <ImagePlus size={40} className="mx-auto mb-3" />
                  <p>Chọn ảnh Banner</p>
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                hidden
                onChange={handleImageChange}
              />
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeHeroPage;
