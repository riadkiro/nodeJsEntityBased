const fetch = require('node-fetch');
const { URLSearchParams } = require('url');

async function test() {
  const loginRes = await fetch('http://localhost:3000/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      email: 'boukirou6@hotmail.com',
      password: 'test'
    }),
    redirect: 'manual' // prevent following redirect to capture cookies
  });

  const cookies = loginRes.headers.raw()['set-cookie'];
  console.log('Login cookies:', cookies);

  const cookieHeader = cookies ? cookies.map(c => c.split(';')[0]).join('; ') : '';

  const res = await fetch('http://localhost:3000/account/5096/field-template/api/create', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Cookie': cookieHeader
    },
    body: JSON.stringify({
      name: 'test_media_field_' + Date.now(),
      label: 'Test Media',
      category: 'custom',
      type: 'gallery'
    })
  });

  const body = await res.text();
  console.log('Status:', res.status);
  console.log('Body:', body);
}

test().catch(console.error);
