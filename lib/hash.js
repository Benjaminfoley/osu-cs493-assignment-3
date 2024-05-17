const bcrypt = require ('bcryptjs');

function hash(value) {
    return bcrypt.hash(value, 8);
}

module.exports = { hash };