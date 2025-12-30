import { GetServerSideProps } from 'next'
import prisma from '../../lib/prisma'
import { nowMs } from '../../lib/time'

function escapeHtml(s: string) {
  return s.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
}

export default function PastePage({ content }: { content: string }) {
  return (
    <main style={{ padding: 20, fontFamily: 'Arial, sans-serif' }}>
      <h1>Paste</h1>
      <pre style={{ whiteSpace: 'pre-wrap', background: '#f6f6f6', padding: 12 }}>{content}</pre>
    </main>
  )
}

export const getServerSideProps: GetServerSideProps = async ({ params, req }) => {
  const id = params?.id as string
  const now = new Date(nowMs(req))

  // try to increment and fetch like the API
  const p = await prisma.paste.findUnique({ where: { id } })
  if (!p) return { notFound: true }
  if (p.expiresAt && p.expiresAt <= now) return { notFound: true }
  if (p.maxViews !== null && p.views >= p.maxViews) return { notFound: true }

  // increment
  await prisma.paste.update({ where: { id }, data: { views: { increment: 1 } } })

  const updated = await prisma.paste.findUnique({ where: { id } })
  if (!updated) return { notFound: true }

  if (updated.expiresAt && updated.expiresAt <= now) return { notFound: true }
  if (updated.maxViews !== null && updated.views > updated.maxViews) return { notFound: true }

  return { props: { content: escapeHtml(updated.content) } }
}
