import { RequestHandler } from 'express'
import { validationResult } from 'express-validator'
import bcrypt from 'bcryptjs'
import { AddUserBody, EditUserBody } from '../types/user'
import prisma from '../client'
import { User } from '.prisma/client'
import { getErrorResponse } from '../utils'

const addNewUser: RequestHandler = async (req, res) => {
  const errors = validationResult(req)

  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() })
  }

  try {
    const { password, phoneNumbers = [], ...requestValues } = req.body as AddUserBody

    const hashedPw = await bcrypt.hash(password, 12)
    const newUser = await prisma.user.create({
      data: { ...requestValues, password: hashedPw, phoneNumbers: { create: phoneNumbers } }
    })

    res.status(201).json(newUser)
  } catch (e) {
    res.status(500).json(getErrorResponse(e))
  }
}

const editUser: RequestHandler = async (req, res) => {
  const params = req.params as unknown as { userId: number }
  const errors = validationResult(req)

  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() })
  }

  try {
    const { password, phoneNumbers, ...requestValues } = req.body as EditUserBody
    let toUpdate = { ...requestValues }

    if (password) {
      const hashedPw = await bcrypt.hash(password, 12)
      toUpdate = { ...requestValues, password: hashedPw } as EditUserBody
    }

    if (phoneNumbers) {
      await prisma.user.update({
        where: { id: params.userId },
        data: { phoneNumbers: { deleteMany: {}, create: phoneNumbers } }
      })
    }

    const updatedUser = await prisma.user.update({
      where: { id: params.userId },
      data: toUpdate,
      select: {
        id: true,
        name: true,
        email: true,
        isSuperuser: true,
        active: true,
        phoneNumbers: { select: { id: true, label: true, number: true } }
      }
    })

    res.status(200).json(updatedUser)
  } catch (e) {
    res.status(500).json(getErrorResponse(e))
  }
}

const getUsers: RequestHandler = async (req, res) => {
  try {
    const currentUser = res.locals.user as User
    const users = await prisma.user.findMany({
      where: { id: { not: currentUser.id } },
      select: {
        id: true,
        name: true,
        email: true,
        isSuperuser: true,
        active: true,
        phoneNumbers: { select: { id: true, label: true, number: true } }
      }
    })
    return res.status(200).json(users)
  } catch (e) {
    res.status(500).json(getErrorResponse(e))
  }
}

const getUser: RequestHandler = async (req, res) => {
  try {
    const userId = req.params.userId as unknown as number
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        isSuperuser: true,
        active: true,
        phoneNumbers: { select: { id: true, label: true, number: true } }
      }
    })
    return res.status(200).json(user)
  } catch (e) {
    res.status(500).json(getErrorResponse(e))
  }
}

export default { addNewUser, getUser, getUsers, editUser }
