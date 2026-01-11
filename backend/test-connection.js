const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'postgresql://postgres:admin@localhost:5432/postgres?schema=public'
    }
  }
});

prisma.$connect()
  .then(() => {
    console.log('✅ Connection successful!');
    return prisma.$disconnect();
  })
  .then(() => {
    process.exit(0);
  })
  .catch((e) => {
    console.error('❌ Connection failed:', e.message);
    process.exit(1);
  });

