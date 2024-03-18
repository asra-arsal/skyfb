const puppeteer = require('puppeteer');
const path = require('path');
const { sleep } = require('../../utils/utils');

// Function to navigate to a URL with retry logic
async function navigateWithRetry(page, url, maxRetries = 3) {
    let retryCount = 0;
    while (retryCount < maxRetries) {
        try {
            await page.goto(url);
            console.log('Page loaded successfully!');
            return; // Exit the function if navigation is successful
        } catch (error) {
            if (error.message.includes('ERR_EMPTY_RESPONSE')) {
                console.log(`Error loading page (attempt ${retryCount + 1}):`, error.message);
                retryCount++;
                // Add a delay before retrying (optional)
                await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for 1 second
            } else {
                // If the error is not ERR_EMPTY_RESPONSE, rethrow it
                throw error;
            }
        }
    }
    // If maxRetries is reached without successful navigation, throw an error
    console.log( `Failed to load page after ${maxRetries} attempts.`);
    throw new Error(`Failed to load page after ${maxRetries} attempts.`);
    
}
const openBrowser = async (login = false) => {
    try {
        
        let proxyPath = process.env.PROXY
        proxyPath = proxyPath ? proxyPath.split(':') : ''        // 0: IP, 1: PORT, 2: USER, 3: PASSWORD
        const isProxyEnabled = proxyPath[0] && proxyPath[1] && proxyPath[2] && proxyPath[3]
        let proxy = null
        let proxyUser = null
        let proxyPWD = null
        if (isProxyEnabled) {
            proxy = `http://${proxyPath[0]}:${proxyPath[1]}`;
            proxyUser = proxyPath[2]
            proxyPWD = proxyPath[3]
        }

        let args = ['--start-maximized', '--disable-notifications', '--no-sandbox']
        if (isProxyEnabled) {
            args.push(`--proxy-server=${proxy.trim()}`)
        }

        const browser = await puppeteer.launch({
            headless: (process.env.USE_HEADLESS_BROWSER == "true" && !login) ? 'new' : false,
            // headless: 'new',
            defaultViewport: null,
            args: args,
            userDataDir: path.join(__dirname, 'userData'),
        });
        const page = await browser?.newPage();
        await sleep(3000)

        if (process.env.USE_USER_AGENT) {
            console.log('Agent is enabled')
            await page.setUserAgent(process.env.USE_USER_AGENT);
        }

        if (isProxyEnabled) {
            try {
                await sleep(2000);
                await Promise.all([
                    page.authenticate({ username: proxyUser, password: proxyPWD }),
                    sleep(3000) // Assuming sleep is a function that returns a promise
                ]);
                // await page.authenticate({ username: proxyUser, password: proxyPWD });
                // await sleep(3000);
                const proxyUrl = 'https://ipwho.is/';
                await page.goto(proxyUrl);
                await sleep(2000)
            } catch (err) {
                if (err) {
                    console.log('err1: ', err);
					if (err.message.includes('ERR_EMPTY_RESPONSE')) {
						try {
							await page?.reload();
							await sleep(3000);
                            await Promise.all([
                                page.authenticate({ username: proxyUser, password: proxyPWD }),
                                sleep(3000) // Assuming sleep is a function that returns a promise
                            ]);
							// await page.authenticate({ username: proxyUser, password: proxyPWD });
							// await sleep(2000)
							const proxyUrl = 'https://ipwho.is/';
                            await page.goto(proxyUrl);
							await sleep(2000)
						} catch (err) {
							console.log('err123: ', err);
							await browser?.close();		
						}					
					}else{
						await browser?.close();
					}

                    return false;
                }
            }

        }

        return { browser, page }
    } catch (err) {
        if (err) {
            console.log('err: ', err);
            //await browser.close();

            return false;
        }
    }

};

module.exports = openBrowser;
