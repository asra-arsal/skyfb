const express = require('express');

const settings = express.Router();
module.exports = settings;

const openDB = require('../../../data/openDB');

const { loggedIn } = require('../../../utils/loggedIn');
const changePass = require('../../../utils/changePass');

settings.get('/', loggedIn, changePass, async (req, res) => {
    const db = await openDB();

    let groups;

    try {
        const query = 'SELECT * FROM groups;';
        groups = await db.all(query);
    } catch (err) {
        if (err) {
            await db.close();

            return res.render('errorpage', {
                message: 'There was an error trying to get the groups from the database.',
            });
        }
    }

    res.render('settings/settings', { groups });

    await db.close();
});
