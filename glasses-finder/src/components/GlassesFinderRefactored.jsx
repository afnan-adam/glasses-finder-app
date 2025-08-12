import React, { useState, useMemo, useCallback, Suspense } from 'react';
import { Search, Filter, DollarSign, MapPin, Users, Eye, Phone, Globe, Info } from 'lucide-react';
import glassesService from '../services/glassesService';
import useFormValidation from '../hooks/useFormValidation';
import ErrorBoundary from './ui/ErrorBoundary';
import LoadingSpinner from './ui/LoadingSpinner';
import Button from './ui/Button';
import Input from './ui/Input';
import Select from './ui/Select';
import GlassesCard from './ui/GlassesCard';

/**
 * Form validation schema
 */
const createValidationSchema = () => (values) => {
  const errors = {};
  
  if (!values.householdSize) {
    errors.householdSize = 'Please select your household size';
  }
  
  if (!values.income) {
    errors.income = 'Please enter your annual income';
  } else if (isNaN(values.income) || Number(values.income) < 0) {
    errors.income = 'Please enter a valid income amount';
  }
  
  if (!values.zipCode) {
    errors.zipCode = 'Please enter your ZIP code';
  } else if (!/^\d{5}$/.test(values.zipCode)) {
    errors.zipCode = 'Please enter a valid 5-digit ZIP code';
  } else if (!glassesService.validateDCZipCode(values.zipCode)) {
    errors.zipCode = 'Please enter a valid D.C. ZIP code';
  }
  
  return errors;
};

/**
 * Main Glasses Finder Component - Refactored with modern patterns
 */
const GlassesFinder = () => {
  // Component state
  const [currentStep, setCurrentStep] = useState('welcome');
  const [filters, setFilters] = useState({
    priceRange: 'all',
    frameStyle: 'all'
  });
  const [eligibilityData, setEligibilityData] = useState(null);
  const [recommendations, setRecommendations] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Form validation hook
  const {
    values: formData,
    errors: formErrors,
    handleChange,
    handleBlur,
    handleSubmit,
    isSubmitting
  } = useFormValidation(
    {
      householdSize: '',
      income: '',
      zipCode: ''
    },
    createValidationSchema(),
    handleFormSubmit
  );

  // Memoized glasses data
  const allGlassesData = useMemo(() => glassesService.getAllGlasses(), []);
  
  // Memoized filtered glasses
  const filteredGlasses = useMemo(() => {
    const displayGlasses = recommendations ? recommendations.allRecommendations : allGlassesData;
    
    return displayGlasses.filter(glasses => {
      const priceMatch = filters.priceRange === 'all' || 
        (filters.priceRange === 'under50' && glasses.numeric_price < 50) ||
        (filters.priceRange === '50-100' && glasses.numeric_price >= 50 && glasses.numeric_price <= 100) ||
        (filters.priceRange === 'over100' && glasses.numeric_price > 100);
      
      const styleMatch = filters.frameStyle === 'all' || 
        glasses.frame_style.toLowerCase() === filters.frameStyle.toLowerCase();
      
      return priceMatch && styleMatch;
    });
  }, [recommendations, allGlassesData, filters]);

  // Memoized eligibility message
  const eligibilityMessage = useMemo(() => {
    if (!eligibilityData) return null;
    return glassesService.formatEligibilityForComponent(eligibilityData);
  }, [eligibilityData]);

  // Form submission handler
  async function handleFormSubmit(values) {
    setIsLoading(true);
    
    try {
      const householdSize = parseInt(values.householdSize);
      const annualIncome = parseInt(values.income);
      const zipCode = values.zipCode;

      // Assess eligibility using the service
      const eligibility = glassesService.assessEligibility(householdSize, annualIncome, zipCode);
      setEligibilityData(eligibility);

      // Get personalized recommendations
      const recs = glassesService.getPersonalizedRecommendations(eligibility);
      setRecommendations(recs);

      // Navigate to results
      setCurrentStep('results');
    } catch (error) {
      throw new Error(error.message);
    } finally {
      setIsLoading(false);
    }
  }

  // Callback for filter changes
  const handleFilterChange = useCallback((filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  }, []);

  // Navigation callbacks
  const goToStep = useCallback((step) => {
    setCurrentStep(step);
  }, []);

  // Render methods for different steps
  const renderWelcomeScreen = () => (
    <WelcomeScreen onStart={() => goToStep('form')} />
  );

  const renderEligibilityForm = () => (
    <EligibilityForm
      formData={formData}
      errors={formErrors}
      onChange={handleChange}
      onBlur={handleBlur}
      onSubmit={handleSubmit}
      onBack={() => goToStep('welcome')}
      isSubmitting={isSubmitting}
      isLoading={isLoading}
    />
  );

  const renderResultsScreen = () => (
    <ResultsScreen
      eligibilityData={eligibilityData}
      recommendations={recommendations}
      eligibilityMessage={eligibilityMessage}
      filteredGlasses={filteredGlasses}
      filters={filters}
      onFilterChange={handleFilterChange}
      onEditSearch={() => goToStep('form')}
    />
  );

  // Main render with error boundary
  return (
    <ErrorBoundary title="Glasses Finder Error">
      <Suspense fallback={<LoadingSpinner size="xl" text="Loading Glasses Finder..." />}>
        {currentStep === 'welcome' && renderWelcomeScreen()}
        {currentStep === 'form' && renderEligibilityForm()}
        {currentStep === 'results' && renderResultsScreen()}
      </Suspense>
    </ErrorBoundary>
  );
};

