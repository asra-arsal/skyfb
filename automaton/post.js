const path = require('path');
const puppeteer = require('puppeteer');
const publish = {
    toPage: require('./postToPage'),
    toGroup: require('./postToGroup'),
    // meta: require('../automaton/post.create'),
};
const { sleep } = require('../utils/utils');

module.exports = async (post, auth) => {
    const proxy = process.env.PROXY_HOST + ":" + process.env.PROXY_PORT;
    const username = process.env.PROXY_USER;
    const password = process.env.PROXY_PASSWORD;
    let args = ['--start-maximized', '--disable-notifications',]
    if (process.env.PROXY_ENABLED === "true") {
        args.push(`--proxy-server=${proxy}`)
    }
    const browser = await puppeteer.launch({
        headless: false,
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

    if (auth.useAgent == "true") {
        console.log('Agent is enabled')
        await page.setUserAgent('Mozilla/5.0 (Linux; Android 13; SM-A037U) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Mobile Safari/537.36  uacq');
    }

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
    // Open facebook and go to a dead link.
    try {
        console.log('opening Facebook')
        const deadURL = 'https://www.facebook.com';

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
    if (post.context === "group" || post.context === "all") {
        console.log('posting to groups')
        res = await publish.toGroup(post,auth, page, browser)
        if(res.success){
            await browser?.close();
        }
    }
    if (post.context === "page" || post.context === "all") {
        console.log('posting to page')
        res = await publish.toPage(post,auth, page, browser)
        if(res.success){
            await browser?.close();
        }
    }
    return res
    
}