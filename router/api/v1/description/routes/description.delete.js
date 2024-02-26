const express = require('express');

const DELETE = express.Router();
module.exports = DELETE;

const openDB = require('../../../../../data/openDB');

const { loggedIn } = require('../../../../../utils/loggedIn');

DELETE.delete('/all', loggedIn, async (req, res) => {
    
    // Connect to the database.
    const db = await openDB();

    try {
        const query = `
            DELETE
                FROM
                    Description;
        `;

        await db.run(query);

        await db.close();

        return res.json({
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
                    route: '/api/v1/description/delete/all',
                    moment: 'Deleting all descriptions from the database.',
                    message: err.toString(),
                },
            });
        }
    }
});

DELETE.delete('/', loggedIn, async (req, res) => {
    // Connect to the database.
    const db = await openDB();

    const id = req?.body?.id ? parseInt(req?.body?.id) : null;

    if (id === null || isNaN(id) || id <= 0) {
        await db.close();

        return res.status(400).json({
            success: false,
            data: null,
            error: {
                code: 400,
                type: 'Invalid user input.',
                route: '/api/v1/description/delete',
                moment: 'Validating description id submitted by the user.',
                message: "The description id you submitted is invalid. Make sure it's an integer greater than 0.",
            },
        });
    }

    let description;

    try {
        const query = 'SELECT * FROM description WHERE id = ?';
        const params = [id];

        description = await db.get(query, params);

        if (!description) {
            await db.close();

            return res.status(404).json({
                success: false,
                data: null,
                error: {
                    code: 404,
                    type: 'Resource not found.',
                    route: '/api/v1/description/delete',
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
                    route: '/api/v1/description/delete',
                    moment: 'Checking if the description exists in the database.',
                    message: err.toString(),
                },
            });
        }
    }

    try {
        const query = 'DELETE FROM description WHERE id = ?';
        const params = [id];

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
                    route: '/api/v1/description/delete',
                    moment: 'Removing the description from the database.',
                    message: err.toString(),
                },
            });
        }
    }
});
