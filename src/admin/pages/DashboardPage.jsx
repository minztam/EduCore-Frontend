import React, { useEffect, useState } from 'react';
import {
  Card,
  Col,
  Row,
  Statistic,
  Table,
  Tag,
  Spin,
  Progress,
  Button,
} from 'antd';
import {
  Users,
  BookOpen,
  DollarSign,
  Star,
  TrendingUp,
  ArrowUpRight,
  Activity,
  Wallet,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';

// Import API
import { getUserStats } from '../../api/userApi';
import { getReviewStats } from '../../api/reviewApi';
import { getCourses } from '../../api/courseApi';
import { getAllHistory } from '../../api/paymentApi';

const DashboardPage = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    userStats: {},
    reviewStats: {},
    courseCount: 0,
    recentPayments: [],
    totalRevenue: 0,
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [uRes, rRes, cRes, pRes] = await Promise.all([
          getUserStats(),
          getReviewStats(),
          getCourses(),
          getAllHistory(1, 5),
        ]);

        setData({
          userStats: uRes.data?.data || {},
          reviewStats: rRes.data?.data || {},
          courseCount: cRes.data?.data?.length || cRes.data?.length || 0,
          recentPayments: pRes.data?.data?.items || pRes.data?.items || [],
          totalRevenue:
            (pRes.data?.data?.items || pRes.data?.items || [])
              ?.filter((p) => p.status === 'Success' || p.status === 1)
              .reduce((sum, item) => sum + item.amount, 0) || 0,
        });
      } catch (error) {
        console.error('Dashboard Error:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const userPieData = [
    {
      name: 'Học viên',
      value: data.userStats.totalUser || 0,
      color: '#2563eb',
    },
    { name: 'Admin', value: data.userStats.totalAdmin || 0, color: '#0f172a' },
    {
      name: 'Khác',
      value: Math.max(
        0,
        (data.userStats.totalUsers || 0) -
          (data.userStats.totalUser || 0) -
          (data.userStats.totalAdmin || 0)
      ),
      color: '#94a3b8',
    },
  ].filter((item) => item.value > 0);

  const reviewBarData = [
    { name: 'Tổng', count: data.reviewStats.totalReviews || 0 },
    { name: 'Nổi bật', count: data.reviewStats.featuredReviews || 0 },
    { name: 'Chờ duyệt', count: data.reviewStats.pendingReviews || 0 },
  ];

  const cardClass =
    'rounded-2xl border-none shadow-sm hover:shadow-md transition-all duration-300';

  if (loading)
    return (
      <div className="h-[80vh] flex flex-col items-center justify-center gap-4 bg-[#f8fafc]">
        <Spin size="large" />
        <span className="text-slate-400 font-medium italic">
          Đang tải dữ liệu EduCore...
        </span>
      </div>
    );

  return (
    <div className="p-6 bg-[#f8fafc] min-h-screen font-sans">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 m-0 tracking-tight flex items-center gap-2">
            <Activity className="text-blue-600" size={28} /> Hệ thống EduCore
          </h1>
          <p className="text-slate-500 text-sm m-0">
            Thống kê dữ liệu quản trị thời gian thực
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            icon={<Clock size={18} />}
            className="h-10 px-5 rounded-xl font-semibold border-slate-300 flex items-center shadow-sm hover:text-blue-600 hover:border-blue-600"
          >
            Lịch sử
          </Button>
          <Button
            type="primary"
            icon={<ArrowUpRight size={18} />}
            className="h-10 px-6 rounded-xl font-bold bg-blue-600 shadow-md shadow-blue-100 flex items-center border-none hover:bg-blue-700 transition-all"
          >
            Xuất báo cáo
          </Button>
        </div>
      </div>

      <Row gutter={[20, 20]}>
        <Col xs={24} sm={12} xl={6}>
          <Card className={cardClass}>
            <div className="flex items-start justify-between">
              <Statistic
                title={
                  <span className="text-slate-400 font-bold text-[10px] uppercase tracking-widest">
                    Học viên
                  </span>
                }
                value={data.userStats.totalUsers || 0}
                styles={{ content: { fontWeight: 900, color: '#0f172a' } }}
              />
              <div className="p-3 bg-blue-50 rounded-xl text-blue-600">
                <Users size={20} />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2">
              <Tag
                color="success"
                className="rounded-lg border-none font-bold text-[10px]"
              >
                +{data.userStats.totalActive || 0} ONLINE
              </Tag>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <Card className={cardClass}>
            <div className="flex items-start justify-between">
              <Statistic
                title={
                  <span className="text-slate-400 font-bold text-[10px] uppercase tracking-widest">
                    Khóa học
                  </span>
                }
                value={data.courseCount}
                styles={{ content: { fontWeight: 900, color: '#0f172a' } }}
              />
              <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600">
                <BookOpen size={20} />
              </div>
            </div>
            <Progress
              percent={100}
              showInfo={false}
              strokeColor="#10b981"
              size="small"
              className="mt-4"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <Card className={cardClass}>
            <div className="flex items-start justify-between">
              <Statistic
                title={
                  <span className="text-slate-400 font-bold text-[10px] uppercase tracking-widest">
                    Doanh thu
                  </span>
                }
                value={data.totalRevenue}
                suffix="đ"
                styles={{ content: { fontWeight: 900, color: '#f59e0b' } }}
              />
              <div className="p-3 bg-amber-50 rounded-xl text-amber-600">
                <Wallet size={20} />
              </div>
            </div>
            <div className="mt-4 text-[11px] font-bold text-slate-400 flex items-center gap-1">
              <TrendingUp size={14} className="text-amber-500" /> Tăng trưởng
              12%
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <Card className={cardClass}>
            <div className="flex items-start justify-between">
              <Statistic
                title={
                  <span className="text-slate-400 font-bold text-[10px] uppercase tracking-widest">
                    Đánh giá
                  </span>
                }
                value={data.reviewStats.averageRating || 0}
                suffix="/5"
                styles={{ content: { fontWeight: 900, color: '#8b5cf6' } }}
              />
              <div className="p-3 bg-purple-50 rounded-xl text-purple-600">
                <Star size={20} />
              </div>
            </div>
            <div className="mt-4 text-[11px] font-bold text-slate-500">
              Dựa trên {data.reviewStats.totalReviews || 0} lượt review
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={[20, 20]} className="mt-8">
        <Col xs={24} lg={8}>
          <Card
            title={
              <span className="font-bold text-slate-700">
                Phân bổ tài khoản
              </span>
            }
            className={cardClass}
          >
            <div style={{ width: '100%', height: 300, minHeight: 300 }}>
              {userPieData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={userPieData}
                      innerRadius={70}
                      outerRadius={95}
                      paddingAngle={8}
                      dataKey="value"
                    >
                      {userPieData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={entry.color}
                          stroke="none"
                        />
                      ))}
                    </Pie>
                    <Tooltip cornerRadius={12} />
                    <Legend iconType="circle" />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-300">
                  Không có dữ liệu
                </div>
              )}
            </div>
          </Card>
        </Col>
        <Col xs={24} lg={16}>
          <Card
            title={
              <span className="font-bold text-slate-700">
                Thống kê Đánh giá
              </span>
            }
            className={cardClass}
          >
            <div style={{ width: '100%', height: 300, minHeight: 300 }}>
              {data.reviewStats.totalReviews > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={reviewBarData}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="#f1f5f9"
                    />
                    <XAxis
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#94a3b8', fontSize: 12 }}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#94a3b8', fontSize: 12 }}
                    />
                    <Tooltip cursor={{ fill: '#f8fafc' }} />
                    <Bar
                      dataKey="count"
                      fill="#2563eb"
                      radius={[6, 6, 0, 0]}
                      barSize={45}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-300">
                  Chưa có dữ liệu
                </div>
              )}
            </div>
          </Card>
        </Col>
      </Row>

      <Card
        title={
          <span className="font-bold text-slate-700 text-lg">
            Giao dịch gần nhất
          </span>
        }
        className={`${cardClass} mt-8 mb-8`}
        extra={
          <Button
            type="text"
            className="text-blue-600 font-bold hover:bg-blue-50"
          >
            Xem chi tiết
          </Button>
        }
      >
        <Table
          dataSource={data.recentPayments}
          pagination={false}
          rowKey="id"
          columns={[
            {
              title: 'Học viên',
              dataIndex: 'userName',
              key: 'userName',
              render: (text) => (
                <span className="font-bold text-slate-700">
                  {text || 'Admin'}
                </span>
              ),
            },
            {
              title: 'Mã đơn',
              dataIndex: 'orderCode',
              key: 'orderCode',
              render: (code) => (
                <code className="text-xs bg-slate-100 text-slate-500 px-2 py-1 rounded">
                  #{code?.slice(-10)}
                </code>
              ),
            },
            {
              title: 'Số tiền',
              dataIndex: 'amount',
              key: 'amount',
              render: (val) => (
                <span className="text-amber-600 font-black">
                  {val?.toLocaleString()}đ
                </span>
              ),
            },
            {
              title: 'Trạng thái',
              dataIndex: 'status',
              key: 'status',
              render: (status) => (
                <div className="flex items-center gap-1.5 font-bold text-[10px] uppercase tracking-wider">
                  {status === 'Success' || status === 1 ? (
                    <>
                      <CheckCircle2 size={14} className="text-emerald-500" />
                      <span className="text-emerald-600">Thành công</span>
                    </>
                  ) : (
                    <>
                      <Clock size={14} className="text-amber-500" />
                      <span className="text-amber-600">Đang chờ</span>
                    </>
                  )}
                </div>
              ),
            },
          ]}
        />
      </Card>
    </div>
  );
};

export default DashboardPage;