/**
 * Welcome Screen Component
 */
const WelcomeScreen = React.memo(({ onStart }) => (
  <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 flex items-center justify-center p-4">
    <div className="max-w-md w-full bg-white/10 backdrop-blur-lg rounded-3xl p-8 text-center border border-white/20 shadow-2xl">
      <div className="mb-8">
        <Eye className="w-16 h-16 text-white mx-auto mb-4" />
        <h1 className="text-3xl font-bold text-white mb-2">D.C. Glasses Finder</h1>
        <p className="text-white/80 text-lg">Find affordable glasses that fit your budget</p>
      </div>
      
      <div className="space-y-4 mb-8 text-white/70">
        <FeatureItem icon={MapPin} text="Washington D.C. Area" />
        <FeatureItem icon={DollarSign} text="Budget-Friendly Options" />
        <FeatureItem icon={Users} text="Personalized Recommendations" />
      </div>
      
      <Button size="lg" onClick={onStart} className="w-full">
        Start Finding Glasses
      </Button>
    </div>
  </div>
));

/**
 * Feature Item Component
 */
const FeatureItem = React.memo(({ icon: Icon, text }) => (
  <div className="flex items-center justify-center space-x-2">
    <Icon className="w-5 h-5" />
    <span>{text}</span>
  </div>
));

/**
 * Eligibility Form Component
 */
const EligibilityForm = React.memo(({
  formData,
  errors,
  onChange,
  onBlur,
  onSubmit,
  onBack,
  isSubmitting,
  isLoading
}) => (
  <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 flex items-center justify-center p-4">
    <div className="max-w-lg w-full bg-white rounded-3xl p-8 shadow-2xl">
      <div className="text-center mb-8">
        <Eye className="w-12 h-12 text-purple-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Tell Us About Your Household</h2>
        <p className="text-gray-600">We'll help find the best options for your budget</p>
      </div>
      
      <form onSubmit={onSubmit} className="space-y-6">
        {errors.submit && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {errors.submit}
          </div>
        )}
        
        <Select
          name="householdSize"
          label="Household Size"
          icon={Users}
          value={formData.householdSize}
          onChange={onChange}
          onBlur={onBlur}
          error={errors.householdSize}
          required
        >
          <option value="">Select household size</option>
          {[1,2,3,4,5,6,7,8].map(size => (
            <option key={size} value={size}>{size} person{size > 1 ? 's' : ''}</option>
          ))}
        </Select>
        
        <Input
          name="income"
          type="text"
          inputMode="numeric"
          label="Annual Household Income"
          icon={DollarSign}
          value={formData.income}
          onChange={onChange}
          onBlur={onBlur}
          placeholder="Enter annual income (before taxes)"
          error={errors.income}
          required
        />
        
        <Input
          name="zipCode"
          type="text"
          inputMode="numeric"
          maxLength="5"
          label="D.C. ZIP Code"
          icon={MapPin}
          value={formData.zipCode}
          onChange={onChange}
          onBlur={onBlur}
          placeholder="e.g., 20001, 20009, 20036"
          error={errors.zipCode}
          required
        />
        
        <div className="flex space-x-4 mt-8">
          <Button variant="secondary" className="flex-1" onClick={onBack}>
            Back
          </Button>
          <Button 
            type="submit" 
            className="flex-1" 
            loading={isSubmitting || isLoading}
            disabled={isSubmitting || isLoading}
          >
            Find Glasses
          </Button>
        </div>
      </form>
    </div>
  </div>
));

/**
 * Results Screen Component
 */
