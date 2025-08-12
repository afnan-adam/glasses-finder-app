#!/usr/bin/env python3
"""
MCP Server for Comprehensive Glasses Finder

This server provides personalized glasses recommendations for all income levels
by scraping glasses information and assessing individual eligibility for
various assistance programs in Washington D.C.
"""

import asyncio
import json
from typing import Any, Sequence, Dict, List, Optional
import logging

from mcp.server.models import InitializationOptions
from mcp.server import NotificationOptions, Server
from mcp.server.stdio import stdio_server
from mcp.types import (
    Resource,
    Tool,
    TextContent,
    ImageContent,
    EmbeddedResource,
    LoggingLevel,
    Annotations,
)

def create_glasses_finder_ui(step="welcome", data=None):
    """
    Create an interactive React-style UI for the glasses finder.
    Returns HTML with embedded CSS/JS formatted for Claude artifact rendering.
    """
    
    # Sample glasses data for the UI
    sample_glasses = [
        {"name": "Griffin", "price": "$95", "style": "round", "features": "Acetate frame, anti-reflective coating"},
        {"name": "Percey", "price": "$95", "style": "square", "features": "Metal frame, blue light filtering"},
        {"name": "Chamberlain", "price": "$145", "style": "aviator", "features": "Titanium frame, progressive lenses"},
        {"name": "Durand", "price": "$45", "style": "rectangular", "features": "Basic acetate frame, durable"},
        {"name": "Burke", "price": "$35", "style": "round", "features": "Simple plastic frame, comfortable"},
        {"name": "Caldwell", "price": "$25", "style": "classic", "features": "Ultra-budget frame, essential eyewear"},
        {"name": "Haskell", "price": "$65", "style": "cat-eye", "features": "Mid-range acetate, stylish design"},
        {"name": "Welty", "price": "$85", "style": "square", "features": "Premium acetate, modern style"}
    ]
    
    # Wrap HTML in artifact markers to help Claude recognize it as renderable content
    html_content = f"""
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>D.C. Glasses Finder</title>
    <style>
        * {{
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }}
        
        body {{
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            color: #333;
        }}
        
        .app-container {{
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
            min-height: 100vh;
        }}
        
        .header {{
            text-align: center;
            color: white;
            margin-bottom: 30px;
        }}
        
        .header h1 {{
            font-size: 2.5rem;
            margin-bottom: 10px;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
        }}
        
        .header p {{
            font-size: 1.1rem;
            opacity: 0.9;
        }}
        
        .step-container {{
            background: white;
            border-radius: 20px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            overflow: hidden;
            animation: slideIn 0.5s ease-out;
        }}
        
        @keyframes slideIn {{
            from {{
                opacity: 0;
                transform: translateY(20px);
            }}
            to {{
                opacity: 1;
                transform: translateY(0);
            }}
        }}
        
        .welcome-screen {{
            text-align: center;
            padding: 60px 40px;
        }}
        
        .welcome-screen h2 {{
            font-size: 2rem;
            color: #333;
            margin-bottom: 20px;
        }}
        
        .welcome-screen p {{
            font-size: 1.1rem;
            color: #666;
            margin-bottom: 40px;
            line-height: 1.6;
        }}
        
        .btn-primary {{
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            padding: 16px 32px;
            border-radius: 50px;
            font-size: 1.1rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            box-shadow: 0 8px 16px rgba(102, 126, 234, 0.3);
        }}
        
        .btn-primary:hover {{
            transform: translateY(-2px);
            box-shadow: 0 12px 24px rgba(102, 126, 234, 0.4);
        }}
        
        .form-container {{
            padding: 40px;
            display: none;
        }}
        
        .form-container.active {{
            display: block;
        }}
        
        .form-group {{
            margin-bottom: 25px;
        }}
        
        .form-group label {{
            display: block;
            margin-bottom: 8px;
            font-weight: 600;
            color: #333;
        }}
        
        .form-group input, .form-group select {{
            width: 100%;
            padding: 12px 16px;
            border: 2px solid #e1e5e9;
            border-radius: 10px;
            font-size: 1rem;
            transition: border-color 0.3s ease;
        }}
        
        .form-group input:focus, .form-group select:focus {{
            outline: none;
            border-color: #667eea;
            box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }}
        
        .results-container {{
            display: none;
            padding: 30px;
        }}
        
        .results-container.active {{
            display: block;
        }}
        
        .filters {{
            display: flex;
            gap: 15px;
            margin-bottom: 30px;
            flex-wrap: wrap;
        }}
        
        .filter-group {{
            display: flex;
            flex-direction: column;
            min-width: 150px;
        }}
        
        .filter-group label {{
            font-size: 0.9rem;
            color: #666;
            margin-bottom: 5px;
        }}
        
        .filter-group select {{
            padding: 8px 12px;
            border: 1px solid #ddd;
            border-radius: 8px;
            background: white;
        }}
        
        .glasses-grid {{
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
            gap: 20px;
        }}
        
        .glasses-card {{
            background: white;
            border-radius: 15px;
            padding: 20px;
            box-shadow: 0 8px 16px rgba(0,0,0,0.1);
            transition: all 0.3s ease;
            border: 2px solid transparent;
        }}
        
        .glasses-card:hover {{
            transform: translateY(-5px);
            box-shadow: 0 12px 24px rgba(0,0,0,0.15);
            border-color: #667eea;
        }}
        
        .glasses-image {{
            width: 100%;
            height: 150px;
            background: linear-gradient(45deg, #f8f9fa, #e9ecef);
            border-radius: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 15px;
            position: relative;
            overflow: hidden;
        }}
        
        .glasses-icon {{
            width: 80px;
            height: 40px;
            position: relative;
        }}
        
        .glasses-icon.round::before,
        .glasses-icon.round::after {{
            content: '';
            position: absolute;
            width: 30px;
            height: 30px;
            border: 3px solid #667eea;
            border-radius: 50%;
            top: 5px;
        }}
        
        .glasses-icon.round::before {{
            left: 0;
        }}
        
        .glasses-icon.round::after {{
            right: 0;
        }}
        
        .glasses-icon.square::before,
        .glasses-icon.square::after {{
            content: '';
            position: absolute;
            width: 30px;
            height: 30px;
            border: 3px solid #667eea;
            border-radius: 4px;
            top: 5px;
        }}
        
        .glasses-icon.square::before {{
            left: 0;
        }}
        
        .glasses-icon.square::after {{
            right: 0;
        }}
        
        .glasses-icon::after {{
            border-top: 3px solid #667eea;
            content: '';
            position: absolute;
            width: 14px;
            height: 0;
            top: 17px;
            left: 33px;
        }}
        
        .glasses-info h3 {{
            font-size: 1.2rem;
            color: #333;
            margin-bottom: 8px;
        }}
        
        .glasses-price {{
            font-size: 1.4rem;
            font-weight: bold;
            color: #667eea;
            margin-bottom: 10px;
        }}
        
        .glasses-features {{
            font-size: 0.9rem;
            color: #666;
            line-height: 1.4;
        }}
        
        .style-tag {{
            display: inline-block;
            background: linear-gradient(135deg, #667eea, #764ba2);
            color: white;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 0.8rem;
            margin-bottom: 10px;
        }}
        
        .navigation {{
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 20px 40px;
            background: #f8f9fa;
        }}
        
        .btn-secondary {{
            background: #6c757d;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 25px;
            cursor: pointer;
            transition: all 0.3s ease;
        }}
        
        .btn-secondary:hover {{
            background: #545b62;
            transform: translateY(-1px);
        }}
        
        .progress-bar {{
            height: 4px;
            background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
            margin-bottom: 20px;
            border-radius: 2px;
        }}
        
        .eligibility-result {{
            background: linear-gradient(135deg, #28a745, #20c997);
            color: white;
            padding: 20px;
            border-radius: 15px;
            margin-bottom: 20px;
            text-align: center;
        }}
        
        .eligibility-result h3 {{
            margin-bottom: 10px;
        }}
        
        @media (max-width: 768px) {{
            .app-container {{
                padding: 10px;
            }}
            
            .header h1 {{
                font-size: 2rem;
            }}
            
            .glasses-grid {{
                grid-template-columns: 1fr;
            }}
            
            .filters {{
                flex-direction: column;
            }}
        }}
    </style>
</head>
<body>
    <div class="app-container">
        <div class="header">
            <h1>👓 D.C. Glasses Finder</h1>
            <p>Find affordable glasses that fit your budget in Washington D.C.</p>
        </div>
        
        <div class="progress-bar" id="progressBar" style="width: 33%;"></div>
        
        <div class="step-container">
            <!-- Welcome Screen -->
            <div id="welcomeScreen" class="welcome-screen">
                <h2>Welcome to Your Personalized Glasses Finder</h2>
                <p>We'll help you find glasses that fit your budget by assessing your eligibility for assistance programs and showing you the most affordable options available in Washington D.C.</p>
                <button class="btn-primary" onclick="showForm()">🚀 Start Finding Glasses</button>
            </div>
            
            <!-- Eligibility Form -->
            <div id="formScreen" class="form-container">
                <h2 style="margin-bottom: 30px; text-align: center;">Tell Us About Your Household</h2>
                <form id="eligibilityForm">
                    <div class="form-group">
                        <label for="householdSize">👥 Household Size</label>
                        <select id="householdSize" required>
                            <option value="">Select number of people</option>
                            <option value="1">1 person</option>
                            <option value="2">2 people</option>
                            <option value="3">3 people</option>
                            <option value="4">4 people</option>
                            <option value="5">5 people</option>
                            <option value="6">6 people</option>
                            <option value="7">7 people</option>
                            <option value="8">8+ people</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label for="annualIncome">💰 Annual Household Income (before taxes)</label>
                        <input type="number" id="annualIncome" placeholder="e.g., 45000" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="zipCode">📍 D.C. Zip Code</label>
                        <input type="text" id="zipCode" placeholder="e.g., 20009" pattern="^20[0-9]{{3}}$" required>
                    </div>
                    
                    <div class="navigation">
                        <button type="button" class="btn-secondary" onclick="showWelcome()">← Back</button>
                        <button type="submit" class="btn-primary">Continue to Results →</button>
                    </div>
                </form>
            </div>
            
            <!-- Results Screen -->
            <div id="resultsScreen" class="results-container">
                <div id="eligibilityResult" class="eligibility-result">
                    <h3>🎯 Your Eligibility: <span id="tierName">Moderate Income</span></h3>
                    <p>Recommended Budget: <span id="budgetRange">$50-$200</span></p>
                </div>
                
                <div class="filters">
                    <div class="filter-group">
                        <label>💰 Price Range</label>
                        <select id="priceFilter" onchange="filterGlasses()">
                            <option value="all">All Prices</option>
                            <option value="0-50">Under $50</option>
                            <option value="50-100">$50 - $100</option>
                            <option value="100-200">$100 - $200</option>
                            <option value="200+">$200+</option>
                        </select>
                    </div>
                    
                    <div class="filter-group">
                        <label>👓 Frame Style</label>
                        <select id="styleFilter" onchange="filterGlasses()">
                            <option value="all">All Styles</option>
                            <option value="round">Round</option>
                            <option value="square">Square</option>
                            <option value="rectangular">Rectangular</option>
                            <option value="aviator">Aviator</option>
                            <option value="cat-eye">Cat Eye</option>
                            <option value="classic">Classic</option>
                        </select>
                    </div>
                    
                    <div class="filter-group">
                        <label>🔄 Sort By</label>
                        <select id="sortFilter" onchange="filterGlasses()">
                            <option value="price-low">Price: Low to High</option>
                            <option value="price-high">Price: High to Low</option>
                            <option value="name">Name A-Z</option>
                        </select>
                    </div>
                </div>
                
                <div id="glassesGrid" class="glasses-grid">
                    <!-- Glasses cards will be populated by JavaScript -->
                </div>
                
                <div class="navigation">
                    <button type="button" class="btn-secondary" onclick="showForm()">← Edit Information</button>
                    <button type="button" class="btn-primary" onclick="exportResults()">📊 Export Results</button>
                </div>
            </div>
        </div>
    </div>
    
    <script>
        // Glasses data
        const glassesData = {str(sample_glasses).replace("'", '"')};
        
        let currentGlasses = [...glassesData];
        let eligibilityData = null;
        
        function showWelcome() {{
            document.getElementById('welcomeScreen').style.display = 'block';
            document.getElementById('formScreen').style.display = 'none';
            document.getElementById('resultsScreen').style.display = 'none';
            updateProgress(33);
        }}
        
        function showForm() {{
            document.getElementById('welcomeScreen').style.display = 'none';
            document.getElementById('formScreen').style.display = 'block';
            document.getElementById('resultsScreen').style.display = 'none';
            updateProgress(66);
        }}
        
        function showResults() {{
            document.getElementById('welcomeScreen').style.display = 'none';
            document.getElementById('formScreen').style.display = 'none';
            document.getElementById('resultsScreen').style.display = 'block';
            updateProgress(100);
            renderGlasses();
        }}
        
        function updateProgress(percentage) {{
            document.getElementById('progressBar').style.width = percentage + '%';
        }}
        
        // Handle form submission
        document.getElementById('eligibilityForm').addEventListener('submit', function(e) {{
            e.preventDefault();
            
            const householdSize = parseInt(document.getElementById('householdSize').value);
            const annualIncome = parseInt(document.getElementById('annualIncome').value);
            const zipCode = document.getElementById('zipCode').value;
            
            // Calculate eligibility (simplified)
            const medicaidLimits = {{
                1: 20783, 2: 28207, 3: 35632, 4: 43056,
                5: 50481, 6: 57905, 7: 65330, 8: 72754
            }};
            
            const limit = medicaidLimits[Math.min(householdSize, 8)];
            let tier, budgetRange;
            
            if (annualIncome <= limit) {{
                tier = "Medicaid Eligible";
                budgetRange = "$0-$50";
            }} else if (annualIncome <= limit * 2) {{
                tier = "Low-Income Gap";
                budgetRange = "$0-$100";
            }} else if (annualIncome <= limit * 3) {{
                tier = "Moderate Income";
                budgetRange = "$50-$200";
            }} else {{
                tier = "Any Income";
                budgetRange = "$0-$500";
            }}
            
            document.getElementById('tierName').textContent = tier;
            document.getElementById('budgetRange').textContent = budgetRange;
            
            eligibilityData = {{ tier, budgetRange, householdSize, annualIncome, zipCode }};
            
            showResults();
        }});
        
        function renderGlasses() {{
            const grid = document.getElementById('glassesGrid');
            grid.innerHTML = '';
            
            currentGlasses.forEach(glasses => {{
                const card = document.createElement('div');
                card.className = 'glasses-card';
                card.innerHTML = `
                    <div class="glasses-image">
                        <div class="glasses-icon ${{glasses.style}}"></div>
                    </div>
                    <div class="glasses-info">
                        <div class="style-tag">${{glasses.style}}</div>
                        <h3>${{glasses.name}}</h3>
                        <div class="glasses-price">${{glasses.price}}</div>
                        <div class="glasses-features">${{glasses.features}}</div>
                    </div>
                `;
                grid.appendChild(card);
            }});
        }}
        
        function filterGlasses() {{
            const priceFilter = document.getElementById('priceFilter').value;
            const styleFilter = document.getElementById('styleFilter').value;
            const sortFilter = document.getElementById('sortFilter').value;
            
            let filtered = [...glassesData];
            
            // Filter by price
            if (priceFilter !== 'all') {{
                const [min, max] = priceFilter.includes('+') ? [200, 1000] : priceFilter.split('-').map(Number);
                filtered = filtered.filter(glasses => {{
                    const price = parseInt(glasses.price.replace('$', ''));
                    return price >= min && (max ? price <= max : true);
                }});
            }}
            
            // Filter by style
            if (styleFilter !== 'all') {{
                filtered = filtered.filter(glasses => glasses.style === styleFilter);
            }}
            
            // Sort
            if (sortFilter === 'price-low') {{
                filtered.sort((a, b) => parseInt(a.price.replace('$', '')) - parseInt(b.price.replace('$', '')));
            }} else if (sortFilter === 'price-high') {{
                filtered.sort((a, b) => parseInt(b.price.replace('$', '')) - parseInt(a.price.replace('$', '')));
            }} else if (sortFilter === 'name') {{
                filtered.sort((a, b) => a.name.localeCompare(b.name));
            }}
            
            currentGlasses = filtered;
            renderGlasses();
        }}
        
        function exportResults() {{
            alert('Export functionality would save your results to CSV or PDF!');
        }}
        
        // Initialize
        showWelcome();
    </script>
</body>
</html>"""
    
    # Return HTML content formatted for artifact rendering
    return html_content

