const fs = require('fs')
const puppeteer = require('puppeteer')
const sharp = require('sharp')
const path = require('path')

;(async () => {
  try {
    console.log('Launching browser to capture specific 2 feature cards...')
    const browser = await puppeteer.launch({ headless: 'new' })
    const page = await browser.newPage()

    // Use a standard viewport for the desktop layout grid
    await page.setViewport({ width: 1200, height: 1080 })

    await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded' })

    await new Promise((r) => setTimeout(r, 4000))

    await page.addStyleTag({
      content: 'body::-webkit-scrollbar { display: none; } body { overflow: hidden !important; }'
    })

    // Find the bounding box that contains "클릭 한 번으로 N개 마켓 동시 배포" and "귀찮은 이미지 캡쳐/업로드 제로"
    const targetRect = await page.evaluate(() => {
      const elements = Array.from(document.querySelectorAll('*')).filter((el) => {
        const txt = el.textContent || ''
        return (
          txt.includes('클릭 한 번으로 N개 마켓 동시 배포') ||
          txt.includes('귀찮은 이미지 캡쳐/업로드 제로')
        )
      })

      if (elements.length === 0) return null

      const card1 = elements
        .find(
          (el) =>
            el.textContent.includes('클릭 한 번으로 N개 마켓 동시 배포') && el.children.length === 0
        )
        ?.closest('div')

      if (!card1) return null

      let container = card1
      while (container && container.tagName !== 'BODY') {
        if (
          container.textContent.includes('클릭 한 번으로 N개 마켓 동시 배포') &&
          container.textContent.includes('귀찮은 이미지 캡쳐/업로드 제로')
        ) {
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
      console.log('Found full container:', targetRect)

      // WE ONLY WANT THE FIRST TWO CARDS (Left 66% width of the 3-column container)
      // Reduce the width to approx 66% to cut off the 3rd card on the right
      const twoCardsRect = {
        x: targetRect.x,
        y: targetRect.y,
        width: targetRect.width * 0.68, // slightly more than 66% for padding, but not enough to catch text of 3rd
        height: targetRect.height
      }

      console.log('Cropped to 2 cards:', twoCardsRect)
      const buffer = await page.screenshot({ clip: twoCardsRect, type: 'png' })

      await sharp(buffer)
        .resize(740, 416, {
          fit: 'contain',
          background: { r: 248, g: 250, b: 252 }
        })
        .jpeg({ quality: 95 })
        .toFile('c:\\wise\\wise-web\\public\\app_banner_740x416_final.jpg')
      console.log('✅ Banner successfully created and isolated to 2 cards!')
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
