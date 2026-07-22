import cron from 'node-cron';
import { JobService } from './modules/jobs/job.service';

const jobService = new JobService();

export function initScheduler() {
  // Run every 2 hours
  cron.schedule('0 */2 * * *', async () => {
    console.log('[Scheduler] Running scheduled task: Fetching top recent jobs...');
    try {
      // Fetch trending/top jobs and specifically Indian jobs to populate the database cache
      await jobService.fetchTailoredJobs('software engineer', 'India');
      await jobService.fetchTailoredJobs('developer', 'India');
      console.log('[Scheduler] Scheduled task completed successfully.');
    } catch (err) {
      console.error('[Scheduler] Scheduled task failed:', err);
    }
  });

  console.log('[Scheduler] Cron jobs initialized.');
}
