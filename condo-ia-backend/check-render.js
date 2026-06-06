fetch('https://condo-ia-backend.onrender.com/api/tenants')
  .then(res => res.json())
  .then(data => console.log('Tenants from Render:', JSON.stringify(data, null, 2)));
