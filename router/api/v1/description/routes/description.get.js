const express = require('express');

const GET = express.Router();
module.exports = GET;

const openDB = require('../../../../../data/openDB');

const { isValidDay } = require('../../../../../utils/utils');

const { loggedIn } = require('../../../../../utils/loggedIn');

GET.get('/all', loggedIn, async (req, res) => {
    // Connect with the database.
    const db = await openDB();

    try {
        const query = 'SELECT * FROM description';

        const descriptions = await db.all(query);

        res.json({
            success: true,
            data: {
                descriptions,
            },
            error: null,
        });

        await db.close();
    } catch (err) {
        if (err) {
            await db.close();

            return res.status(500).json({
                success: false,
                data: null,
                error: {
                    code: 500,
                    type: 'Internal server error.',
                    route: '/api/v1/description/all',
                    moment: 'Echoing all descriptions from the database.',
                    message: err.toString(),
                },
            });
        }
    }
});
