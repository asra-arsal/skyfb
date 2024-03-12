const { sleep } = require('../../utils/utils');
const checkAndDissmissAutomatedBehaviour = async (browser, page) => {
    // Check if there is the option to Login to another account 
    try {
        const tags = ['suspect', 'Suspect', 'automated behavior']
        const tagFound = await page.evaluate((tags) => {
            // Function to check if any tag contains the specified text
            const elements = document.querySelectorAll('*'); // Select all elements on the page
            for (let element of elements) {
                for (let tag of tags) {
                    if (element.textContent.includes(tag)) {
                        return true;
                    }
                }
            }
            return false;
        }, tags);

		if(tagFound){
			 await page.evaluate(() => {
				const xpath = '//input[@type="submit"]';
				const element = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
				element.click();
			});
            await page.waitForNavigation({ waitUntil: 'domcontentloaded' });
			await sleep(2000);
		}
    } catch (err) {
        if (err) {
            //await browser.close();

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

};

module.exports = checkAndDissmissAutomatedBehaviour;
