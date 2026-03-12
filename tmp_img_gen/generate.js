const puppeteer = require('puppeteer')
const sharp = require('sharp')
const path = require('path')
const fs = require('fs')

;(async () => {
  try {
    // 1. App Icon: 100x100
    const logoPath = 'c:\\wise\\wise-web\\public\\logo.png'
    const iconOut = 'c:\\wise\\wise-web\\public\\app_icon_100x100.png'

    // Resize taking aspect ratio into account and padding with transparent background
    await sharp(logoPath)
      .resize(100, 100, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 0 }
      })
      .toFile(iconOut)
    console.log('✅ App icon saved to: ' + iconOut)

    // 2. Banner: 740x416
    const bannerOut = 'c:\\wise\\wise-web\\public\\app_banner_740x416.jpg'

    console.log('Launching browser to capture localhost...')
    const browser = await puppeteer.launch({ headless: 'new' })
    const page = await browser.newPage()

    // Exact viewport size requested for the rep image
    await page.setViewport({ width: 740, height: 416, deviceScaleFactor: 1 })

    await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' })

    // Hide scrollbars so they don't appear in the screenshot
    await page.addStyleTag({
      content:
        'body::-webkit-scrollbar { display: none; } body { -ms-overflow-style: none; scrollbar-width: none; overflow: hidden !important; }'
    })

    // Wait for animations to settle
    await new Promise((r) => setTimeout(r, 2000))

    // Capture screenshot of exactly the viewport bounds, saving as optimized JPG
    await page.screenshot({
      path: bannerOut,
      type: 'jpeg',
      quality: 90,
      clip: { x: 0, y: 0, width: 740, height: 416 }
    })

    await browser.close()
    console.log('✅ Banner saved to: ' + bannerOut)
  } catch (e) {
    console.error('Error generating assets:', e)
    process.exit(1)
  }
})()
