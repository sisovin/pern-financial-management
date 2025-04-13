import os from 'os';
import chalk from 'chalk';

// Helper function to get network interfaces
function getNetworkInterfaces() {
  const interfaces = os.networkInterfaces();
  const addresses: string[] = [];
  
  for (const name of Object.keys(interfaces)) {
    const networkInterface = interfaces[name];
    if (networkInterface) {
      for (const iface of networkInterface) {
        // Skip internal and non-IPv4 addresses
        if (iface.family === 'IPv4' && !iface.internal) {
          addresses.push(iface.address);
        }
      }
    }
  }
  
  return addresses;
}

const port = 3000;
const networkInterfaces = getNetworkInterfaces();

console.log('\n' + chalk.green('🚀 RSBuild Server URLs:') + '\n');
console.log(chalk.cyan(`➜  Local:   http://localhost:${port}/`));
networkInterfaces.forEach(ip => {
  console.log(chalk.cyan(`➜  Network: http://${ip}:${port}/`));
});
console.log('\n');