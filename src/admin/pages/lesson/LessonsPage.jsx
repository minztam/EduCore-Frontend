import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Table,
  Form,
  Input,
  Select,
  Checkbox,
  Button,
  Upload,
  Card,
  Space,
  Tag,
  Modal,
  message,
  Typography,
  Tooltip,
  InputNumber,
  Row,
  Col,
} from 'antd';
import {
  Edit3,
  Trash2,
  ArrowLeft,
  UploadCloud,
  MonitorPlay,
  PlayCircle,
  Clock,
  FileText,
  Plus,
  RefreshCw,
  Video,
} from 'lucide-react';

import {
  getLessonsByChapterId,
  createLesson,
  updateLesson,
  deleteLesson,
} from '../../../api/lessonApi';

const { Title, Text } = Typography;

const LessonManagementPage = () => {
  const { chapterId } = useParams();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const formRef = useRef(null);

  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewData, setPreviewData] = useState(null);

  const contentType = Form.useWatch('contentType', form);

  // --- LOGIC HELPER ---
  const secondsToTime = (seconds) => {
    if (!seconds) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const timeToSeconds = (timeStr) => {
    if (!timeStr || !timeStr.includes(':')) return 0;
    const [mins, secs] = timeStr.split(':').map(Number);
    return mins * 60 + (secs || 0);
  };

  const normFile = (e) => (Array.isArray(e) ? e : e?.fileList);

  const loadLessons = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getLessonsByChapterId(chapterId);
      const dataSource = res?.data?.data || [];
      setLessons(Array.isArray(dataSource) ? dataSource : []);
    } catch (err) {
      message.error('Không thể tải danh sách bài học');
    } finally {
      setLoading(false);
    }
  }, [chapterId]);

  useEffect(() => {
    if (chapterId) loadLessons();
  }, [loadLessons, chapterId]);

  // --- ACTIONS ---
  const onFinish = async (values) => {
    try {
      setSubmitting(true);
      const formData = new FormData();

      if (isEditing && editId) formData.append('Id', editId);
      formData.append('ChapterId', chapterId);
      formData.append('Title', values.title);
      formData.append('Slug', values.slug);
      formData.append('ContentType', values.contentType);
      formData.append('OrderIndex', values.orderIndex || 0);
      formData.append('Duration', timeToSeconds(values.durationDisplay));
      formData.append('IsPublished', values.isPublished ?? true);
      formData.append('IsFreePreview', values.isFreePreview ?? false);

      if (values.videoFile?.[0]?.originFileObj) {
        formData.append('VideoFile', values.videoFile[0].originFileObj);
      }
      if (values.documentFile?.[0]?.originFileObj) {
        formData.append('DocumentFile', values.documentFile[0].originFileObj);
      }

      if (isEditing) {
        await updateLesson(formData);
        message.success('Cập nhật thành công');
      } else {
        await createLesson(formData);
        message.success('Thêm bài học thành công');
      }

      loadLessons();
      handleReset();
    } catch (err) {
      message.error(err.response?.data?.message || 'Thao tác thất bại');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    form.resetFields();
    setIsEditing(false);
    setEditId(null);
  };

  const handleEdit = (record) => {
    setIsEditing(true);
    setEditId(record.id);

    const videoFileList = record.videoUrl
      ? [
          {
            uid: '-1',
            name: 'Video hiện tại',
            status: 'done',
            url: record.videoUrl,
          },
        ]
      : [];

    const documentFileList = record.documentUrl
      ? [
          {
            uid: '-2',
            name: 'Tài liệu hiện tại',
            status: 'done',
            url: record.documentUrl,
          },
        ]
      : [];

    form.setFieldsValue({
      ...record,
      durationDisplay: secondsToTime(record.duration),
      videoFile: videoFileList,
      documentFile: documentFileList,
    });

    formRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // --- TABLE COLUMNS ---
  const columns = [
    {
      title: 'THỨ TỰ',
      dataIndex: 'orderIndex',
      key: 'orderIndex',
      width: 80,
      align: 'center',
      render: (val) => (
        <Tag className="rounded-full bg-slate-100 text-slate-500 border-none font-bold">
          #{val}
        </Tag>
      ),
    },
    {
      title: 'BÀI HỌC',
      key: 'title',
      render: (_, record) => (
        <div className="flex items-start gap-3">
          {/* Chấm hiệu ứng nhấp nháy cho bài có video */}
          {record.videoUrl && (
            <div className="mt-1.5">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-600"></span>
              </span>
            </div>
          )}
          <div className="flex flex-col">
            <Text
              strong
              className={`${record.videoUrl ? 'text-blue-700' : 'text-slate-700'} text-sm uppercase leading-tight flex items-center gap-2`}
            >
              {record.title}
              {record.videoUrl && (
                <Video size={14} strokeWidth={3} className="text-blue-500" />
              )}
            </Text>
            <Text
              type="secondary"
              className="text-[11px] font-mono bg-slate-50 px-1 w-fit rounded mt-1"
            >
              /{record.slug}
            </Text>
          </div>
        </div>
      ),
    },
    {
      title: 'LOẠI & THỜI LƯỢNG',
      key: 'type',
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <div className="flex items-center gap-2">
            {record.contentType === 'Video' ? (
              <Video size={14} className="text-blue-500" />
            ) : (
              <FileText size={14} className="text-orange-500" />
            )}
            <Text className="text-[12px] font-medium">
              {record.contentType}
            </Text>
          </div>
          <Text
            type="secondary"
            className="text-[11px] flex items-center gap-1"
          >
            <Clock size={11} /> {secondsToTime(record.duration)}
          </Text>
        </Space>
      ),
    },
    {
      title: 'TRẠNG THÁI',
      key: 'status',
      align: 'center',
      render: (_, record) => (
        <Space direction="vertical" size={4} align="center">
          <Tag
            color={record.isPublished ? 'green' : 'default'}
            className="rounded-full px-3 m-0 border-none font-bold uppercase text-[10px]"
          >
            {record.isPublished ? 'Đang hiển thị' : 'Bản nháp'}
          </Tag>
          {record.isFreePreview && (
            <Tag
              color="gold"
              className="m-0 rounded-full border-none text-[9px] font-black uppercase"
            >
              Học thử
            </Tag>
          )}
        </Space>
      ),
    },
    {
      title: 'THAO TÁC',
      key: 'action',
      align: 'right',
      render: (_, record) => (
        <Space size="middle">
          {record.videoUrl && (
            <Tooltip title="Xem trước video">
              <Button
                type="text"
                size="small"
                icon={<PlayCircle size={18} className="text-blue-500" />}
                onClick={() => {
                  setPreviewData(record);
                  setPreviewVisible(true);
                }}
              />
            </Tooltip>
          )}
          <Tooltip title="Sửa bài học">
            <Button
              type="text"
              size="small"
              icon={
                <Edit3
                  size={18}
                  className="text-slate-400 hover:text-blue-600"
                />
              }
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          <Tooltip title="Xóa">
            <Button
              type="text"
              size="small"
              danger
              icon={<Trash2 size={18} />}
              onClick={() => {
                Modal.confirm({
                  title: 'Xác nhận xóa bài học',
                  content: `Dữ liệu về bài học "${record.title}" sẽ không thể khôi phục.`,
                  okText: 'Xóa ngay',
                  okType: 'danger',
                  onOk: () =>
                    deleteLesson(record.id).then(() => {
                      message.success('Đã xóa');
                      loadLessons();
                    }),
                });
              }}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-8 bg-[#f8fafc] min-h-screen">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-600 rounded-xl shadow-lg shadow-blue-100">
              <MonitorPlay size={24} className="text-white" />
            </div>
            <div>
              <Title level={2} className="!m-0 text-slate-800 font-bold">
                Thiết lập Bài học
              </Title>
              <Text type="secondary">
                Quản lý nội dung chi tiết trong chương học
              </Text>
            </div>
          </div>
          <Button
            icon={<ArrowLeft size={16} />}
            onClick={() => navigate(-1)}
            className="rounded-lg h-10 font-medium border-slate-200 text-slate-600 hover:text-blue-600"
          >
            Quay lại
          </Button>
        </div>

        {/* Form Card */}
        <div ref={formRef}>
          <Card className="mb-8 border-none shadow-sm rounded-2xl overflow-hidden">
            <div className="bg-slate-50/50 p-4 border-b border-slate-100 mb-6">
              <Text strong className="text-slate-600 flex items-center gap-2">
                {isEditing ? <Edit3 size={16} /> : <Plus size={16} />}
                {isEditing ? 'CẬP NHẬT THÔNG TIN BÀI HỌC' : 'THÊM BÀI HỌC MỚI'}
              </Text>
            </div>
            <Form
              form={form}
              layout="vertical"
              onFinish={onFinish}
              initialValues={{ contentType: 'Video', isPublished: true }}
              className="px-2"
            >
              <Row gutter={24}>
                <Col span={16}>
                  <Form.Item
                    name="title"
                    label={<b className="text-slate-700">Tên bài học</b>}
                    rules={[{ required: true, message: 'Nhập tên bài học' }]}
                  >
                    <Input
                      size="large"
                      placeholder="Ví dụ: Cài đặt môi trường phát triển"
                      className="rounded-lg"
                    />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    name="slug"
                    label={<b className="text-slate-700">Slug</b>}
                    rules={[{ required: true, message: 'Nhập slug' }]}
                  >
                    <Input
                      size="large"
                      placeholder="cai-dat-moi-truong"
                      prefix={<span className="text-slate-400">/</span>}
                      className="rounded-lg"
                    />
                  </Form.Item>
                </Col>

                <Col span={8}>
                  <Form.Item
                    name="contentType"
                    label={<b className="text-slate-700">Loại nội dung</b>}
                  >
                    <Select size="large" className="rounded-lg">
                      <Select.Option value="Video">
                        Video bài giảng
                      </Select.Option>
                      <Select.Option value="Document">
                        Tài liệu PDF/Word
                      </Select.Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    name="durationDisplay"
                    label={<b className="text-slate-700">Thời lượng (mm:ss)</b>}
                    rules={[
                      {
                        pattern: /^([0-9]{1,2}):([0-5][0-9])$/,
                        message: 'Định dạng mm:ss (03:06)',
                      },
                    ]}
                  >
                    <Input
                      size="large"
                      placeholder="03:06"
                      prefix={<Clock size={16} className="text-slate-400" />}
                      className="rounded-lg"
                    />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    name="orderIndex"
                    label={<b className="text-slate-700">Thứ tự ưu tiên</b>}
                  >
                    <InputNumber
                      className="w-full rounded-lg"
                      size="large"
                      min={1}
                    />
                  </Form.Item>
                </Col>

                <Col span={24}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-2">
                    {contentType === 'Video' ? (
                      <Form.Item
                        name="videoFile"
                        label={
                          <b className="text-slate-700">File Video Bài Giảng</b>
                        }
                        valuePropName="fileList"
                        getValueFromEvent={normFile}
                        extra={
                          isEditing && (
                            <span className="text-blue-500 italic text-[12px]">
                              * Hệ thống đang giữ video cũ. Chỉ tải lên nếu bạn
                              muốn thay đổi.
                            </span>
                          )
                        }
                      >
                        <Upload
                          beforeUpload={() => false}
                          maxCount={1}
                          accept="video/*"
                        >
                          <Button
                            icon={<UploadCloud size={20} />}
                            className="w-full h-20 border-2 border-dashed rounded-xl bg-blue-50/30 text-blue-600 border-blue-200 hover:border-blue-400 hover:bg-blue-50 transition-all flex flex-col items-center justify-center gap-1"
                          >
                            <span className="font-bold">
                              Chọn Video từ máy tính
                            </span>
                            <small className="text-blue-400">
                              Hỗ trợ .mp4, .mkv, .mov
                            </small>
                          </Button>
                        </Upload>
                      </Form.Item>
                    ) : (
                      <Form.Item
                        name="documentFile"
                        label={
                          <b className="text-slate-700">Tài Liệu Đính Kèm</b>
                        }
                        valuePropName="fileList"
                        getValueFromEvent={normFile}
                        extra={
                          isEditing && (
                            <span className="text-orange-500 italic text-[12px]">
                              * Hệ thống đang giữ tài liệu cũ. Chỉ tải lên nếu
                              bạn muốn thay đổi.
                            </span>
                          )
                        }
                      >
                        <Upload
                          beforeUpload={() => false}
                          maxCount={1}
                          accept=".pdf,.doc,.docx"
                        >
                          <Button
                            icon={<FileText size={20} />}
                            className="w-full h-20 border-2 border-dashed rounded-xl bg-orange-50/30 text-orange-600 border-orange-200 hover:border-orange-400 hover:bg-orange-50 transition-all flex flex-col items-center justify-center gap-1"
                          >
                            <span className="font-bold">
                              Chọn tài liệu văn bản
                            </span>
                            <small className="text-orange-400">
                              Hỗ trợ .pdf, .docx, .doc
                            </small>
                          </Button>
                        </Upload>
                      </Form.Item>
                    )}
                  </div>
                </Col>

                <Col span={24}>
                  <div className="flex gap-8 bg-slate-50 p-4 rounded-xl border border-slate-100 mb-6">
                    <Form.Item
                      name="isPublished"
                      valuePropName="checked"
                      className="mb-0"
                    >
                      <Checkbox>
                        <span className="text-slate-600 font-medium">
                          Công khai ngay
                        </span>
                      </Checkbox>
                    </Form.Item>
                    <Form.Item
                      name="isFreePreview"
                      valuePropName="checked"
                      className="mb-0"
                    >
                      <Checkbox>
                        <span className="text-slate-600 font-medium">
                          Cho phép học thử
                        </span>
                      </Checkbox>
                    </Form.Item>
                  </div>
                </Col>
              </Row>

              <Space className="pb-4">
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={submitting}
                  size="large"
                  className="rounded-lg bg-blue-600 px-8 font-bold h-11"
                >
                  {isEditing ? 'LƯU THAY ĐỔI' : 'TẠO BÀI HỌC'}
                </Button>
                {isEditing && (
                  <Button
                    size="large"
                    onClick={handleReset}
                    className="rounded-lg h-11 px-8 border-slate-300"
                  >
                    HỦY BỎ
                  </Button>
                )}
              </Space>
            </Form>
          </Card>
        </div>

        {/* Table Card */}
        <Card
          variant="borderless"
          className="shadow-sm rounded-2xl overflow-hidden"
        >
          <div className="flex justify-between items-center mb-6">
            <Text
              strong
              className="text-slate-700 uppercase tracking-wider text-xs"
            >
              Danh sách bài học
            </Text>
            <Button
              icon={
                <RefreshCw
                  size={14}
                  className={loading ? 'animate-spin' : ''}
                />
              }
              type="text"
              onClick={loadLessons}
            />
          </div>
          <Table
            columns={columns}
            dataSource={lessons.map((item) => ({ ...item, key: item.id }))}
            loading={loading}
            className="lesson-table"
            rowClassName={(record) => (record.videoUrl ? 'has-video-row' : '')}
            pagination={{
              pageSize: 10,
              showTotal: (total) => `Tổng số ${total} bài học`,
            }}
          />
        </Card>
      </div>

      <Modal
        title={
          <span className="text-slate-700 font-bold">{previewData?.title}</span>
        }
        open={previewVisible}
        onCancel={() => setPreviewVisible(false)}
        footer={null}
        width={850}
        destroyOnClose
        centered
        className="preview-modal"
      >
        <div className="aspect-video bg-slate-900 rounded-xl overflow-hidden shadow-2xl border border-slate-800">
          {previewVisible && (
            <video controls autoPlay className="w-full h-full">
              <source src={previewData?.videoUrl} type="video/mp4" />
            </video>
          )}
        </div>
      </Modal>

      <style>{`
        .lesson-table .ant-table-thead > tr > th {
          background: #f8fafc !important;
          color: #64748b !important;
          font-size: 11px !important;
          text-transform: uppercase !important;
          letter-spacing: 0.05em !important;
          font-weight: 700 !important;
          border-bottom: 1px solid #e2e8f0 !important;
        }

        /* Style đặc biệt cho dòng có video */
        .has-video-row {
          background-color: #f0f7ff !important;
        }
        .has-video-row td:first-child {
          border-left: 4px solid #3b82f6 !important;
        }
        .has-video-row:hover td {
          background-color: #e0efff !important;
        }

        .lesson-table .ant-table-tbody > tr:hover > td {
          background-color: #f1f5f9 !important;
        }
        .ant-card { border: 1px solid #e2e8f0 !important; }
        .preview-modal .ant-modal-content {
          border-radius: 20px !important;
          padding: 24px !important;
        }
      `}</style>
    </div>
  );
};

export default LessonManagementPage;
