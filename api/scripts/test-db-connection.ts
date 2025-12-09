import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testConnection() {
  try {
    console.log('🔍 Testing database connection...\n');

    // Test basic connection
    await prisma.$connect();
    console.log('✅ Database connection successful!');

    // Test query
    const result = await prisma.$queryRaw`SELECT version()`;
    console.log('✅ Query executed successfully!');
    console.log('📊 PostgreSQL version:', result);

    // Check if tables exist
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `;
    console.log('\n📋 Tables in database:', tables);

    // Count users
    const userCount = await prisma.user.count();
    console.log(`\n👥 Users in database: ${userCount}`);

    // Count roles
    const roleCount = await prisma.role.count();
    console.log(`🔐 Roles in database: ${roleCount}`);

    if (roleCount > 0) {
      const roles = await prisma.role.findMany();
      console.log('\n🔐 Available roles:');
      roles.forEach((role) => {
        console.log(`   - ${role.name}: ${role.description || 'No description'}`);
      });
    }

    if (userCount > 0) {
      const users = await prisma.user.findMany({
        select: {
          email: true,
          firstName: true,
          lastName: true,
          roles: {
            select: {
              role: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
        take: 5,
      });

      console.log('\n👥 Sample users:');
      users.forEach((user) => {
        const roleNames = user.roles.map((r) => r.role.name).join(', ');
        console.log(`   - ${user.email} (${user.firstName} ${user.lastName}) - Roles: ${roleNames}`);
      });
    }

    console.log('\n✅ All tests passed!');
  } catch (error) {
    console.error('❌ Connection test failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();
