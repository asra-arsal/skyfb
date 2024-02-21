const { sleep } = require('../../utils/utils');
const helper = {
    checkAndDissmissAutomatedBehaviour: require('./checkAndDissmissAutomatedBehaviour'),
};
function haveCommonSubstrings(str1, str2) {
    // Iterate through each substring of str1
    for (let i = 0; i < str1.length; i++) {
        for (let j = i + 1; j <= str1.length; j++) {
            const substring = str1.substring(i, j);
            // Check if the substring exists in str2
            if (str2.includes(substring)) {
                return true;
            }
        }
    }
    // No common substrings found
    return false;
}
const checkLoginUserAndLogout = async (browser, page) => {
    // Check if there is the option to Login to another account 
    let loggedInUser = await page.evaluate(() => {
        const xpath = '//*[@id="mbasic_logout_button"]';
        const element = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
        return element ? element.textContent.trim() : null;
    });
    if(haveCommonSubstrings(loggedInUser, process.env.PROFILE_NAME)){
        return true
    }else{
        await page.evaluate(() => {
            const xpath = '//*[@id="mbasic_logout_button"]';
            const element = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
            element.click();
        });
        await helper.checkAndDissmissAutomatedBehaviour(browser, page)
        return false
    }
        
};

module.exports = checkLoginUserAndLogout;
