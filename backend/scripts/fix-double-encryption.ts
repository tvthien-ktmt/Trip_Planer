import { PrismaClient } from '@prisma/client';
import { decrypt, encrypt } from '../src/common/utils/encryption.util';

const prisma = new PrismaClient();

async function main() {
  console.log('Detecting double-encrypted rows...');
  
  // Need to bypass prisma extension if we use raw prisma, or we can use raw query
  const doubleEncryptedRows = await prisma.$queryRaw<any[]>`
    SELECT id, passportNo FROM BookingPassenger 
    WHERE passportNo LIKE 'enc:v1:%enc:v1:%';
  `;

  console.log(`Found ${doubleEncryptedRows.length} double-encrypted rows.`);

  for (const row of doubleEncryptedRows) {
    if (!row.passportNo) continue;
    try {
      // First decryption gives 'enc:v1:<iv>:<tag>:<ciphertext>'
      const decryptedOnce = decrypt(row.passportNo);
      // We know this decryptedOnce is still encrypted. We can store it as is, or decrypt again to get plaintext, then let prisma extension encrypt?
      // Since we are fixing the raw DB, we should just store `decryptedOnce` back to DB directly via raw query.
      // `decryptedOnce` is already properly encrypted once!
      await prisma.$queryRaw`
        UPDATE BookingPassenger 
        SET passportNo = ${decryptedOnce} 
        WHERE id = ${row.id};
      `;
      console.log(`Fixed row id: ${row.id}`);
    } catch (err) {
      console.error(`Failed to fix row id: ${row.id}`, err);
    }
  }

  console.log('Done.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
