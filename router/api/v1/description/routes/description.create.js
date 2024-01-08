const express = require('express');

const CREATE = express.Router();
module.exports = CREATE;

const openDB = require('../../../../../data/openDB');

const { loggedIn } = require('../../../../../utils/loggedIn');

CREATE.post('/', loggedIn, async (req, res) => {
    // Connect to the database.
    const db = await openDB();

    const reqDescription  = req?.body?.description ? req?.body?.description : null;

    // Check if user has submitted all required fields.
    if (reqDescription  === null) {
        await db.close();

        return res.status(400).json({
            success: false,
            data: null,
            error: {
                code: 400,
                type: 'Invalid user input.',
                route: '/api/v1/description/create',
                moment: 'Checking if user submitted all required fields.',
                message:
                    'Description is missing from your request. Please make sure to provide description.',
            },
        });
    }

    try {
        const query = 'SELECT * FROM description WHERE description = ?';
        const params = [reqDescription];

        const description = await db.get(query, params);

        if (description) {
            await db.close();

            return res.status(409).json({
                success: false,
                data: null,
                error: {
                    code: 409,
                    type: 'Duplicate content.',
                    route: '/api/v1/description/create',
                    moment: 'Checking to see if the description already exist in the database.',
                    error: `${description} already exists in the database.`,
                },
            });
        }
    } catch (err) {

        if (err) {
            await db.close();

            return res.status(500).json({
                success: false,
                data: null,
                error: {
                    code: 500,
                    type: 'Internal server error.',
                    route: '/api/v1/description/create',
                    moment: `Checking to see if description already exist in the database.`,
                    error: err.toString(),
                },
            });
        }
    }

    try {
        const query = `
            INSERT INTO description
            (
                description
            ) VALUES (?);
        `;
        const params = [reqDescription ];

        await db.run(query, params);

        res.json({
            success: true,
            data: null,
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
                    route: '/api/v1/description/create',
                    moment: 'Storing the description in the database.',
                    error: err.toString(),
                },
            });
        }
    }
});
