// src/services/githubService.ts
// Fetch de GitHub commits y stats del usuario

export type GitHubUser = {
  login: string;
  name: string;
  public_repos: number;
  followers: number;
};

export type GitHubContrib = {
  date: string;
  count: number;
};

export const githubService = {
  async getUserInfo(username: string): Promise<GitHubUser | null> {
    try {
      const res = await fetch(`https://api.github.com/users/${username}`);
      if (!res.ok) return null;
      const data = await res.json();
      return {
        login: data.login,
        name: data.name ?? data.login,
        public_repos: data.public_repos,
        followers: data.followers,
      };
    } catch {
      return null;
    }
  },

  async getRecentCommits(username: string): Promise<{ repo: string; message: string; date: string }[]> {
    try {
      // Buscar eventos de push del usuario (últimos 30)
      const res = await fetch(`https://api.github.com/users/${username}/events/public?per_page=30`);
      if (!res.ok) return [];
      const events = await res.json();
      const pushEvents = events
        .filter((e: { type: string }) => e.type === 'PushEvent')
        .slice(0, 10)
        .flatMap((e: {
          repo: { name: string };
          payload: { commits: { message: string }[] };
          created_at: string;
        }) =>
          (e.payload.commits ?? []).slice(0, 2).map((c: { message: string }) => ({
            repo: e.repo.name.split('/')[1],
            message: c.message.split('\n')[0].slice(0, 60),
            date: new Date(e.created_at).toLocaleDateString('es-PE'),
          }))
        );
      return pushEvents.slice(0, 10);
    } catch {
      return [];
    }
  },
};
