import axios from "axios";
import { GithubRepo } from "./GithubReposApi";

export type RepoServerRepo = {
  createdAt: string;
  fullName: string;
  id: string;
  language: string;
  stargazersCount: number;
  url: string;
};

type FetchAllReposResponse = {
  repos: RepoServerRepo[];
};

export const healthCheck = (): Promise<void> => {
  const url = "http://localhost:8080/health";
  return axios.get(url);
};

export const fetchAllRepos = (): Promise<RepoServerRepo[]> => {
  const url = "http://localhost:8080/repo/";
  return axios.get<FetchAllReposResponse>(url).then((response) => {
    return response.data.repos;
  });
};

export const createRepo = (data: GithubRepo): Promise<void> => {
  const url = "http://localhost:8080/repo/";
  return axios.post(url, {
    id: `${data.id}`,
    fullName: data.full_name,
    stargazersCount: data.stargazers_count,
    language: data.language,
    url: data.html_url,
    createdAt: data.created_at,
  });
};

export const deleteRepo = (repoId: string): Promise<void> => {
  const url = `http://localhost:8080/repo/${repoId}`;
  return axios.delete(url);
};