import { Router } from 'express';
import { formsController } from '../controllers/forms.controller.js';
import { validate } from '../middleware/validator.middleware.js';
import { generateFormsRequestSchema } from '../schemas/forms.schema.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = Router();

// Endpoint to generate statutory compliance forms
router.post(
  '/generate',
  authMiddleware,
  validate(generateFormsRequestSchema),
  formsController.generateForms
);

export default router;
