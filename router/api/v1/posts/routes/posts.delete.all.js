const fs = require('fs');
const path = require('path');

const express = require('express');

const DELETE = express.Router();

const openDB = require('../../../../../data/openDB');

const { loggedIn } = require('../../../../../utils/loggedIn');

DELETE.delete('/', loggedIn, async (req, res) => {
    // Connect to the database.
    const db = await openDB();

    const type = req?.body?.type ? req?.body?.type : null;
    const types = ['automated', 'scheduled'];
    if (!types.includes(type)) {
        await db.close();

        return res.status(404).json({
            success: false,
            data: null,
            error: {
                code: 404,
                type: 'Resource not found.',
                route: `/api/v1/posts/delete-all`,
                moment: `Trying to get posts of type '${type}' from the database.`,
                message: 'No such route or post type exists.',
            },
        });
    }

    let posts;

    try {
        const query = 'SELECT * FROM posts WHERE type = ?';
        const params = [type];

        posts = await db.get(query, params);

        if (!posts || posts.length === 0) {
            await db.close();

            return res.status(404).json({
                success: false,
                data: null,
                error: {
                    code: 404,
                    type: 'Resource not found.',
                    route: '/api/v1/posts/delete-all',
                    moment: 'Checking if the post exists in the database.',
                    message: 'A posts with the type you submitted does not exist in the database.',
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
                    route: '/api/v1/posts/delete-all',
                    moment: 'Checking if the post exists in the database.',
                    message: err.toString(),
                },
            });
        }
    }

    try {
        const query = 'DELETE FROM posts WHERE type = ?';
        const params = [type];

        await db.run(query, params);

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
                    route: '/api/v1/posts/delete-all',
                    moment: 'Removing the post content from the database.',
                    message: err.toString(),
                },
            });
        }
    }

});
module.exports = DELETE;
