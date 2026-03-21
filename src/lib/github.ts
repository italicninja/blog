import { cache } from 'react';
import { getOwnerGithubLogin } from './auth-utils';

export interface GitHubProject {
  id: number;
  name: string;
  description: string | null;
  html_url: string;
  stargazers_count: number;
  forks_count: number;
  language: string | null;
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
    // Fetch repositories from GitHub API, already sorted by stars server-side
    const response = await fetch(`https://api.github.com/users/${owner}/repos?sort=stars&direction=desc&per_page=${count}`, {
      headers: {
        'Accept': 'application/vnd.github.v3+json',
      },
      // Refresh cache every hour
      next: { revalidate: 3600 }
    });

    if (!response.ok) {
      throw new Error(`GitHub API responded with status: ${response.status}`);
    }

    const repos: GitHubProject[] = await response.json();
    return repos.slice(0, count);
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
      console.warn(`GitHub API responded with status: ${response.status}. Commit info unavailable.`);
      return null;
    }

    const commits: GitHubCommit[] = await response.json();

    if (commits && commits.length > 0) {
      return commits[0];
    }

    return null;
  } catch (error) {
    console.error('Error fetching latest commit:', error);
    return null;
  }
});