const ResultsScreen = React.memo(({
  eligibilityData,
  recommendations,
  eligibilityMessage,
  filteredGlasses,
  filters,
  onFilterChange,
  onEditSearch
}) => (
  <div className="min-h-screen bg-gray-50">
    <ResultsHeader 
      eligibilityData={eligibilityData}
      recommendations={recommendations}
      filteredGlasses={filteredGlasses}
      onEditSearch={onEditSearch}
    />
    
    {eligibilityMessage && (
      <EligibilityMessage eligibility={eligibilityMessage} />
    )}
    
    <div className="max-w-6xl mx-auto px-4 py-6">
      <FilterSection filters={filters} onFilterChange={onFilterChange} />
      <GlassesGrid glasses={filteredGlasses} />
    </div>
  </div>
));

/**
 * Results Header Component
 */
const ResultsHeader = React.memo(({ eligibilityData, recommendations, filteredGlasses, onEditSearch }) => (
  <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white py-8">
    <div className="max-w-6xl mx-auto px-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Your Glasses Options</h1>
          {eligibilityData && (
            <p className="text-purple-100 mb-1">
              Tier: {eligibilityData.tierName} | Budget: ${eligibilityData.budgetRange[0]}-${eligibilityData.budgetRange[1]}
            </p>
          )}
          <p className="text-purple-100">Found {filteredGlasses.length} glasses matching your criteria</p>
          {recommendations && (
            <p className="text-purple-200 text-sm mt-2">{recommendations.priorityMessage}</p>
          )}
        </div>
        <Button variant="secondary" onClick={onEditSearch} className="bg-white/20 hover:bg-white/30 border-none">
          Edit Search
        </Button>
      </div>
    </div>
  </div>
));

/**
 * Eligibility Message Component
 */
const EligibilityMessage = React.memo(({ eligibility }) => (
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
              <ProgramCard key={index} program={program} />
            ))}
          </div>
        </div>
      )}
    </div>
  </div>
));

/**
 * Program Card Component
 */
const ProgramCard = React.memo(({ program }) => (
  <div className="bg-white p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
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
));

/**
 * Filter Section Component
 */
const FilterSection = React.memo(({ filters, onFilterChange }) => (
  <div className="flex flex-wrap gap-4 mb-8 bg-white p-6 rounded-xl shadow-sm">
    <div className="flex items-center space-x-2">
      <Filter className="w-5 h-5 text-gray-500" />
      <span className="font-semibold text-gray-700">Filters:</span>
    </div>
    
    <select
      value={filters.priceRange}
      onChange={(e) => onFilterChange('priceRange', e.target.value)}
      className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500"
    >
      <option value="all">All Prices</option>
      <option value="under50">Under $50</option>
      <option value="50-100">$50 - $100</option>
      <option value="over100">Over $100</option>
    </select>
    
    <select
      value={filters.frameStyle}
      onChange={(e) => onFilterChange('frameStyle', e.target.value)}
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
));

/**
 * Glasses Grid Component
 */
const GlassesGrid = React.memo(({ glasses }) => {
  const getFrameImage = useCallback((style) => {
    const frameImages = {
      'round': (
        <svg viewBox="0 0 200 80" className="w-20 h-12">
          <circle cx="60" cy="40" r="25" fill="none" stroke="currentColor" strokeWidth="3"/>
          <circle cx="140" cy="40" r="25" fill="none" stroke="currentColor" strokeWidth="3"/>
          <line x1="85" y1="40" x2="115" y2="40" stroke="currentColor" strokeWidth="2"/>
          <line x1="35" y1="40" x2="15" y2="45" stroke="currentColor" strokeWidth="2"/>
          <line x1="165" y1="40" x2="185" y2="45" stroke="currentColor" strokeWidth="2"/>
        </svg>
      ),
      'square': (
        <svg viewBox="0 0 200 80" className="w-20 h-12">
          <rect x="35" y="20" width="50" height="40" fill="none" stroke="currentColor" strokeWidth="3" rx="3"/>
          <rect x="115" y="20" width="50" height="40" fill="none" stroke="currentColor" strokeWidth="3" rx="3"/>
          <line x1="85" y1="40" x2="115" y2="40" stroke="currentColor" strokeWidth="2"/>
          <line x1="35" y1="40" x2="15" y2="45" stroke="currentColor" strokeWidth="2"/>
          <line x1="165" y1="40" x2="185" y2="45" stroke="currentColor" strokeWidth="2"/>
        </svg>
      )
      // Add other frame types as needed
    };
    
    return frameImages[style] || frameImages['round'];
  }, []);

  if (glasses.length === 0) {
    return (
      <div className="text-center py-12">
        <Eye className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-600 mb-2">No glasses match your filters</h3>
        <p className="text-gray-500">Try adjusting your price range or frame style filters</p>
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {glasses.map((glassesItem, index) => (
        <GlassesCard
          key={glassesItem.id || index}
          glasses={glassesItem}
          frameImage={getFrameImage(glassesItem.frame_style)}
        />
      ))}
    </div>
  );
});

export default GlassesFinder;