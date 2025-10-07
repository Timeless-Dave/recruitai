import prisma from '../config/database.js';
import assessmentService from '../services/assessmentService.js';
import { logger } from '../utils/logger.js';

/**
 * Seed database with default question pools
 */
async function seedQuestionPools() {
  try {
    logger.info('Seeding question pools...');

    const pools = assessmentService.getDefaultQuestionPools();

    for (const pool of pools) {
      await prisma.questionPool.upsert({
        where: {
          // Use a composite unique key based on category and role
          id: `default-${pool.category}-${pool.role || 'general'}`
        },
        update: {
          ...pool,
          orgId: null
        },
        create: {
          id: `default-${pool.category}-${pool.role || 'general'}`,
          ...pool,
          orgId: null
        }
      });
    }

    logger.info(`✅ Seeded ${pools.length} question pools`);
  } catch (error) {
    logger.error('Error seeding question pools:', error);
    throw error;
  }
}

/**
 * Main seed function
 */
async function main() {
  try {
    logger.info('🌱 Starting database seeding...');

    await seedQuestionPools();

    logger.info('✅ Database seeding completed successfully');
  } catch (error) {
    logger.error('❌ Database seeding failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

export default main;



