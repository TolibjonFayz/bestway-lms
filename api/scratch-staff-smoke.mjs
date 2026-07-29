const BASE = 'http://localhost:3000/api';

async function login(phone, password = 'bestway123') {
  const res = await fetch(`${BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(`login ${phone} failed: ${JSON.stringify(data)}`);
  return { token: data.accessToken, user: data.user };
}

function headersFor(token) {
  return { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };
}

async function main() {
  const aziz = await login('901234567'); // teacher, groups INT-3 (0) + INT-2 (1)
  const nigora = await login('935558844'); // teacher, groups PRE-1 (2) + MATH-1 (3)
  const admin = await login('901112233');
  console.log('Logged in: Aziz', aziz.user.id, '| Nigora', nigora.user.id, '| Admin', admin.user.id);

  console.log('\n=== GET /teacher/dashboard (Aziz) ===');
  const dash = await fetch(`${BASE}/teacher/dashboard`, { headers: headersFor(aziz.token) }).then((r) => r.json());
  console.log(JSON.stringify(dash, null, 2));

  console.log('\n=== GET /teacher/submissions?status=pending (Aziz) ===');
  const azizPending = await fetch(`${BASE}/teacher/submissions?status=pending&limit=20`, { headers: headersFor(aziz.token) }).then((r) => r.json());
  console.log('total', azizPending.total, 'items', azizPending.items.map((i) => ({ id: i.id, student: i.studentName, type: i.itemType, unit: i.unitTitle })));

  console.log('\n=== GET /teacher/submissions?status=pending (Nigora) ===');
  const nigoraPending = await fetch(`${BASE}/teacher/submissions?status=pending&limit=20`, { headers: headersFor(nigora.token) }).then((r) => r.json());
  console.log('total', nigoraPending.total, 'items', nigoraPending.items.map((i) => ({ id: i.id, student: i.studentName, type: i.itemType, unit: i.unitTitle })));

  if (azizPending.items.length) {
    const own = azizPending.items[0];
    console.log('\n=== GET /teacher/submissions/:id (Aziz on own submission) — expect 200 ===');
    const res = await fetch(`${BASE}/teacher/submissions/${own.id}`, { headers: headersFor(aziz.token) });
    console.log('status', res.status);
    const detail = await res.json();
    console.log(JSON.stringify(detail, null, 2).slice(0, 2000));
  }

  if (nigoraPending.items.length) {
    const foreign = nigoraPending.items[0];
    console.log(`\n=== GET /teacher/submissions/${foreign.id} (Aziz on Nigora's student's submission) — expect 403 ===`);
    const res = await fetch(`${BASE}/teacher/submissions/${foreign.id}`, { headers: headersFor(aziz.token) });
    const body = await res.json();
    console.log('status', res.status);
    console.log(JSON.stringify(body, null, 2));

    console.log(`\n=== POST /teacher/submissions/${foreign.id}/grade (Aziz grading Nigora's student) — expect 403 ===`);
    const res2 = await fetch(`${BASE}/teacher/submissions/${foreign.id}/grade`, {
      method: 'POST', headers: headersFor(aziz.token), body: JSON.stringify({ score: 99, comment: 'sneaky' }),
    });
    const body2 = await res2.json();
    console.log('status', res2.status);
    console.log(JSON.stringify(body2, null, 2));
  }

  console.log('\n=== Admin: GET /admin/courses ===');
  const courses = await fetch(`${BASE}/admin/courses`, { headers: headersFor(admin.token) }).then((r) => r.json());
  console.log(JSON.stringify(courses, null, 2));

  const ielts = courses.items.find((c) => c.subject === 'ielts');
  console.log('\n=== Admin: GET /admin/courses/:id/units (IELTS) ===');
  const units = await fetch(`${BASE}/admin/courses/${ielts.id}/units`, { headers: headersFor(admin.token) }).then((r) => r.json());
  console.log(JSON.stringify(units, null, 2));

  console.log('\n=== Admin: GET /admin/units/:id (unit detail) ===');
  const unitDetail = await fetch(`${BASE}/admin/units/${units.items[0].id}`, { headers: headersFor(admin.token) }).then((r) => r.json());
  console.log(JSON.stringify(unitDetail, null, 2));

  console.log('\n=== Admin: GET /admin/students?limit=5 ===');
  const students = await fetch(`${BASE}/admin/students?limit=5`, { headers: headersFor(admin.token) }).then((r) => r.json());
  console.log(JSON.stringify(students, null, 2));

  console.log('\n=== Admin: GET /admin/groups ===');
  const groups = await fetch(`${BASE}/admin/groups`, { headers: headersFor(admin.token) }).then((r) => r.json());
  console.log(JSON.stringify(groups, null, 2));

  console.log('\n=== Non-admin trying /admin/courses — expect 403 ===');
  const resForbid = await fetch(`${BASE}/admin/courses`, { headers: headersFor(aziz.token) });
  console.log('status', resForbid.status, await resForbid.json());
}

main().catch((e) => { console.error('ERROR', e); process.exit(1); });
