const path = require('path');
const puppeteer = require('puppeteer');

const { sleep } = require('../utils/utils');

module.exports = async (post, auth, page, browser) => {

    // Open hamburger menu.
    try {
        let [hamburgerMenu] = await page?.$x("/html/body/div[1]/div/div[1]/div[2]/div/div/div[3]");
        if (!hamburgerMenu) {
            [hamburgerMenu] = await page?.$x("/html/body/div[3]/div/div[1]/div[3]/div/div/div[3]");
        }
        if (!hamburgerMenu) {
            [hamburgerMenu] = await page?.$x("/html/body/div[2]/div/div[1]/div[3]/div/div/div[3]");
        }
        if (hamburgerMenu) {
            await hamburgerMenu.click();
        } else {
            await page.evaluate(() => {
                let mccontainer = document.querySelectorAll('div[data-mcomponent="MContainer"')[6];
                let d = mccontainer.querySelectorAll('div[data-mcomponent="ServerTextArea"')[0];
                d.click();
            });
        }

        await sleep(3000);
    } catch (err) {
        if (err) {
            // await browser?.close();
            console.log(703)
            return {
                success: false,
                data: null,
                error: {
                    code: 703,
                    type: 'Puppeteer error.',
                    moment: 'Hamburger Menu not found',
                    error: err.toString(),
                },
            };
        }
    }
    // Open context  menu.
    try {
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
                    let mccontainer = document.querySelectorAll('div[data-mcomponent="MContainer"')[15];
                    let d = mccontainer.querySelectorAll('div[data-mcomponent="ServerTextArea"')[0];
                    console.log('d: ', d);
                    d.click();
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
            await sleep(4000);
        } else {
            try {
                console.log('opening Home Page')
                const pageUrl = "https://www.facebook.com";

                await page?.goto(pageUrl);

                await sleep(5000);
            } catch (err) {
                if (err) {
                    // await browser?.close();

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
    } catch (err) {
        if (err) {
            // await browser?.close();
            console.log(704)

            return {
                success: false,
                data: null,
                error: {
                    code: 704,
                    type: 'Puppeteer error.',
                    moment: 'Switching context',
                    error: err.toString(),
                },
            };
        }
    }

    // If the post is to page by the page
    if (post?.publisher === "page") {
        // Handle post create dialog Click.
        try {
            await sleep(3000);
            let [postDialog] = await page?.$x('//div[@aria-label="Create a post on Facebook"]');
            console.log('postDialog: ', postDialog);
            if (!postDialog){
                [postDialog] = await page?.$x('//div[@aria-label="Make a Post on Facebook"]');
            }
            console.log('postDialog: ', postDialog);
            await postDialog.evaluate((s) => s.click());
            await sleep(3000);
        } catch (err) {
            if (err) {
                // await browser?.close();

                return {
                    success: false,
                    data: null,
                    error: {
                        code: 706,
                        type: 'Puppeteer error.',
                        moment: 'Handle post create dialog Click.',
                        error: err.toString(),
                    },
                };
            }
        }
        // Switch to the content writing field.
        try {
            const [pageField] = await page?.$x(`//button[text()="What\'s on your mind?"]`);
            await pageField.evaluate((s) => {
                s.click()
            });
            await sleep(1000);
            await page.keyboard.type(post?.message,);
            await sleep(1500);
            if (post?.link !== '' && post?.link !== null) {
                await page?.keyboard.press('Enter');
                await page?.keyboard.press('Enter');
                await sleep(1000);
                if (post?.link_description !== '' && post?.link_description !== null) {
                    await page.keyboard.type(post?.link_description,);
                    await page?.keyboard.press('Enter');
                }
                await page.keyboard.type(post?.link,);
                await sleep(1000);
            }
            await page.keyboard.press('Escape');
            await sleep(3000);

        } catch (err) {
            if (err) {
                // await browser?.close();

                return {
                    success: false,
                    data: null,
                    error: {
                        code: 707,
                        type: 'Puppeteer error.',
                        moment: 'Switching to the content writing field.',
                        error: err.toString(),
                    },
                };
            }
        }
        // Entering the Post Media
        try {
            const mediaPath = path.join(__dirname, '..', 'public', 'media');
            const [photoSelector] = await page?.$x(`//div[text()="Photos"]`);
            let media = []
            for (let i = 0; i < post?.media?.length; i++) {
                media.push(path.join(mediaPath, post?.media[i]));
            }
            const [fileChooser] = await Promise.all([
                page.waitForFileChooser(),
                photoSelector.click(),
            ]);

            await fileChooser.accept(media);

            await sleep(5000)
        } catch (err) {
            if (err) {
                // await browser?.close();

                return {
                    success: false,
                    data: null,
                    error: {
                        code: 708,
                        type: 'Puppeteer error.',
                        moment: 'Inserting the images attached to the post.',
                        error: err.toString(),
                    },
                };
            }
        }
    }

    // Publish the Post
    try {
        const postIt = await page?.$x(`//span[text()='POST']`);
        await postIt[0].evaluate((s) => s.click());
        await sleep(2000);

    } catch (err) {
        if (err) {
            // await browser?.close();

            return {
                success: false,
                data: null,
                error: {
                    code: 712,
                    type: 'Puppeteer error.',
                    moment: 'Publishing the post to Facebook.',
                    error: err.toString(),
                },
            };
        }
    }
    // const totalSleepTime = 30000 + (post?.media?.length > 0 ? post?.media?.length : 0) * 12500;
    const totalSleepTime = 5000;

    await sleep(totalSleepTime);
    console.log("===================DONE POSTING TO PAGE===================")
    // await browser?.close();
    return {
        success: true,
        data: null,
        error: null,
    };
}