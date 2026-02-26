import asyncio
from playwright import async_api
from playwright.async_api import expect

async def run_test():
    pw = None
    browser = None
    context = None

    try:
        # Start a Playwright session in asynchronous mode
        pw = await async_api.async_playwright().start()

        # Launch a Chromium browser in headless mode with custom arguments
        browser = await pw.chromium.launch(
            headless=True,
            args=[
                "--window-size=1280,720",         # Set the browser window size
                "--disable-dev-shm-usage",        # Avoid using /dev/shm which can cause issues in containers
                "--ipc=host",                     # Use host-level IPC for better stability
                "--single-process"                # Run the browser in a single process mode
            ],
        )

        # Create a new browser context (like an incognito window)
        context = await browser.new_context()
        context.set_default_timeout(5000)

        # Open a new page in the browser context
        page = await context.new_page()

        # Interact with the page elements to simulate user flow
        # -> Navigate to http://localhost:5173/index.html
        await page.goto("http://localhost:5173/index.html", wait_until="commit", timeout=10000)
        
        # -> Click the 'Cursos' navigation button (interactive element index 237) to open the Cursos view.
        frame = context.pages[-1]
        # Click element
        elem = frame.locator('xpath=/html/body/div/nav/button[1]').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        
        # -> Fill the welcome modal name input and click 'Empezar ahora' to dismiss the modal so the Cursos view and course cards become visible.
        frame = context.pages[-1]
        # Input text
        elem = frame.locator('xpath=/html/body/div[1]/div[3]/div[2]/div/form/input').nth(0)
        await page.wait_for_timeout(3000); await elem.fill('Docente Test')
        
        frame = context.pages[-1]
        # Click element
        elem = frame.locator('xpath=/html/body/div[1]/div[3]/div[2]/div/form/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        
        # --> Assertions to verify final state
        frame = context.pages[-1]
        # --- Assertions for Cursos view and course cards ---
        # Verify the 'Cursos' nav button (contains the text 'Cursos') is visible
        assert await frame.locator('xpath=/html/body/div[1]/nav/button[1]').is_visible(), 'Cursos navigation button is not visible'
        
        # Verify the course list area is present (using the add button inside the courses section)
        assert await frame.locator('xpath=/html/body/div[1]/main/section[1]/div/div[1]/button').is_visible(), 'Course list area (add button) is not visible'
        
        # Verify a course card progress indicator is visible and contains the expected summary text
        progress_locator = frame.locator('xpath=/html/body/div[1]/main/section[1]/div/div[2]/article[1]/div[2]/div/div[1]/span[2]')
        assert await progress_locator.is_visible(), 'Course card progress indicator is not visible'
        progress_text = await progress_locator.inner_text()
        assert '65%' in progress_text, f"Expected '65%' in course progress text, got: {progress_text!r}"
        await asyncio.sleep(5)

    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()

asyncio.run(run_test())
    