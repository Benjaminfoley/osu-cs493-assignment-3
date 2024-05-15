const { Router } = require('express')
const { ValidationError } = require('sequelize')

const { Photo, PhotoClientFields } = require('../models/photo')

const router = Router()

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

/*
 * Route to create a new photo.
 */
router.post('/', requireAuthentication,async function (req, res, next) {
  const authorizedUser = req.user
  if (authorizedUser == req.body.userId) {
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
router.patch('/:photoId', async function (req, res, next) {
  const photoId = req.params.photoId

  /*
   * Update photo without allowing client to update businessId or userId.
   */
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
})

/*
 * Route to delete a photo.
 */
router.delete('/:photoId', async function (req, res, next) {
  const photoId = req.params.photoId
  const result = await Photo.destroy({ where: { id: photoId }})
  if (result > 0) {
    res.status(204).send()
  } else {
    next()
  }
})

module.exports = router
