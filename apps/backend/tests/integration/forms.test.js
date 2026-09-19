import request from 'supertest';
import mongoose from 'mongoose';
import app from '../../src/app.js';
import { Session } from '../../src/models/session.model.js';
import { Message } from '../../src/models/message.model.js';
import config from '../../src/config/index.js';

describe('Forms API Integration Tests', () => {
  let testSessionId;

  beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(config.MONGODB_URI);
    }
  });

  afterAll(async () => {
    await Session.deleteMany({});
    await Message.deleteMany({});
    await mongoose.disconnect();
  });

  beforeEach(async () => {
    await Session.deleteMany({});
    await Message.deleteMany({});

    const session = new Session({ title: 'Ashwagandha Export Assessment Session' });
    await session.save();
    testSessionId = session._id.toString();

    // Seed messages
    const userMsg = new Message({
      sessionId: testSessionId,
      role: 'user',
      content: 'How can I export Withania somnifera (Ashwagandha) extract to the US under FDA DSHEA and file a PCT application complying with WIPO GRATK Treaty?',
    });
    await userMsg.save();

    const assistantMsg = new Message({
      sessionId: testSessionId,
      role: 'assistant',
      content: 'Under Article 3 of WIPO GRATK Treaty 2024, mandatory disclosure of India as Country of Origin and Charaka Samhita as TK source is required. Section 39 Foreign Filing Permission (Form 25) must be obtained.',
    });
    await assistantMsg.save();
  });

  describe('POST /api/forms/generate', () => {
    it('should generate all 4 statutory forms from conversation history via sessionId', async () => {
      const response = await request(app)
        .post('/api/forms/generate')
        .send({ sessionId: testSessionId });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.metadata).toBeDefined();
      expect(response.body.metadata.primaryBotanical).toBe('Ashwagandha');

      const { forms } = response.body;
      expect(forms).toBeDefined();

      // 1. IPO Form 25 Verification
      expect(forms.ipoForm25).toBeDefined();
      expect(forms.ipoForm25.formNumber).toBe('FORM 25');
      expect(forms.ipoForm25.sectionRule).toContain('Section 39');
      expect(forms.ipoForm25.fields.inventionTitle).toContain('Withania somnifera');
      expect(forms.ipoForm25.fields.statutoryDeclaration).toContain('Section 118');

      // 2. NBA Form I Verification
      expect(forms.nbaForm1).toBeDefined();
      expect(forms.nbaForm1.formNumber).toBe('FORM I');
      expect(forms.nbaForm1.sectionRule).toContain('Rule 14');
      expect(forms.nbaForm1.fields.biologicalResources.length).toBeGreaterThan(0);
      expect(forms.nbaForm1.fields.biologicalResources[0].scientificName).toBe('Withania somnifera');
      expect(forms.nbaForm1.fields.proposedBenefitSharingModel).toContain('Biological Diversity (Amendment) Rules 2024');

      // 3. NBA Form III Verification
      expect(forms.nbaForm3).toBeDefined();
      expect(forms.nbaForm3.formNumber).toBe('FORM III');
      expect(forms.nbaForm3.sectionRule).toContain('Section 6');
      expect(forms.nbaForm3.fields.statutoryAffirmation).toContain('Section 6(1)');

      // 4. WIPO GRATK SDS Verification
      expect(forms.wipoGratkSDS).toBeDefined();
      expect(forms.wipoGratkSDS.fields.countryOfOrigin).toBe('Republic of India');
      expect(forms.wipoGratkSDS.standardizedText).toContain('WIPO TREATY ON INTELLECTUAL PROPERTY');
      expect(forms.wipoGratkSDS.standardizedText).toContain('Article 3');
      expect(forms.wipoGratkSDS.standardizedText).toContain('Article 7');
    });

    it('should generate forms with explicit conversationText and custom user overrides', async () => {
      const response = await request(app)
        .post('/api/forms/generate')
        .send({
          conversationText: 'Formulation comprising Azadirachta indica (Neem) and Ocimum tenuiflorum (Tulsi) for synergistic antimicrobial protection.',
          customInputs: {
            applicantName: 'BioAyush Therapeutics LLP',
            address: 'Tech Park, Whitefield, Bengaluru, Karnataka - 560066',
            annualQuantum: '500 Kilograms (Leaves & Bark)',
            benefitSharingTier: '0.4% Ex-Factory Net Annual Turnover',
          }
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      
      const { forms } = response.body;
      expect(forms.ipoForm25.fields.applicantName).toBe('BioAyush Therapeutics LLP');
      expect(forms.ipoForm25.fields.applicantAddress).toContain('Bengaluru');
      expect(forms.nbaForm1.fields.applicantName).toBe('BioAyush Therapeutics LLP');
      expect(forms.nbaForm1.fields.biologicalResources.length).toBe(2);
      expect(forms.nbaForm1.fields.biologicalResources.some(b => b.commonName === 'Neem')).toBe(true);
      expect(forms.nbaForm1.fields.biologicalResources.some(b => b.commonName === 'Tulsi')).toBe(true);
      expect(forms.nbaForm1.fields.proposedBenefitSharingModel).toBe('0.4% Ex-Factory Net Annual Turnover');
    });
  });
});
