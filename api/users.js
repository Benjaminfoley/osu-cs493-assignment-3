const { Router } = require('express')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const { Business } = require('../models/business')
const { Photo } = require('../models/photo')
const { Review } = require('../models/review')

const secret_key = process.env.APP_SECRET_KEY;

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
router.get('/:userid', requireAuthentication, async function (req, res) {
  const userID = req.params.userid
  const authorized  = req.user == userID
  if (authorized) {
    const user = await User.findByPk(userid)
    res.status(200).json({ user })
  }
  else{
    res.status(403).json({"error": "Unauthorized"})
  }
})

/*
 * Route to list all of a user's businesses.
 */
router.get('/:userId/businesses', requireAuthentication, async function (req, res) {
  const userId = req.params.userId
  const authorized = req.user == userId
  if (authorized) {
    const userBusinesses = await Business.findAll({ where: { ownerId: userId }})
    res.status(200).json({
      businesses: userBusinesses
  })
  }else {
    res.status(403).json({"error": "Unauthorized"})
  }
})

/*
 * Route to list all of a user's reviews.
 */
router.get('/:userId/reviews', requireAuthentication, async function (req, res) {
  const userId = req.params.userId
  const authorized = req.user == userId
  if (authorized) {
    const userReviews = await Review.findAll({ where: { userId: userId }})
    res.status(200).json({
      reviews: userReviews
    })
  } else {
      res.status(403).json({"error": "Unauthorized"})
    }
  })


/*
 * Route to list all of a user's photos.
 */
router.get('/:userId/photos', requireAuthentication, async function (req, res) {
  const userId = req.params.userId
  const authorized = req.user == userId
  if (authorized){
  const userPhotos = await Photo.findAll({ where: { userId: userId }})
  res.status(200).json({
    photos: userPhotos
  })
  } else {
    res.status(403).json({"error": "Unauthorized"})
  }
})


module.exports = router
