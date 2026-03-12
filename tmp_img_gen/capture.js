const fs = require('fs')
const puppeteer = require('puppeteer')
const sharp = require('sharp')
const path = require('path')

;(async () => {
  try {
    console.log('Launching browser to capture specific feature cards...')
    const browser = await puppeteer.launch({ headless: 'new' })
    const page = await browser.newPage()

    // 1200x800 is a standard desktop viewport that shows multiple cards side by side
    await page.setViewport({ width: 1200, height: 1080 })

    // Load the page, avoid networkidle2 which hangs on dev server
    await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded' })

    // Wait 4 seconds for all fonts, images, and animations to settle
    await new Promise((r) => setTimeout(r, 4000))

    // Hide scrollbars just in case
    await page.addStyleTag({
      content: 'body::-webkit-scrollbar { display: none; } body { overflow: hidden !important; }'
    })

    // Find the bounding box that contains BOTH "클릭 한 번으로 N개 마켓 동시 배포" and "귀찮은 이미지 캡쳐/업로드 제로"
    // These are probably in a CSS Grid or Flex container. We want to capture that specific row of cards.
    const targetRect = await page.evaluate(() => {
      // Find all text elements
      const elements = Array.from(document.querySelectorAll('*')).filter((el) => {
        const txt = el.textContent || ''
        return txt.includes('클릭 한 번으로') || txt.includes('귀찮은 이미지 캡쳐')
      })

      if (elements.length === 0) return null

      // The cards themselves
      const card1 =
        elements
          .find((el) => el.textContent.includes('클릭 한 번으로') && el.children.length === 0)
          ?.closest('div') ||
        elements.find((el) => el.textContent.includes('클릭 한 번으로 N개 마켓 동시 배포'))
      const card2 =
        elements
          .find((el) => el.textContent.includes('귀찮은 이미지 캡쳐') && el.children.length === 0)
          ?.closest('div') ||
        elements.find((el) => el.textContent.includes('귀찮은 이미지 캡쳐/업로드 제로'))

      if (!card1) return null

      // Find a common ancestor container that holds the feature grid
      // Let's just find the section that contains these texts, but isn't the whole body
      let container = card1
      while (container && container.tagName !== 'BODY') {
        if (
          container.textContent.includes('클릭 한 번으로 N개 마켓 동시 배포') &&
          container.textContent.includes('귀찮은 이미지 캡쳐/업로드 제로')
        ) {
          // Check if the container is reasonably sized (e.g., width > 600, height < 800)
          const rect = container.getBoundingClientRect()
          if (rect.width > 600 && rect.height < 900 && rect.height > 200) {
            return { x: rect.x, y: rect.y, width: rect.width, height: rect.height }
          }
        }
        container = container.parentElement
      }

      return null
    })

    if (targetRect) {
      console.log('Found feature card container:', targetRect)
      const buffer = await page.screenshot({ clip: targetRect, type: 'png' })

      // Resize to exact 740x416 for Café24, adding an extremely subtle padding if aspect ratio differs to preserve layout
      await sharp(buffer)
        .resize(740, 416, {
          fit: 'contain',
          background: { r: 248, g: 250, b: 252 } // subtle gray/blue from typical Tailwind backgrounds
        })
        .jpeg({ quality: 95 }) // Use 95 quality JPG to stay under 500kb
        .toFile('c:\\wise\\wise-web\\public\\app_banner_740x416_final.jpg')
      console.log('✅ Banner successfully created from exact DOM elements!')
    } else {
      console.error('❌ Could not find the feature cards section on the page.')
    }

    await browser.close()
    process.exit(0)
  } catch (e) {
    console.error('Script failed:', e)
    process.exit(1)
  }
})()
