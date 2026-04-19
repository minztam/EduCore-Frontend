import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import * as signalR from '@microsoft/signalr';
import {
  LogOut,
  Bell,
  MessageSquare,
  Search as SearchIcon,
} from 'lucide-react';
import {
  Badge,
  Dropdown,
  Avatar,
  AutoComplete,
  Input,
  notification as antdNoti,
  Spin,
} from 'antd';
import notificationApi from '../../api/notificationApi';
import chatApi from '../../api/chatApi';

const ADMIN_PAGES = [
  { value: '/admin', label: '📊 Dashboard' },
  { value: '/admin/categories', label: '📂 Quản lý Danh mục' },
  { value: '/admin/course', label: '📚 Quản lý Khóa học' },
  { value: '/admin/users', label: '👥 Quản lý Người dùng' },
  { value: '/admin/review', label: '⭐ Quản lý Đánh giá' },
  { value: '/admin/posts', label: '📝 Quản lý Bài viết' },
  { value: '/admin/home-hero', label: '🖼️ Cấu hình Home Hero' },
];

const Header = () => {
  const navigate = useNavigate();
  const [user] = useState(JSON.parse(localStorage.getItem('user')) || {});
  const [notifications, setNotifications] = useState([]);
  const [options, setOptions] = useState([]);
  const [recentChats, setRecentChats] = useState([]);
  const [isChatLoading, setIsChatLoading] = useState(false);

  // --- SEARCH LOGIC ---
  const handleSearch = (searchText) => {
    if (!searchText) {
      setOptions(ADMIN_PAGES);
      return;
    }
    const filtered = ADMIN_PAGES.filter((page) =>
      page.label.toLowerCase().includes(searchText.toLowerCase())
    );
    setOptions(filtered);
  };

  const onSelect = (value) => navigate(value);
  const handleFocus = () => setOptions(ADMIN_PAGES);

  // --- RENDER NOTIFICATION CONTENT HELPER ---
  const renderContent = (content) => {
    if (!content) return null;
    if (content.includes(':')) {
      const [action, target] = content.split(':');
      return (
        <>
          <span className="text-blue-600 font-medium italic">{action}:</span>
          <span className="text-gray-900 font-bold ml-1">{target}</span>
        </>
      );
    }
    return <span className="text-gray-600">{content}</span>;
  };

  // --- API CALLS ---
  const fetchRecentChats = useCallback(async () => {
    try {
      setIsChatLoading(true);
      const res = await chatApi.getRooms();
      if (res.data?.success) {
        setRecentChats(res.data.data.slice(0, 5));
      } else if (Array.isArray(res.data)) {
        setRecentChats(res.data.slice(0, 5));
      }
    } catch (err) {
      console.error('Lỗi lấy tin nhắn:', err);
    } finally {
      setIsChatLoading(false);
    }
  }, []);

  const fetchNotifications = useCallback(() => {
    notificationApi
      .getHeaderNotifications()
      .then((res) => {
        if (res.success) setNotifications(res.data);
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    fetchNotifications();
    fetchRecentChats();
  }, [fetchNotifications, fetchRecentChats]);

  // --- SIGNALR REALTIME ---
  useEffect(() => {
    let isMounted = true;

    const hubBaseUrl = process.env.REACT_APP_API_BASE_URL
      ? process.env.REACT_APP_API_BASE_URL.replace('/api', '')
      : 'https://educore-api-d1v2.onrender.com';

    let connection = new signalR.HubConnectionBuilder()
      // THAY ĐỔI DÒNG NÀY:
      .withUrl(`${hubBaseUrl}/notificationHub`, {
        accessTokenFactory: () => localStorage.getItem('token'),
        skipNegotiation: true,
        transport: signalR.HttpTransportType.WebSockets,
      })
      .withAutomaticReconnect()
      .build();

    const start = async () => {
      try {
        await connection.start();
        if (!isMounted) return;

        connection.on('ReceiveNotification', (noti) => {
          setNotifications((prev) => [noti, ...prev].slice(0, 5));
          antdNoti.info({
            message: 'Thông báo mới',
            description: noti.content,
            placement: 'bottomRight',
          });
        });

        connection.on('ReceiveMessage', () => {
          fetchRecentChats();
        });
      } catch (err) {
        console.error('SignalR Error:', err);
      }
    };

    start();
    return () => {
      isMounted = false;
      connection.stop().catch(() => {});
    };
  }, [fetchRecentChats]);

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

  const unreadNotiCount = notifications.filter((n) => !n.isRead).length;
  const hasUnreadChat = recentChats.some(
    (c) => c.lastMessage && !c.lastMessage.isRead
  );

  // --- VIEW: CHAT CONTENT (GIỐNG NOTIFICATION) ---
  const chatContent = (
    <div className="bg-white rounded-xl border border-gray-200 shadow-lg w-80 overflow-hidden mt-1">
      <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
        <span className="text-sm font-semibold text-gray-800">
          Tin nhắn mới
        </span>
        {recentChats.filter((c) => c.lastMessage && !c.lastMessage.isRead)
          .length > 0 && (
          <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
            {
              recentChats.filter((c) => c.lastMessage && !c.lastMessage.isRead)
                .length
            }{' '}
            mới
          </span>
        )}
      </div>
      <div className="max-h-[360px] overflow-y-auto divide-y divide-gray-50">
        {isChatLoading ? (
          <div className="py-6 text-center">
            <Spin size="small" />
          </div>
        ) : recentChats.length === 0 ? (
          <div className="py-6 text-center text-gray-400 text-xs">
            Không có tin nhắn
          </div>
        ) : (
          recentChats.map((chat) => (
            <div
              key={chat.roomId || chat.id}
              onClick={() => navigate('/admin/chat')}
              className={`flex items-start gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors ${chat.lastMessage && !chat.lastMessage.isRead ? 'bg-blue-50/30' : ''}`}
            >
              <Avatar
                src={
                  chat.participantAvatar ||
                  `https://api.dicebear.com/7.x/avataaars/svg?seed=${chat.name}`
                }
                size={36}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-0.5">
                  <span className="text-xs font-bold text-gray-900 truncate">
                    {chat.name}
                  </span>
                  {chat.lastMessage && !chat.lastMessage.isRead && (
                    <span className="w-2 h-2 rounded-full bg-green-500" />
                  )}
                </div>
                <p
                  className={`text-xs truncate ${chat.lastMessage && !chat.lastMessage.isRead ? 'text-gray-800 font-medium' : 'text-gray-500'}`}
                >
                  {chat.lastMessage?.content || 'Gửi một tin nhắn...'}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
      <div
        className="px-4 py-2.5 border-t border-gray-100 text-center cursor-pointer hover:bg-gray-50"
        onClick={() => navigate('/admin/chat')}
      >
        <span className="text-xs font-semibold text-blue-600">
          Xem tất cả tin nhắn
        </span>
      </div>
    </div>
  );

  // --- VIEW: NOTIFICATION CONTENT ---
  const notificationContent = (
    <div className="bg-white rounded-xl border border-gray-200 shadow-lg w-80 overflow-hidden mt-1">
      <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
        <span className="text-sm font-semibold text-gray-800">Thông báo</span>
        {unreadNotiCount > 0 && (
          <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
            {unreadNotiCount} chưa đọc
          </span>
        )}
      </div>
      <div className="max-h-[360px] overflow-y-auto divide-y divide-gray-50">
        {notifications.length === 0 ? (
          <div className="py-10 text-center text-sm text-gray-400">
            Không có thông báo
          </div>
        ) : (
          notifications.map((item) => (
            <div
              key={item.id}
              onClick={() => {
                handleMarkAsRead(item.id);
                if (item.redirectUrl) navigate(item.redirectUrl);
              }}
              className={`flex items-start gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50 ${!item.isRead ? 'bg-blue-50/30' : ''}`}
            >
              <Avatar
                src={
                  item.senderAvatar ||
                  `https://api.dicebear.com/7.x/avataaars/svg?seed=${item.senderName}`
                }
                size={36}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-0.5">
                  <span className="text-xs font-bold text-gray-900 truncate">
                    {item.senderName || 'Hệ thống'}
                  </span>
                  {!item.isRead && (
                    <span className="w-2 h-2 rounded-full bg-blue-500" />
                  )}
                </div>
                <p className="text-xs line-clamp-2 leading-relaxed">
                  {renderContent(item.content)}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
      <div
        className="px-4 py-2.5 border-t border-gray-100 text-center cursor-pointer hover:bg-gray-50"
        onClick={() => navigate('/admin/notifications')}
      >
        <span className="text-xs font-semibold text-blue-600">Xem tất cả</span>
      </div>
    </div>
  );

  return (
    <div className="fixed top-0 left-56 right-0 h-16 bg-white border-b border-gray-200 px-8 flex items-center justify-between z-50 shadow-sm">
      <div className="flex-1 max-w-md">
        <AutoComplete
          options={options}
          onSearch={handleSearch}
          onSelect={onSelect}
          onFocus={handleFocus}
          className="w-full"
        >
          <Input
            placeholder="Gõ để tìm hoặc chọn nhanh trang..."
            prefix={<SearchIcon size={16} className="text-gray-400" />}
            className="bg-gray-50 border-gray-200 rounded-lg h-9"
            allowClear
          />
        </AutoComplete>
      </div>

      <div className="flex items-center gap-3 ml-4">
        <Dropdown
          popupRender={() => chatContent}
          trigger={['click']}
          placement="bottomRight"
        >
          <button className="relative w-9 h-9 flex items-center justify-center rounded-lg hover:bg-gray-100 border-0 bg-transparent cursor-pointer">
            <Badge dot={hasUnreadChat} offset={[-2, 4]} color="#10b981">
              <MessageSquare size={18} className="text-gray-500" />
            </Badge>
          </button>
        </Dropdown>

        <Dropdown
          popupRender={() => notificationContent}
          trigger={['click']}
          placement="bottomRight"
        >
          <button className="relative w-9 h-9 flex items-center justify-center rounded-lg hover:bg-gray-100 border-0 bg-transparent cursor-pointer">
            <Badge count={unreadNotiCount} size="small" color="#2563eb">
              <Bell size={18} className="text-gray-500" />
            </Badge>
          </button>
        </Dropdown>

        <div className="w-px h-5 bg-gray-200" />

        <div
          className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg hover:bg-gray-100 cursor-pointer"
          onClick={() => navigate(`/admin/cai-dat/${user.id}`)}
        >
          <img
            src={
              user.avatarUrl ||
              `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`
            }
            alt="avatar"
            className="w-7 h-7 rounded-full object-cover border border-gray-200"
          />
          <div className="flex flex-col leading-none sm:flex">
            <span className="text-sm font-semibold text-gray-800">
              {user.name || 'Admin'}
            </span>
            <span className="text-[10px] text-gray-400 uppercase tracking-wide">
              {user.role || 'Administrator'}
            </span>
          </div>
        </div>

        <button
          onClick={() => {
            localStorage.clear();
            navigate('/login');
          }}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors cursor-pointer border border-gray-200 bg-white"
        >
          <LogOut size={14} />
          <span className="hidden md:inline">Thoát</span>
        </button>
      </div>
    </div>
  );
};

export default Header;
