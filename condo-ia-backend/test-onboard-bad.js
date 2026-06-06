async function test() {
  try {
    const res = await fetch('http://localhost:3001/api/tenants/onboard', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: "Residencias Imola 1",
        floors: 11,
        aptsPerFloor: 4,
        locales: 7,
        aptAliquot: 1.363636
      })
    });
    const data = await res.json();
    console.log("Status:", res.status);
    console.log("Data:", data);
  } catch (err) {
    console.error(err);
  }
}
test();
