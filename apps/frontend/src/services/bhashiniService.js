/**
 * Bhashini Dhruva API Service — Ayur-IP
 * 
 * Provides: translation, ASR, and TTS via the official Bhashini inference pipeline.
 * 
 * Required ENV vars (set in .env):
 *   VITE_BHASHINI_USER_ID          — Your Bhashini userId
 *   VITE_BHASHINI_API_KEY          — Your ulcaApiKey
 *   VITE_BHASHINI_INFERENCE_KEY    — Your Dhruva inference Authorization key
 * 
 * Graceful Fallback:
 *   If ENV vars are missing, all API calls resolve immediately with the original
 *   input unchanged. The UI continues to work in English with static i18n labels.
 */

const BHASHINI_USER_ID       = import.meta.env.VITE_BHASHINI_USER_ID || '';
const BHASHINI_API_KEY       = import.meta.env.VITE_BHASHINI_API_KEY || '';
const BHASHINI_INFERENCE_KEY = import.meta.env.VITE_BHASHINI_INFERENCE_KEY || '';

const PIPELINE_CONFIG_ENDPOINT =
  'https://meity-auth.ulcacontrib.org/ulca/apis/v0/model/getModelsPipeline';
const INFERENCE_ENDPOINT =
  'https://dhruva-api.bhashini.gov.in/services/inference/pipeline';

/** In-memory cache: "taskType:srcLang:tgtLang" → serviceId string */
const serviceIdCache = new Map();

const isBhashiniConfigured = () =>
  Boolean(BHASHINI_USER_ID && BHASHINI_API_KEY && BHASHINI_INFERENCE_KEY);

// ─── Step 1: Fetch serviceId for a (taskType, srcLang, tgtLang) combination ─

async function fetchServiceId(taskType, sourceLanguage, targetLanguage = null) {
  const cacheKey = `${taskType}:${sourceLanguage}:${targetLanguage || 'none'}`;
  if (serviceIdCache.has(cacheKey)) return serviceIdCache.get(cacheKey);

  const pipelineTask = { taskType };
  if (sourceLanguage) {
    pipelineTask.config = {
      language: { sourceLanguage },
      ...(targetLanguage ? { language: { sourceLanguage, targetLanguage } } : {}),
    };
  }

  const body = {
    pipelineTasks: [pipelineTask],
    pipelineRequestConfig: { pipelineId: '64392f96daac500b55c543cd' },
  };

  const res = await fetch(PIPELINE_CONFIG_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      userID: BHASHINI_USER_ID,
      ulcaApiKey: BHASHINI_API_KEY,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) throw new Error(`Bhashini config fetch failed: ${res.status}`);
  const data = await res.json();

  // Navigate response structure to extract serviceId
  const serviceId =
    data?.pipelineResponseConfig?.[0]?.config?.[0]?.serviceId || null;

  if (serviceId) serviceIdCache.set(cacheKey, serviceId);
  return serviceId;
}

// ─── Step 2: Translate text (source → target language) ─────────────────────

