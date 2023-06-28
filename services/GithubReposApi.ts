const { Octokit } = require('@octokit/core');


export type GithubRepo = {
  created_at: string;
  full_name: string;
  id: number;
  language: string;
  stargazers_count: number;
  html_url: string;
};
  
export const fetchRepos = async (query: string, page: number, token: string | null): Promise<any> => {
	const octokit = new Octokit({
		auth: token,
		headers: {
			Accept: 'application/vnd.github.v3+json',
		},
	});
	return await octokit.request('GET /search/repositories', {
    q: query,
    per_page: 10,
    page: page,
    sort: 'stars',
  });
};