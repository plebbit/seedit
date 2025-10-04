import { create } from 'zustand';
import { Challenge } from '@plebbit/plebbit-react-hooks';

interface State {
  challenges: Challenge[];
  addChallenge: (challenge: Challenge) => void;
  removeChallenge: () => void;
  iframeModalOpen: boolean;
  iframeModalUrl: string | null;
  iframeModalPublication: any;
  openIframeModal: (url: string, publication: any) => void;
  closeIframeModal: () => void;
}

// Store challenges in localStorage with a 5-minute expiration
const CHALLENGE_STORAGE_KEY = 'plebbit_recent_challenges';
const CHALLENGE_EXPIRATION_MS = 5 * 60 * 1000; // 5 minutes

const storeChallengeInLocalStorage = (challenge: Challenge) => {
  try {
    const challenges = challenge?.[0]?.challenges;
    if (challenges && Array.isArray(challenges)) {
      const storedChallenges = challenges.map((c) => ({
        type: c.type,
        challenge: c.challenge,
        timestamp: Date.now(),
      }));
      localStorage.setItem(CHALLENGE_STORAGE_KEY, JSON.stringify(storedChallenges));
    }
  } catch (error) {
    console.error('Failed to store challenge in localStorage:', error);
  }
};

export const getRecentChallengeFromLocalStorage = () => {
  try {
    const stored = localStorage.getItem(CHALLENGE_STORAGE_KEY);
    if (!stored) return null;

    const challenges = JSON.parse(stored);
    if (!Array.isArray(challenges) || challenges.length === 0) return null;

    // Check if expired
    const firstChallenge = challenges[0];
    if (Date.now() - firstChallenge.timestamp > CHALLENGE_EXPIRATION_MS) {
      localStorage.removeItem(CHALLENGE_STORAGE_KEY);
      return null;
    }

    return challenges;
  } catch (error) {
    console.error('Failed to get challenge from localStorage:', error);
    return null;
  }
};

export const clearChallengeFromLocalStorage = () => {
  try {
    localStorage.removeItem(CHALLENGE_STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear challenge from localStorage:', error);
  }
};

const useChallengesStore = create<State>((set) => ({
  challenges: [],
  addChallenge: (challenge: Challenge) => {
    storeChallengeInLocalStorage(challenge);
    set((state) => ({ challenges: [...state.challenges, challenge] }));
  },
  removeChallenge: () => {
    set((state) => {
      const challenges = [...state.challenges];
      challenges.shift();
      return { challenges };
    });
  },
  iframeModalOpen: false,
  iframeModalUrl: null,
  iframeModalPublication: null,
  openIframeModal: (url: string, publication: any) => {
    set({ iframeModalOpen: true, iframeModalUrl: url, iframeModalPublication: publication });
  },
  closeIframeModal: () => {
    set({ iframeModalOpen: false, iframeModalUrl: null, iframeModalPublication: null });
    // Clear localStorage when iframe modal is closed since challenge is handled
    clearChallengeFromLocalStorage();
  },
}));

export default useChallengesStore;
