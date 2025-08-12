/**
 * Glasses Service - Integrates MCP server functionality into React
 * 
 * This service provides eligibility assessment, personalized recommendations,
 * and data management for affordable glasses in Washington D.C.
 * 
 * @class GlassesService
 */
class GlassesService {
  // Constants for better maintainability
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

  static TIER_MULTIPLIERS = Object.freeze({
    MEDICAID_ELIGIBLE: 1,
    LOW_INCOME_GAP: 2,
    MODERATE_INCOME: 3
  });

  static BUDGET_RANGES = Object.freeze({
    MEDICAID_ELIGIBLE: [0, 50],
    LOW_INCOME_GAP: [0, 100],
    MODERATE_INCOME: [50, 200],
    ANY_INCOME: [0, 500]
  });

  constructor() {
    this._glassesData = this._initializeGlassesData();
    this._dcResources = this._initializeDCResources();
  }

  /**
   * Initialize glasses data with validation
   * @private
   * @returns {Array} Validated glasses data
   */
  _initializeGlassesData() {
    return [
      this._createGlassesItem({
        site: 'Warby Parker',
        name: 'Griffin',
        price: '$95',
        numeric_price: 95,
        features: 'Acetate frame, prescription lenses available, anti-reflective coating',
        url: 'https://www.warbyparker.com/eyeglasses/griffin/whiskey-tortoise',
        image_url: 'https://via.placeholder.com/300x200/f0f0f0/333333?text=Round+Frame',
        frame_style: 'round',
        material: 'Acetate'
      }),
      {
        site: 'Warby Parker',
        name: 'Percey',
        price: '$95',
        numeric_price: 95,
        features: 'Metal frame, blue light filtering, adjustable nose pads',
        url: 'https://www.warbyparker.com/eyeglasses/percey/polished-gold',
        image_url: 'https://via.placeholder.com/300x200/e8e8e8/444444?text=Square+Frame',
        frame_style: 'square',
        material: 'Metal'
      },
      {
        site: 'Warby Parker',
        name: 'Chamberlain',
        price: '$145',
        numeric_price: 145,
        features: 'Titanium frame, progressive lenses, lightweight design',
        url: 'https://www.warbyparker.com/eyeglasses/chamberlain/brushed-navy',
        image_url: 'https://via.placeholder.com/300x200/f5f5f5/555555?text=Aviator+Frame',
        frame_style: 'aviator',
        material: 'Titanium'
      },
      {
        site: 'Warby Parker',
        name: 'Durand',
        price: '$45',
        numeric_price: 45,
        features: 'Basic acetate frame, single vision, durable construction',
        url: 'https://www.warbyparker.com/eyeglasses/durand/jet-black',
        image_url: 'https://via.placeholder.com/300x200/f2f2f2/666666?text=Rectangular',
        frame_style: 'rectangular',
        material: 'Acetate'
      },
      {
        site: 'Warby Parker',
        name: 'Burke',
        price: '$35',
        numeric_price: 35,
        features: 'Simple plastic frame, reading glasses, comfortable fit',
        url: 'https://www.warbyparker.com/eyeglasses/burke/matte-black',
        image_url: 'https://via.placeholder.com/300x200/f0f0f0/333333?text=Round+Frame',
        frame_style: 'round',
        material: 'Plastic'
      },
      {
        site: 'Warby Parker',
        name: 'Caldwell',
        price: '$25',
        numeric_price: 25,
        features: 'Ultra-budget frame, basic lenses, essential eyewear',
        url: 'https://www.warbyparker.com/eyeglasses/caldwell/crystal-clear',
        image_url: 'https://via.placeholder.com/300x200/eeeeee/333333?text=Classic+Frame',
        frame_style: 'classic',
        material: 'Plastic'
      },
      {
        site: 'Warby Parker',
        name: 'Haskell',
        price: '$65',
        numeric_price: 65,
        features: 'Mid-range acetate, anti-scratch coating, stylish design',
        url: 'https://www.warbyparker.com/eyeglasses/haskell/rosewater',
        image_url: 'https://via.placeholder.com/300x200/f8f8f8/444444?text=Cat+Eye',
        frame_style: 'cat-eye',
        material: 'Acetate'
      },
      {
        site: 'Warby Parker',
        name: 'Welty',
        price: '$85',
        numeric_price: 85,
        features: 'Premium acetate frame, prescription ready, modern style',
        url: 'https://www.warbyparker.com/eyeglasses/welty/eastern-bluebird-fade',
        image_url: 'https://via.placeholder.com/300x200/e8e8e8/444444?text=Square+Frame',
        frame_style: 'square',
        material: 'Acetate'
      }
    ];

    // D.C. resources from the MCP server
    this.dcResources = {
      medicaid_providers: [
        {
          name: 'DC Medicaid Vision Benefits',
          description: 'Covers eye exams and glasses for Medicaid recipients',
          phone: '1-800-635-1663',
          website: 'https://dhcf.dc.gov'
        },
        {
          name: 'Martha\'s Table Eye Care',
          description: 'Free eye exams and glasses for low-income families',
          address: '2114 14th St NW, Washington, DC 20009',
          phone: '(202) 328-6608'
        }
      ],
      discount_programs: [
        {
          name: 'Warby Parker Pupils Project',
          description: 'Provides glasses to students and low-income individuals',
          eligibility: 'Students and income-qualified individuals'
        },
        {
          name: 'OneSight',
          description: 'Mobile clinics providing free eye care in D.C.',
          website: 'https://onesight.org'
        }
      ],
      local_stores: [
        {
          name: 'LensCrafters - Dupont Circle',
          address: '1150 Connecticut Ave NW, Washington, DC 20036',
          phone: '(202) 822-2020'
        },
        {
          name: 'Pearle Vision - Columbia Heights',
          address: '3100 14th St NW, Washington, DC 20010',
          phone: '(202) 387-7327'
        }
      ]
    };
  }

