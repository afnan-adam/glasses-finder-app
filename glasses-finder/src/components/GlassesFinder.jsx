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

  // Check if glasses qualify for assistance programs
  const getAssistanceProgram = (price, site) => {
    if (price <= 35) {
      return {
        name: "Income-Based Pricing",
        description: "Contact store directly with income documentation for verification",
        detailedMessage: "This reduced pricing requires income verification. Please contact the optical store directly and provide documentation of your current household income to confirm eligibility for this assistance pricing.",
        color: "bg-emerald-50 text-emerald-800 border-emerald-200"
      };
    }
    if (price <= 50) {
      // Warby Parker only accepts UCH Spectera/Medicare Advantage, not general Medicaid
      if (site === 'Warby Parker') {
        return {
          name: "UCH Spectera/Medicare Advantage",
          description: "Contact Warby Parker with UCH Spectera or Medicare Advantage documentation", 
          detailedMessage: "Warby Parker accepts UCH Spectera and Medicare Advantage plans. Please contact Warby Parker directly with your current UCH Spectera or Medicare Advantage card to verify coverage eligibility.",
          color: "bg-purple-50 text-purple-800 border-purple-200"
        };
      } else {
        return {
          name: "Medicaid Coverage",
          description: "Contact store with Medicaid documentation for coverage verification", 
          detailedMessage: "This pricing is available through Medicaid vision benefits. Please contact the optical store directly with your current Medicaid card and coverage documentation to verify eligibility.",
          color: "bg-blue-50 text-blue-800 border-blue-200"
        };
      }
    }
    return null;
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

  // Use recommended glasses if available, otherwise use all glasses
  const displayGlasses = recommendations ? recommendations.allRecommendations : allGlassesData;
  
  const filteredGlasses = displayGlasses.filter(glasses => {
    // Filter by price range (from dropdown filters)
    const priceMatch = filters.priceRange === 'all' || 
      (filters.priceRange === 'under50' && glasses.numeric_price < 50) ||
      (filters.priceRange === '50-100' && glasses.numeric_price >= 50 && glasses.numeric_price <= 100) ||
      (filters.priceRange === 'over100' && glasses.numeric_price > 100);
    
    // Filter by frame style
    const styleMatch = filters.frameStyle === 'all' || 
      glasses.frame_style.toLowerCase() === filters.frameStyle.toLowerCase();
    
    // Filter by user's budget from form (if available)
    let budgetMatch = true;
    if (formData.budget) {
      switch (formData.budget) {
        case 'under50':
          budgetMatch = glasses.numeric_price < 50;
          break;
        case '50-75':
          budgetMatch = glasses.numeric_price >= 50 && glasses.numeric_price <= 75;
          break;
        case '75-100':
          budgetMatch = glasses.numeric_price >= 75 && glasses.numeric_price <= 100;
          break;
        case '100-150':
          budgetMatch = glasses.numeric_price >= 100 && glasses.numeric_price <= 150;
          break;
        case '150-200':
          budgetMatch = glasses.numeric_price >= 150 && glasses.numeric_price <= 200;
          break;
        case '200plus':
          budgetMatch = glasses.numeric_price >= 200;
          break;
        default:
          budgetMatch = true;
      }
    }
    
    return priceMatch && styleMatch && budgetMatch;
  });

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

  const WelcomeScreen = () => (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white/10 backdrop-blur-lg rounded-3xl p-8 text-center border border-white/20 shadow-2xl">
        <div className="mb-8">
          <Eye className="w-16 h-16 text-white mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-white mb-2">ClearSight D.C.</h1>
          <p className="text-white/80 text-lg">Find affordable glasses that fit your budget</p>
        </div>
        
        <div className="space-y-4 mb-8 text-white/70">
          <div className="flex items-center justify-center space-x-2">
            <MapPin className="w-5 h-5" />
            <span>Washington D.C. Area</span>
          </div>
          <div className="flex items-center justify-center space-x-2">
            <DollarSign className="w-5 h-5" />
            <span>Budget-Friendly Options</span>
          </div>
          <div className="flex items-center justify-center space-x-2">
            <Users className="w-5 h-5" />
            <span>Personalized Recommendations</span>
          </div>
        </div>
        
        <button
          onClick={() => setCurrentStep('form')}
          className="w-full bg-white text-purple-600 py-4 px-6 rounded-2xl font-semibold text-lg hover:bg-white/90 transform hover:scale-105 transition-all duration-300 shadow-lg"
        >
          Start Finding Glasses
        </button>
      </div>
    </div>
  );

  const EligibilityForm = () => (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 flex items-center justify-center p-4">
      <div className="max-w-lg w-full bg-white rounded-3xl p-8 shadow-2xl">
        <div className="text-center mb-8">
          <Eye className="w-12 h-12 text-purple-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Tell Us About Your Household</h2>
          <p className="text-gray-600">We'll help find the best options for your budget</p>
        </div>
        
        <form onSubmit={handleFormSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              <Users className="w-4 h-4 inline mr-2" />
              Household Size
            </label>
            <select
              value={formData.householdSize}
              onChange={(e) => setFormData({...formData, householdSize: e.target.value})}
              className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition-colors"
              required
            >
              <option value="">Select household size</option>
              {[1,2,3,4,5,6,7,8].map(size => (
                <option key={size} value={size}>{size} person{size > 1 ? 's' : ''}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              <DollarSign className="w-4 h-4 inline mr-2" />
              Annual Household Income
            </label>
            <select
              value={formData.income}
              onChange={(e) => setFormData({...formData, income: e.target.value})}
              className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition-colors text-lg"
              required
            >
              <option value="">Select income range</option>
              {incomeRanges.map((range, index) => (
                <option key={index} value={range.value}>{range.label}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              <MapPin className="w-4 h-4 inline mr-2" />
              D.C. ZIP Code
            </label>
            <select
              value={formData.zipCode}
              onChange={(e) => setFormData({...formData, zipCode: e.target.value})}
              className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition-colors text-lg"
              required
            >
              <option value="">Select your ZIP code</option>
              {dcZipCodes.map((zip) => (
                <option key={zip} value={zip}>{zip}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              <DollarSign className="w-4 h-4 inline mr-2" />
              Glasses Budget
            </label>
            <select
              value={formData.budget}
              onChange={(e) => setFormData({...formData, budget: e.target.value})}
              className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition-colors text-lg"
              required
            >
              <option value="">Select your budget range</option>
              {budgetRanges.map((range, index) => (
                <option key={index} value={range.value}>{range.label}</option>
              ))}
            </select>
          </div>
          
          <div className="flex space-x-4 mt-8">
            <button
              type="button"
              onClick={() => setCurrentStep('welcome')}
              className="flex-1 bg-gray-100 text-gray-600 py-4 px-6 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
            >
              Back
            </button>
            <button
              type="submit"
              className="flex-1 bg-purple-600 text-white py-4 px-6 rounded-xl font-semibold hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Find Glasses
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  const ResultsScreen = () => {
    const eligibility = getEligibilityMessage();
    
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white py-8">
          <div className="max-w-6xl mx-auto px-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-2">Your Glasses Options</h1>
                {eligibilityData && (
                  <p className="text-purple-100 mb-1">
                    Tier: {eligibilityData.tierName} | Budget: ${eligibilityData.budgetRange[0]}-${eligibilityData.budgetRange[1]}
                    {formData.budget && (
                      <span className="ml-2">| Your Budget: {budgetRanges.find(b => b.value === formData.budget)?.label}</span>
                    )}
                  </p>
                )}
                <p className="text-purple-100">Found {filteredGlasses.length} glasses matching your criteria</p>
                {recommendations && (
                  <p className="text-purple-200 text-sm mt-2">{recommendations.priorityMessage}</p>
                )}
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
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGlasses.map((glasses, index) => {
              const assistanceProgram = getAssistanceProgram(glasses.numeric_price, glasses.site);
              return (
                <div key={index} className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100 hover:border-purple-200 transform hover:scale-105">
                  <div className="h-48 bg-gradient-to-br from-gray-50 to-gray-100 relative overflow-hidden">
                    <GlassesImageCard
                      glasses={glasses}
                      onImageGenerated={(glassesObj, url) => {
                        const cacheKey = `${glassesObj.name}-${glassesObj.frame_style}-${glassesObj.material}`;
                        setGeneratedImages(prev => new Map(prev.set(cacheKey, url)));
                      }}
                      className="h-full"
                    />
                    {assistanceProgram && (
                      <div className={`absolute top-2 left-2 px-2 py-1 rounded-lg text-xs font-semibold ${assistanceProgram.color} z-10`}>
                        {assistanceProgram.name}
                      </div>
                    )}
                  </div>
                  
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-xl font-bold text-gray-800">{glasses.name}</h3>
                      <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-semibold">
                        ${glasses.numeric_price}
                      </span>
                    </div>

                    {assistanceProgram && (
                      <div className={`mb-4 p-4 rounded-lg ${assistanceProgram.color} border`}>
                        <div className="flex items-start gap-2 mb-2">
                          <div className="flex-shrink-0 w-4 h-4 mt-0.5">
                            <svg className="w-4 h-4 text-current opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                          <div className="flex-1">
                            <h4 className="text-sm font-medium mb-1">{assistanceProgram.name}</h4>
                            <p className="text-xs leading-relaxed opacity-90">{assistanceProgram.detailedMessage}</p>
                          </div>
                        </div>
                      </div>
                    )}
                    
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
              );
            })}
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