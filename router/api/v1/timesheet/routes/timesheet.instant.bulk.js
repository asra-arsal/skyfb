const express = require('express');

const INSTANT = express.Router();
module.exports = INSTANT;

const openDB = require('../../../../../data/openDB');

const { isValidDay, isValidTime, convert24HourTimeTo12HourTime } = require('../../../../../utils/utils');

const { loggedIn } = require('../../../../../utils/loggedIn');


function convertTo24HourFormat(timeString) {
    const [time, period] = timeString.split(/\s+/);
    let [hours, minutes] = time.split(':');

    hours = parseInt(hours);
    minutes = parseInt(minutes);

    if (period === 'PM' && hours < 12) {
        hours += 12;
    } else if (period === 'AM' && hours === 12) {
        hours = 0;
    }

    // Format hours and minutes to have leading zeros if necessary
    hours = hours.toString().padStart(2, '0');
    minutes = minutes.toString().padStart(2, '0');

    return `${hours}:${minutes}`;
}

function generateTimeIntervals(startTime, endTime, intervals) {
    const timeIntervals = [];
    const start = new Date(startTime);
    const end = new Date(endTime);
    const intervalMilliseconds = (end - start) / intervals;

    for (let i = 0; i < intervals; i++) {
        const time = new Date(start.getTime() + i * intervalMilliseconds);
        timeIntervals.push(time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }));
    }
    return timeIntervals;
}
INSTANT.post('/', loggedIn, async (req, res) => {
    const db = await openDB();
    const days = req?.body?.days && req?.body?.days?.length > 0 ? req?.body?.days : null;
    const timeFrom = req?.body?.timeFrom ? req?.body?.timeFrom : null;
    const timeTo = req?.body?.timeTo ? req?.body?.timeTo : null;
    const count = req?.body?.count ? req?.body?.count : 1;
    const type = req?.body?.type ? req?.body?.type : null;

    // Check if user has submitted all required fields.
    if (days === null || timeFrom === null || timeTo === null) {
        await db.close();

        return res.status(400).json({
            success: false,
            data: null,
            error: {
                code: 400,
                type: 'Invalid user input.',
                route: '/api/v1/timesheet/instant-bulk',
                moment: 'Checking if user submitted all required fields.',
                message:
                    'The days or time are missing from your request. Please make sure to provide both days and a time.',
            },
        });
    }

    // Verify if the day submitted by the user is correct.
    let failedDays = false;
    for (let i = 0; i < days.length; i++) {
        const day = days[i];

        if (!isValidDay(day)) {
            failedDays = true;
        }
    }

    if (failedDays) {
        await db.close();

        return res.status(400).json({
            success: false,
            data: null,
            error: {
                code: 400,
                type: 'Invalid user input.',
                route: '/api/v1/timesheet/instant-bulk',
                moment: 'Validating the days submitted by the user.',
                message:
                    'The days you submitted are not valid days! Make sure they are in the following format: Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday.',
            },
        });
    }
    let times = generateTimeIntervals(`1993-02-23 ${timeFrom}`, `1993-02-23 ${timeTo}`, count)
    let error = {
        success: true,
        data: null,
        error: null
    }

    for (let i = 0; i < times.length; i++) {
        let time = times[i]
        // Verify if the time submitted by the user is correct.
        if (!isValidTime(time, 24)) {
            await db.close();
            error = {
                success: false,
                data: null,
                error: {
                    code: 400,
                    type: 'Invalid user input.',
                    route: '/api/v1/timesheet/instant',
                    moment: 'Validating the time submitted by the user.',
                    message:
                        "The time you submitted is not valid! Make sure it's in the 24-hour format: 00:00, 12:00, 18:00, etc.",
                },
            }
            break;
        }
    }

    if (!error.success) {
        return res.json(error)
    }
    
    let errors = {
        system: [],
    };
    for (let i = 0; i < times.length; i++) {
        let time = times[i]
        for (let i = 0; i < days.length; i++) {
            let day = days[i];

            const day_mapping = {
                monday: 'Monday',
                tuesday: 'Tuesday',
                wednesday: 'Wednesday',
                thursday: 'Thursday',
                friday: 'Friday',
                saturday: 'Saturday',
                sunday: 'Sunday',
            };

            const day_min_mapping = {
                mon: 'Monday',
                tue: 'Tuesday',
                wed: 'Wednesday',
                thu: 'Thursday',
                fri: 'Friday',
                sat: 'Saturday',
                sun: 'Sunday',
            };

            day = Object.keys(day_mapping).includes(day.toLowerCase())
                ? day_mapping[day.toLowerCase()]
                : day_min_mapping[day.toLowerCase()];

            const time_formatted = convert24HourTimeTo12HourTime(time);
            const priority = parseInt(time.replace(':', ''));

            try {
                const query = 'SELECT * FROM timesheet WHERE day = ? AND time = ? AND type = ?';
                const params = [day, time, type];

                const timeslot = await db.get(query, params);

                if (!timeslot) {
                    try {
                        const query = `
                        INSERT INTO timesheet
                        (
                            day,
                            time,
                            time_formatted,
                            priority,
                            type
                        ) VALUES (?, ?, ?, ?, ?);
                    `;
                        const params = [day, time, time_formatted, priority, type];

                        await db.run(query, params);
                    } catch (err) {
                        if (err) {
                            errors.system.push({
                                success: false,
                                data: null,
                                error: {
                                    code: 500,
                                    type: 'Internal server error.',
                                    route: '/api/v1/timesheet/instant',
                                    moment: 'Storing the time slot in the database.',
                                    error: err.toString(),
                                },
                            });
                        }
                    }
                }
            } catch (err) {
                if (err) {
                    errors.system.push({
                        success: false,
                        data: null,
                        error: {
                            code: 500,
                            type: 'Internal server error.',
                            route: '/api/v1/timesheet/instant',
                            moment: 'Checking to see if the day and time already exist in the database.',
                            error: err.toString(),
                        },
                    });
                }
            }
        }
    }

    await db.close();

    res.json({
        success: true,
        data: null,
        error:
            errors.system.length === 0
                ? null
                : {
                    code: 699,
                    type: 'System Errors Encountered.',
                    route: '/api/v1/timesheet/instant',
                    moment: 'Adding timeslots to the database.',
                    error: errors.system,
                },
    });
});
