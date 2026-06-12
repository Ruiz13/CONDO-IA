async function test() {
  try {
    const res = await fetch('https://condo-ia-backend.onrender.com/api/tenants/db-push-status');
    const data = await res.json();
    console.log("Status Response:", JSON.stringify(data, null, 2));
  } catch (e) {
    console.error("Error:", e);
  }
}
test();
