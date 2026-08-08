import asyncio
import os
import sys
from playwright.async_api import async_playwright

async def main():
    repo_url = "https://github.com/Bhumika6725/TradeTrack"
    print("Initializing Playwright...")
    try:
        async with async_playwright() as p:
            # Launch headed browser so the user can log in/sign up
            print("Launching headed Chrome browser...")
            browser = await p.chromium.launch(
                headless=False,
                channel="chrome",
                args=["--no-sandbox", "--disable-setuid-sandbox"]
            )
            
            # Create a page
            page = await browser.new_page()
            
            print("Navigating to Render Login/Register page...")
            await page.goto("https://dashboard.render.com/register", timeout=60000)
            
            print("\n=== ACTION REQUIRED ===")
            print("Please use the opened Chrome window to Sign Up or Log In to Render.")
            print("We are waiting for you to complete the login/signup process...")
            
            # Wait until the user is logged in.
            # We detect login success by checking if the URL contains dashboard.render.com and is not login/register
            while True:
                current_url = page.url
                if "dashboard.render.com" in current_url and "login" not in current_url and "register" not in current_url:
                    print("Login detected! Proceeding to repository selection...")
                    break
                await asyncio.sleep(2)
            
            # Navigate directly to the web service repository selection page
            print("Navigating to Render Web Service creator...")
            await page.goto("https://dashboard.render.com/select-repo?type=web", timeout=60000)
            await page.wait_for_load_state("networkidle")
            
            # Find the public repository input field and enter the repo URL
            print("Entering GitHub repository URL...")
            # Let's wait for any input with placeholder containing github.com or similar
            input_selector = "input[placeholder*='github.com'], input[placeholder*='Git'], input[id*='public']"
            await page.wait_for_selector(input_selector, timeout=30000)
            await page.fill(input_selector, repo_url)
            
            # Find and click the "Connect" or "Continue" button next to public repo
            connect_button = "button:has-text('Connect'), button:has-text('Continue'), input[type='submit']"
            await page.click(connect_button)
            
            print("Connecting repository...")
            # Wait for the service configuration form to load
            name_selector = "input[id*='name'], input[name*='name']"
            await page.wait_for_selector(name_selector, timeout=45000)
            
            print("Filling in deployment details...")
            # Fill in Name
            service_name = f"tradetrack-pro-{int(asyncio.get_event_loop().time() % 1000)}"
            await page.fill(name_selector, service_name)
            
            # Build command (should be: pip install -r requirements.txt)
            build_selector = "input[id*='buildCommand'], input[name*='buildCommand'], input[placeholder*='build']"
            try:
                await page.wait_for_selector(build_selector, timeout=5000)
                await page.fill(build_selector, "pip install -r requirements.txt")
            except Exception:
                print("Build command field not found or already filled, skipping...")
                
            # Start command (should be: gunicorn app:app)
            start_selector = "input[id*='startCommand'], input[name*='startCommand'], input[placeholder*='start']"
            try:
                await page.wait_for_selector(start_selector, timeout=5000)
                await page.fill(start_selector, "gunicorn app:app")
            except Exception:
                print("Start command field not found or already filled, skipping...")
                
            # Select Free tier if instance plan selection is available
            try:
                free_plan_selector = "div:has-text('Free'), button:has-text('Free'), label:has-text('Free')"
                if await page.query_selector(free_plan_selector):
                    await page.click(free_plan_selector)
            except Exception:
                pass
                
            # Scroll to bottom and click "Deploy Web Service" or "Create Web Service"
            create_button = "button:has-text('Deploy'), button:has-text('Create'), button[type='submit']"
            await page.click(create_button)
            
            print("Deploying Web Service on Render...")
            # Wait for the URL to change to the service details page
            await page.wait_for_url("**/web/srv-*", timeout=60000)
            print("Service created successfully!")
            
            # Extract the public URL
            await page.wait_for_selector("a[href*='.onrender.com']", timeout=30000)
            app_url_element = await page.query_selector("a[href*='.onrender.com']")
            app_url = await app_url_element.get_attribute("href")
            
            print("\n==============================================")
            print(f"DEPLOYMENT INITIATED!")
            print(f"Public URL: {app_url}")
            print("==============================================\n")
            
            print("Waiting for deployment to complete (this might take 2-4 minutes)...")
            await asyncio.sleep(120)
            
            print(f"\nFinal check: {app_url} is deploying. Please keep this browser window open until the logs show 'Live'.")
            await browser.close()
            
    except Exception as e:
        print("\nAn error occurred during automation:", e)
        print("You can manually complete the form in the browser window if it is still open.")
        await asyncio.sleep(300)

if __name__ == "__main__":
    asyncio.run(main())
