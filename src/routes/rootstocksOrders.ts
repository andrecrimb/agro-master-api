import express from 'express'
import isAuthSuperUser from '../middleware/isAuthSuperUser'
import rootstocksOrders from '../controllers/rootstocksOrders'
import { body, param } from 'express-validator'
import { orderNotCanceled } from './validators'

const router = express.Router()

router.post(
  '/orders/:orderId/rootstocksOrderItems',
  isAuthSuperUser,
  [
    param('orderId').exists().toInt().custom(orderNotCanceled).bail(),
    body('*.rootstockId').exists().notEmpty().toInt(),
    body('*.quantity').exists().toInt().isInt({ min: 1 }),
    body('*.unityPrice').exists().toFloat().isFloat({ min: 1 })
  ],
  rootstocksOrders.addOrderItems
)

router.delete(
  '/orders/:orderId/rootstocksOrderItems/:orderItemId',
  isAuthSuperUser,
  [
    param('orderId').exists().toInt().custom(orderNotCanceled).bail(),
    param('orderItemId').exists().toInt()
  ],
  rootstocksOrders.deleteOrderItems
)

export default router
