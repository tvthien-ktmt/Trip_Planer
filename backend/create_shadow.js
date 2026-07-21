const mysql = require('mysql2/promise');

async function main() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Thien2810@',
    port: 3306
  });
  await connection.query('CREATE DATABASE IF NOT EXISTS shadow;');
  console.log('Shadow database created');
  await connection.end();
}

main().catch(console.error);
