import type { NextApiRequest, NextApiResponse } from 'next'
import prisma from '../../../lib/prisma'
import { nowMs } from '../../../lib/time'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const id = req.query.id as string
  if (req.method !== 'GET') return res.setHeader('Allow', 'GET').status(405).json({ error: 'Method not allowed' })

  const now = new Date(nowMs(req))

  // Attempt to atomically increment views only if not expired and under view limit
  const updateResult = await prisma.paste.updateMany({
    where: {
      id,
      AND: [
        { OR: [{ expiresAt: null }, { expiresAt: { gt: now } }] },
        { OR: [{ maxViews: null }, { views: { lt: (await getMaxViews(id)) ?? 0 } }] }
      ]
    },
    data: { views: { increment: 1 } }
  })

  if (updateResult.count === 0) {
    return res.status(404).json({ error: 'paste not found or unavailable' })
  }

  const paste = await prisma.paste.findUnique({ where: { id } })
  if (!paste) return res.status(404).json({ error: 'paste not found' })

  let remaining_views: number | null = null
  if (paste.maxViews !== null && paste.maxViews !== undefined) {
    remaining_views = Math.max(0, paste.maxViews - paste.views)
  }

  res.status(200).json({ content: paste.content, remaining_views, expires_at: paste.expiresAt ? paste.expiresAt.toISOString() : null })
}

async function getMaxViews(id: string) {
  const p = await prisma.paste.findUnique({ where: { id }, select: { maxViews: true } })
  return p?.maxViews ?? null
}
