import { create } from 'zustand';
import challengesStore from './use-challenges-store';
import { PublishCommentOptions } from '@plebbit/plebbit-react-hooks';
import { alertChallengeVerificationFailed } from '../lib/utils/challenge-utils';

type SubmitState = {
  subplebbitAddress: string | undefined;
  title: string | undefined;
  content: string | undefined;
  link: string | undefined;
  publishCommentOptions: PublishCommentOptions;
  spoiler: boolean | undefined;
  setSubmitStore: (data: Partial<SubmitState>) => void;
  resetSubmitStore: () => void;
};

const { addChallenge } = challengesStore.getState();

const useSubmitStore = create<SubmitState>((set) => ({
  subplebbitAddress: undefined,
  title: undefined,
  content: undefined,
  link: undefined,
  spoiler: undefined,
  publishCommentOptions: {},
  setSubmitStore: ({ subplebbitAddress, title, content, link, spoiler }) =>
    set((state) => {
      const nextState = { ...state };
      if (subplebbitAddress !== undefined) nextState.subplebbitAddress = subplebbitAddress;
      if (title !== undefined) nextState.title = title || undefined;
      if (content !== undefined) nextState.content = content || undefined;
      if (link !== undefined) nextState.link = link || undefined;
      if (spoiler !== undefined) nextState.spoiler = spoiler || undefined;

      nextState.publishCommentOptions = {
        ...nextState,
        onChallenge: (...args: any) => addChallenge(args),
        onChallengeVerification: alertChallengeVerificationFailed,
        onError: (error: Error) => {
          console.error(error);
          let errorMessage = error.message;
          alert(errorMessage);
        },
      };
      return nextState;
    }),
  resetSubmitStore: () => set({ subplebbitAddress: undefined, title: undefined, content: undefined, link: undefined, spoiler: undefined, publishCommentOptions: {} }),
}));

export default useSubmitStore;
