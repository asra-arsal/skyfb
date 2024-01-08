const express = require('express');

const home = express.Router();
module.exports = home;

const openDB = require('../../../data/openDB');

const { loggedIn } = require('../../../utils/loggedIn');
const changePass = require('../../../utils/changePass');

const [context, publisher] = (process.env.CONPUB || 'page-page').split('-');

home.get('/', loggedIn, changePass, async (req, res) => {
    const db = await openDB();

    let groups;
    let descriptions;

    try {
        const query = 'SELECT * FROM groups;';

        groups = await db.all(query);

        const description = 'SELECT * FROM description';

        descriptions = await db.all(description);
        // const resultArray = arrayOfObjects.map(obj => Object.values(obj)[0]);

    } catch (err) {
        if (err) {
            await db.close();

            return res.render('errorpage', {
                message: 'There was an error trying to get the groups from the database.',
            });
        }
    }

    res.render('home/home', {
        descriptions,
        groups,
        context: ['page', 'group'].includes(context) ? context : 'page',
        publisher: ['page', 'user'].includes(publisher) ? publisher : 'page',
    });

    await db.close();
});
