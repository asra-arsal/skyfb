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
    // Seed the new database.
    await seedDB();

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
                    ALTER TABLE posts
                    ADD COLUMN comment TEXT;
                `;

        await db.new.run(query);
        console.log('[1] Updating Posts Table Completed!\n\n');
    } catch (err) {
        if (err) {
            console.error('[] There was an error when updating the posts: ', err);
        }
    }
    await db.new.close();

    console.log('Database updation finished successfully!');
    console.log('---------------');
};
