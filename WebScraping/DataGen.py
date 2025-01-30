import time
import pandas as pd
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.common.by import By

# Setup Selenium WebDriver
def setup_driver():
    chrome_options = Options()
    chrome_options.add_argument("--headless")  # Run in headless mode (no UI)
    chrome_options.add_argument("--disable-gpu")
    chrome_options.add_argument("--window-size=1920x1080")
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")

    service = Service(ChromeDriverManager().install())
    driver = webdriver.Chrome(service=service, options=chrome_options)
    return driver

# Function to scrape symptoms and related conditions from NHS
def scrape_nhs():
    print("📌 Scraping NHS UK...")
    driver = setup_driver()
    url = "https://www.nhs.uk/conditions/"
    driver.get(url)
    time.sleep(3)  # Allow page to load

    data = []

    while True:
        # Get all links to conditions on the current page
        links = [elem.get_attribute("href") for elem in driver.find_elements(By.CSS_SELECTOR, "ul.nhsuk-list li a")]

        # Loop through each link and scrape data
        for link in links:
            driver.get(link)
            time.sleep(2)  # Allow page to load

            try:
                name = driver.find_element(By.TAG_NAME, "h1").text.strip()
            except:
                name = "Unknown Condition"

            symptoms = []
            try:
                # Look for symptoms section
                symptom_section = driver.find_element(By.XPATH, "//h2[contains(text(), 'Symptoms')]/following-sibling::ul")
                symptoms = [li.text.strip() for li in symptom_section.find_elements(By.TAG_NAME, "li")]
            except Exception:
                pass  # Skip if no symptoms are found

            data.append({"condition": name, "symptoms": ", ".join(symptoms)})

        # Check if the next page exists and go to it
        try:
            next_button = driver.find_element(By.CSS_SELECTOR, "a[aria-label='Next']")
            if "disabled" in next_button.get_attribute("class"):
                break  # No more pages, exit loop
            next_button.click()  # Click the "Next" button
            time.sleep(3)  # Allow next page to load
        except Exception:
            break  # No next button found, exit loop

    driver.quit()
    print(f"✅ NHS UK: {len(data)} records")
    return pd.DataFrame(data)

# Save dataset
def save_dataset():
    nhs_data = scrape_nhs()
    nhs_data.to_csv("medical_dataset.csv", index=False)
    print("✅ Dataset saved as medical_dataset.csv!")

# Run script
if __name__ == "__main__":
    save_dataset()
