import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Seeding database...');

    // Create an admin user
    const adminAddress = '0x242dfb7849544ee242b2265ca7e585bdec60456b';
    const user = await prisma.user.upsert({
        where: { address: adminAddress },
        update: {},
        create: {
            address: adminAddress,
            role: 'ADMIN',
        },
    });

    console.log(`User created/found: ${user.address}`);

    // Create a sample published page for nav
    await prisma.article.upsert({
        where: { slug: 'about-decentranews' },
        update: {},
        create: {
            title: 'About DecentraNews',
            content: JSON.stringify({
                blocks: [
                    {
                        type: 'paragraph',
                        data: { text: 'DecentraNews is a decentralized platform for Web3 news and journalism.' }
                    }
                ]
            }),
            status: 'PUBLISHED',
            type: 'PAGE',
            slug: 'about-decentranews',
            authorId: user.id,
        }
    });

    // Create a sample news post
    await prisma.article.upsert({
        where: { slug: 'welcome-to-web3-news' },
        update: {},
        create: {
            title: 'Welcome to Web3 News',
            content: JSON.stringify({
                blocks: [
                    {
                        type: 'paragraph',
                        data: { text: 'This is the first post on the new DecentraNews platform!' }
                    }
                ]
            }),
            status: 'PUBLISHED',
            type: 'POST',
            slug: 'welcome-to-web3-news',
            category: 'Technology',
            authorId: user.id,
        }
    });

    console.log('Seeding completed!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
