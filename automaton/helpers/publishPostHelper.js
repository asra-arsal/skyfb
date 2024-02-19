const path = require('path');
const puppeteer = require('puppeteer');

const { sleep } = require('../../utils/utils');

module.exports = async (post, auth, page, browser) => {
    // If the post is to page by the page
    if ((post?.publisher === "page" && post?.context === "page") || (post?.context === "group")) {
        // Post Creation form open action.
        try {
            const elem = await page.evaluate(() => {
                const xpath = '//input[@name="view_post"][@type="submit"]';
                const element = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
                element.click();
				return element;
            });
            await page.waitForNavigation();

            await sleep(2000)
        } catch (err) {
            if (err) {
                //  await browser.close();();
                return {
                    success: false,
                    data: null,
                    error: {
                        code: 701,
                        type: 'Puppeteer error.',
                        moment: 'Handle post create dialog Click.',
                        error: err.toString(),
                    },
                };
            }
        }

        // Switch to the content writing field.
        try {
            let content = post?.message
            if (post?.link !== '' && post?.link !== null) {
                content += '\n\n' + post?.link;
            }
            await page.evaluate((textcontent) => {
                const xpath = 'textarea[name="xc_message"]';
                document.querySelector(xpath).value = textcontent;
            }, content);
            await page.keyboard.press('Escape');
            await sleep(3000);

        } catch (err) {
            if (err) {
                //  await browser.close();();

                return {
                    success: false,
                    data: null,
                    error: {
                        code: 702,
                        type: 'Puppeteer error.',
                        moment: 'Switching to the content writing field.',
                        error: err.toString(),
                    },
                };
            }
        }
        if (post?.media?.length > 0) {
            // Open Media Selector Page
            try {
                const [photoBtnField] = await page?.$x(`//input[@name="view_photo"][@value="Photo"]`);
                await photoBtnField.evaluate((s) => {
                    s.click()
                });
                await page.waitForNavigation();

                await sleep(2000);
            } catch (err) {
                if (err) {
                    //  await browser.close();();
                    return {
                        success: false,
                        data: null,
                        error: {
                            code: 703,
                            type: 'Puppeteer error.',
                            moment: 'Open media selector page.',
                            error: err.toString(),
                        },
                    };
                }
            }
            // Entering the Post Media
            try {
                const mediaPath = path.join(__dirname, '..', '..', 'public', 'media');
                const fileInput = await page.$('input[type="file"]');

                let media = path.join(mediaPath, post?.media[0])
                // Upload the image file
                await fileInput.uploadFile(media);
                const postIt = await page?.$(`input[name="add_photo_done"]`);

                await postIt.evaluate((s) => s.click());
                await page.waitForNavigation();
                await sleep(2000)
            } catch (err) {
                if (err) {
                    //  await browser.close();();

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
    }

    // Publish the Post
    try {
        await page.evaluate(() => {
            const xpath = '//input[@name="view_post"][@type="submit"]';
            const element = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
            element.click();
        });
        await page.waitForNavigation();
        await sleep(2000);

    } catch (err) {
        if (err) {
            //  await browser.close();();

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
    const totalSleepTime = 5000;

    await sleep(totalSleepTime);
    //  await browser.close();();
    return {
        success: true,
        data: null,
        error: null,
    };
}