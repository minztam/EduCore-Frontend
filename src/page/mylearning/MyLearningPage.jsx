import React, { useEffect, useState } from 'react';
import { Progress, Table, Typography, message, Spin } from 'antd';
import { Receipt, BookOpen, ArrowUpRight, BarChart3 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// API & Components
import Header from '../../components/HeaderComponent';
import { getMyCourses } from '../../api/enrollmentApi';
import { getAllHistory } from '../../api/paymentApi';

const { Title, Text } = Typography;

const MyLearningPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('courses');
  const [loading, setLoading] = useState(false);
  const [enrollments, setEnrollments] = useState([]);
  const [paymentHistory, setPaymentHistory] = useState([]);

  const user = JSON.parse(localStorage.getItem('user'));
  const userId = user?.id;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [courseRes, historyRes] = await Promise.all([
          getMyCourses(userId),
          getAllHistory(1, 50),
        ]);
        setEnrollments(courseRes?.data?.data || []);
        setPaymentHistory(historyRes?.data?.data?.items || []);
      } catch (err) {
        message.error('Không thể kết nối đến máy chủ');
      } finally {
        setLoading(false);
      }
    };
    if (userId) fetchData();
  }, [userId]);

  const historyColumns = [
    {
      title: (
        <span className="text-[11px] font-bold tracking-wider text-slate-400">
          CHI TIẾT ĐƠN HÀNG
        </span>
      ),
      key: 'courseInfo',
      render: (_, record) => (
        <div className="py-2">
          <Text className="text-slate-800 font-semibold block mb-1 text-[14px] leading-tight">
            {record.courseTitle}
          </Text>
          <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded font-medium border border-slate-200 uppercase tracking-tighter">
            Mã: {record.orderCode}
          </span>
        </div>
      ),
    },
    {
      title: (
        <span className="text-[11px] font-bold tracking-wider text-slate-400">
          SỐ TIỀN
        </span>
      ),
      dataIndex: 'amount',
      key: 'amount',
      align: 'right',
      render: (amount) => (
        <Text className="font-bold text-slate-900 text-[14px]">
          {new Intl.NumberFormat('vi-VN').format(amount)}đ
        </Text>
      ),
    },
    {
      title: (
        <span className="text-[11px] font-bold tracking-wider text-slate-400">
          TRẠNG THÁI
        </span>
      ),
      dataIndex: 'status',
      key: 'status',
      align: 'center',
      render: (status) => {
        const configs = {
          Success: {
            color: 'text-emerald-600',
            label: 'Thành công',
            bg: 'bg-emerald-50',
            border: 'border-emerald-200',
          },
          Pending: {
            color: 'text-amber-600',
            label: 'Chờ xử lý',
            bg: 'bg-amber-50',
            border: 'border-amber-200',
          },
          Failed: {
            color: 'text-rose-600',
            label: 'Thất bại',
            bg: 'bg-rose-50',
            border: 'border-rose-200',
          },
        };
        const current = configs[status] || {
          color: 'text-slate-400',
          label: status,
          bg: 'bg-slate-50',
          border: 'border-slate-200',
        };
        return (
          <span
            className={`text-[11px] font-semibold px-3 py-1 rounded-full border ${current.color} ${current.bg} ${current.border}`}
          >
            {current.label}
          </span>
        );
      },
    },
    {
      title: (
        <span className="text-[11px] font-bold tracking-wider text-slate-400">
          NGÀY GIAO DỊCH
        </span>
      ),
      key: 'time',
      align: 'right',
      render: (_, record) => (
        <div className="text-[12px] font-medium text-slate-500">
          {record.paidAt
            ? new Date(record.paidAt).toLocaleDateString('vi-VN')
            : '---'}
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-white font-sans selection:bg-blue-100">
      <Header />

      <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row min-h-screen pt-16">
        {/* SIDEBAR */}
        <div className="w-full md:w-80 border-r border-slate-100 p-8 flex flex-col bg-white">
          <nav className="space-y-1.5 flex-1">
            <button
              onClick={() => setActiveTab('courses')}
              className={`w-full flex items-center justify-between px-5 py-3.5 rounded-none text-[13px] font-bold transition-all ${
                activeTab === 'courses'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-200'
                  : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <BookOpen size={18} strokeWidth={2.5} /> Khóa học của tôi
              </div>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full ${activeTab === 'courses' ? 'bg-blue-500 text-white' : 'bg-slate-100 text-slate-400'}`}
              >
                {enrollments.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('history')}
              className={`w-full flex items-center justify-between px-5 py-3.5 rounded-none text-[13px] font-bold transition-all ${
                activeTab === 'history'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-200'
                  : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <Receipt size={18} strokeWidth={2.5} /> Lịch sử giao dịch
              </div>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full ${activeTab === 'history' ? 'bg-blue-500 text-white' : 'bg-slate-100 text-slate-400'}`}
              >
                {paymentHistory.length}
              </span>
            </button>
          </nav>

          <div className="mt-10 p-6 bg-slate-50 rounded-2xl border border-slate-100">
            <div className="flex items-center gap-2 mb-3">
              <BarChart3 size={16} className="text-blue-600" />
              <Text className="text-[12px] font-bold uppercase tracking-widest text-slate-800">
                Tiến độ tổng
              </Text>
            </div>
            <Progress
              percent={
                enrollments.length > 0
                  ? Math.round(
                      (enrollments.filter((e) => e.isCompleted).length /
                        enrollments.length) *
                        100
                    )
                  : 0
              }
              strokeColor="#2563eb"
              size="small"
              showInfo={false}
            />
          </div>
        </div>

        {/* MAIN CONTENT */}
        <div className="flex-1 w-full p-6 md:p-12 lg:p-16 bg-[#F8FAFC] flex flex-col h-screen overflow-hidden">
          <div className="max-w-6xl mx-auto w-full flex flex-col h-full">
            <header className="mb-10 flex-shrink-0">
              <div className="flex items-center gap-2 text-blue-600 font-bold text-[11px] uppercase tracking-widest mb-3">
                <div className="w-8 h-[2px] bg-blue-600"></div> Học tập
              </div>
              <Title
                level={1}
                className="!m-0 !font-extrabold !text-slate-900 tracking-tight !text-4xl lg:!text-5xl"
              >
                {activeTab === 'courses'
                  ? 'Khóa học của tôi'
                  : 'Lịch sử giao dịch'}
              </Title>
              <Text className="text-slate-400 text-[14px] mt-2 block font-medium">
                Chào mừng bạn trở lại, hôm nay là{' '}
                {new Date().toLocaleDateString('vi-VN')}
              </Text>
            </header>

            {loading ? (
              <div className="py-24 text-center flex-1">
                <Spin size="large" />
              </div>
            ) : activeTab === 'courses' ? (
              <div className="flex-1 overflow-y-auto pr-4 custom-scrollbar pb-10">
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                  {enrollments.map((item) => (
                    <div
                      key={item.id}
                      className="bg-white border border-slate-100 rounded-2xl flex flex-col sm:flex-row overflow-hidden hover:shadow-2xl hover:shadow-blue-100 transition-all duration-500 group"
                    >
                      <div className="w-full sm:w-48 h-40 sm:h-auto relative overflow-hidden bg-slate-50 flex items-center justify-center p-3">
                        <img
                          src={item.course?.thumbnailUrl}
                          alt={item.course?.title}
                          className="max-w-full max-h-full object-contain rounded-lg group-hover:scale-110 transition-transform duration-700"
                        />
                      </div>

                      <div className="flex-1 p-6 flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-center mb-3">
                            <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest bg-blue-50 px-2 py-0.5 rounded">
                              {item.course?.level || 'Tất cả'}
                            </span>
                          </div>
                          <Title
                            level={4}
                            className="!text-[16px] !font-bold !text-slate-800 !mb-4 leading-snug line-clamp-2 h-12"
                          >
                            {item.course?.title}
                          </Title>
                        </div>

                        <div className="mt-2">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-[11px] font-semibold text-slate-400">
                              Hoàn thành {item.progressPercent}%
                            </span>
                          </div>
                          <Progress
                            percent={item.progressPercent}
                            showInfo={false}
                            strokeColor="#2563eb"
                            strokeWidth={5}
                            trailColor="#f1f5f9"
                          />

                          <div className="flex items-center justify-between mt-5">
                            <button
                              onClick={() =>
                                navigate(`/learn/${item.course?.slug}`)
                              }
                              className="group/btn flex items-center gap-1.5 text-[13px] font-bold text-blue-600 hover:text-blue-700 transition-colors"
                            >
                              Học tiếp{' '}
                              <ArrowUpRight
                                size={16}
                                className="group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform"
                              />
                            </button>
                            <span className="text-[10px] text-slate-300 font-medium italic">
                              {item.lastAccessedAt &&
                                `Lần cuối: ${new Date(item.lastAccessedAt).toLocaleDateString('vi-VN')}`}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-white border border-slate-100 rounded-2xl shadow-sm w-full overflow-hidden">
                <Table
                  columns={historyColumns}
                  dataSource={paymentHistory}
                  rowKey="id"
                  scroll={{ x: 800, y: 500 }}
                  pagination={{ pageSize: 8, hideOnSinglePage: true }}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Thêm CSS thủ công cho scrollbar và font nếu cần */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        .font-sans { font-family: 'Inter', system-ui, -apple-system, sans-serif !important; }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
      `,
        }}
      />
    </div>
  );
};

export default MyLearningPage;
