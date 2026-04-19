import React, { useEffect, useRef, useState } from 'react';
import useChat from '../../hooks/useChat';
import chatApi from '../../api/chatApi';
import Message from './Message';
import ChatInput from './ChatInput';
import { Typography } from 'antd';

const { Text } = Typography;

const ChatWindow = ({ roomId }) => {
  const token = localStorage.getItem('token');
  const { messages, setMessages, connection } = useChat(roomId, token);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef();

  useEffect(() => {
    let isMounted = true;
    const fetchMessages = async () => {
      if (!roomId) return;
      setLoading(true);
      try {
        const res = await chatApi.getMessages(roomId);
        if (isMounted && res.data.success) setMessages(res.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchMessages();
    return () => {
      isMounted = false;
    };
  }, [roomId, setMessages]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  return (
    <div className="flex flex-col h-full bg-white relative overflow-hidden">
      {/* HEADER CỐ ĐỊNH */}
      <header className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white/95 backdrop-blur-md z-20 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-blue-400 rounded-2xl flex items-center justify-center text-white font-black text-sm shadow-lg shadow-blue-100">
            {String(roomId).slice(-1)}
          </div>
          <div>
            <h3 className="font-black text-slate-800 text-[15px] leading-tight">
              Hỗ trợ học viên
            </h3>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              <Text className="text-[10px] text-slate-400 font-black uppercase tracking-widest">
                Trực tuyến
              </Text>
            </div>
          </div>
        </div>
      </header>

      {/* VÙNG TIN NHẮN TỰ CUỘN */}
      <div className="flex-1 overflow-y-auto p-6 space-y-2 custom-scrollbar bg-[#fcfcfd]">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 opacity-40">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <Text className="text-[10px] font-black text-slate-500 uppercase tracking-tighter">
              Đang đồng bộ tin nhắn...
            </Text>
          </div>
        ) : (
          <>
            <div className="text-center mb-8">
              <span className="text-[10px] bg-slate-100 text-slate-400 px-3 py-1 rounded-full font-bold uppercase">
                Bắt đầu hội thoại
              </span>
            </div>
            {messages.map((msg, index) => (
              <Message key={msg.id || index} message={msg} />
            ))}
          </>
        )}
        <div ref={scrollRef} className="h-2" />
      </div>

      {/* INPUT CỐ ĐỊNH */}
      <footer className="p-4 bg-white border-t border-slate-100 shadow-[0_-10px_40px_rgba(0,0,0,0.03)] shrink-0">
        <ChatInput roomId={roomId} connection={connection} />
      </footer>
    </div>
  );
};

export default ChatWindow;