const OFFLINE_GLOSSARY = {
  hi: [
    ['What are the mandatory disclosure requirements under the WIPO GRATK Treaty 2024 and US FDA DSHEA rules for export of Ashwagandha?', 'अश्वगंधा के निर्यात के लिए WIPO GRATK संधि 2024 और US FDA DSHEA नियमों के तहत अनिवार्य प्रकटीकरण आवश्यकताएं क्या हैं?'],
    ['What are the mandatory disclosure requirements', 'अनिवार्य प्रकटीकरण आवश्यकताएं क्या हैं'],
    ['In our university laboratory, we developed a synergistic formulation of Neem and Tulsi oil for wound healing. Is this patentable under Sec 3p & 3e?', 'हमारी विश्वविद्यालय प्रयोगशाला में, हमने घाव भरने के लिए नीम और तुलसी के तेल का एक सहक्रियात्मक फॉर्मूलेशन विकसित किया है। क्या यह धारा 3(p) और 3(e) के तहत पेटेंट योग्य है?'],
    ['In our university laboratory, we developed a topical formulation comprising Azadirachta indica (Neem oil 5% w/w) and Ocimum sanctum (Tulsi oil 3% w/w) in a virgin coconut oil base for enhanced accelerated wound healing and antimicrobial synergy. We want to file a patent application in India.', 'हमारी विश्वविद्यालय प्रयोगशाला में, हमने त्वरित घाव भरने और रोगाणुरोधी सहक्रियात्मकता के लिए वर्जिन नारियल तेल बेस में अज़ादिराच्टा इंडिका (नीम तेल 5% w/w) और ओसीमम सैंक्टम (तुलसी तेल 3% w/w) से युक्त एक सामयिक फॉर्मूलेशन विकसित किया है। हम भारत में एक पेटेंट आवेदन दायर करना चाहते हैं।'],
    ['In our university laboratory, we developed', 'हमारी विश्वविद्यालय प्रयोगशाला में, हमने विकसित किया'],
    ['In our university laboratory', 'हमारी विश्वविद्यालय प्रयोगशाला में'],
    ['In our university lab', 'हमारी विश्वविद्यालय प्रयोगशाला में'],
    ['International & Export Regime Advisory Dossier – Ashwagandha (Withania somnifera)', 'अंतर्राष्ट्रीय एवं निर्यात विनियामक परामर्श डोजियर – अश्वगंधा (विथानिया सोम्निफेरा)'],
    ['International & Export Regime Advisory Dossier', 'अंतर्राष्ट्रीय एवं निर्यात विनियामक परामर्श डोजियर'],
    ['Prepared by Ayur-IP (International & Export Regime)', 'आयुर्-आईपी द्वारा तैयार (अंतर्राष्ट्रीय एवं निर्यात विनियामक)'],
    ['Prepared by Ayur-IP', 'आयुर्-आईपी द्वारा तैयार'],
    ['Section 1 – Mandatory Source & Origin Disclosure (WIPO GRATK Treaty 2024 & PCT)', 'अनुभाग 1 – अनिवार्य स्रोत एवं मूल प्रकटीकरण (WIPO GRATK संधि 2024 और PCT)'],
    ['Section 1 – Mandatory Source & Origin Disclosure', 'अनुभाग 1 – अनिवार्य स्रोत एवं मूल प्रकटीकरण'],
    ['Section 1 - Mandatory Source & Origin Disclosure', 'अनुभाग 1 – अनिवार्य स्रोत एवं मूल प्रकटीकरण'],
    ['Section 2 – Cross-Border Access & Benefit-Sharing (Nagoya Protocol & Indian Section 39)', 'अनुभाग 2 – सीमा-पार पहुंच एवं लाभ-साझाकरण (नागोया प्रोटोकॉल और भारतीय धारा 39)'],
    ['Section 2 – Cross-Border Access & Benefit-Sharing', 'अनुभाग 2 – सीमा-पार पहुंच एवं लाभ-साझाकरण'],
    ['Section 3 – International Patent Prosecution Strategy (The 30-Month PCT Route)', 'अनुभाग 3 – अंतर्राष्ट्रीय पेटेंट अभियोजन रणनीति (30-माह का PCT मार्ग)'],
    ['Section 3 – International Patent Prosecution Strategy', 'अनुभाग 3 – अंतर्राष्ट्रीय पेटेंट अभियोजन रणनीति'],
    ['Mandatory Source & Origin Disclosure', 'अनिवार्य स्रोत एवं मूल प्रकटीकरण'],
    ['REQUIREMENT', 'आवश्यकता'],
    ['WHAT THE TREATY MANDATES', 'संधि के अनिवार्य नियम'],
    ['HOW IT APPLIES TO ASHWAGANDHA', 'अश्वगंधा पर यह कैसे लागू होता है'],
    ['REFERENCE', 'संदर्भ'],
    ['Article 3 – Country-of-Origin & TK Source Statement', 'अनुच्छेद 3 – मूल देश एवं पारंपरिक ज्ञान स्रोत विवरण'],
    ['Article 3 - Country-of-Origin & TK Source Statement', 'अनुच्छेद 3 – मूल देश एवं पारंपरिक ज्ञान स्रोत विवरण'],
    ['Country-of-Origin & TK Source Statement', 'मूल देश एवं पारंपरिक ज्ञान स्रोत विवरण'],
    ['Every international patent application (PCT, national filings) must contain a Standardised Disclosure Statement (SDS) that (i) identifies the Country of Origin (India) and (ii) cites the classical textual source(s) of the TK.', 'प्रत्येक अंतर्राष्ट्रीय पेटेंट आवेदन (PCT, राष्ट्रीय फाइलिंग) में एक मानकीकृत प्रकटीकरण विवरण (SDS) होना अनिवार्य है जो (i) मूल देश (भारत) की पहचान करता है और (ii) पारंपरिक ज्ञान के शास्त्रीय ग्रंथात्मक स्रोतों को उद्धृत करता है।'],
    ['In the PCT "International Phase" the applicant must insert: <br>"The invention relates to a botanical composition comprising Withania somnifera (Ashwagandha) root extract. The plant is indigenous to India and its therapeutic use is documented in the classical Ayurvedic texts', 'PCT "अंतर्राष्ट्रीय चरण" में आवेदक को यह विवरण शामिल करना अनिवार्य है: <br>"यह आविष्कार विथानिया सोम्निफेरा (अश्वगंधा) जड़ के अर्क से युक्त एक वानस्पतिक संरचना से संबंधित है। यह पौधा भारत का मूल निवासी है और इसके चिकित्सीय उपयोग का उल्लेख शास्त्रीय आयुर्वेदिक ग्रंथों'],
    ['The plant is indigenous to India and its therapeutic use is documented in the classical Ayurvedic texts', 'यह पौधा भारत का मूल निवासी है और इसके चिकित्सीय उपयोग का उल्लेख शास्त्रीय आयुर्वेदिक ग्रंथों में मिलता है'],
    ['Under Article 3 of the WIPO Treaty on Intellectual Property, Genetic Resources and Associated Traditional Knowledge (adopted May 24, 2024), when filing patent applications in foreign member states based on Indian botanicals, your research team is legally obligated to disclose:', 'बौद्धिक संपदा, आनुवंशिक संसाधनों और संबंधित पारंपरिक ज्ञान पर WIPO संधि (24 मई 2024 को स्वीकृत) के अनुच्छेद 3 के तहत, भारतीय जड़ी-बूटियों पर आधारित विदेशी सदस्य देशों में पेटेंट आवेदन दायर करते समय, आपकी शोध टीम कानूनी रूप से निम्नलिखित प्रकट करने के लिए बाध्य है:'],
    ['India as the Country of Origin of the botanical biological resources.', 'वानस्पतिक जैविक संसाधनों के मूल देश के रूप में भारत।'],
    ['The classical Ayurvedic treatises (*Charaka Samhita*, *Sushruta Samhita*) or the **Traditional Knowledge Digital Library (TKDL)** as the **Source of Associated Traditional Knowledge**.', 'संबंधित पारंपरिक ज्ञान के स्रोत के रूप में शास्त्रीय आयुर्वेदिक ग्रंथ (*चरक संहिता*, *सुश्रुत संहिता*) या **पारंपरिक ज्ञान डिजिटल लाइब्रेरी (TKDL)**।'],
    ['Under **Article 4**, this mandatory disclosure applies prospectively without retroactive invalidation of prior granted patents. Under **Article 7**, foreign patent offices cannot revoke a granted patent solely for post-grant disclosure errors unless intentional fraudulent misrepresentation is established.', '**अनुच्छेद 4** के तहत, यह अनिवार्य प्रकटीकरण पूर्व में दिए गए पेटेंटों को पूर्वव्यापी रूप से अमान्य किए बिना भविष्य में लागू होता है। **अनुच्छेद 7** के तहत, विदेशी पेटेंट कार्यालय केवल अनुदान के बाद की प्रकटीकरण त्रुटियों के लिए दिए गए पेटेंट को रद्द नहीं कर सकते हैं, जब तक कि जानबूझकर कपटपूर्ण गलत बयानी स्थापित न हो।'],
    ['Indian Patents Act Section 39 (Criminal Penalty Prerequisite):', 'भारतीय पेटेंट अधिनियम धारा 39 (आपराधिक दंड पूर्वशर्त):'],
    ['Nagoya Protocol (CBD) Compliance:', 'नागोया प्रोटोकॉल (CBD) अनुपालन:'],
    ['Filing Pathway:', 'फाइलिंग मार्ग:'],
    ['Overcoming Foreign Natural Product Exclusions:', 'विदेशी प्राकृतिक उत्पाद अपवर्जनों को पार करना:'],
    ['Cross-Border Access & Benefit-Sharing', 'सीमा-पार पहुंच एवं लाभ-साझाकरण'],
    ['International Patent Prosecution Strategy', 'अंतर्राष्ट्रीय पेटेंट अभियोजन रणनीति'],
    ['Prior Art Search & Anticipation Analysis', 'पूर्व कला खोज एवं पूर्वज्ञान विश्लेषण'],
    ['Section 3(p) Traditional Knowledge Exclusion', 'धारा 3(p) पारंपरिक ज्ञान अपवर्जन'],
    ['Section 3(e) Synergistic Efficacy & Non-Obviousness', 'धारा 3(e) सहक्रियात्मक प्रभावशीलता एवं गैर-स्पष्टता'],
    ['Section 3(e) Synergistic Efficacy', 'धारा 3(e) सहक्रियात्मक प्रभावशीलता'],
    ['Biological Diversity Act Compliance', 'जैव विविधता अधिनियम अनुपालन'],
    ['Conclusion & Statutory Recommendation', 'निष्कर्ष एवं विधिक अनुशंसा'],
    ['Legal Assessment:', 'विधिक मूल्यांकन:'],
    ['Prior Art Analysis', 'पूर्व कला विश्लेषण'],
    ['Novelty & Inventive Step', 'नवीनता एवं आविष्कारक कदम'],
    ['Traditional Knowledge Digital Library', 'पारंपरिक ज्ञान डिजिटल लाइब्रेरी'],
    ['National Biodiversity Authority', 'राष्ट्रीय जैव विविधता प्राधिकरण']
  ],
  ta: [
    ['What are the mandatory disclosure requirements under the WIPO GRATK Treaty 2024 and US FDA DSHEA rules for export of Ashwagandha?', 'அஸ்வகந்தா ஏற்றுமதிக்கான WIPO GRATK ஒப்பந்தம் 2024 மற்றும் US FDA DSHEA விதிகளின் கீழ் கட்டாய வெளிப்படுத்தல் தேவைகள் யாவை?'],
    ['In our university laboratory', 'எங்கள் பல்கலைக்கழக ஆய்வகத்தில்'],
    ['International & Export Regime Advisory Dossier', 'சர்வதேச மற்றும் ஏற்றுமதி ஒழுங்குமுறை ஆலோசனை ஆவணம்'],
    ['REQUIREMENT', 'தேவை'],
    ['WHAT THE TREATY MANDATES', 'ஒப்பந்தம் கட்டாயமாக்குவது'],
    ['HOW IT APPLIES TO ASHWAGANDHA', 'அஸ்வகந்தாவுக்கு இது எவ்வாறு பொருந்தும்'],
    ['REFERENCE', 'குறிப்பு'],
    ['Legal Assessment:', 'சட்ட மதிப்பீடு:']
  ],
  te: [
    ['What are the mandatory disclosure requirements under the WIPO GRATK Treaty 2024 and US FDA DSHEA rules for export of Ashwagandha?', 'అశ్వగంధ ఎగుమతి కోసం WIPO GRATK ఒప్పందం 2024 మరియు US FDA DSHEA నిబంధనల ప్రకారం తప్పనిసరి వెల్లడింపు అవసరాలు ఏమిటి?'],
    ['In our university laboratory', 'మా విశ్వవిద్యాలయ ప్రయోగశాలలో'],
    ['International & Export Regime Advisory Dossier', 'అంతర్జాతీయ మరియు ఎగుమతి నియంత్రణ సలహా డోసియర్'],
    ['REQUIREMENT', 'అవసరం'],
    ['WHAT THE TREATY MANDATES', 'ఒప్పందం ఆదేశించినవి'],
    ['HOW IT APPLIES TO ASHWAGANDHA', 'అశ్వగంధకు ఇది ఎలా వర్తిస్తుంది'],
    ['REFERENCE', 'సూచన'],
    ['Legal Assessment:', 'చట్టపరమైన మూల్యాంకనం:']
  ],
  bn: [
    ['What are the mandatory disclosure requirements under the WIPO GRATK Treaty 2024 and US FDA DSHEA rules for export of Ashwagandha?', 'অশ্বগন্ধা রপ্তানির জন্য WIPO GRATK চুক্তি ২০২৪ এবং US FDA DSHEA বিধিমালার আওতায় বাধ্যতামূলক প্রকাশের প্রয়োজনীয়তা কী?'],
    ['In our university laboratory', 'আমাদের বিশ্ববিদ্যালয় গবেষণাগারে'],
    ['International & Export Regime Advisory Dossier', 'আন্তর্জাতিক এবং রপ্তানি নিয়ন্ত্রণ সংক্রান্ত পরামর্শ ডসিয়ার'],
    ['REQUIREMENT', 'প্রয়োজনীয়তা'],
    ['WHAT THE TREATY MANDATES', 'চুক্তির বাধ্যবাধকতা'],
    ['HOW IT APPLIES TO ASHWAGANDHA', 'অশ্বগন্ধায় এটি কীভাবে প্রযোজ্য'],
    ['REFERENCE', 'রেফারেন্স'],
    ['Legal Assessment:', 'আইনি মূল্যায়ন:']
  ],
  mr: [
    ['What are the mandatory disclosure requirements under the WIPO GRATK Treaty 2024 and US FDA DSHEA rules for export of Ashwagandha?', 'अश्वगंधाच्या निर्यातीसाठी WIPO GRATK करार २०२४ आणि US FDA DSHEA नियमांनुसार अनिवार्य प्रकटीकरण आवश्यकता काय आहेत?'],
    ['In our university laboratory', 'आमच्या विद्यापीठ प्रयोगशाळेत'],
    ['International & Export Regime Advisory Dossier', 'आंतरराष्ट्रीय आणि निर्यात नियामक सल्लागार डॉसियर'],
    ['REQUIREMENT', 'आवश्यकता'],
    ['WHAT THE TREATY MANDATES', 'कराराचे अनिवार्य नियम'],
    ['HOW IT APPLIES TO ASHWAGANDHA', 'अश्वगंधाला हे कसे लागू होते'],
    ['REFERENCE', 'संदर्भ'],
    ['Legal Assessment:', 'कायदेशीर मूल्यांकन:']
  ],
  gu: [
    ['What are the mandatory disclosure requirements under the WIPO GRATK Treaty 2024 and US FDA DSHEA rules for export of Ashwagandha?', 'અશ્વગંધાની નિકાસ માટે WIPO GRATK સંધિ ૨૦૨૪ અને US FDA DSHEA નિયમો હેઠળ ફરજિયાત જાહેરાત જરૂરિયાતો શું છે?'],
    ['In our university laboratory', 'અમારી યુનિવર્સિટી પ્રયોગશાળામાં'],
    ['International & Export Regime Advisory Dossier', 'આંતરરાષ્ટ્રીય અને નિકાસ નિયમનકારી સલાહકાર ડોઝિયર'],
    ['REQUIREMENT', 'જરૂરિયાત'],
    ['WHAT THE TREATY MANDATES', 'સંધિના નિયમો'],
    ['HOW IT APPLIES TO ASHWAGANDHA', 'અશ્વગંધા પર આ કેવી રીતે લાગુ પડે છે'],
    ['REFERENCE', 'સંદર્ભ'],
    ['Legal Assessment:', 'કાનૂની મૂલ્યાંકન:']
  ],
  kn: [
    ['What are the mandatory disclosure requirements under the WIPO GRATK Treaty 2024 and US FDA DSHEA rules for export of Ashwagandha?', 'ಅಶ್ವಗಂಧ ರಫ್ತಿಗೆ WIPO GRATK ಒಪ್ಪಂದ 2024 ಮತ್ತು US FDA DSHEA ನಿಯಮಗಳ ಅಡಿಯಲ್ಲಿ ಕಡ್ಡಾಯ ಪ್ರಕಟಣೆ ಅವಶ್ಯಕತೆಗಳು ಯಾವುವು?'],
    ['In our university laboratory', 'ನಮ್ಮ ವಿಶ್ವವಿದ್ಯಾಲಯದ ಪ್ರಯೋಗಾಲಯದಲ್ಲಿ'],
    ['International & Export Regime Advisory Dossier', 'ಅಂತರರಾಷ್ಟ್ರೀಯ ಮತ್ತು ರಫ್ತು ನಿಯಂತ್ರಕ ಸಲಹಾ ಡೋಸಿಯರ್'],
    ['REQUIREMENT', 'ಅವಶ್ಯಕತೆ'],
    ['WHAT THE TREATY MANDATES', 'ಒಪ್ಪಂದದ ನಿಯಮಗಳು'],
    ['REFERENCE', 'ಉಲ್ಲೇಖ'],
    ['Legal Assessment:', 'ಕಾನೂನು ಮೌಲ್ಯಮಾಪನ:']
  ],
  ml: [
    ['What are the mandatory disclosure requirements under the WIPO GRATK Treaty 2024 and US FDA DSHEA rules for export of Ashwagandha?', 'അശ്വഗന്ധ കയറ്റുമതിക്കായി WIPO GRATK ഉടമ്പടി 2024, US FDA DSHEA ചട്ടങ്ങൾ എന്നിവ പ്രകാരമുള്ള നിർബന്ധിത വെളിപ്പെടുത്തൽ ആവശ്യകതകൾ എന്തൊക്കെയാണ്?'],
    ['In our university laboratory', 'ഞങ്ങളുടെ സർവകലാശാലാ ലബോറട്ടറിയിൽ'],
    ['International & Export Regime Advisory Dossier', 'അന്താരാഷ്ട്ര, കയറ്റുമതി റെഗുലേറ്ററി ഉപദേശക ഡോസിയർ'],
    ['REQUIREMENT', 'ആവശ്യകത'],
    ['WHAT THE TREATY MANDATES', 'ഉടമ്പടി നിഷ്കർഷിക്കുന്നത്'],
    ['REFERENCE', 'റഫറൻസ്'],
    ['Legal Assessment:', 'നിയമപരമായ വിലയിരുത്തൽ:']
  ]
};

