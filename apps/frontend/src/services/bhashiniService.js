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
    // Session titles & questions
    ['Evaluate a patent application for a nanoformulation of Ashwagandha and Brahmi for Alzheimer\'s disease targeting BBB crossing', 'अश्वगंधा और ब्राह्मी के नैनोफॉर्मूलेशन के लिए अल्जाइमर रोग में BBB क्रॉसिंग हेतु पेटेंट आवेदन का मूल्यांकन'],
    ['Evaluate a patent application for a nanoformulation of', 'के नैनो-फॉर्मूलेशन के पेटेंट आवेदन का मूल्यांकन:'],
    ['Evaluate a patent application for a topical formulation comprising', 'युक्त टॉपिकल फॉर्मूलेशन के पेटेंट आवेदन का मूल्यांकन:'],
    ['Evaluate a patent application for', 'के लिए पेटेंट आवेदन का मूल्यांकन:'],
    ['Evaluate a patent application', 'पेटेंट आवेदन का मूल्यांकन'],
    ['Evaluation of patentability', 'पेटेंट योग्यता का मूल्यांकन'],
    ['Prior art analysis of', 'का पूर्व कला विश्लेषण'],
    ['Prior art search for', 'के लिए पूर्व कला खोज'],
    ['Patentability assessment of', 'का पेटेंट योग्यता मूल्यांकन'],
    ['Is Neem & Tulsi combination patentable under Sec 3p & 3e?', 'क्या धारा 3(p) और 3(e) के तहत नीम और तुलसी का संयोजन पेटेंट योग्य है?'],
    ['Is Neem & Tulsi combination patentable', 'क्या नीम और तुलसी संयोजन पेटेंट योग्य है'],
    ['Is Neem and Tulsi combination patentable', 'क्या नीम और तुलसी संयोजन पेटेंट योग्य है'],
    ['What are the mandatory disclosure requirements under the WIPO GRATK Treaty 2024 and US FDA DSHEA rules for export of Ashwagandha?', 'अश्वगंधा के निर्यात के लिए WIPO GRATK संधि 2024 और US FDA DSHEA नियमों के तहत अनिवार्य प्रकटीकरण आवश्यकताएं क्या हैं?'],
    ['What are the mandatory disclosure requirements under the WIPO GRATK Treaty 2024', 'WIPO GRATK संधि 2024 के तहत अनिवार्य प्रकटीकरण आवश्यकताएं'],
    ['What are the mandatory disclosure requirements', 'अनिवार्य प्रकटीकरण आवश्यकताएं क्या हैं'],
    ['In our university laboratory, we developed a synergistic formulation of Neem and Tulsi oil for wound healing. Is this patentable under Sec 3p & 3e?', 'हमारी विश्वविद्यालय प्रयोगशाला में, हमने घाव भरने के लिए नीम और तुलसी के तेल का एक सहक्रियात्मक फॉर्मूलेशन विकसित किया है। क्या यह धारा 3(p) और 3(e) के तहत पेटेंट योग्य है?'],
    ['In our university laboratory, we developed a topical formulation comprising Azadirachta indica (Neem oil 5% w/w) and Ocimum sanctum (Tulsi oil 3% w/w) in a virgin coconut oil base for enhanced accelerated wound healing and antimicrobial synergy. We want to file a patent application in India.', 'हमारी विश्वविद्यालय प्रयोगशाला में, हमने त्वरित घाव भरने और रोगाणुरोधी सहक्रियात्मकता के लिए वर्जिन नारियल तेल बेस में अज़ादिराच्टा इंडिका (नीम तेल 5% w/w) और ओसीमम सैंक्टम (तुलसी तेल 3% w/w) से युक्त एक सामयिक फॉर्मूलेशन विकसित किया है। हम भारत में एक पेटेंट आवेदन दायर करना चाहते हैं।'],
    ['In our university laboratory, we developed', 'हमारी विश्वविद्यालय प्रयोगशाला में, हमने विकसित किया'],
    ['In our university laboratory', 'हमारी विश्वविद्यालय प्रयोगशाला में'],
    ['In our university lab', 'हमारी विश्वविद्यालय प्रयोगशाला में'],

    // Table Headers, Rows, Verdicts & Actions
    ['| ASPECT | VERDICT | ACTION |', '| पहलू | निर्णय | कार्रवाई |'],
    ['ASPECT', 'पहलू'],
    ['VERDICT', 'निर्णय'],
    ['ACTION', 'कार्रवाई'],
    ['Novelty', 'नवीनता'],
    ['Inventive Step', 'आविष्कारक कदम'],
    ['Sec. 3(e) Synergy', 'धारा 3(e) सहक्रिया'],
    ['Sec. 3(d) Efficacy', 'धारा 3(d) प्रभावकारिता'],
    ['Sec. 3(p) Exclusion', 'धारा 3(p) अपवर्जन'],
    ['NBA Compliance', 'NBA अनुपालन'],
    ['Risk of Revocation', 'निरस्तीकरण का जोखिम'],
    ['Met (nano-carrier, co-encapsulation, PEGylation)', 'संतुष्ट (नैनो-वाहक, सह-समावेशन, PEGylation)'],
    ['Met (non-obvious synergistic BBB-targeted delivery)', 'संतुष्ट (गैर-स्पष्ट सहक्रियात्मक BBB-लक्षित वितरण)'],
    ['Met (experimental proof required)', 'संतुष्ट (प्रायोगिक प्रमाण आवश्यक)'],
    ['Met (demonstrated enhanced brain levels & plaque reduction)', 'संतुष्ट (मस्तिष्क में वृद्धि एवं पट्टिका में कमी प्रदर्शित)'],
    ['Overcome by claim limitation & technical effect', 'दावे की सीमा और तकनीकी प्रभाव द्वारा समाधान'],
    ['Pending – obtain PIC & BSA before filing', 'लंबित – फाइलिंग से पहले PIC और BSA प्राप्त करें'],
    ['Pending - obtain PIC & BSA before filing', 'लंबित – फाइलिंग से पहले PIC और BSA प्राप्त करें'],
    ['Low if data robust and NBA filings complete', 'कम जोखिम (यदि डेटा मजबूत है और NBA फाइलिंग पूर्ण है)'],
    ['Draft claims focusing on these features.', 'इन विशेषताओं पर ध्यान केंद्रित करते हुए दावे तैयार करें।'],
    ['Include comparative data in the specification.', 'विनिर्देश में तुलनात्मक डेटा शामिल करें।'],
    ['Attach full in-vitro/in-vivo data as part of the specification.', 'विनिर्देश के हिस्से के रूप में पूरा इन-विट्रो/इन-विवो डेटा संलग्न करें।'],
    ['Provide quantitative results.', 'मात्रात्मक परिणाम प्रदान करें।'],
    ['Ensure claim language does not merely recite the herbs.', 'सुनिश्चित करें कि दावे की भाषा केवल जड़ी-बूटियों का उल्लेख न करे।'],
    ['Initiate PIC application immediately; negotiate BSA.', 'तुरंत PIC आवेदन शुरू करें; BSA पर बातचीत करें।'],
    ['Monitor for any post-grant opposition citing TK.', 'पारंपरिक ज्ञान (TK) का हवाला देते हुए अनुदान के बाद के विरोध पर नजर रखें।'],

    // Overall Recommendations & Summaries
    ['Overall Recommendation: Proceed with filing provided that (i) the specification contains full comparative experimental data demonstrating unexpected synergy and enhanced BBB delivery, (ii) claims are narrowly drafted to the nanotechnological features, and (iii) NBA approvals (PIC & BSA) are secured before the filing date. This strategy aligns with the precedents in Shaafi Naturcure (Doc 1) and Avesthagen (Doc 2) and mitigates the pitfalls that led to refusals in those cases.', 'समग्र अनुशंसा: फाइलिंग के साथ आगे बढ़ें बशर्ते कि (i) विनिर्देश में अप्रत्याशित सहक्रिया और उन्नत BBB वितरण प्रदर्शित करने वाला पूर्ण तुलनात्मक प्रायोगिक डेटा हो, (ii) दावों को नैनो-प्रौद्योगिकी विशेषताओं तक संकीर्ण रूप से तैयार किया गया हो, और (iii) फाइलिंग तिथि से पहले NBA स्वीकृतियां (PIC और BSA) सुरक्षित कर ली गई हों। यह रणनीति शाफ़ी नेचरक्योर (दस्तावेज़ 1) और अवेस्थाजेन (दस्तावेज़ 2) के उदाहरणों के अनुरूप है और उन गलतियों को कम करती है जिनके कारण उन मामलों में अस्वीकृति हुई थी।'],
    ['Overall Recommendation:', 'समग्र अनुशंसा:'],
    ['Proceed with filing provided that', 'फाइलिंग के साथ आगे बढ़ें बशर्ते कि'],
    ['Proceed with filing', 'फाइलिंग के साथ आगे बढ़ें'],

    // Dossiers, Sections & Legal Regimes
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
    ['Section 4 – Overcoming Foreign Natural Product Exclusions', 'अनुभाग 4 – विदेशी प्राकृतिक उत्पाद अपवर्जनों का समाधान'],
    ['Section 5 – Classical Ayurvedic Prior Art Grounding', 'अनुभाग 5 – शास्त्रीय आयुर्वेदिक पूर्व कला आधार'],
    ['Mandatory Source & Origin Disclosure', 'अनिवार्य स्रोत एवं मूल प्रकटीकरण'],
    ['REQUIREMENT', 'आवश्यकता'],
    ['WHAT THE TREATY MANDATES', 'संधि के अनिवार्य नियम'],
    ['HOW IT APPLIES TO ASHWAGANDHA', 'अश्वगंधा पर यह कैसे लागू होता है'],
    ['REFERENCE', 'संदर्भ'],
    ['Article 3 – Country-of-Origin & TK Source Statement', 'अनुच्छेद 3 – मूल देश एवं पारंपरिक ज्ञान स्रोत विवरण'],
    ['Article 3 - Country-of-Origin & TK Source Statement', 'अनुच्छेद 3 – मूल देश एवं पारंपरिक ज्ञान स्रोत विवरण'],
    ['Country-of-Origin & TK Source Statement', 'मूल देश एवं पारंपरिक ज्ञान स्रोत विवरण'],
    ['Every international patent application (PCT, national filings) must contain a Standardised Disclosure Statement (SDS) that (i) identifies the Country of Origin (India) and (ii) cites the classical textual source(s) of the TK.', 'प्रत्येक अंतर्राष्ट्रीय पेटेंट आवेदन (PCT, राष्ट्रीय फाइलिंग) में एक मानकीकृत प्रकटीकरण विवरण (SDS) होना अनिवार्य है जो (i) मूल देश (भारत) की पहचान करता है और (ii) पारंपरिक ज्ञान के शास्त्रीय ग्रंथात्मक स्रोतों को उद्धृत करता है।'],
    ['The plant is indigenous to India and its therapeutic use is documented in the classical Ayurvedic texts', 'यह पौधा भारत का मूल निवासी है और इसके चिकित्सीय उपयोग का उल्लेख शास्त्रीय आयुर्वेदिक ग्रंथों में मिलता है'],
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
    ['National Biodiversity Authority', 'राष्ट्रीय जैव विविधता प्राधिकरण'],
  ],
  ta: [
    ['Evaluate a patent application for a nanoformulation of Ashwagandha and Brahmi for Alzheimer\'s disease targeting BBB crossing', 'அல்சைமர் நோய்க்கான அஸ்வகந்தா மற்றும் பிராமி நானோ உருவாக்கத்தின் காப்புரிமை விண்ணப்ப மதிப்பீடு'],
    ['Evaluate a patent application for a nanoformulation of', 'நானோ-உருவாக்கத்திற்கான காப்புரிமை விண்ணப்ப மதிப்பீடு:'],
    ['Evaluate a patent application for', 'காப்புரிமை விண்ணப்ப மதிப்பீடு:'],
    ['Evaluate a patent application', 'காப்புரிமை விண்ணப்ப மதிப்பீடு'],
    ['Evaluation of patentability', 'காப்புரிமை தகுதி மதிப்பீடு'],
    ['Prior art analysis of', 'முந்தைய கலை பகுப்பாய்வு:'],
    ['Prior art search for', 'முந்தைய கலை தேடல்:'],
    ['Is Neem & Tulsi combination patentable', 'வேம்பு மற்றும் துளசி சேர்க்கை காப்புரிமை பெற முடியுமா'],
    ['Is Neem and Tulsi combination patentable', 'வேம்பு மற்றும் துளசி சேர்க்கை காப்புரிமை பெற முடியுமா'],
    ['What are the mandatory disclosure requirements under the WIPO GRATK Treaty 2024 and US FDA DSHEA rules for export of Ashwagandha?', 'அஸ்வகந்தா ஏற்றுமதிக்கான WIPO GRATK ஒப்பந்தம் 2024 மற்றும் US FDA DSHEA விதிகளின் கீழ் கட்டாய வெளிப்படுத்தல் தேவைகள் யாவை?'],
    ['In our university laboratory, we developed a synergistic formulation of Neem and Tulsi oil for wound healing. Is this patentable under Sec 3p & 3e?', 'எங்கள் பல்கலைக்கழக ஆய்வகத்தில், காயங்களை குணப்படுத்த வேம்பு மற்றும் துளசி எண்ணெயின் ஒருங்கிணைந்த உருவாக்கத்தை உருவாக்கினோம். இது பிரிவு 3p & 3e கீழ் காப்புரிமை பெற முடியுமா?'],
    ['In our university laboratory, we developed', 'எங்கள் பல்கலைக்கழக ஆய்வகத்தில் உருவாக்கினோம்'],
    ['In our university laboratory', 'எங்கள் பல்கலைக்கழக ஆய்வகத்தில்'],
    ['| ASPECT | VERDICT | ACTION |', '| அம்சம் | தீர்ப்பு | செயல் |'],
    ['ASPECT', 'அம்சம்'],
    ['VERDICT', 'தீர்ப்பு'],
    ['ACTION', 'செயல்'],
    ['Novelty', 'புதுமை'],
    ['Inventive Step', 'கண்டுபிடிப்பு படிநிலை'],
    ['Sec. 3(e) Synergy', 'பிரிவு 3(e) ஒருங்கிணைப்பு'],
    ['Sec. 3(d) Efficacy', 'பிரிவு 3(d) செயல்திறன்'],
    ['Sec. 3(p) Exclusion', 'பிரிவு 3(p) விலக்கு'],
    ['NBA Compliance', 'NBA இணக்கம்'],
    ['Risk of Revocation', 'ரத்து செய்யும் ஆபத்து'],
    ['Met (nano-carrier, co-encapsulation, PEGylation)', 'பூர்த்தியானது (நானோ-கேரியர், PEGylation)'],
    ['Met (non-obvious synergistic BBB-targeted delivery)', 'பூர்த்தியானது (BBB-இலக்கு ஒருங்கிணைந்த விநியோகம்)'],
    ['Met (experimental proof required)', 'பூர்த்தியானது (பரிசோதனை சான்று தேவை)'],
    ['Overcome by claim limitation & technical effect', 'கோரிக்கை வரம்பு மற்றும் தொழில்நுட்ப விளைவு மூலம் தீர்க்கப்பட்டது'],
    ['Pending – obtain PIC & BSA before filing', 'நிலுவையில் உள்ளது – தாக்கல் செய்வதற்கு முன் PIC & BSA பெறவும்'],
    ['Overall Recommendation:', 'ஒட்டுமொத்த பரிந்துரை:'],
    ['Proceed with filing', 'விண்ணப்பத் தாக்கலுடன் தொடரவும்'],
    ['International & Export Regime Advisory Dossier', 'சர்வதேச மற்றும் ஏற்றுமதி ஒழுங்குமுறை ஆலோசனை ஆவணம்'],
    ['REQUIREMENT', 'தேவை'],
    ['WHAT THE TREATY MANDATES', 'ஒப்பந்தம் கட்டாயமாக்குவது'],
    ['HOW IT APPLIES TO ASHWAGANDHA', 'அஸ்வகந்தாவுக்கு இது எவ்வாறு பொருந்தும்'],
    ['REFERENCE', 'குறிப்பு'],
    ['Legal Assessment:', 'சட்ட மதிப்பீடு:'],
  ],
  te: [
    ['Evaluate a patent application for a nanoformulation of Ashwagandha and Brahmi for Alzheimer\'s disease targeting BBB crossing', 'అల్జీమర్స్ వ్యాధి కోసం అశ్వగంధ మరియు బ్రాహ్మీ నానోఫార్ములేషన్ పేటెంట్ దరఖాస్తు మూల్యాంకనం'],
    ['Evaluate a patent application for a nanoformulation of', 'నానో-ఫార్ములేషన్ కోసం పేటెంట్ దరఖాస్తు మూల్యాంకనం:'],
    ['Evaluate a patent application for', 'పేటెంట్ దరఖాస్తు మూల్యాంకనం:'],
    ['Evaluate a patent application', 'పేటెంట్ దరఖాస్తు మూల్యాంకనం'],
    ['Evaluation of patentability', 'పేటెంట్ అర్హత మూల్యాంకనం'],
    ['Prior art analysis of', 'పూర్వ కళా విశ్లేషణ:'],
    ['Prior art search for', 'పూర్వ కళా శోధన:'],
    ['Is Neem & Tulsi combination patentable', 'వేప మరియు తులసి కలయిక పేటెంట్ చేయవచ్చా'],
    ['Is Neem and Tulsi combination patentable', 'వేప మరియు తులసి కలయిక పేటెంట్ చేయవచ్చా'],
    ['What are the mandatory disclosure requirements under the WIPO GRATK Treaty 2024 and US FDA DSHEA rules for export of Ashwagandha?', 'అశ్వగంధ ఎగుమతి కోసం WIPO GRATK ఒప్పందం 2024 మరియు US FDA DSHEA నిబంధనల ప్రకారం తప్పనిసరి వెల్లడింపు అవసరాలు ఏమిటి?'],
    ['In our university laboratory, we developed a synergistic formulation of Neem and Tulsi oil for wound healing. Is this patentable under Sec 3p & 3e?', 'మా విశ్వవిద్యాలయ ప్రయోగశాలలో, గాయాలు నయం చేయడానికి వేప మరియు తులసి నూనె కలయికను అభివృద్ధి చేశాము. ఇది సెక్షన్ 3(p) & 3(e) కింద పేటెంట్ చేయవచ్చా?'],
    ['In our university laboratory, we developed', 'మా విశ్వవిద్యాలయ ప్రయోగశాలలో మేము అభివృద్ధి చేసాము'],
    ['In our university laboratory', 'మా విశ్వవిద్యాలయ ప్రయోగశాలలో'],
    ['| ASPECT | VERDICT | ACTION |', '| అంశం | తీర్పు | చర్య |'],
    ['ASPECT', 'అంశం'],
    ['VERDICT', 'తీర్పు'],
    ['ACTION', 'చర్య'],
    ['Novelty', 'నూతనత్వం'],
    ['Inventive Step', 'ఆవిష్కరణ దశ'],
    ['Sec. 3(e) Synergy', 'సెక్షన్ 3(e) సినర్జీ'],
    ['Sec. 3(d) Efficacy', 'సెక్షన్ 3(d) సామర్థ్యం'],
    ['Sec. 3(p) Exclusion', 'సెక్షన్ 3(p) మినహాయింపు'],
    ['NBA Compliance', 'NBA వర్తింపు'],
    ['Risk of Revocation', 'రద్దు ప్రమాదం'],
    ['Met (nano-carrier, co-encapsulation, PEGylation)', 'పూర్తయింది (నానో-క్యారియర్, PEGylation)'],
    ['Met (experimental proof required)', 'పూర్తయింది (ప్రయోగాత్మక సాక్ష్యం అవసరం)'],
    ['Overcome by claim limitation & technical effect', 'క్లెయిమ్ పరిమితి మరియు సాంకేతిక ప్రభావం ద్వారా అధిగమించబడింది'],
    ['Pending – obtain PIC & BSA before filing', 'పెండింగ్‌లో ఉంది – దాఖలు చేయడానికి ముందు PIC & BSA పొందండి'],
    ['Overall Recommendation:', 'మొత్తం సిఫార్సు:'],
    ['Proceed with filing', 'దాఖలుతో ముందుకు సాగండి'],
    ['International & Export Regime Advisory Dossier', 'అంతర్జాతీయ మరియు ఎగుమతి నియంత్రణ సలహా డోసియర్'],
    ['REQUIREMENT', 'అవసరం'],
    ['WHAT THE TREATY MANDATES', 'ఒప్పందం ఆదేశించినవి'],
    ['HOW IT APPLIES TO ASHWAGANDHA', 'అశ్వగంధకు ఇది ఎలా వర్తిస్తుంది'],
    ['REFERENCE', 'సూచన'],
    ['Legal Assessment:', 'చట్టపరమైన మూల్యాంకనం:'],
  ],
  bn: [
    ['Evaluate a patent application for a nanoformulation of Ashwagandha and Brahmi for Alzheimer\'s disease targeting BBB crossing', 'আলঝাইমার রোগের জন্য অশ্বগন্ধা ও ব্রাহ্মীর ন্যানোফর্মুলেশন পেটেন্ট আবেদন মূল্যায়ন'],
    ['Evaluate a patent application for a nanoformulation of', 'ন্যানো-ফর্মুলেশনের পেটেন্ট আবেদন মূল্যায়ন:'],
    ['Evaluate a patent application for', 'পেটেন্ট আবেদন মূল্যায়ন:'],
    ['Evaluate a patent application', 'পেটেন্ট আবেদন মূল্যায়ন'],
    ['Evaluation of patentability', 'পেটেন্টযোগ্যতা মূল্যায়ন'],
    ['Prior art analysis of', 'পূর্ববর্তী শিল্প বিশ্লেষণ:'],
    ['Prior art search for', 'পূর্ববর্তী শিল্প অনুসন্ধান:'],
    ['Is Neem & Tulsi combination patentable', 'নিম ও তুলসীর সংমিশ্রণ কি পেটেন্টযোগ্য'],
    ['Is Neem and Tulsi combination patentable', 'নিম ও তুলসীর সংমিশ্রণ কি পেটেন্টযোগ্য'],
    ['What are the mandatory disclosure requirements under the WIPO GRATK Treaty 2024 and US FDA DSHEA rules for export of Ashwagandha?', 'অশ্বগন্ধা রপ্তানির জন্য WIPO GRATK চুক্তি ২০২৪ এবং US FDA DSHEA বিধিমালার আওতায় বাধ্যতামূলক প্রকাশের প্রয়োজনীয়তা কী?'],
    ['In our university laboratory, we developed a synergistic formulation of Neem and Tulsi oil for wound healing. Is this patentable under Sec 3p & 3e?', 'আমাদের বিশ্ববিদ্যালয় গবেষণাগারে, আমরা ক্ষত নিরাময়ের জন্য নিম এবং তুলসী তেলের একটি সমন্বিত ফর্মুলেশন তৈরি করেছি। এটি কি ধারা ৩(p) এবং ৩(e) এর অধীনে পেটেন্টযোগ্য?'],
    ['In our university laboratory, we developed', 'আমাদের বিশ্ববিদ্যালয় গবেষণাগারে আমরা তৈরি করেছি'],
    ['In our university laboratory', 'আমাদের বিশ্ববিদ্যালয় গবেষণাগারে'],
    ['| ASPECT | VERDICT | ACTION |', '| দিক | রায় | পদক্ষেপ |'],
    ['ASPECT', 'দিক'],
    ['VERDICT', 'রায়'],
    ['ACTION', 'পদক্ষেপ'],
    ['Novelty', 'নতুনত্ব'],
    ['Inventive Step', 'উদ্ভাবনী ধাপ'],
    ['Sec. 3(e) Synergy', 'ধারা ৩(e) সমন্বয়'],
    ['Sec. 3(d) Efficacy', 'ধারা ৩(d) কার্যকারিতা'],
    ['Sec. 3(p) Exclusion', 'ধারা ৩(p) বর্জন'],
    ['NBA Compliance', 'NBA সম্মতি'],
    ['Risk of Revocation', 'বাতিলের ঝুঁকি'],
    ['Met (nano-carrier, co-encapsulation, PEGylation)', 'সন্তুষ্ট (ন্যানো-ক্যারিয়ার, PEGylation)'],
    ['Met (experimental proof required)', 'সন্তুষ্ট (পরীক্ষামূলক প্রমাণ প্রয়োজন)'],
    ['Overcome by claim limitation & technical effect', 'দাবির সীমাবদ্ধতা এবং প্রযুক্তিগত প্রভাব দ্বারা কাটিয়ে উঠেছে'],
    ['Pending – obtain PIC & BSA before filing', 'মুলতুবি – ফাইলিং করার আগে PIC ও BSA গ্রহণ করুন'],
    ['Overall Recommendation:', 'সার্বিক সুপারিশ:'],
    ['Proceed with filing', 'ফাইলিং প্রক্রিয়া এগিয়ে নিন'],
    ['International & Export Regime Advisory Dossier', 'আন্তর্জাতিক এবং রপ্তানি নিয়ন্ত্রণ সংক্রান্ত পরামর্শ ডসিয়ার'],
    ['REQUIREMENT', 'প্রয়োজনীয়তা'],
    ['WHAT THE TREATY MANDATES', 'চুক্তির বাধ্যবাধকতা'],
    ['HOW IT APPLIES TO ASHWAGANDHA', 'অশ্বগন্ধায় এটি কীভাবে প্রযোজ্য'],
    ['REFERENCE', 'রেফারেন্স'],
    ['Legal Assessment:', 'আইনি মূল্যায়ন:'],
  ],
  mr: [
    ['Evaluate a patent application for a nanoformulation of Ashwagandha and Brahmi for Alzheimer\'s disease targeting BBB crossing', 'अल्झायमर रोगासाठी अश्वगंधा आणि ब्राह्मीच्या नॅनोफॉर्म्युलेशन पेटंट अर्जाचे मूल्यांकन'],
    ['Evaluate a patent application for a nanoformulation of', 'नॅनो-फॉर्म्युलेशनच्या पेटंट अर्जाचे मूल्यांकन:'],
    ['Evaluate a patent application for', 'पेटंट अर्जाचे मूल्यांकन:'],
    ['Evaluate a patent application', 'पेटंट अर्जाचे मूल्यांकन'],
    ['Evaluation of patentability', 'पेटंट योग्यतेचे मूल्यांकन'],
    ['Prior art analysis of', 'पूर्व कला विश्लेषण:'],
    ['Prior art search for', 'पूर्व कला शोध:'],
    ['Is Neem & Tulsi combination patentable', 'कडुनिंब आणि तुळशीचे संयोजन पेटंट योग्य आहे का'],
    ['Is Neem and Tulsi combination patentable', 'कडुनिंब आणि तुळशीचे संयोजन पेटंट योग्य आहे का'],
    ['What are the mandatory disclosure requirements under the WIPO GRATK Treaty 2024 and US FDA DSHEA rules for export of Ashwagandha?', 'अश्वगंधाच्या निर्यातीसाठी WIPO GRATK करार २०२४ आणि US FDA DSHEA नियमांनुसार अनिवार्य प्रकटीकरण आवश्यकता काय आहेत?'],
    ['In our university laboratory, we developed a synergistic formulation of Neem and Tulsi oil for wound healing. Is this patentable under Sec 3p & 3e?', 'आमच्या विद्यापीठ प्रयोगशाळेत, आम्ही जखम भरण्यासाठी कडुनिंब आणि तुळशीच्या तेलाचे एक सिनर्जिस्टिक संयोजन विकसित केले आहे. हे कलम ३(p) आणि ३(e) अंतर्गत पेटंट योग्य आहे का?'],
    ['In our university laboratory, we developed', 'आमच्या विद्यापीठ प्रयोगशाळेत आम्ही विकसित केले'],
    ['In our university laboratory', 'आमच्या विद्यापीठ प्रयोगशाळेत'],
    ['| ASPECT | VERDICT | ACTION |', '| पैलू | निर्णय | कृती |'],
    ['ASPECT', 'पैलू'],
    ['VERDICT', 'निर्णय'],
    ['ACTION', 'कृती'],
    ['Novelty', 'नवीनता'],
    ['Inventive Step', 'संशोधक पाऊल'],
    ['Sec. 3(e) Synergy', 'कलम ३(e) सिनर्जी'],
    ['Sec. 3(d) Efficacy', 'कलम ३(d) परिणामकारकता'],
    ['Sec. 3(p) Exclusion', 'कलम ३(p) अपवर्जन'],
    ['NBA Compliance', 'NBA पालन'],
    ['Risk of Revocation', 'रद्दीकरणाचा धोका'],
    ['Met (nano-carrier, co-encapsulation, PEGylation)', 'समाधानी (नॅनो-कॅरियर, PEGylation)'],
    ['Met (experimental proof required)', 'समाधानी (प्रायोगिक पुरावा आवश्यक)'],
    ['Overcome by claim limitation & technical effect', 'दावा मर्यादा आणि तांत्रिक प्रभावाद्वारे निराकरण'],
    ['Pending – obtain PIC & BSA before filing', 'प्रलंबित – अर्ज दाखल करण्यापूर्वी PIC आणि BSA मिळवा'],
    ['Overall Recommendation:', 'एकूण शिफारस:'],
    ['Proceed with filing', 'अर्ज दाखल करण्यासह पुढे जा'],
    ['International & Export Regime Advisory Dossier', 'आंतरराष्ट्रीय आणि निर्यात नियामक सल्लागार डॉसियर'],
    ['REQUIREMENT', 'आवश्यकता'],
    ['WHAT THE TREATY MANDATES', 'कराराचे अनिवार्य नियम'],
    ['HOW IT APPLIES TO ASHWAGANDHA', 'अश्वगंधाला हे कसे लागू होते'],
    ['REFERENCE', 'संदर्भ'],
    ['Legal Assessment:', 'कायदेशीर मूल्यांकन:'],
  ],
  gu: [
    ['Evaluate a patent application for a nanoformulation of Ashwagandha and Brahmi for Alzheimer\'s disease targeting BBB crossing', 'અલ્ઝાઈમર રોગ માટે અશ્વગંધા અને બ્રાહ્મીના નેનોફોર્મ્યુલેશન પેટન્ટ અરજીનું મૂલ્યાંકન'],
    ['Evaluate a patent application for a nanoformulation of', 'નેનો-ફોર્મ્યુલેશનની પેટન્ટ અરજીનું મૂલ્યાંકન:'],
    ['Evaluate a patent application for', 'પેટન્ટ અરજીનું મૂલ્યાંકન:'],
    ['Evaluate a patent application', 'પેટન્ટ અરજીનું મૂલ્યાંકન'],
    ['Evaluation of patentability', 'પેટન્ટ યોગ્યતા મૂલ્યાંકન'],
    ['Prior art analysis of', 'પૂર્વ કલા વિશ્લેષણ:'],
    ['Prior art search for', 'પૂર્વ કલા શોધ:'],
    ['Is Neem & Tulsi combination patentable', 'શું લીમડો અને તુલસી સંયોજન પેટન્ટ યોગ્ય છે'],
    ['Is Neem and Tulsi combination patentable', 'શું લીમડો અને તુલસી સંયોજન પેટન્ટ યોગ્ય છે'],
    ['What are the mandatory disclosure requirements under the WIPO GRATK Treaty 2024 and US FDA DSHEA rules for export of Ashwagandha?', 'અશ્વગંધાની નિકાસ માટે WIPO GRATK સંધિ ૨૦૨૪ અને US FDA DSHEA નિયમો હેઠળ ફરજિયાત જાહેરાત જરૂરિયાતો શું છે?'],
    ['In our university laboratory, we developed a synergistic formulation of Neem and Tulsi oil for wound healing. Is this patentable under Sec 3p & 3e?', 'અમારી યુનિવર્સિટી પ્રયોગશાળામાં, અમે ઘા રુઝવવા માટે લીમડા અને તુલસીના તેલનું એક સિનર્જિસ્ટિક ફોર્મ્યુલેશન વિકસાવ્યું છે. શું આ કલમ ૩(p) અને ૩(e) હેઠળ પેટન્ટ યોગ્ય છે?'],
    ['In our university laboratory, we developed', 'અમારી યુનિવર્સિટી પ્રયોગશાળામાં અમે વિકસાવ્યું'],
    ['In our university laboratory', 'અમારી યુનિવર્સિટી પ્રયોગશાળામાં'],
    ['| ASPECT | VERDICT | ACTION |', '| પાસું | ચુકાદો | પગલાં |'],
    ['ASPECT', 'પાસું'],
    ['VERDICT', 'ચુકાદો'],
    ['ACTION', 'પગલાં'],
    ['Novelty', 'નવીનતા'],
    ['Inventive Step', 'શોધક પગલું'],
    ['Sec. 3(e) Synergy', 'કલમ ૩(e) સિનર્જી'],
    ['Sec. 3(d) Efficacy', 'કલમ ૩(d) અસરકારકતા'],
    ['Sec. 3(p) Exclusion', 'કલમ ૩(p) બાકાત'],
    ['NBA Compliance', 'NBA પાલન'],
    ['Risk of Revocation', 'રદ્દીકરણનું જોખમ'],
    ['Met (nano-carrier, co-encapsulation, PEGylation)', 'સંતોષાયેલ (નેનો-કેરિયર, PEGylation)'],
    ['Met (experimental proof required)', 'સંતોષાયેલ (પ્રાયોગિક પુરાવા જરૂરી)'],
    ['Overcome by claim limitation & technical effect', 'દાવાની મર્યાદા અને તકનીકી અસર દ્વારા ઉકેલાયેલ'],
    ['Pending – obtain PIC & BSA before filing', 'બાકી – ફાઇલ કરતા પહેલા PIC અને BSA મેળવો'],
    ['Overall Recommendation:', 'સમગ્ર ભલામણ:'],
    ['Proceed with filing', 'ફાઇલિંગ પ્રક્રિયા આગળ વધારો'],
    ['International & Export Regime Advisory Dossier', 'આંતરરાષ્ટ્રીય અને નિકાસ નિયમનકારી સલાહકાર ડોઝિયર'],
    ['REQUIREMENT', 'જરૂરિયાત'],
    ['WHAT THE TREATY MANDATES', 'સંધિના નિયમો'],
    ['HOW IT APPLIES TO ASHWAGANDHA', 'અશ્વગંધા પર આ કેવી રીતે લાગુ પડે છે'],
    ['REFERENCE', 'સંદર્ભ'],
    ['Legal Assessment:', 'કાનૂની મૂલ્યાંકન:'],
  ],
  kn: [
    ['Evaluate a patent application for a nanoformulation of Ashwagandha and Brahmi for Alzheimer\'s disease targeting BBB crossing', 'ಅಲ್ಝೈಮರ್ ಕಾಯಿಲೆಗಾಗಿ ಅಶ್ವಗಂಧ ಮತ್ತು ಬ್ರಾಹ್ಮೀ ನ್ಯಾನೊಫಾರ್ಮುಲೇಶನ್ ಪೇಟೆಂಟ್ ಅರ್ಜಿ ಮೌಲ್ಯಮಾಪನ'],
    ['Evaluate a patent application for a nanoformulation of', 'ನ್ಯಾನೊ-ಸೂತ್ರೀಕರಣಕ್ಕಾಗಿ ಪೇಟೆಂಟ್ ಅರ್ಜಿ ಮೌಲ್ಯಮಾಪನ:'],
    ['Evaluate a patent application for', 'ಪೇಟೆಂಟ್ ಅರ್ಜಿ ಮೌಲ್ಯಮಾಪನ:'],
    ['Evaluate a patent application', 'ಪೇಟೆಂಟ್ ಅರ್ಜಿ ಮೌಲ್ಯಮಾಪನ'],
    ['Evaluation of patentability', 'ಪೇಟೆಂಟ್ ಅರ್ಹತೆ ಮೌಲ್ಯಮಾಪನ'],
    ['Prior art analysis of', 'ಪೂರ್ವ ಕಲೆ ವಿಶ್ಲೇಷಣೆ:'],
    ['Prior art search for', 'ಪೂರ್ವ ಕಲೆ ಹುಡುಕಾಟ:'],
    ['Is Neem & Tulsi combination patentable', 'ಬೇವು ಮತ್ತು ತುಳಸಿ ಸಂಯೋಜನೆ ಪೇಟೆಂಟ್ ಮಾಡಬಹುದೇ'],
    ['Is Neem and Tulsi combination patentable', 'ಬೇವು ಮತ್ತು ತುಳಸಿ ಸಂಯೋಜನೆ ಪೇಟೆಂಟ್ ಮಾಡಬಹುದೇ'],
    ['What are the mandatory disclosure requirements under the WIPO GRATK Treaty 2024 and US FDA DSHEA rules for export of Ashwagandha?', 'ಅಶ್ವಗಂಧ ರಫ್ತಿಗೆ WIPO GRATK ಒಪ್ಪಂದ 2024 ಮತ್ತು US FDA DSHEA ನಿಯಮಗಳ ಅಡಿಯಲ್ಲಿ ಕಡ್ಡಾಯ ಪ್ರಕಟಣೆ ಅವಶ್ಯಕತೆಗಳು ಯಾವುವು?'],
    ['In our university laboratory, we developed a synergistic formulation of Neem and Tulsi oil for wound healing. Is this patentable under Sec 3p & 3e?', 'ನಮ್ಮ ವಿಶ್ವವಿದ್ಯಾಲಯದ ಪ್ರಯೋಗಾಲಯದಲ್ಲಿ, ಗಾಯ ಗುಣಪಡಿಸಲು ಬೇವು ಮತ್ತು ತುಳಸಿ ಎಣ್ಣೆಯ ಸಿನರ್ಜಿಸ್ಟಿಕ್ ಸೂತ್ರೀಕರಣವನ್ನು ನಾವು ಅಭಿವೃದ್ಧಿಪಡಿಸಿದ್ದೇವೆ. ಇದು ಕಲಂ 3(p) ಮತ್ತು 3(e) ಅಡಿಯಲ್ಲಿ ಪೇಟೆಂಟ್ ಮಾಡಬಹುದೇ?'],
    ['In our university laboratory, we developed', 'ನಮ್ಮ ವಿಶ್ವವಿದ್ಯಾಲಯದ ಪ್ರಯೋಗಾಲಯದಲ್ಲಿ ನಾವು ಅಭಿವೃದ್ಧಿಪಡಿಸಿದ್ದೇವೆ'],
    ['In our university laboratory', 'ನಮ್ಮ ವಿಶ್ವವಿದ್ಯಾಲಯದ ಪ್ರಯೋಗಾಲಯದಲ್ಲಿ'],
    ['| ASPECT | VERDICT | ACTION |', '| ಅಂಶ | ತೀರ್ಪು | ಕ್ರಮ |'],
    ['ASPECT', 'ಅಂಶ'],
    ['VERDICT', 'ತೀರ್ಪು'],
    ['ACTION', 'ಕ್ರಮ'],
    ['Novelty', 'ನವೀನತೆ'],
    ['Inventive Step', 'ಸಂಶೋಧನಾ ಹಂತ'],
    ['Sec. 3(e) Synergy', 'ಕಲಂ 3(e) ಸಿನರ್ಜಿ'],
    ['Sec. 3(d) Efficacy', 'ಕಲಂ 3(d) ಸಾಮರ್ಥ್ಯ'],
    ['Sec. 3(p) Exclusion', 'ಕಲಂ 3(p) ಹೊರಗಿಡುವಿಕೆ'],
    ['NBA Compliance', 'NBA ಅನುಸರಣೆ'],
    ['Risk of Revocation', 'ರದ್ದತಿಯ ಅಪಾಯ'],
    ['Met (nano-carrier, co-encapsulation, PEGylation)', 'ತೃಪ್ತಿಗೊಂಡಿದೆ (ನ್ಯಾನೊ-ಕ್ಯಾರಿಯರ್, PEGylation)'],
    ['Met (experimental proof required)', 'ತೃಪ್ತಿಗೊಂಡಿದೆ (ಪ್ರಾಯೋಗಿಕ ಪುರಾವೆ ಅಗತ್ಯವಿದೆ)'],
    ['Overcome by claim limitation & technical effect', 'ಕ್ಲೇಮ್ ಮಿತಿ ಮತ್ತು ತಾಂತ್ರಿಕ ಪರಿಣಾಮದಿಂದ ಪರಿಹರಿಸಲಾಗಿದೆ'],
    ['Pending – obtain PIC & BSA before filing', 'ಬಾಕಿ ಉಳಿದಿದೆ – ಅರ್ಜಿ ಸಲ್ಲಿಸುವ ಮೊದಲು PIC ಮತ್ತು BSA ಪಡೆಯಿರಿ'],
    ['Overall Recommendation:', 'ಒಟ್ಟಾರೆ ಶಿಫಾರಸು:'],
    ['Proceed with filing', 'ಅರ್ಜಿ ಸಲ್ಲಿಕೆಯೊಂದಿಗೆ ಮುಂದುವರಿಯಿರಿ'],
    ['International & Export Regime Advisory Dossier', 'ಅಂತರರಾಷ್ಟ್ರೀಯ ಮತ್ತು ರಫ್ತು ನಿಯಂತ್ರಕ ಸಲಹಾ ಡೋಸಿಯರ್'],
    ['REQUIREMENT', 'ಅವಶ್ಯಕತೆ'],
    ['WHAT THE TREATY MANDATES', 'ಒಪ್ಪಂದದ ನಿಯಮಗಳು'],
    ['REFERENCE', 'ಉಲ್ಲೇಖ'],
    ['Legal Assessment:', 'ಕಾನೂನು ಮೌಲ್ಯಮಾಪನ:'],
  ],
  ml: [
    ['Evaluate a patent application for a nanoformulation of Ashwagandha and Brahmi for Alzheimer\'s disease targeting BBB crossing', 'അൽഷിമേഴ്‌സ് രോഗത്തിനായി അശ്വഗന്ധ, ബ്രഹ്മി നാനോഫോർമുലേഷൻ പേറ്റന്റ് അപേക്ഷാ വിലയിരുത്തൽ'],
    ['Evaluate a patent application for a nanoformulation of', 'നാനോ-ഫോർമുലേഷനായുള്ള പേറ്റന്റ് അപേക്ഷാ വിലയിരുത്തൽ:'],
    ['Evaluate a patent application for', 'പേറ്റന്റ് അപേക്ഷാ വിലയിരുത്തൽ:'],
    ['Evaluate a patent application', 'പേറ്റന്റ് അപേക്ഷാ വിലയിരുത്തൽ'],
    ['Evaluation of patentability', 'പേറ്റന്റ് യോഗ്യതാ വിലയിരുത്തൽ'],
    ['Prior art analysis of', 'മുൻ കലാ വിശകലനം:'],
    ['Prior art search for', 'മുൻ കലാ തിരച്ചിൽ:'],
    ['Is Neem & Tulsi combination patentable', 'വേപ്പ്, തുളസി സംയോജനം പേറ്റന്റ് ചെയ്യാൻ കഴിയുമോ'],
    ['Is Neem and Tulsi combination patentable', 'വേപ്പ്, തുളസി സംയോജനം പേറ്റന്റ് ചെയ്യാൻ കഴിയുമോ'],
    ['What are the mandatory disclosure requirements under the WIPO GRATK Treaty 2024 and US FDA DSHEA rules for export of Ashwagandha?', 'അശ്വഗന്ധ കയറ്റുമതിക്കായി WIPO GRATK ഉടമ്പടി 2024, US FDA DSHEA ചട്ടങ്ങൾ എന്നിവ പ്രകാരമുള്ള നിർബന്ധിത വെളിപ്പെടുത്തൽ ആവശ്യകതകൾ എന്തൊക്കെയാണ്?'],
    ['In our university laboratory, we developed a synergistic formulation of Neem and Tulsi oil for wound healing. Is this patentable under Sec 3p & 3e?', 'ഞങ്ങളുടെ സർവകലാശാലാ ലബോറട്ടറിയിൽ, മുറിവുകൾ ഉണക്കുന്നതിനായി വേപ്പ്, തുളസി എണ്ണകളുടെ സിനർജിസ്റ്റിക് ഫോർമുലേഷൻ ഞങ്ങൾ വികസിപ്പിച്ചു. ഇത് വകുപ്പ് 3(p), 3(e) പ്രകാരം പേറ്റന്റ് ചെയ്യാൻ കഴിയുമോ?'],
    ['In our university laboratory, we developed', 'ഞങ്ങളുടെ സർവകലാശാലാ ലബോറട്ടറിയിൽ ഞങ്ങൾ വികസിപ്പിച്ചു'],
    ['In our university laboratory', 'ഞങ്ങളുടെ സർവകലാശാലാ ലബോറട്ടറിയിൽ'],
    ['| ASPECT | VERDICT | ACTION |', '| വശം | വിധി | നടപടി |'],
    ['ASPECT', 'വശം'],
    ['VERDICT', 'വിധി'],
    ['ACTION', 'നടപടി'],
    ['Novelty', 'നവീനത'],
    ['Inventive Step', 'കണ്ടുപിടുത്ത ഘട്ടം'],
    ['Sec. 3(e) Synergy', 'വകുപ്പ് 3(e) സിനർജി'],
    ['Sec. 3(d) Efficacy', 'വകുപ്പ് 3(d) ഫലപ്രാപ്തി'],
    ['Sec. 3(p) Exclusion', 'വകുപ്പ് 3(p) ഒഴിവാക്കൽ'],
    ['NBA Compliance', 'NBA പാലനം'],
    ['Risk of Revocation', 'റദ്ദാക്കൽ സാധ്യത'],
    ['Met (nano-carrier, co-encapsulation, PEGylation)', 'തൃപ്തികരമാണ് (നാനോ-കാരിയർ, PEGylation)'],
    ['Met (experimental proof required)', 'തൃപ്തികരമാണ് (പരീക്ഷണാത്മക തെളിവ് ആവശ്യമാണ്)'],
    ['Overcome by claim limitation & technical effect', 'ക്ലെയിം പരിമിതിയും സാങ്കേതിക ഫലവും വഴി പരിഹരിച്ചു'],
    ['Pending – obtain PIC & BSA before filing', 'തീർപ്പാക്കാത്തത് – ഫയൽ ചെയ്യുന്നതിന് മുമ്പ് PIC & BSA നേടുക'],
    ['Overall Recommendation:', 'മൊത്തത്തിലുള്ള ശുപാർശ:'],
    ['Proceed with filing', 'ഫയലിംഗുമായി മുന്നോട്ട് പോകുക'],
    ['International & Export Regime Advisory Dossier', 'അന്താരാഷ്ട്ര, കയറ്റുമതി റെഗുലേറ്ററി ഉപദേശക ഡോസിയർ'],
    ['REQUIREMENT', 'ആവശ്യകത'],
    ['WHAT THE TREATY MANDATES', 'ഉടമ്പടി നിഷ്കർഷിക്കുന്നത്'],
    ['REFERENCE', 'റഫറൻസ്'],
    ['Legal Assessment:', 'നിയമപരമായ വിലയിരുത്തൽ:'],
  ]
};