  // Validate D.C. zip code
  validateDCZipCode(zipCode) {
    const dcZipCodes = new Set([
      '20001', '20002', '20003', '20004', '20005', '20006', '20007', '20008',
      '20009', '20010', '20011', '20012', '20015', '20016', '20017', '20018',
      '20019', '20020', '20024', '20026', '20027', '20029', '20030', '20032',
      '20036', '20037', '20052', '20053', '20056', '20057', '20064', '20066',
      '20071', '20090', '20091', '20201', '20204', '20228', '20240', '20260'
    ]);
    
    return dcZipCodes.has(zipCode);
  }

  // Assess eligibility for glasses assistance (mirrors Python version)
  assessEligibility(householdSize, annualIncome, zipCode) {
    // Validate inputs
    if (!Number.isInteger(householdSize) || householdSize < 1 || householdSize > 15) {
      throw new Error("Household size must be between 1 and 15 people");
    }

    if (!Number.isInteger(annualIncome) || annualIncome < 0) {
      throw new Error("Annual income must be a positive number");
    }

    if (!this.validateDCZipCode(zipCode)) {
      throw new Error(`Invalid D.C. zip code: ${zipCode}. Must be a valid D.C. zip code (e.g., 20001, 20009, 20036)`);
    }

    // Calculate income tiers
    const medicaidLimit = this.MEDICAID_INCOME_LIMITS[Math.min(householdSize, 8)];
    const lowIncomeGapLimit = medicaidLimit * 2; // 200% of Medicaid limit
    const moderateIncomeLimit = medicaidLimit * 3; // 300% of Medicaid limit

    let tier, tierName, budgetRange;

    if (annualIncome <= medicaidLimit) {
      tier = 'medicaid_eligible';
      tierName = 'Medicaid Eligible';
      budgetRange = [0, 50];
    } else if (annualIncome <= lowIncomeGapLimit) {
      tier = 'low_income_gap';
      tierName = 'Low-Income Gap';
      budgetRange = [0, 100];
    } else if (annualIncome <= moderateIncomeLimit) {
      tier = 'moderate_income';
      tierName = 'Moderate Income';
      budgetRange = [50, 200];
    } else {
      tier = 'any_income';
      tierName = 'Any Income';
      budgetRange = [0, 500];
    }

    // Get relevant resources
    let resources = [];
    if (tier === 'medicaid_eligible') {
      resources = resources.concat(this.dcResources.medicaid_providers);
    }
    
    resources = resources.concat(
      this.dcResources.discount_programs,
      this.dcResources.local_stores
    );

    return {
      tier,
      tierName,
      budgetRange,
      householdSize,
      annualIncome,
      zipCode,
      medicaidLimit,
      resources
    };
  }

