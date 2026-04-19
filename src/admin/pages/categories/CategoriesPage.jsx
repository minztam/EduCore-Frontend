import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getCategories,
  toggleCategory,
  deleteCategory,
} from '../../../api/categoryApi';
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
  Row,
  Col,
  Statistic,
  Dropdown,
} from 'antd';
import {
  Search,
  RotateCcw,
  Plus,
  FolderTree,
  Edit3,
  Trash2,
  CheckCircle2,
  Layers,
  ChevronDown,
  ChevronRight,
  LayoutGrid,
  RefreshCw,
  Copy,
  MoreHorizontal,
  ShieldAlert,
} from 'lucide-react';

const { Text, Title } = Typography;

export default function CategoriesManagementPage() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [filters, setFilters] = useState({ keyword: '', type: 'All' });
  const [expandedRowKeys, setExpandedRowKeys] = useState([]);

  // ================= TẢI DỮ LIỆU =================
  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getCategories();
      const data = res?.data?.data || [];
      const sorted = data.sort((a, b) =>
        a.sortOrder !== b.sortOrder
          ? a.sortOrder - b.sortOrder
          : a.name.localeCompare(b.name)
      );
      setCategories(sorted);
    } catch {
      message.error('Không thể tải danh sách danh mục');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // ================= LOGIC CÂY DANH MỤC =================
  const filteredData = useMemo(() => {
    let data = categories.filter((item) => {
      const matchKeyword = item.name
        .toLowerCase()
        .includes(filters.keyword.toLowerCase());
      const matchType = filters.type === 'All' || item.type === filters.type;
      return matchKeyword && matchType;
    });

    const buildTree = (list, parentId = null) => {
      return list
        .filter((item) => item.parentId === parentId)
        .map((item) => ({
          ...item,
          key: item.id,
          children:
            buildTree(list, item.id).length > 0
              ? buildTree(list, item.id)
              : null,
        }));
    };

    return buildTree(data, null);
  }, [categories, filters]);

  // ================= XỬ LÝ SỰ KIỆN =================
  const handleBulkDelete = () => {
    Modal.confirm({
      title: `Xác nhận xóa ${selectedRowKeys.length} mục đã chọn?`,
      icon: <ShieldAlert size={22} className="text-red-500" />,
      content:
        'Lưu ý: Hành động này sẽ xóa vĩnh viễn các danh mục này khỏi hệ thống.',
      okText: 'Xóa ngay',
      cancelText: 'Hủy',
      okType: 'danger',
      centered: true,
      onOk: async () => {
        try {
          await Promise.all(selectedRowKeys.map((id) => deleteCategory(id)));
          message.success('Đã xóa thành công');
          setSelectedRowKeys([]);
          fetchCategories();
        } catch {
          message.error('Có lỗi xảy ra khi xóa hàng loạt');
        }
      },
    });
  };

  const handleCopySlug = (slug) => {
    navigator.clipboard.writeText(slug);
    message.success('Đã sao chép đường dẫn (slug)');
  };

  const handleToggleStatus = async (record) => {
    try {
      await toggleCategory(record.id);
      message.success(
        `Đã ${record.isActive ? 'khóa' : 'kích hoạt'} danh mục thành công`
      );
      fetchCategories();
    } catch {
      message.error('Thao tác thất bại, vui lòng thử lại');
    }
  };

  const handleDelete = (id) => {
    Modal.confirm({
      title: 'Xác nhận xóa danh mục',
      icon: <Trash2 size={22} className="text-red-500" />,
      content: 'Bạn có chắc chắn muốn xóa danh mục này?',
      okText: 'Xóa ngay',
      cancelText: 'Hủy',
      okType: 'danger',
      onOk: async () => {
        try {
          await deleteCategory(id);
          message.success('Đã xóa danh mục thành công');
          fetchCategories();
        } catch {
          message.error('Xóa thất bại');
        }
      },
    });
  };

  // ================= CẤU HÌNH CỘT BẢNG =================
  const columns = [
    {
      title: 'TÊN DANH MỤC',
      key: 'name',
      width: 320,
      render: (_, record) => (
        <Space>
          <FolderTree
            size={18}
            className={record.parentId ? 'text-slate-400' : 'text-blue-600'}
          />
          <Text strong className="text-slate-700">
            {record.name}
          </Text>
        </Space>
      ),
    },
    {
      title: 'ĐƯỜNG DẪN (SLUG)',
      dataIndex: 'slug',
      key: 'slug',
      render: (slug) => (
        <Tooltip title="Nhấp để sao chép">
          <Tag
            variant="filled"
            className="cursor-pointer font-mono hover:bg-blue-50 transition-colors border-slate-200"
            onClick={() => handleCopySlug(slug)}
          >
            <Copy size={10} className="inline mr-1 opacity-50" /> /{slug}
          </Tag>
        </Tooltip>
      ),
    },
    {
      title: 'LOẠI',
      dataIndex: 'type',
      key: 'type',
      align: 'center',
      render: (type) => {
        const config = {
          Course: { color: 'blue', label: 'Khóa học' },
          Blog: { color: 'orange', label: 'Bài viết' },
          Tournament: { color: 'purple', label: 'Giải đấu' },
        };
        const item = config[type] || { color: 'default', label: type };
        return (
          <Tag
            color={item.color}
            variant="filled"
            className="rounded-full px-3 font-bold text-[10px] uppercase"
          >
            {item.label}
          </Tag>
        );
      },
    },
    {
      title: 'TRẠNG THÁI',
      dataIndex: 'isActive',
      key: 'isActive',
      align: 'center',
      render: (isActive, record) => (
        <Tag
          onClick={() => handleToggleStatus(record)}
          color={isActive ? 'green' : 'default'}
          variant="filled"
          className="rounded-full px-3 font-bold text-[10px] uppercase cursor-pointer border-none"
        >
          {isActive ? 'Hoạt động' : 'Đã khóa'}
        </Tag>
      ),
    },
    {
      title: 'THAO TÁC',
      key: 'action',
      align: 'right',
      render: (_, record) => {
        const actionItems = [
          {
            key: 'edit',
            label: 'Chỉnh sửa thông tin',
            icon: <Edit3 size={14} />,
            onClick: () => navigate(`/admin/categories/edit/${record.id}`),
          },
          {
            key: 'toggle',
            label: record.isActive ? 'Khóa danh mục này' : 'Kích hoạt danh mục',
            icon: <RotateCcw size={14} />,
            onClick: () => handleToggleStatus(record),
          },
          {
            type: 'divider',
          },
          {
            key: 'delete',
            label: 'Xóa mục này',
            danger: true,
            icon: <Trash2 size={14} />,
            onClick: () => handleDelete(record.id),
          },
        ];

        return (
          <Space>
            <Tooltip title="Sửa nhanh">
              <Button
                type="text"
                size="small"
                icon={<Edit3 size={16} />}
                onClick={() => navigate(`/admin/categories/edit/${record.id}`)}
              />
            </Tooltip>
            <Dropdown menu={{ items: actionItems }} trigger={['click']}>
              <Button
                type="text"
                size="small"
                icon={<MoreHorizontal size={16} />}
              />
            </Dropdown>
          </Space>
        );
      },
    },
  ];

  const stats = useMemo(
    () => ({
      total: categories.length,
      active: categories.filter((c) => c.isActive).length,
      inactive: categories.filter((c) => !c.isActive).length,
      parent: categories.filter((c) => !c.parentId).length,
    }),
    [categories]
  );

  return (
    <div className="p-8 bg-[#f8fafc] min-h-screen">
      {/* TIÊU ĐỀ TRANG */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <Title level={2} className="!m-0 text-slate-800 font-bold">
            Cấu trúc Danh mục
          </Title>
          <Text type="secondary">
            Quản lý phân cấp nội dung đa tầng hệ thống
          </Text>
        </div>
        <Space>
          <Button
            icon={
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            }
            onClick={fetchCategories}
            className="rounded-lg h-10"
          >
            Làm mới
          </Button>
          <Button
            type="primary"
            className="bg-blue-600 h-10 font-bold px-6 rounded-lg"
            icon={<Plus size={18} />}
            onClick={() => navigate('/admin/categories/create')}
          >
            Thêm danh mục mới
          </Button>
        </Space>
      </div>

      {/* THỐNG KÊ NHANH */}
      <Row gutter={[24, 24]} className="mb-8">
        {[
          {
            title: 'TỔNG SỐ DANH MỤC',
            value: stats.total,
            color: 'border-blue-500',
            icon: <Layers className="text-blue-500" />,
          },
          {
            title: 'ĐANG HOẠT ĐỘNG',
            value: stats.active,
            color: 'border-emerald-500',
            icon: <CheckCircle2 className="text-emerald-500" />,
          },
          {
            title: 'ĐÃ KHÓA / ẨN', // Ô thống kê mới
            value: stats.inactive,
            color: 'border-red-500',
            icon: <ShieldAlert className="text-red-500" />,
          },
          {
            title: 'DANH MỤC CẤP GỐC',
            value: stats.parent,
            color: 'border-purple-500',
            icon: <LayoutGrid className="text-purple-500" />,
          },
        ].map((item, idx) => (
          <Col xs={24} sm={12} md={6} key={idx}>
            {' '}
            {/* Chỉnh md thành 6 để hiển thị 4 cột trên 1 hàng */}
            <Card
              variant="borderless"
              className={`shadow-sm border-l-4 ${item.color} rounded-xl`}
            >
              <Statistic
                title={
                  <Text
                    strong
                    className="text-[11px] uppercase opacity-60 tracking-wider"
                  >
                    {item.title}
                  </Text>
                }
                value={item.value}
                prefix={React.cloneElement(item.icon, {
                  size: 20,
                  className: 'mr-2',
                })}
              />
            </Card>
          </Col>
        ))}
      </Row>

      {/* NỘI DUNG CHÍNH */}
      <Card
        variant="borderless"
        className="shadow-sm rounded-xl overflow-hidden"
      >
        <div className="mb-6 flex flex-wrap gap-4 justify-between items-center">
          <Space size="middle">
            <Input
              placeholder="Tìm kiếm tên danh mục..."
              prefix={<Search size={18} className="text-slate-400" />}
              className="w-72 h-10 rounded-lg bg-slate-50 border-slate-200"
              value={filters.keyword}
              onChange={(e) =>
                setFilters({ ...filters, keyword: e.target.value })
              }
            />
            <Select
              className="w-44 h-10"
              value={filters.type}
              onChange={(val) => setFilters({ ...filters, type: val })}
              options={[
                { value: 'All', label: 'Tất cả loại hình' },
                { value: 'Course', label: 'Khóa học' },
                { value: 'Blog', label: 'Bài viết' },
                { value: 'Tournament', label: 'Giải đấu' },
              ]}
            />
            {selectedRowKeys.length > 0 && (
              <Button
                danger
                type="primary"
                className="h-10 rounded-lg"
                icon={<Trash2 size={16} />}
                onClick={handleBulkDelete}
              >
                Xóa {selectedRowKeys.length} mục đã chọn
              </Button>
            )}
          </Space>

          <Space>
            <Button
              size="small"
              className="rounded-md font-bold text-[10px] uppercase"
              onClick={() => setExpandedRowKeys(categories.map((c) => c.id))}
            >
              Mở rộng tất cả
            </Button>
            <Button
              size="small"
              className="rounded-md font-bold text-[10px] uppercase"
              onClick={() => setExpandedRowKeys([])}
            >
              Thu gọn tất cả
            </Button>
            <Tooltip title="Đặt lại bộ lọc">
              <Button
                type="text"
                icon={<RotateCcw size={18} />}
                className="text-slate-400"
                onClick={() => setFilters({ keyword: '', type: 'All' })}
              />
            </Tooltip>
          </Space>
        </div>

        <Table
          rowSelection={{
            selectedRowKeys,
            onChange: (keys) => setSelectedRowKeys(keys),
          }}
          dataSource={filteredData}
          columns={columns}
          loading={loading}
          expandedRowKeys={expandedRowKeys}
          onExpandedRowsChange={setExpandedRowKeys}
          expandable={{
            expandIcon: ({ expanded, onExpand, record }) =>
              record.children ? (
                expanded ? (
                  <ChevronDown
                    size={16}
                    className="mr-2 text-blue-500 cursor-pointer"
                    onClick={(e) => onExpand(record, e)}
                  />
                ) : (
                  <ChevronRight
                    size={16}
                    className="mr-2 text-slate-400 cursor-pointer"
                    onClick={(e) => onExpand(record, e)}
                  />
                )
              ) : (
                <span className="mr-6"></span>
              ),
          }}
          pagination={false}
          className="category-table"
          locale={{
            emptyText: 'Không tìm thấy danh mục nào',
          }}
        />
      </Card>

      <style>{`
        .category-table .ant-table-thead > tr > th { background: #f8fafc; color: #64748b; font-size: 11px; text-transform: uppercase; font-weight: 700; border-bottom: 1px solid #e2e8f0; }
        .category-table .ant-table-row-level-1 { background-color: #fafafa; }
        .category-table .ant-table-tbody > tr:hover > td { background-color: #f1f5f9 !important; }
        .category-table .ant-table-selection-column { padding-left: 16px !important; }
      `}</style>
    </div>
  );
}
