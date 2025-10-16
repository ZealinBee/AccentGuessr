// Quick debug script to check how many Clip rows exist
require('dotenv').config({ path: './.env' });
const { PrismaClient } = require('@prisma/client');

async function main() {
  const url = process.env.DATABASE_URL || '<no DATABASE_URL set>';
  console.log('Using DATABASE_URL:', url.startsWith('postgres') ? '(postgres url set)' : url);

  const prisma = new PrismaClient();
  try {
    const count = await prisma.clip.count();
    console.log('Clip count:', count);
    const first = await prisma.clip.findFirst();
    console.log('First clip sample:', first);
  } catch (err) {
    console.error('Error querying DB:', err.message || err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
