const puppeteer = require('puppeteer');
const path = require('path'); 
const fs = require('fs'); 
const { sleep } = require('../../utils/utils');
const lockFilePath = '../../puppeteer.lock';

async function isBrowserRunning() {
    try {
        await fs.promises.access(lockFilePath, fs.constants.F_OK);
        return true;
    } catch (error) {
        return false;
    }
}

async function setBrowserRunningFlag() {
    await fs.promises.writeFile(lockFilePath, 'Puppeteer is running', 'utf8');
}

async function clearBrowserRunningFlag() {
    await fs.promises.unlink(lockFilePath);
}

const openBrowser = async (login = false) => {
    try {
        // const browserAlreadyRunning = await isBrowserRunning();
        // if (browserAlreadyRunning) {
        //     console.log('Another Puppeteer instance is already running.');
        //     return;
        // }

        // // Set the flag to indicate that Puppeteer is running
        // await setBrowserRunningFlag();
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
            // Open ipinfo.
            try {
                await page.authenticate({ username: proxyUser, password: proxyPWD });
                await sleep(2000)

                console.log('opening IP Info')
                const proxyUrl = 'https://ipwho.is/';

                await page?.goto(proxyUrl);

                // const pageSource = await page.content();
                // const jsonMatch = pageSource.match(/<pre.*?>(.*?)<\/pre>/s);
                // const jsonString = jsonMatch ? jsonMatch[1] : null;

                // // Parse the JSON string into an object
                // if (jsonString) {
                //     const data = JSON.parse(jsonString);
                //     console.log('Extracted JSON:', data?.ip);
                // } else {
                //     console.log('No JSON data found in the page source.');
                // }

                await sleep(5000);
            } catch (err) {
                if (err) {
                    console.log('err1: ', err);
                    await browser?.close();

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
