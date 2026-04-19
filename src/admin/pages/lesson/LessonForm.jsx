import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const LessonForm = () => {
  const [form, setForm] = useState({ title: '', slug: '' });
  const { id } = useParams();

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">QL Bài Học</h1>

      {/* KHỐI SLUG BẮT BUỘC HIỆN */}
      <div className="mb-6 p-4 bg-yellow-100 border-l-4 border-yellow-500">
        <label className="block font-bold text-gray-700">Slug URL:</label>
        <input
          className="w-full p-2 border border-gray-400 rounded mt-1"
          value={form.slug}
          onChange={(e) => setForm({ ...form, slug: e.target.value })}
          placeholder="Nhap slug vao day..."
        />
      </div>

      <div className="p-4 bg-white border rounded shadow">
        <label className="block font-bold">Tiêu đề:</label>
        <input
          className="w-full p-2 border rounded mt-1"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
        />
      </div>
    </div>
  );
};

export default LessonForm;
