import React from 'react';
import { Typography, Image, Avatar } from 'antd'; // Đã thêm Avatar vào đây
import { Check } from 'lucide-react';

const { Text } = Typography;

const Message = ({ message }) => {
  // ================= UTILS =================
  const getUserIdFromToken = () => {
    const token = localStorage.getItem('token');
    if (!token) return null;
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        window
          .atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      const decoded = JSON.parse(jsonPayload);
      return decoded[
        'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'
      ];
    } catch {
      return null;
    }
  };

  const currentUserId = getUserIdFromToken();
  const isMine = String(message.sender?.id) === String(currentUserId);

  // FIX TIME: Hiển thị đúng múi giờ Việt Nam
  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    try {
      // Ép kiểu UTC bằng cách thêm 'Z' nếu thiếu
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

  return (
    <div
      className={`flex ${isMine ? 'justify-end' : 'justify-start'} mb-6 px-6 animate-in fade-in duration-500`}
    >
      <div
        className={`flex ${isMine ? 'flex-row-reverse' : 'flex-row'} items-end gap-3 max-w-[75%]`}
      >
        {/* AVATAR SECTION */}
        <div className="flex-shrink-0 mb-1">
          <Avatar
            src={message.sender?.avatarUrl}
            size={36}
            className="border border-slate-200 shadow-sm bg-slate-100 text-slate-400 font-bold"
          >
            {message.sender?.name?.charAt(0).toUpperCase()}
          </Avatar>
        </div>

        {/* CONTENT SECTION */}
        <div
          className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}
        >
          {!isMine && (
            <Text className="text-[11px] font-bold text-slate-400 mb-1.5 ml-1 uppercase tracking-widest">
              {message.sender?.name}
            </Text>
          )}

          <div
            className={`relative px-4 py-3 shadow-sm border transition-all ${
              isMine
                ? 'bg-blue-600 border-blue-500 text-white rounded-[18px] rounded-br-none shadow-blue-100'
                : 'bg-white border-slate-200 text-slate-700 rounded-[18px] rounded-bl-none'
            }`}
          >
            {message.messageType === 'Image' ? (
              <div className="rounded-lg overflow-hidden mt-1 border border-black/5 shadow-inner">
                <Image
                  src={message.content}
                  className="max-w-full h-auto cursor-zoom-in hover:opacity-90 transition-opacity"
                  alt="attachment"
                />
              </div>
            ) : (
              <Text
                className={`text-[14px] leading-relaxed ${isMine ? 'text-white' : 'text-slate-700'}`}
              >
                {message.content}
              </Text>
            )}

            {/* METADATA (Time & Status) */}
            <div
              className={`flex items-center gap-1.5 mt-2 ${isMine ? 'justify-end' : 'justify-start'}`}
            >
              <Text
                className={`text-[9px] font-bold uppercase tracking-tight ${isMine ? 'text-blue-100' : 'text-slate-400'}`}
              >
                {formatTime(message.createdAt)}
              </Text>

              {isMine && (
                <Check size={10} className="text-blue-200" strokeWidth={3} />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Message;
