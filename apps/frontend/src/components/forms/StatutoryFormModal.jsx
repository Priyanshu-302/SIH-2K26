import React, { useState } from 'react';
import { useFormStore } from '../../store/formStore';
import { 
  FileText, 
  ShieldCheck, 
  Globe2, 
  Landmark, 
  Printer, 
  Copy, 
  Check, 
  Download, 
  AlertTriangle, 
  Info, 
  Sparkles, 
  Building2, 
  Scale,
  Plus,
  Trash2,
  Edit3
} from 'lucide-react';

/**
 * Builds a clean, standalone, printable A4 HTML document for the active statutory form.
 * Decoupled from modal styles, overflow containers, and Tailwind classes to prevent
 * blank pages or half-page cutoff issues during browser PDF generation.
 */
function buildPrintDocumentHtml(currentForm, activeTab) {
  if (!currentForm) return '';
  const f = currentForm.fields || {};

  let formContentHtml = '';

  if (activeTab === 'IPO_FORM_25') {
    const inv = Array.isArray(f.inventors) ? f.inventors : [];
    formContentHtml = `
      <div class="header-emblem">
        <div class="gov-header">GOVERNMENT OF INDIA • THE PATENT OFFICE</div>
        <div class="act-title">${currentForm.actReference || 'THE PATENTS ACT, 1970 (39 of 1970) & THE PATENTS RULES, 2003'}</div>
        <div class="form-title">${currentForm.formNumber || 'FORM 25'}</div>
        <div class="form-subtitle">${currentForm.title || 'REQUEST FOR PERMISSION FOR MAKING PATENT APPLICATION OUTSIDE INDIA'}</div>
        <div class="see-rule">[See ${currentForm.sectionRule || 'Section 39 and Rule 71(1)'}]</div>
      </div>

      <div class="addressed-to">
        ${currentForm.addressedTo || 'To The Controller of Patents, The Patent Office at ' + (f.patentOfficeBranch || 'Delhi')}
      </div>

      <div class="section-title">1. Name and Particulars of Applicant(s)</div>
      <table class="data-table">
        <tr><th style="width:28%;">Name of Applicant(s)</th><td><strong>${f.applicantName || 'N/A'}</strong></td></tr>
        <tr><th>Legal Status / Category</th><td>${f.legalStatus || 'Natural Person / Startup / MSME'}</td></tr>
        <tr><th>Nationality</th><td>${f.applicantNationality || 'Indian'}</td></tr>
        <tr><th>Registered Address in India</th><td>${f.applicantAddress || 'N/A'}</td></tr>
        <tr><th>Contact Email</th><td>${f.applicantEmail || 'ip-compliance@ayurbiopharma.in'}</td></tr>
      </table>

      <div class="section-title">2. Inventor(s) and Origin in India</div>
      <p style="margin-bottom:6px; font-size:9.5pt;"><strong>Origin:</strong> ${f.inventionMadeInIndia || 'Yes, the invention was made in India by persons resident in India'}</p>
      <table class="data-table">
        <thead>
          <tr><th style="width:10%;">Sl. No.</th><th style="width:30%;">Inventor Name</th><th style="width:20%;">Nationality</th><th style="width:40%;">Residential Address</th></tr>
        </thead>
        <tbody>
          ${inv.map((item, idx) => `
            <tr>
              <td>${idx + 1}</td>
              <td><strong>${item.name || ''}</strong></td>
              <td>${item.nationality || 'Indian'}</td>
              <td>${item.address || ''}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <div class="section-title">3. Technical Disclosure & Biological Material Origin</div>
      <table class="data-table">
        <tr><th style="width:28%;">Title of Invention</th><td><strong>${f.inventionTitle || ''}</strong></td></tr>
        <tr><th>Biological Resources Utilized</th><td>${f.biologicalMaterialUsed || ''}</td></tr>
        <tr><th>Source & Geographic Origin</th><td>${f.sourceAndOriginOfMaterial || ''}</td></tr>
        <tr><th>Brief Description of Invention</th><td style="white-space:pre-wrap;">${f.briefDescriptionOfInvention || ''}</td></tr>
      </table>

      <div class="section-title">4. Target Foreign Countries & Filing Status</div>
      <table class="data-table">
        <tr><th style="width:28%;">Target Foreign Jurisdictions</th><td><strong>${Array.isArray(f.proposedCountries) ? f.proposedCountries.join('; ') : (f.proposedCountries || '')}</strong></td></tr>
        <tr><th>Reasons for Foreign Filing</th><td>${f.reasonsForForeignFiling || ''}</td></tr>
        <tr><th>Status of Indian Application</th><td>${f.hasIndianPriorityFiled || 'No (Direct Form 25 clearance sought prior to international filing)'}</td></tr>
      </table>

      <div class="section-title">5. Official Statutory Fee Details (First Schedule Entry 35)</div>
      <table class="data-table">
        <tr><th style="width:28%;">Fee Category</th><td>${f.statutoryFeeDetails?.feeCategory || 'Natural Person / Startup / Small Entity'}</td></tr>
        <tr><th>Statutory Fee Amount</th><td><strong>${f.statutoryFeeDetails?.feeAmount || '₹1,600'}</strong></td></tr>
        <tr><th>Payment Reference / CBR</th><td>${f.statutoryFeeDetails?.cbrReference || 'CBR-IPO-2024-DEL-89211'}</td></tr>
      </table>

      <div class="section-title">6. Registered Patent Agent / Authorized Representative</div>
      <table class="data-table">
        <tr><th style="width:28%;">Registered Patent Agent</th><td>${f.patentAgentDetails?.name || 'Rajesh V. Nambiar'}</td></tr>
        <tr><th>Registration Number</th><td>${f.patentAgentDetails?.registrationNumber || 'IN/PA-2849'}</td></tr>
        <tr><th>Address</th><td>${f.patentAgentDetails?.address || 'Law Associates, IP Towers, Barakhamba Road, New Delhi - 110001'}</td></tr>
      </table>

      <div class="section-title">7. Statutory Declaration & Section 118 Penal Acknowledgment</div>
      <div class="statutory-box">
        "${f.statutoryDeclaration || 'I/We hereby declare that the information given above is true and correct to the best of my/our knowledge and belief. I/We understand that making any application outside India in contravention of Section 39 attracts criminal penalties and imprisonment under Section 118 of the Patents Act, 1970.'}"
      </div>

      <div class="signature-block">
        <div class="place-date">
          <p><strong>Place:</strong> ${f.place || 'New Delhi'}</p>
          <p><strong>Date:</strong> ${f.date || new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
        </div>
        <div class="signature-line">
          <div class="sig-space"></div>
          <p class="sig-name"><strong>${f.signatory || f.applicantName || 'Authorized Signatory'}</strong></p>
          <p class="sig-title">${f.signatoryDesignation || 'Applicant / Registered Patent Agent'}</p>
        </div>
      </div>
    `;
  } else if (activeTab === 'NBA_FORM_1') {
    const bio = Array.isArray(f.biologicalResources) ? f.biologicalResources : [];
    formContentHtml = `
      <div class="header-emblem">
        <div class="gov-header">GOVERNMENT OF INDIA • NATIONAL BIODIVERSITY AUTHORITY</div>
        <div class="act-title">${currentForm.actReference || 'THE BIOLOGICAL DIVERSITY ACT, 2002 (18 OF 2003) & BIOLOGICAL DIVERSITY RULES, 2004'}</div>
        <div class="form-title">${currentForm.formNumber || 'FORM I'}</div>
        <div class="form-subtitle">${currentForm.title || 'APPLICATION FORM FOR ACCESS TO BIOLOGICAL RESOURCES AND ASSOCIATED TRADITIONAL KNOWLEDGE FOR COMMERCIAL UTILIZATION'}</div>
        <div class="see-rule">[See ${currentForm.sectionRule || 'Section 3, Rule 14 & Biological Diversity (Amendment) Rules, 2024'}]</div>
      </div>

      <div class="addressed-to">
        ${currentForm.addressedTo || 'To The Secretary, National Biodiversity Authority, TICEL Bio Park, CSIR Road, Taramani, Chennai - 600113, Tamil Nadu'}
      </div>

      <div class="section-title">1. Full Particulars of the Applicant</div>
      <table class="data-table">
        <tr><th style="width:28%;">Name of Applicant</th><td><strong>${f.applicantName || 'N/A'}</strong></td></tr>
        <tr><th>Legal Status</th><td>${f.legalStatus || 'N/A'}</td></tr>
        <tr><th>Registered Address</th><td>${f.registeredAddress || f.applicantAddress || 'N/A'}</td></tr>
        <tr><th>Authorized Representative</th><td>${f.authorizedContact || f.signatory || 'N/A'}</td></tr>
        <tr><th>Section 3(2) Status</th><td>${f.section3Categorization || 'Entity governed under Section 3(2) of Biological Diversity Act'}</td></tr>
      </table>

      <div class="section-title">2. Details of Biological Resource(s) Accessed</div>
      <table class="data-table">
        <thead>
          <tr>
            <th>Common Name</th>
            <th>Botanical Name & Family</th>
            <th>Part Used</th>
            <th>Nature</th>
            <th>Annual Quantum</th>
            <th>Collection Area & State</th>
          </tr>
        </thead>
        <tbody>
          ${bio.map((b) => `
            <tr>
              <td><strong>${b.commonName || ''}</strong></td>
              <td><em>${b.scientificName || ''}</em> (${b.family || ''})</td>
              <td>${b.partAccessed || ''}</td>
              <td>${b.natureOfResource || 'Cultivated'}</td>
              <td>${b.estimatedAnnualQuantum || ''}</td>
              <td>${b.collectionDistrict ? b.collectionDistrict + ', ' : ''}${b.collectionState || ''}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <div class="section-title">3. Associated Traditional Knowledge & Commercial Purpose</div>
      <table class="data-table">
        <tr><th style="width:28%;">Classical Treatises / TK Source</th><td>${f.sourceOfAssociatedTK || ''}</td></tr>
        <tr><th>TK Holders / Title Status</th><td>${f.tkHoldersDetails || 'Codified Public Domain Classical Ayurvedic Treatises'}</td></tr>
        <tr><th>Purpose of Access</th><td style="white-space:pre-wrap;">${f.purposeOfAccess || ''}</td></tr>
      </table>

      <div class="section-title">4. Access and Benefit Sharing (ABS) Model (2024 Amendment Rules)</div>
      <table class="data-table">
        <tr><th style="width:28%;">Annual Turnover Bracket</th><td><strong>${f.absTurnoverTier || ''}</strong></td></tr>
        <tr><th>Benefit Sharing Commitment</th><td>${f.proposedBenefitSharingModel || ''}</td></tr>
        <tr><th>Statutory Application Fee</th><td><strong>${f.statutoryApplicationFee || '₹10,000 via Bharatkosh / NBA E-Portal'}</strong></td></tr>
      </table>

      <div class="section-title">5. Ecological Sustainability Undertaking & Declaration</div>
      <div class="statutory-box">
        "${f.sustainabilityUndertaking || 'I/We hereby declare that collection of the biological resource(s) specified above will not adversely affect the local biodiversity, ecological balance, or livelihoods of the local communities. All information provided is true and correct.'}"
      </div>

      <div class="signature-block">
        <div class="place-date">
          <p><strong>Place:</strong> ${f.place || 'Gandhinagar, Gujarat'}</p>
          <p><strong>Date:</strong> ${f.date || new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
        </div>
        <div class="signature-line">
          <div class="sig-space"></div>
          <p class="sig-name"><strong>${f.signatory || f.applicantName || 'Authorized Signatory'}</strong></p>
          <p class="sig-title">${f.signatoryDesignation || 'Authorized Signatory / Declarant'}</p>
        </div>
      </div>
    `;
  } else if (activeTab === 'NBA_FORM_3') {
    formContentHtml = `
      <div class="header-emblem">
        <div class="gov-header">GOVERNMENT OF INDIA • NATIONAL BIODIVERSITY AUTHORITY</div>
        <div class="act-title">${currentForm.actReference || 'THE BIOLOGICAL DIVERSITY ACT, 2002 (18 OF 2003)'}</div>
        <div class="form-title">${currentForm.formNumber || 'FORM III'}</div>
        <div class="form-subtitle">${currentForm.title || 'APPLICATION FOR OBTAINING APPROVAL OF THE NATIONAL BIODIVERSITY AUTHORITY FOR APPLYING FOR INTELLECTUAL PROPERTY RIGHTS'}</div>
        <div class="see-rule">[See ${currentForm.sectionRule || 'Section 6 and Rule 18'}]</div>
      </div>

      <div class="addressed-to">
        ${currentForm.addressedTo || 'To The Secretary, National Biodiversity Authority, TICEL Bio Park, CSIR Road, Taramani, Chennai - 600113, Tamil Nadu'}
      </div>

      <div class="section-title">1. Particulars of Applicant & Category of IPR</div>
      <table class="data-table">
        <tr><th style="width:28%;">Applicant Name</th><td><strong>${f.applicantName || 'N/A'}</strong></td></tr>
        <tr><th>Category of IPR</th><td><strong>${f.iprCategory || 'Patent'}</strong></td></tr>
        <tr><th>Registered Address</th><td>${f.address || f.registeredAddress || 'N/A'}</td></tr>
        <tr><th>Statutory Fee (Rule 18(2))</th><td><strong>${f.statutoryApplicationFee || '₹5,000'}</strong></td></tr>
        <tr><th>Title of Invention</th><td><strong>${f.titleOfInvention || ''}</strong></td></tr>
      </table>

      <div class="section-title">2. Status of Patent Application (Section 6(1) Compliance)</div>
      <table class="data-table">
        <tr><th style="width:28%;">Timing of Application</th><td>${f.filingTimingStatus || ''}</td></tr>
        <tr><th>Indian Patent App. No.</th><td>${f.indianPatentAppNumber || 'N/A (Direct Section 6 approval prior to foreign filing)'}</td></tr>
        <tr><th>Date of Filing</th><td>${f.indianFilingDate || 'N/A'}</td></tr>
        <tr><th>Patent Office Branch</th><td>${f.patentOffice || 'Delhi'}</td></tr>
      </table>

      <div class="section-title">3. Biological Resources & Claim Dependencies</div>
      <table class="data-table">
        <tr><th style="width:28%;">Biological Resources Utilized</th><td>${f.biologicalResourcesUtilized || ''}</td></tr>
        <tr><th>Geographical Source</th><td>${f.sourceAndGeographicalOrigin || ''}</td></tr>
        <tr><th>Patent Claims Dependency</th><td style="white-space:pre-wrap;">${f.claimsDependency || ''}</td></tr>
      </table>

      <div class="section-title">4. Commercialization & Benefit-Sharing Undertaking</div>
      <table class="data-table">
        <tr><th style="width:28%;">Territorial Jurisdictions Planned</th><td>${f.territorialJurisdictionsPlanned || ''}</td></tr>
        <tr><th>Proposed Benefit-Sharing Mode</th><td>${f.proposedBenefitSharingMode || ''}</td></tr>
        <tr><th>Commercial Prospects</th><td>${f.commercializationProspects || 'Commercialization via licensing, direct manufacture, and export'}</td></tr>
      </table>

      <div class="section-title">5. Statutory Affirmation under Section 6(1)</div>
      <div class="statutory-box">
        "${f.statutoryAffirmation || 'I/We hereby apply for the approval of the National Biodiversity Authority for applying for Intellectual Property Rights. I/We undertake to pay the benefit sharing amount as may be decided by the National Biodiversity Authority.'}"
      </div>

      <div class="signature-block">
        <div class="place-date">
          <p><strong>Place:</strong> ${f.place || 'New Delhi'}</p>
          <p><strong>Date:</strong> ${f.date || new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
        </div>
        <div class="signature-line">
          <div class="sig-space"></div>
          <p class="sig-name"><strong>${f.signatory || f.applicantName || 'Authorized Signatory'}</strong></p>
          <p class="sig-title">${f.signatoryDesignation || 'Applicant / Authorized Representative'}</p>
        </div>
      </div>
    `;
  } else if (activeTab === 'WIPO_GRATK_SDS') {
    formContentHtml = `
      <div class="header-emblem">
        <div class="gov-header">WORLD INTELLECTUAL PROPERTY ORGANIZATION (WIPO) • GENEVA</div>
        <div class="act-title">${currentForm.actReference || 'WIPO TREATY ON INTELLECTUAL PROPERTY, GENETIC RESOURCES AND ASSOCIATED TRADITIONAL KNOWLEDGE (2024)'}</div>
        <div class="form-title">${currentForm.formNumber || 'STANDARDIZED DISCLOSURE STATEMENT (SDS)'}</div>
        <div class="form-subtitle">Mandatory Country of Origin & Traditional Knowledge Disclosure for International Patent Filings</div>
        <div class="see-rule">[See Articles 3, 4 & 7 • PCT Request Form PCT/RO/101 Box No. VIII Declarations]</div>
      </div>

      <div class="section-title">PART I: MANDATORY GENETIC RESOURCES DISCLOSURE (ARTICLE 3.1)</div>
      <table class="data-table">
        <tr><th style="width:30%;">Applicant Name</th><td><strong>${f.applicantName || 'AyurVeda BioPharma Innovations Pvt. Ltd.'}</strong></td></tr>
        <tr><th>Registered Address</th><td>${f.applicantAddress || 'N/A'}</td></tr>
        <tr><th>Country of Origin (Article 3.1(a))</th><td><strong>${f.countryOfOrigin || 'Republic of India'}</strong> (Sovereign Origin)</td></tr>
        <tr><th>Sovereign Source Authority (Article 3.1(b))</th><td>${f.sourceOfGeneticResources || 'National Biodiversity Authority of India / State Biodiversity Boards under Biological Diversity Act, 2002'}</td></tr>
        <tr><th>Biological & Genetic Material Specification</th><td>${f.geneticResourcesDisclosed || ''}</td></tr>
      </table>

      <div class="section-title">PART II: MANDATORY ASSOCIATED TRADITIONAL KNOWLEDGE DISCLOSURE (ARTICLE 3.2)</div>
      <table class="data-table">
        <tr><th style="width:30%;">Classical Codified Treatises / Source</th><td><strong>${f.traditionalKnowledgeSource || ''}</strong></td></tr>
        <tr><th>TKDL Accession Reference Identifier</th><td><strong>${f.tkdlAccessId || 'TKDL-AY-2024/EXP-INDIA'}</strong> (CSIR / Ministry of AYUSH)</td></tr>
        <tr><th>Indigenous Peoples / Community Status</th><td>${f.indigenousCommunityDetails || 'Codified public domain classical Ayurvedic literature; no private exclusive ownership'}</td></tr>
      </table>

      <div class="section-title">PART III: TARGET OFFICES & LEGAL REPRESENTATIVES</div>
      <table class="data-table">
        <tr><th style="width:30%;">Target Offices / Jurisdictions</th><td><strong>${f.targetOffices || 'WIPO PCT International Phase, USPTO, EPO'}</strong></td></tr>
        <tr><th>Registered Patent Attorney / Agent</th><td>${f.patentAgentDetails || 'Rajesh V. Nambiar (IN/PA-2849)'}</td></tr>
      </table>

      <div class="section-title">PART IV: TREATY SAFE-HARBORS & STATUTORY DECLARATION (ARTICLES 4 & 7)</div>
      <div class="statutory-box">
        <p><strong>Article 4 (Non-Retroactivity):</strong> This disclosure is executed prospectively in good faith. No obligations are imposed regarding applications or patents filed prior to entry into force of this Treaty.</p>
        <p style="margin-top:6px;"><strong>Article 7 (Safe-Harbor Against Revocation):</strong> Pursuant to Article 7 of the WIPO GRATK Treaty 2024, no patent granted shall be revoked, invalidated, or rendered unenforceable solely on the basis of formal disclosure defects, in the absence of established fraudulent intent.</p>
      </div>

      <div class="signature-block">
        <div class="place-date">
          <p><strong>Place of Execution:</strong> ${f.place || 'New Delhi / Geneva'}</p>
          <p><strong>Date:</strong> ${f.date || new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
        </div>
        <div class="signature-line">
          <div class="sig-space"></div>
          <p class="sig-name"><strong>${f.signatory || f.applicantName || 'Authorized Signatory'}</strong></p>
          <p class="sig-title">${f.signatoryDesignation || 'Authorized Signatory / Declarant / Patent Attorney'}</p>
        </div>
      </div>
    `;
  }

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${currentForm.formNumber || 'Statutory_Form'} - Official Government Document</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 15mm 18mm 15mm 18mm;
    }
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body {
      font-family: 'Times New Roman', Times, serif, system-ui;
      color: #0f172a;
      background: #ffffff;
      font-size: 10.5pt;
      line-height: 1.45;
      padding: 0;
    }
    .header-emblem {
      text-align: center;
      border-bottom: 2px solid #0f172a;
      padding-bottom: 10px;
      margin-bottom: 14px;
    }
    .gov-header {
      font-size: 9pt;
      letter-spacing: 2px;
      font-weight: bold;
      text-transform: uppercase;
      color: #334155;
    }
    .act-title {
      font-size: 10.5pt;
      font-weight: bold;
      text-transform: uppercase;
      margin-top: 3px;
    }
    .form-title {
      font-size: 15pt;
      font-weight: 900;
      text-transform: uppercase;
      margin-top: 3px;
      letter-spacing: 1px;
    }
    .form-subtitle {
      font-size: 10pt;
      font-weight: bold;
      text-transform: uppercase;
      margin-top: 2px;
      max-width: 90%;
      margin-left: auto;
      margin-right: auto;
    }
    .see-rule {
      font-size: 9pt;
      font-style: italic;
      color: #475569;
      margin-top: 3px;
    }
    .addressed-to {
      margin: 10px 0;
      padding: 6px 10px;
      background-color: #f8fafc;
      border: 1px solid #cbd5e1;
      border-radius: 4px;
      font-weight: bold;
      font-size: 9.5pt;
    }
    .section-title {
      font-size: 9.5pt;
      font-weight: bold;
      text-transform: uppercase;
      margin-top: 14px;
      margin-bottom: 5px;
      background: #f1f5f9;
      padding: 4px 8px;
      border-left: 4px solid #0f172a;
    }
    table.data-table {
      width: 100%;
      border-collapse: collapse;
      margin: 6px 0 10px 0;
      font-size: 9.5pt;
    }
    table.data-table th, table.data-table td {
      border: 1px solid #cbd5e1;
      padding: 5px 8px;
      text-align: left;
      vertical-align: top;
    }
    table.data-table th {
      background-color: #f8fafc;
      font-weight: bold;
      color: #1e293b;
    }
    .statutory-box {
      border: 1px solid #94a3b8;
      background: #f8fafc;
      padding: 8px 12px;
      margin: 10px 0;
      font-style: italic;
      font-size: 9.5pt;
      line-height: 1.4;
      border-radius: 4px;
    }
    .signature-block {
      margin-top: 28px;
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      page-break-inside: avoid;
    }
    .place-date p {
      margin-bottom: 4px;
      font-size: 9.5pt;
    }
    .signature-line {
      width: 240px;
      text-align: center;
    }
    .sig-space {
      height: 35px;
    }
    .sig-name {
      border-top: 1.5px solid #0f172a;
      padding-top: 4px;
      font-size: 10pt;
      font-weight: bold;
    }
    .sig-title {
      font-size: 8.5pt;
      color: #475569;
    }
  </style>
</head>
<body>
  ${formContentHtml}
</body>
</html>`;
}

export function StatutoryFormModal() {
  const { 
    isModalOpen, 
    closeFormModal, 
    activeTab, 
    setActiveTab, 
    isLoading, 
    error, 
    formsData, 
    updateFormField,
    updateNestedFormField,
    updateArrayItem,
    addArrayItem,
    removeArrayItem
  } = useFormStore();

  const [copied, setCopied] = useState(false);
  const [showRawWipoText, setShowRawWipoText] = useState(false);

  if (!isModalOpen) return null;

  const forms = formsData?.forms || {};
  const currentForm = 
    activeTab === 'IPO_FORM_25' ? forms.ipoForm25 :
    activeTab === 'NBA_FORM_1' ? forms.nbaForm1 :
    activeTab === 'NBA_FORM_3' ? forms.nbaForm3 :
    forms.wipoGratkSDS;

  // Helper to synchronize WIPO field edits to both fields and standardizedText
  const updateWipoField = (fieldKey, value) => {
    updateFormField('wipoGratkSDS', fieldKey, value);

    // Reconstruct verbatim Box VIII text dynamically
    const f = {
      ...(forms.wipoGratkSDS?.fields || {}),
      [fieldKey]: value,
    };

    const newStandardizedText = `WIPO TREATY ON INTELLECTUAL PROPERTY, GENETIC RESOURCES AND ASSOCIATED TRADITIONAL KNOWLEDGE (2024)
STANDARDIZED DISCLOSURE STATEMENT (SDS) - ARTICLES 3, 4 & 7
FOR PCT REQUEST (BOX NO. VIII) / NATIONAL PHASE PATENT FILING

================================================================================
PART I: MANDATORY GENETIC RESOURCES (GR) DISCLOSURE (ARTICLE 3.1)
================================================================================
[X] 1. The claimed invention is materially / directly based on genetic resources.
(a) Country of Origin:
    ${f.countryOfOrigin || 'Republic of India'} (Sovereign origin under Biological Diversity Act, 2002)
(b) Source of Genetic Resources:
    ${f.sourceOfGeneticResources || 'National Biodiversity Authority of India / State Biodiversity Boards under Biological Diversity Act, 2002'}
(c) Biological Material Specification:
    ${f.geneticResourcesDisclosed || ''}

================================================================================
PART II: MANDATORY ASSOCIATED TRADITIONAL KNOWLEDGE (ATK) DISCLOSURE (ARTICLE 3.2)
================================================================================
[X] 2. The claimed invention is materially / directly based on traditional knowledge associated with genetic resources.
(a) Source of Associated Traditional Knowledge:
    ${f.traditionalKnowledgeSource || ''}
(b) Prior Art Citation & Database Reference:
    Traditional Knowledge Digital Library (TKDL), CSIR / Ministry of AYUSH, India
    Accession Reference ID: ${f.tkdlAccessId || 'TKDL-AY-2024/EXP-INDIA'}
(c) Indigenous Peoples or Local Communities:
    ${f.indigenousCommunityDetails || 'Codified public domain classical Ayurvedic literature; no specific private community holds exclusive title.'}

================================================================================
PART III: TREATY PROTECTIONS & STATUTORY SAFE-HARBORS (ARTICLES 4 & 7)
================================================================================
4. Prospective Application (Article 4):
   This declaration is made prospectively in complete good faith. Under Article 4 of the Treaty, no retroactive obligations are imposed on priority rights established prior to treaty entry into force.

5. Revocation Safeguards & Safe-Harbor (Article 7):
   Pursuant to Article 7 of the Treaty, the grant or validity of any patent issued shall not be revoked, invalidated, or rendered unenforceable solely on the basis of formal disclosure defects, in the absence of established fraudulent intent.

================================================================================
PART IV: DECLARANT & PATENT ATTORNEY PARTICULARS
================================================================================
Applicant Name: ${f.applicantName || 'AyurVeda BioPharma Innovations Pvt. Ltd.'}
Registered Address: ${f.applicantAddress || ''}
Authorized Signatory / Declarant: ${f.signatory || 'Authorized Signatory (Director of R&D / Applicant)'}
Capacity: ${f.signatoryDesignation || 'Authorized Signatory / Declarant / Patent Attorney'}
Registered Patent Agent: ${f.patentAgentDetails || 'Rajesh V. Nambiar (IN/PA-2849)'}
Target Offices / Jurisdictions: ${f.targetOffices || 'WIPO PCT International Phase, USPTO, EPO'}
Date of Execution: ${f.date || new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
Jurisdiction / Place: ${f.place || 'New Delhi / Geneva'}`;

    updateFormField('wipoGratkSDS', 'standardizedText', newStandardizedText);
  };

  // Format tailored text for government e-filing portals
  const generatePortalText = () => {
    if (!currentForm) return '';

    if (activeTab === 'IPO_FORM_25') {
      const f = currentForm.fields || {};
      const inv = Array.isArray(f.inventors) ? f.inventors : [];
      return `THE PATENTS ACT, 1970 (39 of 1970) & THE PATENTS RULES, 2003
FORM 25 [See Section 39 and Rule 71(1)]
REQUEST FOR PERMISSION FOR MAKING PATENT APPLICATION OUTSIDE INDIA

${currentForm.addressedTo || 'To The Controller of Patents, The Patent Office at ' + (f.patentOfficeBranch || 'Delhi')}

1. Name and Particulars of the Applicant(s):
   - Name: ${f.applicantName || ''}
   - Nationality: ${f.applicantNationality || 'Indian'}
   - Registered Address: ${f.applicantAddress || ''}
   - Legal Status: ${f.legalStatus || ''}
   - Contact Email: ${f.applicantEmail || ''}

2. Title of the Invention:
   ${f.inventionTitle || ''}

3. Origin of Invention:
   - Was the invention made in India by persons resident in India?: ${f.inventionMadeInIndia || 'Yes'}
   - Inventor(s):
${inv.map((item, idx) => `     (${idx + 1}) Name: ${item.name || ''} | Nationality: ${item.nationality || 'Indian'} | Address: ${item.address || ''}`).join('\n')}

4. Biological Material Sourced from India:
   - Biological Resources: ${f.biologicalMaterialUsed || ''}
   - Source & Geographic Origin: ${f.sourceAndOriginOfMaterial || ''}

5. Technical Abstract / Brief Description of Invention:
   ${f.briefDescriptionOfInvention || ''}

6. Proposed Foreign Jurisdictions / Patent Offices:
   ${Array.isArray(f.proposedCountries) ? f.proposedCountries.join('; ') : (f.proposedCountries || '')}

7. Reasons for Making Application Outside India:
   ${f.reasonsForForeignFiling || ''}

8. Status of Indian Patent Application:
   - Priority Filing Status: ${f.hasIndianPriorityFiled || 'No'}
   - Indian Patent Application No: ${f.indianApplicationNumber || 'N/A'}
   - Date of Filing: ${f.indianFilingDate || 'N/A'}

9. Statutory Official Fee (First Schedule Entry 35):
   - Category: ${f.statutoryFeeDetails?.feeCategory || 'Natural Person / Startup / Small Entity (₹1,600)'}
   - Amount Remitted: ${f.statutoryFeeDetails?.feeAmount || '₹1,600'}
   - Payment Reference / CBR: ${f.statutoryFeeDetails?.cbrReference || 'Online E-Filing Gateway'}

10. Patent Agent / Authorized Signatory Particulars:
    - Name: ${f.patentAgentDetails?.name || 'Rajesh V. Nambiar'}
    - Registration No: ${f.patentAgentDetails?.registrationNumber || 'IN/PA-2849'}
    - Address: ${f.patentAgentDetails?.address || ''}

11. Statutory Penal Acknowledgment & Declaration:
    ${f.statutoryDeclaration || ''}

Place: ${f.place || 'New Delhi'}
Date: ${f.date || ''}
Signature: _____________________________________________
Name: ${f.signatory || f.applicantName || 'Authorized Signatory'}
Capacity: ${f.signatoryDesignation || 'Applicant / Registered Patent Agent'}`;
    }

    if (activeTab === 'NBA_FORM_1') {
      const f = currentForm.fields || {};
      const bio = Array.isArray(f.biologicalResources) ? f.biologicalResources : [];
      return `THE BIOLOGICAL DIVERSITY ACT, 2002 (18 OF 2003) & BIOLOGICAL DIVERSITY RULES, 2004
FORM I [See Rule 14]
APPLICATION FORM FOR ACCESS TO BIOLOGICAL RESOURCES AND ASSOCIATED TRADITIONAL KNOWLEDGE FOR COMMERCIAL UTILIZATION

${currentForm.addressedTo || 'To The Secretary, National Biodiversity Authority, TICEL Bio Park, Chennai - 600113, Tamil Nadu'}

1. Full Particulars of the Applicant:
   - Name: ${f.applicantName || ''}
   - Legal Status: ${f.legalStatus || ''}
   - Registered Address: ${f.registeredAddress || f.applicantAddress || ''}
   - Authorized Representative: ${f.authorizedContact || f.signatory || ''}

2. Categorization under Section 3(2) of the Act:
   - Status: ${f.section3Categorization || ''}

3. Details of Biological Resource(s) Accessed:
${bio.map((b, idx) => `   [Resource ${idx + 1}]
   - Common / Vernacular Name: ${b.commonName || ''}
   - Scientific / Botanical Name: ${b.scientificName || ''} (Family: ${b.family || ''})
   - Part Accessed: ${b.partAccessed || ''}
   - Nature: ${b.natureOfResource || 'Cultivated'}
   - Estimated Annual Quantum: ${b.estimatedAnnualQuantum || ''}
   - Collection Site: District: ${b.collectionDistrict || ''} | State: ${b.collectionState || ''}
   - Local BMC / SBB Jurisdiction: ${b.localBmcJurisdiction || ''}`).join('\n\n')}

4. Details of Associated Traditional Knowledge (ATK):
   - Classical Codified References: ${f.sourceOfAssociatedTK || ''}
   - TK Holders / Community Title: ${f.tkHoldersDetails || 'Codified Public Domain Ayurvedic Literature'}

5. Purpose of Access:
   ${f.purposeOfAccess || ''}

6. Proposed Access and Benefit Sharing (ABS) Model (2024 Rules):
   - Turnover Bracket: ${f.absTurnoverTier || ''}
   - Benefit Sharing Commitment: ${f.proposedBenefitSharingModel || ''}

7. Statutory Application Fee:
   - Amount: ${f.statutoryApplicationFee || '₹10,000 via Bharatkosh / NBA Portal'}

8. Sustainability Undertaking:
   ${f.sustainabilityUndertaking || ''}

Place: ${f.place || 'Gandhinagar, Gujarat'}
Date: ${f.date || ''}
Signature: _____________________________________________
Name: ${f.signatory || f.applicantName || 'Authorized Signatory'}
Capacity: ${f.signatoryDesignation || 'Authorized Signatory / Declarant'}`;
    }

    if (activeTab === 'NBA_FORM_3') {
      const f = currentForm.fields || {};
      return `THE BIOLOGICAL DIVERSITY ACT, 2002 (18 OF 2003)
FORM III [See Rule 18]
APPLICATION FOR OBTAINING APPROVAL OF THE NATIONAL BIODIVERSITY AUTHORITY FOR APPLYING FOR INTELLECTUAL PROPERTY RIGHTS

${currentForm.addressedTo || 'To The Secretary, National Biodiversity Authority, TICEL Bio Park, Chennai - 600113, Tamil Nadu'}

1. Particulars of Applicant:
   - Name: ${f.applicantName || ''}
   - Legal Status: ${f.legalStatus || ''}
   - Address: ${f.address || f.registeredAddress || ''}

2. Nature of Intellectual Property Right:
   - Category: ${f.iprCategory || 'Patent'}
   - Title of Invention: ${f.titleOfInvention || ''}

3. Timing & Status of Patent Application (Section 6(1)):
   - Application Timing: ${f.filingTimingStatus || ''}
   - Indian Patent Application No: ${f.indianPatentAppNumber || 'N/A'}
   - Filing Date: ${f.indianFilingDate || 'N/A'}
   - Patent Office: ${f.patentOffice || 'N/A'}

4. Biological Resources Utilized in the Invention:
   - Resources: ${f.biologicalResourcesUtilized || ''}
   - Geographical Origin: ${f.sourceAndGeographicalOrigin || ''}
   - Claim Dependency: ${f.claimsDependency || ''}

5. Jurisdictions Planned:
   ${f.territorialJurisdictionsPlanned || ''}

6. Commercialization Plan & Benefit Sharing:
   - Proposed Benefit-Sharing: ${f.proposedBenefitSharingMode || ''}
   - Statutory Fee: ${f.statutoryApplicationFee || '₹5,000'}

7. Statutory Affirmation under Section 6(1):
   ${f.statutoryAffirmation || ''}

Place: ${f.place || 'New Delhi'}
Date: ${f.date || ''}
Signature: _____________________________________________
Name: ${f.signatory || f.applicantName || 'Authorized Signatory'}
Capacity: ${f.signatoryDesignation || 'Applicant / Authorized Representative'}`;
    }

    if (activeTab === 'WIPO_GRATK_SDS') {
      return currentForm.standardizedText || '';
    }

    return '';
  };

  const handleCopy = () => {
    const text = generatePortalText();
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  /**
   * Safe isolated iframe print engine.
   * Completely avoids @media print clipping, blank pages, and half-page cutoff!
   */
  const handlePrint = () => {
    if (!currentForm) return;
    const printHtml = buildPrintDocumentHtml(currentForm, activeTab);

    // Create an isolated hidden iframe
    const iframe = document.createElement('iframe');
    iframe.setAttribute('style', 'position:fixed;right:0;bottom:0;width:0;height:0;border:0;visibility:hidden;');
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow.document;
    doc.open();
    doc.write(printHtml);
    doc.close();

    iframe.contentWindow.focus();
    setTimeout(() => {
      iframe.contentWindow.print();
      setTimeout(() => {
        try {
          document.body.removeChild(iframe);
        } catch (e) {}
      }, 2000);
    }, 400);
  };

  const handleDownload = () => {
    const text = generatePortalText();
    const blob = new Blob([text], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${currentForm?.formId || 'Statutory_Form'}_${new Date().toISOString().slice(0, 10)}.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/65 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white border border-sage-200 rounded-2xl shadow-elevated w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden animate-fadeIn">
        
        {/* Top Header */}
        <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 text-white px-5 py-3.5 flex items-center justify-between shrink-0 border-b border-emerald-800/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-300">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold font-heading">
                  Statutory Filing &amp; Compliance Generator
                </h3>
                <span className="text-[10px] bg-emerald-500/30 text-emerald-300 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider border border-emerald-400/30">
                  2024 Gazette &amp; Treaty Edition
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Official statutory instruments pre-filled from active formulation. All fields are interactive and editable.
              </p>
            </div>
          </div>

          <button
            onClick={closeFormModal}
            className="text-slate-400 hover:text-white p-1.5 rounded-xl hover:bg-white/10 transition-colors cursor-pointer text-sm font-bold"
            aria-label="Close Modal"
          >
            ✕
          </button>
        </div>

        {/* Tab Selection */}
        <div className="bg-sage-50/90 border-b border-sage-200 px-3 sm:px-6 py-2.5 flex items-center gap-2 overflow-x-auto shrink-0">
          <button
            onClick={() => setActiveTab('IPO_FORM_25')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'IPO_FORM_25'
                ? 'bg-emerald-800 text-white shadow-sm ring-1 ring-emerald-900'
                : 'bg-white text-slate-700 hover:bg-sage-100 border border-sage-200'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>IPO Form 25 (Patents § 39)</span>
          </button>

          <button
            onClick={() => setActiveTab('NBA_FORM_1')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'NBA_FORM_1'
                ? 'bg-emerald-800 text-white shadow-sm ring-1 ring-emerald-900'
                : 'bg-white text-slate-700 hover:bg-sage-100 border border-sage-200'
            }`}
          >
            <Landmark className="w-3.5 h-3.5" />
            <span>NBA Form I (Commercial ABS)</span>
          </button>

          <button
            onClick={() => setActiveTab('NBA_FORM_3')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'NBA_FORM_3'
                ? 'bg-emerald-800 text-white shadow-sm ring-1 ring-emerald-900'
                : 'bg-white text-slate-700 hover:bg-sage-100 border border-sage-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>NBA Form III (IPR Approval)</span>
          </button>

          <button
            onClick={() => setActiveTab('WIPO_GRATK_SDS')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'WIPO_GRATK_SDS'
                ? 'bg-indigo-800 text-white shadow-sm ring-1 ring-indigo-900'
                : 'bg-white text-slate-700 hover:bg-sage-100 border border-sage-200'
            }`}
          >
            <Globe2 className="w-3.5 h-3.5" />
            <span>WIPO GRATK Art. 3 SDS (International)</span>
          </button>
        </div>

        {/* Modal Body Container */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-alabaster-50 min-h-0">
          {isLoading ? (
            <div className="h-64 flex flex-col items-center justify-center space-y-3">
              <div className="w-9 h-9 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-xs font-semibold text-slate-600">Extracting botanical claims and synthesizing statutory schedules...</p>
            </div>
          ) : error ? (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs">
              <p className="font-bold">Form Generation Error:</p>
              <p>{error}</p>
            </div>
          ) : currentForm ? (
            <div className="space-y-4">
              
              {/* Statutory Alert Banner */}
              {activeTab === 'IPO_FORM_25' && (
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5">
                  <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block mb-0.5">Statutory Clearance Mandate (The Patents Act, 1970 - Section 39 &amp; Rule 71(1)):</strong>
                    Any Indian resident proposing to file an application outside India for an invention made in India must obtain prior written permission from the Controller. Filing abroad without permission attracts criminal imprisonment up to 2 years, fine under Section 118, and abandonment of the Indian patent application under Section 40.
                  </div>
                </div>
              )}

              {activeTab === 'NBA_FORM_1' && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-start gap-2.5">
                  <Info className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block mb-0.5">Biological Diversity Act, 2002 &amp; 2024 Amendment Rules (Section 3 &amp; Rule 14):</strong>
                    Prescribed application for access to biological resources and associated TK for commercial utilization. Mandatory benefit sharing applies under the 2024 Amendment Rules based on gross ex-factory annual turnover (0.1% for &lt; ₹1 Cr; 0.2% for ₹1–50 Cr; 0.5% for &gt; ₹50 Cr). Statutory application fee: ₹10,000.
                  </div>
                </div>
              )}

              {activeTab === 'NBA_FORM_3' && (
                <div className="p-3 rounded-xl bg-teal-50 border border-teal-200 text-teal-900 text-xs flex items-start gap-2.5">
                  <Landmark className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block mb-0.5">IPR Application Approval Mandate (Section 6 &amp; Rule 18):</strong>
                    Mandatory NBA approval required before making any patent application outside India, or before the grant of an Indian patent application based on biological resources obtained from India. Statutory application fee: ₹5,000 for entities.
                  </div>
                </div>
              )}

              {activeTab === 'WIPO_GRATK_SDS' && (
                <div className="p-3 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-900 text-xs flex items-start justify-between gap-2.5">
                  <div className="flex items-start gap-2.5">
                    <Globe2 className="w-4 h-4 text-indigo-700 shrink-0 mt-0.5" />
                    <div>
                      <strong className="block mb-0.5">WIPO GRATK Treaty (Adopted May 24, 2024 - Articles 3, 4 &amp; 7):</strong>
                      Standardized Disclosure Statement (SDS) for incorporation into PCT Request Form PCT/RO/101 (Box No. VIII Declarations) or foreign national phase filings. Positively identifies India as sovereign Country of Origin and classical Samhitas as ATK source, protected under Article 7 revocation safe-harbor.
                    </div>
                  </div>
                  <button
                    onClick={() => setShowRawWipoText(!showRawWipoText)}
                    className="px-2.5 py-1 text-[11px] font-semibold bg-indigo-100 hover:bg-indigo-200 text-indigo-800 rounded-lg shrink-0 cursor-pointer"
                  >
                    {showRawWipoText ? 'Show Form View' : 'Show Verbatim Box VIII'}
                  </button>
                </div>
              )}

              {/* Form Paper Document Container */}
              <div className="bg-white border border-slate-300 rounded-xl shadow-soft-card p-5 sm:p-8 space-y-6 text-slate-800">
                
                {/* Official Form Header */}
                <div className="text-center border-b-2 border-slate-800 pb-4">
                  <div className="text-[11px] uppercase font-bold tracking-widest text-slate-600 block mb-1">
                    {activeTab === 'WIPO_GRATK_SDS' ? 'WORLD INTELLECTUAL PROPERTY ORGANIZATION • STATUTORY DISCLOSURE' : 'GOVERNMENT OF INDIA • STATUTORY COMPLIANCE INSTRUMENT'}
                  </div>
                  <div className="text-xs uppercase font-extrabold tracking-wider text-slate-700">
                    {currentForm.actReference}
                  </div>
                  <h2 className="text-base sm:text-lg font-black font-heading text-slate-900 uppercase tracking-wide mt-1">
                    {currentForm.formNumber}
                  </h2>
                  <h3 className="text-xs sm:text-sm font-bold text-slate-800 uppercase mt-0.5 max-w-3xl mx-auto">
                    {currentForm.title}
                  </h3>
                  <div className="text-[11px] text-slate-600 mt-1 font-serif italic">
                    [See {currentForm.sectionRule}]
                  </div>
                  {currentForm.addressedTo && (
                    <div className="mt-2 text-xs font-semibold text-slate-700 text-left bg-slate-50 p-2 rounded-lg border border-slate-200">
                      {currentForm.addressedTo}
                    </div>
                  )}
                </div>

                {/* FORM SPECIFIC CONTENT */}

                {/* 1. IPO FORM 25 VIEW */}
                {activeTab === 'IPO_FORM_25' && (
                  <div className="space-y-5 text-xs">
                    {/* Section 1: Patent Office Jurisdiction & Applicant */}
                    <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 space-y-3">
                      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                        <h4 className="font-bold text-slate-900 uppercase text-[11px] tracking-wider flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5 text-emerald-700" />
                          <span>1. Patent Office Jurisdiction &amp; Applicant Particulars</span>
                        </h4>
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-bold text-slate-600">Branch Office:</span>
                          <select
                            value={currentForm.fields?.patentOfficeBranch || 'Delhi'}
                            onChange={(e) => {
                              updateFormField('ipoForm25', 'patentOfficeBranch', e.target.value);
                              updateFormField('ipoForm25', 'addressedTo', `To The Controller of Patents, The Patent Office at ${e.target.value}`);
                            }}
                            className="text-xs p-1 rounded border border-slate-300 bg-white font-medium cursor-pointer"
                          >
                            <option value="Delhi">The Patent Office at Delhi</option>
                            <option value="Mumbai">The Patent Office at Mumbai</option>
                            <option value="Chennai">The Patent Office at Chennai</option>
                            <option value="Kolkata">The Patent Office at Kolkata</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Applicant Name</label>
                          <input
                            type="text"
                            value={currentForm.fields?.applicantName || ''}
                            onChange={(e) => updateFormField('ipoForm25', 'applicantName', e.target.value)}
                            className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white font-medium"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Legal Status &amp; Category</label>
                          <input
                            type="text"
                            value={currentForm.fields?.legalStatus || ''}
                            onChange={(e) => updateFormField('ipoForm25', 'legalStatus', e.target.value)}
                            className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white font-medium"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Registered Address in India</label>
                          <input
                            type="text"
                            value={currentForm.fields?.applicantAddress || ''}
                            onChange={(e) => updateFormField('ipoForm25', 'applicantAddress', e.target.value)}
                            className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white font-medium"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Contact Email</label>
                          <input
                            type="email"
                            value={currentForm.fields?.applicantEmail || ''}
                            onChange={(e) => updateFormField('ipoForm25', 'applicantEmail', e.target.value)}
                            className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white font-medium"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Section 2: Inventors and Origin of Invention */}
                    <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 space-y-3">
                      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                        <h4 className="font-bold text-slate-900 uppercase text-[11px] tracking-wider flex items-center gap-1.5">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                          <span>2. Inventor(s) and Origin in India (Section 39 Condition)</span>
                        </h4>
                        <button
                          type="button"
                          onClick={() => addArrayItem('ipoForm25', 'inventors', {
                            name: 'Co-Inventor Name',
                            nationality: 'Indian',
                            address: 'City, State, India',
                          })}
                          className="flex items-center gap-1 px-2 py-1 text-[10px] font-bold bg-emerald-700 hover:bg-emerald-800 text-white rounded-md cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Add Inventor</span>
                        </button>
                      </div>

                      {Array.isArray(currentForm.fields?.inventors) && currentForm.fields.inventors.map((inv, idx) => (
                        <div key={idx} className="p-2.5 bg-white rounded-lg border border-slate-200 grid grid-cols-1 sm:grid-cols-4 gap-2 text-xs items-end">
                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase">Inventor Name</label>
                            <input
                              type="text"
                              value={inv.name || ''}
                              onChange={(e) => updateArrayItem('ipoForm25', 'inventors', idx, { name: e.target.value })}
                              className="w-full text-xs p-1.5 rounded border border-slate-300 bg-white font-medium"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase">Nationality</label>
                            <input
                              type="text"
                              value={inv.nationality || 'Indian'}
                              onChange={(e) => updateArrayItem('ipoForm25', 'inventors', idx, { nationality: e.target.value })}
                              className="w-full text-xs p-1.5 rounded border border-slate-300 bg-white font-medium"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase">Residential Address</label>
                            <input
                              type="text"
                              value={inv.address || ''}
                              onChange={(e) => updateArrayItem('ipoForm25', 'inventors', idx, { address: e.target.value })}
                              className="w-full text-xs p-1.5 rounded border border-slate-300 bg-white font-medium"
                            />
                          </div>
                          <div className="flex justify-end">
                            {currentForm.fields.inventors.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeArrayItem('ipoForm25', 'inventors', idx)}
                                className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg cursor-pointer"
                                title="Remove inventor"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Section 3: Invention & Technical Disclosure */}
                    <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 space-y-3">
                      <h4 className="font-bold text-slate-900 uppercase text-[11px] tracking-wider border-b border-slate-200 pb-2 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
                        <span>3. Technical Disclosure &amp; Biological Material Origin</span>
                      </h4>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Title of the Invention</label>
                        <input
                          type="text"
                          value={currentForm.fields?.inventionTitle || ''}
                          onChange={(e) => updateFormField('ipoForm25', 'inventionTitle', e.target.value)}
                          className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white font-medium"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Biological Resources Utilized (Species &amp; Origin)</label>
                        <input
                          type="text"
                          value={currentForm.fields?.biologicalMaterialUsed || ''}
                          onChange={(e) => updateFormField('ipoForm25', 'biologicalMaterialUsed', e.target.value)}
                          className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white font-medium"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Source &amp; Geographical Origin in India</label>
                        <input
                          type="text"
                          value={currentForm.fields?.sourceAndOriginOfMaterial || ''}
                          onChange={(e) => updateFormField('ipoForm25', 'sourceAndOriginOfMaterial', e.target.value)}
                          className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white font-medium"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Brief Description of the Invention</label>
                        <textarea
                          rows={3}
                          value={currentForm.fields?.briefDescriptionOfInvention || ''}
                          onChange={(e) => updateFormField('ipoForm25', 'briefDescriptionOfInvention', e.target.value)}
                          className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white font-medium leading-relaxed"
                        />
                      </div>
                    </div>

                    {/* Section 4: Target Countries & Filing Status */}
                    <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 space-y-3">
                      <h4 className="font-bold text-slate-900 uppercase text-[11px] tracking-wider border-b border-slate-200 pb-2 flex items-center gap-1.5">
                        <Globe2 className="w-3.5 h-3.5 text-emerald-700" />
                        <span>4. Target Foreign Countries &amp; Indian Filing Status</span>
                      </h4>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Target Jurisdictions / Offices</label>
                          <input
                            type="text"
                            value={Array.isArray(currentForm.fields?.proposedCountries) ? currentForm.fields.proposedCountries.join('; ') : (currentForm.fields?.proposedCountries || '')}
                            onChange={(e) => updateFormField('ipoForm25', 'proposedCountries', e.target.value.split('; '))}
                            className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white font-medium"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Has Indian Application Been Filed?</label>
                          <input
                            type="text"
                            value={currentForm.fields?.hasIndianPriorityFiled || ''}
                            onChange={(e) => updateFormField('ipoForm25', 'hasIndianPriorityFiled', e.target.value)}
                            className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white font-medium"
                          />
                        </div>

                        <div className="sm:col-span-2">
                          <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Reasons for Making Application Outside India</label>
                          <textarea
                            rows={2}
                            value={currentForm.fields?.reasonsForForeignFiling || ''}
                            onChange={(e) => updateFormField('ipoForm25', 'reasonsForForeignFiling', e.target.value)}
                            className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white font-medium"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Section 5: Statutory Fee Details (First Schedule Entry 35) */}
                    <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 space-y-3">
                      <h4 className="font-bold text-slate-900 uppercase text-[11px] tracking-wider border-b border-slate-200 pb-2 flex items-center gap-1.5">
                        <Landmark className="w-3.5 h-3.5 text-emerald-700" />
                        <span>5. Official Statutory Fee Details (First Schedule - Entry 35)</span>
                      </h4>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Fee Category</label>
                          <select
                            value={currentForm.fields?.statutoryFeeDetails?.feeAmount === '₹8,000' ? 'large' : 'small'}
                            onChange={(e) => {
                              const isLarge = e.target.value === 'large';
                              updateNestedFormField('ipoForm25', 'statutoryFeeDetails', 'feeAmount', isLarge ? '₹8,000' : '₹1,600');
                              updateNestedFormField('ipoForm25', 'statutoryFeeDetails', 'feeCategory', isLarge ? 'Others / Large Entity (₹8,000)' : 'Natural Person / Startup / Small Entity (₹1,600)');
                            }}
                            className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white font-medium cursor-pointer"
                          >
                            <option value="small">Natural Person / Startup / Small Entity (₹1,600)</option>
                            <option value="large">Large Entity / Others (₹8,000)</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Amount Paid</label>
                          <input
                            type="text"
                            value={currentForm.fields?.statutoryFeeDetails?.feeAmount || '₹1,600'}
                            readOnly
                            className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-slate-100 font-bold text-emerald-800"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">CBR / E-Filing Ref No.</label>
                          <input
                            type="text"
                            value={currentForm.fields?.statutoryFeeDetails?.cbrReference || 'CBR-IPO-2024-DEL-89211'}
                            onChange={(e) => updateNestedFormField('ipoForm25', 'statutoryFeeDetails', 'cbrReference', e.target.value)}
                            className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white font-medium"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Section 6: Registered Patent Agent */}
                    <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 space-y-2">
                      <h4 className="font-bold text-slate-900 uppercase text-[11px] tracking-wider border-b border-slate-200 pb-2">
                        6. Registered Patent Agent / Authorized Representative
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Patent Agent Name</label>
                          <input
                            type="text"
                            value={currentForm.fields?.patentAgentDetails?.name || 'Rajesh V. Nambiar'}
                            onChange={(e) => updateNestedFormField('ipoForm25', 'patentAgentDetails', 'name', e.target.value)}
                            className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white font-medium"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Registration No. (IN/PA)</label>
                          <input
                            type="text"
                            value={currentForm.fields?.patentAgentDetails?.registrationNumber || 'IN/PA-2849'}
                            onChange={(e) => updateNestedFormField('ipoForm25', 'patentAgentDetails', 'registrationNumber', e.target.value)}
                            className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white font-medium"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Section 7: Penal Warning & Statutory Declaration */}
                    <div className="border-2 border-amber-300 rounded-xl p-4 bg-amber-50/40 space-y-3">
                      <h4 className="font-bold text-amber-950 uppercase text-[11px] tracking-wider border-b border-amber-200 pb-1 flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-800" />
                        <span>7. Statutory Declaration &amp; Section 118 Penal Acknowledgment</span>
                      </h4>
                      <div>
                        <label className="block text-[10px] font-bold text-amber-900 uppercase mb-1">Declaration Text</label>
                        <textarea
                          rows={2}
                          value={currentForm.fields?.statutoryDeclaration || ''}
                          onChange={(e) => updateFormField('ipoForm25', 'statutoryDeclaration', e.target.value)}
                          className="w-full text-xs p-2 rounded-lg border border-amber-300 bg-white font-medium"
                        />
                      </div>

                      {/* Interactive Place, Date & Signatory Inputs */}
                      <div className="pt-2 border-t border-amber-200 grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <div>
                            <label className="block text-[10px] font-bold text-slate-600 uppercase mb-0.5">Place of Execution</label>
                            <input
                              type="text"
                              value={currentForm.fields?.place || 'New Delhi'}
                              onChange={(e) => updateFormField('ipoForm25', 'place', e.target.value)}
                              className="w-full text-xs p-1.5 rounded border border-slate-300 bg-white font-medium"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-slate-600 uppercase mb-0.5">Date of Filing</label>
                            <input
                              type="text"
                              value={currentForm.fields?.date || ''}
                              onChange={(e) => updateFormField('ipoForm25', 'date', e.target.value)}
                              className="w-full text-xs p-1.5 rounded border border-slate-300 bg-white font-medium"
                            />
                          </div>
                        </div>

                        <div className="space-y-2 bg-white/80 p-3 rounded-lg border border-amber-200">
                          <div>
                            <label className="block text-[10px] font-bold text-emerald-900 uppercase mb-0.5">
                              Authorized Signatory Name
                            </label>
                            <input
                              type="text"
                              value={currentForm.fields?.signatory || ''}
                              onChange={(e) => updateFormField('ipoForm25', 'signatory', e.target.value)}
                              placeholder="Name of Signatory"
                              className="w-full text-xs p-1.5 rounded border border-emerald-300 bg-white font-bold text-slate-900"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-slate-600 uppercase mb-0.5">Capacity / Designation</label>
                            <input
                              type="text"
                              value={currentForm.fields?.signatoryDesignation || 'Applicant / Registered Patent Agent'}
                              onChange={(e) => updateFormField('ipoForm25', 'signatoryDesignation', e.target.value)}
                              className="w-full text-xs p-1.5 rounded border border-slate-300 bg-white font-medium"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. NBA FORM I VIEW */}
                {activeTab === 'NBA_FORM_1' && (
                  <div className="space-y-5 text-xs">
                    {/* Section 1: Applicant & Section 3(2) Categorization */}
                    <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 space-y-3">
                      <h4 className="font-bold text-slate-900 uppercase text-[11px] tracking-wider border-b border-slate-200 pb-2 flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-emerald-700" />
                        <span>1. Applicant Particulars &amp; Section 3(2) Categorization</span>
                      </h4>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Applicant Name</label>
                          <input
                            type="text"
                            value={currentForm.fields?.applicantName || ''}
                            onChange={(e) => updateFormField('nbaForm1', 'applicantName', e.target.value)}
                            className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white font-medium"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Legal Status</label>
                          <input
                            type="text"
                            value={currentForm.fields?.legalStatus || ''}
                            onChange={(e) => updateFormField('nbaForm1', 'legalStatus', e.target.value)}
                            className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white font-medium"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Registered Address</label>
                          <input
                            type="text"
                            value={currentForm.fields?.registeredAddress || currentForm.fields?.applicantAddress || ''}
                            onChange={(e) => updateFormField('nbaForm1', 'registeredAddress', e.target.value)}
                            className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white font-medium"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Authorized Contact</label>
                          <input
                            type="text"
                            value={currentForm.fields?.authorizedContact || ''}
                            onChange={(e) => updateFormField('nbaForm1', 'authorizedContact', e.target.value)}
                            className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white font-medium"
                          />
                        </div>
                        <div className="sm:col-span-2">
                          <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Section 3(2) Eligibility Categorization</label>
                          <input
                            type="text"
                            value={currentForm.fields?.section3Categorization || ''}
                            onChange={(e) => updateFormField('nbaForm1', 'section3Categorization', e.target.value)}
                            className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white font-medium"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Section 2: Biological Resources Table (Editable) */}
                    <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 space-y-3">
                      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                        <h4 className="font-bold text-slate-900 uppercase text-[11px] tracking-wider flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
                          <span>2. Schedule of Biological Resources Accessed</span>
                        </h4>
                        <button
                          type="button"
                          onClick={() => addArrayItem('nbaForm1', 'biologicalResources', {
                            commonName: 'New Botanical',
                            scientificName: 'Botanical species',
                            family: 'Family',
                            partAccessed: 'Leaves / Roots',
                            natureOfResource: 'Cultivated',
                            estimatedAnnualQuantum: '100 Kilograms',
                            collectionState: 'Rajasthan',
                            collectionDistrict: 'District',
                            localBmcJurisdiction: 'State SBB & Local BMC',
                          })}
                          className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg transition-colors cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Add Resource</span>
                        </button>
                      </div>

                      <div className="overflow-x-auto border border-slate-200 rounded-lg bg-white">
                        <table className="w-full text-[11px] text-left">
                          <thead className="bg-sage-100 text-slate-800 font-bold border-b border-slate-200">
                            <tr>
                              <th className="p-2">Common Name</th>
                              <th className="p-2">Botanical Name &amp; Family</th>
                              <th className="p-2">Part Used</th>
                              <th className="p-2">Nature</th>
                              <th className="p-2">Annual Quantum</th>
                              <th className="p-2">State &amp; District</th>
                              <th className="p-2 text-center">Action</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {Array.isArray(currentForm.fields?.biologicalResources) && currentForm.fields.biologicalResources.map((b, idx) => (
                              <tr key={idx} className="hover:bg-sage-50/50">
                                <td className="p-2">
                                  <input
                                    type="text"
                                    value={b.commonName || ''}
                                    onChange={(e) => updateArrayItem('nbaForm1', 'biologicalResources', idx, { commonName: e.target.value })}
                                    className="w-24 text-[11px] p-1 border rounded bg-white"
                                  />
                                </td>
                                <td className="p-2">
                                  <input
                                    type="text"
                                    value={b.scientificName || ''}
                                    onChange={(e) => updateArrayItem('nbaForm1', 'biologicalResources', idx, { scientificName: e.target.value })}
                                    className="w-36 text-[11px] p-1 border rounded bg-white italic"
                                  />
                                </td>
                                <td className="p-2">
                                  <input
                                    type="text"
                                    value={b.partAccessed || ''}
                                    onChange={(e) => updateArrayItem('nbaForm1', 'biologicalResources', idx, { partAccessed: e.target.value })}
                                    className="w-24 text-[11px] p-1 border rounded bg-white"
                                  />
                                </td>
                                <td className="p-2">
                                  <select
                                    value={b.natureOfResource?.includes('Cultivated') ? 'Cultivated' : 'Wild'}
                                    onChange={(e) => updateArrayItem('nbaForm1', 'biologicalResources', idx, { natureOfResource: e.target.value === 'Cultivated' ? 'Cultivated Botanical' : 'Responsibly Wild-Harvested' })}
                                    className="text-[11px] p-1 border rounded bg-white cursor-pointer"
                                  >
                                    <option value="Cultivated">Cultivated</option>
                                    <option value="Wild">Wild Harvested</option>
                                  </select>
                                </td>
                                <td className="p-2">
                                  <input
                                    type="text"
                                    value={b.estimatedAnnualQuantum || ''}
                                    onChange={(e) => updateArrayItem('nbaForm1', 'biologicalResources', idx, { estimatedAnnualQuantum: e.target.value })}
                                    className="w-24 text-[11px] p-1 border rounded bg-white"
                                  />
                                </td>
                                <td className="p-2">
                                  <input
                                    type="text"
                                    value={b.collectionState || ''}
                                    onChange={(e) => updateArrayItem('nbaForm1', 'biologicalResources', idx, { collectionState: e.target.value })}
                                    className="w-32 text-[11px] p-1 border rounded bg-white"
                                  />
                                </td>
                                <td className="p-2 text-center">
                                  <button
                                    type="button"
                                    onClick={() => removeArrayItem('nbaForm1', 'biologicalResources', idx)}
                                    className="text-red-500 hover:text-red-700 p-1 cursor-pointer"
                                    title="Delete resource"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Section 3: Associated Traditional Knowledge & Purpose */}
                    <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 space-y-3">
                      <h4 className="font-bold text-slate-900 uppercase text-[11px] tracking-wider border-b border-slate-200 pb-2">
                        3. Associated Traditional Knowledge &amp; Commercial Purpose
                      </h4>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Classical Codified Treatises / TK Source</label>
                          <input
                            type="text"
                            value={currentForm.fields?.sourceOfAssociatedTK || ''}
                            onChange={(e) => updateFormField('nbaForm1', 'sourceOfAssociatedTK', e.target.value)}
                            className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white font-medium"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">TK Holders / Community Title</label>
                          <input
                            type="text"
                            value={currentForm.fields?.tkHoldersDetails || ''}
                            onChange={(e) => updateFormField('nbaForm1', 'tkHoldersDetails', e.target.value)}
                            className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white font-medium"
                          />
                        </div>
                        <div className="sm:col-span-2">
                          <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Purpose of Commercial Access</label>
                          <textarea
                            rows={2}
                            value={currentForm.fields?.purposeOfAccess || ''}
                            onChange={(e) => updateFormField('nbaForm1', 'purposeOfAccess', e.target.value)}
                            className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white font-medium"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Section 4: ABS Framework (2024 Amendment Rules) */}
                    <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 space-y-3">
                      <h4 className="font-bold text-slate-900 uppercase text-[11px] tracking-wider border-b border-slate-200 pb-2 flex items-center gap-1.5">
                        <Landmark className="w-3.5 h-3.5 text-emerald-700" />
                        <span>4. Access &amp; Benefit Sharing (ABS) Model (2024 Gazette Regulations)</span>
                      </h4>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Annual Turnover Bracket &amp; Rate</label>
                          <select
                            value={currentForm.fields?.absTurnoverTier?.includes('0.1%') ? '0.1' : (currentForm.fields?.absTurnoverTier?.includes('0.5%') ? '0.5' : '0.2')}
                            onChange={(e) => {
                              const val = e.target.value;
                              const tierText = val === '0.1' 
                                ? 'Bracket 1 (Up to ₹1.00 Crore): 0.1% of Gross Ex-Factory Net Annual Turnover'
                                : (val === '0.5' 
                                    ? 'Bracket 3 (Exceeding ₹50.00 Crore): 0.5% of Gross Ex-Factory Net Annual Turnover'
                                    : 'Bracket 2 (₹1.00 Crore to ₹50.00 Crore): 0.2% of Gross Ex-Factory Net Annual Turnover');
                              updateFormField('nbaForm1', 'absTurnoverTier', tierText);
                              updateFormField('nbaForm1', 'proposedBenefitSharingModel', `${val}% of Ex-Factory Annual Net Sales Value payable to the National Biodiversity Authority Fund in compliance with the Biological Diversity (Amendment) Rules 2024.`);
                            }}
                            className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white font-medium cursor-pointer"
                          >
                            <option value="0.1">Bracket 1 (Up to ₹1.00 Crore): 0.1% of Ex-Factory Turnover</option>
                            <option value="0.2">Bracket 2 (₹1.00 Cr to ₹50.00 Cr): 0.2% of Ex-Factory Turnover</option>
                            <option value="0.5">Bracket 3 (Above ₹50.00 Crore): 0.5% of Ex-Factory Turnover</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Statutory Application Fee (Rule 14(2))</label>
                          <input
                            type="text"
                            value={currentForm.fields?.statutoryApplicationFee || '₹10,000 via Bharatkosh / NBA E-Portal'}
                            onChange={(e) => updateFormField('nbaForm1', 'statutoryApplicationFee', e.target.value)}
                            className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white font-medium"
                          />
                        </div>

                        <div className="sm:col-span-2">
                          <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Benefit Sharing Commitment Statement</label>
                          <textarea
                            rows={2}
                            value={currentForm.fields?.proposedBenefitSharingModel || ''}
                            onChange={(e) => updateFormField('nbaForm1', 'proposedBenefitSharingModel', e.target.value)}
                            className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white font-medium"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Section 5: Sustainability Undertaking & Signature */}
                    <div className="border border-slate-200 rounded-xl p-4 bg-emerald-50/40 space-y-3">
                      <h4 className="font-bold text-emerald-950 uppercase text-[11px] tracking-wider border-b border-emerald-200 pb-1">
                        5. Self-Declaration &amp; Ecological Sustainability Undertaking
                      </h4>
                      <div>
                        <label className="block text-[10px] font-bold text-emerald-900 uppercase mb-1">Undertaking Statement</label>
                        <textarea
                          rows={2}
                          value={currentForm.fields?.sustainabilityUndertaking || ''}
                          onChange={(e) => updateFormField('nbaForm1', 'sustainabilityUndertaking', e.target.value)}
                          className="w-full text-xs p-2 rounded-lg border border-emerald-300 bg-white font-medium"
                        />
                      </div>

                      {/* Interactive Place, Date & Signatory Inputs */}
                      <div className="pt-2 border-t border-emerald-200 grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <div>
                            <label className="block text-[10px] font-bold text-slate-600 uppercase mb-0.5">Place of Application</label>
                            <input
                              type="text"
                              value={currentForm.fields?.place || 'Gandhinagar, Gujarat'}
                              onChange={(e) => updateFormField('nbaForm1', 'place', e.target.value)}
                              className="w-full text-xs p-1.5 rounded border border-slate-300 bg-white font-medium"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-slate-600 uppercase mb-0.5">Date</label>
                            <input
                              type="text"
                              value={currentForm.fields?.date || ''}
                              onChange={(e) => updateFormField('nbaForm1', 'date', e.target.value)}
                              className="w-full text-xs p-1.5 rounded border border-slate-300 bg-white font-medium"
                            />
                          </div>
                        </div>

                        <div className="space-y-2 bg-white/80 p-3 rounded-lg border border-emerald-200">
                          <div>
                            <label className="block text-[10px] font-bold text-emerald-900 uppercase mb-0.5">
                              Authorized Signatory Name
                            </label>
                            <input
                              type="text"
                              value={currentForm.fields?.signatory || ''}
                              onChange={(e) => updateFormField('nbaForm1', 'signatory', e.target.value)}
                              placeholder="Name of Signatory"
                              className="w-full text-xs p-1.5 rounded border border-emerald-300 bg-white font-bold text-slate-900"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-slate-600 uppercase mb-0.5">Designation</label>
                            <input
                              type="text"
                              value={currentForm.fields?.signatoryDesignation || 'Authorized Signatory / Declarant'}
                              onChange={(e) => updateFormField('nbaForm1', 'signatoryDesignation', e.target.value)}
                              className="w-full text-xs p-1.5 rounded border border-slate-300 bg-white font-medium"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. NBA FORM III VIEW */}
                {activeTab === 'NBA_FORM_3' && (
                  <div className="space-y-5 text-xs">
                    {/* Section 1: Applicant Particulars */}
                    <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 space-y-3">
                      <h4 className="font-bold text-slate-900 uppercase text-[11px] tracking-wider border-b border-slate-200 pb-2 flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-emerald-700" />
                        <span>1. Particulars of Applicant &amp; Category of IPR</span>
                      </h4>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Applicant Name</label>
                          <input
                            type="text"
                            value={currentForm.fields?.applicantName || ''}
                            onChange={(e) => updateFormField('nbaForm3', 'applicantName', e.target.value)}
                            className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white font-medium"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Category of IPR</label>
                          <input
                            type="text"
                            value={currentForm.fields?.iprCategory || 'Patent'}
                            onChange={(e) => updateFormField('nbaForm3', 'iprCategory', e.target.value)}
                            className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white font-medium"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Statutory Fee (Rule 18(2))</label>
                          <input
                            type="text"
                            value={currentForm.fields?.statutoryApplicationFee || '₹5,000'}
                            onChange={(e) => updateFormField('nbaForm3', 'statutoryApplicationFee', e.target.value)}
                            className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white font-medium"
                          />
                        </div>
                        <div className="sm:col-span-3">
                          <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Title of Invention</label>
                          <input
                            type="text"
                            value={currentForm.fields?.titleOfInvention || ''}
                            onChange={(e) => updateFormField('nbaForm3', 'titleOfInvention', e.target.value)}
                            className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white font-medium"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Section 2: Patent Application Status (Section 6(1) Mandate) */}
                    <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 space-y-3">
                      <h4 className="font-bold text-slate-900 uppercase text-[11px] tracking-wider border-b border-slate-200 pb-2 flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-emerald-700" />
                        <span>2. Status of Patent Application (Section 6(1) Compliance)</span>
                      </h4>

                      <div className="space-y-3">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Timing of Application</label>
                          <input
                            type="text"
                            value={currentForm.fields?.filingTimingStatus || ''}
                            onChange={(e) => updateFormField('nbaForm3', 'filingTimingStatus', e.target.value)}
                            className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white font-medium"
                          />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div>
                            <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Indian Patent App. No.</label>
                            <input
                              type="text"
                              value={currentForm.fields?.indianPatentAppNumber || ''}
                              onChange={(e) => updateFormField('nbaForm3', 'indianPatentAppNumber', e.target.value)}
                              className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white font-medium"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Date of Filing</label>
                            <input
                              type="text"
                              value={currentForm.fields?.indianFilingDate || ''}
                              onChange={(e) => updateFormField('nbaForm3', 'indianFilingDate', e.target.value)}
                              className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white font-medium"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Patent Office Branch</label>
                            <input
                              type="text"
                              value={currentForm.fields?.patentOffice || ''}
                              onChange={(e) => updateFormField('nbaForm3', 'patentOffice', e.target.value)}
                              className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white font-medium"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Section 3: Biological Resource Claim Dependency */}
                    <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 space-y-3">
                      <h4 className="font-bold text-slate-900 uppercase text-[11px] tracking-wider border-b border-slate-200 pb-2 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
                        <span>3. Biological Resources &amp; Claim Dependencies</span>
                      </h4>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Biological Resources Utilized</label>
                        <input
                          type="text"
                          value={currentForm.fields?.biologicalResourcesUtilized || ''}
                          onChange={(e) => updateFormField('nbaForm3', 'biologicalResourcesUtilized', e.target.value)}
                          className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white font-medium"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Geographical Source of Biological Resources</label>
                        <input
                          type="text"
                          value={currentForm.fields?.sourceAndGeographicalOrigin || ''}
                          onChange={(e) => updateFormField('nbaForm3', 'sourceAndGeographicalOrigin', e.target.value)}
                          className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white font-medium"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Specific Patent Claims Depending on Biological Resource</label>
                        <textarea
                          rows={2}
                          value={currentForm.fields?.claimsDependency || ''}
                          onChange={(e) => updateFormField('nbaForm3', 'claimsDependency', e.target.value)}
                          className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white font-medium leading-relaxed"
                        />
                      </div>
                    </div>

                    {/* Section 4: Commercialization and ABS Undertaking */}
                    <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 space-y-3">
                      <h4 className="font-bold text-slate-900 uppercase text-[11px] tracking-wider border-b border-slate-200 pb-2 flex items-center gap-1.5">
                        <Globe2 className="w-3.5 h-3.5 text-emerald-700" />
                        <span>4. Commercialization &amp; Benefit-Sharing Agreement Undertaking</span>
                      </h4>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Territorial Extent of Protection</label>
                          <input
                            type="text"
                            value={currentForm.fields?.territorialJurisdictionsPlanned || ''}
                            onChange={(e) => updateFormField('nbaForm3', 'territorialJurisdictionsPlanned', e.target.value)}
                            className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white font-medium"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Proposed Benefit-Sharing Mode</label>
                          <input
                            type="text"
                            value={currentForm.fields?.proposedBenefitSharingMode || ''}
                            onChange={(e) => updateFormField('nbaForm3', 'proposedBenefitSharingMode', e.target.value)}
                            className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white font-medium"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Section 5: Statutory Affirmation */}
                    <div className="border border-slate-200 rounded-xl p-4 bg-emerald-50/40 space-y-3">
                      <h4 className="font-bold text-emerald-950 uppercase text-[11px] tracking-wider border-b border-emerald-200 pb-1">
                        5. Statutory Affirmation under Section 6(1)
                      </h4>
                      <div>
                        <label className="block text-[10px] font-bold text-emerald-900 uppercase mb-1">Affirmation Statement</label>
                        <textarea
                          rows={2}
                          value={currentForm.fields?.statutoryAffirmation || ''}
                          onChange={(e) => updateFormField('nbaForm3', 'statutoryAffirmation', e.target.value)}
                          className="w-full text-xs p-2 rounded-lg border border-emerald-300 bg-white font-medium"
                        />
                      </div>

                      {/* Interactive Place, Date & Signatory Inputs */}
                      <div className="pt-2 border-t border-emerald-200 grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <div>
                            <label className="block text-[10px] font-bold text-slate-600 uppercase mb-0.5">Place</label>
                            <input
                              type="text"
                              value={currentForm.fields?.place || 'New Delhi'}
                              onChange={(e) => updateFormField('nbaForm3', 'place', e.target.value)}
                              className="w-full text-xs p-1.5 rounded border border-slate-300 bg-white font-medium"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-slate-600 uppercase mb-0.5">Date</label>
                            <input
                              type="text"
                              value={currentForm.fields?.date || ''}
                              onChange={(e) => updateFormField('nbaForm3', 'date', e.target.value)}
                              className="w-full text-xs p-1.5 rounded border border-slate-300 bg-white font-medium"
                            />
                          </div>
                        </div>

                        <div className="space-y-2 bg-white/80 p-3 rounded-lg border border-emerald-200">
                          <div>
                            <label className="block text-[10px] font-bold text-emerald-900 uppercase mb-0.5">
                              Authorized Signatory Name
                            </label>
                            <input
                              type="text"
                              value={currentForm.fields?.signatory || ''}
                              onChange={(e) => updateFormField('nbaForm3', 'signatory', e.target.value)}
                              placeholder="Name of Signatory"
                              className="w-full text-xs p-1.5 rounded border border-emerald-300 bg-white font-bold text-slate-900"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-slate-600 uppercase mb-0.5">Capacity</label>
                            <input
                              type="text"
                              value={currentForm.fields?.signatoryDesignation || 'Applicant / Authorized Representative'}
                              onChange={(e) => updateFormField('nbaForm3', 'signatoryDesignation', e.target.value)}
                              className="w-full text-xs p-1.5 rounded border border-slate-300 bg-white font-medium"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 4. WIPO GRATK ART. 3 SDS VIEW (INTERNATIONAL PART) */}
                {activeTab === 'WIPO_GRATK_SDS' && (
                  <div className="space-y-5 text-xs">
                    {showRawWipoText ? (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="block text-[10px] font-bold text-indigo-900 uppercase">
                            Verbatim PCT Request Box No. VIII / Treaty Disclosure Instrument (Editable Text)
                          </label>
                          <span className="text-[10px] text-slate-500 font-medium">Edits here reflect directly in export &amp; download</span>
                        </div>
                        <textarea
                          rows={18}
                          value={currentForm.standardizedText || ''}
                          onChange={(e) => updateFormField('wipoGratkSDS', 'standardizedText', e.target.value)}
                          className="w-full text-xs p-3 font-mono leading-relaxed border border-slate-300 rounded-xl bg-slate-50 text-slate-900 focus:bg-white focus:outline-none focus:border-indigo-600"
                        />
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {/* Part I: Applicant & Genetic Resources Trigger */}
                        <div className="border border-indigo-200 rounded-xl p-4 bg-indigo-50/30 space-y-3">
                          <div className="flex items-center justify-between border-b border-indigo-200 pb-2">
                            <h4 className="font-bold text-indigo-950 uppercase text-[11px] tracking-wider flex items-center gap-1.5">
                              <Sparkles className="w-3.5 h-3.5 text-indigo-700" />
                              <span>Part I: Applicant Particulars &amp; Mandatory Genetic Resources (GR) Disclosure (Article 3.1)</span>
                            </h4>
                            <span className="text-[10px] font-bold bg-indigo-200 text-indigo-900 px-2 py-0.5 rounded">
                              Trigger: Materially Based on GR
                            </span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Applicant Name (Patent Applicant)</label>
                              <input
                                type="text"
                                value={currentForm.fields?.applicantName || ''}
                                onChange={(e) => updateWipoField('applicantName', e.target.value)}
                                className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white font-medium"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Registered Address</label>
                              <input
                                type="text"
                                value={currentForm.fields?.applicantAddress || ''}
                                onChange={(e) => updateWipoField('applicantAddress', e.target.value)}
                                className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white font-medium"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Country of Origin (Article 3.1(a))</label>
                              <input
                                type="text"
                                value={currentForm.fields?.countryOfOrigin || 'Republic of India'}
                                onChange={(e) => updateWipoField('countryOfOrigin', e.target.value)}
                                className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white font-bold text-slate-900"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Sovereign Source Authority (Article 3.1(b))</label>
                              <input
                                type="text"
                                value={currentForm.fields?.sourceOfGeneticResources || ''}
                                onChange={(e) => updateWipoField('sourceOfGeneticResources', e.target.value)}
                                className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white font-medium"
                              />
                            </div>
                            <div className="sm:col-span-2">
                              <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Biological &amp; Genetic Material Specification</label>
                              <input
                                type="text"
                                value={currentForm.fields?.geneticResourcesDisclosed || ''}
                                onChange={(e) => updateWipoField('geneticResourcesDisclosed', e.target.value)}
                                className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white font-medium"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Part II: Associated Traditional Knowledge Trigger */}
                        <div className="border border-indigo-200 rounded-xl p-4 bg-indigo-50/30 space-y-3">
                          <div className="flex items-center justify-between border-b border-indigo-200 pb-2">
                            <h4 className="font-bold text-indigo-950 uppercase text-[11px] tracking-wider flex items-center gap-1.5">
                              <Globe2 className="w-3.5 h-3.5 text-indigo-700" />
                              <span>Part II: Mandatory Associated Traditional Knowledge (ATK) Disclosure (Article 3.2)</span>
                            </h4>
                            <span className="text-[10px] font-bold bg-indigo-200 text-indigo-900 px-2 py-0.5 rounded">
                              Trigger: Materially Based on ATK
                            </span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Classical Source Treatises</label>
                              <input
                                type="text"
                                value={currentForm.fields?.traditionalKnowledgeSource || ''}
                                onChange={(e) => updateWipoField('traditionalKnowledgeSource', e.target.value)}
                                className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white font-medium"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">TKDL Accession Reference Identifier</label>
                              <input
                                type="text"
                                value={currentForm.fields?.tkdlAccessId || 'TKDL-AY-2024/EXP-INDIA'}
                                onChange={(e) => updateWipoField('tkdlAccessId', e.target.value)}
                                className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white font-bold text-indigo-900"
                              />
                            </div>
                            <div className="sm:col-span-2">
                              <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Indigenous Peoples / Community Status</label>
                              <input
                                type="text"
                                value={currentForm.fields?.indigenousCommunityDetails || ''}
                                onChange={(e) => updateWipoField('indigenousCommunityDetails', e.target.value)}
                                className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white font-medium"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Part III: Target Offices & Patent Attorney */}
                        <div className="border border-indigo-200 rounded-xl p-4 bg-indigo-50/30 space-y-3">
                          <h4 className="font-bold text-indigo-950 uppercase text-[11px] tracking-wider border-b border-indigo-200 pb-2 flex items-center gap-1.5">
                            <Building2 className="w-3.5 h-3.5 text-indigo-700" />
                            <span>Part III: Target Foreign Patent Offices &amp; Legal Representatives</span>
                          </h4>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Target Patent Offices / Jurisdictions</label>
                              <input
                                type="text"
                                value={currentForm.fields?.targetOffices || ''}
                                onChange={(e) => updateWipoField('targetOffices', e.target.value)}
                                className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white font-medium"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Registered Patent Agent / Attorney</label>
                              <input
                                type="text"
                                value={currentForm.fields?.patentAgentDetails || ''}
                                onChange={(e) => updateWipoField('patentAgentDetails', e.target.value)}
                                className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white font-medium"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Part IV: Safe-Harbors & Declarant Execution */}
                        <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 space-y-3">
                          <h4 className="font-bold text-slate-900 uppercase text-[11px] tracking-wider border-b border-slate-200 pb-2">
                            Part IV: Treaty Safe-Harbors &amp; Declarant Execution (Articles 4 &amp; 7)
                          </h4>

                          <div className="space-y-2 text-[11px] text-slate-700 bg-white p-3 rounded-lg border border-slate-200">
                            <p>
                              <strong>Article 4 (Non-Retroactivity):</strong> Non-retroactive application to any priority rights established prior to treaty entry into force.
                            </p>
                            <p>
                              <strong>Article 7 (Safe-Harbor Against Revocation):</strong> Granted patent validity cannot be revoked or invalidated on formal disclosure grounds absent established fraudulent intent.
                            </p>
                          </div>

                          {/* Interactive Place, Date & Signatory Inputs */}
                          <div className="pt-2 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="space-y-2">
                              <div>
                                <label className="block text-[10px] font-bold text-slate-600 uppercase mb-0.5">Place of Execution</label>
                                <input
                                  type="text"
                                  value={currentForm.fields?.place || 'New Delhi / Geneva'}
                                  onChange={(e) => updateWipoField('place', e.target.value)}
                                  className="w-full text-xs p-1.5 rounded border border-slate-300 bg-white font-medium"
                                />
                              </div>
                              <div>
                                <label className="block text-[10px] font-bold text-slate-600 uppercase mb-0.5">Date of Execution</label>
                                <input
                                  type="text"
                                  value={currentForm.fields?.date || ''}
                                  onChange={(e) => updateWipoField('date', e.target.value)}
                                  className="w-full text-xs p-1.5 rounded border border-slate-300 bg-white font-medium"
                                />
                              </div>
                            </div>

                            <div className="space-y-2 bg-white/80 p-3 rounded-lg border border-indigo-200">
                              <div>
                                <label className="block text-[10px] font-bold text-indigo-900 uppercase mb-0.5">
                                  Declarant / Authorized Signatory Name
                                </label>
                                <input
                                  type="text"
                                  value={currentForm.fields?.signatory || ''}
                                  onChange={(e) => updateWipoField('signatory', e.target.value)}
                                  placeholder="Signatory / Declarant Name"
                                  className="w-full text-xs p-1.5 rounded border border-indigo-300 bg-white font-bold text-slate-900"
                                />
                              </div>
                              <div>
                                <label className="block text-[10px] font-bold text-slate-600 uppercase mb-0.5">Declarant Capacity / Title</label>
                                <input
                                  type="text"
                                  value={currentForm.fields?.signatoryDesignation || 'Authorized Signatory / Declarant / Patent Attorney'}
                                  onChange={(e) => updateWipoField('signatoryDesignation', e.target.value)}
                                  className="w-full text-xs p-1.5 rounded border border-slate-300 bg-white font-medium"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

              </div>
            </div>
          ) : null}
        </div>

        {/* Action Footer */}
        <div className="bg-white border-t border-sage-200 px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-2 shrink-0">
          <div className="text-[11px] text-slate-500 hidden sm:block">
            Complies with Patents Act 1970 § 39, BD Act 2002 § 3 &amp; 6, and WIPO GRATK Treaty 2024.
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-sage-100 hover:bg-sage-200 text-slate-800 transition-all cursor-pointer"
              title="Copy formatted questionnaire to clipboard for e-filing portals"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied to Clipboard!' : 'Copy for Portal'}</span>
            </button>

            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-sage-100 hover:bg-sage-200 text-slate-800 transition-all cursor-pointer"
              title="Download formatted markdown file"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download .md</span>
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white shadow-sm transition-all cursor-pointer"
              title="Print or save as official A4 Government document"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save Official PDF</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
