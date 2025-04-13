const environment = {
  development: {
    apiUrl: 'http://localhost:5000/api',
    debug: true,
  },
  production: {
    apiUrl: 'https://api.pern-financial-management.com/api',
    debug: false,
  },
  test: {
    apiUrl: 'http://localhost:5000/api',
    debug: true,
  },
};

export default environment;