# Import our enhanced scraper functionality
from glasses_scraper import GlassesScraper

# Create MCP server instance
server = Server("glasses-finder")

# Global scraper instance to maintain state
scraper_instance = GlassesScraper()

# Global variables to store user eligibility
user_eligibility = None

def format_glasses_list(glasses_data):
    """
    Format glasses data for Claude request.
    Returns clean bullet list of glasses options.
    """
    result = ""
    for glasses in glasses_data:
        name = glasses.get('name', 'Unknown')
        price = glasses.get('price', 'Price not available')
        style = glasses.get('frame_style', 'classic').title()
        features = glasses.get('features', 'Standard features')[:60] + '...' if len(glasses.get('features', '')) > 60 else glasses.get('features', 'Standard features')
        
        result += f"• {name} - {price} ({style} frame) - {features}\n"
    
    return result

def create_glasses_finder_response(household_size, income, zip_code, tier, budget_range, glasses_data):
    """
    Create structured response with data + request for Claude to create artifact.
    """
    return f"""Based on your household information, I've calculated your eligibility for affordable glasses in Washington D.C.

**Your Assessment Results:**
- Household Size: {household_size} people
- Annual Income: ${income:,}
- ZIP Code: {zip_code}
- Eligibility Tier: {tier}
- Recommended Budget: {budget_range}

**Available Glasses ({len(glasses_data)} options found):**
{format_glasses_list(glasses_data)}

Claude, please create an interactive D.C. Glasses Finder artifact with:
1. Welcome screen with purple/blue gradient design
2. Eligibility form pre-filled with the above data  
3. Results page showing these glasses as filterable cards
4. Modern styling with hover effects and smooth animations
5. Price and style filters (Round, Square, Aviator, Cat-eye, etc.)
6. Mobile-responsive layout

This will help the user explore their affordable glasses options in an interactive interface."""