export function applyOfflineGlossary(text, targetLang) {
  if (!text || targetLang === 'en') return text;
  const glossary = OFFLINE_GLOSSARY[targetLang];
  if (!glossary) return text;

  let translated = text;
  for (const [enTerm, targetTerm] of glossary) {
    translated = translated.split(enTerm).join(targetTerm);
  }
  return translated;
}

/**
 * Translates text from one language to another via Bhashini.
 * @param {string} text - Text to translate
 * @param {string} fromLang - Source language ISO code (e.g. 'hi')
 * @param {string} toLang   - Target language ISO code (e.g. 'en')
 * @returns {Promise<string>} - Translated text, or original on error/fallback
 */
export async function translateText(text, fromLang, toLang) {
  if (!text?.trim()) return text;
  if (fromLang === toLang) return text;
  if (!isBhashiniConfigured()) {
    return applyOfflineGlossary(text, toLang);
  }

  try {
    const serviceId = await fetchServiceId('translation', fromLang, toLang);
    if (!serviceId) {
      console.warn(`[Bhashini] No serviceId found for ${fromLang}→${toLang}`);
      return text;
    }

    const body = {
      pipelineTasks: [
        {
          taskType: 'translation',
          config: {
            language: { sourceLanguage: fromLang, targetLanguage: toLang },
            serviceId,
          },
        },
      ],
      inputData: {
        input: [{ source: text }],
      },
    };

    const res = await fetch(INFERENCE_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: BHASHINI_INFERENCE_KEY,
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      console.warn(`[Bhashini] Translation API error: ${res.status}`);
      return text;
    }

    const data = await res.json();
    const translated =
      data?.pipelineResponse?.[0]?.output?.[0]?.target || null;

    return translated || text;
  } catch (err) {
    console.error('[Bhashini] Translation error:', err);
    return text; // safe fallback — return original
  }
}

