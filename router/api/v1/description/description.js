const express = require('express');

const description = express.Router();

description.use('/', require('./routes/description.get'));
description.use('/create', require('./routes/description.create'));
description.use('/import', require('./routes/description.import'));
description.use('/update', require('./routes/description.update'));
description.use('/delete', require('./routes/description.delete'));
description.use('/instant', require('./routes/description.instant'));
description.use('/get', require('./routes/description.get'));
module.exports = description;
