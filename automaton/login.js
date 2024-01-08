const path = require('path');
const puppeteer = require('puppeteer');

const { sleep } = require('../utils/utils');

const login = async (username, password) => {
    // Check if an XPath exists on the page?.
    const XPathExists = async (XPath) => {
        try {
            if (await page?.waitForXPath(XPath, { timeout: 2500 })) {
                return true;
            } else {
                return false;
            }
        } catch (err) {
            return false;
        }
    };
    const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: null,
        args: ['--start-maximized', '--disable-notifications'],
        userDataDir: path.join(__dirname, 'userData'),
    });

    const page = await browser.newPage();
    if (process.env.USE_USER_AGENT == "true") {
        await page.setUserAgent('Mozilla/5.0 (Linux; Android 13; SM-A037U) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Mobile Safari/537.36 uacq');
    }
    // Open the Facebook Login Page.
    try {
        const loginURL = 'https://m.facebook.com/login';

        await page.goto(loginURL);
        await page.waitForNetworkIdle();
        await sleep(2000)
        // if ((await page.url()) !== loginURL) {
        //     await browser.close();

        //     return {
        //         success: true,
        //         error: null,
        //     };
        // }
    } catch (err) {
        if (err) {
            await browser.close();

            return {
                success: false,
                error: {
                    code: 701,
                    type: 'Puppeteer error.',
                    moment: 'Opening the Facebook login page.',
                    message: err.toString(),
                },
            };
        }
    }
    // If there is an authentication required to account 
    if (await XPathExists("/html/body/div[1]/div/div[3]/div[1]/div/div[2]/div/div[3]/form/div[4]/div[1]/div/div/input")) {
        try {
            const emailField = await page.$('input[name="email"]');
            await emailField.type(process.env.FB_USERNAME);

            const passwordField = await page.$('input[name="pass"]');
            await passwordField.type(process.env.FB_PASSWORD);

            await page.keyboard.press('Escape');

            const [login] = await page?.$x(`//span[text()='Log In']`);
            await login.evaluate((s) => s.click());
            await page.waitForNavigation({ waitUntil: 'domcontentloaded' });
            await sleep(4000)
        } catch (err) {
            if (err) {
                // await browser?.close();
                return {
                    success: false,
                    data: null,
                    error: {
                        code: 702,
                        type: 'Puppeteer error.',
                        moment: 'Authenticating Meta Composer.',
                        error: err?.toString(),
                    },
                };
            }
        }
    }
    // Fill in the login details
    // try {
    //     const usernameField = 'input[name=email][type=text][autocomplete=username]';
    //     const passwordField = 'input[type=password][name=pass][autocomplete="current-password"]';

    //     await page.waitForSelector(usernameField);
    //     await page.click(usernameField);
    //     await page.type(usernameField, username, { delay: 25 });

    //     await page.waitForSelector(passwordField);
    //     await page.click(passwordField);
    //     await page.type(passwordField, password, { delay: 25 });
    // } catch (err) {
    //     if (err) {
    //         await browser.close();
    //         return {
    //             success: false,
    //             error: {
    //                 code: 702,
    //                 type: 'Puppeteer error.',
    //                 moment: 'Filling in the user login details.',
    //                 message: err.toString(),
    //             },
    //         };
    //     }
    // }

    // // Proceed with the login sequence
    // try {
    //     const loginButton = 'button#loginbutton[name=login][type=submit]';

    //     await page.waitForSelector(loginButton);
    //     await page.click(loginButton);
    // } catch (err) {
    //     if (err) {
    //         await browser.close();

    //         return {
    //             success: false,
    //             error: {
    //                 code: 703,
    //                 type: 'Puppeteer error.',
    //                 moment: 'Proceeding with the login sequence.',
    //                 message: err.toString(),
    //             },
    //         };
    //     }
    // }

    // Check if the user was stopped by the checkpoint
    try {
        await sleep(5000);

        const checkpointURL = 'https://m.facebook.com/checkpoint/?next';

        await sleep(3000);

        if ((await page.url()) === checkpointURL) await sleep(30000);
    } catch (err) {
        if (err) {
            await browser.close();

            return {
                success: false,
                error: {
                    code: 704,
                    type: 'Puppeteer error.',
                    moment: 'Awaiting user input at the checkpoint.',
                    message: err.toString(),
                },
            };
        }
    }

    // Verify if the user has reached the homepage
    try {
        await sleep(5000);

        const pageURL = await page.url();

        if (
            pageURL === 'https://m.facebook.com/home.php' ||
            pageURL === 'https://m.facebook.com/home.php/' ||
            pageURL === 'https://m.facebook.com' ||
            pageURL === 'https://m.facebook.com/'
        ) {
            await sleep(5000);
            await browser.close();
            return {
                success: true,
                error: null,
            };
        } else {
            await sleep(5000);
            await browser.close();
            return {
                success: false,
                error: {
                    code: 706,
                    type: 'Puppeteer error.',
                    moment: 'Expecting login sequence to succeed.',
                    message: 'The login sequence failed to log you in.',
                },
            };
        }
    } catch (err) {
        if (err) {
            await browser.close();

            return {
                success: false,
                error: {
                    code: 705,
                    type: 'Puppeteer error.',
                    moment: 'Expecting user to be at the homepage.',
                    message: err.toString(),
                },
            };
        }
    }
};

module.exports = login;
