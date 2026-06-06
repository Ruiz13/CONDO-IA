const tenantId = '86c4a7e3-3bf3-43d4-89cb-bec5a7cf21b1';
fetch(`https://condo-ia-backend.onrender.com/api/tenants/${tenantId}/units`)
  .then(res => res.json())
  .then(data => console.log('Units from API:', JSON.stringify(data, null, 2)))
  .catch(err => console.error(err));
