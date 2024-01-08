const express = require('express');

const v1 = express.Router();


v1.use('/misc', require('./misc/misc'));
v1.use('/posts', require('./posts/posts'));
v1.use('/groups', require('./groups/groups'));
v1.use('/timesheet', require('./timesheet/timesheet'));
v1.use('/description', require('./description/description'));
module.exports = v1;