import { create } from 'zustand';
import challengesStore from './use-challenges-store';
import { Comment, PublishCommentOptions } from '@plebbit/plebbit-react-hooks';
import { alertChallengeVerificationFailed } from '../lib/utils/challenge-utils';

const { addChallenge } = challengesStore.getState();

type SubmitState = {
  subplebbitAddress: string | undefined;
  title: string | undefined;
  content: string | undefined;
  link: string | undefined;
  spoiler: boolean | undefined;
  publishCommentOptions: PublishCommentOptions;
  setPublishPostStore: (comment: Comment) => void;
  resetPublishPostStore: () => void;
};

const usePublishPostStore = create<SubmitState>((set) => ({
  subplebbitAddress: undefined,
  title: undefined,
  content: undefined,
  link: undefined,
  spoiler: undefined,
  publishCommentOptions: {},
  setPublishPostStore: (comment) =>
    set((state) => {
      const nextState = { ...state };
      const { subplebbitAddress, title, content, link, spoiler } = comment;

      if (subplebbitAddress !== undefined) nextState.subplebbitAddress = subplebbitAddress;
      if (title !== undefined) nextState.title = title;
      if (content !== undefined) nextState.content = content;
      if (link !== undefined) nextState.link = link;
      if (spoiler !== undefined) nextState.spoiler = spoiler;

      nextState.publishCommentOptions = {
        subplebbitAddress: nextState.subplebbitAddress,
        title: nextState.title,
        content: nextState.content,
        link: nextState.link,
        spoiler: nextState.spoiler,
        onChallenge: (...args: any) => addChallenge(args),
        onChallengeVerification: alertChallengeVerificationFailed,
        onError: (error: Error) => {
          console.error(error);
          alert(error.message);
        },
      };

      return nextState;
    }),
  resetPublishPostStore: () =>
    set({
      subplebbitAddress: undefined,
      title: undefined,
      content: undefined,
      link: undefined,
      spoiler: undefined,
      publishCommentOptions: {},
    }),
}));

export default usePublishPostStore;
