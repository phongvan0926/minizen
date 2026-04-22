'use client';
import { useState } from 'react';
import toast from 'react-hot-toast';
import {
  getVideoType,
  getVideoThumbnail,
  getEmbedUrl,
  isValidVideoUrl,
  type VideoType,
} from '@/lib/video-utils';

interface VideoLinkInputProps {
  videoLinks: string[];
  onChange: (links: string[]) => void;
  maxLinks?: number;
}

const platformMeta: Record<Exclude<VideoType, 'unknown' | 'upload'>, { label: string; color: string; icon: JSX.Element }> = {
  youtube: {
    label: 'YouTube',
    color: 'bg-red-600',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
        <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.017 3.017 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    ),
  },
  tiktok: {
    label: 'TikTok',
    color: 'bg-black',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
        <path d="M19.321 5.562a5.124 5.124 0 01-3.414-1.267 5.124 5.124 0 01-1.537-2.723V1h-3.172v13.27a2.91 2.91 0 01-5.22 1.766 2.91 2.91 0 01.52-4.07 2.91 2.91 0 013.106-.319V8.346a6.082 6.082 0 00-6.89 9.854 6.082 6.082 0 009.988-.82 6.081 6.081 0 00.68-2.807V9.146a8.282 8.282 0 004.831 1.544V7.518a4.85 4.85 0 01-2.892-1.956z" />
      </svg>
    ),
  },
  facebook: {
    label: 'Facebook',
    color: 'bg-blue-600',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
        <path d="M24 12.073c0-6.627-5.373-12-12-12S0 5.446 0 12.073c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    ),
  },
};

function PlatformThumbnail({ url }: { url: string }) {
  const type = getVideoType(url);
  const [imgError, setImgError] = useState(false);
  const thumb = type === 'youtube' ? getVideoThumbnail(url) : null;

  if (thumb && !imgError) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={thumb}
        alt=""
        className="w-full h-full object-cover"
        loading="lazy"
        onError={() => setImgError(true)}
      />
    );
  }

  const gradient =
    type === 'tiktok'
      ? 'from-stone-800 to-black'
      : type === 'facebook'
        ? 'from-blue-500 to-blue-700'
        : 'from-stone-300 to-stone-400';

  return (
    <div className={`w-full h-full bg-gradient-to-br ${gradient} flex items-center justify-center`}>
      <svg className="w-8 h-8 text-white/80" viewBox="0 0 24 24" fill="currentColor">
        <path d="M8 5v14l11-7z" />
      </svg>
    </div>
  );
}

function shortenUrl(url: string): string {
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^www\./, '');
    const path = u.pathname.length > 24 ? u.pathname.slice(0, 24) + '…' : u.pathname;
    return host + path;
  } catch {
    return url.length > 40 ? url.slice(0, 40) + '…' : url;
  }
}

