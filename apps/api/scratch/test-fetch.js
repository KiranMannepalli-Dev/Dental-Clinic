async function run() {
  try {
    const loginRes = await fetch('http://localhost:4000/api/v1/admin/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'kiran.mannepalli.in@gmail.com',
        password: 'Hesvitha@_02'
      })
    });
    
    const loginData = await loginRes.json();
    console.log('Login Response:', loginData);
    
    if (!loginData.success) {
      console.log('Login failed!');
      return;
    }
    
    const token = loginData.data.token;
    const statsRes = await fetch('http://localhost:4000/api/v1/admin/dashboard/stats', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const statsData = await statsRes.json();
    console.log('Stats Response:', statsData);
    
  } catch (error) {
    console.error('Error running test fetch:', error);
  }
}

run();
