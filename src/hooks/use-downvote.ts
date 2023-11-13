import { useMemo } from 'react';
import { ChallengeVerification, Comment, usePublishVote, useAccountVote } from '@plebbit/plebbit-react-hooks';
import { alertChallengeVerificationFailed } from '../lib/utils/challenge-utils';
import useChallengesStore from './use-challenges';

const useDownvote = (comment: Comment): [boolean, () => void] => {
  const { addChallenge } = useChallengesStore();
  const { vote } = useAccountVote({ commentCid: comment?.cid });

  const publishVoteOptions = useMemo(
    () => ({
      commentCid: comment?.cid,
      vote: vote !== -1 ? -1 : 0,
      subplebbitAddress: comment?.subplebbitAddress,
      onChallenge: (...args: any) => {
        return new Promise<void>((resolve) => {
          addChallenge([...args, comment]);
          resolve();
        });
      },
      onChallengeVerification: (challengeVerification: ChallengeVerification, publication: any) =>
        new Promise<void>((resolve) => {
          alertChallengeVerificationFailed(challengeVerification, publication);
          resolve();
        }),
      onError: (error: Error) => {
        console.error(error);
        // TODO: remove this explanation when pubsub providers uptime is fixed:
        let errorMessage = error.message;
        if (errorMessage === "The challenge request has been published over the pubsub topic but no response was received") {
          errorMessage += ". This means seedit web is currently offline, download seedit desktop which is fully peer-to-peer: https://github.com/plebbit/seedit/releases/latest";
        }
        alert(errorMessage);
      },
    }),
    [comment, vote, addChallenge],
  );
  const { publishVote } = usePublishVote(publishVoteOptions);

  return [vote === -1, publishVote];
};

export default useDownvote;
