const express = require('express');

const description = express.Router();
module.exports = description;

const openDB = require('../../../data/openDB');

const { loggedIn } = require('../../../utils/loggedIn');
const changePass = require('../../../utils/changePass');

description.get('/', loggedIn, changePass, async (req, res) => {
    // Connect to the database.
    const db = await openDB();

    let descriptions;

    try {
        const query = 'SELECT * FROM description';

        descriptions = await db.all(query);
    } catch (err) {
        if (err) {
            await db.close();

            return res.send('There was an error trying to get the description from the database.');
        }
    }
    res.render('description/description', { descriptions });
});
