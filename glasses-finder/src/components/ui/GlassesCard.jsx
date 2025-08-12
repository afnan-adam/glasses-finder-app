import React from 'react';

/**
 * Reusable Glasses Card component
 */
const GlassesCard = ({ glasses, frameImage, className = '' }) => {
  if (!glasses) {
    return null;
  }

  const cardClasses = [
    'bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100 hover:border-purple-200 transform hover:scale-105',
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={cardClasses}>
      <div className="h-48 bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center">
        {glasses.image_url ? (
          <img 
            src={glasses.image_url} 
            alt={`${glasses.name} glasses`}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'block';
            }}
          />
        ) : null}
        <div 
          className="text-purple-600" 
          style={{ display: glasses.image_url ? 'none' : 'block' }}
        >
          {frameImage}
        </div>
      </div>
      
      <div className="p-6">
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-xl font-bold text-gray-800">{glasses.name}</h3>
          <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-semibold">
            ${glasses.numeric_price}
          </span>
        </div>
        
        <div className="space-y-2 mb-4">
          <InfoRow label="Style" value={glasses.frame_style} />
          <InfoRow label="Material" value={glasses.material} />
          <InfoRow label="Site" value={glasses.site} />
        </div>
        
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{glasses.features}</p>
        
        <a 
          href={glasses.url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="block w-full bg-purple-600 text-white py-3 px-4 rounded-xl font-semibold hover:bg-purple-700 transition-colors text-center"
        >
          View on {glasses.site}
        </a>
      </div>
    </div>
  );
};

/**
 * Info row component for glasses details
 */
const InfoRow = ({ label, value }) => (
  <div className="flex justify-between">
    <span className="text-gray-600">{label}:</span>
    <span className="font-medium capitalize">{value}</span>
  </div>
);

export default GlassesCard;