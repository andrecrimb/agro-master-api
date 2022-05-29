import { RequestHandler } from 'express'
import { validationResult } from 'express-validator'
import prisma from '../client'
import { AddSeedOrderItem } from '../types/order'
import { responseError } from '../utils'

const addOrderItems: RequestHandler = async (req, res) => {
  try {
    validationResult(req).throw()

    const orderId = req.params.orderId as unknown as number
    const order = await prisma.order.update({
      where: { id: orderId },
      data: {
        seedOrderItems: { createMany: { data: req.body as AddSeedOrderItem[] } }
      }
    })
    res.status(201).json(order)
  } catch (error) {
    responseError(res, error)
  }
}

const deleteOrderItems: RequestHandler = async (req, res) => {
  try {
    validationResult(req).throw()

    const orderItemId = req.params.orderItemId as unknown as number
    const orderItem = await prisma.seedOrderItem.delete({
      where: { id: orderItemId }
    })
    res.status(200).json(orderItem)
  } catch (error) {
    responseError(res, error)
  }
}

export default { addOrderItems, deleteOrderItems }
