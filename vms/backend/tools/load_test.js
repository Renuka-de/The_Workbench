import { performance } from 'perf_hooks';

const BASE = process.env.BASE_URL || 'http://localhost:4000/api/mock';

async function timedRequest(path, opts = {}) {
  const start = performance.now();
  const res = await global.fetch(`${BASE}${path}`, opts);
  const end = performance.now();
  let json = null;
  try { json = await res.json(); } catch (e) {}
  return { ok: res.ok, status: res.status, time: end - start, body: json };
}

async function benchGet(path, headers = {}, iterations = 50, concurrency = 10) {
  const results = [];
  for (let i = 0; i < iterations; i += concurrency) {
    const batch = Array.from({ length: Math.min(concurrency, iterations - i) }).map(() =>
      timedRequest(path, { method: 'GET', headers })
    );
    const out = await Promise.all(batch);
    results.push(...out);
  }
  const times = results.map((r) => r.time);
  const sum = times.reduce((s, t) => s + t, 0);
  return {
    count: results.length,
    ok: results.filter((r) => r.ok).length,
    min: Math.min(...times),
    max: Math.max(...times),
    avg: sum / results.length,
  };
}

async function runScenario() {
  console.log('Base URL:', BASE);

  console.log('\n1) Warm-up: GET /projects (vendor) x10');
  console.log(await benchGet('/projects', { 'x-mock-user-email': 'vendor@test.com' }, 10, 5));

  console.log('\n2) Concurrency test: GET /projects (vendor) x100 concurrent 20');
  console.log(await benchGet('/projects', { 'x-mock-user-email': 'vendor@test.com' }, 100, 20));

  console.log('\n3) Workflow: accept assignment -> create timesheet -> pm pending -> approve');
  // accept assignment
  let r1 = await timedRequest('/assignments/a-1/accept', { method: 'POST', headers: { 'x-mock-user-email': 'contractor@test.com' } });
  console.log('accept assignment:', r1.status, `${r1.time.toFixed(1)}ms`);

  // submit timesheet (use yesterday)
  const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1);
  const workDate = yesterday.toISOString().slice(0, 10);
  let r2 = await timedRequest('/timesheets', { method: 'POST', headers: { 'x-mock-user-email': 'contractor@test.com', 'Content-Type': 'application/json' }, body: JSON.stringify({ projectId: 'p-ecom', workDate, hours: 8, description: 'Test work' }) });
  console.log('submit timesheet:', r2.status, `${r2.time.toFixed(1)}ms`);

  const tsId = r2.body?.data?.id;

  // pm get pending
  let r3 = await timedRequest('/timesheets/pending', { method: 'GET', headers: { 'x-mock-user-email': 'pm@test.com' } });
  console.log('pm pending list:', r3.status, `${r3.time.toFixed(1)}ms`, 'count:', (r3.body?.data?.length ?? 0));

  if (tsId) {
    let r4 = await timedRequest(`/timesheets/${tsId}/approve`, { method: 'POST', headers: { 'x-mock-user-email': 'pm@test.com' } });
    console.log('approve timesheet:', r4.status, `${r4.time.toFixed(1)}ms`);
  } else {
    console.log('No timesheet id returned from submission; skipping approve step');
  }

  console.log('\n4) Final check: GET /assignments (contractor) x20');
  console.log(await benchGet('/assignments', { 'x-mock-user-email': 'contractor@test.com' }, 20, 5));
}

runScenario().catch((e) => {
  console.error('Error in load test', e);
  process.exit(1);
});
