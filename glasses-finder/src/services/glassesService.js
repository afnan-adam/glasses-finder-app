/**
 * Refactored Glasses Service - Modern JavaScript patterns
 * 
 * This service provides eligibility assessment, personalized recommendations,
 * and data management for affordable glasses in Washington D.C.
 * 
 * @class GlassesService
 */
class GlassesService {
  // Static constants for better maintainability
  static MEDICAID_INCOME_LIMITS = Object.freeze({
    1: 20783,
    2: 28207,
    3: 35632,
    4: 43056,
    5: 50481,
    6: 57905,
    7: 65330,
    8: 72754
  });

  static VALID_DC_ZIP_CODES = Object.freeze(new Set([
    '20001', '20002', '20003', '20004', '20005', '20006', '20007', '20008',
    '20009', '20010', '20011', '20012', '20015', '20016', '20017', '20018',
    '20019', '20020', '20024', '20026', '20027', '20029', '20030', '20032',
    '20036', '20037', '20052', '20053', '20056', '20057', '20064', '20066',
    '20071', '20090', '20091', '20201', '20204', '20228', '20240', '20260'
  ]));

  static TIER_CONFIG = Object.freeze({
    MEDICAID_ELIGIBLE: {
      multiplier: 1,
      budgetRange: [0, 50],
      tier: 'medicaid_eligible',
      name: 'Medicaid Eligible'
    },
    LOW_INCOME_GAP: {
      multiplier: 2,
      budgetRange: [0, 100],
      tier: 'low_income_gap',
      name: 'Low-Income Gap'
    },
    MODERATE_INCOME: {
      multiplier: 3,
      budgetRange: [50, 200],
      tier: 'moderate_income',
      name: 'Moderate Income'
    },
    ANY_INCOME: {
      multiplier: Infinity,
      budgetRange: [0, 500],
      tier: 'any_income',
      name: 'Any Income'
    }
  });

  static FRAME_STYLE_IMAGES = Object.freeze({
    'round': 'https://via.placeholder.com/300x200/f0f0f0/333333?text=Round+Frame',
    'square': 'https://via.placeholder.com/300x200/e8e8e8/444444?text=Square+Frame',
    'aviator': 'https://via.placeholder.com/300x200/f5f5f5/555555?text=Aviator+Frame',
    'rectangular': 'https://via.placeholder.com/300x200/f2f2f2/666666?text=Rectangular',
    'classic': 'https://via.placeholder.com/300x200/eeeeee/333333?text=Classic+Frame',
    'cat-eye': 'https://via.placeholder.com/300x200/f8f8f8/444444?text=Cat+Eye'
  });

  constructor() {
    this._glassesData = this._initializeGlassesData();
    this._dcResources = this._initializeDCResources();
    this._cache = new Map();
  }

  /**
   * Initialize glasses data with validation
   * @private
   * @returns {Array} Validated glasses data
   */
  _initializeGlassesData() {
    const rawData = [
      {
        site: 'Warby Parker',
        name: 'Felix',
        numeric_price: 95,
        price_checked_at: '2026-11-24',
        features: 'Square acetate frame. Starting price includes single-vision prescription lenses.',
        url: 'https://www.warbyparker.com/eyeglasses/felix/pacific-crystal',
        frame_style: 'square',
        material: 'Acetate',
        image_url: 'https://d3i1ct304nu39.cloudfront.net/s/c/68853df02b3332b35c9db0581caa6a8098e67352.png?quality=80&width=3840'
      },
      {
        site: 'Warby Parker',
        name: 'Hardy',
        numeric_price: 95,
        price_checked_at: '2026-11-24',
        features: 'Rectangular acetate frame. Starting price includes single-vision prescription lenses.',
        url: 'https://www.warbyparker.com/eyeglasses/hardy/jet-black',
        frame_style: 'rectangular',
        material: 'Acetate',
        image_url: 'https://i.warbycdn.com/cdn-cgi/image/width%3D3840%2Cquality%3D80%2Cformat%3Dauto/s/c/a9e1bf621b38b473e8112e463b00181c7932af1d'
      },
      {
        site: 'Warby Parker',
        name: 'Percey',
        numeric_price: 95,
        price_checked_at: '2026-11-24',
        features: 'Round acetate frame. Starting price includes single-vision prescription lenses.',
        url: 'https://www.warbyparker.com/eyeglasses/percey/jet-black-matte',
        frame_style: 'round',
        material: 'Acetate',
        image_url: 'https://i.warbycdn.com/s/c/e9a58308f0c5645f237fcd0a2d95ded61a65d29b'
      },
      {
        site: 'Warby Parker',
        name: 'Chamberlain',
        numeric_price: 95,
        price_checked_at: '2026-11-24',
        features: 'Acetate frame. Starting price includes single-vision prescription lenses.',
        url: 'https://www.warbyparker.com/eyeglasses/chamberlain/crystal',
        frame_style: 'rectangular',
        material: 'Acetate',
        image_url: 'https://i.warbycdn.com/cdn-cgi/image/width%3D3840%2Cquality%3D80%2Cformat%3Dauto/s/c/9410cfbfee0945c81a82b7589f1a5430bc8e536d'
      },
      {
        site: 'Warby Parker',
        name: 'Rafael',
        numeric_price: 145,
        price_checked_at: '2026-11-24',
        features: 'Stainless-steel frame with acetate temple tips. Starting price includes single-vision prescription lenses.',
        url: 'https://www.warbyparker.com/eyeglasses/rafael/polished-gold',
        frame_style: 'round',
        material: 'Stainless steel',
        image_url: 'https://i.warbycdn.com/s/c/dcd848053ff0aea9ae047f120bb8a34e81e7b8a5?quality=80&width=3840'
      }
    ];

    return rawData.map(item => this._createGlassesItem(item));
  }

