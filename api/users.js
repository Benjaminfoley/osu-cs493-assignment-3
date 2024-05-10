const { Router } = require('express')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const { Business } = require('../models/business')
const { Photo } = require('../models/photo')
const { Review } = require('../models/review')

function requireAuthentication(req, res, next) {
  // Get the token from the request
  const auth_header = req.get('Authorization') || ''
  const header_parts = auth_header.split(' ')

  const token = header_parts[0] == "Bearer"? header_parts[1]: null

  try {
    // verify that it's correct
    const payload = jwt.verify(token, secret_key)
    req.user = payload.sub
    next()

  } catch (err) {
    res.status(401).json({"error": "invalid token"})
  }
}



const router = Router()

/*
  * Route to register new users
*/

router.post('/users/new', requireAuthentication, async function (req, res) {
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

function generateAuthToken(user_id) {
  const payload = { "sub": user_id };

  return jwt.sign(payload, secret_key, { "expiresIn": "24h" });
}

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
    const token = generateAuthToken(results[0].id)
    res.json({"status": "ok", "token": token})
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
