const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

async function poll() {
  const url = 'https://condo-ia-backend.onrender.com/api/tenants/version';
  console.log("Starting polling for version bcryptjs-v3...");
  for (let i = 0; i < 30; i++) {
    try {
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        console.log(`[Attempt ${i+1}] Version:`, data.version);
        if (data.version === 'bcryptjs-v3') {
          console.log("NEW DEPLOY (bcryptjs-v3) SUCCESSFUL AND ACTIVE!");
          // Let's run the DB push and then the test flow
          await runDbPushAndFlow();
          return;
        }
      } else {
        console.log(`[Attempt ${i+1}] Status:`, res.status);
      }
    } catch (e) {
      console.log(`[Attempt ${i+1}] Error:`, e.message);
    }
    await sleep(15000);
  }
  console.log("Polling timed out.");
}

async function runDbPushAndFlow() {
  try {
    // 1. Run DB Push
    console.log("\nCalling /api/tenants/db-push on the live server to execute Prisma db push...");
    const pushRes = await fetch('https://condo-ia-backend.onrender.com/api/tenants/db-push', {
      method: 'POST'
    });
    console.log("DB Push Status:", pushRes.status);
    const pushResult = await pushRes.json();
    console.log("DB Push Result:", pushResult);

    if (pushResult.error) {
      console.error("DB Push failed, aborting flow.");
      return;
    }

    // 2. Get tenants
    const tenantsRes = await fetch('https://condo-ia-backend.onrender.com/api/tenants');
    const tenants = await tenantsRes.json();
    console.log("\nTenants found on live server:");
    for (const t of tenants) {
      console.log(`- ID: ${t.id}, Name: ${t.name}`);
    }

    // Target Residencias Imola Torre A
    const targetTenant = tenants.find(t => t.name.toLowerCase().includes('imola') && t.name.toLowerCase().includes('a'));
    if (!targetTenant) {
      console.log("Could not find Imola Torre A tenant");
      return;
    }
    console.log(`\nTargeting Tenant: ${targetTenant.name} (${targetTenant.id})`);

    // 3. Reset password
    console.log("Calling reset-admin-password...");
    const resetRes = await fetch(`https://condo-ia-backend.onrender.com/api/tenants/${targetTenant.id}/reset-admin-password`, {
      method: 'POST'
    });
    console.log("Reset Status:", resetRes.status);
    const resetData = await resetRes.json();
    console.log("Reset Response:", resetData);

    // 4. Try to login
    console.log("\nTrying to log in with admin@residenciasimolatorrea.com / admin123...");
    const loginRes = await fetch('https://condo-ia-backend.onrender.com/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@residenciasimolatorrea.com',
        password: 'admin123'
      })
    });
    console.log("Login Status:", loginRes.status);
    const loginData = await loginRes.json();
    console.log("Login Response:", loginData);

  } catch (e) {
    console.error("Flow Error:", e);
  }
}

poll();
