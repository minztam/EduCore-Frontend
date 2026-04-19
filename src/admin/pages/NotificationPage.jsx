import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Avatar,
  Button,
  Tabs,
  message,
  Badge,
  ConfigProvider,
  Modal,
  Switch,
  Empty,
  Spin,
} from 'antd';
import {
  Bell,
  CheckCheck,
  Trash2,
  Clock,
  ChevronRight,
  Inbox,
  Info,
  BookOpen,
  CreditCard,
  Star,
  Settings,
  Check,
} from 'lucide-react';
import notificationApi from '../../api/notificationApi';

const NotificationPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [activeTab, setActiveTab] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [isSettingModalOpen, setIsSettingModalOpen] = useState(false);

  // --- Cấu hình màu sắc đồng bộ với Header ---
  const getCategoryConfig = (type) => {
    const configs = {
      system: {
        color: '#3b82f6',
        bg: '#eff6ff',
        icon: <Info size={14} />,
        label: 'Hệ thống',
      },
      course: {
        color: '#10b981',
        bg: '#ecfdf5',
        icon: <BookOpen size={14} />,
        label: 'Khóa học',
      },
      payment: {
        color: '#f59e0b',
        bg: '#fffbeb',
        icon: <CreditCard size={14} />,
        label: 'Thanh toán',
      },
      review: {
        color: '#8b5cf6',
        bg: '#f5f3ff',
        icon: <Star size={14} />,
        label: 'Đánh giá',
      },
    };
    return configs[type] || configs.system;
  };

  const timeAgo = (date) => {
    if (!date) return '';
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    if (seconds < 60) return 'Vừa xong';
    let interval = seconds / 3600;
    if (interval < 24) return Math.floor(interval) + ' giờ trước';
    return new Date(date).toLocaleDateString('vi-VN');
  };

  const renderContent = (content, isRead) => {
    if (!content) return null;
    const parts = content.split(':');
    if (parts.length > 1) {
      return (
        <div className="text-xs leading-relaxed">
          <span
            className={`${isRead ? 'text-gray-400' : 'text-blue-600 font-medium italic'}`}
          >
            {parts[0]}:
          </span>
          <span
            className={`${isRead ? 'text-gray-500' : 'text-gray-900 font-bold'} ml-1`}
          >
            {parts.slice(1).join(':')}
          </span>
        </div>
      );
    }
    return (
      <p
        className={`text-xs m-0 leading-relaxed ${isRead ? 'text-gray-400' : 'text-gray-600'}`}
      >
        {content}
      </p>
    );
  };

  // --- API Handlers ---
  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await notificationApi.getNotificationsForPage(1, 50);
      if (res.success) setNotifications(res.data.items || []);
    } catch (error) {
      message.error('Không thể tải thông báo');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      await notificationApi.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteAll = () => {
    Modal.confirm({
      title: 'Dọn sạch thông báo?',
      content: 'Tất cả thông báo sẽ bị xóa vĩnh viễn.',
      okText: 'Xác nhận',
      cancelText: 'Hủy',
      okButtonProps: { danger: true, className: 'rounded-lg' },
      cancelButtonProps: { className: 'rounded-lg' },
      onOk: () => {
        setNotifications([]);
        message.success('Đã dọn sạch');
      },
    });
  };

  // --- Logic Lọc ---
  const filteredNoti = useMemo(() => {
    const list = Array.isArray(notifications) ? notifications : [];
    return list.filter((n) => {
      const matchTab = activeTab === 'unread' ? !n.isRead : true;
      const matchType = filterType === 'all' ? true : n.type === filterType;
      return matchTab && matchType;
    });
  }, [notifications, activeTab, filterType]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const filterOptions = [
    { key: 'all', label: 'Tất cả' },
    { key: 'system', label: 'Hệ thống' },
    { key: 'course', label: 'Khóa học' },
    { key: 'payment', label: 'Thanh toán' },
    { key: 'review', label: 'Đánh giá' },
  ];

  // --- Render Item (Đồng bộ style với Dropdown Header) ---
  const renderNotiItem = (item) => {
    const config = getCategoryConfig(item.type);
    return (
      <div
        key={item.id}
        onClick={() => {
          handleMarkAsRead(item.id);
          if (item.redirectUrl) navigate(item.redirectUrl);
        }}
        className={`group flex items-start gap-4 px-6 py-4 transition-all cursor-pointer border-b border-gray-50
          ${!item.isRead ? 'bg-blue-50/20' : 'bg-white hover:bg-gray-50'}`}
      >
        <div className="relative shrink-0">
          <Avatar
            src={
              item.senderAvatar ||
              `https://api.dicebear.com/7.x/avataaars/svg?seed=${item.senderName}`
            }
            size={44}
            className="border border-gray-100 shadow-sm"
          />
          {!item.isRead && (
            <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-blue-500 rounded-full border-2 border-white shadow-sm" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-center mb-1">
            <div className="flex items-center gap-2">
              <span
                className={`text-sm ${!item.isRead ? 'font-bold text-gray-900' : 'font-semibold text-gray-600'}`}
              >
                {item.senderName || 'Hệ thống'}
              </span>
              <span
                className="text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider"
                style={{ backgroundColor: config.bg, color: config.color }}
              >
                {config.label}
              </span>
            </div>
            <span className="text-[10px] text-gray-400 font-medium flex items-center gap-1">
              {timeAgo(item.createdAt)}
            </span>
          </div>
          <div className="pr-10">
            {renderContent(item.content, item.isRead)}
          </div>
        </div>

        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            type="text"
            size="small"
            icon={
              <Trash2 size={16} className="text-gray-400 hover:text-red-500" />
            }
            onClick={(e) => {
              e.stopPropagation();
              setNotifications((prev) => prev.filter((n) => n.id !== item.id));
            }}
          />
          <ChevronRight size={16} className="text-gray-300" />
        </div>
      </div>
    );
  };

  return (
    <ConfigProvider
      theme={{ token: { borderRadius: 12, colorPrimary: '#2563eb' } }}
    >
      <div className="min-h-screen bg-gray-50/50 py-8 px-4">
        <div className="max-w-3xl mx-auto">
          {/* Header Section */}
          <div className="flex items-end justify-between mb-6 px-2">
            <div>
              <h1 className="text-xl font-bold text-gray-800 m-0">Thông báo</h1>
              <p className="text-xs text-gray-500 m-0 mt-1">
                Bạn đang có{' '}
                <span className="text-blue-600 font-bold">{unreadCount}</span>{' '}
                thông báo chưa đọc
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                type="text"
                icon={<CheckCheck size={16} />}
                className="text-xs font-medium text-gray-600 hover:text-blue-600"
                onClick={() => {
                  setNotifications((prev) =>
                    prev.map((n) => ({ ...n, isRead: true }))
                  );
                  message.success('Đã đánh dấu đọc tất cả');
                }}
              >
                Đọc tất cả
              </Button>
              <Button
                type="text"
                danger
                icon={<Trash2 size={16} />}
                className="text-xs font-medium"
                onClick={handleDeleteAll}
              >
                Xóa sạch
              </Button>
            </div>
          </div>

          {/* Main Content Card */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 border-b border-gray-100 flex items-center justify-between bg-white">
              <Tabs
                activeKey={activeTab}
                onChange={setActiveTab}
                className="custom-tabs"
                items={[
                  {
                    key: 'all',
                    label: (
                      <span className="text-xs font-bold px-2">Tất cả</span>
                    ),
                  },
                  {
                    key: 'unread',
                    label: (
                      <span className="text-xs font-bold px-2">Chưa đọc</span>
                    ),
                  },
                ]}
              />
              <Button
                type="text"
                size="small"
                icon={<Settings size={16} className="text-gray-400" />}
                onClick={() => setIsSettingModalOpen(true)}
              />
            </div>

            {/* Filter Pills */}
            <div className="px-6 py-3 flex gap-2 overflow-x-auto no-scrollbar bg-gray-50/30 border-b border-gray-100">
              {filterOptions.map((opt) => (
                <button
                  key={opt.key}
                  onClick={() => setFilterType(opt.key)}
                  className={`px-3 py-1 rounded-full text-[11px] font-bold whitespace-nowrap transition-all
                    ${
                      filterType === opt.key
                        ? 'bg-gray-800 text-white shadow-sm'
                        : 'bg-white text-gray-500 border border-gray-200 hover:border-gray-300'
                    }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {/* List */}
            <div className="min-h-[400px]">
              {loading ? (
                <div className="py-20 text-center">
                  <Spin />
                </div>
              ) : filteredNoti.length === 0 ? (
                <div className="py-24 flex flex-col items-center opacity-40">
                  <Inbox size={48} strokeWidth={1} />
                  <p className="text-xs font-medium mt-2">
                    Không có thông báo nào
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {filteredNoti.map(renderNotiItem)}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Settings Modal */}
      <Modal
        title={<span className="text-sm font-bold">Cài đặt thông báo</span>}
        open={isSettingModalOpen}
        onCancel={() => setIsSettingModalOpen(false)}
        footer={null}
        width={400}
        centered
      >
        <div className="space-y-4 py-2">
          <div className="flex justify-between items-center p-3 rounded-lg bg-gray-50">
            <div>
              <div className="text-xs font-bold text-gray-800">
                Thông báo trình duyệt
              </div>
              <div className="text-[10px] text-gray-500">
                Hiển thị thông báo khi có tin mới
              </div>
            </div>
            <Switch size="small" defaultChecked />
          </div>
          <div className="flex justify-between items-center p-3 rounded-lg bg-gray-50">
            <div>
              <div className="text-xs font-bold text-gray-800">Âm thanh</div>
              <div className="text-[10px] text-gray-500">
                Phát âm thanh khi có thông báo
              </div>
            </div>
            <Switch size="small" />
          </div>
        </div>
      </Modal>

      <style>{`
        .custom-tabs .ant-tabs-nav { margin: 0 !important; }
        .custom-tabs .ant-tabs-nav::before { border: none !important; }
        .custom-tabs .ant-tabs-tab { padding: 14px 0 !important; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </ConfigProvider>
  );
};

export default NotificationPage;
