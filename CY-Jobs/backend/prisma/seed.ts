import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Clearing existing data...');
  
  // Clean up existing data in correct dependency order to prevent foreign key violations
  await prisma.jobMatch.deleteMany({});
  await prisma.savedJob.deleteMany({});
  await prisma.application.deleteMany({});
  await prisma.resume.deleteMany({});
  await prisma.jobSkill.deleteMany({});
  await prisma.userSkill.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.job.deleteMany({});
  await prisma.skill.deleteMany({});

  console.log('Seeding database...');

  // Create Skills
  const skills = await Promise.all([
    prisma.skill.upsert({
      where: { name: 'React' },
      update: {},
      create: { name: 'React', type: 'HARD' },
    }),
    prisma.skill.upsert({
      where: { name: 'Node.js' },
      update: {},
      create: { name: 'Node.js', type: 'HARD' },
    }),
    prisma.skill.upsert({
      where: { name: 'TypeScript' },
      update: {},
      create: { name: 'TypeScript', type: 'HARD' },
    }),
    prisma.skill.upsert({
      where: { name: 'Communication' },
      update: {},
      create: { name: 'Communication', type: 'SOFT' },
    }),
  ]);

  console.log('Skills seeded');

  // Create Users
  const passwordHash = await bcrypt.hash('password123', 10);

  const candidate = await prisma.user.upsert({
    where: { email: 'candidate@example.com' },
    update: {},
    create: {
      email: 'candidate@example.com',
      passwordHash,
      role: Role.CANDIDATE,
      skills: {
        create: [
          { skillId: skills[0].id, proficiency: 'EXPERT' }, // React
          { skillId: skills[2].id, proficiency: 'INTERMEDIATE' }, // TypeScript
        ],
      },
    },
  });

  const employer = await prisma.user.upsert({
    where: { email: 'employer@example.com' },
    update: {},
    create: {
      email: 'employer@example.com',
      passwordHash,
      role: Role.EMPLOYER,
    },
  });

  console.log('Users seeded');

  // Create Jobs
  const job = await prisma.job.upsert({
    where: { externalId_source: { externalId: 'ext-job-1', source: 'Manual' } },
    update: {},
    create: {
      externalId: 'ext-job-1',
      source: 'Manual',
      title: 'Frontend Developer',
      company: 'Tech Corp',
      location: 'Remote',
      description: 'Looking for a skilled frontend developer with React and TypeScript experience.',
      postedAt: new Date(),
      skills: {
        create: [
          { skillId: skills[0].id, isRequired: true, weight: 1.0 }, // React
          { skillId: skills[2].id, isRequired: true, weight: 0.8 }, // TypeScript
        ],
      },
    },
  });

  console.log('Jobs seeded');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
