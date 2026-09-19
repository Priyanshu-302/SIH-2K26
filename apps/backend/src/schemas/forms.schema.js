import { z } from 'zod';

/**
 * Zod validation schema for POST /api/forms/generate
 */
export const generateFormsRequestSchema = z.object({
  body: z.object({
    sessionId: z.string().regex(/^[0-9a-fA-F]{24}$/, {
      message: 'Session ID must be a valid 24-character hexadecimal MongoDB ObjectId',
    }).optional(),
    conversationText: z.string().max(10000).optional(),
    customInputs: z.object({
      applicantName: z.string().max(200).optional(),
      legalStatus: z.string().max(200).optional(),
      address: z.string().max(500).optional(),
      email: z.string().email().optional(),
      signatory: z.string().max(200).optional(),
      inventionTitle: z.string().max(500).optional(),
      inventionDescription: z.string().max(3000).optional(),
      annualQuantum: z.string().max(100).optional(),
      benefitSharingTier: z.string().max(500).optional(),
      foreignFilingReason: z.string().max(1000).optional(),
      patentOfficeBranch: z.string().max(100).optional(),
      hasIndianPriority: z.string().max(200).optional(),
      indianAppNo: z.string().max(100).optional(),
      feeCategory: z.string().max(100).optional(),
      absTurnoverTier: z.string().max(100).optional(),
    }).passthrough().optional(),
  }),
});
