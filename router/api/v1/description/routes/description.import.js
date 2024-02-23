const express = require('express');

const IMPORT = express.Router();
module.exports = IMPORT;

const openDB = require('../../../../../data/openDB');

const { loggedIn } = require('../../../../../utils/loggedIn');

IMPORT.post('/', loggedIn, async (req, res) => {
    // Connect to the database.
    const db = await openDB();

    try {
        const reqDescriptions = req?.body?.descriptions ? req?.body?.descriptions : null;
        for (let i = 0; i < reqDescriptions.length; i++) {
            const query = `
                INSERT INTO description
                (
                    description
                ) VALUES (?);
            `;
            const params = [reqDescriptions[i]];

            await db.run(query, params);
        }
        await db.close();
        res.json({
            success: true,
            data: null,
            error: null,
        });
    } catch (err) {
        if (err) {
            await db.close();

            return res.status(500).json({
                success: false,
                data: null,
                error: {
                    code: 500,
                    type: 'Internal server error.',
                    route: '/api/v1/description/import',
                    moment: 'Storing the description in the database.',
                    error: err.toString(),
                },
            });
        }
    }

});
