import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function generateUniqueSlug(name: string): Promise<string> {
    const baseSlug = name
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');

    let slug = baseSlug;
    let counter = 1;

    while (true) {
        const existing = await prisma.station.findUnique({
            where: { slug },
        });

        if (!existing) break;
        slug = `${baseSlug}-${counter}`;
        counter++;
    }

    return slug;
}

async function main() {
    console.log('Starting slug population...');

    const stations = await prisma.station.findMany({
        where: { slug: null }
    });

    console.log(`Found ${stations.length} stations without slugs.`);

    for (const station of stations) {
        const slug = await generateUniqueSlug(station.name);
        await prisma.station.update({
            where: { id: station.id },
            data: { slug }
        });
        console.log(`Updated station "${station.name}" with slug "${slug}"`);
    }

    console.log('Slug population complete.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
