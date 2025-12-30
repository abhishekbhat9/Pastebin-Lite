import { useState } from 'react'

export default function Home() {
  const [content, setContent] = useState('')
  const [ttl, setTtl] = useState('')
  const [maxViews, setMaxViews] = useState('')
  const [result, setResult] = useState(null)

  async function submit(e: any) {
    e.preventDefault()
    const body: any = { content }
    if (ttl) body.ttl_seconds = Number(ttl)
    if (maxViews) body.max_views = Number(maxViews)
    const res = await fetch('/api/pastes', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    const j = await res.json()
    setResult(j)
  }

  return (
    <main style={{ padding: 20, fontFamily: 'Arial, sans-serif' }}>
      <h1>Pastebin-Lite</h1>
      <form onSubmit={submit}>
        <div>
          <label>Content</label>
          <br />
          <textarea value={content} onChange={(e) => setContent(e.target.value)} rows={8} cols={80} />
        </div>
        <div>
          <label>TTL seconds (optional)</label>
          <br />
          <input value={ttl} onChange={(e) => setTtl(e.target.value)} />
        </div>
        <div>
          <label>Max views (optional)</label>
          <br />
          <input value={maxViews} onChange={(e) => setMaxViews(e.target.value)} />
        </div>
        <div style={{ marginTop: 10 }}>
          <button type="submit">Create Paste</button>
        </div>
      </form>
      {result && (
        <div style={{ marginTop: 20 }}>
          <h3>Result</h3>
          <pre>{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </main>
  )
}
