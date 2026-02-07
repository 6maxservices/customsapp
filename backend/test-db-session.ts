
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Testing Session table...');
    try {
        const count = await prisma.session.count();
        console.log('Current session count:', count);

        const testId = 'test-id-' + Date.now();
        const testSid = 'test-sid-' + Date.now();

        console.log('Creating test session...');
        await prisma.session.create({
            data: {
                id: testId,
                sid: testSid,
                data: '{"test":true}',
                expiresAt: new Date(Date.now() + 10000),
            },
        });
        console.log('Session created successfully.');

        console.log('Deleting test session...');
        await prisma.session.delete({
            where: { sid: testSid },
        });
        console.log('Session deleted successfully.');

    } catch (error) {
        console.error('Error accessing Session table:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