  /**
   * Create and validate a glasses item
   * @private
   * @param {Object} item - Raw glasses data
   * @returns {Object} Validated glasses item
   * @throws {Error} If required fields are missing
   */
  _createGlassesItem(item) {
    const required = ['site', 'name', 'numeric_price', 'features', 'frame_style', 'material'];
    const missing = required.filter(field => !item[field] && item[field] !== 0);
    
    if (missing.length > 0) {
      throw new Error(`Missing required fields for glasses item: ${missing.join(', ')}`);
    }

    // Validate numeric price
    if (typeof item.numeric_price !== 'number' || item.numeric_price < 0) {
      throw new Error(`Invalid numeric_price for ${item.name}: must be a positive number`);
    }

    return Object.freeze({
      ...item,
      id: this._generateId(item.site, item.name),
      price: item.price || `$${item.numeric_price}`,
      image_url: item.image_url || null,
      url: item.url || '#',
      created_at: new Date().toISOString()
    });
  }

  /**
   * Generate unique ID for glasses item
   * @private
   * @param {string} site - Site name
   * @param {string} name - Glasses name
   * @returns {string} Unique ID
   */
  _generateId(site, name) {
    const normalize = str => str.toLowerCase().replace(/[^a-z0-9]/g, '-');
    return `${normalize(site)}-${normalize(name)}`;
  }

  /**
   * Get default image URL for frame style
   * @private
   * @param {string} frameStyle - Frame style
   * @returns {string} Image URL
   */
  _getDefaultImage(frameStyle) {
    return GlassesService.FRAME_STYLE_IMAGES[frameStyle] || GlassesService.FRAME_STYLE_IMAGES['classic'];
  }

  /**
   * Initialize D.C. resources data
   * @private
   * @returns {Object} D.C. resources
   */
  _initializeDCResources() {
    return Object.freeze({
      medicaid_providers: Object.freeze([
        Object.freeze({
          name: 'DC Medicaid Vision Benefits',
          description: 'Covers eye exams and glasses for Medicaid recipients',
          phone: '1-800-635-1663',
          website: 'https://dhcf.dc.gov'
        }),
        Object.freeze({
          name: 'Martha\'s Table Eye Care',
          description: 'Free eye exams and glasses for low-income families',
          address: '2114 14th St NW, Washington, DC 20009',
          phone: '(202) 328-6608'
        })
      ]),
      discount_programs: Object.freeze([
        Object.freeze({
          name: 'Warby Parker Pupils Project',
          description: 'Provides glasses to students and low-income individuals',
          eligibility: 'Students and income-qualified individuals'
        }),
        Object.freeze({
          name: 'OneSight',
          description: 'Mobile clinics providing free eye care in D.C.',
          website: 'https://onesight.org'
        })
      ]),
      local_stores: Object.freeze([
        Object.freeze({
          name: 'LensCrafters - Dupont Circle',
          address: '1150 Connecticut Ave NW, Washington, DC 20036',
          phone: '(202) 822-2020'
        }),
        Object.freeze({
          name: 'Pearle Vision - Columbia Heights',
          address: '3100 14th St NW, Washington, DC 20010',
          phone: '(202) 387-7327'
        })
      ])
    });
  }

  /**
   * Validate D.C. zip code
   * @param {string} zipCode - Zip code to validate
   * @returns {boolean} True if valid D.C. zip code
   */
  validateDCZipCode(zipCode) {
    if (typeof zipCode !== 'string') return false;
    return GlassesService.VALID_DC_ZIP_CODES.has(zipCode.trim());
  }

