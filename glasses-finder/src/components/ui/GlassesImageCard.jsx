import React from 'react';

const frameShapes = {
  round: {
    left: <circle cx="112" cy="112" r="43" />,
    right: <circle cx="208" cy="112" r="43" />,
  },
  square: {
    left: <rect x="67" y="70" width="90" height="82" rx="17" />,
    right: <rect x="163" y="70" width="90" height="82" rx="17" />,
  },
  rectangular: {
    left: <rect x="64" y="82" width="94" height="62" rx="12" />,
    right: <rect x="162" y="82" width="94" height="62" rx="12" />,
  },
  aviator: {
    left: <path d="M68 76 Q111 61 156 79 L148 137 Q111 169 82 137 Z" />,
    right: <path d="M164 79 Q209 61 252 76 L238 137 Q209 169 172 137 Z" />,
  },
  'cat-eye': {
    left: <path d="M66 91 L82 67 Q119 57 157 87 L148 139 Q110 160 82 135 Z" />,
    right: <path d="M163 87 Q201 57 238 67 L254 91 L238 135 Q210 160 172 139 Z" />,
  },
  classic: {
    left: <rect x="67" y="76" width="90" height="76" rx="25" />,
    right: <rect x="163" y="76" width="90" height="76" rx="25" />,
  },
};

const GlassesArtwork = ({ frameStyle }) => {
  const style = frameStyle?.toLowerCase();
  const shape = frameShapes[style] || frameShapes.classic;

  return (
    <svg
      viewBox="0 0 320 220"
      role="img"
      aria-label={`${frameStyle || 'Classic'} eyeglass frame illustration`}
      className="h-full w-full"
      fill="none"
    >
      <defs>
        <linearGradient id="lens-glow" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ffffff" stopOpacity=".8" />
          <stop offset="100%" stopColor="#e9e4f5" stopOpacity=".28" />
        </linearGradient>
        <linearGradient id="frame-shine" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#51456d" />
          <stop offset="100%" stopColor="#211a31" />
        </linearGradient>
      </defs>
      <ellipse cx="160" cy="177" rx="104" ry="9" fill="#302443" opacity=".08" />
      <g stroke="#211a31" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round">
        <path d="M69 91 L35 77" />
        <path d="M251 91 L285 77" />
      </g>
      <g fill="url(#lens-glow)" stroke="url(#frame-shine)" strokeWidth="8" strokeLinejoin="round">
        {shape.left}
        {shape.right}
      </g>
      <path d="M155 91 Q160 84 165 91" stroke="#211a31" strokeWidth="8" strokeLinecap="round" />
      <g stroke="#ffffff" strokeWidth="3" strokeLinecap="round" opacity=".78">
        <path d="M86 91 L104 82" />
        <path d="M182 91 L200 82" />
      </g>
      <g stroke="#211a31" strokeWidth="2" opacity=".18">
        <path d="M80 157 L111 166" />
        <path d="M209 166 L240 157" />
      </g>
    </svg>
  );
};

const GlassesImageCard = ({ glasses, className = '' }) => {
  const frameStyle = glasses?.frame_style || 'Classic';

  return (
    <article className={`group overflow-hidden rounded-2xl border border-slate-200 bg-white transition duration-300 hover:-translate-y-1 hover:shadow-lg ${className}`}>
      <div className="relative flex aspect-[4/3] items-center justify-center overflow-hidden bg-[#f7f5f2] px-5 py-4">
        <div className="h-full w-full max-w-[360px] transition-transform duration-500 group-hover:scale-[1.04]">
          <GlassesArtwork frameStyle={frameStyle} />
        </div>
        <span className="absolute bottom-3 left-4 rounded-full bg-white/85 px-3 py-1 text-xs font-medium capitalize tracking-wide text-slate-600">
          {frameStyle} frame
        </span>
      </div>

      <div className="space-y-3 p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="text-lg font-semibold leading-snug text-slate-900">
              {glasses?.name || 'Eyeglass frame'}
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              {glasses?.material || 'Material not listed'}
            </p>
          </div>
          <p className="shrink-0 text-lg font-semibold text-slate-900">
            {glasses?.price || (Number.isFinite(glasses?.numeric_price) ? `$${glasses.numeric_price}` : 'See price')}
          </p>
        </div>

        {glasses?.features && (
          <p className="text-sm leading-relaxed text-slate-600">
            {glasses.features}
          </p>
        )}
      </div>
    </article>
  );
};

export default GlassesImageCard;
