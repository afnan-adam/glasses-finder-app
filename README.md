# D.C. Glasses Finder - React Web Application 👓

A React web application that helps students and families in Washington D.C. find affordable glasses based on household income and eligibility for assistance programs. Features smart eligibility assessment, personalized recommendations, and inclusive messaging for everyone seeking glasses that fit their budget.

## ✨ New Enhanced Features

- **🏥 Smart Eligibility Assessment**: Personalized recommendations based on household income, size, and D.C. location
- **🖼️ Image Scraping**: Collects and displays actual glasses images with frame style detection
- **🎯 Income Tier System**: 
  - Medicaid Eligible (free options)
  - Low-Income Gap (discount programs)
  - Moderate Income (value-focused)
  - Any Income (full range)
- **💙 Inclusive Messaging**: Focus on "glasses that fit your budget" rather than "low-income only"
- **🏪 Local Resources**: Integration with D.C. Medicaid providers and discount programs
- **📊 Enhanced CSV Export**: Includes images, frame styles, and eligibility information
- **🔍 Frame Style Detection**: Automatic categorization (round, square, aviator, etc.)
- **♿ Comprehensive Workflow**: Guided step-by-step process from assessment to purchase

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Start the Development Server

```bash
npm start
```

### 3. Open in Browser

Navigate to `http://localhost:3000` to access the application.

### 4. Build for Production

```bash
npm run build
```

## 🛠️ Key Features

### 🏥 Eligibility Assessment
**The starting point!** Users can assess their eligibility and get personalized budget recommendations.

**Input Form includes:**
- Household size (1-10 people)
- Annual household income
- D.C. zip code (20001-20099)

### 🔍 Glasses Search & Filter
Browse and filter available glasses options with:
- 🖼️ Image gallery view
- 💰 Price range filtering
- 🔍 Frame style categories (round, square, aviator, etc.)
- 📊 Sort by price and availability

### 🎯 Personalized Recommendations
Get tailored recommendations based on eligibility assessment:
- Shows glasses within your budget
- Prioritizes by affordability
- Includes Medicaid/discount program information
- Frame style preferences

### 📊 Export & Save Results
- Export search results to CSV
- Save favorite glasses
- Print-friendly recommendation lists
- Include images and eligibility information

## 🏥 Income Tier System

Our enhanced system provides personalized recommendations based on D.C. income guidelines:

### 🔴 Medicaid Eligible (≤ D.C. Medicaid Limit)
- **Budget Focus**: $0-$50 (prioritize FREE options)
- **Resources**: D.C. Medicaid vision benefits, Martha's Table Eye Care
- **Message**: "You may qualify for free glasses through D.C. Medicaid!"

### 🔵 Low-Income Gap (138%-200% of Medicaid Limit)
- **Budget Focus**: $0-$100
- **Resources**: Discount programs, Warby Parker Pupils Project, OneSight
- **Message**: "You're in the coverage gap - check discount programs first"

### 🟢 Moderate Income (200%-300% of Medicaid Limit)  
- **Budget Focus**: $50-$200
- **Resources**: Local D.C. stores, online retailers with good value
- **Message**: "You have moderate flexibility - focus on value and quality"

### ⚪ Any Income (Above 300% of Medicaid Limit)
- **Budget Focus**: $0-$500+ (full range)
- **Resources**: All options available
- **Message**: "You have budget flexibility - explore all options!"

## 🔄 User Workflow

1. **🏠 Complete Eligibility Assessment**: Enter household size, income, and D.C. zip code
2. **🔍 Browse Glasses**: View available options with images and pricing
3. **🎯 Get Personalized Recommendations**: See glasses that fit your budget and style
4. **💾 Export or Save**: Download results or save favorites for later
5. **🏪 Connect with Resources**: Access Medicaid providers and discount program contacts

## 🔧 Technology Stack

**Frontend:**
- React.js with hooks and functional components
- CSS modules or styled-components for styling
- Responsive design for mobile and desktop

**Key Dependencies:**
- React Router for navigation
- Axios for API calls
- Material-UI or similar component library
- Chart.js for data visualization (income brackets, price distributions)

**Data Management:**
- Local state with useState and useContext
- Local storage for saving user preferences
- CSV export functionality

## 🛡️ Privacy & Data Protection

This application is designed with user privacy and ethical data practices in mind:

- ✅ All eligibility assessments processed locally (no server storage)
- ✅ No personal information sent to external services
- ✅ Only uses publicly available glasses retailer data
- ✅ Transparent about data sources and pricing information
- ✅ User preferences stored locally in browser only

## 🤝 Inclusive Design

This React application helps **everyone** find glasses that fit their budget and style preferences. The inclusive approach means:

- **🏥 Medicaid users**: Guided to free/low-cost options first  
- **💙 Low-income families**: Connected with discount programs
- **💚 Moderate income**: Focus on value and quality options
- **✨ All income levels**: Full access to find the perfect fit

The app provides a welcoming experience with: *"Thank you for using D.C. Glasses Finder! We hope this helps you find the perfect pair that fits your budget and style."*

## 📄 Project Structure

```
Glasses Project/
├── public/
│   ├── index.html              # Main HTML template
│   └── manifest.json           # App manifest
├── src/
│   ├── components/             # React components
│   │   ├── EligibilityForm.js  # Income/household assessment
│   │   ├── GlassesGallery.js   # Glasses display grid
│   │   ├── FilterPanel.js      # Search and filter controls
│   │   └── RecommendationList.js # Personalized suggestions
│   ├── data/
│   │   ├── glassesData.js      # Sample glasses data
│   │   └── eligibilityRules.js # D.C. income guidelines
│   ├── utils/
│   │   ├── csvExport.js        # CSV download functionality
│   │   └── storageHelpers.js   # Local storage utilities
│   ├── App.js                  # Main application component
│   ├── App.css                 # Global styles
│   └── index.js                # Application entry point
├── package.json                # Dependencies and scripts
└── README.md                   # Project documentation
```

## 🔍 Troubleshooting

**Application won't start:**
- Ensure Node.js is installed (version 14+ recommended)
- Run `npm install` to install all dependencies
- Check that port 3000 is available or set PORT environment variable

**Eligibility assessment not working:**
- Verify D.C. zip codes are in valid range (20001-20099)
- Ensure household size is between 1-10 people
- Annual income should be a positive number

**Data not loading:**
- Check browser console for JavaScript errors
- Verify sample data files exist in src/data/
- Clear browser cache and local storage if needed

**CSV export not working:**
- Ensure browser allows file downloads
- Check that data exists before attempting export
- Verify CSV export utility is properly imported

---

🎯 **Thank you for using the D.C. Glasses Finder React App!** This application helps **everyone** in D.C. find glasses that fit their budget and style preferences - from Medicaid recipients to any income level. 👓✨