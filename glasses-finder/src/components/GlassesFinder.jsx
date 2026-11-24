import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Search, Filter, DollarSign, MapPin, Users, Eye, Phone, Globe, Info } from 'lucide-react';
import glassesService from '../services/glassesService';
import GlassesImageCard from './ui/GlassesImageCard';

const GlassesFinder = () => {
  const [currentStep, setCurrentStep] = useState('welcome');
  const [language, setLanguage] = useState('en');
  const isSpanish = language === 'es';
  const t = (english, spanish) => isSpanish ? spanish : english;
  const [formData, setFormData] = useState({
    householdSize: '',
    hasChildren: '',
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
  const [studentResourceIndex, setStudentResourceIndex] = useState(0);
  const [adultResourceIndex, setAdultResourceIndex] = useState(0);
  const [resultsPath, setResultsPath] = useState('overview');

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
        <div className="clearsight-nav-actions"><span className="clearsight-location"><MapPin size={15} /> Washington, D.C.</span><div className="clearsight-language-switch" role="group" aria-label="Language / Idioma"><button type="button" onClick={() => setLanguage('en')} aria-pressed={!isSpanish}>English</button><span>|</span><button type="button" onClick={() => setLanguage('es')} aria-pressed={isSpanish}>Español</button></div></div>
      </header>

      <section className="clearsight-hero" id="home">
        <div className="clearsight-hero-copy">
          <span className="clearsight-eyebrow">{t('A clearer path to affordable eyewear', 'Un camino más sencillo hacia lentes asequibles')}</span>
          <h1>{isSpanish ? <>Ver bien debe ajustarse a tu <em>vida</em> y a tu presupuesto.</> : <>Good vision should fit your <em>life</em> and your budget.</>}</h1>
          <p className="clearsight-hero-description">{t('Explore eyewear options and learn about vision assistance resources in the D.C. area.', 'Explora opciones de lentes y recursos de asistencia visual en Washington, D.C.')}</p>
          <div className="clearsight-hero-actions">
            <button
              onClick={() => setCurrentStep('form')}
              className="clearsight-primary-cta"
            >
              {t('Explore adult options', 'Explorar opciones para adultos')} <span aria-hidden="true">→</span>
            </button>
            <span className="clearsight-time-note">A short, guided questionnaire</span>
          </div>
          <div className="clearsight-value-points">
            <div><Users size={18} /><span>Household-aware guidance</span></div>
            <div><DollarSign size={18} /><span>Options across budgets</span></div>
            <div><MapPin size={18} /><span>D.C.-focused resources</span></div>
          </div>
        </div>

        <div className="clearsight-pathway-card"><span className="clearsight-card-kicker">{t('CHOOSE A PATH', 'ELIGE UNA OPCIÓN')}</span><button type="button" className="clearsight-pathway-button" onClick={() => setCurrentStep('form')}><span className="clearsight-pathway-icon"><Eye size={22}/></span><span><strong>{t('Adult vision care', 'Cuidado visual para adultos')}</strong><small>{t('Explore eyewear, insurance and assistance.', 'Explora lentes, seguros y programas de ayuda.')}</small></span><span className="clearsight-pathway-arrow">→</span></button><button type="button" className="clearsight-pathway-button" onClick={() => setCurrentStep('students')}><span className="clearsight-pathway-icon"><Users size={22}/></span><span><strong>{t('K–12 student vision', 'Cuidado visual para estudiantes K–12')}</strong><small>{t('Find free eye exams and glasses for children.', 'Encuentra exámenes de la vista y lentes gratuitos para niños.')}</small></span><span className="clearsight-pathway-arrow">→</span></button></div>
      </section>

      <footer className="clearsight-landing-footer">
        <span>ClearSight D.C.</span>
        <span>Helping D.C. residents explore affordable vision options.</span>
      </footer>
    </main>
  );

  const StudentScreen = () => {
    const resources = [
      { name: 'Vision To Learn — Washington, D.C.', category: 'Atención visual en las escuelas', description: 'Ofrece evaluaciones visuales, exámenes de la vista y anteojos recetados sin costo a estudiantes de comunidades de bajos ingresos mediante alianzas con escuelas en Washington, D.C.', eligibility: 'Los servicios se ofrecen a través de escuelas y organizaciones comunitarias participantes. Consulta con la escuela de tu hijo o contacta al equipo local para conocer las opciones actuales.', phone: '(703) 843-0309', email: 'washingtondc@visiontolearn.org', website: 'https://visiontolearn.org/where-we-work/washington-dc/' },
      { name: 'Glasses4Scholars — Prevention of Blindness Society', category: 'Programa con escuelas y organizaciones', description: 'Ofrece exámenes de la vista y anteojos recetados a niños mediante escuelas y organizaciones sin fines de lucro participantes.', eligibility: 'Pregunta en la escuela o en la organización comunitaria si participa. No es un servicio sin cita ni una solicitud directa para familias; depende de las organizaciones anfitrionas y de la disponibilidad de profesionales voluntarios.', phone: '(202) 234-1010 ext. 225', email: 'cwood@youreyes.org', website: 'https://www.youreyes.org/programs/kids/' },
      { name: 'All Children See', category: 'Exámenes de la vista sin costo', description: 'Conecta a niños que califican con oftalmólogos participantes para recibir exámenes de la vista sin costo en la región de D.C., Maryland y Virginia.', eligibility: 'Para menores de 18 años que no pasaron o no pudieron completar una evaluación visual, o que tienen otra preocupación visual, y cuya familia no tiene seguro o no puede pagar el copago. Confirma los criterios y la disponibilidad antes de programar.', website: 'https://aapos.org/webdev/what-we-do/all-children-see/about-acs' }
    ];
    return (
      <main className="min-h-screen clearsight-student-page">
        <header className="clearsight-form-nav">
          <a className="clearsight-brand" href="#home" onClick={(e) => { e.preventDefault(); setCurrentStep('welcome'); }}><span className="clearsight-brand-mark"><Eye size={21} /></span><span>ClearSight <strong>D.C.</strong></span></a>
          <div className="clearsight-language-switch" role="group" aria-label="Language / Idioma"><button type="button" onClick={() => setLanguage('en')} aria-pressed={!isSpanish}>English</button><span>|</span><button type="button" onClick={() => setLanguage('es')} aria-pressed={isSpanish}>Español</button></div>
        </header>
        <section className="max-w-6xl mx-auto px-4 py-10">
          <button type="button" className="clearsight-back-link" onClick={() => setCurrentStep('welcome')}>← {t('Back to overview', 'Volver al inicio')}</button>
          <div className="max-w-3xl mt-6">
            <span className="clearsight-eyebrow">{t('FOR PARENTS AND CAREGIVERS', 'PARA PADRES, MADRES Y CUIDADORES')}</span>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mt-3">{t('Vision support for K–12 students', 'Apoyo visual para estudiantes K–12')}</h1>
            <p className="text-slate-600 mt-3 leading-relaxed">{t('Explore school-based programs and services that may help children access eye exams and prescription glasses at no cost. Access rules vary by program.', 'Explora programas escolares y servicios que pueden ayudar a los niños a recibir exámenes de la vista y anteojos recetados sin costo. Los requisitos varían según el programa.')}</p>
          </div>
          <div className="mt-8 max-w-3xl" aria-label={t('Student vision resources', 'Recursos de salud visual para estudiantes')}>
            {(() => {
              const resource = resources[studentResourceIndex];
              return (
                <article key={resource.name} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8" aria-live="polite">
                  <p className="text-xs font-semibold uppercase tracking-wide text-purple-700">{resource.category}</p>
                  <h2 className="mt-2 text-xl font-semibold text-slate-900 md:text-2xl">{resource.name}</h2>
                  <p className="mt-4 leading-relaxed text-slate-600">{resource.description}</p>
                  <div className="mt-5 rounded-xl bg-purple-50 p-4">
                    <p className="text-sm font-semibold text-slate-900">{t('Who can access this?', '¿Quién puede acceder?')}</p>
                    <p className="mt-2 text-sm leading-relaxed text-slate-700">{resource.eligibility}</p>
                  </div>
                  <div className="mt-5 flex flex-wrap gap-4 text-sm">
                    {resource.phone && <a className="font-medium text-purple-700 hover:underline" href={'tel:' + resource.phone.replace(/[^0-9+]/g, '')}>{resource.phone}</a>}
                    {resource.email && <a className="font-medium text-purple-700 hover:underline" href={'mailto:' + resource.email}>{resource.email}</a>}
                    <a className="font-medium text-purple-700 hover:underline" href={resource.website} target="_blank" rel="noopener noreferrer">{t('Official program details', 'Detalles oficiales del programa')} ↗</a>
                  </div>
                  <p className="mt-5 text-xs text-slate-400">{t('Information checked November 24, 2026', 'Información verificada el 24 de noviembre de 2026')}</p>
                </article>
              );
            })()}
            <div className="mt-4 flex items-center justify-between gap-3">
              <button type="button" onClick={() => setStudentResourceIndex(index => Math.max(0, index - 1))} disabled={studentResourceIndex === 0} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 disabled:cursor-not-allowed disabled:opacity-40">← {t('Previous', 'Anterior')}</button>
              <span className="text-sm tabular-nums text-slate-500" aria-live="polite">{studentResourceIndex + 1} {t('of', 'de')} {resources.length}</span>
              <button type="button" onClick={() => setStudentResourceIndex(index => Math.min(resources.length - 1, index + 1))} disabled={studentResourceIndex === resources.length - 1} className="rounded-lg bg-purple-700 px-4 py-2 text-sm font-semibold text-white hover:bg-purple-800 disabled:cursor-not-allowed disabled:opacity-40">{t('Next', 'Siguiente')} →</button>
            </div>
            <div className="mt-3 flex justify-center gap-2" aria-hidden="true">
              {resources.map((resource, index) => <span key={resource.name} className={`h-1.5 w-8 rounded-full ${index === studentResourceIndex ? 'bg-purple-700' : 'bg-slate-200'}`} />)}
            </div>
          </div>
          <div className="mt-8 rounded-2xl bg-purple-50 border border-purple-100 p-5"><h2 className="font-semibold text-slate-900">{t('Not sure where to start?', '¿No sabes por dónde empezar?')}</h2><p className="text-sm text-slate-700 mt-2">{t('Ask your child’s school nurse or counselor whether the school participates in a vision program. For All Children See, review the program criteria and contact the program about participating providers.', 'Pregunta a la enfermera escolar o al consejero si la escuela participa en un programa de salud visual. Para All Children See, revisa los requisitos y consulta sobre los profesionales participantes.')}</p></div>
        </section>
      </main>
    );
  };

  const EligibilityForm = () => (
    <main className="min-h-screen clearsight-form-page">
      <header className="clearsight-form-nav">
        <a className="clearsight-brand" href="#home" onClick={(e) => { e.preventDefault(); setCurrentStep('welcome'); }}>
          <span className="clearsight-brand-mark"><Eye size={21} /></span>
          <span>ClearSight <strong>D.C.</strong></span>
        </a>
        <div className="clearsight-form-nav-actions">
          <div className="clearsight-language-switch" role="group" aria-label="Language / Idioma"><button type="button" onClick={() => setLanguage('en')} aria-pressed={!isSpanish}>English</button><span>|</span><button type="button" onClick={() => setLanguage('es')} aria-pressed={isSpanish}>Español</button></div>
          <button type="button" className="clearsight-back-link" onClick={() => setCurrentStep('welcome')}>← {t('Back to overview', 'Volver al inicio')}</button>
        </div>
      </header>

      <section className="clearsight-form-layout">
        <div className="clearsight-form-intro">
          <span className="clearsight-eyebrow">{t("LET'S GET STARTED", "COMENCEMOS")}</span>
          <h1>{t('A few details help us point you in the right direction.', 'Unos datos nos ayudan a orientarte.')}</h1>
          <p>
            {t('Answer four quick questions so we can show you D.C. vision resources and eyewear options to explore.', 'Responde cuatro preguntas breves para mostrarte recursos visuales y opciones de lentes en D.C.')}
          </p>
          <div className="clearsight-form-progress" aria-label="Questionnaire progress">
            <span className="clearsight-progress-active"></span>
            <span></span><span></span><span></span>
          </div>
          <small>{t('Four questions · Your answers shape the results', 'Cuatro preguntas · Tus respuestas orientan los resultados')}</small>
          <div className="clearsight-privacy-note">
            <Info size={17} />
            <span>{t('Your answers are used to shape the results shown in this session.', 'Tus respuestas se utilizan para personalizar los resultados de esta sesión.')}</span>
          </div>
        </div>

        <div className="clearsight-form-card">
          <div className="clearsight-form-card-heading">
            <span className="clearsight-form-step">{t('01 — HOUSEHOLD', '01 — HOGAR')}</span>
            <h2>{t('Tell us about your household', 'Cuéntanos sobre tu hogar')}</h2>
            <p>{t('These details help us estimate which assistance resources may be relevant.', 'Estos datos nos ayudan a identificar recursos de asistencia que podrían ser relevantes.')}</p>
          </div>

          <form onSubmit={handleFormSubmit}>
            <div className="clearsight-field">
              <label htmlFor="household-size"><Users size={17} /> {t('Household size', 'Tamaño del hogar')}</label>
              <select
                id="household-size"
                value={formData.householdSize}
                onChange={(e) => setFormData({...formData, householdSize: e.target.value})}
                required
              >
                <option value="">{t('Select household size', 'Selecciona el tamaño del hogar')}</option>
                {[1,2,3,4,5,6,7,8].map(size => (
                  <option key={size} value={size}>{isSpanish ? `${size} ${size === 1 ? 'persona' : 'personas'}` : `${size} person${size > 1 ? 's' : ''}`}</option>
                ))}
              </select>
              <small>{t('Include everyone in your household.', 'Incluye a todas las personas de tu hogar.')}</small>
            </div>

            <div className="clearsight-field">
              <label htmlFor="has-children"><Users size={17} /> {t('Do you have children in your household?', '¿Hay niños en tu hogar?')}</label>
              <select
                id="has-children"
                value={formData.hasChildren}
                onChange={(e) => setFormData({...formData, hasChildren: e.target.value})}
                required
              >
                <option value="">{t('Select an answer', 'Selecciona una respuesta')}</option>
                <option value="yes">{t('Yes', 'Sí')}</option>
                <option value="no">{t('No', 'No')}</option>
              </select>
              <small>{t('This helps us point you toward child-focused vision resources when relevant.', 'Esto nos ayuda a mostrarte recursos de salud visual para niños cuando corresponda.')}</small>
              {formData.hasChildren === 'yes' && (
                <div className="mt-3 rounded-xl border border-purple-200 bg-purple-50 p-4">
                  <p className="text-sm text-slate-700">{t('Looking for vision support for a child in grades K–12? Explore programs for families separately.', '¿Buscas apoyo visual para un niño o niña en los grados K–12? Explora por separado los programas para familias.')}</p>
                  <button type="button" className="mt-3 text-sm font-semibold text-purple-800 underline underline-offset-4" onClick={() => setCurrentStep('students')}>{t('View student resources', 'Ver recursos para estudiantes')} →</button>
                </div>
              )}
            </div>

            <div className="clearsight-field">
              <label htmlFor="annual-income"><DollarSign size={17} /> {t('Annual household income', 'Ingresos anuales del hogar')}</label>
              <select
                id="annual-income"
                value={formData.income}
                onChange={(e) => setFormData({...formData, income: e.target.value})}
                required
              >
                <option value="">{t('Choose an income range', 'Selecciona un rango de ingresos')}</option>
                {incomeRanges.map((range, index) => (
                  <option key={index} value={range.value}>{range.label}</option>
                ))}
              </select>
              <small>{t("Select the range closest to your household's yearly income.", 'Selecciona el rango más cercano a los ingresos anuales de tu hogar.')}</small>
            </div>

            <div className="clearsight-form-divider"></div>
            <div className="clearsight-form-card-heading clearsight-form-secondary-heading">
              <span className="clearsight-form-step">{t('02 — LOCATION & BUDGET', '02 — UBICACIÓN Y PRESUPUESTO')}</span>
              <h2>{t('What are you looking for?', '¿Qué estás buscando?')}</h2>
              <p>We'll use these details to tailor the local resources and frames you see.</p>
            </div>

            <div className="clearsight-field">
              <label htmlFor="dc-zip"><MapPin size={17} /> {t('D.C. ZIP code', 'Código postal de D.C.')}</label>
              <select
                id="dc-zip"
                value={formData.zipCode}
                onChange={(e) => setFormData({...formData, zipCode: e.target.value})}
                required
              >
                <option value="">{t('Choose your ZIP code', 'Selecciona tu código postal')}</option>
                {dcZipCodes.map(zip => <option key={zip} value={zip}>{zip}</option>)}
              </select>
              <small>{t('Choose the D.C. ZIP code where you live.', 'Selecciona el código postal de D.C. donde vives.')}</small>
            </div>

            <div className="clearsight-field">
              <label htmlFor="glasses-budget"><DollarSign size={17} /> {t('Budget for glasses', 'Presupuesto para lentes')}</label>
              <select
                id="glasses-budget"
                value={formData.budget}
                onChange={(e) => setFormData({...formData, budget: e.target.value})}
                required
              >
                <option value="">{t('Choose your budget', 'Selecciona tu presupuesto')}</option>
                {budgetRanges.map((range, index) => (
                  <option key={index} value={range.value}>{range.label}</option>
                ))}
              </select>
              <small>{t('What would you feel comfortable spending on frames?', '¿Cuánto te sentirías cómodo gastando en armazones?')}</small>
            </div>

            <div className="clearsight-form-actions">
              <button type="button" className="clearsight-secondary-button" onClick={() => setCurrentStep('welcome')}>
                {t('Back', 'Volver')}
              </button>
              <button type="submit" className="clearsight-primary-cta">
                {t('See my options', 'Ver mis opciones')} <span aria-hidden="true">→</span>
              </button>
            </div>
          </form>
          <p className="clearsight-form-footnote">
            {t('ClearSight provides informational guidance. Programs and coverage must be confirmed with the provider.', 'ClearSight ofrece orientación informativa. Debes confirmar los programas y la cobertura directamente con cada proveedor.')}
          </p>
        </div>
      </section>
    </main>
  );

  const ResultsScreen = () => {
    const adultResources = (eligibilityData?.resources || []).filter(resource => !resource.audience || resource.audience !== 'K–12 students');
    const studentResources = (eligibilityData?.resources || []).filter(resource => resource.audience === 'K–12 students');
    const budgetLabel = budgetRanges.find(item => item.value === formData.budget)?.label || 'Not selected';
    const budgetGuidance = {
      under50: 'The Prevention of Blindness Society lists basic prescription glasses from $40, frames included. A current prescription (less than one year old) and an appointment are required. Additional lens options may cost extra.',
      '50-75': 'A local nonprofit clinic lists basic prescription glasses from $40, frames included. Compare that option before considering retail frames that may exceed your budget.',
      '75-100': 'Some retail frames in this catalog start at $95 with basic single-vision lenses. Compare the full price, lens options, and the local clinic option.',
      '100-150': 'Compare retail starting prices, lens upgrades, coatings, shipping, and eye exam costs. Check your vision plan for allowances and copays.',
      '150-200': 'You may have more retail choices, but compare the complete prescription-glasses price and any insurance benefits before checkout.',
      '200plus': 'Compare lens materials, coatings, progressive options, warranties, and your insurance allowance—not just the frame price.'
    }[formData.budget] || 'Compare the full cost of frames, lenses, and any exam or shipping fees before ordering.';
    const pathButton = (key, icon, title, description) => (
      <button type="button" onClick={() => setResultsPath(key)} className="w-full rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:border-purple-300 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-purple-500">
        <span className="flex items-center gap-4"><span className="rounded-xl bg-purple-50 p-3 text-purple-700">{icon}</span><span className="min-w-0 flex-1"><strong className="block text-base text-slate-900">{title}</strong><span className="mt-1 block text-sm text-slate-600">{description}</span></span><span className="text-xl text-purple-700" aria-hidden="true">→</span></span>
      </button>
    );
    const resourceCard = (resource, index, total, setIndex, isStudent = false) => (
      <div className="max-w-3xl">
        <article key={resource.name} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8" aria-live="polite">
          <p className="text-xs font-semibold uppercase tracking-wide text-purple-700">{resource.category}</p><h3 className="mt-2 text-xl font-semibold text-slate-900 md:text-2xl">{resource.name}</h3>
          <p className="mt-4 leading-relaxed text-slate-600">{resource.description}</p>
          <div className="mt-5 rounded-xl bg-purple-50 p-4"><p className="text-sm font-semibold text-slate-900">{isStudent ? 'How families can access this' : 'Who can access this?'}</p><p className="mt-2 text-sm leading-relaxed text-slate-700">{resource.eligibility}</p></div>
          {resource.address && <p className="mt-4 text-sm text-slate-700">{resource.address}</p>}
          <div className="mt-5 flex flex-wrap gap-4 text-sm">{resource.phone && <a className="font-medium text-purple-700 hover:underline" href={'tel:' + resource.phone.replace(/[^0-9+]/g, '')}>{resource.phone}</a>}{resource.email && <a className="font-medium text-purple-700 hover:underline" href={'mailto:' + resource.email}>{resource.email}</a>}{resource.website && <a className="font-medium text-purple-700 hover:underline" href={resource.website} target="_blank" rel="noopener noreferrer">Official program details ↗</a>}</div>
          <p className="mt-5 text-xs text-slate-400">Information checked November 24, 2026</p>
        </article>
        <div className="mt-4 flex items-center justify-between gap-3"><button type="button" onClick={() => setIndex(i => Math.max(0, i - 1))} disabled={index === 0} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 disabled:opacity-40">← Previous</button><span className="text-sm tabular-nums text-slate-500">{index + 1} of {total}</span><button type="button" onClick={() => setIndex(i => Math.min(total - 1, i + 1))} disabled={index >= total - 1} className="rounded-lg bg-purple-700 px-4 py-2 text-sm font-semibold text-white hover:bg-purple-800 disabled:opacity-40">Next →</button></div>
        <div className="mt-3 flex justify-center gap-2" aria-hidden="true">{Array.from({length: total}, (_, i) => <span key={i} className={`h-1.5 w-8 rounded-full ${i === index ? 'bg-purple-700' : 'bg-slate-200'}`} />)}</div>
      </div>
    );
    return (
      <main className="min-h-screen bg-slate-50">
        <header className="bg-gradient-to-r from-violet-700 to-purple-600 py-7 text-white"><div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4"><div><p className="text-sm font-semibold text-purple-100">CLEARSIGHT D.C. · YOUR PERSONALIZED GUIDE</p><h1 className="mt-2 text-3xl font-bold">{t('Your next step toward clearer vision', 'Tu próximo paso hacia una mejor visión')}</h1><p className="mt-2 text-purple-100">{t('Your glasses budget:', 'Tu presupuesto para lentes:')} {budgetLabel}</p></div><div className="flex items-center gap-3"><div className="clearsight-language-switch" role="group" aria-label="Language / Idioma"><button type="button" onClick={() => setLanguage('en')} aria-pressed={!isSpanish}>English</button><span>|</span><button type="button" onClick={() => setLanguage('es')} aria-pressed={isSpanish}>Español</button></div><button onClick={() => setCurrentStep('form')} className="rounded-lg bg-white/20 px-4 py-2 hover:bg-white/30">{t('Edit answers', 'Editar respuestas')}</button></div></div></header>
        <div className="mx-auto max-w-6xl px-4 py-8">
          {resultsPath !== 'overview' && <button type="button" onClick={() => setResultsPath('overview')} className="mb-6 text-sm font-semibold text-purple-700 hover:underline">← Back to your guide</button>}
          {resultsPath === 'overview' && <section className="max-w-3xl"><div className="rounded-2xl border border-purple-200 bg-white p-6 shadow-sm md:p-8"><p className="text-xs font-bold uppercase tracking-wider text-purple-700">A GOOD PLACE TO START</p><h2 className="mt-2 text-2xl font-bold text-slate-900">Let's find an option that works for your budget.</h2><p className="mt-3 text-sm leading-relaxed text-slate-600">{budgetGuidance}</p><p className="mt-3 text-sm text-slate-600">The local clinic lists basic glasses from $40, frames included. A current prescription and appointment are required; ask about the full cost of any lens options.</p><a href="https://www.youreyes.org/affordable-eyeglasses-clinic/" target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex rounded-lg bg-purple-700 px-4 py-3 text-sm font-semibold text-white hover:bg-purple-800">Explore the affordable eyeglasses clinic ↗</a></div><h2 className="mt-8 text-xl font-bold text-slate-900">What would you like to explore?</h2><p className="mt-2 text-sm text-slate-600">Choose one path. You can come back here whenever you like.</p><div className="mt-4 grid gap-4">{pathButton('assistance', <HeartHandshake size={24} />, 'Find affordable vision assistance', 'Clinics, Medicaid vision benefits, and possible financial assistance.')}{pathButton('glasses', <Eye size={24} />, 'Browse eyeglass frames', showingBudgetAlternatives ? 'No catalog frames match your selected budget. See clearly labeled higher-priced alternatives.' : 'Compare frame styles, starting prices, and retailers.')}{pathButton('students', <Users size={24} />, 'Find glasses and eye care for a child', 'K–12 school and community vision programs for families.')}</div><div className="mt-6 rounded-xl border border-slate-200 bg-white p-4"><p className="font-semibold text-slate-900">About coverage</p><p className="mt-1 text-sm leading-relaxed text-slate-600">Income and ZIP code alone cannot determine vision coverage. Benefits depend on your age, insurance or Medicaid plan, provider participation, and prescription needs. Confirm coverage directly with your plan.</p></div></section>}
          {resultsPath === 'assistance' && <section><div className="mb-6 max-w-3xl"><p className="text-xs font-bold uppercase tracking-wider text-purple-700">VISION ASSISTANCE</p><h2 className="mt-2 text-2xl font-bold text-slate-900">Explore local vision resources</h2><p className="mt-2 text-sm leading-relaxed text-slate-600">These resources have different costs and access rules. Contact the provider to confirm current availability and your specific benefits.</p></div>{adultResources.length ? resourceCard(adultResources[Math.min(adultResourceIndex, adultResources.length - 1)], Math.min(adultResourceIndex, adultResources.length - 1), adultResources.length, setAdultResourceIndex) : <p>No adult resources are currently listed.</p>}</section>}
          {resultsPath === 'students' && <section><div className="mb-6 max-w-3xl"><p className="text-xs font-bold uppercase tracking-wider text-purple-700">FOR PARENTS AND CAREGIVERS</p><h2 className="mt-2 text-2xl font-bold text-slate-900">Vision support for K–12 students</h2><p className="mt-2 text-sm leading-relaxed text-slate-600">These programs may help children access eye exams and prescription glasses. Many work through participating schools and community organizations.</p></div>{studentResources.length ? resourceCard(studentResources[Math.min(studentResourceIndex, studentResources.length - 1)], Math.min(studentResourceIndex, studentResources.length - 1), studentResources.length, setStudentResourceIndex, true) : <p>No K–12 resources are currently listed.</p>}</section>}
          {resultsPath === 'glasses' && <section><div className="mb-6 max-w-3xl"><p className="text-xs font-bold uppercase tracking-wider text-purple-700">EYEGLASS CATALOG</p><h2 className="mt-2 text-2xl font-bold text-slate-900">Browse frames and compare prices</h2><p className="mt-2 text-sm text-slate-600">Your selected budget: {budgetLabel}. Prices are starting prices for single-vision lenses; upgrades may cost more.</p></div><div className="mb-6 flex flex-wrap gap-3 rounded-xl bg-white p-4 shadow-sm"><label className="text-sm text-slate-700">Price <select value={filters.priceRange} onChange={e => setFilters({...filters, priceRange:e.target.value})} className="ml-2 rounded-lg border border-slate-300 px-3 py-2"><option value="all">All prices</option><option value="under50">Under $50</option><option value="50-100">$50–$100</option><option value="over100">Over $100</option></select></label><label className="text-sm text-slate-700">Style <select value={filters.frameStyle} onChange={e => setFilters({...filters, frameStyle:e.target.value})} className="ml-2 rounded-lg border border-slate-300 px-3 py-2"><option value="all">All styles</option><option value="round">Round</option><option value="square">Square</option><option value="rectangular">Rectangular</option><option value="aviator">Aviator</option><option value="cat-eye">Cat-eye</option><option value="classic">Classic</option></select></label></div>{showingBudgetAlternatives && <div className="mb-5 max-w-3xl rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900"><strong>No exact matches in this budget range.</strong><p className="mt-1">The frames below are alternatives above your selected budget, not matches. Consider them only if you can stretch your budget.</p></div>}{!showingBudgetAlternatives && <p className="mb-4 text-sm text-slate-600">{filteredGlasses.length} frame options in the selected range.</p>}<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">{filteredGlasses.map((glasses, index) => <article key={glasses.id || index} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"><div className="h-48 overflow-hidden bg-slate-100"><GlassesImageCard glasses={glasses} className="h-full" /></div><div className="p-5"><div className="flex items-start justify-between gap-3"><h3 className="text-xl font-bold text-slate-900">{glasses.name}</h3><span className="rounded-full bg-purple-50 px-3 py-1 text-sm font-semibold text-purple-800">From ${glasses.numeric_price}</span></div><p className="mt-2 text-xs text-slate-500">Starting price for single-vision lenses; upgrades and prescription options may cost more.</p><p className="mt-3 text-sm text-slate-600">{glasses.frame_style} · {glasses.material}</p><p className="mt-2 text-sm text-slate-600">{glasses.features}</p><a href={glasses.url} target="_blank" rel="noopener noreferrer" className="mt-4 block rounded-lg bg-slate-800 px-4 py-3 text-center text-sm font-semibold text-white hover:bg-slate-700">View at {glasses.site} ↗</a></div></article>)}</div>{filteredGlasses.length === 0 && <p className="rounded-xl bg-white p-6 text-slate-600">No frames match these filters. Try another price or style.</p>}</section>}
        </div>
      </main>
    );
  };

  if (currentStep === 'welcome') return <WelcomeScreen />;
  if (currentStep === 'students') return <StudentScreen />;
  if (currentStep === 'form') return <EligibilityForm />;
  if (currentStep === 'results') return <ResultsScreen />;
};

export default GlassesFinder;