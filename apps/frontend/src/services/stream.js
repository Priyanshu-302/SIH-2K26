import { API_ENDPOINTS } from '../config/api';

/**
 * Initiates an SSE response stream using fetch and ReadableStream
 * (With offline interactive simulation if backend is not yet started)
 */
export async function streamAssessmentAPI({ query, sessionId, historyOverride, jurisdiction = 'national', signal, onEvent }) {
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
        jurisdiction,
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
  const isInternational = jurisdiction === 'international';
  const simulatedTokens = isInternational ? [
    "### 1. International Patentability & Novelty Assessment (PCT / EPC / 35 U.S.C.)\n",
    "Under international patent regimes (PCT Articles 33(2) & 33(3)), Ayurvedic compositions are scrutinized for novelty and inventive step. While traditional formulations face prior art anticipation via global TKDL access agreements with the USPTO and EPO, isolated active fractions or synergistic combinations demonstrating verifiable unexpected technical effects overcome obviousness under EPC Article 56.\n\n",
    "### 2. WIPO GRATK Treaty (2024) Mandatory Disclosure Compliance\n",
    "Pursuant to Article 3 of the WIPO Treaty on Intellectual Property, Genetic Resources and Associated Traditional Knowledge (adopted May 24, 2024), patent applicants are legally obligated to disclose the country of origin of genetic resources and the indigenous community providing associated traditional knowledge. Article 4 safeguards non-retroactivity for applications filed prior to entry into force, while Article 7 provides crucial revocation protection, prohibiting patent invalidation solely for inadvertent formal disclosure defects.\n\n",
    "### 3. Nagoya Protocol & Cross-Border ABS Clearance\n",
    "Cross-border transfer and commercialization of Indian biological resources require compliance with the Convention on Biological Diversity (CBD) and the Nagoya Protocol. Commercial entities must obtain Prior Informed Consent (PIC) and execute Mutually Agreed Terms (MAT) via the National Biodiversity Authority (NBA Form I), generating an Internationally Recognized Certificate of Compliance (IRCC) registered on the ABS Clearing-House (ABSCH).\n\n",
    "### 4. Foreign Filing Permission (Section 39 Clearance)\n",
    "Indian resident applicants seeking direct foreign patent protection must obtain written Foreign Filing Permission (FFP) under Section 39 of the Indian Patents Act 1970 (Form 25) prior to filing abroad, or file an initial Indian priority application at least six weeks prior to entering the PCT International Phase (30-month national phase deadline).\n\n",
    "### 5. Target Jurisdiction Regulatory Pathways (US FDA DSHEA & EU THMPD)\n",
    "- **United States**: Botanical formulations enter the US market primarily as Dietary Supplements under DSHEA (21 U.S.C. § 343(r)(6)) permitting substantiated structure/function claims with mandatory FDA disclaimer. Therapeutic or disease treatment claims require an Investigational New Drug (IND) application under FDA Botanical Drug Guidance.\n",
    "- **European Union**: Herbal medicinal products can qualify for simplified registration under the Traditional Herbal Medicinal Products Directive (Directive 2004/24/EC - THMPD) upon demonstrating 30 years of documented medicinal use, including at least 15 years within the European Union."
  ] : [
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
    await new Promise((r) => setTimeout(r, 30));
    onEvent({ type: 'token', data: token });
  }

  // Send citations metadata
  onEvent({
    type: 'citations',
    data: isInternational ? [
      {
        id: 'wipo-gratk-art3',
        source: 'WIPO GRATK Treaty (2024)',
        section: 'Article 3 & Article 7',
        snippet: 'Mandatory disclosure of country of origin of genetic resources and associated traditional knowledge; revocation protection under Article 7.',
        confidence: 'high',
        url: 'https://www.wipo.int/gratk',
      },
      {
        id: 'pct-art33',
        source: 'Patent Cooperation Treaty (PCT)',
        section: 'Rule 51bis & Sec 39 FFP',
        snippet: 'PCT 30-month international phase entry requirements and Section 39 foreign filing permission.',
        confidence: 'high',
        url: 'https://www.wipo.int/pct',
      }
    ] : [
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
