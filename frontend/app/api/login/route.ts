export async function POST(request: Request) {
  const formData = await request.formData();
  const username = String(formData.get('username') || formData.get('email') || '');
  const password = String(formData.get('password') || '');
  const payload = `${username} ${password}`.toLowerCase();

  const sqlSignals = [
    "' or '1'='1",
    '" or "a"="a',
    'admin\' --',
    'sql syntax',
    'sqlite',
    'mysql',
    'postgres',
  ];

  if (sqlSignals.some((token) => payload.includes(token))) {
    return new Response(
      'SQL syntax error near input. This is an intentional lab response.',
      {
        status: 500,
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
        },
      },
    );
  }

  const filler = 'Welcome to your dashboard. '.repeat(30);
  const isDemo = username === 'demo' && password === 'demo';
  const isBruteforcePair = username === '67' && password === '69';

  if (!isDemo && !isBruteforcePair) {
    return new Response('Invalid credentials.', {
      status: 401,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
      },
    });
  }

  const successPrefix = isDemo
    ? 'HIGH: Demo credentials accepted. '
    : 'Login accepted for lab testing. ';

  return new Response(
    `${successPrefix}${filler}Account access granted. Logout available.`,
    {
      status: 200,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
      },
    },
  );
}
