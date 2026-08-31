/**
 * Mock AI Adapter simulating stream generator yields.
 * Tailors responses dynamically to showcase all 5 Ayurvedic IP dataset categories.
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
    'Grounding context: Found matching references across master legal datasets.\n\n',
    '**Legal Assessment:**\n'
  ];

  for (const token of reasoningTokens) {
    yield { type: 'token', data: token };
    await new Promise((resolve) => setTimeout(resolve, 80));
  }

  let mockCitations = [];
  let responseText = '';

  if (normalizedQuery.includes('201721043812') || normalizedQuery.includes('inpass') || normalizedQuery.includes('zero brand') || normalizedQuery.includes('panchagavya') || normalizedQuery.includes('lamp')) {
    // Dataset 5: InPASS Patent Prosecutions
    mockCitations = [
      {
        id: 'cit-inpass-panchagavya',
        source: 'InPASS Application 201721043812 (201721043812-panchagavya-lamp.md)',
        section: 'Madras High Court Ruling (2024:MHC:2558)',
        snippet: 'Court affirmed rejection under Section 3(p) and Section 2(1)(ja) because aggregating panchagavya and herbal leaves into a cow-dung lamp is obvious and an aggregation of traditionally known properties.',
        confidence: 'high',
        url: 'https://indiankanoon.org/doc/147461851/'
      },
      {
        id: 'cit-pat-21ja',
        source: 'Patents Act, 1970',
        section: 'Section 2(1)(ja)',
        snippet: 'Inventive step requires a technical advance or non-obviousness over cited prior art.',
        confidence: 'high',
        url: 'https://ipindia.gov.in/patents-act-1970.htm'
      }
    ];

    responseText = `In Indian Patent Application **201721043812** (*M/s The Zero Brand Zone Pvt. Ltd.*), the applicant sought a patent for a biodegradable lamp made of cow dung, ghee, and herbal leaves. 

On appeal, the Madras High Court (**2024:MHC:2558**) ruled:
1. **Section 3(d) & 3(e) were set aside** because the claim was for a finished product/process, not a new chemical form or mere mixture.
2. **Section 3(p) & Section 2(1)(ja) were UPHELD**: The invention was refused because making lamps from cow dung and essential oils was already taught in prior art (D3), and aggregating traditionally known *panchagavya* properties lacks inventive step.`;

  } else if (normalizedQuery.includes('uspto') || normalizedQuery.includes('5,401,504') || normalizedQuery.includes('tkdl') || normalizedQuery.includes('wound') || normalizedQuery.includes('neem patent') || normalizedQuery.includes('turmeric patent')) {
    // Dataset 4: Traditional Knowledge Digital Library (TKDL)
    mockCitations = [
      {
        id: 'cit-tkdl-turmeric',
        source: 'TKDL Case Study: US 5,401,504 (turmeric.md)',
        section: 'Ground: Lack of Novelty via Sanskrit Classical Prior Art',
        snippet: 'CSIR successfully revoked University of Mississippi patent on Turmeric wound healing by submitting 32 Sanskrit references from Charaka Samhita and Sushruta Samhita.',
        confidence: 'high',
        url: 'https://www.wipo.int/tk/en/docs/use-of-turmeric-in-wound-healing-e.pdf'
      },
      {
        id: 'cit-tkdl-neem',
        source: 'TKDL Case Study: EP 0436257 (neem.md)',
        section: 'Ground: Revocation of Fungicidal Neem Claims at EPO',
        snippet: 'EPO Opposition Division revoked WR Grace & USDA patent on hydrophobic neem extract for lack of novelty and inventive step based on Indian traditional knowledge.',
        confidence: 'high',
        url: null
      }
    ];

    responseText = `The **TKDL (Traditional Knowledge Digital Library)** established landmark international precedents in biopiracy prevention:

1. **Turmeric Patent (US 5,401,504)**: The USPTO revoked all claims on November 20, 1997, after CSIR presented ancient Ayurvedic citations proving turmeric's wound-healing properties had been documented for centuries in the *Charaka Samhita*.
2. **Neem Patent (EP 0436257)**: The European Patent Office revoked W.R. Grace's fungicidal neem patent after Indian opponents proved traditional knowledge anticipation.

These cases demonstrate that prior publication in ancient Indian treatises destroys novelty internationally.`;

  } else if (normalizedQuery.includes('novartis') || normalizedQuery.includes('divya pharmacy') || normalizedQuery.includes('case law') || normalizedQuery.includes('precedent')) {
    // Dataset 2: Landmark Case Law
    mockCitations = [
      {
        id: 'cit-sc-novartis',
        source: 'Supreme Court of India (novartis_v_union_of_india.md)',
        section: 'Interpretation of Section 3(d) Therapeutic Efficacy',
        snippet: 'Supreme Court ruled that efficacy in Section 3(d) means therapeutic efficacy. Physical stability or lower toxicity without enhanced therapeutic healing does not qualify.',
        confidence: 'high',
        url: 'https://indiankanoon.org/doc/165776436/'
      },
      {
        id: 'cit-uk-divya',
        source: 'Uttarakhand High Court (divya_pharmacy_v_uoi.md)',
        section: 'Benefit Sharing under Biological Diversity Act',
        snippet: 'Uttarakhand HC held that domestic Indian entities are equally liable for Fair and Equitable Benefit Sharing (FEBS) with local communities under Section 21 of the BD Act.',
        confidence: 'high',
        url: 'https://indiankanoon.org/doc/161836173/'
      }
    ];

    responseText = `Two foundational judicial precedents guide Ayurvedic IP law in India:

1. **Novartis AG v. Union of India (Supreme Court)**: Established that Section 3(d) sets a strict threshold requiring demonstrable enhancement of **therapeutic efficacy** rather than mere physicochemical improvements.
2. **Divya Pharmacy v. Union of India (Uttarakhand High Court)**: Ruled that Indian commercial entities using local biological resources and traditional knowledge must share benefits (FEBS) with local biodiversity management committees.`;

  } else if (normalizedQuery.includes('saffron') || normalizedQuery.includes('crocus') || normalizedQuery.includes('geographical indication') || /\bgi\b/.test(normalizedQuery)) {
    // Dataset 3: Geographical Indications (GI) Registry
    mockCitations = [
      {
        id: 'cit-gi-saffron',
        source: 'GI Certificate No. 635 (kashmir_saffron.md)',
        section: 'Section: Geographical Area & Chemical Profile',
        snippet: 'Kashmir Saffron (Crocus sativus L.) cultivated in Karewa highlands of J&K with uniquely high crocin (color), safranal (aroma), and picrocrocin (bitterness) content.',
        confidence: 'high',
        url: 'https://ipindia.gov.in/girindia/'
      },
      {
        id: 'cit-gi-act-sec20',
        source: 'Geographical Indications of Goods Act, 1999',
        section: 'Section 20(1)',
        snippet: 'No person shall be entitled to institute any proceeding to prevent, or to recover damages for, the infringement of an unregistered geographical indication.',
        confidence: 'high',
        url: 'https://ipindia.gov.in/girindia/'
      }
    ];

    responseText = `Under the Geographical Indications of Goods Act, 1999, **Kashmir Saffron** (Crocus sativus L., Certificate No. 635) is registered with protected status for its distinctive altitude (>1600m MSL), high crocin levels, and rich aroma. 

Any patent application attempting to monopolize natural Kashmir Saffron or its traditional harvesting processes is subject to revocation under Section 3(p) and GI opposition protections. Authorized producers in Jammu & Kashmir hold collective geographical certification rights.`;

  } else if (normalizedQuery.includes('3(p)') || normalizedQuery.includes('3(e)') || normalizedQuery.includes('patents act') || normalizedQuery.includes('curcuma') || normalizedQuery.includes('zingiber')) {
    // Dataset 1: Statutory Acts & Rules
    mockCitations = [
      {
        id: 'cit-pat-3p',
        source: 'Patents Act, 1970 (patents_act_1970.pdf)',
        section: 'Section 3(p)',
        snippet: 'An invention which, in effect, is traditional knowledge or which is an aggregation or duplication of known properties of traditionally known component or components is not patentable.',
        confidence: 'high',
        url: 'https://ipindia.gov.in/patents-act-1970.htm'
      },
      {
        id: 'cit-pat-3e',
        source: 'Patents Act, 1970 (patents_act_1970.pdf)',
        section: 'Section 3(e)',
        snippet: 'A substance obtained by a mere admixture resulting only in the aggregation of the properties of the components thereof or a process for producing such substance is not patentable.',
        confidence: 'high',
        url: 'https://ipindia.gov.in/patents-act-1970.htm'
      }
    ];

    responseText = `Under **Section 3(p)** of the Patents Act, 1970, standard combinations of traditionally known plants like Curcuma longa (Turmeric) and Zingiber officinale (Ginger) are excluded from patentability. 

However, if you demonstrate an unexpected **synergistic effect** (e.g., a specific ratio that provides therapeutic efficacy significantly greater than the sum of Ginger and Turmeric separately), the composition can be examined under **Section 3(e)** with proper comparative laboratory data.`;

  } else {
    // Default fallback
    mockCitations = [
      {
        id: 'cit-pat-3p',
        source: 'Patents Act, 1970 (patents_act_1970.pdf)',
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

    responseText = `The formulation described in your query directs itself to classical Ayurvedic principles. Under Indian Patent law, specifically Section 3(p) of the Patents Act, 1970, standard Ayurvedic formulations documented in traditional literature (such as the TKDL) are non-patentable. 

To achieve patentability, you must demonstrate a non-obvious synergistic composition with enhanced therapeutic efficacy under Section 3(e) or 3(d).`;
  }

  yield { type: 'citations', data: mockCitations };
  await new Promise((resolve) => setTimeout(resolve, 150));

  // Yield assessment response tokens
  const words = responseText.split(' ');
  for (const word of words) {
    yield { type: 'token', data: word + ' ' };
    await new Promise((resolve) => setTimeout(resolve, 25));
  }

  // Yield terminal done token
  yield { type: 'done' };
}
