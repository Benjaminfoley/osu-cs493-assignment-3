const { Router } = require('express')
const { ValidationError } = require('sequelize')

const { Review, ReviewClientFields } = require('../models/review')
const { requireAuthentication } = require('../lib/auth')

const router = Router()


/*
 * Route to create a new review.
 */
router.post('/', requireAuthentication, async function (req, res, next) {
  const userID = parseInt(req.params.userid)
  const authorized  = req.user == userID
  if (authorized || req.user.admin == true) {
    try {
      const review = await Review.create(req.body, ReviewClientFields)
      res.status(201).send({ id: review.id })
    } catch (e) {
      if (e instanceof ValidationError) {
        res.status(400).send({ error: e.message })
      } else {
        throw e
      }
    }
  } else {
    res.status(403).json({"error": "invalid user"})
  }})

/*
 * Route to fetch info about a specific review.
 */
router.get('/:reviewId', async function (req, res, next) {
  const reviewId = req.params.reviewId
  const review = await Review.findByPk(reviewId)
  if (review) {
    res.status(200).send(review)
  } else {
    next()
  }
})

/*
 * Route to update a review.
 */
router.patch('/:reviewId', requireAuthentication,  async function (req, res, next) {
  const userID = parseInt(req.params.userid)
  const authorized  = req.user == userID
  /*
   * Update review without allowing client to update businessId or userId.
   */
  if (authorized || req.user.admin == true) {
    const result = await Review.update(req.body, {
      where: { id: reviewId },
      fields: ReviewClientFields.filter(
        field => field !== 'businessId' && field !== 'userId'
      )
    })
    if (result[0] > 0) {
      res.status(204).send()
    } else {
      next()
    }
  }else {
    res.status(403).json({"error": "Unauthorized"})
  }
})

/*
 * Route to delete a review.
 */
router.delete('/:reviewId', requireAuthentication, async function (req, res, next) {
  const userID = parseInt(req.params.userid)
  const authorized  = req.user == userID
  if (authorized || req.user.admin == true) {
    const result = await Review.destroy({ where: { id: reviewId }})
    if (result > 0) {
      res.status(204).send()
    } else {
      next()
    }
  }else {
    res.status(403).json({"error": "Unauthorized"})
  }
})

module.exports = router
