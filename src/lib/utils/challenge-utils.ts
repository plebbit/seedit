import { ChallengeVerification } from '@plebbit/plebbit-react-hooks';
import useChallengesStore, { getRecentChallengeFromLocalStorage, clearChallengeFromLocalStorage } from '../../stores/use-challenges-store';

export const alertChallengeVerificationFailed = (challengeVerification: ChallengeVerification, publication: any) => {
  if (challengeVerification?.challengeSuccess === false) {
    console.warn('Challenge Verification Failed:', challengeVerification, 'Publication:', publication);

    // Check for iframe challenges - either proper text/url-iframe challenges or mintpass URLs in error messages
    let iframeUrl = null;

    // First check for proper text/url-iframe challenges
    const recentChallenges = getRecentChallengeFromLocalStorage();
    if (recentChallenges && Array.isArray(recentChallenges)) {
      const iframeChallenge = recentChallenges.find((c) => c.type === 'text/url-iframe');
      if (iframeChallenge && iframeChallenge.challenge) {
        iframeUrl = iframeChallenge.challenge;
      }
    }

    // If no proper iframe challenge found, check for mintpass URLs in error messages
    if (!iframeUrl) {
      // Extract URL from challengeErrors
      if (challengeVerification?.challengeErrors) {
        const errors = Array.isArray(challengeVerification.challengeErrors)
          ? challengeVerification.challengeErrors
          : Object.values(challengeVerification.challengeErrors);

        for (const error of errors) {
          if (typeof error === 'string') {
            const urlMatch = error.match(/https?:\/\/[^\s]+/);
            if (urlMatch && urlMatch[0].includes('mintpass.org')) {
              iframeUrl = urlMatch[0];
              break;
            }
          }
        }
      }

      // Also check reason field
      if (!iframeUrl && challengeVerification?.reason) {
        const urlMatch = challengeVerification.reason.match(/https?:\/\/[^\s]+/);
        if (urlMatch && urlMatch[0].includes('mintpass.org')) {
          iframeUrl = urlMatch[0];
        }
      }
    }

    if (iframeUrl) {
      // Open iframe modal instead of showing alert
      const { openIframeModal } = useChallengesStore.getState();
      openIframeModal(iframeUrl, publication);
      clearChallengeFromLocalStorage();
      return;
    }

    // Clear localStorage if no iframe challenge was found (cleanup)
    clearChallengeFromLocalStorage();

    let errorMessages: string[] = [];
    if (challengeVerification?.challengeErrors) {
      if (
        typeof challengeVerification.challengeErrors === 'object' &&
        challengeVerification.challengeErrors !== null &&
        !Array.isArray(challengeVerification.challengeErrors)
      ) {
        errorMessages = Object.values(challengeVerification.challengeErrors).filter((val): val is string => typeof val === 'string');
      } else if (Array.isArray(challengeVerification.challengeErrors)) {
        errorMessages = [...challengeVerification.challengeErrors];
      } else {
        console.warn('challengeVerification.challengeErrors is not an object or array:', challengeVerification.challengeErrors);
      }
    }

    if (challengeVerification?.reason) {
      errorMessages.push(challengeVerification.reason);
    }

    const finalMessage = errorMessages.filter(Boolean).join(' ');

    alert(`p/${publication?.subplebbitAddress} error: ${finalMessage || 'unknown error'}`);
  } else {
    console.warn('Challenge verification succeeded but no action taken:', challengeVerification);
  }
};

export const getPublicationType = (publication: any) => {
  if (!publication) {
    return;
  }
  if (typeof publication.vote === 'number') {
    return 'vote';
  }
  if (publication.parentCid) {
    return 'reply';
  }
  if (publication.commentCid) {
    return 'edit';
  }
  return 'post';
};

export const getVotePreview = (publication: any) => {
  if (typeof publication?.vote !== 'number') {
    return '';
  }
  let votePreview = '';
  if (publication.vote === -1) {
    votePreview += ' -1';
  } else {
    votePreview += ` +${publication.vote}`;
  }
  return votePreview;
};

export const getPublicationPreview = (publication: any) => {
  if (!publication) {
    return '';
  }
  let publicationPreview = '';
  if (publication.title) {
    publicationPreview += publication.title;
  }
  if (publication.content) {
    if (publicationPreview) {
      publicationPreview += ': ';
    }
    publicationPreview += publication.content;
  }
  if (!publicationPreview && publication.link) {
    publicationPreview += publication.link;
  }

  if (publicationPreview.length > 50) {
    publicationPreview = publicationPreview.substring(0, 50) + '...';
  }
  return publicationPreview;
};
