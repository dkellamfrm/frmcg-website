interface Env {
  DB: D1Database;
  RESEND_API_KEY: string;
  NOTIFICATION_EMAIL: string;
  TURNSTILE_SECRET_KEY: string;
}

interface ContactSubmission {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  company?: string;
  message: string;
  sourcePage: string;
  timestamp: string;
  website?: string;
  'cf-turnstile-response'?: string;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context;

  const origin = request.headers.get('Origin') || '';
  const allowedOrigins = ['https://frmcg.com.au', 'https://www.frmcg.com.au'];
  if (!allowedOrigins.includes(origin)) {
    return new Response(JSON.stringify({ error: 'Forbidden' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const corsHeaders = {
    'Access-Control-Allow-Origin': origin,
    'Content-Type': 'application/json',
  };

  try {
    const data: ContactSubmission = await request.json();

    if (data.website) {
      return new Response(JSON.stringify({ success: true }), { headers: corsHeaders });
    }

    if (!data.firstName?.trim() || !data.lastName?.trim() || !data.email?.trim() || !data.message?.trim()) {
      return new Response(JSON.stringify({ error: 'Please fill in all required fields.' }), {
        status: 400, headers: corsHeaders,
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      return new Response(JSON.stringify({ error: 'Please provide a valid email address.' }), {
        status: 400, headers: corsHeaders,
      });
    }

    const turnstileToken = data['cf-turnstile-response'];
    if (turnstileToken) {
      const turnstileResponse = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          secret: env.TURNSTILE_SECRET_KEY,
          response: turnstileToken,
          remoteip: request.headers.get('CF-Connecting-IP') || '',
        }),
      });
      const turnstileResult: { success: boolean } = await turnstileResponse.json();
      if (!turnstileResult.success) {
        return new Response(JSON.stringify({ error: 'Security verification failed. Please try again.' }), {
          status: 400, headers: corsHeaders,
        });
      }
    }

    const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
    const userAgent = request.headers.get('User-Agent') || 'unknown';

    await env.DB.prepare(
      `INSERT INTO submissions (site, source_page, first_name, last_name, email, phone, company, message, ip, user_agent)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      'FRMCG',
      data.sourcePage || 'contact',
      data.firstName,
      data.lastName,
      data.email,
      data.phone || '',
      data.company || '',
      data.message,
      ip,
      userAgent
    ).run();

    await sendEmailNotification(env, data, ip);

    return new Response(JSON.stringify({ success: true }), { headers: corsHeaders });
  } catch (err) {
    console.error('Contact form error:', err);
    return new Response(JSON.stringify({ error: 'An unexpected error occurred. Please try again.' }), {
      status: 500, headers: corsHeaders,
    });
  }
};

export const onRequestOptions: PagesFunction = async () => {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': 'https://frmcg.com.au',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400',
    },
  });
};

async function sendEmailNotification(env: Env, data: ContactSubmission, ip: string): Promise<void> {
  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'FRM Websites <davidk@frmcg.com.au>',
      to: [env.NOTIFICATION_EMAIL],
      subject: `[FRMCG] New Contact - ${data.firstName} ${data.lastName}`,
      html: `
        <h2>New Contact Form Submission - FRMCG</h2>
        <table style="border-collapse: collapse; width: 100%; max-width: 600px;">
          <tr><td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Name</td><td style="padding: 8px; border: 1px solid #ddd;">${data.firstName} ${data.lastName}</td></tr>
          <tr><td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Email</td><td style="padding: 8px; border: 1px solid #ddd;">${data.email}</td></tr>
          <tr><td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Phone</td><td style="padding: 8px; border: 1px solid #ddd;">${data.phone || '-'}</td></tr>
          <tr><td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Company</td><td style="padding: 8px; border: 1px solid #ddd;">${data.company || '-'}</td></tr>
          <tr><td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Message</td><td style="padding: 8px; border: 1px solid #ddd;">${data.message}</td></tr>
          <tr><td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Source Page</td><td style="padding: 8px; border: 1px solid #ddd;">${data.sourcePage}</td></tr>
          <tr><td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">IP Address</td><td style="padding: 8px; border: 1px solid #ddd;">${ip}</td></tr>
        </table>
      `,
    }),
  });
}
