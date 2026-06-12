async function test() {
  try {
    // 1. Get tenants
    const tenantsRes = await fetch('https://condo-ia-backend.onrender.com/api/tenants');
    const tenants = await tenantsRes.json();
    console.log("Tenants found on live server:");
    for (const t of tenants) {
      console.log(`- ID: ${t.id}, Name: ${t.name}`);
    }

    // Let's find Residencias Imola Torre A
    const targetTenant = tenants.find(t => t.name.toLowerCase().includes('imola') && t.name.toLowerCase().includes('a'));
    if (!targetTenant) {
      console.log("Could not find Imola Torre A tenant");
      return;
    }
    console.log(`\nTargeting Tenant: ${targetTenant.name} (${targetTenant.id})`);

    // 2. Call reset-admin-password
    console.log("Calling reset-admin-password...");
    const resetRes = await fetch(`https://condo-ia-backend.onrender.com/api/tenants/${targetTenant.id}/reset-admin-password`, {
      method: 'POST'
    });
    console.log("Reset Status:", resetRes.status);
    const resetData = await resetRes.json();
    console.log("Reset Response:", resetData);

    // 3. Try to log in
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
    console.error("Test Error:", e);
  }
}
test();
