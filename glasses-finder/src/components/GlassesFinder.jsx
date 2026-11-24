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
          <div className="grid gap-4 md:grid-cols-2 mt-8">
            {resources.map((resource) => (
              <article key={resource.name} className="rounded-2xl border border-purple-200 bg-white p-6 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-wide text-purple-700">{resource.category}</p>
                <h2 className="mt-2 text-xl font-semibold text-slate-900">{resource.name}</h2>
                <p className="mt-3 text-sm leading-relaxed text-slate-600">{resource.description}</p>
                <p className="mt-3 text-sm leading-relaxed text-slate-600">{resource.eligibility}</p>
                <div className="mt-4 flex flex-wrap gap-3 text-sm">{resource.phone && <a className="text-purple-700 font-medium" href={'tel:' + resource.phone.replace(/[^0-9+]/g, '')}>{resource.phone}</a>}{resource.email && <a className="text-purple-700 font-medium" href={'mailto:' + resource.email}>{resource.email}</a>}<a className="text-purple-700 font-medium" href={resource.website} target="_blank" rel="noopener noreferrer">{t('Program details', 'Detalles del programa')} ↗</a></div>
                <p className="mt-4 text-xs text-slate-400">{t('Information checked November 24, 2026', 'Información verificada el 24 de noviembre de 2026')}</p>
              </article>
            ))}
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
    const eligibility = getEligibilityMessage();
    const budgetGuidance = {
      under50: {
        title: 'Looking to spend under $50? Start here.',
        body: 'The Prevention of Blindness Society’s Affordable Eyeglasses Clinic offers basic prescription glasses starting at $40, including frames. You need a current prescription dated within the last year and an appointment. Additional lens options cost extra.',
        action: 'Check the $40 clinic option before shopping',
        note: 'Accepted DC, Maryland, and Virginia Medicaid plans may cover eligible glasses at no cost. The clinic does not accept Medicare or other insurance.'
      },
      '50-75': {
        title: 'Working with a $50–$75 budget? Compare low-cost options first.',
        body: 'A local nonprofit clinic lists basic prescription glasses from $40, frames included. That may leave more room in your budget than many retail frames. Ask about lens options and the full price before ordering.',
        action: 'Explore the affordable eyeglasses clinic',
        note: 'A prescription less than one year old and an appointment are required. Accepted Medicaid plans may cover eligible glasses at no cost.'
      },
      '75-100': {
        title: 'With $75–$100, compare the total cost—not just the frame.',
        body: 'Some retail frames in this catalog start at $95 with basic single-vision lenses. The local affordable clinic starts at $40 including frames. Compare lens options, prescription needs, and final checkout totals.',
        action: 'Compare the $40 clinic with retail options',
        note: 'Retail upgrades may increase the final price. The clinic requires a current prescription and an appointment.'
      },
      '100-150': {
        title: 'With $100–$150, compare lens inclusions and benefits.',
        body: 'This catalog includes retail starting prices around $95 and $145. Before choosing, check whether your budget needs to cover lens upgrades, coatings, shipping, or an eye exam. You may also qualify for a lower-cost clinic option.',
        action: 'Review affordable clinic and insurance options',
        note: 'Ask your vision plan about frame allowances, copays, network providers, and prior authorization.'
      },
      '150-200': {
        title: 'With $150–$200, check what your budget includes.',
        body: 'You may have more retail frame choices, but lens upgrades can change the final total. Compare the complete prescription-glasses price and check whether your vision plan offers an allowance or in-network savings.',
        action: 'Review your plan benefits before checkout',
        note: 'If cost is still a concern, the local clinic lists basic glasses from $40, frames included.'
      },
      '200plus': {
        title: 'With a $200+ budget, compare coverage and lens upgrades.',
        body: 'At this range, compare frame quality, lens materials, coatings, progressive options, and warranty terms. Check your insurance allowance before paying out of pocket; a more expensive frame does not necessarily mean better vision coverage.',
        action: 'Check your vision plan and compare total prices',
        note: 'The local affordable clinic remains an option for basic glasses starting at $40, subject to its requirements.'
      }
    }[formData.budget];

    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-gradient-to-r from-violet-700 to-purple-600 text-white py-8 clearsight-results-header">
          <div className="max-w-6xl mx-auto px-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold mb-2">{t('Your Glasses Options', 'Tus opciones de lentes')}</h1>
                {formData.budget && (
                  <p className="text-purple-100 mb-1">
                    {t('Your selected budget:', 'Tu presupuesto seleccionado:')} {budgetRanges.find(b => b.value === formData.budget)?.label}
                  </p>
                )}
                <p className="text-purple-100">{isSpanish ? `Encontramos ${filteredGlasses.length} opciones de lentes para ti` : `Found ${filteredGlasses.length} glasses matching your criteria`}</p>
                <p className="text-purple-200 text-sm mt-2">
                  {t('Coverage is not determined by income alone. Confirm benefits with your insurer or Medicaid plan.', 'La cobertura no se determina únicamente por los ingresos. Confirma los beneficios con tu aseguradora o plan de Medicaid.')}
                </p>
              </div>
              <div className="clearsight-results-actions"><div className="clearsight-language-switch" role="group" aria-label="Language / Idioma"><button type="button" onClick={() => setLanguage('en')} aria-pressed={!isSpanish}>English</button><span>|</span><button type="button" onClick={() => setLanguage('es')} aria-pressed={isSpanish}>Español</button></div><button
                onClick={() => setCurrentStep('form')}
                className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors"
              >
                {t('Edit Search', 'Editar búsqueda')}
              </button></div>
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
                    {t('Available Assistance Programs', 'Programas de asistencia disponibles')}
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

        {budgetGuidance && (
          <section className="max-w-6xl mx-auto px-4 pt-6" aria-labelledby="budget-guidance-heading">
            <div className="rounded-2xl border border-purple-200 bg-purple-50 p-6 md:p-7">
              <p className="text-xs font-semibold uppercase tracking-wider text-purple-700">{t('Your budget guide', 'Tu guía de presupuesto')}</p>
              <h2 id="budget-guidance-heading" className="mt-2 text-xl font-bold text-slate-900 md:text-2xl">{isSpanish ? 'Guía según tu presupuesto' : budgetGuidance.title}</h2>
              <p className="mt-3 max-w-3xl text-sm leading-relaxed text-slate-700">{budgetGuidance.body}</p>
              <a
                href="https://www.youreyes.org/affordable-eyeglasses-clinic/"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center rounded-lg bg-purple-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-purple-800"
              >
                {budgetGuidance.action} ↗
              </a>
              <p className="mt-3 max-w-3xl text-xs leading-relaxed text-slate-600">{budgetGuidance.note}</p>
            </div>
          </section>
        )}

        {eligibilityData?.resources?.some(resource => resource.audience === 'K–12 students') && (
          <section className="max-w-6xl mx-auto px-4 py-6" aria-labelledby="student-vision-heading">
            <div className="mb-5">
              <p className="text-sm font-semibold uppercase tracking-wide text-purple-700">For families and caregivers</p>
              <h2 id="student-vision-heading" className="mt-1 text-2xl font-bold text-slate-900">{t('Free vision support for K–12 students', 'Apoyo visual gratuito para estudiantes K–12')}</h2>
              <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-600">
                Some services are arranged through a participating school or nonprofit; others connect families with participating eye doctors. Check the access steps before contacting a provider.
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {eligibilityData.resources.filter(resource => resource.audience === 'K–12 students').map((resource) => (
                <article key={resource.name} className="rounded-xl border border-purple-200 bg-white p-5 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-wide text-purple-700">{resource.category}</p>
                  <h3 className="mt-2 text-lg font-semibold text-slate-900">{resource.name}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">{resource.description}</p>
                  <p className="mt-3 text-sm leading-relaxed text-slate-600">{resource.eligibility}</p>
                  <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
                    {resource.phone && <a className="font-medium text-purple-700 hover:underline" href={'tel:' + resource.phone.replace(/[^0-9+]/g, '')}>{resource.phone}</a>}
                    {resource.email && <a className="font-medium text-purple-700 hover:underline" href={'mailto:' + resource.email}>{resource.email}</a>}
                    {resource.website && <a className="font-medium text-purple-700 hover:underline" href={resource.website} target="_blank" rel="noopener noreferrer">Program details ↗</a>}
                  </div>
                  <p className="mt-3 text-xs text-slate-400">Information checked November 24, 2026</p>
                </article>
              ))}
            </div>
          </section>
        )}

        {eligibilityData?.resources?.some(resource => resource.audience !== 'K–12 students') && (
          <section className="max-w-6xl mx-auto px-4 py-6" aria-labelledby="vision-resources-heading">
            <div className="mb-5">
              <p className="text-sm font-semibold uppercase tracking-wide text-purple-700">Additional resources</p>
              <h2 id="vision-resources-heading" className="mt-1 text-2xl font-bold text-slate-900">{t('Vision care and eyewear assistance in D.C.', 'Atención visual y ayuda para obtener lentes en D.C.')}</h2>
              <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-600">
                These services have different coverage and access requirements. They are not a determination that you qualify. Contact each provider to confirm current availability, costs, network participation and any required authorization.
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {eligibilityData.resources.filter(resource => resource.audience !== 'K–12 students').map((resource) => (
                <article key={resource.name} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-wide text-purple-700">{resource.category}</p>
                  <h3 className="mt-2 text-lg font-semibold text-slate-900">{resource.name}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">{resource.description}</p>
                  <p className="mt-3 text-sm leading-relaxed text-slate-600">{resource.eligibility}</p>
                  {resource.address && <p className="mt-3 text-sm text-slate-700">{resource.address}</p>}
                  <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
                    {resource.phone && <a className="font-medium text-purple-700 hover:underline" href={'tel:' + resource.phone.replace(/[^0-9+]/g, '')}>{resource.phone}</a>}
                    {resource.email && <a className="font-medium text-purple-700 hover:underline" href={'mailto:' + resource.email}>{resource.email}</a>}
                    {resource.website && <a className="font-medium text-purple-700 hover:underline" href={resource.website} target="_blank" rel="noopener noreferrer">Official program details ↗</a>}
                  </div>
                  <p className="mt-3 text-xs text-slate-400">Information checked November 24, 2026</p>
                </article>
              ))}
            </div>
          </section>
        )}
        
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex flex-wrap gap-4 mb-8 bg-white p-6 rounded-xl shadow-sm">
            <div className="flex items-center space-x-2">
              <Filter className="w-5 h-5 text-gray-500" />
              <span className="font-semibold text-gray-700">{t('Filters:', 'Filtros:')}</span>
            </div>
            
            <select
              value={filters.priceRange}
              onChange={(e) => setFilters({...filters, priceRange: e.target.value})}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500"
            >
              <option value="all">{t('All Prices', 'Todos los precios')}</option>
              <option value="under50">Under $50</option>
              <option value="50-100">$50 - $100</option>
              <option value="over100">Over $100</option>
            </select>
            
            <select
              value={filters.frameStyle}
              onChange={(e) => setFilters({...filters, frameStyle: e.target.value})}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500"
            >
              <option value="all">{t('All Styles', 'Todos los estilos')}</option>
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
                      <a
                        href={glasses.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block w-full bg-slate-800 text-white py-3 px-4 rounded-lg text-sm font-medium hover:bg-slate-700 transition-colors text-center tracking-wide"
                      >
                        View at {glasses.site}
                      </a>
                    </div>
                  </div>
                </div>
            ))}
          </div>
          
          {filteredGlasses.length === 0 && (
            <div className="text-center py-12">
              <Eye className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">{t('No glasses match your filters', 'Ningún lente coincide con tus filtros')}</h3>
              <p className="text-gray-500">{t('Try adjusting your price range or frame style filters', 'Prueba cambiar el rango de precios o el estilo de armazón')}</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  if (currentStep === 'welcome') return <WelcomeScreen />;
  if (currentStep === 'students') return <StudentScreen />;
  if (currentStep === 'form') return <EligibilityForm />;
  if (currentStep === 'results') return <ResultsScreen />;
};

export default GlassesFinder;