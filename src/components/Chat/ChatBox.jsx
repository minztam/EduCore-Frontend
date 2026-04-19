import React, { useState } from 'react';
import { MessageCircle, X, Send, User } from 'lucide-react';

const ChatBox = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([
    { id: 1, text: 'Xin chào! EduCore có thể giúp gì cho bạn?', isBot: true },
  ]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    const newMsg = { id: Date.now(), text: message, isBot: false };
    setChatHistory([...chatHistory, newMsg]);
    setMessage('');

    setTimeout(() => {
      setChatHistory((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          text: 'Cảm ơn bạn. Chuyên viên sẽ phản hồi sớm nhất!',
          isBot: true,
        },
      ]);
    }, 1000);
  };

  return (
    // 1. Container chính: Cố định vị trí góc màn hình
    <div className="fixed bottom-5 right-5 z-50 font-sans flex flex-col items-end">
      {/* 2. Cửa sổ Chat */}
      {isOpen && (
        <div className="mb-4 w-[320px] h-[450px] bg-white rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-slate-100 flex flex-col overflow-hidden animate-in fade-in zoom-in duration-300 origin-bottom-right">
          {/* Header */}
          <div className="p-5 bg-slate-900 text-white flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center text-white">
              <User size={14} strokeWidth={2.5} />
            </div>
            <div>
              <h3 className="font-black text-[10px] uppercase tracking-widest">
                Hỗ trợ EduCore
              </h3>
              <p className="text-[8px] text-slate-400 font-bold uppercase tracking-tighter">
                Đang trực tuyến
              </p>
            </div>
          </div>

          {/* Nội dung tin nhắn */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-slate-50/50">
            {chatHistory.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.isBot ? 'justify-start' : 'justify-end'}`}
              >
                <div
                  className={`max-w-[85%] p-3 rounded-2xl text-[12px] font-medium leading-relaxed shadow-sm ${
                    msg.isBot
                      ? 'bg-white text-slate-700 rounded-tl-none border border-slate-100'
                      : 'bg-blue-600 text-white rounded-tr-none'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
          </div>

          {/* Input */}
          <form
            onSubmit={handleSendMessage}
            className="p-3 bg-white border-t border-slate-100 flex gap-2"
          >
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Nhập tin nhắn..."
              className="flex-1 bg-slate-50 border-none rounded-xl px-4 py-2 text-[11px] font-bold focus:ring-2 focus:ring-blue-500/10 transition-all outline-none"
            />
            <button
              type="submit"
              className="w-9 h-9 bg-slate-900 text-white rounded-lg flex items-center justify-center hover:bg-blue-600 transition-colors shadow-lg"
            >
              <Send size={12} strokeWidth={2.5} />
            </button>
          </form>
        </div>
      )}

      {/* 3. Nút bong bóng chat (Đã thu nhỏ tối đa) */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-7 h-7 rounded-xl flex items-center justify-center shadow-xl transition-all duration-300 active:scale-90 ${
          isOpen
            ? 'bg-slate-900 rotate-90'
            : 'bg-blue-600 hover:bg-blue-700 hover:shadow-blue-200/50'
        } text-white`}
      >
        {isOpen ? (
          <X size={18} strokeWidth={2.5} />
        ) : (
          <MessageCircle size={18} strokeWidth={2.5} />
        )}
      </button>
    </div>
  );
};

export default ChatBox;
