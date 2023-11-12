import { ChallengeVerification } from '@plebbit/plebbit-react-hooks';

export const alertChallengeVerificationFailed = (challengeVerification: ChallengeVerification, publication: any) => {
  if (challengeVerification?.challengeSuccess === false) {
    console.warn(challengeVerification, publication);
    alert(`p/${publication?.subplebbitAddress} challenge error: ${[...(challengeVerification?.challengeErrors || []), challengeVerification?.reason].join(' ')}`);
  } else {
    console.log(challengeVerification, publication);
  }
};

export const getPublicationType = (publication: any) => {
  if (!publication) {
    return
  }
  if (typeof publication.vote === 'number') {
    return 'vote'
  }
  if (publication.parentCid) {
    return 'reply'
  }
  if (publication.commentCid) {
    return 'edit'
  }
  return 'post'
}

export const getVotePreview = (publication: any) => {
  if (typeof publication?.vote !== 'number') {
    return ''
  }
  let votePreview = ''
  if (publication.vote === -1) {
    votePreview += ' -1'
  } else {
    votePreview += ` +${publication.vote}`
  }
  return votePreview
}

export const getPublicationPreview = (publication: any) => {
  if (!publication) {
    return ''
  }
  let publicationPreview = ''
  if (publication.title) {
    publicationPreview += publication.title
  }
  if (publication.content) {
    if (publicationPreview) {
      publicationPreview += ': '
    }
    publicationPreview += publication.content
  }
  if (!publicationPreview && publication.link) {
    publicationPreview += publication.link
  }

  if (publicationPreview.length > 50) {
    publicationPreview = publicationPreview.substring(0, 50) + '...'
  }
  return publicationPreview
}
