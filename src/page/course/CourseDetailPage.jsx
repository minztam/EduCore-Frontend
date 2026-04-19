import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ChevronDown,
  ChevronRight,
  PlayCircle,
  Lock,
  BookOpen,
  BarChart3,
  Clock3,
  Loader2,
  CheckCircle2,
  Video,
  FileText,
  Star,
  ShieldCheck,
} from 'lucide-react';
import Header from '../../components/HeaderComponent';
import { getCourseBySlug } from '../../api/courseApi';
import { getChaptersByCourse } from '../../api/chapterApi';
import { getLessonsByChapterId } from '../../api/lessonApi';
import { enrollCourse, checkEnrollment } from '../../api/enrollmentApi';
import CourseReviewSection from '../../components/course/CourseReviewSection';

const CourseDetailPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [expanded, setExpanded] = useState({});
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);

  // Tính tổng thời lượng (giây) từ dữ liệu bài học thực tế
  const totalDurationInSeconds = chapters.reduce((total, chapter) => {
    const chapterTotal =
      chapter.lessons?.reduce(
        (sum, lesson) => sum + (lesson.duration || 0),
        0
      ) || 0;
    return total + chapterTotal;
  }, 0);

  // Format hiển thị thời gian thân thiện
  const formatDuration = (seconds) => {
    if (!seconds) return '0 Phút';
    const minutes = Math.ceil(seconds / 60);
    if (minutes >= 60) {
      const hours = Math.floor(minutes / 60);
      const remainingMins = minutes % 60;
      return remainingMins > 0
        ? `${hours} Giờ ${remainingMins} Phút`
        : `${hours} Giờ`;
    }
    return `${minutes} Phút`;
  };

  const formatLevel = (level) => {
    const lv = level?.toLowerCase();
    if (lv === 'beginner' || lv === 'coban') return 'Cơ bản';
    if (lv === 'intermediate' || lv === 'trungcap') return 'Trung cấp';
    if (lv === 'advanced' || lv === 'nangcao') return 'Nâng cao';
    return level || 'Cơ bản';
  };

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const resCourse = await getCourseBySlug(slug);
      const courseData = resCourse?.data?.data;
      setCourse(courseData);

      if (courseData?.id) {
        const user = JSON.parse(localStorage.getItem('user') || 'null');
        if (user?.id) {
          const enrollRes = await checkEnrollment(user.id, courseData.id);
          setIsEnrolled(enrollRes?.data?.data === true);
        }

        const resChapter = await getChaptersByCourse(courseData.id);
        const chapterData = resChapter?.data?.data || [];
        const result = await Promise.all(
          chapterData.map(async (c) => {
            const resL = await getLessonsByChapterId(c.id);
            return { ...c, lessons: resL?.data?.data || [] };
          })
        );
        setChapters(result);
        if (result.length > 0) setExpanded({ [result[0].id]: true });
      }
    } catch (err) {
      console.error('Lỗi khi tải dữ liệu:', err);
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleJoin = async () => {
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    if (!user) return navigate('/login');
    if (isEnrolled) return navigate(`/learn/${course.slug}`);
    if (Number(course.price) > 0) return navigate(`/checkout/${course.id}`);

    try {
      setEnrolling(true);
      await enrollCourse(user.id, course.id);
      setIsEnrolled(true);
      navigate(`/learn/${course.slug}`);
    } catch (err) {
      alert('Có lỗi xảy ra, vui lòng thử lại!');
    } finally {
      setEnrolling(false);
    }
  };

  if (loading)
    return (
      <div className="h-screen flex items-center justify-center bg-white">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
      </div>
    );

  if (!course)
    return (
      <div className="p-10 text-center text-slate-500">
        Không tìm thấy khóa học
      </div>
    );

  return (
    <div className="bg-[#fcfcfd] min-h-screen font-sans antialiased text-slate-900 pb-20">
      <Header />
      {/* --- HERO SECTION --- */}
      <div className="bg-[#0f172a] text-white pt-16 pb-32 relative overflow-hidden mt-[90px]">
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-blue-600/10 blur-[120px] rounded-none" />

        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
          <div className="space-y-6">
            <div className="flex items-center gap-2 text-blue-400 font-bold text-xs uppercase tracking-[0.2em]">
              <Star size={14} className="fill-blue-400" />
              <span>Khóa học được đề xuất</span>
            </div>
            <h1 className="text-4xl lg:text-5xl font-black leading-[1.1] tracking-tight">
              {course.title}
            </h1>
            <p className="text-slate-400 text-lg italic leading-relaxed">
              {course.description}
            </p>
          </div>

          <div className="relative group">
            <div className="relative aspect-video overflow-hidden border border-white/10 shadow-2xl bg-black rounded-none">
              {course.previewVideoUrl ? (
                <video
                  src={course.previewVideoUrl}
                  controls
                  className="w-full h-full object-cover"
                  poster={course.thumbnailUrl}
                />
              ) : (
                <img
                  src={course.thumbnailUrl}
                  className="w-full h-full object-cover"
                  alt="thumbnail"
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* --- MAIN BODY --- */}
      <div className="mx-auto px-6 -mt-16 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-8 space-y-8">
            {/* Stats Bar */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                {
                  label: 'Chương học',
                  val: chapters.length,
                  icon: <BookOpen className="text-blue-500" />,
                },
                {
                  label: 'Bài giảng',
                  val: chapters.reduce(
                    (acc, curr) => acc + (curr.lessons?.length || 0),
                    0
                  ),
                  icon: <PlayCircle className="text-purple-500" />,
                },
                {
                  label: 'Thời lượng',
                  val: formatDuration(totalDurationInSeconds),
                  icon: <Clock3 className="text-orange-500" />,
                },
                {
                  label: 'Cấp độ',
                  val: formatLevel(course.level),
                  icon: <BarChart3 className="text-green-500" />,
                },
              ].map((s, i) => (
                <div
                  key={i}
                  className="bg-white p-5 rounded-none border border-slate-200 shadow-sm flex flex-col items-center text-center transition-colors hover:border-blue-200"
                >
                  <div className="mb-2">{s.icon}</div>
                  <span className="text-xs font-bold uppercase text-slate-400 tracking-tighter">
                    {s.label}
                  </span>
                  <span className="text-lg font-black text-slate-800">
                    {s.val}
                  </span>
                </div>
              ))}
            </div>

            {/* About Course */}
            <div className="bg-white rounded-none p-8 md:p-12 border border-slate-200 shadow-sm">
              <h2 className="text-2xl font-black mb-6 flex items-center gap-3">
                <div className="w-1.5 h-8 bg-blue-600" />
                Về khóa học này
              </h2>
              <div
                className="text-slate-600 leading-[1.8] text-lg prose prose-slate max-w-none 
                           prose-headings:font-black prose-ul:list-disc prose-li:marker:text-blue-500"
                dangerouslySetInnerHTML={{
                  __html: course.content || 'Đang cập nhật nội dung...',
                }}
              />
            </div>

            {/* Reviews Section - Bỏ bo góc */}
            <div className="rounded-none overflow-hidden">
              <CourseReviewSection courseId={course.id} />
            </div>
          </div>

          {/* --- RIGHT SIDEBAR --- */}
          <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-6">
            <div className="bg-white rounded-none p-8 border border-slate-200 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-5">
                <ShieldCheck size={80} className="text-blue-600" />
              </div>
              <div className="relative z-10 space-y-6">
                <div className="text-center">
                  <p className="text-slate-400 text-xs font-black uppercase tracking-widest mb-1">
                    Giá sở hữu trọn đời
                  </p>
                  <h3 className="text-4xl font-black text-slate-900">
                    {Number(course.price) === 0 ? (
                      <span className="text-blue-600">Miễn phí</span>
                    ) : (
                      `${Number(course.price).toLocaleString()}đ`
                    )}
                  </h3>
                </div>

                <button
                  onClick={handleJoin}
                  disabled={enrolling}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-none font-black text-lg shadow-lg shadow-blue-100 transition-all flex items-center justify-center gap-3 active:bg-blue-800 disabled:opacity-50"
                >
                  {enrolling && <Loader2 className="animate-spin" />}
                  {isEnrolled
                    ? 'Vào học ngay'
                    : Number(course.price) === 0
                      ? 'Đăng ký miễn phí'
                      : 'Mua ngay'}
                </button>

                <div className="space-y-3 pt-2">
                  {[
                    'Chứng chỉ hoàn thành',
                    'Hỗ trợ Mentor 24/7',
                    'Truy cập nội dung trọn đời',
                  ].map((text, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 text-sm font-medium text-slate-600"
                    >
                      <CheckCircle2
                        size={16}
                        className="text-green-500 shrink-0"
                      />{' '}
                      {text}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-none border border-slate-200 shadow-sm overflow-hidden flex flex-col max-h-[600px]">
              <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                <h2 className="text-xl font-black uppercase tracking-tight">
                  Lộ trình học
                </h2>
                <span className="text-xs font-bold text-slate-500 bg-white px-3 py-1 rounded-none border border-slate-200">
                  {chapters.length} Chương
                </span>
              </div>

              <div className="overflow-y-auto divide-y divide-slate-100">
                {chapters.map((chapter) => (
                  <div key={chapter.id} className="bg-white">
                    <button
                      onClick={() =>
                        setExpanded((prev) => ({
                          ...prev,
                          [chapter.id]: !prev[chapter.id],
                        }))
                      }
                      className="w-full flex items-center justify-between p-5 hover:bg-slate-50 transition-all text-left rounded-none border-l-4 border-transparent active:border-blue-600"
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={`w-8 h-8 rounded-none flex items-center justify-center text-sm font-black transition-all shrink-0 ${expanded[chapter.id] ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'}`}
                        >
                          {chapter.order}
                        </div>
                        <span className="font-bold text-slate-700 leading-tight">
                          {chapter.title}
                        </span>
                      </div>
                      {expanded[chapter.id] ? (
                        <ChevronDown size={18} className="shrink-0" />
                      ) : (
                        <ChevronRight size={18} className="shrink-0" />
                      )}
                    </button>

                    {expanded[chapter.id] && (
                      <div className="px-4 pb-4 space-y-1 bg-slate-50/20">
                        {chapter.lessons?.map((lesson) => (
                          <div
                            key={lesson.id}
                            className="flex items-center justify-between p-3 rounded-none hover:bg-white hover:border-slate-200 border border-transparent transition-all group/item cursor-pointer"
                          >
                            <div className="flex items-center gap-3 overflow-hidden">
                              <div className="p-1.5 rounded-none bg-white text-slate-400 group-hover/item:text-blue-600 border border-slate-100 shrink-0 shadow-sm">
                                {lesson.contentType === 'Video' ? (
                                  <Video size={14} />
                                ) : (
                                  <FileText size={14} />
                                )}
                              </div>
                              <span className="text-sm font-semibold text-slate-600 truncate group-hover/item:text-blue-600">
                                {lesson.title}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 shrink-0 ml-2">
                              {lesson.isFreePreview ? (
                                <span className="px-1.5 py-0.5 bg-green-100 text-green-700 text-[9px] font-black uppercase rounded-none border border-green-200">
                                  Thử
                                </span>
                              ) : (
                                <Lock size={12} className="text-slate-300" />
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetailPage;
