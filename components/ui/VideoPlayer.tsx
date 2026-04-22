'use client';
import { useState, useRef } from 'react';
import { getEmbedUrl, getVideoThumbnail } from '@/lib/video-utils';

interface VideoPlayerProps {
  url: string;
  type: 'youtube' | 'tiktok' | 'facebook' | 'upload';
  autoplay?: boolean;
  thumbnail?: string;
}

const platformBadge: Record<VideoPlayerProps['type'], { label: string; color: string }> = {
  youtube: { label: 'YouTube', color: 'bg-red-600' },
  tiktok: { label: 'TikTok', color: 'bg-black' },
  facebook: { label: 'Facebook', color: 'bg-blue-600' },
  upload: { label: 'Video', color: 'bg-brand-600' },
};

function PlayOverlay() {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black/25 group-hover:bg-black/35 transition-colors">
      <div className="w-16 h-16 rounded-full bg-white/90 group-hover:bg-white flex items-center justify-center shadow-lg transition-all group-hover:scale-110">
        <svg className="w-7 h-7 text-brand-700 translate-x-0.5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M8 5v14l11-7z" />
        </svg>
      </div>
    </div>
  );
}

function ThumbnailFallback({ type }: { type: VideoPlayerProps['type'] }) {
  const gradient =
    type === 'tiktok'
      ? 'from-stone-800 to-black'
      : type === 'facebook'
        ? 'from-blue-500 to-blue-700'
        : type === 'youtube'
          ? 'from-red-500 to-red-700'
          : 'from-brand-500 to-brand-800';
  return <div className={`absolute inset-0 bg-gradient-to-br ${gradient}`} />;
}

export default function VideoPlayer({ url, type, autoplay = false, thumbnail }: VideoPlayerProps) {
  const [playing, setPlaying] = useState(autoplay);
  const [thumbError, setThumbError] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const resolvedThumb =
    thumbnail || (type === 'youtube' ? getVideoThumbnail(url) : null);
  const badge = platformBadge[type];

  const handleFullscreen = () => {
    const el = wrapperRef.current;
    if (!el) return;
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    } else {
      el.requestFullscreen?.().catch(() => {});
    }
  };

  // Facebook → không embed được, hiện thumbnail + CTA mở tab mới
  if (type === 'facebook') {
    return (
      <div
        ref={wrapperRef}
        className="relative w-full aspect-video rounded-xl overflow-hidden bg-stone-900 group"
      >
        {resolvedThumb && !thumbError ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={resolvedThumb}
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
            onError={() => setThumbError(true)}
          />
        ) : (
          <ThumbnailFallback type={type} />
        )}
        <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center gap-3 p-4 text-center">
          <svg className="w-12 h-12 text-white" viewBox="0 0 24 24" fill="currentColor">
            <path d="M24 12.073c0-6.627-5.373-12-12-12S0 5.446 0 12.073c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
          </svg>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary bg-white text-blue-700 hover:bg-blue-50"
          >
            Xem trên Facebook ↗
          </a>
        </div>
        <span className={`absolute top-2 left-2 text-[10px] text-white font-medium ${badge.color} px-2 py-0.5 rounded`}>
          {badge.label}
        </span>
      </div>
    );
  }

  // Upload (Supabase / file) → HTML5 video
  if (type === 'upload') {
    return (
      <div
        ref={wrapperRef}
        className="relative w-full aspect-video rounded-xl overflow-hidden bg-black group"
      >
        {!playing ? (
          <button
            type="button"
            onClick={() => setPlaying(true)}
            className="absolute inset-0 w-full h-full block"
            aria-label="Phát video"
          >
            {resolvedThumb && !thumbError ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={resolvedThumb}
                alt=""
                className="absolute inset-0 w-full h-full object-cover"
                onError={() => setThumbError(true)}
              />
            ) : (
              <ThumbnailFallback type={type} />
            )}
            <PlayOverlay />
          </button>
        ) : (
          <video
            src={url}
            controls
            autoPlay
            playsInline
            preload="metadata"
            poster={resolvedThumb || undefined}
            className="absolute inset-0 w-full h-full object-contain bg-black"
          />
        )}
        <span className={`absolute top-2 left-2 text-[10px] text-white font-medium ${badge.color} px-2 py-0.5 rounded`}>
          {badge.label}
        </span>
        <button
          type="button"
          onClick={handleFullscreen}
          className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center transition"
          title="Toàn màn hình"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4h4M20 8V4h-4M4 16v4h4M20 16v4h-4" />
          </svg>
        </button>
      </div>
    );
  }

  // YouTube / TikTok → iframe embed (lazy load)
  const embedUrl = getEmbedUrl(url);

  return (
    <div
      ref={wrapperRef}
      className="relative w-full aspect-video rounded-xl overflow-hidden bg-black group"
    >
      {!playing || !embedUrl ? (
        <button
          type="button"
          onClick={() => embedUrl && setPlaying(true)}
          disabled={!embedUrl}
          className="absolute inset-0 w-full h-full block disabled:cursor-not-allowed"
          aria-label="Phát video"
        >
          {resolvedThumb && !thumbError ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={resolvedThumb}
              alt=""
              className="absolute inset-0 w-full h-full object-cover"
              onError={() => setThumbError(true)}
            />
          ) : (
            <ThumbnailFallback type={type} />
          )}
          {embedUrl && <PlayOverlay />}
          {!embedUrl && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white text-sm">
              Không thể phát video này
            </div>
          )}
        </button>
      ) : (
        <iframe
          src={`${embedUrl}${embedUrl.includes('?') ? '&' : '?'}autoplay=1`}
          className="absolute inset-0 w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          title="Video player"
        />
      )}

      <span className={`absolute top-2 left-2 text-[10px] text-white font-medium ${badge.color} px-2 py-0.5 rounded z-10`}>
        {badge.label}
      </span>
      <button
        type="button"
        onClick={handleFullscreen}
        className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center transition z-10"
        title="Toàn màn hình"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4h4M20 8V4h-4M4 16v4h4M20 16v4h-4" />
        </svg>
      </button>
    </div>
  );
}
