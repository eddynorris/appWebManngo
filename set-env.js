// set-env.js
const { writeFileSync } = require('fs');

// Lee la variable de entorno de Vercel
const apiUrl = process.env['NG_APP_API_URL'];

// Asegúrate de que la variable exista
if (!apiUrl) {
  console.error('Error: La variable de entorno NG_APP_API_URL no está definida.');
  process.exit(1);
}

const targetPath = './src/environments/environment.prod.ts';

const envConfigFile = `
export const environment = {
  production: true,
  apiUrl: 'https://api.manngojk.lat',
};
`;

// Escribe el nuevo archivo environment.prod.ts
writeFileSync(targetPath, envConfigFile, 'utf8');

console.log(`✅ Archivo de entorno generado exitosamente en ${targetPath}`);
