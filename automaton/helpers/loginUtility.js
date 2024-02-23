const { sleep } = require('../../utils/utils');
const helper = {
    checkAndDissmissAutomatedBehaviour: require('./checkAndDissmissAutomatedBehaviour'),
};
const loginUtility = async (browser, page) => {
    let url = 'https://mbasic.facebook.com';
    await page?.goto(url);
    sleep(2000)
    await helper.checkAndDissmissAutomatedBehaviour(browser, page)
    const searchText = "Choose your account"
    const tagFound = await page.evaluate((searchText) => {
        // Function to check if any tag contains the specified text
        const elements = document.querySelectorAll('*'); // Select all elements on the page
        for (let element of elements) {
            if (element.textContent.includes('Log in to another account')) {
                return true;
            } else if (element.textContent.includes('Log into another account')) {
                return true;
            }
        }
        return false;
    }, searchText);
    if (tagFound) {
        // Check if there is the option to Login to another account 
        try {
            await page.evaluate(() => {
                let xpath = '//*[@id="root"]/table/tbody/tr/td/div/div[2]/div[2]/table/tbody/tr/td[2]/div/a/div[text()="Log in to another account"]';
                let element = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
                if (!element) {
                    xpath = '//*[@id="root"]/table/tbody/tr/td/div/div[2]/div[2]/table/tbody/tr/td[2]/div/a/div[text()="Log into another account"]';
                    element = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
                }
                if (!element) {
                    xpath = '//*[text()="Log into another account"]';
                    element = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
                }
                if (!element) {
                    xpath = '//*[text()="Log in to another account"]';
                    element = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
                }
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
    } else {
        const checkEmailField = await page.$('input[name="email"]');
        if (!checkEmailField) {
            return {
                success: true,
                error: null,
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
        await sleep(5000)
        await helper.checkAndDissmissAutomatedBehaviour(browser, page)
    } catch (err) {
        if (err) {
            // await browser?.close();
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


    return {
        success: true,
        error: null,
    };

};

module.exports = loginUtility;
