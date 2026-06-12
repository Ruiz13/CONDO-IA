const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

async function poll() {
  const url = 'https://condo-ia-backend.onrender.com/api/tenants/version';
  console.log("Starting polling for version bcryptjs-v7...");
  for (let i = 0; i < 30; i++) {
    try {
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        console.log(`[Attempt ${i+1}] Version:`, data.version);
        if (data.version === 'bcryptjs-v7') {
          console.log("NEW DEPLOY (bcryptjs-v7) SUCCESSFUL AND ACTIVE!");
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
    // 1. Run DB Push in background
    console.log("\nTriggering async db-push with safe env configuration...");
    const pushRes = await fetch('https://condo-ia-backend.onrender.com/api/tenants/db-push', { method: 'POST' });
    const pushResult = await pushRes.json();
    console.log("Trigger response:", pushResult);

    // 2. Poll status
    console.log("\nPolling db-push status...");
    for (let i = 0; i < 30; i++) {
      await sleep(5000);
      const statusRes = await fetch('https://condo-ia-backend.onrender.com/api/tenants/db-push-status');
      const statusData = await statusRes.json();
      console.log(`[Status Attempt ${i+1}]`, statusData.status);
      if (statusData.status === 'success') {
        console.log("DB Push Succeeded!");
        console.log("Stdout:", statusData.stdout);
        break;
      } else if (statusData.status === 'error') {
        console.error("DB Push Failed with Error:", statusData.error);
        console.error("Stderr:", statusData.stderr);
        console.error("Stdout:", statusData.stdout);
        return;
      }
    }

    // 3. Get tenants
    const tenantsRes = await fetch('https://condo-ia-backend.onrender.com/api/tenants');
    const tenants = await tenantsRes.json();

    // Target Residencias Imola Torre A
    const targetTenant = tenants.find(t => t.name.toLowerCase().includes('imola') && t.name.toLowerCase().includes('a'));
    if (!targetTenant) {
      console.log("Could not find Imola Torre A tenant");
      return;
    }
    console.log(`\nTargeting Tenant: ${targetTenant.name} (${targetTenant.id})`);

    // 4. Reset password
    console.log("Calling reset-admin-password...");
    const resetRes = await fetch(`https://condo-ia-backend.onrender.com/api/tenants/${targetTenant.id}/reset-admin-password`, {
      method: 'POST'
    });
    console.log("Reset Status:", resetRes.status);
    const resetData = await resetRes.json();
    console.log("Reset Response:", resetData);

    // 5. Try to login
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
