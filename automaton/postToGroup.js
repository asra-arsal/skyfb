const path = require('path');
const puppeteer = require('puppeteer');

const { sleep } = require('../utils/utils');

module.exports = async (post, auth, page, browser) => {
    // Open hamburger menu.
    if (post?.publisher === "page" && post?.context === "group") {

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
    const totalSleepTime = 10000;

    await sleep(totalSleepTime);

    return {
        success: true,
        data: null,
        error: null,
    };
}