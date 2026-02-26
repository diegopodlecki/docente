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
        
        # -> Click the 'Notas' navigation button (index 17) to open the grades/performance view.
        frame = context.pages[-1]
        # Click element
        elem = frame.locator('xpath=/html/body/div/nav/button[4]').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        
        # -> Enter a name in the onboarding input and click 'Empezar ahora' to dismiss the modal so the app content (including the 'Notas' view) can be verified.
        frame = context.pages[-1]
        # Input text
        elem = frame.locator('xpath=/html/body/div[1]/div[3]/div[2]/div/form/input').nth(0)
        await page.wait_for_timeout(3000); await elem.fill('Docente Test')
        
        frame = context.pages[-1]
        # Click element
        elem = frame.locator('xpath=/html/body/div[1]/div[3]/div[2]/div/form/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        
        # -> Click the 'Notas' nav button again (index 17) to confirm that clicking the active nav button keeps the same view visible.
        frame = context.pages[-1]
        # Click element
        elem = frame.locator('xpath=/html/body/div[1]/nav/button[4]').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        
        # --> Assertions to verify final state
        frame = context.pages[-1]
        # Assert the 'view-notas' section is visible by checking the Exportar Excel button inside section[4]
        frame = context.pages[-1]
        elem = frame.locator('xpath=/html/body/div/main/section[4]/div/div[2]/div/div[1]/button').nth(0)
        assert await elem.is_visible()
        
        # Clicked the active 'Notas' nav button again earlier; verify the same view remains visible
        elem = frame.locator('xpath=/html/body/div/main/section[4]/div/div[2]/div/div[1]/button').nth(0)
        assert await elem.is_visible()
        
        # Verify the text '8.5' is visible in the notas view (use the first 8.5 element)
        elem = frame.locator('xpath=/html/body/div/main/section[4]/div/div[2]/div/div[2]/div[2]').nth(0)
        assert await elem.is_visible()
        text = await elem.inner_text()
        assert '8.5' in text
        await asyncio.sleep(5)

    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()

asyncio.run(run_test())
    