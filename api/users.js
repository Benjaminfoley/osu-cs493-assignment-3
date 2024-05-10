const { Router } = require('express')
const bcrypt = require('bcryptjs')

const { Business } = require('../models/business')
const { Photo } = require('../models/photo')
const { Review } = require('../models/review')

const router = Router()

/*
  * Route to register new users
*/

router.post('/users/new', async function (req, res) {
  try{
    const hashed_password = await bcrypt.hash(req.body.password, 8)

    const [ results ] = await mysqlPool.query(`INSERT INTO users
      (name, email, password) VALUES (?, ?, ?);`,
      [req.body.name, req.body.email, hashed_password])

    res.json({"status": "ok"})
  } catch(err) {
    res.json({"status": "error", "error": err}) 
  }
})
/*
  * Route to register new users
*/
router.post('/login', async function (req, res) {
  const [ results ] = await mysqlPool.query(
    "SELECT * FROM users WHERE name = ?",
    [req.body.name])

  if (!results[0]) {
    res.json({"status": "error", "error": "login failed"})
    return
  }

  const authenticated = await bcrypt.compare(req.body.password, results[0].password)

  if (authenticated) {
    res.json({"status": "ok"})
  }
  else {
    res.json({"status": "error", "error": "login failed"})
  }
})

/*
  * Routes to the Specified User
*/

router.get('/:users/{userID}', async function (req, res) {
  const userID = req.params.userID
  const user = await User.findByPk(userID)
  res.status(200).json({ user })
})

/*
 * Route to list all of a user's businesses.
 */
router.get('/:userId/businesses', async function (req, res) {
  const userId = req.params.userId
  const userBusinesses = await Business.findAll({ where: { ownerId: userId }})
  res.status(200).json({
    businesses: userBusinesses
  })
})

/*
 * Route to list all of a user's reviews.
 */
router.get('/:userId/reviews', async function (req, res) {
  const userId = req.params.userId
  const userReviews = await Review.findAll({ where: { userId: userId }})
  res.status(200).json({
    reviews: userReviews
  })
})

/*
 * Route to list all of a user's photos.
 */
router.get('/:userId/photos', async function (req, res) {
  const userId = req.params.userId
  const userPhotos = await Photo.findAll({ where: { userId: userId }})
  res.status(200).json({
    photos: userPhotos
  })
})

module.exports = router
