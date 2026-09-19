import { formGeneratorService } from '../services/formGenerator.service.js';
import { historyService } from '../services/history.service.js';
import logger from '../config/logger.js';

export const formsController = {
  /**
   * Generates statutory compliance forms (IPO Form 25, NBA Form I/III, WIPO GRATK SDS)
   * 
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * @param {import('express').NextFunction} next
   */
  async generateForms(req, res, next) {
    const correlationId = req.id || 'forms-gen';
    const { sessionId, conversationText: explicitText, customInputs = {} } = req.body;

    try {
      let combinedText = explicitText || '';

      // If sessionId is provided, fetch previous chat messages to extract formulation context
      if (sessionId) {
        try {
          const messages = await historyService.getMessagesBySessionId(sessionId);
          if (messages && messages.length > 0) {
            const historySnippets = messages.map(m => m.content).join('\n\n');
            combinedText = `${historySnippets}\n\n${combinedText}`;
          }
        } catch (dbErr) {
          logger.warn({ correlationId, err: dbErr.message }, 'Could not retrieve session history for form generation, using explicit text');
        }
      }

      logger.info({ correlationId, textLength: combinedText.length }, 'Generating statutory compliance forms');

      const result = formGeneratorService.generateAllForms({
        conversationText: combinedText,
        userProfile: req.user || {},
        customInputs,
      });

      return res.status(200).json({
        success: true,
        correlationId,
        ...result,
      });
    } catch (err) {
      logger.error({ correlationId, err: err.message }, 'Failed to generate statutory filing forms');
      next(err);
    }
  },
};
