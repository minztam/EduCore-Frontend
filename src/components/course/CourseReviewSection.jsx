import React, { useEffect, useState, useCallback } from 'react'; // 1. Thêm useCallback
import { Star, Send } from 'lucide-react';
import { Spin, Empty, ConfigProvider, Tag, notification } from 'antd';
import { createReview, getReviewsByCourse } from '../../api/reviewApi';

const CourseReviewSection = ({ courseId }) => {
  const [api, contextHolder] = notification.useNotification();
  const user = JSON.parse(localStorage.getItem('user'));

  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(5);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);

  const openNotification = (type, title, description) => {
    api.open({
      type: type,
      message: title,
      description: description,
      placement: 'topRight',
      duration: 3,
    });
  };

  // 2. Bọc hàm loadReviews trong useCallback để ổn định dependency
  const loadReviews = useCallback(async () => {
    if (!courseId) return;
    try {
      setFetching(true);
      const res = await getReviewsByCourse(courseId);
      setReviews(res.data.data || []);
    } catch (error) {
      console.error('Lỗi tải đánh giá:', error);
      setReviews([]);
    } finally {
      setFetching(false);
    }
  }, [courseId]); // loadReviews chỉ thay đổi khi courseId thay đổi

  // 3. Bây giờ có thể thêm loadReviews vào mảng dependency một cách an toàn
  useEffect(() => {
    loadReviews();
  }, [loadReviews]);

  const handleSubmit = async () => {
    if (!user) {
      openNotification(
        'warning',
        'Yêu cầu đăng nhập',
        'Vui lòng đăng nhập để thực hiện đánh giá.'
      );
      return;
    }
    if (!comment.trim()) {
      openNotification(
        'info',
        'Thiếu nội dung',
        'Vui lòng nhập cảm nhận của bạn.'
      );
      return;
    }

    try {
      setLoading(true);
      await createReview(user.id, { courseId, rating, comment });
      openNotification(
        'success',
        'Thành công',
        'Đánh giá đã được gửi và đang chờ phê duyệt.'
      );
      setComment('');
      setRating(5);
      // loadReviews(); // Bạn có thể gọi lại hàm này nếu muốn cập nhật list ngay lập tức
    } catch (error) {
      openNotification(
        'error',
        'Gửi thất bại',
        error.response?.data?.message || 'Có lỗi xảy ra.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#2563eb',
          borderRadius: 0,
        },
      }}
    >
      {contextHolder}

      <div className="bg-white rounded-none border border-slate-200 shadow-sm overflow-hidden mt-10">
        <div className="p-8 md:p-12">
          <h2 className="text-2xl font-black mb-8 flex items-center gap-3 text-slate-800">
            <div className="w-1.5 h-8 bg-yellow-400 rounded-none" />
            Đánh giá từ học viên
          </h2>

          <div className="bg-slate-50 rounded-none p-6 mb-12 border border-slate-200">
            <div className="flex justify-center gap-2 mb-6">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHover(star)}
                  onMouseLeave={() => setHover(0)}
                  className="transition-transform hover:scale-110 active:scale-95"
                >
                  <Star
                    size={32}
                    className={`transition-all duration-200 ${
                      star <= (hover || rating)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-slate-300'
                    }`}
                  />
                </button>
              ))}
            </div>

            <textarea
              rows="3"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Chia sẻ trải nghiệm học tập của bạn..."
              className="w-full bg-white border border-slate-200 rounded-none p-5 outline-none focus:border-blue-500 transition-all text-slate-700 font-medium"
            />

            <div className="flex justify-end mt-4">
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex items-center gap-2 bg-blue-600 text-white px-8 py-3.5 rounded-none font-black hover:bg-blue-700 transition-all active:bg-blue-800 disabled:opacity-50"
              >
                {loading ? (
                  <Spin size="small" />
                ) : (
                  <>
                    <Send size={16} /> Gửi đánh giá
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="min-h-[150px]">
            {fetching ? (
              <div className="py-12 flex justify-center">
                <Spin size="middle" />
              </div>
            ) : reviews.length === 0 ? (
              <div className="py-8 text-center">
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description={
                    <span className="text-slate-400 font-medium text-base">
                      Chưa có đánh giá nào
                    </span>
                  }
                />
              </div>
            ) : (
              <div className="grid gap-4">
                {reviews.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 rounded-none bg-white border border-slate-100 hover:border-blue-200 transition-all duration-300 shadow-sm"
                  >
                    <div className="flex items-start gap-4">
                      <div className="shrink-0 relative">
                        {item.avatarUrl ? (
                          <img
                            src={item.avatarUrl}
                            alt={item.studentName}
                            className="w-10 h-10 rounded-none object-cover border border-slate-200"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        <div
                          className={`w-10 h-10 rounded-none bg-slate-100 text-slate-500 flex items-center justify-center font-black text-base border border-slate-200 ${
                            item.avatarUrl ? 'hidden' : 'flex'
                          }`}
                        >
                          {item.studentName?.charAt(0).toUpperCase()}
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-black text-slate-800 text-base uppercase tracking-tight">
                            {item.studentName}
                          </h4>
                          <Tag
                            color="blue"
                            className="rounded-none font-bold px-2 py-0 text-[10px] border-blue-200"
                          >
                            Học viên
                          </Tag>
                        </div>
                        <div className="flex gap-0.5 mb-2">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              size={12}
                              className={`${i < item.rating ? 'fill-yellow-400 text-yellow-400' : 'text-slate-200'}`}
                            />
                          ))}
                        </div>
                        <div className="bg-slate-50 p-3 rounded-none border-l-2 border-blue-500">
                          <p className="text-slate-600 leading-relaxed text-sm font-medium italic">
                            "{item.comment}"
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </ConfigProvider>
  );
};

export default CourseReviewSection;
