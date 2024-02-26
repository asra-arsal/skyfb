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
const { sleep } = require('../utils/utils');

module.exports = async (posts, auth) => {
    try {
        const {browser, page} = await publish.openBrowser()
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
                await publish.checkAndDissmissAutomatedBehaviour(browser, page)
            }
            if (posts[i].context === "group" || posts[i].context === "all") {
                console.log('posting to group')
                url = posts[i].contextDetails.group;
                url = url.substring(url.indexOf('facebook.com') + 'facebook.com'.length);
                url = `https://mbasic.facebook.com${url}`
                await page?.goto(url);
                await sleep(2000);
                await page?.reload();
                await sleep(3000);
                await publish.checkAndDissmissAutomatedBehaviour(browser, page)
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
