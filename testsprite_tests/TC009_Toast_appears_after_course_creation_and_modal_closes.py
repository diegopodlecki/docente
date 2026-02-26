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
        
        # -> Click the 'Cursos' nav button (index 237) to ensure the courses view is active, then click the floating 'add' button (index 128) to open the Add Course modal.
        frame = context.pages[-1]
        # Click element
        elem = frame.locator('xpath=/html/body/div/nav/button[1]').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        
        frame = context.pages[-1]
        # Click element
        elem = frame.locator('xpath=/html/body/div/main/section[1]/div/div[1]/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        
        # -> Enter a user name into the onboarding input and click 'Empezar ahora' to dismiss the welcome modal so the Add Course modal can be used.
        frame = context.pages[-1]
        # Input text
        elem = frame.locator('xpath=/html/body/div[1]/div[3]/div[2]/div/form/input').nth(0)
        await page.wait_for_timeout(3000); await elem.fill('Docente Test')
        
        frame = context.pages[-1]
        # Click element
        elem = frame.locator('xpath=/html/body/div[1]/div[3]/div[2]/div/form/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        
        # -> Fill the course name input with 'Curso Toast' (index 6) as the immediate next action, then fill schedule and click 'Añadir'.
        frame = context.pages[-1]
        # Input text
        elem = frame.locator('xpath=/html/body/div[1]/div[1]/div[2]/form/input[1]').nth(0)
        await page.wait_for_timeout(3000); await elem.fill('Curso Toast')
        
        frame = context.pages[-1]
        # Input text
        elem = frame.locator('xpath=/html/body/div[1]/div[1]/div[2]/form/input[2]').nth(0)
        await page.wait_for_timeout(3000); await elem.fill('Sáb 08:15')
        
        frame = context.pages[-1]
        # Click element
        elem = frame.locator('xpath=/html/body/div[1]/div[1]/div[2]/form/div/button[2]').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        
        # --> Assertions to verify final state
        frame = context.pages[-1]
        await expect(frame.locator('text=Curso añadido').first).to_be_visible(timeout=3000)
        await expect(frame.locator('xpath=/html/body/div[1]/div[1]/div[2]/form').first).to_be_hidden(timeout=3000)
        await asyncio.sleep(5)

    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()

asyncio.run(run_test())
    