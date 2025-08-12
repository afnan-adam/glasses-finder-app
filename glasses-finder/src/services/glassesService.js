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
        features: 'Square acetate frame, modern design, comfortable fit',
        url: 'https://www.warbyparker.com/eyeglasses/felix/jet-black',
        frame_style: 'square',
        material: 'Acetate'
      },
      {
        site: 'Warby Parker',
        name: 'Hardy',
        numeric_price: 95,
        features: 'Rectangular acetate frame, classic styling, durable construction',
        url: 'https://www.warbyparker.com/eyeglasses/hardy/whiskey-tortoise',
        frame_style: 'rectangular',
        material: 'Acetate'
      },
      {
        site: 'Warby Parker',
        name: 'Percey',
        numeric_price: 95,
        features: 'Metal frame, blue light filtering, adjustable nose pads',
        url: 'https://www.warbyparker.com/eyeglasses/percey/polished-gold',
        frame_style: 'round',  // Percey is round, not square
        material: 'Metal'
      },
      {
        site: 'Warby Parker',
        name: 'Chamberlain',
        numeric_price: 145,
        features: 'Titanium frame, progressive lenses, lightweight design',
        url: 'https://www.warbyparker.com/eyeglasses/chamberlain/brushed-navy',
        frame_style: 'rectangular',  // Chamberlain is rectangular, not aviator
        material: 'Titanium'
      },
      {
        site: 'Warby Parker',
        name: 'Rafael',
        numeric_price: 145,
        features: 'Rounded lenses, slender-yet-sturdy construction, endlessly versatile pairing',
        url: 'https://www.warbyparker.com/eyeglasses/rafael/jet-black',
        frame_style: 'round',
        material: 'Stainless Steel'
      },
      {
        site: 'Warby Parker',
        name: 'Durand',
        numeric_price: 45,
        features: 'Basic acetate frame, single vision, durable construction',
        url: 'https://www.warbyparker.com/eyeglasses/durand/jet-black',
        frame_style: 'square',  // Durand is square
        material: 'Acetate'
      },
      {
        site: 'Warby Parker',
        name: 'Burke',
        numeric_price: 35,
        features: 'Simple plastic frame, reading glasses, comfortable fit',
        url: 'https://www.warbyparker.com/eyeglasses/burke/matte-black',
        frame_style: 'rectangular',  // Burke is rectangular
        material: 'Plastic'
      },
      {
        site: 'Warby Parker',
        name: 'Caldwell',
        numeric_price: 25,
        features: 'Ultra-budget frame, basic lenses, essential eyewear',
        url: 'https://www.warbyparker.com/eyeglasses/caldwell/crystal-clear',
        frame_style: 'round',  // Caldwell is round
        material: 'Plastic'
      },
      // Additional Warby Parker frames across price ranges
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
      image_url: item.image_url || this._getDefaultImage(item.frame_style),
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

    const income = eligibility.annualIncome;
    const size = eligibility.householdSize;
    
    const federalPovertyLevel = 15060 + (size - 1) * 5380;
    const percentage = (income / federalPovertyLevel) * 100;
    
    if (percentage <= 200) {
      return this._createEligibilityResponse('High Assistance', 
        'You may qualify for free or low-cost glasses through D.C. health programs!',
        'text-green-600 bg-green-50 border-green-200',
        this._getHighAssistancePrograms()
      );
    } 
    
    if (percentage <= 400) {
      return this._createEligibilityResponse('Moderate Assistance', 
        'You may qualify for discounted glasses and vision care.',
        'text-blue-600 bg-blue-50 border-blue-200',
        this._getModerateAssistancePrograms()
      );
    }
    
    return this._createEligibilityResponse('Standard Options', 
      'Check out our affordable glasses options below!',
      'text-purple-600 bg-purple-50 border-purple-200'
    );
  }

  /**
   * Create eligibility response object
   * @private
   */
  _createEligibilityResponse(level, message, color, programs = []) {
    return Object.freeze({
      level,
      message,
      color,
      showPrograms: programs.length > 0,
      programs: Object.freeze(programs)
    });
  }

  /**
   * Get high assistance programs
   * @private
   */
  _getHighAssistancePrograms() {
    return [
      {
        name: 'DC Medicaid Vision Benefits',
        contact: '(202) 727-5355',
        website: 'dhcf.dc.gov',
        description: 'Comprehensive eye exams and glasses coverage for Medicaid recipients'
      },
      {
        name: 'Warby Parker Pupils Project',
        contact: '(888) 492-7297',
        website: 'warbyparker.com/pupils-project',
        description: 'Free glasses for students in need through school partnerships and community programs'
      },
      {
        name: 'Unity Health Care Vision Services',
        contact: '(202) 469-4699',
        website: 'unityhealthcare.org',
        description: 'Sliding fee scale for low-income residents, includes eye exams and glasses'
      },
      {
        name: 'Lions Club SightFirst Program',
        contact: '(202) 331-7589',
        website: 'dclions.org',
        description: 'Free eye screenings and glasses for qualifying low-income individuals'
      }
    ];
  }

  /**
   * Get moderate assistance programs
   * @private
   */
  _getModerateAssistancePrograms() {
    return [
      {
        name: 'DC Health Link Vision Plans',
        contact: '(855) 532-5465',
        website: 'dchealthlink.com',
        description: 'Subsidized vision insurance plans with glasses benefits'
      },
      {
        name: 'Walmart Vision Center',
        contact: '(202) 635-1066',
        website: 'walmart.com/vision',
        description: 'Low-cost eye exams starting at $75, affordable glasses from $16'
      }
    ];
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