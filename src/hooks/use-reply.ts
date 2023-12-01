import { useMemo } from 'react';
import { ChallengeVerification, Comment, PublishCommentOptions, usePublishComment } from '@plebbit/plebbit-react-hooks';
import { create } from 'zustand';
import useChallengesStore from './use-challenges';
import { alertChallengeVerificationFailed } from '../lib/utils/challenge-utils';

type SetReplyStoreData = {
  subplebbitAddress: string;
  parentCid: string;
  content: string | undefined;
  link: string | undefined;
  spoiler: boolean;
};

type ReplyState = {
  content: { [parentCid: string]: string | undefined };
  link: { [parentCid: string]: string | undefined };
  spoiler: { [parentCid: string]: boolean | undefined };
  publishCommentOptions: PublishCommentOptions;
  setReplyStore: (data: SetReplyStoreData) => void;
  resetReplyStore: (parentCid: string) => void;
};

const { addChallenge } = useChallengesStore.getState();

const useReplyStore = create<ReplyState>((set) => ({
  content: {},
  link: {},
  spoiler: {},
  publishCommentOptions: {},
  setReplyStore: (data: SetReplyStoreData) =>
    set((state) => {
      const { subplebbitAddress, parentCid, content, link, spoiler } = data;
      const publishCommentOptions = {
        subplebbitAddress,
        parentCid,
        content,
        link,
        spoiler,
        onChallenge: (...args: any) => addChallenge(args),
        onChallengeVerification: (challengeVerification: ChallengeVerification, comment: Comment) => {
          alertChallengeVerificationFailed(challengeVerification, comment);
        },
        onError: (error: Error) => {
          console.error(error);
          // TODO: remove this explanation when pubsub providers uptime is fixed:
          let errorMessage = error.message;
          if (errorMessage === 'The challenge request has been published over the pubsub topic but no response was received') {
            errorMessage +=
              '. This means seedit web is currently offline, download seedit desktop which is fully peer-to-peer: https://github.com/plebbit/seedit/releases/latest';
          }
          alert(errorMessage);
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

const useReply = (comment: Comment) => {
  const subplebbitAddress = comment?.subplebbitAddress;
  const parentCid = comment?.cid;

  const { content, link, spoiler, publishCommentOptions } = useReplyStore(state => ({
    content: state.content[parentCid],
    link: state.link[parentCid],
    spoiler: state.spoiler[parentCid],
    publishCommentOptions: state.publishCommentOptions[parentCid],
  }));
  
  const setReplyStore = useReplyStore((state) => state.setReplyStore);
  const resetReplyStore = useReplyStore((state) => state.resetReplyStore);

  const setContent = useMemo(() => ({
    content: (newContent: string) => setReplyStore({ subplebbitAddress, parentCid, content: newContent, link: link || undefined, spoiler: spoiler || false }),
    link: (newLink: string) => setReplyStore({ subplebbitAddress, parentCid, content: content, link: newLink || undefined, spoiler: spoiler || false }),
    spoiler: (newSpoiler: boolean) => setReplyStore({ subplebbitAddress, parentCid, content: content, link: link || undefined, spoiler: newSpoiler }),
  }), [subplebbitAddress, parentCid, setReplyStore, content, link, spoiler]);

  const resetContent = useMemo(() => () => resetReplyStore(parentCid), [parentCid, resetReplyStore]);

  const { index, publishComment } = usePublishComment(publishCommentOptions);

  return { setContent, resetContent, replyIndex: index, publishReply: publishComment };
};

export default useReply;
