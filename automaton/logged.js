const path = require('path');
const puppeteer = require('puppeteer');

const { sleep } = require('../utils/utils');

module.exports = async () => {
    const browser = await puppeteer.launch({
        headless: 'new',
        defaultViewport: null,
        args: ['--start-maximized', '--disable-notifications', '--no-sandbox'],
        userDataDir: path.join(__dirname, 'userData'),
    });

    const page = await browser.newPage();
    if(process.env.USE_USER_AGENT == "true"){
        await page.setUserAgent('Mozilla/5.0 (Linux; Android 13; SM-A037U) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Mobile Safari/537.36 uacq');
    }
    try {
        const loginURL = 'https://www.facebook.com/login';

        await page.goto(loginURL);
        await sleep(5000);
        if ((await page.url()) !== loginURL) {
            await browser.close();
            return {
                success: true,
                error: null,
            };
        } else {
            await browser.close();
            return {
                success: false,
                error: {
                    code: 701,
                    type: 'Puppeteer error.',
                    moment: 'Checking if user is already logged in.',
                    message: "The user isn't logged in.",
                },
            };
        }
    } catch (err) {
        await browser.close();

        return {
            success: false,
            error: {
                code: 500,
                type: 'Internal server error.',
                moment: 'Checking if the user is already logged in.',
                message: err.toString(),
            },
        };
    }
};
