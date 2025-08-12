import React from 'react';

const GlassesImageCard = ({ glasses, className = "" }) => {
  // Warby Parker-inspired clean visual representation
  const renderWarbyParkerStyle = () => {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-white via-slate-50/30 to-slate-100/20">
        {/* Clean, centered product presentation */}
        <div className="text-center space-y-6 px-6">
          
          {/* Primary product name - Warby Parker style */}
          <div className="space-y-3">
            <h3 className="text-2xl font-normal text-slate-900 leading-tight">
              {glasses?.name}
            </h3>
            <div className="w-12 h-px bg-slate-300 mx-auto"></div>
          </div>

          {/* Frame style with elegant spacing */}
          <div className="space-y-2">
            <div className="text-sm font-normal text-slate-600 tracking-wide">
              {glasses?.frame_style}
            </div>
            {renderCleanFrameIcon(glasses?.frame_style)}
          </div>

          {/* Material and quality indicators */}
          <div className="text-xs text-slate-500 font-light tracking-wide space-y-1">
            <div>{glasses?.material}</div>
            <div className="opacity-75">Premium Quality</div>
          </div>

        </div>
      </div>
    );
  };

  // Clean, minimal frame icons inspired by premium optical stores
  const renderCleanFrameIcon = (frameStyle) => {
    const style = frameStyle?.toLowerCase();
    const iconClass = "w-8 h-8 mx-auto flex items-center justify-center";
    
    switch (style) {
      case 'round':
        return (
          <div className={iconClass}>
            <svg viewBox="0 0 32 16" className="w-full h-4 text-slate-400" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="8" cy="8" r="6" />
              <circle cx="24" cy="8" r="6" />
              <line x1="14" y1="8" x2="18" y2="8" />
            </svg>
          </div>
        );
        
      case 'square':
        return (
          <div className={iconClass}>
            <svg viewBox="0 0 32 16" className="w-full h-4 text-slate-400" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="2" y="3" width="12" height="10" rx="1" />
              <rect x="18" y="3" width="12" height="10" rx="1" />
              <line x1="14" y1="8" x2="18" y2="8" />
            </svg>
          </div>
        );
        
      case 'rectangular':
        return (
          <div className={iconClass}>
            <svg viewBox="0 0 36 16" className="w-full h-4 text-slate-400" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="2" y="4" width="14" height="8" rx="1" />
              <rect x="20" y="4" width="14" height="8" rx="1" />
              <line x1="16" y1="8" x2="20" y2="8" />
            </svg>
          </div>
        );
        
      case 'aviator':
        return (
          <div className={iconClass}>
            <svg viewBox="0 0 32 16" className="w-full h-4 text-slate-400" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M2 12 Q8 3 14 12" />
              <path d="M18 12 Q24 3 30 12" />
              <line x1="14" y1="6" x2="18" y2="6" />
            </svg>
          </div>
        );
        
      case 'cat-eye':
        return (
          <div className={iconClass}>
            <svg viewBox="0 0 32 16" className="w-full h-4 text-slate-400" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M2 10 Q8 4 12 6 Q14 8 14 10" />
              <path d="M18 10 Q18 8 20 6 Q24 4 30 10" />
              <line x1="14" y1="8" x2="18" y2="8" />
            </svg>
          </div>
        );
        
      default:
        return (
          <div className={iconClass}>
            <svg viewBox="0 0 32 16" className="w-full h-4 text-slate-400" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="2" y="4" width="12" height="8" rx="2" />
              <rect x="18" y="4" width="12" height="8" rx="2" />
              <line x1="14" y1="8" x2="18" y2="8" />
            </svg>
          </div>
        );
    }
  };

  return (
    <div className={`group relative overflow-hidden bg-white border border-slate-200/50 hover:border-slate-300/70 transition-all duration-500 hover:shadow-xl ${className}`}>
      
      {/* Hero image area - Warby Parker style */}
      <div className="relative aspect-[4/3] overflow-hidden">
        {renderWarbyParkerStyle()}
        
        {/* Premium badge - subtle and classy */}
        {(glasses?.frame_style === 'Aviator' || glasses?.material?.toLowerCase()?.includes('titanium')) && (
          <div className="absolute top-4 right-4 bg-slate-900/5 backdrop-blur-sm px-3 py-1.5 rounded-full border border-slate-200/50">
            <span className="text-xs font-medium text-slate-700 tracking-wider">PREMIUM</span>
          </div>
        )}
        
        {/* Subtle hover overlay */}
        <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/[0.02] transition-colors duration-500"></div>
      </div>

      {/* Product details - clean Warby Parker layout */}
      <div className="p-6 space-y-4">
        
        {/* Primary info */}
        <div className="space-y-2">
          <h3 className="text-lg font-medium text-slate-900 leading-tight">
            {glasses?.name}
          </h3>
          <div className="flex items-center gap-3 text-sm text-slate-600">
            <span className="font-normal">{glasses?.frame_style}</span>
            {glasses?.frame_style && glasses?.material && (
              <span className="text-slate-400">·</span>
            )}
            <span className="font-normal">{glasses?.material}</span>
          </div>
        </div>

        {/* Clean feature tags */}
        <div className="flex flex-wrap gap-2">
          {getStyleFeatures(glasses?.frame_style).map((feature, index) => (
            <span
              key={index}
              className="px-3 py-1.5 bg-slate-50 text-slate-700 text-xs font-medium rounded-full tracking-wide border border-slate-200/50 hover:bg-slate-100 transition-colors"
            >
              {feature}
            </span>
          ))}
        </div>

        {/* Quality assurance - Warby Parker style */}
        <div className="pt-3 border-t border-slate-100">
          <div className="flex items-center justify-between">
            <div className="text-xs text-slate-500 font-medium tracking-wide">
              QUALITY EYEWEAR
            </div>
            <div className="text-xs text-slate-400">
              ★★★★★
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

// Helper function to get style features
const getStyleFeatures = (frameStyle) => {
  const features = {
    'Round': ['Timeless', 'Intellectual', 'Vintage-Inspired'],
    'Square': ['Modern', 'Bold', 'Professional'],
    'Rectangular': ['Classic', 'Versatile', 'Business-Ready'],
    'Aviator': ['Iconic', 'Confident', 'Statement'],
    'Cat-Eye': ['Sophisticated', 'Retro', 'Distinctive'],
    'Classic': ['Refined', 'Traditional', 'Elegant']
  };
  
  return features[frameStyle] || ['Quality', 'Stylish', 'Comfortable'];
};

export default GlassesImageCard;