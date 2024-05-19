const { Router } = require('express')
const { ValidationError } = require('sequelize')
const { requireAuthentication } = require('../lib/auth')

const { Photo, PhotoClientFields } = require('../models/photo')

const router = Router()

/*
 * Route to create a new photo.
 */
router.post('/', requireAuthentication,async function (req, res, next) {
  const userID = parseInt(req.body.userId)
  const authorized  = req.user == userID
  console.log(req.user)
  console.log(userID)
  console.log(authorized)
  if (authorized || req.user.admin == true) {
    try {
      const photo = await Photo.create(req.body, PhotoClientFields)
      res.status(201).send({ id: photo.id })
    } catch (e) {
      if (e instanceof ValidationError) {
        res.status(400).send({ error: e.message })
      } else {
        throw e
      }
    }
    }else {
      res.status(403).json({"error": "invalid user"})
    }
  })

/*
 * Route to fetch info about a specific photo.
 */
router.get('/:photoId', async function (req, res, next) {
  const photoId = req.params.photoId
  const photo = await Photo.findByPk(photoId)
  if (photo) {
    res.status(200).send(photo)
  } else {
    next()
  }
})

/*
 * Route to update a photo.
 */
router.patch('/:photoId', requireAuthentication, async function (req, res, next) {
  const userID = parseInt(req.body.userId)
  const authorized  = req.user == userID
  /*
   * Update photo without allowing client to update businessId or userId.
   */
  if (authorized ||req.user.admin == true) {
    const result = await Photo.update(req.body, {
      where: { id: photoId },
      fields: PhotoClientFields.filter(
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
 * Route to delete a photo.
 */
router.delete('/:photoId',requireAuthentication, async function (req, res, next) {
  const userID = parseInt(req.body.userId)
  const authorized  = req.user == userID
  if (authorized || req.user.admin == true) {
    const result = await Photo.destroy({ where: { id: photoId }})
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
