/*
 * This file contains a simple script to populate the database with initial
 * data from the files in the data/ directory.
 */

const sequelize = require('./lib/sequelize')
const { Business, BusinessClientFields } = require('./models/business')
const { Photo, PhotoClientFields } = require('./models/photo')
const { Review, ReviewClientFields } = require('./models/review')
const { Users, UserClientFields } = require('./models/users')

const businessData = require('./data/businesses.json')
const photoData = require('./data/photos.json')
const reviewData = require('./data/reviews.json')
const userData = require('./data/users.json')

sequelize.sync().then(async function () {
  await Business.bulkCreate(businessData, { fields: BusinessClientFields })
  await Photo.bulkCreate(photoData, { fields: PhotoClientFields })
  await Review.bulkCreate(reviewData, { fields: ReviewClientFields })
  await Users.bulkCreate(userData, { fields: UserClientFields })
})
