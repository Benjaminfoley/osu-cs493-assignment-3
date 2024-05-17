const {DataTypes} = require('sequelize');

const sequelize = require('../lib/sequelize');

const {hash} = require('../lib/hash');

const Users = sequelize.define('users', {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    username: {type: DataTypes.STRING, allowNull: false},
    email: {type: DataTypes.STRING, allowNull: false},
    password: {type: DataTypes.STRING, allowNull: false},
    // password: {type: DataTypes.STRING, async set (value){ this.setDataValue('password',await hash(value))}, allowNull: false},
    admin: {type: DataTypes.BOOLEAN, allowNull: false}
});

exports.Users = Users;
exports.UserClientFields = [
    'id',
    'username',
    'email',
    'password',
    'admin'
];
