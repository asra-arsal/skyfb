const path = require('path');
const puppeteer = require('puppeteer');
const publish = {
    verifyAndUpdateContext: require('./helpers/verifyAndUpdateContext'),
    publishPostHelper: require('./helpers/publishPostHelper'),
    loginUtility: require('./helpers/loginUtility'),
    toPage: require('./postToPage'),
    toGroup: require('./postToGroup'),
    // meta: require('../automaton/post.create'),
};
const { sleep } = require('../utils/utils');

module.exports = async (posts, auth) => {
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
            headless:false,
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

        await publish.loginUtility(browser, page)
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
        for(let i = 0; i< posts.length; i++){
            contextRes = await publish.verifyAndUpdateContext(posts[i], auth, page, browser)
            
            if (posts[i].context === "page" || posts[i].context === "all") {
                console.log('posting to page')
                try{
                    await page.waitForNavigation()
                }catch(e){

                }
                url = 'https://mbasic.facebook.com';
                
                await page?.goto(url);
                await sleep(5000);
            }
            if (posts[i].context === "group" || posts[i].context === "all") {
                console.log('posting to group')
                // Switch to the correct context.
                // url = auth?.context?.group;
                try{
                    // await page.waitForNavigation()
                }catch(e){
    
                }
                url = posts[i].contextDetails.group;
                url = url.substring(url.indexOf('facebook.com') + 'facebook.com'.length);
                url = `https://mbasic.facebook.com${url}`
                await page?.goto(url);
                await sleep(2000);
                await page?.reload();
                await sleep(3000);
            }
            res = await publish.publishPostHelper(posts[i], auth, page, browser)
        }
        if (res.success) {
            await browser?.close();
        }
        return res

    } catch (e) {
        console.log(e)
    }
}
