import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const user = await prisma.user.findUnique({
        where: { email: 'admin@alpha.gr' }
    });
    console.log('User found:', user ? 'YES' : 'NO');
    if (user) {
        console.log('ID:', user.id);
        console.log('Hash length:', user.passwordHash.length);
    }
}

main().finally(() => prisma.$disconnect());
