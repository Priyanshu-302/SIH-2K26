import { API_ENDPOINTS } from '../config/api';

/**
 * Initiates an SSE response stream using fetch and ReadableStream
 * (With offline interactive simulation if backend is not yet started)
 */
export async function streamAssessmentAPI({ query, sessionId, historyOverride, signal, onEvent }) {
  try {
    const response = await fetch(API_ENDPOINTS.CHAT_ASK, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'text/event-stream',
        ...(typeof window !== 'undefined' && localStorage.getItem('ayur_token')
          ? { Authorization: `Bearer ${localStorage.getItem('ayur_token')}` }
          : {}),
      },
      body: JSON.stringify({
        query,
        sessionId,
        ...(historyOverride ? { historyOverride } : {}),
      }),
      signal,
    });

    if (response.ok && response.body) {
      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let buffer = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const frames = buffer.split('\n\n');
        buffer = frames.pop() || '';

        for (const frame of frames) {
          const lines = frame.split('\n');
          for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed.startsWith('data:')) {
              const jsonStr = trimmed.slice(5).trim();
              if (jsonStr) {
                try {
                  const eventPayload = JSON.parse(jsonStr);
                  if (eventPayload.type === 'session' && eventPayload.sessionId) {
                    localStorage.setItem('ayur_session_id', eventPayload.sessionId);
                  }
                  onEvent(eventPayload);
                } catch (err) {
                  console.warn('[SSE Stream] Parse error:', err);
                }
              }
            }
          }
        }
      }
      return;
    } else {
      let errorMsg = `Server error (${response.status})`;
      try {
        const errJson = await response.json();
        errorMsg = errJson.details || errJson.error || errorMsg;
      } catch (e) {}
      throw new Error(errorMsg);
    }
  } catch (err) {
    if (err.name === 'AbortError') {
      onEvent({ type: 'error', message: 'Stream aborted by user.' });
      return;
    }
    // Propagate real server errors to the caller
    throw err;
  }

  // --- Offline Interactive Simulation ---
  const simulatedTokens = [
    "Based on preliminary retrieval against the ",
    "Traditional Knowledge Digital Library (TKDL) ",
    "and classical Ayurvedic treatises (Charaka & Sushruta Samhita), ",
    "the claimed formulation has been evaluated for patentability.\n\n",
    "1. **Anticipation by Prior Art (§ 3(p))**:\n",
    "The combination is documented in classical texts for rasayana and inflammatory mitigation: ",
    "[TKDL Act § 3(p)]",
    " (96% Confidence).\n\n",
    "तदेव युक्तं भैषज्यं यदारोग्याय कल्पते ।\nस चापि भिषजां श्रेष्ठो रोगेभ्यो यः प्रमुच्यते ॥\n— चरक संहिता (Charaka Samhita, Sutrasthana)\n\n",
    "2. **Synergy & Non-Obviousness Requirement (§ 3(e))**:\n",
    "To overcome Section 3(e) aggregation objections, the applicant must provide experimental comparative synergy indices demonstrating that the therapeutic effect exceeds the mere additive sum of the individual components: ",
    "[Prior Art EP1234567A]",
    " (88% Confidence).\n\n",
    "**Statutory Conclusion**: Formulation is non-patentable in its base form under Section 3(p) unless a specific novel extraction fraction with proven non-obvious synergistic efficacy is claimed."
  ];

  for (const token of simulatedTokens) {
    if (signal?.aborted) return;
    await new Promise((r) => setTimeout(r, 45));
    onEvent({ type: 'token', data: token });
  }

  // Send citations metadata
  onEvent({
    type: 'citations',
    data: [
      {
        id: 'cit-1',
        source: 'Traditional Knowledge Digital Library (TKDL Vol. II)',
        section: 'Section 3(p)',
        snippet: 'Classical formulation comprising Tinospora cordifolia and Glycyrrhiza glabra decoction for immunomodulation and rasayana properties.',
        confidence: 'high',
        url: 'https://www.tkdl.res.in',
      },
      {
        id: 'cit-2',
        source: 'European Patent Office (EPO Prior Art)',
        section: 'EP1234567A',
        snippet: 'Comparative synergy analysis requirements for herbal synergistic poly-herbal extracts.',
        confidence: 'high',
        url: 'https://worldwide.espacenet.com',
      },
    ],
  });

  onEvent({ type: 'done' });
}
