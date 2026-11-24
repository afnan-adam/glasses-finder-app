import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Search, Filter, DollarSign, MapPin, Users, Eye, Phone, Globe, Info } from 'lucide-react';
import glassesService from '../services/glassesService';
import GlassesImageCard from './ui/GlassesImageCard';

const GlassesFinder = () => {
  const [currentStep, setCurrentStep] = useState('welcome');
  const [formData, setFormData] = useState({
    householdSize: '',
    income: '',
    zipCode: '',
    budget: ''
  });
  const incomeInputRef = useRef(null);
  const zipCodeInputRef = useRef(null);
  const [filters, setFilters] = useState({
    priceRange: 'all',
    frameStyle: 'all'
  });
  const [eligibilityData, setEligibilityData] = useState(null);
  const [recommendations, setRecommendations] = useState(null);
  const [generatedImages, setGeneratedImages] = useState(new Map());

  // Income ranges for MVP dropdown
  const incomeRanges = [
    { label: "Under $25,000", value: "20000" },
    { label: "$25,000 - $35,000", value: "30000" },
    { label: "$35,000 - $50,000", value: "42500" },
    { label: "$50,000 - $75,000", value: "62500" },
    { label: "$75,000 - $100,000", value: "87500" },
    { label: "$100,000 - $150,000", value: "125000" },
    { label: "Over $150,000", value: "175000" }
  ];

  // Popular D.C. ZIP codes for MVP dropdown
  const dcZipCodes = [
    '20001', '20002', '20003', '20004', '20005', '20006', '20007', '20008',
    '20009', '20010', '20011', '20012', '20015', '20016', '20017', '20018',
    '20019', '20020', '20024', '20036', '20037'
  ];

  // Budget ranges for glasses
  const budgetRanges = [
    { label: "Less than $50", value: "under50" },
    { label: "$50 - $75", value: "50-75" },
    { label: "$75 - $100", value: "75-100" },
    { label: "$100 - $150", value: "100-150" },
    { label: "$150 - $200", value: "150-200" },
    { label: "$200+", value: "200plus" }
  ];

  // Real product images - using placeholders for now
  const getRealProductImage = (glasses) => {
    console.log('Getting image for glasses:', glasses);
    
    // Create a unique placeholder for each glasses frame
    const frameName = glasses.name || 'Unknown';
    const frameStyle = glasses.frame_style || 'Classic';
    const displayText = `${frameName} ${frameStyle}`;
    
    return `https://via.placeholder.com/400x300/e5e7eb/374151?text=${encodeURIComponent(displayText)}`;
  };

  // Generate search URLs for glasses
  const getSearchUrls = (glasses) => {
    // Special case for Felix - search for specific colorway
    if (glasses.name === 'Felix' && glasses.site === 'Warby Parker') {
      const felixQuery = encodeURIComponent('Felix Eyeglasses in Pacific Crystal');
      return {
        google: `https://www.google.com/search?q=${felixQuery}`,
        googleShopping: `https://www.google.com/search?q=${felixQuery}&tbm=shop`,
        directSite: `https://warbyparker.com/search?q=${encodeURIComponent('Felix Pacific Crystal')}`,
        modelSearch: `https://www.google.com/search?q=${felixQuery}`,
        priceComparison: `https://www.google.com/search?q=${felixQuery}+price+buy+online&tbm=shop`
      };
    }

    // Default search for other glasses
    const baseQuery = `${glasses.site} ${glasses.name} ${glasses.frame_style} glasses`;
    const encodedQuery = encodeURIComponent(baseQuery);
    const modelQuery = encodeURIComponent(`"${glasses.name}" ${glasses.site} glasses`);
    
    return {
      google: `https://www.google.com/search?q=${encodedQuery}`,
      googleShopping: `https://www.google.com/search?q=${encodedQuery}&tbm=shop`,
      directSite: `https://${glasses.site.toLowerCase().replace(' ', '')}.com/search?q=${encodeURIComponent(glasses.name)}`,
      modelSearch: `https://www.google.com/search?q=${modelQuery}`,
      priceComparison: `https://www.google.com/search?q=${encodedQuery}+price+buy+online&tbm=shop`
    };
  };

  // Get real glasses data from the service
  const allGlassesData = glassesService.getAllGlasses();

  const getFrameImage = (style) => {
    const frameImages = {
      'Round': (
        <svg viewBox="0 0 200 80" className="w-20 h-12">
          <circle cx="60" cy="40" r="25" fill="none" stroke="currentColor" strokeWidth="3"/>
          <circle cx="140" cy="40" r="25" fill="none" stroke="currentColor" strokeWidth="3"/>
          <line x1="85" y1="40" x2="115" y2="40" stroke="currentColor" strokeWidth="2"/>
          <line x1="35" y1="40" x2="15" y2="45" stroke="currentColor" strokeWidth="2"/>
          <line x1="165" y1="40" x2="185" y2="45" stroke="currentColor" strokeWidth="2"/>
        </svg>
      ),
      'Square': (
        <svg viewBox="0 0 200 80" className="w-20 h-12">
          <rect x="35" y="20" width="50" height="40" fill="none" stroke="currentColor" strokeWidth="3" rx="3"/>
          <rect x="115" y="20" width="50" height="40" fill="none" stroke="currentColor" strokeWidth="3" rx="3"/>
          <line x1="85" y1="40" x2="115" y2="40" stroke="currentColor" strokeWidth="2"/>
          <line x1="35" y1="40" x2="15" y2="45" stroke="currentColor" strokeWidth="2"/>
          <line x1="165" y1="40" x2="185" y2="45" stroke="currentColor" strokeWidth="2"/>
        </svg>
      ),
      'Rectangular': (
        <svg viewBox="0 0 200 80" className="w-20 h-12">
          <rect x="30" y="25" width="60" height="30" fill="none" stroke="currentColor" strokeWidth="3" rx="5"/>
          <rect x="110" y="25" width="60" height="30" fill="none" stroke="currentColor" strokeWidth="3" rx="5"/>
          <line x1="90" y1="40" x2="110" y2="40" stroke="currentColor" strokeWidth="2"/>
          <line x1="30" y1="40" x2="10" y2="45" stroke="currentColor" strokeWidth="2"/>
          <line x1="170" y1="40" x2="190" y2="45" stroke="currentColor" strokeWidth="2"/>
        </svg>
      ),
      'Aviator': (
        <svg viewBox="0 0 200 80" className="w-20 h-12">
          <path d="M 35 50 Q 60 15 85 50" fill="none" stroke="currentColor" strokeWidth="3"/>
          <path d="M 115 50 Q 140 15 165 50" fill="none" stroke="currentColor" strokeWidth="3"/>
          <line x1="85" y1="35" x2="115" y2="35" stroke="currentColor" strokeWidth="2"/>
          <line x1="35" y1="40" x2="15" y2="45" stroke="currentColor" strokeWidth="2"/>
          <line x1="165" y1="40" x2="185" y2="45" stroke="currentColor" strokeWidth="2"/>
        </svg>
      ),
      'Cat-Eye': (
        <svg viewBox="0 0 200 80" className="w-20 h-12">
          <path d="M 30 45 Q 45 25 70 35 Q 80 40 85 45" fill="none" stroke="currentColor" strokeWidth="3"/>
          <path d="M 115 45 Q 120 40 130 35 Q 155 25 170 45" fill="none" stroke="currentColor" strokeWidth="3"/>
          <line x1="85" y1="42" x2="115" y2="42" stroke="currentColor" strokeWidth="2"/>
          <line x1="30" y1="42" x2="10" y2="47" stroke="currentColor" strokeWidth="2"/>
          <line x1="170" y1="42" x2="190" y2="47" stroke="currentColor" strokeWidth="2"/>
        </svg>
      ),
      'Classic': (
        <svg viewBox="0 0 200 80" className="w-20 h-12">
          <ellipse cx="60" cy="40" rx="30" ry="20" fill="none" stroke="currentColor" strokeWidth="3"/>
          <ellipse cx="140" cy="40" rx="30" ry="20" fill="none" stroke="currentColor" strokeWidth="3"/>
          <line x1="90" y1="40" x2="110" y2="40" stroke="currentColor" strokeWidth="2"/>
          <line x1="30" y1="40" x2="10" y2="45" stroke="currentColor" strokeWidth="2"/>
          <line x1="170" y1="40" x2="190" y2="45" stroke="currentColor" strokeWidth="2"/>
        </svg>
      )
    };
    
    return frameImages[style] || frameImages['Classic'];
  };

  // Start with the complete catalog. Eligibility tier informs guidance,
  // but should not hide frames a person may still choose to explore.
  const displayGlasses = allGlassesData;

  const budgetBounds = {
    under50: [0, 49.99],
    '50-75': [50, 75],
    '75-100': [75, 100],
    '100-150': [100, 150],
    '150-200': [150, 200],
    '200plus': [200, Infinity]
  };
  const selectedBudgetBounds = budgetBounds[formData.budget];

  const glassesMatchingOtherFilters = displayGlasses.filter(glasses => {
    const priceMatch = filters.priceRange === 'all' ||
      (filters.priceRange === 'under50' && glasses.numeric_price < 50) ||
      (filters.priceRange === '50-100' && glasses.numeric_price >= 50 && glasses.numeric_price <= 100) ||
      (filters.priceRange === 'over100' && glasses.numeric_price > 100);
    const styleMatch = filters.frameStyle === 'all' ||
      glasses.frame_style.toLowerCase() === filters.frameStyle.toLowerCase();
    return priceMatch && styleMatch;
  });

  const exactBudgetMatches = selectedBudgetBounds
    ? glassesMatchingOtherFilters.filter(glasses =>
        glasses.numeric_price >= selectedBudgetBounds[0] &&
        glasses.numeric_price <= selectedBudgetBounds[1]
      )
    : glassesMatchingOtherFilters;

  // If the catalog has no exact match for the chosen budget, show up to
  // three nearest alternatives rather than an empty results page.
  const filteredGlasses = exactBudgetMatches.length > 0 || !selectedBudgetBounds
    ? exactBudgetMatches
    : [...glassesMatchingOtherFilters]
        .sort((a, b) => {
          const distance = price => price < selectedBudgetBounds[0]
            ? selectedBudgetBounds[0] - price
            : price > selectedBudgetBounds[1]
              ? price - selectedBudgetBounds[1]
              : 0;
          return distance(a.numeric_price) - distance(b.numeric_price);
        })
        .slice(0, 3);

  const showingBudgetAlternatives = Boolean(
    selectedBudgetBounds &&
    exactBudgetMatches.length === 0 &&
    filteredGlasses.length > 0
  );

  const getEligibilityMessage = () => {
    if (!eligibilityData) return null;
    return glassesService.formatEligibilityForComponent(eligibilityData);
  };

  // Handle form submission using the real service
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    console.log('Form submitted with data:', formData);
    
    try {
      const householdSize = parseInt(formData.householdSize);
      const annualIncome = parseInt(formData.income);
      const zipCode = formData.zipCode;

      const budget = formData.budget;
      console.log('Parsed values:', { householdSize, annualIncome, zipCode, budget });

      // Assess eligibility using the service
      const eligibility = glassesService.assessEligibility(householdSize, annualIncome, zipCode);
      console.log('Eligibility result:', eligibility);
      setEligibilityData(eligibility);

      // Get personalized recommendations
      const recs = glassesService.getPersonalizedRecommendations(eligibility);
      console.log('Recommendations:', recs);
      setRecommendations(recs);

      // Navigate to results
      console.log('Navigating to results...');
      setCurrentStep('results');
    } catch (error) {
      console.error('Form submission error:', error);
      alert(`Error: ${error.message}`);
    }
  };

  // Landing page: explain the product before asking users for information.
  const WelcomeScreen = () => (
    <main className="min-h-screen clearsight-landing">
      <header className="clearsight-nav">
        <a className="clearsight-brand" href="#home" aria-label="ClearSight DC home">
          <span className="clearsight-brand-mark"><Eye size={21} /></span>
          <span>ClearSight <strong>D.C.</strong></span>
        </a>
        <span className="clearsight-location"><MapPin size={15} /> Washington, D.C.</span>
      </header>

      <section className="clearsight-hero" id="home">
        <div className="clearsight-hero-copy">
          <span className="clearsight-eyebrow">A clearer path to affordable eyewear</span>
          <h1>Good vision should fit your <em>life</em> and your budget.</h1>
          <p className="clearsight-hero-description">
            Explore eyewear options and learn about vision assistance resources
            in the D.C. area. Start with a few details about your household.
          </p>
          <div className="clearsight-hero-actions">
            <button
              onClick={() => setCurrentStep('form')}
              className="clearsight-primary-cta"
            >
              Explore my options <span aria-hidden="true">→</span>
            </button>
            <span className="clearsight-time-note">A short, guided questionnaire</span>
          </div>
          <div className="clearsight-value-points">
            <div><Users size={18} /><span>Household-aware guidance</span></div>
            <div><DollarSign size={18} /><span>Options across budgets</span></div>
            <div><MapPin size={18} /><span>D.C.-focused resources</span></div>
          </div>
        </div>

        <aside className="clearsight-how-card" aria-label="How ClearSight works">
          <div className="clearsight-card-topline">
            <span className="clearsight-card-icon"><Eye size={22} /></span>
            <span className="clearsight-card-kicker">YOUR NEXT STEPS</span>
          </div>
          <h2>Finding a place to start can be easier.</h2>
          <p className="clearsight-card-intro">ClearSight helps you explore three things:</p>
          <ol className="clearsight-steps">
            <li>
              <span className="clearsight-step-number">01</span>
              <span><strong>Share a little context</strong><small>Household size, income range, location and budget.</small></span>
            </li>
            <li>
              <span className="clearsight-step-number">02</span>
              <span><strong>Review possible resources</strong><small>See assistance information to investigate further.</small></span>
            </li>
            <li>
              <span className="clearsight-step-number">03</span>
              <span><strong>Explore eyewear options</strong><small>Compare frames and find options to research.</small></span>
            </li>
          </ol>
          <p className="clearsight-disclaimer">
            Information is a starting point, not a guarantee of program eligibility or coverage.
          </p>
        </aside>
      </section>

      <footer className="clearsight-landing-footer">
        <span>ClearSight D.C.</span>
        <span>Helping D.C. residents explore affordable vision options.</span>
      </footer>
    </main>
  );

  const EligibilityForm = () => (
    <main className="min-h-screen clearsight-form-page">
      <header className="clearsight-form-nav">
        <a className="clearsight-brand" href="#home" onClick={(e) => { e.preventDefault(); setCurrentStep('welcome'); }}>
          <span className="clearsight-brand-mark"><Eye size={21} /></span>
          <span>ClearSight <strong>D.C.</strong></span>
        </a>
        <button type="button" className="clearsight-back-link" onClick={() => setCurrentStep('welcome')}>
          ← Back to overview
        </button>
      </header>

      <section className="clearsight-form-layout">
        <div className="clearsight-form-intro">
          <span className="clearsight-eyebrow">LET'S GET STARTED</span>
          <h1>A few details help us point you in the right direction.</h1>
          <p>
            Answer four quick questions so we can show you D.C. vision resources
            and eyewear options to explore.
          </p>
          <div className="clearsight-form-progress" aria-label="Questionnaire progress">
            <span className="clearsight-progress-active"></span>
            <span></span><span></span><span></span>
          </div>
          <small>Four questions · Your answers shape the results</small>
          <div className="clearsight-privacy-note">
            <Info size={17} />
            <span>Your answers are used to shape the results shown in this session.</span>
          </div>
        </div>

        <div className="clearsight-form-card">
          <div className="clearsight-form-card-heading">
            <span className="clearsight-form-step">01 — HOUSEHOLD</span>
            <h2>Tell us about your household</h2>
            <p>These details help us estimate which assistance resources may be relevant.</p>
          </div>

          <form onSubmit={handleFormSubmit}>
            <div className="clearsight-field">
              <label htmlFor="household-size"><Users size={17} /> Household size</label>
              <select
                id="household-size"
                value={formData.householdSize}
                onChange={(e) => setFormData({...formData, householdSize: e.target.value})}
                required
              >
                <option value="">Select household size</option>
                {[1,2,3,4,5,6,7,8].map(size => (
                  <option key={size} value={size}>{size} person{size > 1 ? 's' : ''}</option>
                ))}
              </select>
              <small>Include everyone in your household.</small>
            </div>

            <div className="clearsight-field">
              <label htmlFor="annual-income"><DollarSign size={17} /> Annual household income</label>
              <select
                id="annual-income"
                value={formData.income}
                onChange={(e) => setFormData({...formData, income: e.target.value})}
                required
              >
                <option value="">Choose an income range</option>
                {incomeRanges.map((range, index) => (
                  <option key={index} value={range.value}>{range.label}</option>
                ))}
              </select>
              <small>Select the range closest to your household's yearly income.</small>
            </div>

            <div className="clearsight-form-divider"></div>
            <div className="clearsight-form-card-heading clearsight-form-secondary-heading">
              <span className="clearsight-form-step">02 — LOCATION & BUDGET</span>
              <h2>What are you looking for?</h2>
              <p>We'll use these details to tailor the local resources and frames you see.</p>
            </div>

            <div className="clearsight-field">
              <label htmlFor="dc-zip"><MapPin size={17} /> D.C. ZIP code</label>
              <select
                id="dc-zip"
                value={formData.zipCode}
                onChange={(e) => setFormData({...formData, zipCode: e.target.value})}
                required
              >
                <option value="">Choose your ZIP code</option>
                {dcZipCodes.map(zip => <option key={zip} value={zip}>{zip}</option>)}
              </select>
              <small>Choose the D.C. ZIP code where you live.</small>
            </div>

            <div className="clearsight-field">
              <label htmlFor="glasses-budget"><DollarSign size={17} /> Budget for glasses</label>
              <select
                id="glasses-budget"
                value={formData.budget}
                onChange={(e) => setFormData({...formData, budget: e.target.value})}
                required
              >
                <option value="">Choose your budget</option>
                {budgetRanges.map((range, index) => (
                  <option key={index} value={range.value}>{range.label}</option>
                ))}
              </select>
              <small>What would you feel comfortable spending on frames?</small>
            </div>

            <div className="clearsight-form-actions">
              <button type="button" className="clearsight-secondary-button" onClick={() => setCurrentStep('welcome')}>
                Back
              </button>
              <button type="submit" className="clearsight-primary-cta">
                See my options <span aria-hidden="true">→</span>
              </button>
            </div>
          </form>
          <p className="clearsight-form-footnote">
            ClearSight provides informational guidance. Programs and coverage must be confirmed with the provider.
          </p>
        </div>
      </section>
    </main>
  );

  const ResultsScreen = () => {
    const eligibility = getEligibilityMessage();
    
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-gradient-to-r from-violet-700 to-purple-600 text-white py-8 clearsight-results-header">
          <div className="max-w-6xl mx-auto px-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-2">Your Glasses Options</h1>
                {formData.budget && (
                  <p className="text-purple-100 mb-1">
                    Your selected budget: {budgetRanges.find(b => b.value === formData.budget)?.label}
                  </p>
                )}
                <p className="text-purple-100">Found {filteredGlasses.length} glasses matching your criteria</p>
                <p className="text-purple-200 text-sm mt-2">
                  Coverage is not determined by income alone. Confirm benefits with your insurer or Medicaid plan.
                </p>
              </div>
              <button
                onClick={() => setCurrentStep('form')}
                className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors"
              >
                Edit Search
              </button>
            </div>
          </div>
        </div>
        
        {eligibility && (
          <div className="max-w-6xl mx-auto px-4 py-6">
            <div className={`p-6 rounded-xl border ${eligibility.color}`}>
              <div className="flex items-center space-x-2 mb-3">
                <Eye className="w-5 h-5" />
                <span className="font-semibold text-lg">{eligibility.level}</span>
              </div>
              <p className="mb-4">{eligibility.message}</p>
              
              {eligibility.showPrograms && (
                <div className="mt-6">
                  <h3 className="font-semibold text-lg mb-4 flex items-center">
                    <Info className="w-5 h-5 mr-2" />
                    Available Assistance Programs
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    {eligibility.programs.map((program, index) => (
                      <div key={index} className="bg-white p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
                        <h4 className="font-semibold text-gray-800 mb-2">{program.name}</h4>
                        <p className="text-sm text-gray-600 mb-3">{program.description}</p>
                        
                        <div className="space-y-2">
                          <div className="flex items-center text-sm">
                            <Phone className="w-4 h-4 mr-2 text-gray-500" />
                            <span className="text-gray-700">{program.contact}</span>
                          </div>
                          <div className="flex items-center text-sm">
                            <Globe className="w-4 h-4 mr-2 text-gray-500" />
                            <a 
                              href={`https://${program.website}`} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 hover:underline"
                            >
                              {program.website}
                            </a>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
        
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex flex-wrap gap-4 mb-8 bg-white p-6 rounded-xl shadow-sm">
            <div className="flex items-center space-x-2">
              <Filter className="w-5 h-5 text-gray-500" />
              <span className="font-semibold text-gray-700">Filters:</span>
            </div>
            
            <select
              value={filters.priceRange}
              onChange={(e) => setFilters({...filters, priceRange: e.target.value})}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500"
            >
              <option value="all">All Prices</option>
              <option value="under50">Under $50</option>
              <option value="50-100">$50 - $100</option>
              <option value="over100">Over $100</option>
            </select>
            
            <select
              value={filters.frameStyle}
              onChange={(e) => setFilters({...filters, frameStyle: e.target.value})}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500"
            >
              <option value="all">All Styles</option>
              <option value="round">Round</option>
              <option value="square">Square</option>
              <option value="rectangular">Rectangular</option>
              <option value="aviator">Aviator</option>
              <option value="cat-eye">Cat-Eye</option>
              <option value="classic">Classic</option>
            </select>
          </div>
          
          {showingBudgetAlternatives && (
            <div className="clearsight-alternatives-notice" role="status">
              <Info className="w-5 h-5 flex-shrink-0" />
              <div>
                <strong>No exact matches in this budget range just yet.</strong>
                <p>Here are the closest-priced frames currently in our catalog. Prices are shown so you can decide whether any are worth exploring.</p>
              </div>
            </div>
          )}

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGlasses.map((glasses, index) => (
                <div key={glasses.id || index} className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100 hover:border-purple-200">
                  <div className="h-48 bg-gradient-to-br from-gray-50 to-gray-100 relative overflow-hidden">
                    <GlassesImageCard glasses={glasses} className="h-full" />
                  </div>

                  <div className="p-6">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-xl font-bold text-gray-800">{glasses.name}</h3>
                      <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-semibold">
                        From ${glasses.numeric_price}
                      </span>
                    </div>
                    <p className="mb-4 text-xs text-gray-500">
                      Starting price for single-vision lenses; upgrades and prescription options may cost more.
                    </p>

                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Style:</span>
                        <span className="font-medium capitalize">{glasses.frame_style}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Material:</span>
                        <span className="font-medium">{glasses.material}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Site:</span>
                        <span className="font-medium">{glasses.site}</span>
                      </div>
                    </div>
                    
                    <p className="text-gray-600 text-sm mb-4">{glasses.features}</p>
                    
                    <div className="mt-4">
                      {glasses.site === 'Warby Parker' && (
                        <div className="mb-3 p-2 bg-blue-50 border border-blue-200 rounded-lg">
                          <p className="text-xs text-blue-700 font-medium">
                            💡 Tip: Click the first unsponsored link to see the frame in the Google Search results
                          </p>
                        </div>
                      )}
                      <a 
                        href={getSearchUrls(glasses).modelSearch} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="block w-full bg-slate-800 text-white py-3 px-4 rounded-lg text-sm font-medium hover:bg-slate-700 transition-colors text-center tracking-wide"
                      >
                        Search Frame
                      </a>
                    </div>
                  </div>
                </div>
            ))}
          </div>
          
          {filteredGlasses.length === 0 && (
            <div className="text-center py-12">
              <Eye className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No glasses match your filters</h3>
              <p className="text-gray-500">Try adjusting your price range or frame style filters</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  if (currentStep === 'welcome') return <WelcomeScreen />;
  if (currentStep === 'form') return <EligibilityForm />;
  if (currentStep === 'results') return <ResultsScreen />;
};

export default GlassesFinder;