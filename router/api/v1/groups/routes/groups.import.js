const express = require('express');

const CREATE = express.Router();
module.exports = CREATE;
const openDB = require('../../../../../data/openDB');

const { isValidURL } = require('../../../../../utils/utils');

const { loggedIn } = require('../../../../../utils/loggedIn');

CREATE.post('/', loggedIn, async (req, res) => {
    // Connect to the database.
    const db = await openDB();
    const groups = req?.body?.groups ? req?.body?.groups : [];

    let isError = null
    // Verifying the data 
    for (let i = 0; i < groups.length; i++) {
        let { name, link } = groups[i]
        // Check if the user has submitted all the required fields.
        if (name === null || link === null) {
            
            isError = 'The name or link are missing from your request. Please make sure to provide both a Group name and a Group link.';
            break;
        }

        // Verify if the link submitted by the user is valid.
        if (!isValidURL(link)) {
            isError = "The link you submitted is invalid. Make sure it's of the following format: http(s)://(www.)example.org";
            break;
        }

        // Check if the Group already exists in the database.
        try {
            const query = 'SELECT * FROM groups WHERE name = ? OR link = ?;';
            const params = [groups[i].name, groups[i].link];

            const existing_groups = await db.all(query, params);

            if (existing_groups.length !== 0) {
                isError = "The group you submitted already exists in the database.";
                break;
            }
        } catch (err) {
            if (err) {
                isError = err.toString();
                break;
            }
        }
    }

    if (isError) {
        await db.close();
        return res.status(409).json({
            success: false,
            data: null,
            error: {
                code: 409,
                type: 'Error',
                route: '/api/v1/groups/import',
                moment: 'Verifying the import data',
                error: isError,
            },
        });
    }
    for (let i = 0; i < groups.length; i++) {
        let group = groups[i]

        // Save the Group into the database.
        try {
            let query = `
                INSERT INTO groups
                (
                    name,
                    link
                ) VALUES (?, ?);
            `;
            let params = [group.name, group.link];
            console.log('params: ', params);
                
            await db.run(query, params);
    
            
    
        } catch (err) {
            if (err) {
                console.log('err: ', err);
            }
        }
    }
    await db.close();
    res.json({
        success: true,
        data: null,
        error: null,
    });



});
