import express from 'express'
import { body } from 'express-validator'
import authController from '../controllers/auth'
import isAuthSuperUser from '../middleware/isAuthSuperUser'
import User from '../models/user'

const router = express.Router()

router.post(
  '/user',
  isAuthSuperUser,
  [
    body('email')
      .isEmail()
      .custom(value => {
        return User.findOne({ where: { email: value } }).then(userFound => {
          if (userFound) return Promise.reject('duplicated')
        })
      })
      .bail()
      .normalizeEmail(),
    body('firstName').trim().notEmpty(),
    body('password').trim().isLength({ min: 5 }),
    body('role').exists()
  ],
  authController.addNewUser
)

router.post(
  '/login',
  [body('email').trim().isEmail(), body('password').exists()],
  authController.login
)

export default router
