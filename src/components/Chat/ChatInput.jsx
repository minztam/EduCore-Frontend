import React, { useState } from 'react';
import { ImagePlus, SendHorizontal, X } from 'lucide-react';
import chatApi from '../../api/chatApi';

const ChatInput = ({ roomId }) => {
  const [text, setText] = useState('');
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!text.trim() && !image) return;

    const formData = new FormData();
    formData.append('ChatRoomId', roomId);
    formData.append('Content', text);
    if (image) formData.append('ImageFile', image);

    try {
      await chatApi.sendMessage(formData);
      setText('');
      setImage(null);
      setPreview(null);
    } catch (err) {
      console.error('Lỗi gửi tin nhắn:', err);
    }
  };

  return (
    <div className="relative">
      {/* Image Preview Panel */}
      {preview && (
        <div className="absolute -top-20 left-4 bg-white p-2 rounded-xl shadow-2xl border border-slate-100 flex items-center gap-3 animate-in slide-in-from-bottom-4">
          <img
            src={preview}
            alt="preview"
            className="w-12 h-12 object-cover rounded-lg"
          />
          <button
            onClick={() => {
              setImage(null);
              setPreview(null);
            }}
            className="p-1 bg-red-100 text-red-600 rounded-full hover:bg-red-200"
          >
            <X size={14} />
          </button>
        </div>
      )}

      <form
        onSubmit={handleSend}
        className="flex items-center gap-2 bg-slate-100 p-2 rounded-[24px] border border-transparent focus-within:border-blue-200 focus-within:bg-white transition-all"
      >
        <label className="cursor-pointer p-2.5 text-slate-500 hover:text-blue-600 hover:bg-white rounded-full transition-all">
          <ImagePlus size={20} />
          <input
            type="file"
            className="hidden"
            accept="image/*"
            onChange={handleImageChange}
          />
        </label>

        <input
          type="text"
          className="flex-1 bg-transparent border-none px-2 text-[14px] outline-none placeholder:text-slate-400"
          placeholder="Viết tin nhắn..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />

        <button
          type="submit"
          disabled={!text.trim() && !image}
          className={`p-2.5 rounded-full transition-all ${
            text.trim() || image
              ? 'bg-blue-600 text-white shadow-lg'
              : 'bg-slate-300 text-white'
          }`}
        >
          <SendHorizontal size={20} />
        </button>
      </form>
    </div>
  );
};

export default ChatInput;