const translationTextCache = new Map();

/**
 * Robust online translation fallback with placeholder protection for citations & code blocks
 */
async function translateOnlineFallback(text, fromLang = 'en', toLang) {
  if (!text || !toLang || toLang === 'en') return text;

  const tagPlaceholders = [];
  const sanitized = text.replace(/(\[[^\]]+\]|`[^`]+`)/g, (match) => {
    const idx = tagPlaceholders.length;
    tagPlaceholders.push(match);
    return `___TAG_${idx}___`;
  });

  const paragraphs = sanitized.split('\n\n');
  const translatedParagraphs = await Promise.all(
    paragraphs.map(async (para) => {
      if (!para.trim()) return para;
      try {
        const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${fromLang}&tl=${toLang}&dt=t&q=${encodeURIComponent(para)}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error('Translate fetch failed');
        const data = await res.json();
        if (Array.isArray(data?.[0])) {
          return data[0].map((seg) => seg[0]).join('');
        }
        return applyOfflineGlossary(para, toLang);
      } catch (err) {
        return applyOfflineGlossary(para, toLang);
      }
    })
  );

  let fullTranslated = translatedParagraphs.join('\n\n');

  tagPlaceholders.forEach((tag, idx) => {
    const regex = new RegExp(`___TAG_${idx}___|___ TAG_${idx} ___|___TAG _ ${idx}___`, 'g');
    fullTranslated = fullTranslated.replace(regex, tag);
  });

  return fullTranslated;
}

export function applyOfflineGlossary(text, targetLang) {
  if (!text || targetLang === 'en') return text;
  const glossary = OFFLINE_GLOSSARY[targetLang];
  if (!glossary || !Array.isArray(glossary)) return text;

  let translated = text;
  const sortedGlossary = [...glossary].sort((a, b) => (b[0]?.length || 0) - (a[0]?.length || 0));

  for (const [enTerm, targetTerm] of sortedGlossary) {
    if (!enTerm || !targetTerm) continue;
    translated = translated.split(enTerm).join(targetTerm);
  }
  return translated;
}

/**
 * Translates text from one language to another via Bhashini or high-fidelity fallback.
 * @param {string} text - Text to translate
 * @param {string} fromLang - Source language ISO code (e.g. 'en')
 * @param {string} toLang   - Target language ISO code (e.g. 'hi')
 * @returns {Promise<string>} - Translated text, or original on error/fallback
 */
export async function translateText(text, fromLang = 'en', toLang) {
  if (!text?.trim()) return text;
  if (fromLang === toLang) return text;
  if (!toLang || toLang === 'en') return text;

  const cacheKey = `${fromLang}:${toLang}:${text}`;
  if (translationTextCache.has(cacheKey)) {
    return translationTextCache.get(cacheKey);
  }

  // 1. Try Bhashini inference if configured
  if (isBhashiniConfigured()) {
    try {
      const serviceId = await fetchServiceId('translation', fromLang, toLang);
      if (serviceId) {
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
          inputData: { input: [{ source: text }] },
        };
        const res = await fetch(INFERENCE_ENDPOINT, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: BHASHINI_INFERENCE_KEY,
          },
          body: JSON.stringify(body),
        });
        if (res.ok) {
          const data = await res.json();
          const translated = data?.pipelineResponse?.[0]?.output?.[0]?.target;
          if (translated) {
            translationTextCache.set(cacheKey, translated);
            return translated;
          }
        }
      }
    } catch (err) {
      console.warn('[Bhashini] Translation error, falling back to online/offline translate:', err);
    }
  }

  // 2. Online translation fallback
  try {
    const onlineRes = await translateOnlineFallback(text, fromLang, toLang);
    if (onlineRes && onlineRes !== text) {
      translationTextCache.set(cacheKey, onlineRes);
      return onlineRes;
    }
  } catch (e) {
    console.warn('[Online Translate Fallback Error]:', e);
  }

  // 3. Offline glossary fallback
  const offlineRes = applyOfflineGlossary(text, toLang);
  translationTextCache.set(cacheKey, offlineRes);
  return offlineRes;
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
