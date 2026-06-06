async function test() {
  try {
    const res = await fetch('http://localhost:3001/api/tenants/onboard', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: "Edificio Test",
        floors: 2,
        aptsPerFloor: 2,
        locales: 0,
        aptAliquot: 25
      })
    });
    const data = await res.json();
    console.log(data);
  } catch (err) {
    console.error(err);
  }
}
test();
