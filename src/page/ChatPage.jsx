import React, { useState } from 'react';
import ChatList from '../components/Chat/ChatList';
import ChatWindow from '../components/Chat/ChatWindow';
import { MessageSquare, RefreshCw, Plus, Send } from 'lucide-react';
import { Typography, Card, Button, Space } from 'antd';

const { Title, Text } = Typography;

const ChatPage = ({ isAdmin = false }) => {
  const [selectedRoomId, setSelectedRoomId] = useState(null);

  return (
    <div
      className={`p-8 min-h-screen bg-[#f8fafc] ${!isAdmin ? 'pt-[100px]' : ''}`}
    >
      <div className="max-w-[1400px] mx-auto">
        {/* HEADER SECTION - Đồng bộ style Post Management */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <Title level={2} className="!m-0 text-slate-800 font-bold">
              {isAdmin ? 'Quản trị Hội thoại' : 'Hỗ trợ khách hàng'}
            </Title>
            <Text type="secondary">
              {isAdmin
                ? 'Quản lý và phản hồi tin nhắn từ học viên'
                : 'Trao đổi trực tiếp với đội ngũ hỗ trợ EduCore'}
            </Text>
          </div>
          <Space size="middle">
            <Button
              icon={<RefreshCw size={16} />}
              className="h-10 px-4 rounded-lg font-medium flex items-center gap-2 border-slate-200 text-slate-600"
              onClick={() => window.location.reload()}
            >
              Làm mới
            </Button>
            {!isAdmin && !selectedRoomId && (
              <Button
                type="primary"
                icon={<Plus size={18} />}
                className="bg-blue-600 h-10 px-6 rounded-lg font-bold shadow-md shadow-blue-100 border-none flex items-center gap-2"
              >
                Tạo hội thoại mới
              </Button>
            )}
          </Space>
        </div>

        {/* MAIN CHAT CONTAINER - Thừa hưởng bo góc và shadow từ Post Management */}
        <Card
          variant="borderless"
          className="shadow-sm rounded-2xl overflow-hidden bg-white border border-slate-200"
          bodyStyle={{
            padding: 0,
            height: 'calc(100vh - 250px)',
            minHeight: '600px',
          }}
        >
          <div className="flex h-full">
            {/* SIDEBAR */}
            <aside className="w-[350px] border-r border-slate-100 flex flex-col bg-white shrink-0">
              <div className="p-5 border-b border-slate-50 bg-[#fcfcfd]">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-600 p-2 rounded-xl text-white shadow-lg shadow-blue-100">
                    <MessageSquare size={18} fill="currentColor" />
                  </div>
                  <Text
                    strong
                    className="text-slate-700 uppercase tracking-[0.15em] text-[11px]"
                  >
                    Hộp thư đến
                  </Text>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar">
                <ChatList
                  onSelectRoom={setSelectedRoomId}
                  activeRoomId={selectedRoomId}
                  isAdmin={isAdmin}
                />
              </div>
            </aside>

            {/* MESSAGE AREA */}
            <main className="flex-1 bg-white relative flex flex-col min-w-0 h-full">
              {selectedRoomId ? (
                <ChatWindow roomId={selectedRoomId} />
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center p-12 text-center bg-[#fcfcfd]">
                  <div className="w-20 h-20 bg-white shadow-xl rounded-[28px] flex items-center justify-center mb-6 border border-slate-50">
                    <Send
                      size={32}
                      className="text-blue-500 opacity-20 -rotate-12"
                    />
                  </div>
                  <Title
                    level={4}
                    className="!text-slate-400 font-bold uppercase tracking-[0.2em] !text-[12px] mb-2"
                  >
                    {isAdmin
                      ? 'Chưa có hội thoại nào được chọn'
                      : 'Bắt đầu trao đổi'}
                  </Title>
                  <Text className="text-slate-400 text-xs font-medium max-w-[300px] leading-relaxed">
                    {isAdmin
                      ? 'Vui lòng chọn một học viên từ danh sách bên trái để xem nội dung tin nhắn.'
                      : 'Nhấn vào quản trị viên ở danh sách bên trái để bắt đầu nhận hỗ trợ từ EduCore.'}
                  </Text>
                </div>
              )}
            </main>
          </div>
        </Card>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
      `}</style>
    </div>
  );
};

export default ChatPage;
