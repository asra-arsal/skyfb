const path = require('path');
const { open } = require('sqlite');
const sqlite3 = require('sqlite3');

const { sleep } = require('../utils/utils');

const openMG = () => {
    return open({
        filename: path.join(__dirname, 'old.db'),
        driver: sqlite3.Database,
    });
};

const openDB = require('./openDB');
const seedDB = require('./seedDB');

module.exports = async () => {

    const db = {
        new: await openDB(),
    };

    console.log('---------------');
    console.log('Starting the database updation!\n\n');

    // updating the new posts to the new one
    try {
        console.log('[1] Updating Posts Table...');
        await sleep(1500);
        const query = `
                IF NOT EXISTS (
                    SELECT *
                    FROM INFORMATION_SCHEMA.COLUMNS
                    WHERE TABLE_NAME = 'posts' AND COLUMN_NAME = 'comment'
                )
                BEGIN
                    -- Add the new column
                    ALTER TABLE posts
                    ADD COLUMN comment TEXT;
                END;
                `;

        await db.new.run(query, params);
        console.log('[1] Updating Posts Table Completed!\n\n');
    } catch (err) {
        if (err) {
            console.error('[1] There was an error when updating the posts: ', err);
        }
    }
    await db.new.close();

    console.log('Database updation finished successfully!');
    console.log('---------------');
};
