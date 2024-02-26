const puppeteer = require('puppeteer');
const path = require('path');
const { sleep } = require('../../utils/utils');
const openBrowser = async () => {
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
            headless: false,
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
            // Open ipinfo.
            try {
                await page.authenticate({ username:proxyUser, password: proxyPWD });
                await sleep(2000)

                console.log('opening IP Info')
                const deadURL = 'https://ipwho.is/';

                await page?.goto(deadURL);

                await sleep(5000);
            } catch (err) {
                if (err) {
                    console.log('err1: ', err);
                    await browser?.close();

                    return false;
                }
            }

        }

        return {browser, page}
    } catch (err) {
        if (err) {
            console.log('err: ', err);
            //await browser.close();
            
            return false;
        }
    }

};

module.exports = openBrowser;
