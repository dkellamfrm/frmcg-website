interface Env {
  DB: D1Database;
  SUBMISSIONS_API_KEY: string;
}

interface SubmissionData {
  site: string;
  sourcePage: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  company?: string;
  message: string;
  ip?: string;
  userAgent?: string;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context;

  const apiKey = request.headers.get('X-API-Key');
  if (!apiKey || apiKey !== env.SUBMISSIONS_API_KEY) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const data: SubmissionData = await request.json();

    if (!data.site || !data.firstName || !data.lastName || !data.email || !data.message) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    await env.DB.prepare(
      `INSERT INTO submissions (site, source_page, first_name, last_name, email, phone, company, message, ip, user_agent)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
      .bind(
        data.site,
        data.sourcePage || 'contact',
        data.firstName,
        data.lastName,
        data.email,
        data.phone || '',
        data.company || '',
        data.message,
        data.ip || '',
        data.userAgent || ''
      )
      .run();

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('Submission error:', err);
    return new Response(JSON.stringify({ error: 'Failed to save submission' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { request, env } = context;
  const url = new URL(request.url);

  const site = url.searchParams.get('site') || '';
  const limit = Math.min(parseInt(url.searchParams.get('limit') || '50'), 200);
  const offset = parseInt(url.searchParams.get('offset') || '0');

  try {
    let query: string;
    let params: unknown[];

    if (site) {
      query = `SELECT * FROM submissions WHERE site = ? ORDER BY created_at DESC LIMIT ? OFFSET ?`;
      params = [site, limit, offset];
    } else {
      query = `SELECT * FROM submissions ORDER BY created_at DESC LIMIT ? OFFSET ?`;
      params = [limit, offset];
    }

    const results = await env.DB.prepare(query).bind(...params).all();

    const countQuery = site
      ? `SELECT COUNT(*) as total FROM submissions WHERE site = ?`
      : `SELECT COUNT(*) as total FROM submissions`;
    const countParams = site ? [site] : [];
    const countResult = await env.DB.prepare(countQuery).bind(...countParams).first<{ total: number }>();

    return new Response(JSON.stringify({
      submissions: results.results,
      total: countResult?.total || 0,
      limit,
      offset,
    }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('Query error:', message);
    return new Response(JSON.stringify({ error: 'Failed to fetch submissions', detail: message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
