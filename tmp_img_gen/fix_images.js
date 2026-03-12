const fs = require('fs')
const sharp = require('sharp')
const path = require('path')

;(async () => {
  try {
    console.log('Generating App Icon...')
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <rect width="100" height="100" fill="white" stroke="none" />
            <path d="M12 2L2 7l10 5 10-5-10-5z" />
            <path d="M2 17l10 5 10-5" />
            <path d="M2 12l10 5 10-5" />
        </svg>`

    await sharp(Buffer.from(svg))
      .png()
      .toFile('c:\\wise\\wise-web\\public\\app_icon_100x100_final.png')
    console.log('✅ Icon generated!')

    console.log('Resizing best AI banner...')
    const brainDir =
      'C:\\Users\\shw\\.gemini\\antigravity\\brain\\8ade4764-377a-49ab-80a3-179f388b12e9'
    const files = fs.readdirSync(brainDir)
    const bannerFile = files.find((f) => f.startsWith('mo2_promo_banner_v2') && f.endsWith('.png'))

    if (bannerFile) {
      const bannerPath = path.join(brainDir, bannerFile)
      await sharp(bannerPath)
        .resize(740, 416, { fit: 'cover' })
        .jpeg({ quality: 90 })
        .toFile('c:\\wise\\wise-web\\public\\app_banner_740x416_final.jpg')
      console.log('✅ Banner resized!')
    } else {
      console.log('Banner V2 not found! Generating a generic blue placeholder instead.')
      await sharp({
        create: {
          width: 740,
          height: 416,
          channels: 3,
          background: { r: 59, g: 130, b: 246 }
        }
      })
        .jpeg({ quality: 90 })
        .toFile('c:\\wise\\wise-web\\public\\app_banner_740x416_final.jpg')
      console.log('✅ Placeholder Banner generated!')
    }

    process.exit(0)
  } catch (e) {
    console.error(e)
    process.exit(1)
  }
})()
