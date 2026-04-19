import React, { useCallback, useEffect, useState, useMemo } from 'react';
import {
  Table,
  Tag,
  Space,
  Card,
  Modal,
  message,
  Input,
  Button,
  Tooltip,
  Select,
  Typography,
  Rate,
  Row,
  Col,
  Statistic,
} from 'antd';
import {
  Search,
  Download,
  Trash2,
  CheckCircle2,
  BadgeCheck,
  RotateCcw,
  MessageSquare,
  Star,
  RefreshCw,
  UserCheck,
  StarHalf,
} from 'lucide-react';
import {
  getAllReviewsAdmin,
  deleteReview,
  toggleFeaturedReview,
  approveReview,
} from '../../../api/reviewApi';

const { Text, Title } = Typography;

const AdminCourseReviewPage = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({ keyword: '', rating: 'All' });

  // ================= LOAD DATA =================
  const loadReviews = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getAllReviewsAdmin();
      setReviews(
        Array.isArray(res?.data?.data?.items) ? res.data.data.items : []
      );
    } catch (err) {
      message.error('Không thể tải danh sách đánh giá');
      setReviews([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadReviews();
  }, [loadReviews]);

  // ================= STATS LOGIC =================
  const stats = useMemo(() => {
    const total = reviews.length;
    const approved = reviews.filter((r) => r.isApproved).length;
    const featured = reviews.filter((r) => r.isFeatured).length;
    const avg = total
      ? (reviews.reduce((s, r) => s + r.rating, 0) / total).toFixed(1)
      : 0;
    return { total, approved, featured, avg };
  }, [reviews]);

  // ================= XỬ LÝ LOGIC =================
  const handleDelete = (id) => {
    Modal.confirm({
      title: 'Xác nhận xóa đánh giá',
      icon: <Trash2 size={22} className="text-red-500" />,
      content:
        'Hành động này không thể hoàn tác và sẽ xóa vĩnh viễn đánh giá này khỏi hệ thống.',
      okText: 'Xóa ngay',
      okType: 'danger',
      centered: true,
      onOk: async () => {
        try {
          await deleteReview(id);
          message.success('Đã xóa đánh giá thành công');
          setReviews((prev) => prev.filter((x) => x.id !== id));
        } catch {
          message.error('Xóa thất bại');
        }
      },
    });
  };

  const handleApprove = async (id) => {
    try {
      await approveReview(id);
      setReviews((prev) =>
        prev.map((x) => (x.id === id ? { ...x, isApproved: !x.isApproved } : x))
      );
      message.success('Cập nhật trạng thái duyệt thành công');
    } catch {
      message.error('Thao tác thất bại');
    }
  };

  const handleToggleFeatured = async (id) => {
    try {
      await toggleFeaturedReview(id);
      setReviews((prev) =>
        prev.map((x) => (x.id === id ? { ...x, isFeatured: !x.isFeatured } : x))
      );
      message.success('Đã cập nhật trạng thái nổi bật');
    } catch {
      message.error('Thao tác thất bại');
    }
  };

  // ================= FILTER & EXPORT =================
  const filteredData = useMemo(() => {
    return reviews.filter((item) => {
      const matchKw =
        item.studentName
          .toLowerCase()
          .includes(filters.keyword.toLowerCase()) ||
        item.courseTitle.toLowerCase().includes(filters.keyword.toLowerCase());
      const matchRating =
        filters.rating === 'All' || item.rating === parseInt(filters.rating);
      return matchKw && matchRating;
    });
  }, [reviews, filters]);

  const exportCSV = () => {
    if (!filteredData.length)
      return message.warning('Không có dữ liệu để xuất');
    const header = [
      'Học viên',
      'Khóa học',
      'Số sao',
      'Nội dung',
      'Ngày',
      'Trạng thái',
    ];
    const rows = filteredData.map((r) => [
      r.studentName,
      r.courseTitle,
      r.rating,
      r.comment.replace(/,/g, ' '),
      new Date(r.createdAt).toLocaleDateString('vi-VN'),
      r.isApproved ? 'Đã duyệt' : 'Chờ duyệt',
    ]);
    const csvContent =
      '\uFEFF' + [header, ...rows].map((e) => e.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `Danh_sach_danh_gia_${Date.now()}.csv`;
    link.click();
  };

  // ================= CẤU HÌNH CỘT =================
  const columns = [
    {
      title: 'NGƯỜI ĐÁNH GIÁ',
      key: 'student',
      width: 220,
      render: (_, record) => (
        <div className="flex flex-col">
          <Text strong className="text-slate-700">
            {record.studentName}
          </Text>
          <Text type="secondary" className="text-[10px] uppercase font-mono">
            ID: {record.studentId || 'N/A'}
          </Text>
        </div>
      ),
    },
    {
      title: 'KHÓA HỌC',
      dataIndex: 'courseTitle',
      key: 'course',
      width: 200,
      render: (text) => (
        <Text type="secondary" className="text-xs italic line-clamp-1">
          {text}
        </Text>
      ),
    },
    {
      title: 'MỨC ĐỘ',
      dataIndex: 'rating',
      key: 'rating',
      align: 'center',
      render: (val) => (
        <div className="flex flex-col items-center">
          <Rate
            disabled
            defaultValue={val}
            className="text-[10px] text-amber-400"
          />
          <Text strong className="text-slate-400 text-[10px]">
            {val}/5
          </Text>
        </div>
      ),
    },
    {
      title: 'NỘI DUNG',
      dataIndex: 'comment',
      key: 'comment',
      render: (text) => (
        <Tooltip title={text} placement="topLeft">
          <Text className="line-clamp-2 max-w-[250px] text-slate-600 text-xs italic">
            "{text}"
          </Text>
        </Tooltip>
      ),
    },
    {
      title: 'TRẠNG THÁI',
      key: 'status',
      align: 'center',
      render: (_, record) => (
        <Space direction="vertical" size={4} className="flex items-center">
          <Tag
            color={record.isApproved ? 'green' : 'default'}
            bordered={false}
            className="rounded-full text-[10px] m-0 font-bold"
          >
            {record.isApproved ? 'ĐÃ DUYỆT' : 'CHỜ DUYỆT'}
          </Tag>
          {record.isFeatured && (
            <Tag
              color="gold"
              bordered={false}
              icon={<Star size={10} fill="currentColor" />}
              className="rounded-full text-[10px] m-0 font-bold"
            >
              NỔI BẬT
            </Tag>
          )}
        </Space>
      ),
    },
    {
      title: 'THAO TÁC',
      key: 'action',
      align: 'right',
      render: (_, record) => (
        <Space size="middle">
          <Tooltip title={record.isApproved ? 'Gỡ duyệt' : 'Phê duyệt'}>
            <Button
              type="text"
              size="small"
              className={
                record.isApproved ? 'text-slate-400' : 'text-emerald-500'
              }
              icon={<CheckCircle2 size={18} />}
              onClick={() => handleApprove(record.id)}
            />
          </Tooltip>
          <Tooltip title={record.isFeatured ? 'Gỡ nổi bật' : 'Đưa lên nổi bật'}>
            <Button
              type="text"
              size="small"
              className={
                record.isFeatured ? 'text-amber-500' : 'text-slate-300'
              }
              icon={<BadgeCheck size={18} />}
              onClick={() => handleToggleFeatured(record.id)}
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
      {/* HEADER SECTION */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <Title level={2} className="!m-0 text-slate-800 font-bold">
            Quản lý Đánh giá
          </Title>
          <Text type="secondary">
            Kiểm duyệt và quản lý phản hồi của học viên về các khóa học
          </Text>
        </div>
        <Space size="middle">
          <Button
            icon={
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            }
            onClick={loadReviews}
            className="rounded-lg h-10"
          >
            Làm mới
          </Button>
          <Button
            type="primary"
            icon={<Download size={18} />}
            onClick={exportCSV}
            className="bg-emerald-600 hover:!bg-emerald-700 h-10 px-6 rounded-lg font-bold border-none shadow-md shadow-emerald-100"
          >
            Xuất dữ liệu
          </Button>
        </Space>
      </div>

      {/* STATS CARDS */}
      <Row gutter={[24, 24]} className="mb-8">
        {[
          {
            title: 'Tổng đánh giá',
            value: stats.total,
            color: 'border-blue-500',
            icon: <MessageSquare className="text-blue-500" />,
          },
          {
            title: 'Đã phê duyệt',
            value: stats.approved,
            color: 'border-emerald-500',
            icon: <UserCheck className="text-emerald-500" />,
          },
          {
            title: 'Nổi bật',
            value: stats.featured,
            color: 'border-amber-500',
            icon: <Star className="text-amber-500" />,
          },
          {
            title: 'Điểm trung bình',
            value: stats.avg,
            color: 'border-purple-500',
            icon: <StarHalf className="text-purple-500" />,
            suffix: '/ 5',
          },
        ].map((item, idx) => (
          <Col xs={24} sm={12} lg={6} key={idx}>
            <Card
              variant="borderless"
              className={`shadow-sm border-l-4 ${item.color} rounded-xl`}
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
                suffix={item.suffix}
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

      {/* MAIN TABLE CARD */}
      <Card
        variant="borderless"
        className="shadow-sm rounded-xl overflow-hidden"
      >
        <div className="mb-6 flex flex-wrap gap-4 justify-between items-center">
          <Space size="middle" className="flex-1">
            <Input
              placeholder="Tìm theo học viên hoặc tên khóa học..."
              prefix={<Search size={18} className="text-slate-400" />}
              className="max-w-md h-11 rounded-xl bg-slate-50 border-none shadow-inner"
              value={filters.keyword}
              onChange={(e) =>
                setFilters({ ...filters, keyword: e.target.value })
              }
            />
            <Select
              className="w-40 h-11"
              value={filters.rating}
              onChange={(val) => setFilters({ ...filters, rating: val })}
              options={[
                { value: 'All', label: 'Tất cả mức sao' },
                { value: '5', label: '5 sao ★' },
                { value: '4', label: '4 sao ★' },
                { value: '3', label: '3 sao ★' },
                { value: '2', label: '2 sao ★' },
                { value: '1', label: '1 sao ★' },
              ]}
            />
            <Tooltip title="Xóa bộ lọc">
              <Button
                type="text"
                icon={<RotateCcw size={18} />}
                onClick={() => setFilters({ keyword: '', rating: 'All' })}
                className="h-11 text-slate-400"
              />
            </Tooltip>
          </Space>
        </div>

        <Table
          dataSource={filteredData}
          columns={columns}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 8,
            showTotal: (total) => (
              <Text type="secondary">Tổng số {total} đánh giá</Text>
            ),
            className: 'px-6 py-4',
          }}
          className="review-table shadow-sm"
        />
      </Card>

      <style>{`
        .review-table .ant-table-thead > tr > th {
          background: #f8fafc;
          color: #64748b;
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          font-weight: 700;
          border-bottom: 1px solid #e2e8f0;
        }
        .review-table .ant-table-tbody > tr:hover > td {
          background-color: #f1f5f9 !important;
        }
      `}</style>
    </div>
  );
};

export default AdminCourseReviewPage;
