const express = require('express');
const { chromium } = require('playwright');
const bodyParser = require('body-parser');
const fetch = require('node-fetch');
const { time } = require('console');
const app = express();
const port = 3333;
require('dotenv').config();


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Allow serving static files (e.g., the HTML file)
app.use(express.static('public'));

app.use(express.json());


async function scrapeWebsite(url) {
    const browser = await chromium.launch();
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle' });
    await page.waitForSelector('body',{timeout: 10000});
    const webtext = await page.evaluate(() => document.body.innerText);
    await browser.close();
    return webtext;
}

app.post('/scrape', async (req, res) => {
    const { url } = req.body;
    try {
        const webtext = await scrapeWebsite(url);
        res.send({ webtext });
    } catch (error) {
        res.status(500).send({ error: 'Failed to scrape the website' });
    }
});

app.post('/api/proxy', async (req, res) => {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
        },
        body: JSON.stringify(req.body)
    });

    const data = await response.json();
    res.json(data);
});




app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});