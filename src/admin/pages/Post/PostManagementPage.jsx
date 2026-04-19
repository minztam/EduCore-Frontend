import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getPosts,
  deletePost,
  togglePublishPost,
  toggleFeaturedPost, // <-- Đảm bảo bạn đã export hàm này trong postApi
} from '../../../api/postApi';
import { getCategories } from '../../../api/categoryApi';
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
  Image,
  Row,
  Col,
  Statistic,
} from 'antd';
import {
  Search,
  RotateCcw,
  Plus,
  Eye,
  Edit3,
  Trash2,
  FileText,
  CheckCircle2,
  Clock,
  BarChart3,
  RefreshCw,
  Star, // Thêm icon ngôi sao
} from 'lucide-react';

const { Text, Title } = Typography;

export default function PostManagementPage() {
  const [posts, setPosts] = useState({
    items: [],
    page: 1,
    pageSize: 10,
    totalItems: 0,
  });
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [filters, setFilters] = useState({
    keyword: '',
    categoryId: '',
    status: '',
  });

  const navigate = useNavigate();

  // ================= FETCH CATEGORIES =================
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await getCategories();
        const blogCats = (res?.data?.data || []).filter(
          (c) => c.type === 'Blog'
        );
        setCategories(blogCats);
      } catch {
        message.error('Không tải được danh mục');
      }
    };
    fetchCategories();
  }, []);

  // ================= FETCH POSTS =================
  const fetchPosts = useCallback(
    async (page = 1) => {
      try {
        setLoading(true);
        const isPublished =
          filters.status === '' ? undefined : filters.status === 'published';

        const res = await getPosts({
          page,
          pageSize: 10,
          keyword: filters.keyword || undefined,
          categoryId: filters.categoryId || undefined,
          isPublished,
        });

        const data = res?.data?.data;
        setPosts({
          items: data?.items || [],
          page: data?.page || 1,
          pageSize: data?.pageSize || 10,
          totalItems: data?.totalItems || 0,
        });
      } catch {
        message.error('Lỗi tải danh sách bài viết');
      } finally {
        setLoading(false);
      }
    },
    [filters]
  );

  useEffect(() => {
    const timer = setTimeout(() => fetchPosts(1), 400);
    return () => clearTimeout(timer);
  }, [fetchPosts]);

  // ================= STATS (Memoized) =================
  const stats = useMemo(() => {
    const totalViews = posts.items.reduce((s, p) => s + (p.viewCount || 0), 0);
    const published = posts.items.filter((p) => p.isPublished).length;
    const featured = posts.items.filter((p) => p.isFeatured).length;
    return {
      total: posts.totalItems,
      published: published,
      draft: Math.max(0, posts.totalItems - published),
      views: totalViews,
      featured: featured,
    };
  }, [posts]);

  // ================= HANDLERS =================
  const handleDelete = (slug) => {
    Modal.confirm({
      title: 'Xác nhận xóa bài viết',
      icon: <Trash2 size={22} className="text-red-500" />,
      content:
        'Bài viết này sẽ bị xóa vĩnh viễn. Bạn có chắc chắn muốn thực hiện?',
      okText: 'Xóa ngay',
      okType: 'danger',
      centered: true,
      onOk: async () => {
        try {
          await deletePost(slug);
          message.success('Đã xóa bài viết thành công');
          fetchPosts(posts.page);
        } catch {
          message.error('Xóa thất bại');
        }
      },
    });
  };

  const handleToggleStatus = async (record) => {
    try {
      setPosts((prev) => ({
        ...prev,
        items: prev.items.map((p) =>
          p.id === record.id ? { ...p, isPublished: !p.isPublished } : p
        ),
      }));
      await togglePublishPost(record.id);
      message.success(`Đã ${record.isPublished ? 'gỡ' : 'xuất bản'} bài viết`);
    } catch {
      message.error('Cập nhật thất bại');
      fetchPosts(posts.page);
    }
  };

  const handleToggleFeatured = async (record) => {
    try {
      // Optimistic update
      setPosts((prev) => ({
        ...prev,
        items: prev.items.map((p) =>
          p.id === record.id ? { ...p, isFeatured: !p.isFeatured } : p
        ),
      }));
      await toggleFeaturedPost(record.id);
      message.success(
        `Đã ${record.isFeatured ? 'gỡ khỏi' : 'thêm vào'} mục nổi bật`
      );
    } catch {
      message.error('Cập nhật nổi bật thất bại');
      fetchPosts(posts.page);
    }
  };

  const columns = [
    {
      title: 'BÀI VIẾT',
      key: 'post',
      width: 400,
      render: (_, record) => (
        <Space size="middle">
          <Image
            src={record.thumbnail || 'https://via.placeholder.com/150'}
            width={80}
            height={50}
            className="rounded-lg object-cover shadow-sm border border-slate-100"
            preview={false}
          />
          <div className="flex flex-col">
            <Text strong className="text-slate-700 line-clamp-1 text-sm">
              {record.title}
            </Text>
            <Text
              type="secondary"
              className="text-[10px] font-mono bg-slate-100 w-fit px-1 rounded"
            >
              /{record.slug}
            </Text>
          </div>
        </Space>
      ),
    },
    {
      title: 'DANH MỤC',
      dataIndex: ['category', 'name'],
      key: 'category',
      render: (name) => (
        <Tag
          color="blue"
          bordered={false}
          className="rounded-full px-3 font-bold text-[10px] uppercase"
        >
          {name || 'BLOG'}
        </Tag>
      ),
    },
    {
      title: 'NỔI BẬT',
      dataIndex: 'isFeatured',
      key: 'isFeatured',
      align: 'center',
      render: (isFeatured, record) => (
        <Tooltip title={isFeatured ? 'Bỏ nổi bật' : 'Đặt làm nổi bật'}>
          <Button
            type="text"
            className={`transition-all ${isFeatured ? 'text-amber-500' : 'text-slate-300 hover:text-amber-200'}`}
            icon={
              isFeatured ? (
                <Star size={20} fill="currentColor" />
              ) : (
                <Star size={20} />
              )
            }
            onClick={() => handleToggleFeatured(record)}
          />
        </Tooltip>
      ),
    },
    {
      title: 'TRẠNG THÁI',
      dataIndex: 'isPublished',
      key: 'status',
      align: 'center',
      render: (isPublished, record) => (
        <Tag
          onClick={() => handleToggleStatus(record)}
          color={isPublished ? 'green' : 'default'}
          className="rounded-full px-3 font-bold text-[10px] uppercase cursor-pointer border-none shadow-sm"
        >
          {isPublished ? 'Đã đăng' : 'Bản nháp'}
        </Tag>
      ),
    },
    {
      title: 'LƯỢT XEM',
      dataIndex: 'viewCount',
      key: 'views',
      align: 'center',
      render: (val) => (
        <Space size={4} className="text-slate-500 font-bold">
          <Eye size={14} className="text-slate-400" />
          {val?.toLocaleString('vi') || 0}
        </Space>
      ),
    },
    {
      title: 'THAO TÁC',
      key: 'action',
      align: 'right',
      render: (_, record) => (
        <Space>
          <Tooltip title="Chỉnh sửa">
            <Button
              type="text"
              size="small"
              className="text-slate-400 hover:text-blue-500"
              icon={<Edit3 size={18} />}
              onClick={() => navigate(`/admin/posts/edit/${record.slug}`)}
            />
          </Tooltip>
          <Tooltip title="Xóa bài">
            <Button
              type="text"
              size="small"
              danger
              icon={<Trash2 size={18} />}
              onClick={() => handleDelete(record.slug)}
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
            Quản lý Bài viết
          </Title>
          <Text type="secondary">Đăng tải và biên tập nội dung hệ thống</Text>
        </div>
        <Space size="middle">
          <Button
            icon={
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            }
            onClick={() => fetchPosts(posts.page)}
            className="h-10 px-4 rounded-lg font-medium"
          >
            Làm mới
          </Button>
          <Button
            type="primary"
            icon={<Plus size={18} />}
            onClick={() => navigate('/admin/posts/create')}
            className="bg-blue-600 h-10 px-6 rounded-lg font-bold shadow-md shadow-blue-100 border-none"
          >
            Viết bài mới
          </Button>
        </Space>
      </div>

      {/* STATS CARDS */}
      <Row gutter={[24, 24]} className="mb-8">
        {[
          {
            title: 'Tổng bài viết',
            value: stats.total,
            color: 'border-blue-500',
            icon: <FileText className="text-blue-500" />,
          },
          {
            title: 'Nổi bật (Slider)',
            value: stats.featured,
            color: 'border-amber-500',
            icon: <Star className="text-amber-500" />,
          },
          {
            title: 'Đã xuất bản',
            value: stats.published,
            color: 'border-emerald-500',
            icon: <CheckCircle2 className="text-emerald-500" />,
          },
          {
            title: 'Tổng lượt xem',
            value: stats.views,
            color: 'border-purple-500',
            icon: <BarChart3 className="text-purple-500" />,
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
        bodyStyle={{ padding: 0 }}
      >
        <div className="p-5 border-b border-slate-100 bg-white">
          <Space size="middle" className="w-full">
            <Input
              placeholder="Tìm bài viết..."
              prefix={<Search size={18} className="text-slate-400" />}
              className="w-80 h-10 rounded-lg bg-slate-50 border-none shadow-inner"
              value={filters.keyword}
              onChange={(e) =>
                setFilters({ ...filters, keyword: e.target.value })
              }
            />
            <Select
              placeholder="Danh mục"
              className="w-44 h-10"
              allowClear
              value={filters.categoryId || undefined}
              onChange={(val) => setFilters({ ...filters, categoryId: val })}
              options={categories.map((c) => ({ value: c.id, label: c.name }))}
            />
            <Select
              placeholder="Trạng thái"
              className="w-36 h-10"
              allowClear
              value={filters.status || undefined}
              onChange={(val) => setFilters({ ...filters, status: val })}
              options={[
                { value: 'published', label: 'Đã đăng' },
                { value: 'draft', label: 'Bản nháp' },
              ]}
            />
            <Tooltip title="Đặt lại bộ lọc">
              <Button
                type="text"
                icon={<RotateCcw size={18} />}
                onClick={() =>
                  setFilters({ keyword: '', categoryId: '', status: '' })
                }
                className="text-slate-400"
              />
            </Tooltip>
          </Space>
        </div>

        <Table
          dataSource={posts.items}
          columns={columns}
          rowKey="id"
          loading={loading}
          pagination={{
            current: posts.page,
            total: posts.totalItems,
            pageSize: posts.pageSize,
            onChange: (page) => fetchPosts(page),
            showTotal: (total) => (
              <Text type="secondary" className="text-xs ml-4">
                Tổng số {total} bài viết
              </Text>
            ),
            className: 'px-6 py-4',
          }}
          className="post-table shadow-none"
        />
      </Card>

      <style>{`
        .post-table .ant-table-thead > tr > th {
          background: #fcfcfd;
          color: #64748b;
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          font-weight: 700;
          border-bottom: 1px solid #f1f5f9;
          padding: 16px 20px;
        }
        .post-table .ant-table-tbody > tr > td {
          padding: 12px 20px;
        }
        .post-table .ant-table-tbody > tr:hover > td {
          background-color: #f8fafc !important;
        }
      `}</style>
    </div>
  );
}
