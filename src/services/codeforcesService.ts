// src/services/codeforcesService.ts
// Fetch automático del CF Rating desde la API pública de Codeforces

export type CFRatingChange = {
  contestId: number;
  contestName: string;
  ratingUpdateTimeSeconds: number;
  oldRating: number;
  newRating: number;
};

export type CFUserInfo = {
  handle: string;
  rating: number;
  maxRating: number;
  rank: string;
};

export const codeforcesService = {
  async getUserInfo(handle: string): Promise<CFUserInfo | null> {
    try {
      const res = await fetch(`https://codeforces.com/api/user.info?handles=${handle}`);
      const data = await res.json();
      if (data.status !== 'OK') return null;
      const u = data.result[0];
      return {
        handle: u.handle,
        rating: u.rating ?? 0,
        maxRating: u.maxRating ?? 0,
        rank: u.rank ?? 'unrated',
      };
    } catch {
      return null;
    }
  },

  async getRatingHistory(handle: string): Promise<CFRatingChange[]> {
    try {
      const res = await fetch(`https://codeforces.com/api/user.rating?handle=${handle}`);
      const data = await res.json();
      if (data.status !== 'OK') return [];
      // Últimos 20 contests
      return (data.result as CFRatingChange[]).slice(-20);
    } catch {
      return [];
    }
  },

  rankColor(rank: string): string {
    const map: Record<string, string> = {
      'newbie': '#808080',
      'pupil': '#008000',
      'specialist': '#03a89e',
      'expert': '#0000ff',
      'candidate master': '#aa00aa',
      'master': '#ff8c00',
      'international master': '#ff8c00',
      'grandmaster': '#ff0000',
      'international grandmaster': '#ff0000',
      'legendary grandmaster': '#ff0000',
    };
    return map[rank.toLowerCase()] ?? '#7c6af5';
  },
};
