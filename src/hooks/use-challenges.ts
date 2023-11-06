import { create } from 'zustand';
import { Challenge } from '@plebbit/plebbit-react-hooks';

interface State {
  challenges: Challenge[];
}

interface Actions extends State {
  addChallenge: (challenge: Challenge) => void;
  removeChallenge: () => void;
}

const useChallengesStore = create<Actions>((set) => ({
  challenges: [],
  addChallenge: (challenge: Challenge) => {
    set((state) => ({ challenges: [...state.challenges, challenge] }));
  },
  removeChallenge: () => {
    set((state) => {
      const challenges = [...state.challenges];
      challenges.shift();
      return { challenges };
    });
  },
}));

export default useChallengesStore;
