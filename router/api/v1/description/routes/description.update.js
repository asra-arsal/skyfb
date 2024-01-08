const express = require('express');

const UPDATE = express.Router();
module.exports = UPDATE;

const openDB = require('../../../../../data/openDB');

const { loggedIn } = require('../../../../../utils/loggedIn');

UPDATE.put('/', loggedIn, async (req, res) => {
    // Connect to the database.
    const db = await openDB();

    // Get user input.
    const id = req?.body?.id ? parseInt(req?.body?.id) : null;
    const reqDescription = req?.body?.description ? req?.body?.description : null;

    // Verify the id submitted by the user is valid.
    if (id === null || isNaN(id) || id <= 0) {
        await db.close();

        return res.status(400).json({
            success: false,
            data: null,
            error: {
                code: 400,
                type: 'Invalid user input.',
                route: '/api/v1/description/update',
                moment: 'Validating description id submitted by the user.',
                message: "The description id you submitted is invalid. Make sure it's an integer greater than 0.",
            },
        });
    }

    try {
        const query = 'SELECT * FROM description WHERE id = ?';
        const params = [id];

        const description = await db.get(query, params);

        if (!description) {
            await db.close();

            return res.status(404).json({
                success: false,
                data: null,
                error: {
                    code: 404,
                    type: 'Resource not found.',
                    route: '/api/v1/description/update',
                    moment: 'Checking if the description exists in the database.',
                    message: 'A description with the id you submitted does not exist in the database.',
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
                    route: '/api/v1/description/update',
                    moment: 'Checking if the description exists in the database.',
                    message: err.toString(),
                },
            });
        }
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
                    route: '/api/v1/description/update',
                    moment: 'Checking to see if the description already exist in the database.',
                    error: `${reqDescription} already exists in the database.`,
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
                    route: '/api/v1/description/update',
                    moment: 'Checking to see if the description already exist in the database.',
                    error: err.toString(),
                },
            });
        }
    }

    try {
        const query = `
            UPDATE description
            SET
            description = ?
            WHERE
                id = ?;
        `;
        const params = [reqDescription, id];

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
                    route: '/api/v1/description/update',
                    moment: 'Updating the description in the database.',
                    error: err.toString(),
                },
            });
        }
    }
});
