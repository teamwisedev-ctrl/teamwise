import dotenv from 'dotenv'

const out = dotenv.config({ path: '.env.local' })
console.log('Parsed env:', out.parsed?.GA_PROPERTY_ID)
