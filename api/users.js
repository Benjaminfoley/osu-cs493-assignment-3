const { Router } = require('express')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const { Users } = require('../models/users')
const { Business } = require('../models/business')
const { Photo } = require('../models/photo')
const { Review } = require('../models/review')
const sequelize = require('sequelize')
const { hash } = require('../lib/hash')
const { requireAuthentication } = require('../lib/auth')

const secret_key = process.env.APP_SECRET_KEY;

const router = Router()

/*
  * Route to register new users
*/

router.post('/new', async function (req, res) {
  try{
    const results = await Users.build ({username:req.body.username, email:req.body.email, password: await hash(req.body.password), admin:req.body.admin})
    await results.save()
    const token = generateAuthToken(results.id)
    res.json({"status": "ok", "Token":token, "UserID": results.id})

  } catch(err) {
    res.json({"status": "error", "error": err})
    console.log(err)
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
  const  results  = await Users.findOne({where: {username: req.body.username}})
  if (!results) {
    res.json({"status": "error", "error": "login failed"})
    return
  }

  const authenticated = await bcrypt.compare(req.body.password, results.password)

  if (authenticated) {
    const token = generateAuthToken(results.id)
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
  const userID = parseInt(req.params.userid)
  const authorized  = req.user == userID
  if (authorized || req.user.admin == true) {
    const user = await Users.findByPk(userID)
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
  const authorizedUser = req.user == userId
  if (authorizedUser || req.user.admin == true) {
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
  const authorizedUser = req.user == userId
  if (authorizedUser || req.user.admin == true) {
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
  const authorizedUser = req.user == userId
  if (authorizedUser || req.user.admin == true){
  const userPhotos = await Photo.findAll({ where: { userId: userId }})
  res.status(200).json({
    photos: userPhotos
  })
  } else {
    res.status(403).json({"error": "Unauthorized"})
  }
})


module.exports = router
