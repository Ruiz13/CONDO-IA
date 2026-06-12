async function test() {
  try {
    console.log("Trying to log in with admin@residenciasimolatorrea.com / admin123...");
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
