async function test() {
  try {
    const res = await fetch('https://condo-ia-backend.onrender.com/api/tenants/version');
    console.log("Status:", res.status);
    const data = await res.json();
    console.log("Version:", data.version);
  } catch (e) {
    console.error("Fetch Error:", e);
  }
}
test();
