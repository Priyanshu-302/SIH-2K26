/**
 * Mock AI Adapter simulating stream generator yields
 */
export async function* mockAgentStream({ query, sessionId, history, options } = {}) {
  const normalizedQuery = (query || '').toLowerCase().trim();

  // Support simulated error query checks for testing fallbacks
  if (normalizedQuery.includes('sim_error') || normalizedQuery.includes('generate_error')) {
    await new Promise((resolve) => setTimeout(resolve, 100));
    yield { type: 'error', message: 'Simulated assessment pipeline error' };
    return;
  }

  // 1. Simulate reasoning/thinking phase
  const reasoningTokens = [
    'System: Initiating classification search...\n',
    'Analyzing classical Ayurveda formulations database...\n',
    'Searching Indian Patents Act Section 3 exclusions...\n',
    'Grounding context: Found 2 matching references in TKDL and IP Databases.\n\n',
    '**Legal Assessment:**\n'
  ];

  for (const token of reasoningTokens) {
    yield { type: 'token', data: token };
    await new Promise((resolve) => setTimeout(resolve, 80));
  }

  // 2. Yield canonical citations list
  const mockCitations = [
    {
      id: 'cit-pat-3p',
      source: 'Patents Act, 1970',
      section: 'Section 3(p)',
      snippet: 'An invention which, in effect, is traditional knowledge or which is an aggregation or duplication of known properties of traditionally known component or components is not patentable.',
      confidence: 'high',
      url: 'https://ipindia.gov.in/patents-act-1970.htm'
    },
    {
      id: 'cit-tkdl-vol2',
      source: 'TKDL Vol. II',
      section: 'Formulation AY-Triphala-042',
      snippet: 'Classical formulation of Triphala (Amalaki, Bibhitaki, Haritaki) combined with honey for chronic digestive disorders.',
      confidence: 'medium',
      url: null
    }
  ];

  yield { type: 'citations', data: mockCitations };
  await new Promise((resolve) => setTimeout(resolve, 150));

  // 3. Yield assessment response tokens
  const responseText = `The formulation described in your query appears to direct itself to a classical Triphala configuration. Under Indian Patent law, specifically Section 3(p) of the Patents Act, 1970, standard Ayurvedic formulations documented in traditional literature (such as the TKDL) are non-patentable. 

To achieve a patentable status, you must demonstrate:
1. A synergistic composition that shows unexpected biological therapeutic efficacy compared to the individual classical ingredients.
2. A novel extraction or processing methodology that is non-obvious to a person skilled in the art of Ayurvedic pharmaceutical sciences.`;

  const words = responseText.split(' ');
  for (const word of words) {
    yield { type: 'token', data: word + ' ' };
    await new Promise((resolve) => setTimeout(resolve, 25));
  }

  // 4. Yield terminal done token
  yield { type: 'done' };
}
