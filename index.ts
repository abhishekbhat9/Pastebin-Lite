import type { NextApiRequest, NextApiResponse } from 'next'
import prisma from '../../../lib/prisma'
import { nowMs } from '../../../lib/time'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.setHeader('Allow', 'POST').status(405).json({ error: 'Method not allowed' })

  const { content, ttl_seconds, max_views } = req.body || {}
  if (typeof content !== 'string' || content.trim() === '') {
    return res.status(400).json({ error: 'content is required and must be a non-empty string' })
  }

  let ttl: number | null = null
  if (ttl_seconds !== undefined) {
    if (!Number.isInteger(ttl_seconds) || ttl_seconds < 1) return res.status(400).json({ error: 'ttl_seconds must be an integer >= 1' })
    ttl = ttl_seconds
  }
  let maxViews: number | null = null
  if (max_views !== undefined) {
    if (!Number.isInteger(max_views) || max_views < 1) return res.status(400).json({ error: 'max_views must be an integer >= 1' })
    maxViews = max_views
  }

  const now = new Date(nowMs(req))
  const expiresAt = ttl ? new Date(now.getTime() + ttl * 1000) : null

  const paste = await prisma.paste.create({
    data: {
      content,
      expiresAt,
      maxViews,
    },
  })

  const proto = req.headers['x-forwarded-proto'] || (req.headers.host && req.headers['x-forwarded-proto'] ? req.headers['x-forwarded-proto'] : 'https')
  const host = req.headers.host || ''
  const url = `${proto}://${host}/p/${paste.id}`

  res.status(201).json({ id: paste.id, url })
}
