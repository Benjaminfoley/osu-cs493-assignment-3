const { Router } = require('express')
const { ValidationError } = require('sequelize')

const { Business, BusinessClientFields } = require('../models/business')
const { Photo } = require('../models/photo')
const { Review } = require('../models/review')

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
 * Route to return a list of businesses.
 */
router.get('/',async function (req, res) {
  /*
   * Compute page number based on optional query string parameter `page`.
   * Make sure page is within allowed bounds.
   */
  let page = parseInt(req.query.page) || 1
  page = page < 1 ? 1 : page
  const numPerPage = 10
  const offset = (page - 1) * numPerPage

  const result = await Business.findAndCountAll({
    limit: numPerPage,
    offset: offset
  })

  /*
   * Generate HATEOAS links for surrounding pages.
   */
  const lastPage = Math.ceil(result.count / numPerPage)
  const links = {}
  if (page < lastPage) {
    links.nextPage = `/businesses?page=${page + 1}`
    links.lastPage = `/businesses?page=${lastPage}`
  }
  if (page > 1) {
    links.prevPage = `/businesses?page=${page - 1}`
    links.firstPage = '/businesses?page=1'
  }

  /*
   * Construct and send response.
   */
  res.status(200).json({
    businesses: result.rows,
    pageNumber: page,
    totalPages: lastPage,
    pageSize: numPerPage,
    totalCount: result.count,
    links: links
  })
})

/*
 * Route to create a new business.
 */
router.post('/',requireAuthentication, async function (req, res, next) {
  const authorizedUser = req.user
  if (authorizedUser == req.body.ownerid) {
    try {
      const business = await Business.create(req.body, BusinessClientFields)
      res.status(201).send({ id: business.id })
    } catch (e) {
      if (e instanceof ValidationError) {
        res.status(400).send({ error: e.message })
      } else {
        throw e
      }
    }
  } else {
    res.status(403).json({"error": "Unauthorized"})
  }
  })

/*
 * Route to fetch info about a specific business.
 */
router.get('/:businessId',async function (req, res, next) {
  const businessId = req.params.businessId
  const business = await Business.findByPk(businessId, {
    include: [ Photo, Review ]
  })
  if (business) {
    res.status(200).send(business)
  } else {
    next()
  }
})

/*
 * Route to update data for a business.
 */
router.patch('/:businessId', requireAuthentication, async function (req, res, next) {
  const businessId = req.params.businessId
  const authorizedUser = req.user
  if (authorizedUser == req.body.ownerid) {
    const result = await Business.update(req.body, {
      where: { id: businessId },
      fields: BusinessClientFields
    })
    if (result[0] > 0) {
      res.status(204).send()
    } else {
      next()
    }
  } else {
    res.status(403).json({"error": "Unauthorized"})
  }
})

/*
 * Route to delete a business.
 */
router.delete('/:businessId', requireAuthentication, async function (req, res, next) {
  const businessId = req.params.businessId
  const authorizedUser = req.user
  if (authorizedUser == req.body.ownerid) {
    const result = await Business.destroy({ where: { id: businessId }})
    if (result > 0) {
      res.status(204).send()
    } else {
      next()
    }
  } else {
    res.status(403).json({"error": "Unauthorized"})
  }
})

module.exports = router
