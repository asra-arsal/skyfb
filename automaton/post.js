const path = require('path');
const puppeteer = require('puppeteer');

const { sleep } = require('../utils/utils');

module.exports = async (post, auth) => {
    const proxy = process.env.PROXY_HOST;
    const username = process.env.PROXY_USER;
    const password = process.env.PROXY_PASSWORD;
    let args = ['--start-maximized', '--disable-notifications']
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

    // Accept a dialog if it pops-up.
    page?.on('dialog', async (dialog) => {
        await dialog?.accept();
    });

    // Open facebook and go to a dead link.
    try {
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
    if (await XPathExists("/html/body/div[1]/div/div[4]/div/div[1]/div/div/div/article[2]/form/button")) {
        try {
            const [switchAccountButton] = await page?.$x("/html/body/div[1]/div/div[4]/div/div[1]/div/div/div/article[2]/form/button");
            await switchAccountButton?.click();
            await sleep(2500);
        } catch (err) {
            if (err) {
                await browser?.close();
                return {
                    success: false,
                    data: null,
                    error: {
                        code: 702,
                        type: 'Puppeteer error.',
                        moment: 'Authenticating Meta Composer.',
                        error: err?.toString(),
                    },
                };
            }
        }
    }

    // If there is an authentication required to account 
    if (await XPathExists("/html/body/div[1]/div/div[3]/div[1]/div/div[2]/div/div[3]/form/div[4]/div[1]/div/div/input")) {
        try {
            const emailField = await page.$('input[name="email"]');
            await emailField.type(process.env.FB_USERNAME);

            const passwordField = await page.$('input[name="pass"]');
            await passwordField.type(process.env.FB_PASSWORD);

            await page.keyboard.press('Escape');

            const [login] = await page?.$x(`//span[text()='Log In']`);
            await login.evaluate((s) => s.click());
            await page.waitForNavigation({ waitUntil: 'domcontentloaded' });
            await sleep(4000)
        } catch (err) {
            if (err) {
                await browser?.close();
                return {
                    success: false,
                    data: null,
                    error: {
                        code: 702,
                        type: 'Puppeteer error.',
                        moment: 'Authenticating Meta Composer.',
                        error: err?.toString(),
                    },
                };
            }
        }
    }
    // Open hamburger menu.
  

   
    try {
        let [hamburgerMenu] = await page?.$x("/html/body/div[1]/div/div[1]/div[2]/div/div/div[3]");
        if (!hamburgerMenu) {
            [hamburgerMenu] = await page?.$x("/html/body/div[3]/div/div[1]/div[3]/div/div/div[3]");
        }
        if (!hamburgerMenu) {
            [hamburgerMenu] = await page?.$x("/html/body/div[2]/div/div[1]/div[3]/div/div/div[3]");
        }
        if(hamburgerMenu){
            await hamburgerMenu.click();
        }else{
            await page.evaluate(() => {
                let mccontainer = document.querySelectorAll('div[data-mcomponent="MContainer"')[6];
                let d = mccontainer.querySelectorAll('div[data-mcomponent="ServerTextArea"')[0];
                d.click();
            });
        }

        await sleep(3000);
    } catch (err) {
        if (err) {
            await browser?.close();

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
            if(contextMenu){
                await contextMenu.click();
            }else{
                const element = await page.evaluate(() => {
                    let mccontainer = document.querySelectorAll('div[data-mcomponent="MContainer"')[15];
                    let d = mccontainer.querySelectorAll('div[data-mcomponent="ServerTextArea"')[0];
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
            await sleep(2000);
        }
    } catch (err) {
        if (err) {
            await browser?.close();

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
    // Switch to the correct context.
    try {
        if (post?.context !== 'page' && post.publisher !== "page") {
            // const contextURL = post?.context === 'page' ? auth?.context?.page : auth?.context?.group;
            const contextURL = post?.context === 'page' ? 'https://www.facebook.com' : auth?.context?.group;
            await page?.goto(contextURL);
            await sleep(3000);
        }
    } catch (err) {
        if (err) {
            await browser?.close();

            return {
                success: false,
                data: null,
                error: {
                    code: 705,
                    type: 'Puppeteer error.',
                    moment: 'Switching to the context.',
                    error: err.toString(),
                },
            };
        }
    }
    // If the post is to page by the page
    if (post?.publisher === "page" && post?.context === "page") {
        // Handle post create dialog Click.
        try {
            const postDialog = 'div[aria-label="Make a Post on Facebook"]';
            await page?.click(postDialog);
            await sleep(3000);
        } catch (err) {
            if (err) {
                await browser?.close();

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
                await browser?.close();

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
                await browser?.close();

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

    if (post?.publisher === "user" && post?.context === "group") {

        // Handle post create dialog Click.
        try {
            const [groupWriter] = await page?.$x("//div[text()='Write something...']");
            await groupWriter.click();
            await sleep(1500)

        } catch (err) {
            if (err) {
                await browser?.close();
                return {
                    success: false,
                    data: null,
                    error: {
                        code: 709,
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
                await browser?.close();

                return {
                    success: false,
                    data: null,
                    error: {
                        code: 710,
                        type: 'Puppeteer error.',
                        moment: 'Inserting the images attached to the post.',
                        error: err.toString(),
                    },
                };
            }
        }
        // Switch to the content writing field.
        try {
            let [gropuField] = await page?.$x(`//button[text()="Write something"]`);
            if (post?.media?.length > 0) {
                if (post?.media?.length == 1) {
                    [gropuField] = await page?.$x(`//button[text()="Say something about this photo…"]`);
                } else {
                    [gropuField] = await page?.$x(`//button[text()="Say something about these photos…"]`);
                }
            }
            await gropuField.evaluate((s) => {
                s.click()
            });
            await sleep(1000);
            await page.keyboard.type(post?.message,);
            await sleep(1500);
            if (post?.link !== '' && post?.link !== null) {
                await page?.keyboard.press('Enter');
                await page?.keyboard.press('Enter');
                await sleep(1000);
                await page.keyboard.type(post?.link);
                await sleep(1000);
            }
            await page.keyboard.press('Escape');
            await sleep(3000);

        } catch (err) {
            if (err) {
                await browser?.close();

                return {
                    success: false,
                    data: null,
                    error: {
                        code: 711,
                        type: 'Puppeteer error.',
                        moment: 'Switching to the content writing field.',
                        error: err.toString(),
                    },
                };
            }
        }
    }

    if (post?.publisher === "page" && post?.context === "group") {
        if (await XPathExists("/html/body/div[1]/div/div[1]/div[2]/div/div/div[3]")) {
            // Open hamburger menu.
            try {
                const [hamburgerMenu] = await page?.$x("/html/body/div[1]/div/div[1]/div[2]/div/div/div[3]");
                await hamburgerMenu.click();

                await sleep(3000);
            } catch (err) {
                if (err) {
                    await browser?.close();

                    return {
                        success: false,
                        data: null,
                        error: {
                            code: 712,
                            type: 'Puppeteer error.',
                            moment: 'Hamburger Menu not found',
                            error: err.toString(),
                        },
                    };
                }
            }
        }
        // Select Group
        try {
            const [groupMenuField] = await page?.$x(`//div[text()="Groups"]`);
            await groupMenuField.evaluate((s) => {
                s.click()
            });
            await sleep(2000);
            const [groupSelectorField] = await page?.$x(`//span[text()="${auth.context.groupName}"]`);
            await groupSelectorField.evaluate((s) => {
                s.click()
            });
            await sleep(2000);

        } catch (err) {
            if (err) {
                await browser?.close();

                return {
                    success: false,
                    data: null,
                    error: {
                        code: 713,
                        type: 'Puppeteer error.',
                        moment: 'Selecting the Group',
                        error: err.toString(),
                    },
                };
            }
        }

        // Handle post create dialog Click.
        try {
            const [groupWriter] = await page?.$x("//div[text()='Write something...']");
            await groupWriter.click();
            await sleep(1500)

        } catch (err) {
            if (err) {
                await browser?.close();
                return {
                    success: false,
                    data: null,
                    error: {
                        code: 709,
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
                await browser?.close();

                return {
                    success: false,
                    data: null,
                    error: {
                        code: 710,
                        type: 'Puppeteer error.',
                        moment: 'Inserting the images attached to the post.',
                        error: err.toString(),
                    },
                };
            }
        }
        // Switch to the content writing field.
        try {
            let [gropuField] = await page?.$x(`//button[text()="Write something"]`);
            if (post?.media?.length > 0) {
                if (post?.media?.length == 1) {
                    [gropuField] = await page?.$x(`//button[text()="Say something about this photo…"]`);
                } else {
                    [gropuField] = await page?.$x(`//button[text()="Say something about these photos…"]`);
                }
            }
            await gropuField.evaluate((s) => {
                s.click()
            });
            await sleep(1000);
            await page.keyboard.type(post?.message,);
            await sleep(1500);
            if (post?.link !== '' && post?.link !== null) {
                await page?.keyboard.press('Enter');
                await page?.keyboard.press('Enter');
                await sleep(1000);
                await page.keyboard.type(post?.link);
                await sleep(1000);
            }
            await page.keyboard.press('Escape');
            await sleep(3000);

        } catch (err) {
            if (err) {
                await browser?.close();

                return {
                    success: false,
                    data: null,
                    error: {
                        code: 711,
                        type: 'Puppeteer error.',
                        moment: 'Switching to the content writing field.',
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
            await browser?.close();

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
    const totalSleepTime = 10000;

    await sleep(totalSleepTime);

    await browser?.close();
    return {
        success: true,
        data: null,
        error: null,
    };
}