export default function VideoLinkInput({ videoLinks, onChange, maxLinks = 5 }: VideoLinkInputProps) {
  const [value, setValue] = useState('');
  const [previewIdx, setPreviewIdx] = useState<number | null>(null);
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);

  const detectedType = value.trim() ? getVideoType(value.trim()) : 'unknown';
  const typingValid = value.trim() ? isValidVideoUrl(value.trim()) : true;

  const handleAdd = () => {
    const link = value.trim();
    if (!link) return;

    if (videoLinks.length >= maxLinks) {
      toast.error(`Tối đa ${maxLinks} link video`);
      return;
    }
    if (videoLinks.includes(link)) {
      toast.error('Link này đã được thêm');
      return;
    }
    if (!isValidVideoUrl(link)) {
      toast.error('Link không hợp lệ — chỉ chấp nhận YouTube, TikTok, Facebook');
      return;
    }

    onChange([...videoLinks, link]);
    setValue('');
  };

  const handleRemove = (idx: number) => {
    onChange(videoLinks.filter((_, i) => i !== idx));
    if (previewIdx === idx) setPreviewIdx(null);
  };

  const handleDrop = (targetIdx: number) => {
    if (dragIdx === null || dragIdx === targetIdx) {
      setDragIdx(null);
      setDragOverIdx(null);
      return;
    }
    const reordered = [...videoLinks];
    const [moved] = reordered.splice(dragIdx, 1);
    reordered.splice(targetIdx, 0, moved);
    onChange(reordered);
    setDragIdx(null);
    setDragOverIdx(null);
    setPreviewIdx(null);
  };

  const renderEmbed = (url: string) => {
    const type = getVideoType(url);
    if (type === 'youtube' || type === 'tiktok') {
      const embed = getEmbedUrl(url);
      if (!embed) return null;
      return (
        <iframe
          src={embed}
          className="w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      );
    }
    return (
      <div className="w-full h-full flex items-center justify-center bg-stone-900 text-white text-sm">
        <a href={url} target="_blank" rel="noopener noreferrer" className="underline">
          Mở trên Facebook
        </a>
      </div>
    );
  };

  return (
    <div>
      {/* Input row */}
      {videoLinks.length < maxLinks && (
        <div className="flex flex-col sm:flex-row gap-2 mb-3">
          <div className="relative flex-1">
            <input
              type="url"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAdd();
                }
              }}
              placeholder="Dán link YouTube, TikTok hoặc Facebook…"
              className={`input-field w-full pr-10 ${
                value.trim() && !typingValid ? 'border-red-400 focus:border-red-500' : ''
              }`}
            />
            {detectedType !== 'unknown' && detectedType !== 'upload' && (
              <div
                className={`absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full ${platformMeta[detectedType].color} text-white p-1`}
                title={platformMeta[detectedType].label}
              >
                {platformMeta[detectedType].icon}
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={handleAdd}
            disabled={!value.trim() || !typingValid}
            className="btn-primary whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
          >
            + Thêm video
          </button>
        </div>
      )}

      {value.trim() && !typingValid && (
        <p className="text-xs text-red-500 mb-3">
          Link không hợp lệ — chỉ chấp nhận youtube.com, youtu.be, tiktok.com, facebook.com/watch
        </p>
      )}

      {/* List */}
      {videoLinks.length > 0 && (
        <ul className="space-y-2">
          {videoLinks.map((url, i) => {
            const type = getVideoType(url);
            const meta =
              type === 'youtube' || type === 'tiktok' || type === 'facebook'
                ? platformMeta[type]
                : null;
            const isPreview = previewIdx === i;

            return (
              <li
                key={url}
                draggable
                onDragStart={() => setDragIdx(i)}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOverIdx(i);
                }}
                onDragLeave={() => setDragOverIdx(null)}
                onDrop={() => handleDrop(i)}
                onDragEnd={() => {
                  setDragIdx(null);
                  setDragOverIdx(null);
                }}
                className={`group border-2 rounded-xl transition-all bg-white ${
                  dragOverIdx === i ? 'border-brand-400 scale-[0.99]' : 'border-stone-200'
                } ${dragIdx === i ? 'opacity-50' : ''}`}
              >
                <div className="flex items-center gap-3 p-2 cursor-grab active:cursor-grabbing">
                  {/* Drag handle */}
                  <span className="text-stone-300 hover:text-stone-500 select-none px-1" title="Kéo để sắp xếp">
                    ⋮⋮
                  </span>

                  {/* Thumbnail */}
                  <div className="relative w-24 h-14 rounded-lg overflow-hidden flex-shrink-0 bg-stone-100">
                    <PlatformThumbnail url={url} />
                    {meta && (
                      <span
                        className={`absolute bottom-1 left-1 w-4 h-4 rounded-sm ${meta.color} text-white p-0.5 shadow`}
                        title={meta.label}
                      >
                        {meta.icon}
                      </span>
                    )}
                  </div>

                  {/* Title + URL */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-stone-800 truncate">
                      {meta ? meta.label : 'Video'}
                      {i === 0 && (
                        <span className="ml-2 badge bg-brand-600 text-white text-[10px] px-1.5 py-0.5">
                          Video chính
                        </span>
                      )}
                    </p>
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-stone-500 hover:text-brand-600 truncate block"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {shortenUrl(url)}
                    </a>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      type="button"
                      onClick={() => setPreviewIdx(isPreview ? null : i)}
                      className="w-8 h-8 rounded-full bg-stone-100 hover:bg-brand-100 text-stone-600 hover:text-brand-700 flex items-center justify-center transition"
                      title={isPreview ? 'Ẩn preview' : 'Xem trước'}
                    >
                      {isPreview ? (
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M6 6h4v12H6zM14 6h4v12h-4z" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemove(i)}
                      className="w-8 h-8 rounded-full bg-red-50 hover:bg-red-500 text-red-600 hover:text-white flex items-center justify-center transition"
                      title="Xoá"
                    >
                      &times;
                    </button>
                  </div>
                </div>

                {/* Inline preview */}
                {isPreview && (
                  <div className="border-t border-stone-200">
                    <div className="relative w-full aspect-video bg-black">{renderEmbed(url)}</div>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}

      <p className="text-xs text-stone-400 mt-2">
        {videoLinks.length}/{maxLinks} link — kéo để sắp xếp lại thứ tự
      </p>
    </div>
  );
}
