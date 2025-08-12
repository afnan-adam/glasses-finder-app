class GlassesImageService {
  constructor() {
    this.cache = new Map();
  }

  async generateImage(glasses) {
    const cacheKey = `${glasses.name}-${glasses.frame_style}-${glasses.material}`;

    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    // Search Unsplash for real glasses photos by style
    const frameStyle = glasses.frame_style || 'Classic';
    const queries = this.getGlassesSearchQueries(frameStyle);
    const hash = this.hashString(`${glasses.name}-${frameStyle}-${glasses.material}`);
    const query = queries[hash % queries.length];
    
    console.log('Searching Unsplash for:', query, 'for glasses:', glasses.name);
    
    // Use Unsplash Source API - no key required
    const encodedQuery = encodeURIComponent(query);
    const seed = hash % 1000;
    const imageUrl = `https://source.unsplash.com/768x512/?${encodedQuery}&${seed}`;
    
    this.cache.set(cacheKey, imageUrl);
    console.log('Unsplash photo URL:', imageUrl);
    
    return imageUrl;
  }


  searchGlassesPhotos(frameStyle, name, material) {
    // Map frame styles to specific search queries for real glasses photos
    const styleQueries = this.getGlassesSearchQueries(frameStyle);
    
    // Use hash to consistently pick the same photo for the same glasses
    const hash = this.hashString(`${name}-${frameStyle}-${material}`);
    
    // Alternate between Unsplash and Pexels for variety
    const useUnsplash = hash % 2 === 0;
    
    if (useUnsplash) {
      return this.getUnsplashGlassesPhoto(styleQueries, hash);
    } else {
      return this.getPexelsGlassesPhoto(styleQueries, hash);
    }
  }

  getGlassesSearchQueries(frameStyle) {
    // Professional search terms for each glasses style
    const queryMap = {
      'Round': ['round eyeglasses', 'round glasses frames', 'circular glasses', 'round spectacles'],
      'Square': ['square glasses', 'rectangular eyeglasses', 'geometric frames', 'angular glasses'],
      'Rectangular': ['rectangular glasses', 'classic eyeglasses', 'office glasses', 'professional frames'],
      'Aviator': ['aviator glasses', 'pilot glasses', 'aviator frames', 'metal aviators'],
      'Cat-Eye': ['cat eye glasses', 'vintage eyeglasses', 'retro frames', 'cat eye frames'],
      'Classic': ['classic glasses', 'traditional eyeglasses', 'timeless frames', 'vintage glasses'],
      'default': ['eyeglasses', 'glasses frames', 'spectacles', 'optical glasses']
    };
    
    return queryMap[frameStyle] || queryMap.default;
  }

  getUnsplashGlassesPhoto(queries, hash) {
    // Pick a query based on hash for consistency
    const query = queries[hash % queries.length];
    const page = Math.floor(hash / queries.length) % 10 + 1; // Pages 1-10
    
    // Use Unsplash Source API (no key required for basic usage)
    // Format: https://source.unsplash.com/WIDTHxHEIGHT/?QUERY
    const encodedQuery = encodeURIComponent(query);
    
    // Add some randomization but keep it consistent per glasses
    const seed = hash % 1000;
    return `https://source.unsplash.com/768x512/?${encodedQuery}&${seed}`;
  }

  getPexelsGlassesPhoto(queries, hash) {
    // Pick a query based on hash for consistency  
    const query = queries[hash % queries.length];
    
    // For Pexels, we'll use their photo IDs for consistent results
    // Map different queries to different photo ID ranges
    const photoIdRanges = {
      'round eyeglasses': { start: 1000000, range: 50000 },
      'square glasses': { start: 1100000, range: 50000 },
      'rectangular glasses': { start: 1200000, range: 50000 },
      'aviator glasses': { start: 1300000, range: 50000 },
      'cat eye glasses': { start: 1400000, range: 50000 },
      'classic glasses': { start: 1500000, range: 50000 },
      'default': { start: 1600000, range: 50000 }
    };
    
    const range = photoIdRanges[query] || photoIdRanges.default;
    const photoId = range.start + (hash % range.range);
    
    // Use Pexels photo URL format (works without API key for basic usage)
    return `https://images.pexels.com/photos/${photoId}/pexels-photo-${photoId}.jpeg?auto=compress&cs=tinysrgb&w=768&h=512&fit=crop`;
  }

  createPicsumPlaceholder(name, style, material) {
    // Use Picsum Photos for professional background with overlay
    const seed = this.hashString(`${name}-${style}`);
    const imageId = 200 + (seed % 800); // Use image IDs 200-999 for variety
    
    // Create a professional product photo style placeholder
    const baseUrl = `https://picsum.photos/768/512?random=${imageId}&grayscale&blur=1`;
    
    // For now, return the Picsum image - in production, you'd overlay text
    // This gives a professional photography backdrop
    return baseUrl;
  }

  createProfessionalPlaceholder(name, style, material) {
    // Create professional product-style placeholders with subtle colors and typography
    const styleInfo = this.getStyleInfo(style);
    
    // Use more professional, muted colors that look like product photography
    const bgColor = styleInfo.bgColor.replace('#', '');
    const textColor = styleInfo.textColor.replace('#', '');
    
    // Create multi-line text with proper spacing
    const line1 = encodeURIComponent(name);
    const line2 = encodeURIComponent(`${style} Frame`);
    const line3 = encodeURIComponent(material);
    
    // Use a service that creates professional-looking placeholders
    return `https://dummyimage.com/768x512/${bgColor}/${textColor}&text=${line1}%0A${line2}%0A${line3}`;
  }

  createUIAvatarsPlaceholder(name, style, material) {
    // Create clean, minimal placeholders using UI Avatars approach
    const initials = name.split(' ').map(word => word[0]).join('').toUpperCase().substring(0, 2);
    const styleInfo = this.getStyleInfo(style);
    
    const bgColor = styleInfo.bgColor.replace('#', '');
    const textColor = styleInfo.textColor.replace('#', '');
    
    // Use UI Avatars service for clean, professional look
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&size=768&background=${bgColor}&color=${textColor}&format=png&rounded=false&bold=true&font-size=0.33`;
  }

  getStyleInfo(frameStyle) {
    // Professional color schemes that look like product photography
    const styleMap = {
      'Round': { bgColor: '#f8fafc', textColor: '#1e293b', theme: 'minimal' },
      'Square': { bgColor: '#f1f5f9', textColor: '#334155', theme: 'modern' },
      'Rectangular': { bgColor: '#fefefe', textColor: '#0f172a', theme: 'classic' },
      'Aviator': { bgColor: '#fef7ed', textColor: '#9a3412', theme: 'vintage' },
      'Cat-Eye': { bgColor: '#fdf2f8', textColor: '#be185d', theme: 'elegant' },
      'Classic': { bgColor: '#f9fafb', textColor: '#374151', theme: 'traditional' },
      'default': { bgColor: '#f8fafc', textColor: '#475569', theme: 'neutral' }
    };
    
    return styleMap[frameStyle] || styleMap.default;
  }

  hashString(str) {
    // Simple hash function for consistent variety
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  clearCache() {
    this.cache.forEach(url => {
      if (url.startsWith('blob:')) {
        URL.revokeObjectURL(url);
      }
    });
    this.cache.clear();
  }
}

export default new GlassesImageService();