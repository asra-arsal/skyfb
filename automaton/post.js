const path = require('path');
const puppeteer = require('puppeteer');
const publish = {
    verifyAndUpdateContext: require('./helpers/verifyAndUpdateContext'),
    publishPostHelper: require('./helpers/publishPostHelper'),
    toPage: require('./postToPage'),
    toGroup: require('./postToGroup'),
    // meta: require('../automaton/post.create'),
};
const { sleep } = require('../utils/utils');

module.exports = async (post, auth) => {
	console.log("==============================================")
	console.log("==============================================")
	
	console.log(post)
	console.log("==============================================")
	console.log("==============================================")
    const proxy = process.env.PROXY_HOST + ":" + process.env.PROXY_PORT;
    const username = process.env.PROXY_USER;
    const password = process.env.PROXY_PASSWORD;
    let args = ['--start-maximized', '--disable-notifications', '--no-sandbox']
    if (process.env.PROXY_ENABLED === "true") {
        args.push(`--proxy-server=${proxy}`)
    }
    let browser = null
    try {

        const browser = await puppeteer.launch({
            headless: 'new',
            // headless: 'new',
            defaultViewport: null,
            args: args,
            userDataDir: path.join(__dirname, 'userData'),
        });
        const page = await browser?.newPage();
        await sleep(3000)

        if (process.env.PROXY_ENABLED === "true") {
            console.log('Proxy is enabled')
            await page.authenticate({ username, password });
            await sleep(2000)
        }

        if (auth.useAgent) {
            console.log('Agent is enabled')
            await page.setUserAgent(auth.useAgent);
        }

        if (["true", true].includes(process.env.PROXY_ENABLED)) {
            // Open ipinfo.
            try {
                console.log('opening IP Info')
                const deadURL = 'https://ipinfo.io/';

                await page?.goto(deadURL);

                await sleep(5000);
            } catch (err) {
                if (err) {
                    await browser?.close();

                    return {
                        success: false,
                        data: null,
                        error: {
                            code: 701,
                            type: 'Puppeteer error.',
                            moment: 'Opening facebook.',
                            error: err.toString(),
                        },
                    };
                }
            }

        }

        const contextRes = await publish.verifyAndUpdateContext(post, auth, page, browser)
        console.log('contextRes',contextRes);
		if (!contextRes.success) {
            await browser?.close();
            return contextRes
        }
        if (post.context === "page" || post.context === "all") {
            console.log('posting to page')
            url = 'https://mbasic.facebook.com';
			
            await page?.goto(url);
            // await page.waitForNavigation();
			await sleep(5000);
        }
        if (post.context === "group" || post.context === "all") {
            console.log('posting to group')
            // Switch to the correct context.
            url = auth?.context?.group;
            url = url.substring(url.indexOf('facebook.com') + 'facebook.com'.length);
            url = `https://mbasic.facebook.com${url}`
			console.log('groupURL',url)
            await page?.goto(url);
            // await page.waitForNavigation();
			await sleep(2000);
			console.log('reloading ========================================')
            await page?.reload();
			await sleep(3000);
        }
        let res = {
            success: false,
            data: null,
            error: {
                code: 10000,
                type: 'EXIT.',
                moment: 'EXITED',
                error: 'err.toString()',
            },
        }
		console.log('aaaaaaaaaaaaa')
        res = await publish.publishPostHelper(post, auth, page, browser)
        if (res.success) {
            await browser?.close();
        }
        return res

    } catch (e) {
        console.log(e)
    }
}
