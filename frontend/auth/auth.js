class Auth {
  constructor() {
    this.token = localStorage.getItem('token');
    this.user = JSON.parse(localStorage.getItem('user') || 'null');
  }

  isLoggedIn() {
    return !!this.token && !!this.user;
  }

  getUser() {
    return this.user;
  }

  getToken() {
    return this.token;
  }

  async login(email, password) {
    const response = await fetch('https://history-timeline-4a5q.onrender.com/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Login failed');
    }

    const data = await response.json();
    this.token = data.token;
    this.user = data.user;
    
    localStorage.setItem('token', this.token);
    localStorage.setItem('user', JSON.stringify(this.user));
    
    return data;
  }

  async signup(name, email, password, city, country) {
    const response = await fetch('https://history-timeline-4a5q.onrender.com/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, city, country })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Signup failed');
    }

    const data = await response.json();
    this.token = data.token;
    this.user = data.user;
    
    localStorage.setItem('token', this.token);
    localStorage.setItem('user', JSON.stringify(this.user));
    
    return data;
  }

  logout() {
    this.token = null;
    this.user = null;
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  async createOrder(items, total) {
    const response = await fetch('https://history-timeline-4a5q.onrender.com/api/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.token}`
      },
      body: JSON.stringify({ items, total })
    });

    if (!response.ok) {
      throw new Error('Failed to create order');
    }

    return response.json();
  }

  async getOrders() {
    const response = await fetch('https://history-timeline-4a5q.onrender.com/api/orders', {
      headers: {
        'Authorization': `Bearer ${this.token}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch orders');
    }

    return response.json();
  }
}

const auth = new Auth();