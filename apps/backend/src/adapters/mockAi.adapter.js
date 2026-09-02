/**
 * Mock AI Adapter simulating stream generator yields.
 * Tailors responses dynamically to accurately match each test query.
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

  // 1. National Biodiversity Authority (NBA) & Section 6 of BD Act
  if (normalizedQuery.includes('biodiversity') || normalizedQuery.includes('nba') || (normalizedQuery.includes('section 6') && !normalizedQuery.includes('saffron'))) {
    mockCitations = [
      {
        id: 'cit-bd-act-sec6',
        source: 'Biological Diversity Act, 2002',
        section: 'Section 6',
        snippet: 'No person shall apply for any intellectual property right in or outside India for any invention based on any research or information on a biological resource obtained from India without obtaining the previous approval of the National Biodiversity Authority...',
        confidence: 'high',
        url: 'https://nbaindia.org/act/'
      },
      {
        id: 'cit-mhc-manu',
        source: 'Madras High Court',
        section: 'Manu Chaudhary v. Controller (2024:MHC:2558)',
        snippet: 'The absence of NBA approval at the time of filing or examination is a curable procedural defect and does not justify a summary rejection. The Controller should keep the application pending until the NBA decision is final.',
        confidence: 'high',
        url: null
      }
    ];

    responseText = `Under **Section 6 of the Biological Diversity Act, 2002**, obtaining approval from the National Biodiversity Authority (NBA) is mandatory before the grant of a patent for inventions using Indian biological resources. 

However, as established in the landmark case of **Manu Chaudhary v. Controller (2024:MHC:2558)**, the lack of NBA approval during the filing or examination stage is a **curable procedural defect**. The Patent Controller cannot reject the patent solely on this ground; rather, they must defer the final decision until the NBA's approval status is resolved.`;

  // 2. Ashwagandha & Charaka Samhita & Section 2(1)(ja)
  } else if (normalizedQuery.includes('ashwagandha') || normalizedQuery.includes('charaka') || normalizedQuery.includes('cognitive')) {
    mockCitations = [
      {
        id: 'cit-tkdl-ashwa',
        source: 'TKDL Vol. I',
        section: 'Formulation AY-ASH-012',
        snippet: 'Traditional use of Ashwagandha (Withania somnifera) root powder for enhancing cognitive memory and reducing stress.',
        confidence: 'high',
        url: null
      },
      {
        id: 'cit-pat-21ja',
        source: 'Patents Act, 1970',
        section: 'Section 2(1)(ja)',
        snippet: 'Inventive step means a feature of an invention that involves technical advance as compared to the existing knowledge or having economic significance or both and that makes the invention not obvious to a person skilled in the art.',
        confidence: 'high',
        url: 'https://ipindia.gov.in/patents-act-1970.htm'
      }
    ];

    responseText = `Since *Withania somnifera* (Ashwagandha) is documented in classical texts like the **Charaka Samhita** and indexed in the TKDL for memory enhancement, its use for cognitive health is considered prior art. 

To satisfy the inventive step requirement under **Section 2(1)(ja)**, the formulation must not be obvious to an expert. A simple dosage form or standard extract of Ashwagandha will be rejected under Section 3(p). To overcome this, the applicant must demonstrate a non-obvious technical advance, such as a novel synergistic carrier system or an enhanced bioavailability delivery mechanism.`;

  // 3. Pippali / Piper longum & Section 3(d) Enhanced Efficacy
  } else if (normalizedQuery.includes('pippali') || normalizedQuery.includes('piper longum') || normalizedQuery.includes('polymorph') || (normalizedQuery.includes('3(d)') && normalizedQuery.includes('toxicity'))) {
    mockCitations = [
      {
        id: 'cit-pat-3d',
        source: 'Patents Act, 1970',
        section: 'Section 3(d)',
        snippet: 'The mere discovery of a new form of a known substance which does not result in the enhancement of the known efficacy of that substance... is not patentable.',
        confidence: 'high',
        url: 'https://ipindia.gov.in/patents-act-1970.htm'
      },
      {
        id: 'cit-sc-novartis',
        source: 'Supreme Court of India',
        section: 'Novartis AG v. Union of India',
        snippet: 'Efficacy under Section 3(d) means therapeutic efficacy. Any property like increased stability or lower toxicity must directly translate into enhanced therapeutic efficacy to satisfy the exclusion.',
        confidence: 'high',
        url: null
      }
    ];

    responseText = `Under **Section 3(d)** of the Patents Act, 1970, a new form (such as a crystalline polymorph) of a known bioactive molecule from Pippali (*Piper longum*) is excluded from patentability unless it shows significantly enhanced efficacy. 

As ruled by the Supreme Court in the landmark **Novartis** case, 'efficacy' refers strictly to **therapeutic efficacy**. While a 40% reduction in toxicity is an important safety improvement, the applicant must demonstrate that this improvement directly translates into superior healing or therapeutic outcomes to overcome Section 3(d).`;

  // 4. InPASS Cow Dung / Panchagavya Lamp
  } else if (normalizedQuery.includes('201721043812') || normalizedQuery.includes('panchagavya') || normalizedQuery.includes('zero brand') || (normalizedQuery.includes('lamp') && normalizedQuery.includes('inpass'))) {
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
1. **Section 3(d) & 3(e) objections were set aside** because the claimed lamp was a finished structural product, not a mere chemical derivative or simple admixture.
2. **Section 3(p) & Section 2(1)(ja) objections were UPHELD**: The invention was refused because making lamps from cow dung and essential oils was already taught in prior art, and aggregating traditionally known *panchagavya* properties lacked an inventive step.`;

  // 5. Kashmir Saffron & GI Registry
  } else if (normalizedQuery.includes('saffron') || normalizedQuery.includes('crocus') || (normalizedQuery.includes('geographical indication') && !normalizedQuery.includes('curcuma'))) {
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

    responseText = `Under the Geographical Indications of Goods Act, 1999, **Kashmir Saffron** (*Crocus sativus L.*, Certificate No. 635) is registered with protected status for its distinctive altitude (>1600m MSL), high crocin levels, and rich aroma. 

Any patent application attempting to monopolize natural Kashmir Saffron or its traditional harvesting processes is subject to revocation under Section 3(p) and GI opposition protections. Authorized producers in Jammu & Kashmir hold collective geographical certification rights.`;

  // 6. TKDL Revocations (USPTO Turmeric 5,401,504 / EPO Neem)
  } else if (normalizedQuery.includes('5,401,504') || normalizedQuery.includes('uspto') || normalizedQuery.includes('neem patent') || normalizedQuery.includes('biopiracy')) {
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

  // 7. Curcuma / Ginger / Section 3(p) & 3(e) Polyherbal Synergy
  } else if (normalizedQuery.includes('curcuma') || normalizedQuery.includes('ginger') || normalizedQuery.includes('zingiber') || (normalizedQuery.includes('3(p)') && normalizedQuery.includes('3(e)'))) {
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

  // 8. Default Triphala Fallback
  } else {
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

    responseText = `The Triphala formulation described in your query directs itself to classical Ayurvedic principles. Under Indian Patent law, specifically Section 3(p) of the Patents Act, 1970, standard Ayurvedic formulations documented in traditional literature (such as the TKDL) are non-patentable. 

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
