require('dotenv').config();

module.exports = {
    PORT: process.env.PORT || 3000,
    WEBHOOK_VERIFY_TOKEN: process.env.WEBHOOK_VERIFY_TOKEN,
    GRAPH_API_TOKEN: process.env.GRAPH_API_TOKEN,
    PHONE_NUMBER_ID: process.env.PHONE_NUMBER_ID,
    GEMINI_API_KEY: process.env.GEMINI_API_KEY,
    DATABASE_URL: process.env.DATABASE_URL
};
