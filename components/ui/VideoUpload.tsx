'use client';
import { useState, useRef, useCallback } from 'react';
import toast from 'react-hot-toast';

interface VideoUploadProps {
  videos: string[];
  onChange: (urls: string[]) => void;
  maxVideos?: number;
  folder: string;
}

const ALLOWED_TYPES = ['video/mp4', 'video/webm', 'video/quicktime'];
const MAX_SIZE = 50 * 1024 * 1024; // 50MB

export default function VideoUpload({ videos, onChange, maxVideos = 3, folder }: VideoUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const uploadOne = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', folder);
      formData.append('kind', 'video');

      const xhr = new XMLHttpRequest();
      xhr.open('POST', '/api/upload');

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          setProgress(Math.round((e.loaded / e.total) * 100));
        }
      };

      xhr.onload = () => {
        try {
          const data = JSON.parse(xhr.responseText);
          if (xhr.status >= 200 && xhr.status < 300 && data.url) resolve(data.url);
          else reject(new Error(data.error || 'Upload thất bại'));
        } catch {
          reject(new Error('Upload thất bại'));
        }
      };
      xhr.onerror = () => reject(new Error('Lỗi mạng'));
      xhr.send(formData);
    });
  };

  const uploadFiles = useCallback(async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    const remaining = maxVideos - videos.length;

    if (remaining <= 0) {
      toast.error(`Tối đa ${maxVideos} video`);
      return;
    }

    const toUpload = fileArray.slice(0, remaining);
    if (toUpload.length < fileArray.length) {
      toast.error(`Chỉ upload được ${remaining} video nữa`);
    }

    setUploading(true);
    const newUrls: string[] = [];

    for (const file of toUpload) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        toast.error(`${file.name}: chỉ hỗ trợ MP4, WebM, MOV`);
        continue;
      }
      if (file.size > MAX_SIZE) {
        toast.error(`${file.name} vượt quá 50MB`);
        continue;
      }

      try {
        setProgress(0);
        const url = await uploadOne(file);
        newUrls.push(url);
      } catch (err: any) {
        toast.error(`Lỗi upload ${file.name}: ${err.message}`);
      }
    }

    if (newUrls.length > 0) {
      onChange([...videos, ...newUrls]);
      toast.success(`Đã upload ${newUrls.length} video`);
    }
    setUploading(false);
    setProgress(0);
  }, [videos, maxVideos, folder, onChange]);

  const handleRemove = (index: number) => {
    onChange(videos.filter((_, i) => i !== index));
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files.length > 0) {
      uploadFiles(e.dataTransfer.files);
    }
  }, [uploadFiles]);

  return (
    <div>
      {/* Uploaded videos grid */}
      {videos.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-3">
          {videos.map((url, i) => (
            <div key={url} className="relative group aspect-video rounded-xl overflow-hidden border-2 border-stone-200 bg-black">
              <video
                src={url}
                className="w-full h-full object-cover"
                controls
                preload="metadata"
              />
              {i === 0 && (
                <span className="absolute top-2 left-2 badge bg-brand-600 text-white text-[10px] px-2 py-0.5 z-10">
                  Video chính
                </span>
              )}
              <button
                type="button"
                onClick={() => handleRemove(i)}
                className="absolute top-2 right-2 w-7 h-7 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 text-sm z-10"
              >
                &times;
              </button>
              <span className="absolute bottom-2 left-2 text-[10px] text-white/90 font-medium bg-black/40 px-1.5 py-0.5 rounded z-10">
                Video {i + 1}/{videos.length}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Upload zone */}
      {videos.length < maxVideos && (
        <div
          className={`relative border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer ${
            dragOver ? 'border-brand-400 bg-brand-50' : 'border-stone-300 hover:border-brand-300 hover:bg-stone-50'
          }`}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => !uploading && inputRef.current?.click()}
        >
          <input
            ref={inputRef}
            type="file"
            accept="video/mp4,video/webm,video/quicktime"
            multiple
            className="hidden"
            onChange={(e) => e.target.files && uploadFiles(e.target.files)}
          />

          {uploading ? (
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-3 border-brand-600 border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-stone-500">Đang upload video... {progress}%</p>
              <div className="w-full max-w-xs h-2 bg-stone-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-brand-600 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-stone-100 flex items-center justify-center">
                <svg className="w-5 h-5 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-stone-700">
                  Kéo thả video vào đây hoặc <span className="text-brand-600">chọn file</span>
                </p>
                <p className="text-xs text-stone-400 mt-1">
                  MP4, WebM, MOV — tối đa 50MB/video — còn {maxVideos - videos.length} video
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
