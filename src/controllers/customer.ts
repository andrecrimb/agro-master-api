import { RequestHandler } from 'express'
import prisma from '../client'
import { validationResult } from 'express-validator'
import {
  AddCustomerBody,
  AddCustomerPropertyBody,
  EditCustomerBody,
  EditCustomerPropertyBody
} from '../types/customer'
import { getErrorResponse } from '../utils'

const addCustomer: RequestHandler = async (req, res) => {
  const errors = validationResult(req)

  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() })
  }

  try {
    const { phoneNumbers = [], ...requestValues } = req.body as AddCustomerBody
    const newCustomer = await prisma.customer.create({
      data: {
        ...requestValues,
        phoneNumbers: { create: phoneNumbers }
      }
    })

    res.status(201).json(newCustomer)
  } catch (e) {
    res.status(500).json(getErrorResponse(e))
  }
}

const editCustomer: RequestHandler = async (req, res) => {
  const params = req.params as unknown as { customerId: number }
  const errors = validationResult(req)

  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() })
  }

  try {
    const { phoneNumbers, ...requestValues } = req.body as EditCustomerBody
    let toUpdate = { ...requestValues }

    if (phoneNumbers) {
      await prisma.customer.update({
        where: { id: params.customerId },
        data: { phoneNumbers: { deleteMany: {}, create: phoneNumbers } }
      })
    }

    const updatedCustomer = await prisma.customer.update({
      where: { id: params.customerId },
      data: toUpdate
    })

    res.status(200).json(updatedCustomer)
  } catch (e) {
    res.status(500).json(getErrorResponse(e))
  }
}

const getCustomer: RequestHandler = async (req, res) => {
  try {
    const customerId = req.params.customerId as unknown as number
    const customer = await prisma.customer.findFirst({
      where: { id: customerId },
      select: {
        id: true,
        name: true,
        nickname: true,
        active: true,
        address: true,
        zip: true,
        city: true,
        state: true,
        phoneNumbers: { select: { id: true, label: true, number: true } },
        properties: {
          select: {
            customerId: true,
            property: {
              select: {
                id: true,
                producerName: true,
                name: true,
                cnpj: true,
                cpf: true,
                ie: true,
                address: true,
                zip: true,
                city: true,
                state: true,
                country: true
              }
            }
          }
        }
      }
    })
    return res.status(200).json(customer)
  } catch (e) {
    res.status(500).json(getErrorResponse(e))
  }
}

const getCustomers: RequestHandler = async (req, res) => {
  try {
    const customers = await prisma.customer.findMany({
      select: {
        id: true,
        name: true,
        nickname: true,
        active: true,
        address: true,
        zip: true,
        city: true,
        state: true,
        phoneNumbers: { select: { id: true, label: true, number: true } }
      }
    })
    return res.status(200).json(customers)
  } catch (e) {
    res.status(500).json(getErrorResponse(e))
  }
}

const deleteCustomer: RequestHandler = async (req, res) => {
  const params = req.params as unknown as { customerId: number }
  const errors = validationResult(req)

  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() })
  }

  try {
    const customer = await prisma.customer.delete({ where: { id: params.customerId } })
    res.status(201).json(customer)
  } catch (e) {
    res.status(500).json(getErrorResponse(e))
  }
}

const addCustomerProperty: RequestHandler = async (req, res) => {
  const params = req.params as unknown as { customerId: number }
  const errors = validationResult(req)

  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() })
  }

  try {
    const newProperty = await prisma.customer.update({
      where: { id: params.customerId },
      data: {
        properties: { create: { property: { create: req.body as AddCustomerPropertyBody } } }
      }
    })

    res.status(201).json(newProperty)
  } catch (e) {
    res.status(500).json(getErrorResponse(e))
  }
}

const editCustomerProperty: RequestHandler = async (req, res) => {
  const params = req.params as unknown as { customerId: number; propertyId: number }
  const errors = validationResult(req)

  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() })
  }

  try {
    const requestValues = req.body as EditCustomerPropertyBody

    const property = await prisma.customerProperty.update({
      where: {
        customerId_propertyId: {
          propertyId: params.propertyId,
          customerId: params.customerId
        }
      },
      data: { property: { update: requestValues } }
    })

    res.status(201).json(property)
  } catch (e) {
    res.status(500).json(getErrorResponse(e))
  }
}

const deleteCustomerProperty: RequestHandler = async (req, res) => {
  const params = req.params as unknown as { propertyId: number; customerId: number }
  const errors = validationResult(req)

  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() })
  }

  try {
    const property = await prisma.customerProperty.delete({
      where: { customerId_propertyId: params }
    })
    res.status(201).json(property)
  } catch (e) {
    res.status(500).json(getErrorResponse(e))
  }
}

export default {
  addCustomer,
  editCustomer,
  getCustomers,
  deleteCustomer,
  getCustomer,
  addCustomerProperty,
  editCustomerProperty,
  deleteCustomerProperty
}
