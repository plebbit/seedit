import { ChallengeVerification } from '@plebbit/plebbit-react-hooks';

export const alertChallengeVerificationFailed = (challengeVerification: ChallengeVerification, publication: any) => {
  if (challengeVerification?.challengeSuccess === false) {
    console.warn(challengeVerification, publication);
    alert(`p/${publication?.subplebbitAddress} challenge error: ${[...(challengeVerification?.challengeErrors || []), challengeVerification?.reason].join(' ')}`);
  } else {
    console.log(challengeVerification, publication);
  }
};