// ─── Step 3: Text-to-Speech (TTS) ──────────────────────────────────────────

/**
 * Synthesizes speech for the given text in the target language.
 * Returns an HTMLAudioElement ready to .play(), or null on failure.
 * @param {string} text - Text to synthesize
 * @param {string} language - Target language code (e.g. 'hi')
 * @returns {Promise<HTMLAudioElement|null>}
 */
export async function synthesizeSpeech(text, language) {
  if (!text?.trim() || !isBhashiniConfigured()) return null;

  try {
    const serviceId = await fetchServiceId('tts', language);
    if (!serviceId) return null;

    const body = {
      pipelineTasks: [
        {
          taskType: 'tts',
          config: {
            language: { sourceLanguage: language },
            serviceId,
            gender: 'female',
          },
        },
      ],
      inputData: {
        input: [{ source: text }],
      },
    };

    const res = await fetch(INFERENCE_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: BHASHINI_INFERENCE_KEY,
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) return null;

    const data = await res.json();
    const audioBase64 =
      data?.pipelineResponse?.[0]?.audio?.[0]?.audioContent || null;

    if (!audioBase64) return null;

    // Convert base64 audio to a playable HTMLAudioElement
    const audioBlob = base64ToBlob(audioBase64, 'audio/wav');
    const audioUrl  = URL.createObjectURL(audioBlob);
    return new Audio(audioUrl);
  } catch (err) {
    console.error('[Bhashini] TTS error:', err);
    return null;
  }
}

