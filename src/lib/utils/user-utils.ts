import { Role, Subplebbit, Comment } from "@plebbit/plebbit-react-hooks";

type RolesCollection = Record<string, Role>;

export const findSubplebbitCreator = (roles: RolesCollection | undefined): string => {
  if (!roles) {
    return 'anonymous';
  }

  const owner = Object.keys(roles).find(key => roles[key].role === 'owner');
  if (owner) {
    return owner;
  }

  return 'anonymous';
};

export const findAuthorSubplebbits = (authorAddress: string | undefined, subplebbits: (Subplebbit | undefined)[]): string[] => {
  let authorSubplebbits: string[] = [];

  if (!authorAddress || !subplebbits) {
    return [];
  }

  subplebbits.forEach(subplebbit => {
    if (subplebbit && subplebbit.roles?.[authorAddress]) {
      authorSubplebbits.push(subplebbit.address);
    }
  });

  return authorSubplebbits;
};

interface Score {
  postScore: number;
  replyScore: number;
}

export const estimateAuthorKarma = (accountComments: (Comment | undefined)[]): Score => {
  let postScore = 0;
  let replyScore = 0;

  accountComments.forEach(comment => {
    if (comment) {
      const score = comment.upvoteCount - comment.downvoteCount;
      if (comment.parentCid) {
        replyScore += score;
      } else {
        postScore += score;
      }
    }
  });

  return { postScore, replyScore };
};