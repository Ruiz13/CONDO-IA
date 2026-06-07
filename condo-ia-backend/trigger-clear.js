const tenant1 = '1a3f3377-0b14-4fa4-addf-b1b07dab90cd';
const tenant2 = '1e765d34-f9f7-4e1b-958b-4d65808a78ed';

async function clear() {
  try {
    const res1 = await fetch(`https://condo-ia-backend.onrender.com/api/tenants/${tenant1}/clear-finances`, { method: 'POST' });
    console.log('Tenant 1 (Torre B):', await res1.text());

    const res2 = await fetch(`https://condo-ia-backend.onrender.com/api/tenants/${tenant2}/clear-finances`, { method: 'POST' });
    console.log('Tenant 2 (Torre A):', await res2.text());
  } catch (e) {
    console.error(e);
  }
}
clear();
