const puppeteer = require('puppeteer');
const path = require('path');
const { sleep } = require('../../utils/utils');


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
            console.log('openBrowser Error: ', err);
            await browser.close();

            return false;
        }
    }

};

module.exports = openBrowser;
