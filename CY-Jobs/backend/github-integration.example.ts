import { GithubService } from './src/modules/jobs/services/github.service';

// Example usage of the GitHub service
async function testGithubIntegration() {
  // This would normally be done through dependency injection in NestJS
  // For demonstration, we're showing how the service would be used

  console.log('GitHub Service Integration Test');
  console.log('==============================');

  // In a real application, you would inject HttpService and ConfigService
  // const githubService = new GithubService(httpService, configService);

  // Example of how to extract skills from a GitHub profile
  // const skills = await githubService.extractSkillsFromProfile('octocat');
  // console.log('Extracted skills:', skills);

  console.log('GitHub service is ready to be used!');
  console.log('To test with a real GitHub username:');
  console.log('1. Set GITHUB_TOKEN in your .env file');
  console.log('2. Instantiate GithubService with HttpService and ConfigService');
  console.log('3. Call extractSkillsFromProfile(username)');
}

testGithubIntegration().catch(console.error);