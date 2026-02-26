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
        
        # -> Enter a name into the welcome modal and click 'Empezar ahora' to reach the main application view.
        frame = context.pages[-1]
        # Input text
        elem = frame.locator('xpath=/html/body/div/div[3]/div[2]/div/form/input').nth(0)
        await page.wait_for_timeout(3000); await elem.fill('Docente Test')
        
        frame = context.pages[-1]
        # Click element
        elem = frame.locator('xpath=/html/body/div/div[3]/div[2]/div/form/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        
        # -> Click the 'Cursos' navigation button to ensure the courses view is active, then open the Add Course modal by clicking the '+' button.
        frame = context.pages[-1]
        # Click element
        elem = frame.locator('xpath=/html/body/div[1]/nav/button[1]').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        
        frame = context.pages[-1]
        # Click element
        elem = frame.locator('xpath=/html/body/div[1]/main/section[1]/div/div[1]/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        
        # -> Fill the course name input (index 4) with 'Historia - Progreso 0', fill the schedule input (index 5) with 'Vie 10:30', then click the 'Añadir' button (index 358).
        frame = context.pages[-1]
        # Input text
        elem = frame.locator('xpath=/html/body/div[1]/div[1]/div[2]/form/input[1]').nth(0)
        await page.wait_for_timeout(3000); await elem.fill('Historia - Progreso 0')
        
        frame = context.pages[-1]
        # Input text
        elem = frame.locator('xpath=/html/body/div[1]/div[1]/div[2]/form/input[2]').nth(0)
        await page.wait_for_timeout(3000); await elem.fill('Vie 10:30')
        
        frame = context.pages[-1]
        # Click element
        elem = frame.locator('xpath=/html/body/div[1]/div[1]/div[2]/form/div/button[2]').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        
        # --> Assertions to verify final state
        frame = context.pages[-1]
        frame = context.pages[-1]
        elem = frame.locator('xpath=/html/body/div[1]/div[1]/div[2]/form/input[1]').nth(0)
        assert await elem.is_visible()
        assert await elem.input_value() == 'Historia - Progreso 0'
        
        elem = frame.locator('xpath=/html/body/div[1]/div[1]/div[2]/form/input[2]').nth(0)
        assert await elem.is_visible()
        assert await elem.input_value() == 'Vie 10:30'
        
        elem = frame.locator('xpath=/html/body/div[1]/main/section[1]/div/div[2]/article[3]/div[2]/div/div[1]/span[2]').nth(0)
        assert await elem.is_visible()
        text = (await elem.inner_text()).strip()
        assert text == '0%'
        await asyncio.sleep(5)

    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()

asyncio.run(run_test())
    