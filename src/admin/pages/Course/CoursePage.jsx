import React, { useCallback, useEffect, useState, useMemo } from 'react';
import {
  Table,
  Tag,
  Space,
  Button,
  Input,
  Select,
  Card,
  Image,
  Typography,
  message,
  Modal,
  Tooltip,
  Row,
  Col,
  Statistic,
} from 'antd';
import {
  Search,
  Plus,
  Trash2,
  Edit3,
  Layers,
  RotateCcw,
  BookOpen,
  CheckCircle2,
  Flame,
  Globe,
  Layers3,
  RefreshCw,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  getCourses,
  deleteCourse,
  togglePublishCourse,
  searchCourses,
  filterCourses,
  toggleHotCourse,
} from '../../../api/courseApi';

const { Text, Title } = Typography;

const CoursePage = () => {
  // ================= STATE MANAGEMENT =================
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingId, setLoadingId] = useState(null);
  const [keyword, setKeyword] = useState('');
  const [filters, setFilters] = useState({
    level: '',
    price: '',
    isPublished: '',
  });
  const [selectedCourses, setSelectedCourses] = useState([]);

  const navigate = useNavigate();

  // ================= LOAD DATA =================
  const loadCourses = useCallback(async () => {
    try {
      setLoading(true);
      let res;
      if (keyword.trim() !== '') {
        res = await searchCourses(keyword);
      } else if (
        filters.level !== '' ||
        filters.price !== '' ||
        filters.isPublished !== ''
      ) {
        res = await filterCourses(filters);
      } else {
        res = await getCourses();
      }

      const data = Array.isArray(res.data?.data)
        ? res.data.data
        : res.data?.data?.data || [];

      setCourses(data);
    } catch (err) {
      console.error(err);
      setCourses([]);
      message.error('Không thể tải danh sách khóa học');
    } finally {
      setLoading(false);
    }
  }, [keyword, filters]);

  useEffect(() => {
    const delay = setTimeout(() => {
      loadCourses();
    }, 300);
    return () => clearTimeout(delay);
  }, [loadCourses]);

  // ================= ACTIONS =================
  const handleDelete = (id) => {
    Modal.confirm({
      title: 'Xác nhận xóa khóa học',
      icon: <Trash2 size={22} className="text-red-500" />,
      content:
        'Dữ liệu liên quan đến bài học và học viên sẽ bị ảnh hưởng. Bạn có chắc chắn?',
      okText: 'Xóa ngay',
      okType: 'danger',
      centered: true,
      onOk: async () => {
        try {
          await deleteCourse(id);
          setCourses((prev) => prev.filter((c) => c.id !== id));
          message.success('Đã xóa khóa học thành công');
        } catch {
          message.error('Lỗi khi xóa khóa học');
        }
      },
    });
  };

  const handleTogglePublish = async (id) => {
    setLoadingId(id);
    try {
      const res = await togglePublishCourse(id);
      const updatedCourse = res.data?.data;
      if (updatedCourse) {
        setCourses((prev) =>
          prev.map((c) =>
            c.id === updatedCourse.id
              ? { ...c, isPublished: updatedCourse.isPublished }
              : c
          )
        );
        message.success('Cập nhật trạng thái hiển thị thành công');
      }
    } catch {
      message.error('Lỗi cập nhật trạng thái');
    } finally {
      setLoadingId(null);
    }
  };

  const handleToggleHot = async () => {
    if (selectedCourses.length === 0) return;
    try {
      for (let id of selectedCourses) {
        const res = await toggleHotCourse(id);
        const updatedCourse = res.data?.data;
        if (updatedCourse) {
          setCourses((prev) =>
            prev.map((c) =>
              c.id === updatedCourse.id
                ? { ...c, isHost: updatedCourse.isHost }
                : c
            )
          );
        }
      }
      message.success('Đã cập nhật trạng thái Hot');
      setSelectedCourses([]);
    } catch (err) {
      message.error('Lỗi khi cập nhật trạng thái Hot');
    }
  };

  // ================= STATS LOGIC =================
  const stats = useMemo(
    () => ({
      total: courses.length,
      active: courses.filter((c) => c.isPublished).length,
      hot: courses.filter((c) => c.isHost).length,
      lessons: courses.reduce((sum, c) => sum + (c.totalLessons || 0), 0),
    }),
    [courses]
  );

  // ================= TABLE COLUMNS =================
  const columns = [
    {
      title: 'KHÓA HỌC',
      key: 'course',
      width: 350,
      render: (_, record) => (
        <div className="flex items-center gap-4">
          <div className="relative group">
            <Image
              src={record.thumbnailUrl}
              width={80}
              height={45}
              className="rounded-lg object-cover shadow-sm border border-slate-100"
              fallback="https://placehold.co/120x80?text=Course"
            />
            {record.isHost && (
              <div className="absolute -top-2 -right-2 bg-orange-500 text-white p-1 rounded-full shadow-lg">
                <Flame size={12} fill="white" />
              </div>
            )}
          </div>
          <div className="flex flex-col">
            <Text
              strong
              className="text-slate-700 text-sm leading-tight hover:text-blue-600 cursor-pointer"
            >
              {record.title}
            </Text>
            <div className="flex items-center gap-2 mt-1">
              <Tag
                bordered={false}
                className="text-[10px] bg-slate-100 text-slate-500 m-0 font-bold uppercase"
              >
                {record.level || 'Beginner'}
              </Tag>
              <span className="text-slate-400 text-[11px] flex items-center gap-1">
                <Globe size={11} /> {record.language || 'Tiếng Việt'}
              </span>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'HỌC PHÍ',
      dataIndex: 'price',
      align: 'right',
      render: (price) => (
        <Text
          strong
          className={price === 0 ? 'text-emerald-600' : 'text-blue-600'}
        >
          {price === 0 ? 'Miễn phí' : `${price.toLocaleString()}₫`}
        </Text>
      ),
    },
    {
      title: 'NỘI DUNG',
      dataIndex: 'totalLessons',
      align: 'center',
      render: (val) => (
        <Space direction="vertical" size={0}>
          <Text strong>{val}</Text>
          <Text type="secondary" className="text-[10px] uppercase">
            Bài giảng
          </Text>
        </Space>
      ),
    },
    {
      title: 'TRẠNG THÁI',
      key: 'status',
      align: 'center',
      render: (_, record) => (
        <Tag
          color={record.isPublished ? 'green' : 'default'}
          className="rounded-full px-4 py-0.5 border-none font-bold cursor-pointer transition-all hover:opacity-80"
          onClick={() => handleTogglePublish(record.id)}
        >
          <span className="text-[10px] uppercase">
            {record.isPublished ? 'Đang hiển thị' : 'Đang ẩn'}
          </span>
        </Tag>
      ),
    },
    {
      title: 'THAO TÁC',
      key: 'action',
      align: 'right',
      render: (_, record) => (
        <Space size="middle">
          <Tooltip title="Chương mục">
            <Button
              type="text"
              size="small"
              icon={
                <Layers
                  size={18}
                  className="text-slate-400 hover:text-indigo-500"
                />
              }
              onClick={() => navigate(`/admin/courses/${record.id}/chapters`)}
            />
          </Tooltip>
          <Tooltip title="Chỉnh sửa">
            <Button
              type="text"
              size="small"
              icon={
                <Edit3
                  size={18}
                  className="text-slate-400 hover:text-blue-500"
                />
              }
              onClick={() => navigate(`/admin/course/edit/${record.id}`)}
            />
          </Tooltip>
          <Tooltip title="Xóa">
            <Button
              type="text"
              size="small"
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
    <div className="p-8 bg-[#f8fafc] min-h-screen">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <Title level={2} className="!m-0 text-slate-800 font-bold">
            Quản lý Khóa học
          </Title>
          <Text type="secondary">
            Xây dựng và tối ưu hóa nội dung giáo dục của bạn
          </Text>
        </div>
        <Space size="middle">
          <Button
            icon={
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            }
            className="rounded-lg h-10"
            onClick={loadCourses}
          >
            Làm mới
          </Button>
          <Button
            type="primary"
            className="bg-blue-600 h-10 px-6 rounded-lg flex items-center gap-2 font-bold shadow-md shadow-blue-100"
            icon={<Plus size={18} />}
            onClick={() => navigate('/admin/course/create')}
          >
            Tạo khóa học mới
          </Button>
        </Space>
      </div>

      {/* Stats Cards Section */}
      <Row gutter={[24, 24]} className="mb-8">
        {[
          {
            title: 'Tổng khóa học',
            value: stats.total,
            color: 'border-blue-500',
            icon: <BookOpen className="text-blue-500" />,
          },
          {
            title: 'Đang hiển thị',
            value: stats.active,
            color: 'border-emerald-500',
            icon: <CheckCircle2 className="text-emerald-500" />,
          },
          {
            title: 'Khóa học Hot',
            value: stats.hot,
            color: 'border-orange-500',
            icon: <Flame className="text-orange-500" />,
          },
          {
            title: 'Tổng bài giảng',
            value: stats.lessons,
            color: 'border-purple-500',
            icon: <Layers3 className="text-purple-500" />,
          },
        ].map((item, idx) => (
          <Col xs={24} sm={12} md={6} key={idx}>
            <Card
              variant="borderless"
              className={`shadow-sm border-l-4 ${item.color} rounded-xl transition-transform hover:-translate-y-1`}
            >
              <Statistic
                title={
                  <Text
                    type="secondary"
                    strong
                    className="uppercase text-[11px] tracking-wider"
                  >
                    {item.title}
                  </Text>
                }
                value={item.value}
                prefix={React.cloneElement(item.icon, {
                  size: 20,
                  className: 'mr-2',
                })}
                styles={{
                  content: {
                    fontWeight: 800,
                    color: '#1e293b',
                    fontSize: '24px',
                  },
                }}
              />
            </Card>
          </Col>
        ))}
      </Row>

      {/* Main Content Card */}
      <Card
        variant="borderless"
        className="shadow-sm rounded-xl overflow-hidden"
      >
        {/* Filters & Bulk Actions */}
        <div className="mb-6 flex flex-wrap gap-4 justify-between items-center">
          <Space size="middle">
            <Input
              placeholder="Tìm tên khóa học..."
              prefix={<Search size={18} className="text-slate-400" />}
              className="w-72 h-10 rounded-lg bg-slate-50 border-slate-200"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            />
            <Select
              placeholder="Cấp độ"
              className="w-40 h-10"
              allowClear
              value={filters.level || undefined}
              onChange={(val) => setFilters({ ...filters, level: val || '' })}
              options={[
                { value: 'Beginner', label: 'Beginner' },
                { value: 'Intermediate', label: 'Intermediate' },
                { value: 'Advanced', label: 'Advanced' },
              ]}
            />
            <Select
              placeholder="Loại giá"
              className="w-32 h-10"
              allowClear
              value={filters.price || undefined}
              onChange={(val) => setFilters({ ...filters, price: val || '' })}
              options={[
                { value: 'free', label: 'Miễn phí' },
                { value: 'paid', label: 'Có phí' },
              ]}
            />
            <Button
              type="text"
              icon={<RotateCcw size={18} />}
              className="h-10 text-slate-400"
              onClick={() => {
                setKeyword('');
                setFilters({ level: '', price: '', isPublished: '' });
              }}
            />
          </Space>

          {selectedCourses.length > 0 && (
            <div className="bg-orange-50 px-4 py-1.5 rounded-lg border border-orange-100 flex items-center gap-4">
              <Text strong className="text-orange-600 text-xs">
                Đã chọn {selectedCourses.length} khóa học
              </Text>
              <Button
                size="small"
                type="primary"
                className="bg-orange-500 border-none text-[11px] font-bold"
                onClick={handleToggleHot}
              >
                THIẾT LẬP HOT
              </Button>
            </div>
          )}
        </div>

        {/* Table */}
        <Table
          rowSelection={{
            selectedRowKeys: selectedCourses,
            onChange: (keys) => setSelectedCourses(keys),
          }}
          columns={columns}
          dataSource={courses}
          loading={loading}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Tổng cộng ${total} khóa học`,
            className: 'px-6',
          }}
          className="course-table"
        />
      </Card>

      {/* CSS Overrides for a cleaner look */}
      <style italic>{`
        .course-table .ant-table-thead > tr > th {
          background: #f8fafc;
          color: #64748b;
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          font-weight: 700;
        }
        .course-table .ant-table-tbody > tr:hover > td {
          background-color: #f1f5f9 !important;
        }
      `}</style>
    </div>
  );
};

export default CoursePage;
