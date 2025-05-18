import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = process.env.NODE_ENV === 'production'
    ? 'Auth <auth@yourdomain.com>'
    : 'Resend <onboarding@resend.dev>';

/**
 * Sends an authentication code to the user's email
 * @param email The recipient's email address
 * @param code The 6-digit authentication code
 * @returns Promise containing the result of the email sending operation
 */
export async function sendAuthCode(email: string, code: string): Promise<any> {
    if (process.env.NODE_ENV !== 'production') {
        console.log('\n==================================');
        console.log(`Cod de verificare pentru ${email}: ${code}`);
        console.log('==================================\n');
    }

    try {
        if (process.env.SKIP_EMAIL_SENDING === 'true') {
            return {
                success: true,
                data: { id: 'dev-mode-skip-email' },
                devMode: true
            };
        }

        const { data, error } = await resend.emails.send({
            from: FROM_EMAIL,
            to: email,
            subject: 'Your Authentication Code',
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Your Authentication Code</h2>
          <p>Please use the following code to complete your login:</p>
          <div style="background-color: #f4f4f4; padding: 15px; text-align: center; font-size: 24px; letter-spacing: 5px; font-weight: bold; margin: 20px 0;">
            ${code}
          </div>
          <p>This code will expire in 10 minutes.</p>
          <p>If you didn't request this code, you can safely ignore this email.</p>
        </div>
      `,
        });

        if (error) {
            throw new Error(error.message);
        }

        return { success: true, data };
    } catch (error: any) {
        console.error('Email sending error:', error);

        if (process.env.NODE_ENV !== 'production') {
            console.warn('Continuing in development mode despite email error');
            return {
                success: true,
                data: { id: 'dev-mode-error-bypass' },
                devMode: true
            };
        }

        return { success: false, error: error.message };
    }
} 