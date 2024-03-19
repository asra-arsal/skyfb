const path = require('path');
const puppeteer = require('puppeteer');
const publish = {
    openBrowser: require('./helpers/openBrowser'),
    verifyAndUpdateContext: require('./helpers/verifyAndUpdateContext'),
    publishPostHelper: require('./helpers/publishPostHelper'),
    loginUtility: require('./helpers/loginUtility'),
    checkAndDissmissAutomatedBehaviour: require('./helpers/checkAndDissmissAutomatedBehaviour'),
    toPage: require('./postToPage'),
    toGroup: require('./postToGroup'),
    // meta: require('../automaton/post.create'),
};

module.exports = async (posts, auth) => {
    let browser = null
    try {
        const { browser, page } = await publish.openBrowser()
        if(!browser || !page){
            return {
                success: false,
                data: null,
                error: {
                    code: 200000,
                    type: 'EXIT.',
                    moment: 'EXITED',
                    error: 'Failed to launch new browser',
                },
            }
        }
        let res = await publish.loginUtility(browser, page)
        if(!res.success){
            return res
        }
        // let res = {
        //     success: false,
        //     data: null,
        //     error: {
        //         code: 10000,
        //         type: 'EXIT.',
        //         moment: 'EXITED',
        //         error: 'err.toString()',
        //     },
        // }
        console.log('posts: ', posts);
        for (let i = 0; i < posts.length; i++) {
            console.log('============================================================================================ ');
            console.log('posts[' + i + ']: ', posts[i]);
            console.log('============================================================================================ ');
            contextRes = await publish.verifyAndUpdateContext(posts[i], auth, page, browser)
            console.log('============================================================================================ ');
            console.log('contextRes: ', contextRes);
            console.log('============================================================================================ ');
            if (contextRes.success != false) {

                try {
                    await page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 60000 });
                } catch (e) {

                }
                if (posts[i].context === "page" || posts[i].context === "all") {
                    console.log('posting to page')
                    url = 'https://mbasic.facebook.com';

                    await page?.goto(url);
                    try {
                        await page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 60000 });
                    } catch (e) {

                    }
                    await publish.checkAndDissmissAutomatedBehaviour(browser, page)
                }
                if (posts[i].context === "group" || posts[i].context === "all") {
                    console.log('posting to group')
                    url = posts[i].contextDetails.group;
                    url = url.substring(url.indexOf('facebook.com') + 'facebook.com'.length);
                    if (posts[i]?.publisher === "user") {
                        url = `https://mbasic.facebook.com${url}`
                    }
                    else {
                        url = `https://m.facebook.com${url}`
                    }
                    await page?.goto(url);
                    try {
                        await page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 60000 });
                    } catch (e) {

                    }
                    await page?.reload();
                    try {
                        await page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 60000 });
                    } catch (e) {

                    }
                    await publish.checkAndDissmissAutomatedBehaviour(browser, page)
                }
                if (posts[i]?.publisher === "page" && posts[i].context === "group") {
                    res = await publish.toGroup(posts[i], auth, page, browser)
                }
                else {
                    res = await publish.publishPostHelper(posts[i], auth, page, browser)
                }
            }
        }
        if (res.success) {
            await browser?.close();
        }
        return res

    } catch (e) {
        await browser?.close();
        console.log(e)
    }
}
