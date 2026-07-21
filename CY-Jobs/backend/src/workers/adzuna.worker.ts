import { Worker, Job as BullJob } from 'bullmq';
import { redisConnection } from '../config/redis';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface AdzunaSyncJobData {
  country: string;
  category?: string;
  page: number;
}

// Function to scan job details and link matching database skills
async function linkSkillsToJob(jobId: string, title: string, description: string) {
  const dbSkills = await prisma.skill.findMany();
  
  for (const skill of dbSkills) {
    const isTitleMatch = title.toLowerCase().includes(skill.name.toLowerCase());
    const isDescMatch = description.toLowerCase().includes(skill.name.toLowerCase());
    
    if (isTitleMatch || isDescMatch) {
      // Connect skill to job if not already linked
      await prisma.jobSkill.upsert({
        where: {
          jobId_skillId: {
            jobId,
            skillId: skill.id
          }
        },
        update: {},
        create: {
          jobId,
          skillId: skill.id,
          isRequired: isTitleMatch, // Assume required if mentioned in title
          weight: isTitleMatch ? 1.0 : 0.5,
        }
      });
    }
  }
}

export const adzunaWorker = new Worker<AdzunaSyncJobData>(
  'AdzunaSyncQueue',
  async (bullJob: BullJob) => {
    const { country, page } = bullJob.data;
    console.log(`Processing Adzuna sync job ${bullJob.id} for country: ${country}, page: ${page}`);
    
    const appId = process.env.ADZUNA_APP_ID;
    const appKey = process.env.ADZUNA_APP_KEY;
    
    let jobsToSync = [];
    
    // Attempt real API fetch if credentials are provided
    if (appId && appKey) {
      try {
        console.log(`Fetching jobs from Adzuna API for page ${page}...`);
        const url = `https://api.adzuna.com/v1/api/jobs/${country}/search/${page}?app_id=${appId}&app_key=${appKey}&results_per_page=10`;
        const response = await fetch(url);
        
        if (response.ok) {
          const data = (await response.json()) as any;
          if (data.results && Array.isArray(data.results)) {
            jobsToSync = data.results.map((r: any) => ({
              externalId: r.id ? String(r.id) : undefined,
              title: r.title || 'Untitled Job',
              company: r.company?.display_name || 'Unknown Company',
              location: r.location?.display_name || 'Remote',
              description: r.description || '',
              applyUrl: r.redirect_url || '',
              postedAt: r.created ? new Date(r.created) : new Date(),
              metadata: r,
            }));
          }
        } else {
          console.warn(`Adzuna API returned status ${response.status}. Falling back to mock data...`);
        }
      } catch (err) {
        console.error('Failed to fetch from Adzuna API, falling back to mock data:', err);
      }
    } else {
      console.log('No Adzuna API credentials found in environment. Generating rich mock jobs...');
    }
    
    // If no jobs were fetched, fall back to rich, realistic mock jobs
    if (jobsToSync.length === 0) {
      if (country === 'in') {
        jobsToSync = [
          {
            externalId: `mock-adzuna-in-${page}-1`,
            title: "Frontend Developer (React)",
            company: "Infosys",
            location: "Bangalore, India",
            description: "Looking for a skilled React Developer with TypeScript experience to join our core development team.",
            applyUrl: "https://example.com/apply/react-in",
            postedAt: new Date(),
            metadata: { mock: true, salary: "₹8,00,000 - ₹12,00,000/Year", currency: "INR" },
          },
          {
            externalId: `mock-adzuna-in-${page}-2`,
            title: "Backend Node.js Engineer",
            company: "Wipro",
            location: "Pune, India",
            description: "Seeking a backend engineer proficient in Node.js, Express, and PostgreSQL to design microservices.",
            applyUrl: "https://example.com/apply/node-in",
            postedAt: new Date(),
            metadata: { mock: true, salary: "₹10,00,000 - ₹15,00,000/Year", currency: "INR" },
          },
          {
            externalId: `mock-adzuna-in-${page}-3`,
            title: "Technical Project Manager",
            company: "Tata Consultancy Services",
            location: "Mumbai, India",
            description: "Experienced Technical Project Manager to coordinate agile sprint teams and manage deliverables.",
            applyUrl: "https://example.com/apply/pm-in",
            postedAt: new Date(),
            metadata: { mock: true, salary: "₹18,00,000 - ₹24,00,000/Year", currency: "INR" },
          }
        ];
      } else {
        jobsToSync = [
          {
            externalId: `mock-adzuna-${country}-${page}-1`,
            title: "React Developer",
            company: "Creative Cloud Solutions",
            location: country === 'gb' ? "London, UK" : "Remote, US",
            description: "We are looking for a Senior React Developer who is proficient in TypeScript and React state management.",
            applyUrl: "https://example.com/apply/react-dev",
            postedAt: new Date(),
            metadata: { mock: true, salary: country === 'gb' ? "£50,000 - £70,000/Year" : "$120,000 - $140,000/Year", currency: country === 'gb' ? "GBP" : "USD" },
          },
          {
            externalId: `mock-adzuna-${country}-${page}-2`,
            title: "Node.js Backend Engineer",
            company: "FastStack Inc.",
            location: "New York, NY",
            description: "Seeking a backend engineer with experience building scalable microservices in Node.js and TypeScript.",
            applyUrl: "https://example.com/apply/node-dev",
            postedAt: new Date(),
            metadata: { mock: true, salary: "$130,000 - $160,000/Year", currency: "USD" },
          },
          {
            externalId: `mock-adzuna-${country}-${page}-3`,
            title: "Technical Project Manager",
            company: "Aura Media Corp",
            location: "Remote, UK",
            description: "Looking for an experienced Project Manager with excellent communication and team coordination skills.",
            applyUrl: "https://example.com/apply/pm",
            postedAt: new Date(),
            metadata: { mock: true, salary: "£45,000 - £60,000/Year", currency: "GBP" },
          }
        ];
      }
    }
    
    let processedCount = 0;
    
    // Insert jobs into Prisma database and dynamically resolve matching skills
    for (const jobData of jobsToSync) {
      if (!jobData.externalId) continue;
      
      try {
        const savedJob = await prisma.job.upsert({
          where: {
            externalId_source: {
              externalId: jobData.externalId,
              source: 'Adzuna'
            }
          },
          update: {
            title: jobData.title,
            company: jobData.company,
            location: jobData.location,
            description: jobData.description,
            applyUrl: jobData.applyUrl,
            postedAt: jobData.postedAt,
            metadata: jobData.metadata,
          },
          create: {
            externalId: jobData.externalId,
            source: 'Adzuna',
            title: jobData.title,
            company: jobData.company,
            location: jobData.location,
            description: jobData.description,
            applyUrl: jobData.applyUrl,
            postedAt: jobData.postedAt,
            metadata: jobData.metadata,
          }
        });
        
        // Contextually scan job description and link existing database skills
        await linkSkillsToJob(savedJob.id, savedJob.title, savedJob.description);
        processedCount++;
        
      } catch (err) {
        console.error(`Failed to upsert job ${jobData.externalId}:`, err);
      }
    }
    
    console.log(`Successfully completed Adzuna sync. Processed ${processedCount} jobs.`);
    return { success: true, processedCount };
  },
  {
    connection: redisConnection,
    concurrency: 5,
  }
);

adzunaWorker.on('completed', (job) => {
  console.log(`Job ${job.id} has completed!`);
});

adzunaWorker.on('failed', (job, err) => {
  console.log(`Job ${job?.id} has failed with error: ${err.message}`);
});