// ─── Step 4: ASR — Audio Blob → Text (Bhashini, Phase 2) ───────────────────

/**
 * Converts a recorded audio Blob to text via Bhashini ASR.
 * @param {Blob} audioBlob - PCM/WAV audio blob
 * @param {string} language - Language code for recognition (e.g. 'hi')
 * @returns {Promise<string>} - Recognized text or empty string
 */
export async function recognizeSpeechBhashini(audioBlob, language) {
  if (!audioBlob || !isBhashiniConfigured()) return '';

  try {
    const serviceId = await fetchServiceId('asr', language);
    if (!serviceId) return '';

    // Convert blob to base64
    const base64Audio = await blobToBase64(audioBlob);

    const body = {
      pipelineTasks: [
        {
          taskType: 'asr',
          config: {
            language: { sourceLanguage: language },
            serviceId,
            audioFormat: 'wav',
            samplingRate: 16000,
          },
        },
      ],
      inputData: {
        audio: [{ audioContent: base64Audio }],
      },
    };

    const res = await fetch(INFERENCE_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: BHASHINI_INFERENCE_KEY,
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) return '';

    const data = await res.json();
    return data?.pipelineResponse?.[0]?.output?.[0]?.source || '';
  } catch (err) {
    console.error('[Bhashini] ASR error:', err);
    return '';
  }
}

// ─── Utility Helpers ────────────────────────────────────────────────────────

function base64ToBlob(base64, mimeType) {
  const byteChars = atob(base64);
  const bytes = new Uint8Array(byteChars.length);
  for (let i = 0; i < byteChars.length; i++) {
    bytes[i] = byteChars.charCodeAt(i);
  }
  return new Blob([bytes], { type: mimeType });
}

function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result?.split(',')[1] || '';
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

export const bhashiniConfigured = isBhashiniConfigured;
