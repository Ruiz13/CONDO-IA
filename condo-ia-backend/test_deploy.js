const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

async function poll() {
  const url = 'https://condo-ia-backend.onrender.com/api/tenants/version';
  console.log("Starting polling for version bcryptjs-v12...");
  for (let i = 0; i < 45; i++) {
    try {
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        console.log(`[Attempt ${i+1}] Version:`, data.version);
        if (data.version === 'bcryptjs-v12') {
          console.log("NEW DEPLOY (bcryptjs-v12) SUCCESSFUL AND ACTIVE!");
          console.log("Waiting 15 seconds for background db-push to complete...");
          await sleep(15000);
          await runFlow();
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

async function runFlow() {
  try {
    // Get tenants
    const tenantsRes = await fetch('https://condo-ia-backend.onrender.com/api/tenants');
    const tenants = await tenantsRes.json();

    // Target Residencias Imola Torre A
    const targetTenant = tenants.find(t => t.name.toLowerCase().includes('imola') && t.name.toLowerCase().includes('a'));
    if (!targetTenant) {
      console.log("Could not find Imola Torre A tenant");
      return;
    }
    console.log(`\nTargeting Tenant: ${targetTenant.name} (${targetTenant.id})`);

    // Reset password
    console.log("Calling reset-admin-password...");
    const resetRes = await fetch(`https://condo-ia-backend.onrender.com/api/tenants/${targetTenant.id}/reset-admin-password`, {
      method: 'POST'
    });
    console.log("Reset Status:", resetRes.status);
    const resetData = await resetRes.json();
    console.log("Reset Response:", resetData);

    // Try to login
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
