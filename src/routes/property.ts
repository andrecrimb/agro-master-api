import express from 'express'
import propertyController from '../controllers/property'
import isAuthSuperUser from '../middleware/isAuthSuperUser'
import { body, param } from 'express-validator'
import prisma from '../client'

const router = express.Router()

router.get('/owner-properties', isAuthSuperUser, propertyController.getOwnerProperties)

router.post(
  '/owner-properties',
  isAuthSuperUser,
  [
    body('cnpj')
      .trim()
      .notEmpty()
      .withMessage('field_empty')
      .custom(value => {
        return prisma.ownerProperty
          .findFirst({ where: { property: { cnpj: value } } })
          .then(property => {
            if (property) return Promise.reject('cnpj_duplicated')
          })
      })
      .bail(),
    body('name').trim().notEmpty(),
    body('producerName').trim().notEmpty(),
    body('ie').trim().notEmpty(),
    body('address').trim().notEmpty(),
    body('zip').trim().notEmpty(),
    body('city').trim().notEmpty(),
    body('state').trim().notEmpty()
  ],
  propertyController.addNewOwnerProperty
)

router.patch(
  '/owner-properties/:ownerPropertyId',
  isAuthSuperUser,
  [
    param('ownerPropertyId').exists().toInt(),
    body('cnpj')
      .trim()
      .notEmpty()
      .withMessage('field_empty')
      .custom((value, { req }) => {
        return prisma.ownerProperty
          .findFirst({ where: { property: { cnpj: value } } })
          .then(property => {
            if (property && property.id !== +req.params?.ownerPropertyId) {
              return Promise.reject('cnpj_duplicated')
            }
          })
      })
      .bail(),
    body('name').trim().notEmpty(),
    body('producerName').trim().notEmpty(),
    body('ie').trim().notEmpty(),
    body('address').trim().notEmpty(),
    body('zip').trim().notEmpty(),
    body('city').trim().notEmpty(),
    body('state').trim().notEmpty()
  ],
  propertyController.editOwnerProperty
)

export default router
