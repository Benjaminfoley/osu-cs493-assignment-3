const {DataTypes} = require('sequelize');

const sequelize = require('../lib/sequelize');

const {hash} = require('../lib/hash');

const Users = sequelize.define('users', {
    username: {type: DataTypes.STRING, allowNull: false},
    email: {type: DataTypes.STRING, allowNull: false},
    password: {type: DataTypes.STRING, allowNull: false},
    // password: {type: DataTypes.STRING, async set (value){ this.setDataValue('password',await hash(value))}, allowNull: false},
    admin: {type: DataTypes.BOOLEAN, allowNull: false}
});

exports.Users = Users;
exports.UserClientFields = [
    'username',
    'email',
    'password',
    'admin'
];