  /**
   * Validate input parameters
   * @private
   * @param {number} householdSize - Household size
   * @param {number} annualIncome - Annual income
   * @param {string} zipCode - Zip code
   * @throws {Error} If validation fails
   */
  _validateInputs(householdSize, annualIncome, zipCode) {
    const errors = [];

    if (!Number.isInteger(householdSize) || householdSize < 1 || householdSize > 15) {
      errors.push("Household size must be between 1 and 15 people");
    }

    if (!Number.isInteger(annualIncome) || annualIncome < 0) {
      errors.push("Annual income must be a positive number");
    }

    if (!this.validateDCZipCode(zipCode)) {
      errors.push(`Invalid D.C. zip code: ${zipCode}. Must be a valid D.C. zip code (e.g., 20001, 20009, 20036)`);
    }

    if (errors.length > 0) {
      throw new Error(errors.join('; '));
    }
  }

  /**
   * Determine eligibility tier based on income and household size
   * @private
   * @param {number} annualIncome - Annual income
   * @param {number} householdSize - Household size
   * @returns {Object} Tier configuration
   */
  _determineTier(annualIncome, householdSize) {
    const medicaidLimit = GlassesService.MEDICAID_INCOME_LIMITS[Math.min(householdSize, 8)];
    
    for (const [tierKey, config] of Object.entries(GlassesService.TIER_CONFIG)) {
      if (tierKey === 'ANY_INCOME') continue; // Handle this last
      
      const limit = medicaidLimit * config.multiplier;
      if (annualIncome <= limit) {
        return { ...config, medicaidLimit };
      }
    }
    
    return { ...GlassesService.TIER_CONFIG.ANY_INCOME, medicaidLimit };
  }

  /**
   * Assess eligibility for glasses assistance programs
   * @param {number} householdSize - Number of people in household
   * @param {number} annualIncome - Annual household income
   * @param {string} zipCode - D.C. zip code
   * @returns {Object} Eligibility information
   * @throws {Error} If inputs are invalid
   */
  assessEligibility(householdSize, annualIncome, zipCode) {
    // Cache key for performance
    const cacheKey = `eligibility-${householdSize}-${annualIncome}-${zipCode}`;
    if (this._cache.has(cacheKey)) {
      return this._cache.get(cacheKey);
    }

    this._validateInputs(householdSize, annualIncome, zipCode);

    const tierConfig = this._determineTier(annualIncome, householdSize);
    
    // Get relevant resources
    const resources = this._getRelevantResources(tierConfig.tier);

    const eligibility = Object.freeze({
      tier: tierConfig.tier,
      tierName: tierConfig.name,
      budgetRange: [...tierConfig.budgetRange], // Copy array
      householdSize,
      annualIncome,
      zipCode,
      medicaidLimit: tierConfig.medicaidLimit,
      resources,
      assessedAt: new Date().toISOString()
    });

    // Cache the result
    this._cache.set(cacheKey, eligibility);
    
    return eligibility;
  }

  /**
   * Get relevant resources based on tier
   * @private
   * @param {string} tier - Eligibility tier
   * @returns {Array} Relevant resources
   */
  _getRelevantResources(tier) {
    const allResources = [
      ...this._dcResources.discount_programs,
      ...this._dcResources.local_stores
    ];

    if (tier === 'medicaid_eligible') {
      return [
        ...this._dcResources.medicaid_providers,
        ...allResources
      ];
    }

    return allResources;
  }

  /**
   * Get personalized glasses recommendations
   * @param {Object} eligibility - Result from assessEligibility()
   * @returns {Object} Personalized recommendations
   * @throws {Error} If eligibility is invalid
   */
  getPersonalizedRecommendations(eligibility) {
    if (!eligibility || !eligibility.budgetRange) {
      throw new Error('Invalid eligibility data provided');
    }

    const cacheKey = `recommendations-${eligibility.tier}-${eligibility.budgetRange.join('-')}`;
    if (this._cache.has(cacheKey)) {
      return this._cache.get(cacheKey);
    }

    const [budgetMin, budgetMax] = eligibility.budgetRange;
    const tier = eligibility.tier;

    // Filter and sort glasses within budget
    const suitableGlasses = this._glassesData
      .filter(glasses => glasses.numeric_price >= budgetMin && glasses.numeric_price <= budgetMax)
      .sort((a, b) => a.numeric_price - b.numeric_price);

    const recommendations = Object.freeze({
      tier,
      tierName: eligibility.tierName,
      budgetRange: `$${budgetMin}-$${budgetMax}`,
      totalOptions: suitableGlasses.length,
      topRecommendations: Object.freeze(suitableGlasses.slice(0, 10)),
      allRecommendations: Object.freeze([...suitableGlasses]),
      priorityMessage: this._getPriorityMessage(tier),
      generatedAt: new Date().toISOString()
    });

    this._cache.set(cacheKey, recommendations);
    return recommendations;
  }

