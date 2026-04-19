import React, { useEffect, useState, useCallback } from 'react';
import {
  getUsers,
  toggleUser,
  getUserStats,
  changeUserRole,
  deleteUser,
  registerUser,
  updateUserProfile, // Đảm bảo API này đã được import
} from '../../api/userApi';
import {
  Table,
  Tag,
  Avatar,
  Space,
  Card,
  Modal,
  message,
  Input,
  Button,
  Tooltip,
  Badge,
  Typography,
  Row,
  Col,
  Statistic,
  Select,
  Dropdown,
  Descriptions,
  Form,
  Empty,
  DatePicker,
} from 'antd';
import {
  Search,
  RotateCcw,
  UserCheck,
  UserX,
  RefreshCw,
  Users as UsersIcon,
  UserCog,
  MoreHorizontal,
  Mail,
  Eye,
  Key,
  UserPlus,
  Trash2,
  Shield,
  AlertCircle,
  Calendar,
  Globe,
  Download,
  Copy,
} from 'lucide-react';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/vi';
import * as XLSX from 'xlsx';

dayjs.extend(relativeTime);
dayjs.locale('vi');

const { Text, Title } = Typography;
const { RangePicker } = DatePicker;

const UsersPage = () => {
  const [form] = Form.useForm();
  const [passwordForm] = Form.useForm(); // BỔ SUNG
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false); // BỔ SUNG
  const [submitting, setSubmitting] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const [filters, setFilters] = useState({
    keyword: '',
    role: undefined,
    status: undefined,
    dateRange: null,
  });

  // ================= LẤY DỮ LIỆU =================
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        pageIndex: pagination.current,
        pageSize: pagination.pageSize,
        keyword: filters.keyword || null,
        role: filters.role || null,
        isActive:
          filters.status === 'active'
            ? true
            : filters.status === 'inactive'
              ? false
              : null,
        fromDate: filters.dateRange?.[0]?.format('YYYY-MM-DD'),
        toDate: filters.dateRange?.[1]?.format('YYYY-MM-DD'),
      };

      const [userRes, statsRes] = await Promise.all([
        getUsers(params),
        getUserStats(),
      ]);

      if (userRes.data?.success) {
        setUsers(userRes.data.data.items);
        setPagination((prev) => ({
          ...prev,
          total: userRes.data.data.totalCount,
        }));
      }
      if (statsRes.data?.success) {
        setStats(statsRes.data.data);
      }
    } catch (err) {
      message.error('Không thể tải dữ liệu từ máy chủ');
    } finally {
      setLoading(false);
    }
  }, [filters, pagination.current, pagination.pageSize]);

  useEffect(() => {
    const timer = setTimeout(() => fetchData(), 500);
    return () => clearTimeout(timer);
  }, [fetchData]);

  // ================= XỬ LÝ EXCEL =================
  const handleExportExcel = () => {
    const dataToExport = users.map((u) => ({
      'Họ tên': u.name,
      Email: u.email,
      'Vai trò': u.role,
      'Trạng thái': u.isActive ? 'Hoạt động' : 'Bị khóa',
      'Phương thức': u.provider,
      'Ngày tạo': dayjs(u.createdAt).format('DD/MM/YYYY'),
    }));

    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Danh sách người dùng');
    XLSX.writeFile(wb, `EduCore_Users_${dayjs().format('DDMMYYYY')}.xlsx`);
    message.success('Đang tải xuống file Excel...');
  };

  // ================= COPY EMAIL =================
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    message.success(`Đã sao chép: ${text}`);
  };

  // ================= XỬ LÝ SỰ KIỆN =================
  const handleAddUser = async (values) => {
    try {
      setSubmitting(true);
      const res = await registerUser(values);

      if (res.data?.success || res.status === 200) {
        message.success('Thêm thành viên mới thành công!');
        setIsAddModalOpen(false);
        form.resetFields();
        fetchData();
      }
    } catch (err) {
      const errorData = err.response?.data;
      if (errorData?.errors) {
        const messages = Object.values(errorData.errors).flat().join(', ');
        message.error(messages);
      } else {
        message.error(errorData?.message || 'Có lỗi xảy ra khi tạo tài khoản');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdatePassword = async (values) => {
    try {
      setSubmitting(true);
      const res = await updateUserProfile(selectedUser.id, {
        password: values.password,
      });
      if (res.data?.success || res.status === 200) {
        message.success(`Đã đổi mật khẩu cho tài khoản ${selectedUser.email}`);
        setIsPasswordModalOpen(false);
        passwordForm.resetFields();
      }
    } catch (err) {
      message.error('Lỗi cập nhật mật khẩu');
    } finally {
      setSubmitting(false);
    }
  };

  const showDetails = (record) => {
    setSelectedUser(record);
    setIsDetailModalOpen(true);
  };

  const handleToggleStatus = (record) => {
    Modal.confirm({
      title: record.isActive ? 'Khóa tài khoản' : 'Kích hoạt tài khoản',
      icon: record.isActive ? (
        <UserX size={22} className="text-red-500" />
      ) : (
        <UserCheck size={22} className="text-emerald-500" />
      ),
      content: `Xác nhận thay đổi trạng thái hoạt động của ${record.name}?`,
      okText: 'Xác nhận',
      cancelText: 'Hủy bỏ',
      onOk: async () => {
        try {
          await toggleUser(record.id);
          message.success('Cập nhật trạng thái thành công');
          fetchData();
        } catch {
          message.error('Lỗi khi cập nhật trạng thái');
        }
      },
    });
  };

  const handleChangeRole = (record) => {
    let selectedRole = record.role;
    Modal.confirm({
      title: 'Thay đổi vai trò',
      content: (
        <div className="mt-4">
          <Text>
            Chọn vai trò mới cho <b>{record.name}</b>:
          </Text>
          <Select
            className="w-full mt-2 h-10"
            defaultValue={record.role}
            onChange={(val) => (selectedRole = val)}
            options={[
              { value: 'Admin', label: 'Quản trị viên' },
              { value: 'User', label: 'Người dùng' },
              { value: 'Lecturer', label: 'Giảng viên' },
            ]}
          />
        </div>
      ),
      okText: 'Cập nhật',
      cancelText: 'Hủy bỏ',
      onOk: async () => {
        try {
          await changeUserRole(record.id, selectedRole);
          message.success('Cập nhật vai trò thành công');
          fetchData();
        } catch {
          message.error('Lỗi khi đổi vai trò');
        }
      },
    });
  };

  const handleDelete = (record) => {
    Modal.confirm({
      title: 'Xóa tài khoản',
      icon: <Trash2 size={22} className="text-red-500" />,
      content: `Bạn có chắc chắn muốn xóa vĩnh viễn tài khoản ${record.email}? Thao tác này không thể hoàn tác.`,
      okText: 'Xóa ngay',
      cancelText: 'Hủy bỏ',
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          await deleteUser(record.id);
          message.success('Đã xóa tài khoản thành công');
          fetchData();
        } catch {
          message.error('Lỗi khi xóa tài khoản');
        }
      },
    });
  };

  // ================= CẤU HÌNH CỘT BẢNG =================
  const columns = [
    {
      title: 'THÀNH VIÊN',
      key: 'userInfo',
      width: 280,
      render: (_, record) => (
        <Space size="middle">
          <Badge
            dot
            status={record.isActive ? 'success' : 'error'}
            offset={[-5, 32]}
          >
            <Avatar
              src={record.avatarUrl}
              size={42}
              className="border border-slate-100 shadow-sm"
            >
              {record.name?.charAt(0).toUpperCase()}
            </Avatar>
          </Badge>
          <div className="flex flex-col">
            <Text strong className="text-slate-700 text-sm leading-tight">
              {record.name}
            </Text>
            <Tooltip title="Click để sao chép email">
              <Text
                type="secondary"
                className="text-[11px] flex items-center gap-1 cursor-pointer hover:text-blue-500 transition-colors"
                onClick={() => copyToClipboard(record.email)}
              >
                <Mail size={10} /> {record.email}
              </Text>
            </Tooltip>
          </div>
        </Space>
      ),
    },
    {
      title: 'PHƯƠNG THỨC',
      dataIndex: 'provider',
      key: 'provider',
      width: 130,
      render: (provider) => (
        <Tag
          icon={provider === 'Google' ? <Globe size={12} /> : null}
          color={provider === 'Google' ? 'orange' : 'default'}
          className="rounded-md"
        >
          {provider === 'Google' ? 'Google' : 'Hệ thống'}
        </Tag>
      ),
    },
    {
      title: 'VAI TRÒ',
      dataIndex: 'role',
      key: 'role',
      width: 120,
      render: (role) => {
        const roles = {
          Admin: { color: 'volcano', label: 'QUẢN TRỊ' },
          Lecturer: { color: 'purple', label: 'GIẢNG VIÊN' },
          User: { color: 'blue', label: 'THÀNH VIÊN' },
        };
        const config = roles[role] || { color: 'default', label: role };
        return (
          <Tag
            color={config.color}
            variant="filled"
            className="font-bold text-[10px] px-3 rounded-full border-none"
          >
            {config.label}
          </Tag>
        );
      },
    },
    {
      title: 'NGÀY TẠO',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 160,
      render: (date) => (
        <div className="flex flex-col">
          <Text className="text-xs text-slate-600">
            {dayjs(date).format('DD/MM/YYYY')}
          </Text>
          <Text className="text-[10px] text-slate-400 italic">
            {dayjs(date).fromNow()}
          </Text>
        </div>
      ),
    },
    {
      title: 'THAO TÁC',
      key: 'action',
      align: 'right',
      width: 120,
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Xem chi tiết">
            <Button
              type="text"
              shape="circle"
              icon={<Eye size={18} className="text-slate-400" />}
              onClick={() => showDetails(record)}
            />
          </Tooltip>
          <Dropdown
            menu={{
              items: [
                {
                  key: 'role',
                  label: 'Đổi vai trò',
                  icon: <UserCog size={14} />,
                  onClick: () => handleChangeRole(record),
                },
                ...(record.provider === 'Local'
                  ? [
                      {
                        key: 'pwd',
                        label: 'Đổi mật khẩu',
                        icon: <Key size={14} />,
                        onClick: () => {
                          setSelectedUser(record);
                          setIsPasswordModalOpen(true);
                        },
                      },
                    ]
                  : []),
                { type: 'divider' },
                {
                  key: 'status',
                  label: record.isActive ? 'Khóa tài khoản' : 'Kích hoạt lại',
                  danger: record.isActive,
                  icon: record.isActive ? (
                    <UserX size={14} />
                  ) : (
                    <UserCheck size={14} />
                  ),
                  onClick: () => handleToggleStatus(record),
                },
                {
                  key: 'del',
                  label: 'Xóa vĩnh viễn',
                  danger: true,
                  icon: <Trash2 size={14} />,
                  onClick: () => handleDelete(record),
                },
              ],
            }}
            trigger={['click']}
          >
            <Button
              type="text"
              shape="circle"
              icon={<MoreHorizontal size={18} className="text-slate-400" />}
            />
          </Dropdown>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-8 bg-[#f8fafc] min-h-screen relative">
      {/* BULK ACTIONS BAR */}
      {selectedRowKeys.length > 0 && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-6 animate-in slide-in-from-bottom-4">
          <Text className="text-white font-medium">
            Đã chọn{' '}
            <span className="text-blue-400 font-bold">
              {selectedRowKeys.length}
            </span>{' '}
            người dùng
          </Text>
          <div className="h-4 w-[1px] bg-slate-700" />
          <Space>
            <Button
              size="small"
              type="primary"
              danger
              icon={<Trash2 size={14} />}
              className="rounded-lg"
            >
              Xóa hàng loạt
            </Button>
            <Button
              size="small"
              ghost
              onClick={() => setSelectedRowKeys([])}
              className="rounded-lg"
            >
              Hủy
            </Button>
          </Space>
        </div>
      )}

      {/* TIÊU ĐỀ TRANG */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <Title
            level={2}
            className="!m-0 text-slate-800 font-bold tracking-tight"
          >
            Quản lý người dùng
          </Title>
          <Text type="secondary" className="text-slate-500">
            Quản trị tài khoản và phân quyền hệ thống giáo dục EduCore
          </Text>
        </div>
        <Space size="middle">
          <Button
            className="h-10 flex items-center rounded-lg border-emerald-200 text-emerald-600 hover:!border-emerald-500 hover:!text-emerald-500"
            icon={<Download size={16} />}
            onClick={handleExportExcel}
          >
            Xuất Excel
          </Button>
          <Button
            className="h-10 flex items-center rounded-lg hover:!border-blue-500 hover:!text-blue-500 transition-all shadow-sm"
            icon={
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            }
            onClick={() => fetchData()}
          >
            Làm mới
          </Button>
          <Button
            type="primary"
            icon={<UserPlus size={18} />}
            className="bg-blue-600 h-10 flex items-center rounded-lg shadow-md hover:bg-blue-700 border-none px-6"
            onClick={() => setIsAddModalOpen(true)}
          >
            Thêm thành viên
          </Button>
        </Space>
      </div>

      {/* THỐNG KÊ NHANH */}
      <Row gutter={[24, 24]} className="mb-8">
        {[
          {
            title: 'Tổng thành viên',
            value: stats?.totalUsers,
            color: 'border-blue-500',
            icon: <UsersIcon className="text-blue-500" />,
            bg: 'hover:bg-blue-50/50',
          },
          {
            title: 'Đang hoạt động',
            value: stats?.totalActive,
            color: 'border-emerald-500',
            icon: <UserCheck className="text-emerald-500" />,
            bg: 'hover:bg-emerald-50/50',
          },
          {
            title: 'Tài khoản bị khóa',
            value: stats?.totalInactive,
            color: 'border-rose-500',
            icon: <UserX className="text-rose-500" />,
            bg: 'hover:bg-rose-50/50',
          },
          {
            title: 'Quản trị viên',
            value: stats?.totalAdmin,
            color: 'border-orange-500',
            icon: <Shield className="text-orange-500" />,
            bg: 'hover:bg-orange-50/50',
          },
        ].map((item, idx) => (
          <Col xs={24} sm={12} lg={6} key={idx}>
            <Card
              variant="borderless"
              className={`shadow-sm border-l-4 ${item.color} rounded-xl bg-white transition-all duration-300 ${item.bg} cursor-default`}
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
                value={item.value || 0}
                prefix={React.cloneElement(item.icon, {
                  size: 20,
                  className: 'mr-2',
                })}
                styles={{ content: { fontWeight: 800, color: '#1e293b' } }}
              />
            </Card>
          </Col>
        ))}
      </Row>

      {/* BỘ LỌC VÀ BẢNG DỮ LIỆU */}
      <Card
        variant="borderless"
        className="shadow-md rounded-2xl overflow-hidden border border-slate-100"
        styles={{ body: { padding: 0 } }}
      >
        <div className="p-5 border-b border-slate-100 bg-white flex flex-wrap gap-4 items-center">
          <Input
            placeholder="Tìm theo tên, email..."
            prefix={<Search size={18} className="text-slate-400" />}
            className="w-64 h-10 bg-slate-50 border-none rounded-lg focus:bg-white transition-all"
            value={filters.keyword}
            onChange={(e) =>
              setFilters({ ...filters, keyword: e.target.value })
            }
          />
          <Select
            placeholder="Vai trò"
            className="w-36 h-10"
            allowClear
            options={[
              { value: 'Admin', label: 'Quản trị viên' },
              { value: 'User', label: 'Người dùng' },
              { value: 'Lecturer', label: 'Giảng viên' },
            ]}
            onChange={(val) => setFilters({ ...filters, role: val })}
          />
          <Select
            placeholder="Trạng thái"
            className="w-36 h-10"
            allowClear
            options={[
              { value: 'active', label: 'Đang hoạt động' },
              { value: 'inactive', label: 'Bị khóa' },
            ]}
            onChange={(val) => setFilters({ ...filters, status: val })}
          />
          <RangePicker
            className="h-10 bg-slate-50 border-none rounded-lg"
            placeholder={['Từ ngày', 'Đến ngày']}
            value={filters.dateRange}
            onChange={(val) => setFilters({ ...filters, dateRange: val })}
          />

          <Tooltip title="Đặt lại bộ lọc">
            <Button
              type="text"
              className="flex items-center justify-center hover:bg-slate-100 rounded-lg"
              icon={<RotateCcw size={18} className="text-slate-500" />}
              onClick={() =>
                setFilters({
                  keyword: '',
                  role: undefined,
                  status: undefined,
                  dateRange: null,
                })
              }
            />
          </Tooltip>
        </div>

        <Table
          dataSource={users}
          columns={columns}
          rowKey="id"
          loading={loading}
          locale={{
            emptyText: (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="Không tìm thấy người dùng nào"
              />
            ),
          }}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
            className: 'px-6 py-4 border-t border-slate-50',
            locale: {
              items_per_page: '/ trang',
              jump_to: 'Đi đến',
              page: 'Trang',
            },
          }}
          rowSelection={{
            selectedRowKeys,
            onChange: (keys) => setSelectedRowKeys(keys),
            columnWidth: 60,
          }}
          onChange={(pag) =>
            setPagination({
              ...pagination,
              current: pag.current,
              pageSize: pag.pageSize,
            })
          }
          className="user-table"
        />
      </Card>

      {/* MODAL CHI TIẾT */}
      <Modal
        title={
          <Space>
            <div className="p-2 bg-blue-50 rounded-lg">
              <AlertCircle size={20} className="text-blue-500" />
            </div>
            <Text strong className="text-lg">
              Chi tiết tài khoản
            </Text>
          </Space>
        }
        open={isDetailModalOpen}
        onCancel={() => setIsDetailModalOpen(false)}
        footer={[
          <Button
            key="close"
            type="primary"
            onClick={() => setIsDetailModalOpen(false)}
            className="rounded-lg h-10 px-6"
          >
            Đóng lại
          </Button>,
        ]}
        width={600}
        centered
        className="custom-modal"
      >
        {selectedUser && (
          <div className="py-4">
            <div className="flex items-center gap-4 mb-6 p-5 bg-gradient-to-r from-slate-50 to-blue-50 rounded-2xl border border-blue-100/50">
              <Avatar
                src={selectedUser.avatarUrl}
                size={70}
                className="border-2 border-white shadow-md"
              >
                {selectedUser.name?.charAt(0).toUpperCase()}
              </Avatar>
              <div>
                <Title level={4} className="!m-0 text-slate-800">
                  {selectedUser.name}
                </Title>
                <div className="flex items-center gap-2 mt-1">
                  <Mail size={14} className="text-slate-400" />
                  <Text type="secondary">{selectedUser.email}</Text>
                  <Button
                    type="text"
                    size="small"
                    icon={<Copy size={12} />}
                    onClick={() => copyToClipboard(selectedUser.email)}
                  />
                </div>
              </div>
            </div>

            <Descriptions
              bordered
              column={1}
              size="small"
              className="overflow-hidden rounded-xl border-slate-100"
              styles={{
                label: {
                  width: '200px',
                  background: '#fcfcfd',
                  fontWeight: 600,
                  color: '#64748b',
                },
              }}
            >
              <Descriptions.Item label="Mã định danh (ID)">
                <Text className="font-mono text-[11px] bg-slate-100 px-2 py-1 rounded text-slate-500">
                  {selectedUser.id}
                </Text>
              </Descriptions.Item>
              <Descriptions.Item label="Vai trò">
                <Space>
                  <Shield size={14} className="text-blue-500" />
                  {selectedUser.role === 'Admin'
                    ? 'Quản trị viên'
                    : selectedUser.role === 'Lecturer'
                      ? 'Giảng viên'
                      : 'Người dùng'}
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="Phương thức đăng nhập">
                {selectedUser.provider === 'Google' ? (
                  <Tag color="orange" className="rounded-md">
                    Tài khoản Google
                  </Tag>
                ) : (
                  <Tag color="blue" className="rounded-md">
                    Tài khoản Hệ thống
                  </Tag>
                )}
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái">
                <Badge
                  status={selectedUser.isActive ? 'success' : 'error'}
                  text={
                    <span
                      className={
                        selectedUser.isActive
                          ? 'text-emerald-600'
                          : 'text-rose-600'
                      }
                    >
                      {selectedUser.isActive
                        ? 'Đang hoạt động'
                        : 'Đang bị khóa'}
                    </span>
                  }
                />
              </Descriptions.Item>
              <Descriptions.Item label="Ngày tham gia">
                <Space>
                  <Calendar size={14} className="text-slate-400" />
                  {dayjs(selectedUser.createdAt).format('DD/MM/YYYY HH:mm')}
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="Cập nhật lần cuối">
                <div className="flex items-center gap-2">
                  <RefreshCw size={14} className="text-slate-400" />
                  {dayjs(selectedUser.updatedAt).fromNow()}
                </div>
              </Descriptions.Item>
            </Descriptions>
          </div>
        )}
      </Modal>

      {/* MODAL THÊM THÀNH VIÊN */}
      <Modal
        title={
          <Space>
            <div className="p-2 bg-blue-50 rounded-lg">
              <UserPlus size={20} className="text-blue-600" />
            </div>
            <Text strong className="text-lg">
              Tạo tài khoản mới
            </Text>
          </Space>
        }
        open={isAddModalOpen}
        onCancel={() => {
          setIsAddModalOpen(false);
          form.resetFields();
        }}
        onOk={() => form.submit()}
        confirmLoading={submitting}
        okText="Tạo tài khoản ngay"
        cancelText="Hủy bỏ"
        width={480}
        centered
        okButtonProps={{ className: 'bg-blue-600 h-10 rounded-lg px-6' }}
        cancelButtonProps={{ className: 'h-10 rounded-lg' }}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleAddUser}
          className="mt-6"
          initialValues={{ role: 'User' }}
          requiredMark={false}
        >
          <Form.Item
            name="name"
            label={
              <Text strong className="text-slate-600">
                Họ và tên
              </Text>
            }
            rules={[{ required: true, message: 'Vui lòng nhập họ và tên' }]}
          >
            <Input
              placeholder="Ví dụ: Nguyễn Văn A"
              className="h-11 rounded-xl bg-slate-50 border-slate-200"
            />
          </Form.Item>
          <Form.Item
            name="email"
            label={
              <Text strong className="text-slate-600">
                Địa chỉ Email
              </Text>
            }
            rules={[
              { required: true, message: 'Vui lòng nhập email' },
              { type: 'email', message: 'Email không đúng định dạng' },
            ]}
          >
            <Input
              placeholder="email@vi-du.com"
              className="h-11 rounded-xl bg-slate-50 border-slate-200"
            />
          </Form.Item>
          <Form.Item
            name="password"
            label={
              <Text strong className="text-slate-600">
                Mật khẩu khởi tạo
              </Text>
            }
            rules={[
              { required: true, message: 'Vui lòng nhập mật khẩu' },
              { min: 6, message: 'Mật khẩu phải từ 6 ký tự' },
            ]}
          >
            <Input.Password
              className="h-11 rounded-xl bg-slate-50 border-slate-200"
              placeholder="Nhập ít nhất 6 ký tự"
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* MODAL ĐỔI MẬT KHẨU - BỔ SUNG */}
      <Modal
        title={
          <Space>
            <Key size={20} className="text-orange-600" />
            <Text strong>Đổi mật khẩu người dùng</Text>
          </Space>
        }
        open={isPasswordModalOpen}
        onCancel={() => {
          setIsPasswordModalOpen(false);
          passwordForm.resetFields();
        }}
        onOk={() => passwordForm.submit()}
        confirmLoading={submitting}
        okText="Cập nhật"
        cancelText="Hủy bỏ"
        centered
        okButtonProps={{
          className: 'bg-orange-600 h-10 rounded-lg px-6 border-none',
        }}
        cancelButtonProps={{ className: 'h-10 rounded-lg' }}
      >
        <Form
          form={passwordForm}
          layout="vertical"
          onFinish={handleUpdatePassword}
          className="mt-4"
          requiredMark={false}
        >
          <div className="mb-4 p-3 bg-slate-50 rounded-lg border border-slate-100">
            <Text
              type="secondary"
              className="block text-xs uppercase font-bold mb-1"
            >
              Tài khoản mục tiêu:
            </Text>
            <Text strong className="text-slate-700">
              {selectedUser?.email}
            </Text>
          </div>
          <Form.Item
            name="password"
            label={
              <Text strong className="text-slate-600">
                Mật khẩu mới
              </Text>
            }
            rules={[
              { required: true, message: 'Vui lòng nhập mật khẩu' },
              { min: 6, message: 'Tối thiểu 6 ký tự' },
            ]}
          >
            <Input.Password
              placeholder="Nhập mật khẩu mới"
              className="h-11 rounded-xl bg-slate-50"
            />
          </Form.Item>
          <Form.Item
            name="confirm"
            label={
              <Text strong className="text-slate-600">
                Xác nhận mật khẩu
              </Text>
            }
            dependencies={['password']}
            rules={[
              { required: true, message: 'Vui lòng xác nhận mật khẩu' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value)
                    return Promise.resolve();
                  return Promise.reject(
                    new Error('Mật khẩu xác nhận không khớp!')
                  );
                },
              }),
            ]}
          >
            <Input.Password
              placeholder="Nhập lại mật khẩu mới"
              className="h-11 rounded-xl bg-slate-50"
            />
          </Form.Item>
        </Form>
      </Modal>

      <style>{`
          .user-table .ant-table-thead > tr > th { 
              background: #f8fafc; 
              color: #64748b; 
              font-size: 11px; 
              text-transform: uppercase; 
              font-weight: 700; 
              padding: 16px 20px; 
              border-bottom: 1px solid #f1f5f9; 
              letter-spacing: 0.025em;
          }
          .user-table .ant-table-tbody > tr > td { 
              padding: 14px 20px; 
              border-bottom: 1px solid #f1f5f9; 
          }
          .user-table .ant-table-tbody > tr:hover > td { 
              background-color: #f8fafc !important; 
          }
          .ant-table-row-selected > td {
              background-color: #f0f7ff !important;
          }
          .ant-modal-content {
              border-radius: 20px !important;
              overflow: hidden;
          }
          .ant-modal-header { 
              margin-bottom: 0;
              padding: 20px 24px !important;
              border-bottom: 1px solid #f1f5f9;
          }
          .ant-modal-body {
              padding: 24px !important;
          }
          .ant-modal-footer {
              padding: 16px 24px !important;
              border-top: 1px solid #f1f5f9;
              margin-top: 0;
          }
          .ant-select-selector {
              border-radius: 8px !important;
              background-color: #f8fafc !important;
              border: none !important;
              height: 40px !important;
              display: flex;
              align-items: center;
          }
          .ant-picker {
              border-radius: 8px !important;
              background-color: #f8fafc !important;
              border: none !important;
          }
        `}</style>
    </div>
  );
};

export default UsersPage;
