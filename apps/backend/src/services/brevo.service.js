import config from '../config/index.js';
import logger from '../config/logger.js';

export const brevoService = {
  /**
   * Sends an OTP verification email using Brevo Transactional Email API
   * 
   * @param {string} toEmail - Recipient email address
   * @param {string} otp - 6-digit numeric OTP code
   * @returns {Promise<{ success: boolean, messageId?: string, simulated?: boolean }>}
   */
  async sendOtpEmail(toEmail, otp) {
    const apiKey = config.BREVO_API_KEY;

    // Responsive HTML email template with Ayur-IP branding
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Ayur-IP Verification Code</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8faf9; margin: 0; padding: 0; }
          .wrapper { max-width: 540px; margin: 30px auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8e5; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.05); }
          .header { background: linear-gradient(135deg, #1b4332 0%, #2d6a4f 100%); padding: 36px 30px; text-align: center; color: #ffffff; }
          .header h1 { margin: 0 0 6px 0; font-size: 24px; font-weight: 700; letter-spacing: -0.5px; }
          .header p { margin: 0; font-size: 13px; color: #d8f3dc; }
          .content { padding: 36px 30px; text-align: center; color: #2d3748; }
          .content p { font-size: 15px; line-height: 1.6; margin: 0 0 24px 0; color: #4a5568; }
          .otp-card { background: #f0fdf4; border: 2px dashed #52b788; border-radius: 12px; padding: 20px; display: inline-block; margin-bottom: 24px; }
          .otp-code { font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #1b4332; font-family: monospace; }
          .expires { font-size: 12px; color: #718096; margin-top: 8px; }
          .security-note { font-size: 13px; color: #718096; line-height: 1.5; border-top: 1px solid #edf2f7; padding-top: 20px; margin-top: 10px; text-align: left; }
          .footer { background: #f8faf9; padding: 20px 30px; text-align: center; font-size: 11px; color: #a0aec0; border-top: 1px solid #e2e8e5; }
        </style>
      </head>
      <body>
        <div class="wrapper">
          <div class="header">
            <h1>⚖️ Ayur-IP Intelligence</h1>
            <p>Ayurveda Patent & Legal Prior Art Workspace</p>
          </div>
          <div class="content">
            <p>Hello,</p>
            <p>Use the single-use verification code below to securely sign in to your Ayur-IP legal research workspace.</p>
            <div class="otp-card">
              <div class="otp-code">${otp}</div>
              <div class="expires">⏱️ Valid for 5 minutes</div>
            </div>
            <div class="security-note">
              <strong>Security Notice:</strong> If you did not request this login code, please disregard this email. Never share this code with anyone.
            </div>
          </div>
          <div class="footer">
            &copy; ${new Date().getFullYear()} Ayur-IP Intelligence Platform. Department of Ayush & Indian Patent Office Prior Art Analysis.
          </div>
        </div>
      </body>
      </html>
    `;

    // Only fallback if no Brevo API key is provided at all
    if (!apiKey || apiKey === 'your_brevo_api_key_here') {
      logger.info(
        { email: toEmail, otp },
        '🔑 [BREVO DEMO]: No BREVO_API_KEY found in .env. Falling back to local demo mode.'
      );
      return { success: true, simulated: true };
    }

    // Call real Brevo API
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'api-key': apiKey.trim(),
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        sender: {
          name: config.BREVO_SENDER_NAME || 'Ayur-IP Intelligence',
          email: config.BREVO_SENDER_EMAIL,
        },
        to: [
          {
            email: toEmail,
          },
        ],
        subject: `${otp} is your Ayur-IP verification code`,
        htmlContent,
      }),
    });

    if (!response.ok) {
      let errorMessage = 'Brevo email dispatch failed';
      try {
        const errorJson = await response.json();
        errorMessage = errorJson.message || errorJson.error || errorMessage;
      } catch (e) {
        errorMessage = await response.text();
      }

      logger.error({ status: response.status, error: errorMessage }, 'Brevo API rejected email dispatch');
      throw new Error(`Brevo Error: ${errorMessage}`);
    }

    const data = await response.json();
    logger.info({ email: toEmail, messageId: data.messageId }, 'Brevo email delivered successfully to user inbox');
    return { success: true, messageId: data.messageId, simulated: false };
  },
};
