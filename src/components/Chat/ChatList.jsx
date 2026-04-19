import React, { useEffect, useState } from 'react';
import chatApi from '../../api/chatApi';
import { Typography, Badge, Avatar, Skeleton } from 'antd';
import { MessageCircle, User } from 'lucide-react';

const { Text } = Typography;

const ChatList = ({ onSelectRoom, activeRoomId, isAdmin }) => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const ADMIN_ID = '3f86f46a-c665-4aa1-8c95-38d909acf789';

  // Hàm format thời gian thuần JS đồng bộ với Message.jsx
  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    try {
      const utcDate = dateStr.endsWith('Z') ? dateStr : `${dateStr}Z`;
      return new Intl.DateTimeFormat('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
        timeZone: 'Asia/Ho_Chi_Minh',
      }).format(new Date(utcDate));
    } catch {
      return '';
    }
  };

  const fetchRooms = async () => {
    try {
      setLoading(true);
      const res = await chatApi.getRooms();
      if (res.data.success) setRooms(res.data.data);
    } catch (e) {
      console.error('Lỗi tải danh sách chat:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  const handleStartChat = async () => {
    try {
      const res = await chatApi.createPrivateRoom(ADMIN_ID);
      if (res.data.success) {
        await fetchRooms();
        onSelectRoom(res.data.data.roomId);
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading)
    return (
      <div className="p-5">
        <Skeleton active avatar paragraph={{ rows: 2 }} />
      </div>
    );

  return (
    <div className="p-3 space-y-1">
      {rooms.length === 0 ? (
        <div className="p-4">
          {!isAdmin && (
            <button
              onClick={handleStartChat}
              className="w-full flex flex-col items-center justify-center gap-3 bg-slate-50 border-2 border-dashed border-slate-200 text-slate-400 p-8 rounded-2xl hover:border-blue-400 hover:text-blue-500 transition-all group"
            >
              <div className="bg-white p-3 rounded-xl shadow-sm group-hover:shadow-md transition-all">
                <MessageCircle size={24} />
              </div>
              <span className="font-bold text-[11px] uppercase tracking-widest">
                Bắt đầu chat với Admin
              </span>
            </button>
          )}
        </div>
      ) : (
        rooms.map((room) => (
          <div
            key={room.roomId}
            onClick={() => onSelectRoom(room.roomId)}
            className={`flex items-center p-4 cursor-pointer rounded-xl transition-all duration-200 border ${
              activeRoomId === room.roomId
                ? 'bg-blue-50 border-blue-100 shadow-sm'
                : 'bg-white border-transparent hover:bg-slate-50'
            }`}
          >
            <div className="relative shrink-0 mr-4">
              <Avatar
                size={48}
                icon={<User size={20} />}
                className={`border-2 ${activeRoomId === room.roomId ? 'border-blue-200' : 'border-white shadow-sm'}`}
                style={{
                  backgroundColor:
                    activeRoomId === room.roomId ? '#2563eb' : '#f1f5f9',
                  color: activeRoomId === room.roomId ? 'white' : '#64748b',
                }}
              >
                {room.name?.charAt(0).toUpperCase()}
              </Avatar>
              <div className="absolute bottom-0.5 right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-center mb-0.5">
                <Text
                  strong
                  className={`text-[14px] truncate ${activeRoomId === room.roomId ? 'text-blue-700' : 'text-slate-700'}`}
                >
                  {isAdmin ? room.name || 'Học viên' : 'Quản trị viên'}
                </Text>
                {/* Sử dụng hàm formatTime đã fix */}
                <Text className="text-[10px] text-slate-400 font-bold uppercase">
                  {formatTime(room.lastMessage?.createdAt)}
                </Text>
              </div>
              <div className="flex justify-between items-center">
                <Text
                  className={`text-[12px] truncate w-full font-medium ${activeRoomId === room.roomId ? 'text-blue-400' : 'text-slate-400'}`}
                >
                  {room.lastMessage?.content || 'Chưa có tin nhắn...'}
                </Text>
                {room.unreadCount > 0 && (
                  <Badge count={room.unreadCount} className="ml-2" />
                )}
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default ChatList;