  // Get personalized recommendations (mirrors Python version)
  getPersonalizedRecommendations(eligibility) {
    const [budgetMin, budgetMax] = eligibility.budgetRange;
    const tier = eligibility.tier;

    // Filter glasses within budget
    const suitableGlasses = this.glassesData.filter(glasses => {
      const price = glasses.numeric_price;
      return price >= budgetMin && price <= budgetMax;
    });

    // Sort by price (most affordable first)
    suitableGlasses.sort((a, b) => a.numeric_price - b.numeric_price);

    let priorityMessage;
    if (tier === 'medicaid_eligible') {
      priorityMessage = "🏥 You may qualify for free glasses through D.C. Medicaid! Contact the providers listed below first.";
    } else if (tier === 'low_income_gap') {
      priorityMessage = "💙 You're in the coverage gap - check discount programs and consider the most affordable options below.";
    } else if (tier === 'moderate_income') {
      priorityMessage = "💚 You have moderate income flexibility - focus on value and quality.";
    } else {
      priorityMessage = "✨ You have budget flexibility - explore all options for the best fit!";
    }

    return {
      tier,
      tierName: eligibility.tierName,
      budgetRange: `$${budgetMin}-$${budgetMax}`,
      totalOptions: suitableGlasses.length,
      topRecommendations: suitableGlasses.slice(0, 10), // Top 10 most affordable
      priorityMessage,
      allRecommendations: suitableGlasses
    };
  }

  // Get all glasses data
  getAllGlasses() {
    return this.glassesData;
  }

  // Get glasses by price range
  getGlassesByPriceRange(minPrice, maxPrice) {
    return this.glassesData.filter(glasses => 
      glasses.numeric_price >= minPrice && glasses.numeric_price <= maxPrice
    );
  }

  // Get glasses by frame style
  getGlassesByFrameStyle(frameStyle) {
    if (frameStyle === 'all') return this.glassesData;
    
    return this.glassesData.filter(glasses => 
      glasses.frame_style.toLowerCase() === frameStyle.toLowerCase()
    );
  }

  // Get price statistics
  getPriceStatistics() {
    const prices = this.glassesData.map(glasses => glasses.numeric_price);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;

    // Count by income tiers
    const medicaidCount = prices.filter(p => p <= 50).length;
    const lowIncomeCount = prices.filter(p => p <= 100).length;
    const moderateCount = prices.filter(p => p > 50 && p <= 200).length;

    return {
      minPrice,
      maxPrice,
      avgPrice: Math.round(avgPrice * 100) / 100,
      totalGlasses: this.glassesData.length,
      medicaidEligibleOptions: medicaidCount,
      lowIncomeOptions: lowIncomeCount,
      moderateIncomeOptions: moderateCount
    };
  }

  // Get frame style statistics
  getFrameStyleStatistics() {
    const styleCounts = {};
    this.glassesData.forEach(glasses => {
      const style = glasses.frame_style;
      styleCounts[style] = (styleCounts[style] || 0) + 1;
    });

    return styleCounts;
  }

  // Convert eligibility data to the format expected by the React component
  formatEligibilityForComponent(eligibility) {
    const income = eligibility.annualIncome;
    const size = eligibility.householdSize;
    
    const federalPovertyLevel = 15060 + (size - 1) * 5380;
    const percentage = (income / federalPovertyLevel) * 100;
    
    if (percentage <= 200) {
      return { 
        level: 'High Assistance', 
        message: 'You may qualify for free or low-cost glasses through D.C. health programs!',
        color: 'text-green-600 bg-green-50 border-green-200',
        showPrograms: true,
        programs: [
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
        ]
      };
    } else if (percentage <= 400) {
      return { 
        level: 'Moderate Assistance', 
        message: 'You may qualify for discounted glasses and vision care.',
        color: 'text-blue-600 bg-blue-50 border-blue-200',
        showPrograms: true,
        programs: [
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
        ]
      };
    } else {
      return { 
        level: 'Standard Options', 
        message: 'Check out our affordable glasses options below!',
        color: 'text-purple-600 bg-purple-50 border-purple-200',
        showPrograms: false
      };
    }
  }
}

// Create and export a singleton instance
const glassesService = new GlassesService();
export default glassesService;