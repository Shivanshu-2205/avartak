/**
 * Streams an SSE response from a POST endpoint.
 * @param {string} endpoint  - e.g. '/api/topic'
 * @param {object} bodyData  - JSON body
 * @param {(token: string) => void} onToken
 * @param {(topics: string[]) => void} onRelatedTopics
 * @param {(err: string) => void} onError
 * @returns {Promise<void>}
 */
export async function streamExplore(endpoint, bodyData, onToken, onRelatedTopics, onError) {
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bodyData),
    })

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}))
      throw new Error(errData.error || 'Server error')
    }

    const reader  = response.body.getReader()
    const decoder = new TextDecoder('utf-8')
    let buffer    = ''

    while (true) {
      const { value, done } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() || ''

      for (const line of lines) {
        if (!line.startsWith('data: ')) continue
        const dataStr = line.slice(6).trim()
        if (dataStr === '[DONE]') return

        try {
          const parsed = JSON.parse(dataStr)
          if (parsed.token)         onToken(parsed.token)
          if (parsed.relatedTopics) onRelatedTopics(parsed.relatedTopics)
          if (parsed.error)         onError(parsed.error)
        } catch (_) {
          // ignore partial / malformed JSON frames
        }
      }
    }
  } catch (err) {
    onError(err.message)
  }
}
