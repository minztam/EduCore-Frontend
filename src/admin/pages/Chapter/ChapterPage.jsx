import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Table,
  Button,
  Input,
  InputNumber,
  Card,
  Typography,
  message,
  Modal,
  Space,
  Tooltip,
  Tag,
  Breadcrumb,
} from 'antd';
import {
  Plus,
  Trash2,
  Edit3,
  BookOpen,
  ArrowLeft,
  Save,
  X,
  ListOrdered,
  ChevronRight,
} from 'lucide-react';
import {
  getChaptersByCourse,
  createChapter,
  updateChapter,
  deleteChapter,
} from '../../../api/chapterApi';

const { Text, Title } = Typography;

const ChapterPage = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();

  // ===== STATE =====
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState('');
  const [order, setOrder] = useState(1);
  const [editingId, setEditingId] = useState(null);

  // ===== LOAD DATA =====
  const loadChapters = useCallback(async () => {
    try {
      if (!courseId) return;
      setLoading(true);
      const res = await getChaptersByCourse(courseId);
      // Giả sử API trả về data.data, sort theo order luôn cho đẹp
      const data = res.data?.data || [];
      setChapters(data.sort((a, b) => a.order - b.order));
    } catch (err) {
      console.error(err);
      message.error('Không thể tải danh sách chương');
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    loadChapters();
  }, [loadChapters]);

  // ===== XỬ LÝ SUBMIT =====
  const handleSubmit = async () => {
    if (!title.trim()) return message.warning('Vui lòng nhập tên chương');

    try {
      if (editingId) {
        await updateChapter(editingId, { title, order });
        message.success('Cập nhật chương thành công');
      } else {
        await createChapter({ title, order, courseId });
        message.success('Thêm chương mới thành công');
      }
      resetForm();
      loadChapters();
    } catch (err) {
      message.error('Thao tác thất bại');
    }
  };

  const resetForm = () => {
    setTitle('');
    setOrder(chapters.length + 1); // Tự động gợi ý order tiếp theo
    setEditingId(null);
  };

  const handleEdit = (record) => {
    setEditingId(record.id);
    setTitle(record.title);
    setOrder(record.order);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = (id) => {
    Modal.confirm({
      title: 'Xóa chương này?',
      content: 'Tất cả bài học bên trong chương này cũng sẽ bị ảnh hưởng.',
      okText: 'Xóa ngay',
      okType: 'danger',
      cancelText: 'Hủy',
      centered: true,
      onOk: async () => {
        try {
          await deleteChapter(id);
          message.success('Đã xóa chương');
          loadChapters();
        } catch {
          message.error('Xóa thất bại');
        }
      },
    });
  };

  // ===== CẤU HÌNH CỘT TABLE =====
  const columns = [
    {
      title: 'THỨ TỰ',
      dataIndex: 'order',
      key: 'order',
      width: 100,
      render: (val) => (
        <Tag color="blue" bordered={false} className="font-bold rounded-md">
          #{val}
        </Tag>
      ),
    },
    {
      title: 'TÊN CHƯƠNG',
      dataIndex: 'title',
      key: 'title',
      render: (text) => (
        <Text strong className="text-slate-700">
          {text}
        </Text>
      ),
    },
    {
      title: 'THAO TÁC',
      key: 'action',
      align: 'right',
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            size="small"
            className="bg-indigo-50 text-indigo-600 border-none hover:bg-indigo-100 flex items-center gap-1 font-semibold"
            icon={<BookOpen size={14} />}
            onClick={() =>
              navigate(
                `/admin/courses/${courseId}/chapters/${record.id}/lessons`
              )
            }
          >
            Bài học
          </Button>
          <Tooltip title="Sửa">
            <Button
              type="text"
              shape="circle"
              icon={<Edit3 size={18} className="text-slate-400" />}
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          <Tooltip title="Xóa">
            <Button
              type="text"
              shape="circle"
              danger
              icon={<Trash2 size={18} />}
              onClick={() => handleDelete(record.id)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-4 space-y-6 bg-[#f8fafc] min-h-screen font-sans">
      {/* HEADER & BREADCRUMB */}
      <div className="flex flex-col gap-2">
        <Breadcrumb
          items={[
            { title: 'Quản lý khóa học', href: '/admin/courses' },
            { title: 'Danh sách chương' },
          ]}
          separator={<ChevronRight size={12} className="text-slate-400" />}
        />
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Button
              icon={<ArrowLeft size={18} />}
              type="text"
              onClick={() => navigate('/admin/course')}
              className="hover:bg-white"
            />
            <Title level={3} className="m-0 !mb-0">
              Cấu trúc chương trình
            </Title>
          </div>
        </div>
      </div>

      {/* FORM CARD */}
      <Card className="shadow-sm border-none rounded-2xl overflow-hidden">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2 text-blue-600">
            {editingId ? <Edit3 size={20} /> : <Plus size={20} />}
            <Text strong className="text-lg">
              {editingId ? 'Cập nhật Chương' : 'Thêm chương mới'}
            </Text>
          </div>

          <div className="flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-[300px] space-y-1">
              <Text
                type="secondary"
                className="text-[11px] font-bold uppercase ml-1"
              >
                Tên chương
              </Text>
              <Input
                placeholder="Ví dụ: Nhập môn lập trình React..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="h-11 rounded-xl bg-slate-50 border-none focus:bg-white transition-all"
              />
            </div>

            <div className="w-24 space-y-1">
              <Text
                type="secondary"
                className="text-[11px] font-bold uppercase ml-1"
              >
                Thứ tự
              </Text>
              <InputNumber
                min={1}
                value={order}
                onChange={(val) => setOrder(val)}
                className="w-full h-11 rounded-xl bg-slate-50 border-none flex items-center"
              />
            </div>

            <Space size="middle">
              <Button
                type="primary"
                icon={editingId ? <Save size={18} /> : <Plus size={18} />}
                onClick={handleSubmit}
                className={`h-11 px-8 rounded-xl font-bold flex items-center shadow-lg transition-all ${
                  editingId
                    ? 'bg-amber-500 shadow-amber-100'
                    : 'bg-blue-600 shadow-blue-100'
                }`}
              >
                {editingId ? 'Lưu thay đổi' : 'Thêm chương'}
              </Button>

              {editingId && (
                <Button
                  icon={<X size={18} />}
                  onClick={resetForm}
                  className="h-11 px-4 rounded-xl border-slate-200 text-slate-500 flex items-center font-semibold"
                >
                  Hủy
                </Button>
              )}
            </Space>
          </div>
        </div>
      </Card>

      {/* TABLE CARD */}
      <Card
        bodyStyle={{ padding: 0 }}
        className="shadow-sm border-none rounded-2xl overflow-hidden"
      >
        <div className="p-5 border-b border-slate-50 flex items-center gap-2">
          <ListOrdered size={18} className="text-slate-400" />
          <Text
            strong
            className="text-slate-500 uppercase text-xs tracking-wider"
          >
            Danh sách các chương hiện tại
          </Text>
        </div>
        <Table
          dataSource={chapters}
          columns={columns}
          rowKey="id"
          loading={loading}
          pagination={false} // Thường chương không quá nhiều nên không cần phân trang
          locale={{ emptyText: 'Chưa có chương nào được tạo' }}
          className="custom-table"
        />
      </Card>
    </div>
  );
};

export default ChapterPage;
