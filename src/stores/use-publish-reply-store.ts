import { PublishCommentOptions } from '@plebbit/plebbit-react-hooks';
import { ChallengeVerification, Comment } from '@plebbit/plebbit-react-hooks';
import { create } from 'zustand';
import useChallengesStore from './use-challenges-store';
import { alertChallengeVerificationFailed } from '../lib/utils/challenge-utils';

type ReplyState = {
  content: { [parentCid: string]: string | undefined };
  link: { [parentCid: string]: string | undefined };
  spoiler: { [parentCid: string]: boolean | undefined };
  publishCommentOptions: PublishCommentOptions;
  setReplyStore: (comment: Comment) => void;
  resetReplyStore: (parentCid: string) => void;
};

const { addChallenge } = useChallengesStore.getState();

const usePublishReplyStore = create<ReplyState>((set) => ({
  content: {},
  link: {},
  spoiler: {},
  publishCommentOptions: {},
  setReplyStore: (comment: Comment) =>
    set((state) => {
      const { subplebbitAddress, parentCid, content, link, spoiler } = comment;
      const publishCommentOptions = {
        subplebbitAddress,
        parentCid,
        postCid: comment?.postCid || parentCid,
        content,
        link,
        spoiler,
        onChallenge: (...args: any) => addChallenge(args),
        onChallengeVerification: (challengeVerification: ChallengeVerification, comment: Comment) => {
          alertChallengeVerificationFailed(challengeVerification, comment);
        },
        onError: (error: Error) => {
          console.error(error);
          alert(error.message);
        },
      };
      return {
        content: { ...state.content, [parentCid]: content },
        link: { ...state.link, [parentCid]: link },
        spoiler: { ...state.spoiler, [parentCid]: spoiler },
        publishCommentOptions: { ...state.publishCommentOptions, [parentCid]: publishCommentOptions },
      };
    }),

  resetReplyStore: (parentCid) =>
    set((state) => ({
      content: { ...state.content, [parentCid]: undefined },
      link: { ...state.link, [parentCid]: undefined },
      spoiler: { ...state.spoiler, [parentCid]: undefined },
      publishCommentOptions: { ...state.publishCommentOptions, [parentCid]: undefined },
    })),
}));

export default usePublishReplyStore;
