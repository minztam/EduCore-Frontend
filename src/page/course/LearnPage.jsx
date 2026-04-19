import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  PlayCircle,
  CheckCircle2,
  Lock,
  ChevronLeft,
  Menu,
  Info,
  MonitorPlay,
  Clock,
} from 'lucide-react';

import { getCourseBySlug } from '../../api/courseApi';
import { getChaptersByCourse } from '../../api/chapterApi';
import { getLessonsByChapterId } from '../../api/lessonApi';
import { updateLearningProgress, getMyCourses } from '../../api/enrollmentApi';

const LearnPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Memoize user để tránh phụ thuộc không ổn định trong useCallback
  const currentUser = useMemo(
    () => JSON.parse(localStorage.getItem('user') || 'null'),
    []
  );

  const formatDuration = (seconds) => {
    if (!seconds) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const totalLessons = useMemo(
    () => chapters.reduce((sum, ch) => sum + (ch.lessons?.length || 0), 0),
    [chapters]
  );

  const allLessons = useMemo(
    () => chapters.flatMap((chapter) => chapter.lessons || []),
    [chapters]
  );

  const completedCount = useMemo(
    () => Math.round((progress / 100) * totalLessons),
    [progress, totalLessons]
  );

  // Sửa lỗi ESLint: Dùng useCallback để hàm không bị khởi tạo lại gây loop
  const loadData = useCallback(async () => {
    if (!slug) return;
    try {
      setLoading(true);
      const resCourse = await getCourseBySlug(slug);
      const courseData = resCourse?.data?.data;
      setCourse(courseData);

      if (currentUser?.id) {
        const enrollRes = await getMyCourses(currentUser.id);
        const currentEnrollment = (enrollRes?.data?.data || []).find(
          (x) => x.course?.id === courseData.id
        );
        if (currentEnrollment)
          setProgress(currentEnrollment.progressPercent || 0);
      }

      const resChapter = await getChaptersByCourse(courseData.id);
      const chapterData = resChapter?.data?.data || [];
      const result = await Promise.all(
        chapterData.map(async (ch) => {
          const resLesson = await getLessonsByChapterId(ch.id);
          return { ...ch, lessons: resLesson?.data?.data || [] };
        })
      );
      setChapters(result);

      const saved = localStorage.getItem(`lastLesson_${slug}`);
      const firstLesson = result?.[0]?.lessons?.[0];
      setSelectedLesson(saved ? JSON.parse(saved) : firstLesson);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [slug, currentUser?.id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const getNextLesson = (currentId) => {
    const idx = allLessons.findIndex((l) => l.id === currentId);
    return allLessons[idx + 1] || null;
  };

  const handleSelectLesson = (lesson) => {
    setSelectedLesson(lesson);
    localStorage.setItem(`lastLesson_${slug}`, JSON.stringify(lesson));
  };

  const handleVideoEnded = async () => {
    if (!currentUser?.id || !course?.id || !selectedLesson?.id) return;
    try {
      const res = await updateLearningProgress(
        currentUser.id,
        course.id,
        selectedLesson.id
      );
      if (res?.data?.data) setProgress(res.data.data.progressPercent || 0);
      const next = getNextLesson(selectedLesson.id);
      if (next) handleSelectLesson(next);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading)
    return (
      <div className="h-screen w-full flex items-center justify-center bg-slate-950">
        <div className="relative">
          <div className="h-16 w-16 rounded-full border-4 border-indigo-500/20 border-t-indigo-500 animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center text-[10px] font-black text-indigo-500 uppercase">
            Loading
          </div>
        </div>
      </div>
    );

  return (
    <div className="flex h-screen bg-[#020617] overflow-hidden font-sans">
      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0 transition-all duration-300">
        {/* HEADER TOPBAR */}
        <header className="h-16 bg-slate-900/50 backdrop-blur-md border-b border-slate-800/60 flex items-center justify-between px-6 z-10">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="hover:bg-slate-800 p-2.5 rounded-xl transition-all group"
            >
              <ChevronLeft
                size={20}
                className="text-slate-400 group-hover:text-white"
              />
            </button>
            <div className="h-6 w-[1px] bg-slate-800" />
            <h1 className="text-sm font-black uppercase tracking-wider text-slate-200 truncate max-w-[200px] md:max-w-[400px]">
              {course?.title}
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-[9px] uppercase font-black text-slate-500 tracking-[0.2em]">
                Tiến độ học tập
              </span>
              <span className="text-sm font-black text-indigo-400">
                {progress}%
              </span>
            </div>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className={`${
                sidebarOpen
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-800 text-slate-400'
              } p-2.5 rounded-xl transition-all hover:scale-105 active:scale-95 shadow-lg shadow-indigo-500/20`}
            >
              <Menu size={20} />
            </button>
          </div>
        </header>

        {/* PLAYER SECTION */}
        <main className="flex-1 overflow-y-auto scrollbar-hide flex flex-col">
          <div className="w-full bg-black flex items-center justify-center py-4 px-4 sm:px-8">
            <div className="w-full max-w-5xl aspect-video bg-slate-900 rounded-2xl overflow-hidden shadow-[0_0_50px_-12px_rgba(79,70,229,0.3)] border border-slate-800">
              {selectedLesson?.videoUrl ? (
                <video
                  key={selectedLesson.id}
                  src={selectedLesson.videoUrl}
                  controls
                  autoPlay
                  onEnded={handleVideoEnded}
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-slate-600 gap-4">
                  <MonitorPlay
                    size={80}
                    strokeWidth={1}
                    className="animate-pulse"
                  />
                  <p className="font-bold uppercase tracking-widest text-xs">
                    Vui lòng chọn bài học
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="flex-1 bg-slate-950 p-6 sm:p-10">
            <div className="max-w-5xl mx-auto">
              <div className="flex flex-col sm:flex-row justify-between items-start gap-6 mb-10">
                <div className="space-y-2">
                  <span className="px-2 py-1 bg-indigo-500/10 text-indigo-400 text-[10px] font-black uppercase tracking-tighter rounded">
                    Bài học đang xem
                  </span>
                  <h2 className="text-3xl font-black text-white tracking-tight leading-none">
                    {selectedLesson?.title}
                  </h2>
                  <p className="text-slate-500 text-sm font-medium">
                    Hệ thống tự động lưu tiến độ khi bạn xem hết video.
                  </p>
                </div>
                <button className="flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 text-xs font-black uppercase tracking-widest hover:bg-slate-800 transition-all">
                  <Info size={16} /> Ghi chú bài học
                </button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-slate-900/40 border border-slate-800/60 p-5 rounded-2xl">
                  <p className="text-[9px] text-slate-500 uppercase font-black mb-2 tracking-widest">
                    Thời lượng
                  </p>
                  <p className="text-xl font-black text-white">
                    {formatDuration(selectedLesson?.duration)}
                  </p>
                </div>
                <div className="bg-slate-900/40 border border-slate-800/60 p-5 rounded-2xl">
                  <p className="text-[9px] text-slate-500 uppercase font-black mb-2 tracking-widest">
                    Tổng bài
                  </p>
                  <p className="text-xl font-black text-white">
                    {totalLessons}
                  </p>
                </div>
                <div className="bg-slate-900/40 border border-slate-800/60 p-5 rounded-2xl border-b-green-500/50">
                  <p className="text-[9px] text-slate-500 uppercase font-black mb-2 tracking-widest">
                    Hoàn thành
                  </p>
                  <p className="text-xl font-black text-green-400">
                    {completedCount}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* RIGHT SIDEBAR */}
      <aside
        className={`${sidebarOpen ? 'w-80 md:w-96' : 'w-0'} bg-slate-900 border-l border-slate-800/50 transition-all duration-500 flex flex-col z-20 overflow-hidden`}
      >
        <div className="p-6 border-b border-slate-800 shrink-0 bg-slate-900/80 backdrop-blur-sm">
          <h3 className="font-black text-white uppercase tracking-widest text-sm mb-4">
            Nội dung khóa học
          </h3>
          <div className="space-y-2">
            <div className="flex justify-between text-[10px] font-black uppercase text-slate-500">
              <span>Tiến độ hoàn thành</span>
              <span className="text-indigo-400">{progress}%</span>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-indigo-600 to-violet-500 h-full transition-all duration-1000"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto bg-[#0F172A]">
          {chapters.map((chapter) => (
            <div key={chapter.id} className="mb-2">
              <div className="px-6 py-3 bg-slate-800/30 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] border-y border-slate-800/50 sticky top-0 z-10 backdrop-blur-sm">
                {chapter.orderIndex} {chapter.title}
              </div>

              {chapter.lessons?.map((lesson) => {
                const lessonIndex = allLessons.findIndex(
                  (x) => x.id === lesson.id
                );
                const isCompleted = lessonIndex < completedCount;
                const isLocked = lessonIndex > completedCount;
                const isActive = selectedLesson?.id === lesson.id;

                return (
                  <button
                    key={lesson.id}
                    disabled={isLocked}
                    onClick={() => handleSelectLesson(lesson)}
                    className={`w-full px-6 py-5 flex items-start gap-4 border-b border-slate-800/40 transition-all group
                      ${isActive ? 'bg-indigo-600/10 border-l-4 border-l-indigo-500' : 'hover:bg-slate-800/50'}
                      ${isLocked ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}
                    `}
                  >
                    <div className="mt-1 shrink-0">
                      {isCompleted ? (
                        <div className="bg-green-500/20 p-1 rounded-full">
                          <CheckCircle2 size={14} className="text-green-500" />
                        </div>
                      ) : isLocked ? (
                        <Lock size={14} className="text-slate-600" />
                      ) : (
                        <PlayCircle
                          size={18}
                          className={
                            isActive
                              ? 'text-indigo-400 animate-pulse'
                              : 'text-slate-500'
                          }
                        />
                      )}
                    </div>
                    <div className="text-left flex-1 min-w-0">
                      <p
                        className={`text-sm font-bold leading-snug mb-1 truncate ${isActive ? 'text-white' : 'text-slate-400'}`}
                      >
                        {lesson.title}
                      </p>
                      <div className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-500 tracking-tighter">
                        <Clock size={10} />
                        <span>{formatDuration(lesson.duration)}</span>
                        {isActive && (
                          <span className="ml-auto text-indigo-400 animate-bounce text-[8px]">
                            Đang phát
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </aside>
    </div>
  );
};

export default LearnPage;
