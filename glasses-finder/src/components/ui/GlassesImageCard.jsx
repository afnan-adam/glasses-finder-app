import React, { useState } from 'react';

const GlassesImageCard = ({ glasses, className = '' }) => {
  const [imageFailed, setImageFailed] = useState(false);
  const frameStyle = glasses?.frame_style || 'Classic';
  const imageUrl = glasses?.image_url;

  return (
    <article className={`group overflow-hidden rounded-2xl border border-slate-200 bg-white transition duration-300 hover:-translate-y-1 hover:shadow-lg ${className}`}>
      <div className="relative flex aspect-[4/3] items-center justify-center overflow-hidden bg-[#f8f7f5] p-5">
        {imageUrl && !imageFailed ? (
          <img
            src={imageUrl}
            alt={`${glasses?.name || frameStyle} eyeglasses`}
            loading="lazy"
            referrerPolicy="no-referrer"
            onError={() => setImageFailed(true)}
            className="h-full w-full object-contain transition-transform duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 bg-white/70 text-center">
            <span className="text-sm font-medium text-slate-600">Product photo unavailable</span>
            <span className="text-xs text-slate-400">View the retailer listing for this frame</span>
          </div>
        )}
        <span className="absolute bottom-3 left-4 rounded-full bg-white/90 px-3 py-1 text-xs font-medium capitalize tracking-wide text-slate-600">
          {frameStyle} frame
        </span>
      </div>

      <div className="space-y-3 p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="text-lg font-semibold leading-snug text-slate-900">{glasses?.name || 'Eyeglass frame'}</h3>
            <p className="mt-1 text-sm text-slate-500">{glasses?.material || 'Material not listed'}</p>
          </div>
          <p className="shrink-0 text-lg font-semibold text-slate-900">
            {glasses?.price || (Number.isFinite(glasses?.numeric_price) ? `$${glasses.numeric_price}` : 'See price')}
          </p>
        </div>
        {glasses?.features && <p className="text-sm leading-relaxed text-slate-600">{glasses.features}</p>}
      </div>
    </article>
  );
};

export default GlassesImageCard;
