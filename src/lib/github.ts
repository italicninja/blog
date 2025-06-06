import { cache } from 'react';

export interface GitHubProject {
  id: number;
  name: string;
  description: string;
  html_url: string;
  stargazers_count: number;
  forks_count: number;
  language: string;
  updated_at: string;
}

// Cache the result to avoid unnecessary API calls
export const getTopGitHubProjects = cache(async (username: string = 'italicninja', count: number = 3): Promise<GitHubProject[]> => {
  try {
    // Fetch repositories from GitHub API
    const response = await fetch(`https://api.github.com/users/${username}/repos?sort=stars&per_page=10`, {
      headers: {
        'Accept': 'application/vnd.github.v3+json',
      },
      // Refresh cache every hour
      next: { revalidate: 3600 }
    });

    if (!response.ok) {
      throw new Error(`GitHub API responded with status: ${response.status}`);
    }

    const repos = await response.json();
    
    // Sort by stars and return the top ones
    return repos
      .sort((a: GitHubProject, b: GitHubProject) => b.stargazers_count - a.stargazers_count)
      .slice(0, count);
  } catch (error) {
    console.error('Error fetching GitHub projects:', error);
    return [];
  }
});