def add_thank_you_message(result: str) -> str:
    """Add thank you message to any result from the glasses tools."""
    return f"{result}\n\n✨ Thank you for using our glasses finder! We hope this helps you find the perfect pair that fits your budget and style. 👓"

@server.list_tools()
async def handle_list_tools() -> list[Tool]:
    """List available tools for the comprehensive glasses finder."""
    return [
        Tool(
            name="start_glasses_search",
            description="🔍 I want to find glasses! Perfect for: 'I need glasses', 'help me find glasses', 'looking for affordable glasses', 'glasses in DC'. This tool starts the step-by-step process to find glasses that fit your budget.",
            inputSchema={
                "type": "object",
                "properties": {},
                "required": []
            }
        ),
        Tool(
            name="assess_glasses_options",
            description="🏠 Assess eligibility for glasses assistance in D.C. Provide your household info to get personalized recommendations and budget guidance.",
            inputSchema={
                "type": "object",
                "properties": {
                    "household_size": {
                        "type": "integer",
                        "description": "Number of people in your household (1-15)",
                        "minimum": 1,
                        "maximum": 15
                    },
                    "annual_income": {
                        "type": "integer",
                        "description": "Total annual household income in dollars (before taxes)",
                        "minimum": 0
                    },
                    "zip_code": {
                        "type": "string",
                        "description": "Your D.C. zip code - must be valid D.C. area (e.g., 20001, 20009, 20036, 20016)"
                    }
                },
                "required": ["household_size", "annual_income", "zip_code"]
            }
        ),
        Tool(
            name="scrape_warby_parker",
            description="Scrape glasses data from Warby Parker website with images and detailed information. Includes frame styles and specifications.",
            inputSchema={
                "type": "object",
                "properties": {
                    "max_pages": {
                        "type": "integer",
                        "description": "Maximum number of pages to scrape (default: 3)",
                        "default": 3,
                        "minimum": 1,
                        "maximum": 10
                    }
                },
                "required": []
            }
        ),
        Tool(
            name="get_personalized_recommendations",
            description="Get personalized glasses recommendations based on your eligibility assessment. Use after running 'assess_glasses_options'.",
            inputSchema={
                "type": "object",
                "properties": {
                    "show_images": {
                        "type": "boolean",
                        "description": "Include image URLs in recommendations (default: true)",
                        "default": True
                    },
                    "frame_style_preference": {
                        "type": "string",
                        "description": "Preferred frame style (optional)",
                        "enum": ["round", "square", "rectangular", "aviator", "cat-eye", "classic"]
                    }
                },
                "required": []
            }
        ),
        Tool(
            name="save_glasses_to_csv",
            description="Save scraped glasses data to a CSV file for easy viewing in Excel or Google Sheets.",
            inputSchema={
                "type": "object",
                "properties": {
                    "filename": {
                        "type": "string",
                        "description": "Name of the CSV file to create",
                        "default": "glasses_finder_results.csv"
                    },
                    "include_categories": {
                        "type": "boolean",
                        "description": "Include price category information in the CSV",
                        "default": True
                    }
                },
                "required": []
            }
        ),
        Tool(
            name="get_glasses_summary",
            description="Get a comprehensive summary of all available glasses data, including price ranges, frame styles, and availability by income tier.",
            inputSchema={
                "type": "object",
                "properties": {},
                "required": []
            }
        ),
        Tool(
            name="test_image_display",
            description="Test image display compatibility in Claude Desktop with different image formats and fallback options.",
            inputSchema={
                "type": "object",
                "properties": {
                    "include_svg_placeholders": {
                        "type": "boolean",
                        "description": "Show SVG placeholder examples (default: true)",
                        "default": True
                    }
                },
                "required": []
            }
        ),
        Tool(
            name="show_glasses_ui",
            description="🎨 Show the interactive glasses finder UI - perfect for testing the new React-style interface with cards, filters, and modern styling.",
            inputSchema={
                "type": "object",
                "properties": {
                    "step": {
                        "type": "string",
                        "description": "Which step to show: welcome, form, or results",
                        "enum": ["welcome", "form", "results"],
                        "default": "welcome"
                    }
                },
                "required": []
            }
        )
    ]

