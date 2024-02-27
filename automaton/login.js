const path = require('path');
const puppeteer = require('puppeteer');
const helper = {
    openBrowser: require('./helpers/openBrowser'),
    checkLoginUserAndLogout: require('./helpers/checkLoginUserAndLogout'),
    checkAndDissmissAutomatedBehaviour: require('./helpers/checkAndDissmissAutomatedBehaviour')
};
// const { sleep } = require('../utils/utils');
const { sleep } = require('../utils/utils');

const login = async (username, password) => {
    
    const {browser, page} = await helper.openBrowser()
    // Open the Facebook Login Page.
    try {
        const loginURL = 'https://mbasic.facebook.com/login';

        await page.goto(loginURL);
        await page.waitForNetworkIdle();
        await helper.checkAndDissmissAutomatedBehaviour(browser, page)
        await sleep(2000)

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
    const isCorrectLoggedIn = await helper.checkLoginUserAndLogout(browser, page)
    if (!isCorrectLoggedIn) // If coorect user is already logged in
    {

        // Check if there is the option to Login to another account 
        try {
            await page.evaluate(() => {
                const xpath = '//*[@id="root"]/table/tbody/tr/td/div/div[2]/div[2]/table/tbody/tr/td[2]/div/a/div[text()="Log in to another account"]';
                const element = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
                if (element) element.click();
            });
            await sleep(2000)
            await helper.checkAndDissmissAutomatedBehaviour(browser, page)

        } catch (err) {
            if (err) {
                     await browser.close();

                return {
                    success: false,
                    error: {
                        code: 702,
                        type: 'Puppeteer error.',
                        moment: 'Log In to Another Page Action.',
                        message: err.toString(),
                    },
                };
            }
        }

        try {
            const emailField = await page.$('input[name="email"]');
            await emailField.type(process.env.FB_USERNAME);

            const passwordField = await page.$('input[name="pass"]');
            await passwordField.type(process.env.FB_PASSWORD);

            await page.keyboard.press('Escape');

            await page.evaluate(() => {
                const loginBtnXpath = '//input[@type="submit"]';
                const element = document.evaluate(loginBtnXpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
                element.click();
            });
            await page.waitForNavigation({ waitUntil: 'domcontentloaded' });
            await helper.checkAndDissmissAutomatedBehaviour(browser, page)
            await sleep(5000)
        } catch (err) {
            if (err) {
                await browser?.close();
                return {
                    success: false,
                    data: null,
                    error: {
                        code: 703,
                        type: 'Puppeteer error.',
                        moment: 'Authenticating Meta Composer.',
                        error: err?.toString(),
                    },
                };
            }
        }
        // Check if the user was stopped by the checkpoint
        try {
            const checkpointURL = 'https://mbasic.facebook.com/checkpoint/?next';
            await page.goto(checkpointURL);
            await page.waitForNetworkIdle();
            await helper.checkAndDissmissAutomatedBehaviour(browser, page)
            await sleep(2000)
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
                pageURL === 'https://mbasic.facebook.com/checkpoint/?next' ||
                pageURL === 'http://mbasic.facebook.com/checkpoint/?next'
            ) {
                //  await browser.close();
                return {
                    success: true,
                    error: null,
                };
            } else {
                await sleep(5000);
                //  await browser.close();
                return {
                    success: false,
                    error: {
                        code: 705,
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
                        code: 706,
                        type: 'Puppeteer error.',
                        moment: 'Expecting user to be at the homepage.',
                        message: err.toString(),
                    },
                };
            }
        }
    }
    //    await browser.close();
    return {
        success: true,
        error: null,
    };
};

module.exports = login;
