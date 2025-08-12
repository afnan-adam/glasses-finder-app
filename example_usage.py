"""
Example usage script for the glasses scraper.

This script demonstrates how to use the GlassesScraper class to:
1. Scrape glasses data from websites
2. Categorize glasses by price for low-income families  
3. Save results to CSV

Run this script after installing dependencies:
pip install -r requirements.txt
python example_usage.py
"""

from glasses_scraper import GlassesScraper

def main():
    print("=== Affordable Glasses Scraper Demo ===\n")
    
    # Step 1: Create the scraper
    # The delay parameter adds a pause between requests to be respectful to websites
    scraper = GlassesScraper(delay=1.0)
    print("✓ Scraper created with 1-second delay between requests")
    
    # Step 2: Scrape Warby Parker
    print("\n--- Scraping Warby Parker ---")
    warby_parker_glasses = scraper.scrape_warby_parker(max_pages=1)
    print(f"Found {len(warby_parker_glasses)} glasses from Warby Parker")
    
    # Step 3: Categorize by price ranges suitable for different budgets
    print("\n--- Categorizing by Price ---")
    
    # You can customize price ranges based on your target audience
    custom_price_ranges = {
        'Super Budget': (0, 75),        # Under $75 - very affordable
        'Budget-Friendly': (75, 125),   # $75-$125 - reasonable for families
        'Mid-Range': (125, 200),        # $125-$200 - still accessible
        'Higher-End': (200, 1000)       # Over $200 - premium options
    }
    
    categorized_glasses = scraper.categorize_by_price(custom_price_ranges)
    
    # Print detailed results
    print("\nDetailed breakdown:")
    for category, glasses_list in categorized_glasses.items():
        if glasses_list:
            print(f"\n{category} ({len(glasses_list)} glasses):")
            for glasses in glasses_list:
                price = glasses.get('numeric_price', 'N/A')
                print(f"  • {glasses['name']} - ${price} - {glasses['features'][:50]}...")
    
    # Step 4: Save to CSV file
    print("\n--- Saving to CSV ---")
    scraper.save_to_csv('dc_affordable_glasses.csv', categorized=True)
    
    # Show what the CSV contains
    print("\nYour CSV file contains these columns:")
    print("• Site: Where the glasses are from")
    print("• Name: Model name of the glasses")
    print("• Price: Original price text")
    print("• Numeric_Price: Price as a number for sorting")
    print("• Price_Category: Budget category")
    print("• Features: Description of features/materials")
    print("• URL: Link to the website")
    
    print("\n=== Next Steps ===")
    print("1. Open 'dc_affordable_glasses.csv' in Excel or Google Sheets")
    print("2. Sort by Price_Category to find the most affordable options")
    print("3. Filter by features you need (e.g., 'blue light', 'prescription')")
    print("4. To add more sites, create a new scraper function following the Warby Parker example")

def show_how_to_add_new_sites():
    """
    Example of how you can add new websites to scrape.
    This function shows the pattern you'd follow.
    """
    print("\n=== How to Add New Sites ===")
    
    print("""
To add a new website (like LensCrafters, Zenni, etc.):

1. Create a new method in the GlassesScraper class:
   def scrape_lenscrafters(self):
       # Visit the website
       # Find the glasses containers 
       # Extract name, price, features
       # Return list of dictionaries

2. Follow this structure for each glasses item:
   {
       'site': 'LensCrafters',
       'name': 'Frame Name',
       'price': '$XX',
       'features': 'Description of features',
       'url': 'https://website-url.com'
   }

3. Add the new scraper to your main script:
   lenscrafters_glasses = scraper.scrape_lenscrafters()

The categorization and CSV export will automatically work with new sites!
    """)

if __name__ == "__main__":
    main()
    show_how_to_add_new_sites()