  /**
   * Get priority message based on tier
   * @private
   * @param {string} tier - Eligibility tier
   * @returns {string} Priority message
   */
  _getPriorityMessage(tier) {
    const messages = {
      'medicaid_eligible': "🏥 You may qualify for free glasses through D.C. Medicaid! Contact the providers listed below first.",
      'low_income_gap': "💙 You're in the coverage gap - check discount programs and consider the most affordable options below.",
      'moderate_income': "💚 You have moderate income flexibility - focus on value and quality.",
      'any_income': "✨ You have budget flexibility - explore all options for the best fit!"
    };

    return messages[tier] || messages['any_income'];
  }

  /**
   * Get all glasses data (read-only)
   * @returns {Array} All glasses data
   */
  getAllGlasses() {
    return [...this._glassesData]; // Return copy to prevent mutation
  }

  /**
   * Get glasses by price range
   * @param {number} minPrice - Minimum price
   * @param {number} maxPrice - Maximum price
   * @returns {Array} Filtered glasses
   */
  getGlassesByPriceRange(minPrice, maxPrice) {
    if (typeof minPrice !== 'number' || typeof maxPrice !== 'number' || minPrice < 0 || maxPrice < minPrice) {
      throw new Error('Invalid price range provided');
    }

    return this._glassesData.filter(glasses => 
      glasses.numeric_price >= minPrice && glasses.numeric_price <= maxPrice
    );
  }

  /**
   * Get glasses by frame style
   * @param {string} frameStyle - Frame style to filter by
   * @returns {Array} Filtered glasses
   */
  getGlassesByFrameStyle(frameStyle) {
    if (frameStyle === 'all') return this.getAllGlasses();
    
    if (typeof frameStyle !== 'string') {
      throw new Error('Frame style must be a string');
    }

    return this._glassesData.filter(glasses => 
      glasses.frame_style.toLowerCase() === frameStyle.toLowerCase()
    );
  }

  /**
   * Get comprehensive statistics about glasses data
   * @returns {Object} Statistics object
   */
  getPriceStatistics() {
    const prices = this._glassesData.map(glasses => glasses.numeric_price);
    
    if (prices.length === 0) {
      return {
        minPrice: 0,
        maxPrice: 0,
        avgPrice: 0,
        totalGlasses: 0,
        medicaidEligibleOptions: 0,
        lowIncomeOptions: 0,
        moderateIncomeOptions: 0
      };
    }

    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const avgPrice = prices.reduce((sum, price) => sum + price, 0) / prices.length;

    return Object.freeze({
      minPrice,
      maxPrice,
      avgPrice: Math.round(avgPrice * 100) / 100,
      totalGlasses: this._glassesData.length,
      medicaidEligibleOptions: prices.filter(p => p <= 50).length,
      lowIncomeOptions: prices.filter(p => p <= 100).length,
      moderateIncomeOptions: prices.filter(p => p > 50 && p <= 200).length
    });
  }

  /**
   * Get frame style distribution
   * @returns {Object} Style counts
   */
  getFrameStyleStatistics() {
    const styleCounts = {};
    
    this._glassesData.forEach(glasses => {
      const style = glasses.frame_style;
      styleCounts[style] = (styleCounts[style] || 0) + 1;
    });

    return Object.freeze(styleCounts);
  }

  /**
   * Format eligibility data for React component
   * @param {Object} eligibility - Eligibility data
   * @returns {Object} Formatted eligibility info
   */
  formatEligibilityForComponent(eligibility) {
    if (!eligibility) return null;

    return Object.freeze({
      level: 'Coverage needs confirmation',
      message: 'Household income and ZIP code alone cannot determine vision coverage or program eligibility. Coverage depends on age, Medicaid or insurance plan, provider participation, prescription needs, and plan-specific rules. Use the official plan or provider to confirm benefits.',
      color: 'text-blue-700 bg-blue-50 border-blue-200',
      showPrograms: false,
      programs: Object.freeze([])
    });
  }

  /**
   * Clear cache (useful for testing or memory management)
   */
  clearCache() {
    this._cache.clear();
  }

  /**
   * Get service health/status information
   * @returns {Object} Service status
   */
  getServiceInfo() {
    return Object.freeze({
      name: 'Glasses Service',
      version: '2.0.0',
      totalGlasses: this._glassesData.length,
      cacheSize: this._cache.size,
      supportedZipCodes: GlassesService.VALID_DC_ZIP_CODES.size,
      lastInitialized: new Date().toISOString()
    });
  }
}

// Create and export singleton instance
const glassesService = new GlassesService();
export default glassesService;