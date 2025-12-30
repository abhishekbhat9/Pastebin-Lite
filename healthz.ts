import type { NextApiRequest, NextApiResponse } from 'next'
import prisma from '../../lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // quick DB check
    await prisma.$queryRaw`SELECT 1`
    res.status(200).json({ ok: true, db: true })
  } catch (err) {
    res.status(200).json({ ok: true, db: false })
  }
}
