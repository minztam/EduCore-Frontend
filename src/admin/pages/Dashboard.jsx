import React, { useEffect, useState, useMemo, useCallback } from 'react';
import {
  Table,
  Tag,
  Card,
  Typography,
  Space,
  Button,
  Input,
  Select,
  DatePicker,
  Statistic,
  Row,
  Col,
  message,
  Modal,
  Descriptions,
  Tooltip,
} from 'antd';
import {
  Search,
  RefreshCw,
  CheckCircle2,
  Clock,
  XCircle,
  Wallet,
  Eye,
  FileSpreadsheet,
  Check,
  AlertCircle,
  User,
  BookOpen,
  X,
} from 'lucide-react';
import {
  getAllHistory,
  approvePayment,
  rejectPayment,
} from '../../api/paymentApi';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

const Dashboard = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({ items: [], totalRecords: 0 });
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });
  const [searchKey, setSearchKey] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);

  // Phẳng hóa dependency để tránh lỗi useEffect
  const { current, pageSize } = pagination;

  // --- API CALLS ---

  const fetchAllHistory = useCallback(async (page, size) => {
    setLoading(true);
    try {
      const res = await getAllHistory(page, size);
      const responseData = res?.data || res;
      if (responseData?.success) {
        setData(responseData.data);
      }
    } catch (error) {
      console.error('Fetch Error:', error);
      message.error('Lỗi khi tải dữ liệu từ server!');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllHistory(current, pageSize);
  }, [current, pageSize, fetchAllHistory]);

  // --- LOGIC XỬ LÝ DUYỆT / HỦY ---

  const handleApprove = (record) => {
    Modal.confirm({
      title: 'Xác nhận thanh toán',
      icon: <CheckCircle2 size={22} className="text-emerald-500" />,
      content: `Ghi nhận đơn hàng ${record.orderCode} đã thanh toán thành công?`,
      okText: 'Xác nhận',
      okButtonProps: { className: 'bg-emerald-600' },
      onOk: async () => {
        try {
          const res = await approvePayment(record.id);
          const result = res?.data || res;
          if (result.success) {
            message.success(`Đã phê duyệt đơn hàng ${record.orderCode}`);
            fetchAllHistory(current, pageSize);
          } else {
            message.error(result.message || 'Phê duyệt thất bại');
          }
        } catch (error) {
          message.error('Lỗi kết nối server!');
        }
      },
    });
  };

  const handleReject = (record) => {
    Modal.confirm({
      title: 'Hủy giao dịch này?',
      icon: <XCircle size={22} className="text-red-500" />,
      content: `Hủy đơn hàng ${record.orderCode}? Hành động này không thể hoàn tác.`,
      okText: 'Hủy đơn',
      okType: 'danger',
      onOk: async () => {
        try {
          const res = await rejectPayment(record.id);
          const result = res?.data || res;
          if (result.success) {
            message.success(`Đã hủy giao dịch ${record.orderCode}`);
            fetchAllHistory(current, pageSize);
          } else {
            message.error(result.message || 'Hủy thất bại');
          }
        } catch (error) {
          message.error('Lỗi kết nối server!');
        }
      },
    });
  };

  // --- UI LOGIC ---

  const showDetails = (record) => {
    setSelectedTransaction(record);
    setIsModalOpen(true);
  };

  const filteredData = useMemo(() => {
    let items = data?.items || [];
    if (filterStatus !== 'All') {
      items = items.filter((item) => item.status === filterStatus);
    }
    if (searchKey) {
      const key = searchKey.toLowerCase();
      items = items.filter(
        (item) =>
          item.orderCode?.toLowerCase().includes(key) ||
          item.studentName?.toLowerCase().includes(key)
      );
    }
    return items;
  }, [data.items, filterStatus, searchKey]);

  const stats = useMemo(() => {
    const items = data?.items || [];
    return {
      revenue: items
        .filter((i) => i.status === 'Success')
        .reduce((s, i) => s + (i.amount || 0), 0),
      countSuccess: items.filter((i) => i.status === 'Success').length,
      countPending: items.filter((i) => i.status === 'Pending').length,
    };
  }, [data.items]);

  const columns = [
    {
      title: 'Giao dịch',
      key: 'transaction',
      width: 180,
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <Text strong className="text-blue-600 font-mono">
            {record.orderCode}
          </Text>
          <Text type="secondary" style={{ fontSize: '11px' }}>
            {record.createdAt
              ? new Date(record.createdAt).toLocaleString('vi-VN')
              : '---'}
          </Text>
        </Space>
      ),
    },
    {
      title: 'Học viên',
      dataIndex: 'studentName',
      render: (name, record) => (
        <div className="max-w-[200px]">
          <div className="font-medium text-slate-700 truncate">
            {name || 'N/A'}
          </div>
          <div className="text-xs text-slate-400 truncate">
            {record.courseTitle}
          </div>
        </div>
      ),
    },
    {
      title: 'Số tiền',
      dataIndex: 'amount',
      align: 'right',
      render: (val) => (
        <Text className="text-emerald-600 font-bold">
          {val?.toLocaleString('vi-VN')}₫
        </Text>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      align: 'center',
      render: (status) => {
        const config = {
          Success: {
            color: 'green',
            text: 'Thành công',
            icon: <CheckCircle2 size={12} />,
          },
          Pending: {
            color: 'orange',
            text: 'Chờ xử lý',
            icon: <Clock size={12} />,
          },
          Failed: { color: 'red', text: 'Đã hủy', icon: <XCircle size={12} /> },
        };
        const s = config[status] || config.Pending;
        return (
          <Tag
            color={s.color}
            className="rounded-full px-3 flex items-center gap-1 border-none font-semibold"
          >
            {s.icon} <span className="uppercase text-[10px]">{s.text}</span>
          </Tag>
        );
      },
    },
    {
      title: 'Thao tác',
      key: 'action',
      align: 'center',
      render: (_, record) => (
        <Space>
          <Tooltip title="Xem chi tiết">
            <Button
              type="text"
              size="small"
              icon={<Eye size={16} className="text-slate-400" />}
              onClick={() => showDetails(record)}
            />
          </Tooltip>
          {record.status === 'Pending' && (
            <>
              <Button
                type="text"
                size="small"
                className="text-emerald-600"
                icon={<Check size={16} />}
                onClick={() => handleApprove(record)}
              />
              <Button
                type="text"
                size="small"
                className="text-red-400"
                icon={<X size={16} />}
                onClick={() => handleReject(record)}
              />
            </>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div className="p-8 bg-[#f8fafc] min-h-screen">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-8">
        <Title level={2} className="!m-0 text-slate-800 font-bold">
          Trung tâm Tài chính
        </Title>
        <Space size="middle">
          <Button
            icon={<FileSpreadsheet size={16} />}
            className="rounded-lg h-10"
          >
            Xuất Excel
          </Button>
          <Button
            type="primary"
            className="bg-blue-600 h-10 px-6 rounded-lg flex items-center gap-2"
            icon={
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            }
            onClick={() => fetchAllHistory(1, pageSize)}
          >
            Làm mới
          </Button>
        </Space>
      </div>

      {/* Stats Cards */}
      <Row gutter={[24, 24]} className="mb-8">
        {[
          {
            title: 'Doanh thu thuần',
            value: stats.revenue,
            color: 'border-emerald-500',
            icon: <Wallet className="text-emerald-500" />,
            suffix: '₫',
          },
          {
            title: 'Đơn thành công',
            value: stats.countSuccess,
            color: 'border-blue-500',
            icon: <CheckCircle2 className="text-blue-500" />,
          },
          {
            title: 'Đơn đang chờ',
            value: stats.countPending,
            color: 'border-orange-500',
            icon: <Clock className="text-orange-500" />,
          },
        ].map((item, idx) => (
          <Col xs={24} md={8} key={idx}>
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
                suffix={item.suffix}
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

      {/* Table Section */}
      <Card
        variant="borderless"
        className="shadow-sm rounded-xl overflow-hidden"
      >
        <div className="mb-6 flex flex-wrap gap-4 justify-between items-center">
          <Space size="middle">
            <Input
              placeholder="Tìm mã đơn, tên..."
              prefix={<Search size={16} className="text-slate-400" />}
              className="w-72 h-10 rounded-lg"
              onChange={(e) => setSearchKey(e.target.value)}
            />
            <Select
              value={filterStatus}
              className="w-40 h-10"
              onChange={setFilterStatus}
              options={[
                { value: 'All', label: 'Tất cả trạng thái' },
                { value: 'Success', label: 'Thành công' },
                { value: 'Pending', label: 'Chờ xử lý' },
                { value: 'Failed', label: 'Đã hủy' },
              ]}
            />
          </Space>
          <RangePicker className="h-10 rounded-lg" />
        </div>

        <Table
          columns={columns}
          dataSource={filteredData}
          loading={loading}
          rowKey="id"
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: data.totalRecords,
            showSizeChanger: true,
          }}
          onChange={(pag) =>
            setPagination({ current: pag.current, pageSize: pag.pageSize })
          }
        />
      </Card>

      {/* Detail Modal */}
      <Modal
        title={
          <Space>
            <AlertCircle size={20} className="text-blue-500" />
            <Text strong>Chi tiết giao dịch</Text>
          </Space>
        }
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        width={650}
        footer={[
          <Button key="close" onClick={() => setIsModalOpen(false)}>
            Đóng
          </Button>,
          selectedTransaction?.status === 'Pending' && (
            <React.Fragment key="actions">
              <Button
                danger
                onClick={() => {
                  setIsModalOpen(false);
                  handleReject(selectedTransaction);
                }}
              >
                Hủy giao dịch
              </Button>
              <Button
                type="primary"
                className="bg-emerald-600"
                onClick={() => {
                  setIsModalOpen(false);
                  handleApprove(selectedTransaction);
                }}
              >
                Xác nhận thanh toán
              </Button>
            </React.Fragment>
          ),
        ]}
      >
        {selectedTransaction && (
          <div className="py-4">
            <Descriptions
              bordered
              column={1}
              size="small"
              labelStyle={{ width: '160px', background: '#f8fafc' }}
            >
              <Descriptions.Item label="Mã đơn hàng">
                <Text strong className="text-blue-600 font-mono">
                  {selectedTransaction.orderCode}
                </Text>
              </Descriptions.Item>
              <Descriptions.Item label="Học viên">
                <Space>
                  <User size={14} className="text-slate-400" />
                  {selectedTransaction.studentName}
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="Nội dung">
                <Space>
                  <BookOpen size={14} className="text-slate-400" />
                  {selectedTransaction.courseTitle}
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="Số tiền">
                <Text className="text-emerald-600 font-bold">
                  {selectedTransaction.amount?.toLocaleString()}₫
                </Text>
              </Descriptions.Item>
            </Descriptions>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Dashboard;
