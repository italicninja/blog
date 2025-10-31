import { cache } from 'react';
import { getOwnerGithubLogin } from './auth-utils';

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

export interface GitHubCommit {
  sha: string;
  html_url: string;
  commit: {
    author: {
      name: string;
      email: string;
      date: string;
    };
    message: string;
  };
}

// Cache the result to avoid unnecessary API calls
export const getTopGitHubProjects = cache(async (username?: string, count: number = 3): Promise<GitHubProject[]> => {
  const owner = username || getOwnerGithubLogin();
  try {
    // Fetch repositories from GitHub API
    const response = await fetch(`https://api.github.com/users/${owner}/repos?sort=stars&per_page=10`, {
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

// Fetch the latest commit information for the repository
export const getLatestCommit = cache(async (owner?: string, repo: string = 'blog'): Promise<GitHubCommit | null> => {
  const repoOwner = owner || getOwnerGithubLogin();
  try {
    // Fetch the latest commit from GitHub API
    const response = await fetch(`https://api.github.com/repos/${repoOwner}/${repo}/commits?per_page=1`, {
      headers: {
        'Accept': 'application/vnd.github.v3+json',
      },
      // Refresh cache every hour
      next: { revalidate: 3600 }
    });

    if (!response.ok) {
      console.warn(`GitHub API responded with status: ${response.status}. Using fallback commit info.`);
      // Provide fallback commit info for development/demo purposes
      return {
        sha: 'abcdef1234567890abcdef1234567890abcdef12',
        html_url: `https://github.com/${repoOwner}/${repo}/commit/abcdef1234567890abcdef1234567890abcdef12`,
        commit: {
          author: {
            name: 'Developer',
            email: 'dev@example.com',
            date: new Date().toISOString()
          },
          message: 'Latest commit'
        }
      };
    }

    const commits = await response.json();

    if (commits && commits.length > 0) {
      return commits[0];
    }

    return null;
  } catch (error) {
    console.error('Error fetching latest commit:', error);
    // Provide fallback commit info for development/demo purposes
    return {
      sha: 'abcdef1234567890abcdef1234567890abcdef12',
      html_url: `https://github.com/${owner}/${repo}/commit/abcdef1234567890abcdef1234567890abcdef12`,
      commit: {
        author: {
          name: 'Developer',
          email: 'dev@example.com',
          date: new Date().toISOString()
        },
        message: 'Latest commit'
      }
    };
  }
});