const { sleep } = require('../../utils/utils');


module.exports = async (post, auth, page, browser) => {
	
    try {
        const deadURL = 'https://m.facebook.com';

        await page?.goto(deadURL);

        await sleep(5000);
    } catch (err) {
        if (err) {
            await browser?.close();

            return {
                success: false,
                data: null,
                error: {
                    code: 800,
                    type: 'Puppeteer error.',
                    moment: 'Opening facebook.',
                    error: err.toString(),
                },
            };
        }
    }
    // Open hamburger menu.
    try {
        await page.evaluate(() => {
            let mccontainer = document.querySelectorAll('div[data-mcomponent="MContainer"')[6];
            mccontainer.click();
        });

        await sleep(3000);
    } catch (err) {
        if (err) {
            await browser?.close();
            return {
                success: false,
                data: null,
                error: {
                    code: 801,
                    type: 'Puppeteer error.',
                    moment: 'Hamburger Menu not found',
                    error: err.toString(),
                },
            };
        }
    }
    // Open context  menu.
    try {
        await sleep(2000);
        const [checkUser] = await page?.$x(`//h3[text()='${auth?.publisher?.user}']`);
        const [checkPage] = await page?.$x(`//h3[text()='${auth?.publisher?.page}']`);

        // if the publisher is page and the profile is of user OR publisher is user and profile is of page . Switch the context
        if ((post?.publisher === 'user' && checkPage) || (post?.publisher === 'page' && checkUser)) {
            let [contextMenu] = await page?.$x("/html/body/div[1]/div/div[2]/div[2]/div/div/div[2]/div[5]/div");
            if (!contextMenu) {
                [contextMenu] = await page?.$x("/html/body/div[2]/div/div[2]/div[2]/div/div/div[2]/div[5]/div");
            }
            if (contextMenu) {
                await contextMenu.click();
            } else {
                const element = await page.evaluate(() => {
					const isKeywordPresent = (element, keyword) => {
						if (element.textContent.includes(keyword)) {
							return true;
						}
						for (let child of element.children) {
							if (isKeywordPresent(child, keyword)) {
								return true;
							}
						}
						return false;
					}
                    let mccontainer = document.querySelectorAll('div[data-mcomponent="MContainer"')[15];
					if(isKeywordPresent(mccontainer,'Reels') || isKeywordPresent(mccontainer,'Groups') || isKeywordPresent(mccontainer,'Messages')){
						mccontainer = document.querySelectorAll('div[data-mcomponent="MContainer"')[14];
					}
                    let d = mccontainer.querySelectorAll('div[data-mcomponent="ServerTextArea"')[0];
                    d.click();
					return  isKeywordPresent(mccontainer,'Reels') || isKeywordPresent(mccontainer,'Groups') || isKeywordPresent(mccontainer,'Messages')
                });
            }

            await sleep(2000);

            const [userSwitch] = await page?.$x(`//h3[text()='${auth?.publisher?.user}']`);
            const [pageSwitch] = await page?.$x(`//h3[text()='${auth?.publisher?.page}']`);
            if (post?.publisher === 'user') {
                await userSwitch.evaluate((s) => s.click());
            } else {
                await pageSwitch.evaluate((s) => s.click());
            }
            await sleep(2000);
        }
    } catch (err) {
        if (err) {
            //await browser?.close();

            return {
                success: false,
                data: null,
                error: {
                    code: 802,
                    type: 'Puppeteer error.',
                    moment: 'Switching context',
                    error: err.toString(),
                },
            };
        }
    }

    try {
        const deadURL = 'https://m.facebook.com';

        await page?.goto(deadURL);

        await sleep(5000);
    } catch (err) {
        if (err) {
            await browser?.close();

            return {
                success: false,
                data: null,
                error: {
                    code: 800,
                    type: 'Puppeteer error.',
                    moment: 'Opening facebook.',
                    error: err.toString(),
                },
            };
        }
    }
    // Open hamburger menu.
    try {
        await page.evaluate(() => {
            let mccontainer = document.querySelectorAll('div[data-mcomponent="MContainer"')[6];
            mccontainer.click();
        });

        await sleep(3000);
    } catch (err) {
        if (err) {
            await browser?.close();
            return {
                success: false,
                data: null,
                error: {
                    code: 801,
                    type: 'Puppeteer error.',
                    moment: 'Hamburger Menu not found',
                    error: err.toString(),
                },
            };
        }
    }
    // Open context  menu.
    try {
        await sleep(2000);
        const [checkUser] = await page?.$x(`//h3[text()='${auth?.publisher?.user}']`);
        const [checkPage] = await page?.$x(`//h3[text()='${auth?.publisher?.page}']`);

        // if the publisher is page and the profile is of user OR publisher is user and profile is of page . Switch the context
        if ((post?.publisher === 'user' && checkPage) || (post?.publisher === 'page' && checkUser)) {
            let [contextMenu] = await page?.$x("/html/body/div[1]/div/div[2]/div[2]/div/div/div[2]/div[5]/div");
            if (!contextMenu) {
                [contextMenu] = await page?.$x("/html/body/div[2]/div/div[2]/div[2]/div/div/div[2]/div[5]/div");
            }
            if (contextMenu) {
                await contextMenu.click();
            } else {
                const element = await page.evaluate(() => {
					const isKeywordPresent = (element, keyword) => {
						if (element.textContent.includes(keyword)) {
							return true;
						}
						for (let child of element.children) {
							if (isKeywordPresent(child, keyword)) {
								return true;
							}
						}
						return false;
					}
                    let mccontainer = document.querySelectorAll('div[data-mcomponent="MContainer"')[15];
					if(isKeywordPresent(mccontainer,'Reels') || isKeywordPresent(mccontainer,'Groups') || isKeywordPresent(mccontainer,'Messages')){
						mccontainer = document.querySelectorAll('div[data-mcomponent="MContainer"')[14];
					}
                    let d = mccontainer.querySelectorAll('div[data-mcomponent="ServerTextArea"')[0];
                    d.click();
					return  isKeywordPresent(mccontainer,'Reels') || isKeywordPresent(mccontainer,'Groups') || isKeywordPresent(mccontainer,'Messages')
                });
            }

            await sleep(2000);

            const [userSwitch] = await page?.$x(`//h3[text()='${auth?.publisher?.user}']`);
            const [pageSwitch] = await page?.$x(`//h3[text()='${auth?.publisher?.page}']`);
            if (post?.publisher === 'user') {
                await userSwitch.evaluate((s) => s.click());
            } else {
                await pageSwitch.evaluate((s) => s.click());
            }
            await sleep(2000);
        }
    } catch (err) {
        if (err) {
            //await browser?.close();

            return {
                success: false,
                data: null,
                error: {
                    code: 802,
                    type: 'Puppeteer error.',
                    moment: 'Switching context',
                    error: err.toString(),
                },
            };
        }
    }
    return {
        success: true,
    };
}