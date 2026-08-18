import fetch from 'node-fetch';

// Simple smoke script to call the mock projects endpoint and print status
const BASE = process.env.BASE_URL ?? 'http://localhost:4000/api/mock';

async function run() {
  const res = await fetch(`${BASE}/projects`, { headers: { 'x-mock-user-email': 'vendor@test.com' } });
  console.log('status', res.status);
  const body = await res.json();
  console.log('body', body);
}

run().catch((e) => { console.error(e); process.exit(1); });