@server.call_tool()
async def handle_call_tool(name: str, arguments: dict | None) -> list[TextContent | ImageContent]:
    """Handle tool calls for comprehensive glasses finder functionality."""
    global user_eligibility
    
    if arguments is None:
        arguments = {}
    
    try:
        if name == "start_glasses_search":
            # Get sample glasses data to show what's available
            if not scraper_instance.glasses_data:
                scraper_instance.scrape_warby_parker()
            
            sample_glasses = scraper_instance.glasses_data[:8]  # First 8 for display
            
            response = f"""Welcome to the D.C. Glasses Finder! I'll help you find affordable glasses that fit your budget.

**Available Glasses Options ({len(sample_glasses)} sample options):**
{format_glasses_list(sample_glasses)}

Claude, please create an interactive D.C. Glasses Finder artifact with:
1. **Welcome screen** with purple/blue gradient background and "Start Finding Glasses" button
2. **Eligibility form** with fields for household size, income, and ZIP code
3. **Results page** showing the glasses above as interactive cards with filters
4. Modern styling with hover effects, smooth animations, and mobile-responsive design
5. Price range filters (Under $50, $50-$100, etc.) and frame style filters

This will create a complete glasses finder experience for Washington D.C. residents!"""
            
            return [TextContent(type="text", text=response)]
            
        elif name == "assess_glasses_options":
            household_size = arguments["household_size"]
            annual_income = arguments["annual_income"]
            zip_code = arguments["zip_code"]
            
            # Perform eligibility assessment with enhanced error handling
            try:
                user_eligibility = scraper_instance.assess_eligibility(household_size, annual_income, zip_code)
                # Also scrape glasses data automatically
                if not scraper_instance.glasses_data:
                    scraper_instance.scrape_warby_parker()
                    
            except ValueError as e:
                # Return error with instructions for form
                error_instructions = f"""There was an issue with your eligibility information: {str(e)}

Please create an HTML form artifact with:
- Error message prominently displayed in red
- Form fields for: Household Size (1-15), Annual Income ($0+), D.C. Zip Code (20XXX)
- Validation hints and examples
- Professional styling with error states

Valid D.C. zip codes include: 20001-20020, 20024, 20026-20027, 20029-20030, 20032, 20036-20037, etc."""
                return [TextContent(type="text", text=error_instructions)]
            except Exception as e:
                error_instructions = f"""An unexpected error occurred: {str(e)}

Please create an error display with retry instructions and contact information for assistance."""
                return [TextContent(type="text", text=error_instructions)]
            
            # Get personalized recommendations and use the new response pattern
            recommendations = scraper_instance.get_personalized_recommendations(user_eligibility)
            filtered_glasses = recommendations['top_recommendations'][:10]  # Top 10 recommendations
            
            budget_range = f"${user_eligibility['budget_range'][0]}-${user_eligibility['budget_range'][1]}"
            
            response = create_glasses_finder_response(
                household_size=household_size,
                income=annual_income,
                zip_code=zip_code,
                tier=user_eligibility['tier_name'],
                budget_range=budget_range,
                glasses_data=filtered_glasses
            )
            
            return [TextContent(type="text", text=response)]
        
        elif name == "get_personalized_recommendations":
            if user_eligibility is None:
                return [TextContent(type="text", text=add_thank_you_message("Please run 'assess_glasses_options' first to get personalized recommendations."))]
            
            if not scraper_instance.glasses_data:
                return [TextContent(type="text", text=add_thank_you_message("No glasses data available. Please run 'scrape_warby_parker' first."))]
            
            show_images = arguments.get("show_images", True)
            frame_preference = arguments.get("frame_style_preference")
            
            # Get personalized recommendations
            recommendations = scraper_instance.get_personalized_recommendations(user_eligibility)
            
            result = f"🎯 Personalized Glasses Recommendations\n\n"
            result += f"For {user_eligibility['tier_name']} (Budget: {recommendations['budget_range']})\n"
            result += f"{recommendations['priority_message']}\n\n"
            result += f"Found {recommendations['total_options']} glasses within your budget:\n\n"
            
            # Filter by frame style if requested
            top_recs = recommendations['top_recommendations']
            if frame_preference:
                top_recs = [g for g in top_recs if g.get('frame_style', '').lower() == frame_preference.lower()]
            
            for i, glasses in enumerate(top_recs[:8], 1):  # Show top 8
                result += f"{i}. {glasses['name']} - ${glasses['numeric_price']}\n"
                result += f"   Style: {glasses.get('frame_style', 'Classic')} frame\n"
                result += f"   Features: {glasses['features'][:80]}...\n"
                if show_images and glasses.get('image_url'):
                    # Create HTML img tag with fallback handling for Claude Desktop
                    image_url = glasses['image_url']
                    fallback_url = glasses.get('image_fallback', "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==")
                    
                    # Create multiple fallback options
                    result += f"   🖼️ **Image**: <img src='{image_url}' alt='{glasses['name']} glasses' width='200' height='150' style='border-radius: 8px; border: 1px solid #ddd;' onerror='this.onerror=null; this.src=\"{fallback_url}\"; this.alt=\"[Image unavailable - {glasses['name']}]\"'/>\n"
                result += f"   🔗 {glasses['url']}\n\n"
            
            if frame_preference and len(top_recs) < len(recommendations['top_recommendations']):
                result += f"\n💡 Filtered by {frame_preference} frames. Remove filter to see all options.\n"
            
            result += f"\n📊 Summary by Frame Style:\n"
            style_counts = {}
            for glasses in recommendations['top_recommendations']:
                style = glasses.get('frame_style', 'Classic')
                style_counts[style] = style_counts.get(style, 0) + 1
            
            for style, count in sorted(style_counts.items()):
                result += f"• {style.title()}: {count} options\n"
            
            return [TextContent(type="text", text=add_thank_you_message(result))]
        
        elif name == "scrape_warby_parker":
            max_pages = arguments.get("max_pages", 3)
            
            # Scrape Warby Parker with enhanced feedback
            try:
                glasses_data = scraper_instance.scrape_warby_parker(max_pages=max_pages)
                
                # Check if we got real data or sample data
                if len(glasses_data) == 8:  # Our sample data has 8 items
                    result = f"🔄 **Using Enhanced Sample Data** ({len(glasses_data)} glasses)\n\n"
                    result += "⚠️  Warby Parker blocks automated requests, so we're using comprehensive sample data with:\n"
                    result += "• ✅ **Claude Desktop optimized images** with fallback support\n"
                    result += "• ✅ **Working product links** to Warby Parker\n"
                    result += "• ✅ Diverse price range ($25-$145)\n"
                    result += "• ✅ Multiple frame styles (round, square, aviator, cat-eye, etc.)\n"
                    result += "• ✅ All income tiers represented\n\n"
                else:
                    result = f"✅ Successfully scraped {len(glasses_data)} glasses from Warby Parker with images!\n\n"
                
            except Exception as e:
                return [TextContent(type="text", text=add_thank_you_message(f"❌ Error during scraping: {str(e)}"))]
            
            result += "Sample glasses with details:\n"
            
            for i, glasses in enumerate(glasses_data[:5]):  # Show first 5
                result += f"{i+1}. {glasses['name']} - {glasses['price']}\n"
                result += f"   Style: {glasses.get('frame_style', 'Classic')} frame\n"
                result += f"   Features: {glasses['features'][:60]}...\n"
                if glasses.get('image_url'):
                    # Enhanced image display for scraping summary
                    image_url = glasses['image_url']
                    fallback_url = glasses.get('image_fallback', "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==")
                    result += f"   🖼️ **Preview**: <img src='{image_url}' alt='{glasses['name']} glasses' width='150' height='100' style='border-radius: 6px; border: 1px solid #ccc; margin: 4px 0;' onerror='this.onerror=null; this.src=\"{fallback_url}\"; this.alt=\"[Preview unavailable]\"'/>\n"
                result += "\n"
            
            if len(glasses_data) > 5:
                result += f"...and {len(glasses_data) - 5} more glasses!\n\n"
            
            result += f"📊 Database Summary:\n"
            result += f"• Total glasses: {len(scraper_instance.glasses_data)}\n"
            
            # Show price range
            prices = [scraper_instance._extract_price(g.get('price', '')) for g in glasses_data]
            valid_prices = [p for p in prices if p is not None]
            if valid_prices:
                result += f"• Price range: ${min(valid_prices)} - ${max(valid_prices)}\n"
            
            # Show frame styles
            styles = [g.get('frame_style', 'Classic') for g in glasses_data]
            unique_styles = list(set(styles))
            result += f"• Frame styles: {', '.join(unique_styles[:4])}{'...' if len(unique_styles) > 4 else ''}\n"
            
            if user_eligibility:
                result += f"\n🎯 Ready for personalized recommendations! Use 'get_personalized_recommendations' next."
            
            return [TextContent(type="text", text=add_thank_you_message(result))]
        
        elif name == "save_glasses_to_csv":
            if not scraper_instance.glasses_data:
                return [TextContent(type="text", text=add_thank_you_message("No glasses data available. Please scrape some glasses first using 'scrape_warby_parker'."))]
            
            filename = arguments.get("filename", "glasses_finder_results.csv")
            include_categories = arguments.get("include_categories", True)
            
            scraper_instance.save_to_csv(filename, categorized=include_categories)
            
            result = f"✅ Glasses data saved to '{filename}'!\n\n"
            result += f"Total glasses saved: {len(scraper_instance.glasses_data)}\n"
            result += f"Categorized by price: {'Yes' if include_categories else 'No'}\n\n"
            result += "You can now open this CSV file in:\n"
            result += "• Excel\n• Google Sheets\n• Any spreadsheet application\n\n"
            result += "The CSV includes columns for:\n"
            result += "• Site name\n• Glasses name\n• Price\n• Features\n• URL\n• Frame style\n• Image URL"
            
            if include_categories:
                result += "\n• Price category\n• Numeric price (for sorting)"
            
            return [TextContent(type="text", text=add_thank_you_message(result))]
        
        elif name == "get_glasses_summary":
            if not scraper_instance.glasses_data:
                return [TextContent(type="text", text=add_thank_you_message("No glasses data available. Please scrape some glasses first using 'scrape_warby_parker'."))]
            
            total_glasses = len(scraper_instance.glasses_data)
            
            # Calculate price statistics
            numeric_prices = []
            for glasses in scraper_instance.glasses_data:
                price = scraper_instance._extract_price(glasses.get('price', ''))
                if price is not None:
                    numeric_prices.append(price)
            
            result = f"📊 Comprehensive Glasses Database Summary\n\n"
            result += f"Total glasses available: {total_glasses}\n"
            
            if numeric_prices:
                min_price = min(numeric_prices)
                max_price = max(numeric_prices)
                avg_price = sum(numeric_prices) / len(numeric_prices)
                
                result += f"\n💰 Price Analysis:\n"
                result += f"• Range: ${min_price} - ${max_price}\n"
                result += f"• Average: ${avg_price:.2f}\n"
                
                # Count by income tiers
                medicaid_count = sum(1 for p in numeric_prices if p <= 50)
                low_income_count = sum(1 for p in numeric_prices if p <= 100)
                moderate_count = sum(1 for p in numeric_prices if 50 < p <= 200)
                
                result += f"\n🏥 Options by Income Tier:\n"
                result += f"• Medicaid Eligible (≤$50): {medicaid_count} glasses\n"
                result += f"• Low-Income Gap (≤$100): {low_income_count} glasses\n"
                result += f"• Moderate Income ($50-$200): {moderate_count} glasses\n"
            
            # Frame style analysis
            styles = [g.get('frame_style', 'Classic') for g in scraper_instance.glasses_data]
            style_counts = {}
            for style in styles:
                style_counts[style] = style_counts.get(style, 0) + 1
            
            result += f"\n🔶️ Frame Styles Available:\n"
            for style, count in sorted(style_counts.items()):
                result += f"• {style.title()}: {count} glasses\n"
            
            result += f"\n🌐 Data Sources:\n"
            sites = set(glasses.get('site', 'Unknown') for glasses in scraper_instance.glasses_data)
            for site in sites:
                site_count = sum(1 for glasses in scraper_instance.glasses_data if glasses.get('site') == site)
                result += f"• {site}: {site_count} glasses\n"
            
            return [TextContent(type="text", text=add_thank_you_message(result))]
            
        elif name == "test_image_display":
            include_svg = arguments.get("include_svg_placeholders", True)
            
            result = f"🧪 **Claude Desktop Image Compatibility Test**\n\n"
            result += f"Testing placeholder.com URLs to see what works:\n\n"
            
            # Test basic placeholder URLs
            result += f"📋 **Basic Placeholder Test:**\n\n"
            
            test_images = [
                ('Basic Test', 'https://via.placeholder.com/300x200/cccccc/666666?text=Test'),
                ('Glasses Text', 'https://via.placeholder.com/300x200/f0f0f0/333333?text=Glasses'),
                ('Round Frame', 'https://via.placeholder.com/300x200/e8e8e8/444444?text=Round+Frame'),
                ('Picsum Random', 'https://picsum.photos/300/200?random=1'),
                ('DummyImage', 'https://dummyimage.com/300x200/f0f0f0/333&text=Frame')
            ]
            
            fallback = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=="
            
            for name, url in test_images:
                result += f"**{name}:**\n"
                result += f"<img src='{url}' alt='{name} test' width='300' height='200' style='border: 1px solid #ddd; border-radius: 4px; margin: 4px;' onerror='this.onerror=null; this.src=\"{fallback}\"; this.alt=\"[{name} failed to load]\"'/>\n\n"
            
            result += f"🔧 **Current Test Setup:**\n"
            result += f"• 🔄 Replaced base64 SVG with via.placeholder.com URLs\n"
            result += f"• 🔄 Testing multiple placeholder services\n"
            result += f"• ✅ Multi-level fallback system still in place\n"
            result += f"• ✅ Proper HTML img tags with onerror handling\n\n"
            
            result += f"📊 **What We're Testing:**\n"
            result += f"• 🤔 via.placeholder.com - Simple text placeholders\n"
            result += f"• 🤔 picsum.photos - Random photos\n"
            result += f"• 🤔 dummyimage.com - Alternative placeholder service\n"
            result += f"• ✅ Data URLs (transparent pixel) - Known to work\n\n"
            
            result += f"💡 **Next Steps:**\n"
            result += f"1. Restart Claude Desktop\n"
            result += f"2. Run scrape_warby_parker to see if placeholder images display\n"
            result += f"3. If they work, we'll make them glasses-specific\n"
            result += f"4. If they don't work, we'll try PNG/JPG format instead\n\n"
            
            result += f"🎯 **Goal:** Find ANY external image URL that displays in Claude Desktop!"
            
            return [TextContent(type="text", text=add_thank_you_message(result))]
        
        elif name == "show_glasses_ui":
            step = arguments.get("step", "welcome")
            
            # Create sample data for testing
            if step == "results":
                sample_eligibility = {
                    'tier_name': 'Moderate Income',
                    'budget_range': (50, 200)
                }
                sample_data = {
                    'eligibility': sample_eligibility,
                    'glasses': scraper_instance._get_sample_data() if hasattr(scraper_instance, '_get_sample_data') else []
                }
            else:
                sample_data = None
                
            ui_html = create_glasses_finder_ui(step, sample_data)
            
            # Use the simple pattern for testing different UI steps
            if step == "welcome":
                response = """I'll create a welcome screen for the D.C. Glasses Finder.

Claude, please create an interactive D.C. Glasses Finder artifact with:
1. **Welcome screen** with purple/blue gradient background
2. Large header "👓 D.C. Glasses Finder" 
3. Subtitle "Find affordable glasses that fit your budget in Washington D.C."
4. "Start Finding Glasses" button with hover animations
5. Modern, professional styling with clean typography

This creates the entry point for the glasses finder experience."""

            elif step == "results":
                # Get sample data for results display
                sample_glasses = scraper_instance._get_sample_data() if hasattr(scraper_instance, '_get_sample_data') else []
                sample_glasses = sample_glasses[:8]  # First 8 for display
                
                response = f"""Here's a sample results dashboard for the glasses finder.

**Sample Glasses Options:**
{format_glasses_list(sample_glasses)}

Claude, please create an interactive D.C. Glasses Finder artifact with:
1. **Results dashboard** showing the glasses above as filterable cards
2. **Eligibility display** showing "Moderate Income Tier, Budget: $50-$200"
3. **Interactive filters** for price range and frame style
4. **Glasses cards** with hover effects and professional styling
5. Modern gradient background and mobile-responsive layout

This demonstrates the personalized recommendations interface."""

            else:  # form
                response = """I'll create an eligibility assessment form for the glasses finder.

Claude, please create an interactive D.C. Glasses Finder artifact with:
1. **Eligibility form** with fields for household size, income, and ZIP code
2. **Progress bar** showing current step
3. **Form validation** with helpful error messages
4. **Navigation buttons** (Back/Continue)
5. Professional styling with gradient background and card layout

This form collects information to determine glasses assistance eligibility."""
            
            return [TextContent(type="text", text=response)]
        
        else:
            return [TextContent(type="text", text=f"Unknown tool: {name}")]
    
    except Exception as e:
        error_msg = f"Error executing {name}: {str(e)}"
        return [TextContent(type="text", text=add_thank_you_message(error_msg))]

async def main():
    """Main function to run the MCP server."""
    async with stdio_server() as (read_stream, write_stream):
        await server.run(
            read_stream,
            write_stream,
            InitializationOptions(
                server_name="glasses-finder",
                server_version="2.0.0",
                capabilities=server.get_capabilities(
                    notification_options=NotificationOptions(),
                    experimental_capabilities={},
                ),
            ),
        )

if __name__ == "__main__":
    asyncio.run(main())