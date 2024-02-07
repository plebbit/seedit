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

export const getDefaultChallengeDescription = (challengeType: string) => {
  switch (challengeType) {
    case 'text-math':
      return 'Ask a plain text math question, insecure, use ONLY for testing.';
    case 'captcha-canvas-v3':
      return 'make custom image captcha';
    case 'fail':
      return 'A challenge that automatically fails with a custom error message.';
    case 'blacklist':
      return 'Blacklist author addresses.';
    case 'question':
      return "Ask a question, like 'What is the password?'";
    case 'evm-contract-call':
      return 'The response from an EVM contract call passes a condition, e.g. a token balance challenge.';
    default:
      return '';
  }
};

export const getDefaultChallengeOptions = (challengeType: string) => {
  switch (challengeType) {
    case 'text-math':
      return {
        difficulty: '',
      };
    case 'captcha-canvas-v3':
      return {
        characters: '',
        height: '',
        width: '',
        color: '',
      };
    case 'fail':
      return {
        error: '',
      };
    case 'blacklist':
      return {
        blacklist: '',
        error: '',
      };
    case 'question':
      return {
        question: '',
        answer: '',
      };
    case 'evm-contract-call':
      return {
        chainTicker: '',
        address: '',
        abi: '',
        condition: '',
        error: '',
      };
    default:
      return {};
  }
};

export type OptionInput = {
  option: string;
  label: string;
  default?: string;
  description: string;
  placeholder?: string;
  required?: boolean;
};

export type Exclude = {
  postScore?: number;
  postReply?: number;
  firstCommentTimestamp?: number;
  challenges?: number[];
  post?: boolean;
  reply?: boolean;
  vote?: boolean;
  role?: string[];
  address?: string[];
  rateLimit?: number;
  rateLimitChallengeSuccess?: boolean;
};

export const getDefaultChallengeSettings = (challengeType: string) => {
  switch (challengeType) {
    case 'text-math':
      return [
        {
          option: 'difficulty',
          label: 'Difficulty',
          default: '1',
          description: 'The math difficulty of the challenge between 1-3.',
          placeholder: '1',
        },
      ];
    case 'captcha-canvas-v3':
      return [
        {
          option: 'characters',
          label: 'Characters',
          description: 'Amount of characters of the captcha.',
          default: '6',
          placeholder: 'example: 6',
        },
        {
          option: 'height',
          label: 'Height',
          description: 'Height of the captcha.',
          default: '100',
          placeholder: 'example: 100',
        },
        {
          option: 'width',
          label: 'Width',
          description: 'Width of the captcha.',
          default: '300',
          placeholder: 'example: 300',
        },
        {
          option: 'color',
          label: 'Color',
          description: 'Color of the captcha.',
          default: '#32cf7e',
          placeholder: 'example: #ff0000,#00ff00,#0000ff',
        },
      ];
    case 'fail':
      return [
        {
          option: 'error',
          label: 'Error',
          default: "You're not allowed to publish.",
          description: 'The error to display to the author.',
          placeholder: "You're not allowed to publish.",
        },
      ];
    case 'blacklist':
      return [
        {
          option: 'blacklist',
          label: 'Blacklist',
          default: '',
          description: 'Comma separated list of author addresses to be blacklisted.',
          placeholder: 'address1.eth,address2.eth,address3.eth',
        },
        {
          option: 'error',
          label: 'Error',
          default: "You're blacklisted.",
          description: 'The error to display to the author.',
          placeholder: "You're blacklisted.",
        },
      ];
    case 'question':
      return [
        {
          option: 'question',
          label: 'Question',
          default: '',
          description: 'The question to answer.',
          placeholder: '',
        },
        {
          option: 'answer',
          label: 'Answer',
          default: '',
          description: 'The answer to the question.',
          placeholder: '',
          required: true,
        },
      ];
    case 'evm-contract-call':
      return [
        {
          option: 'chainTicker',
          label: 'chainTicker',
          default: 'eth',
          description: 'The chain ticker',
          placeholder: 'eth',
          required: true,
        },
        {
          option: 'address',
          label: 'Address',
          default: '',
          description: 'The contract address.',
          placeholder: '0x...',
          required: true,
        },
        {
          option: 'abi',
          label: 'ABI',
          default: '',
          description: 'The ABI of the contract method.',
          placeholder: '{"constant":true,"inputs":[{"internalType":"address","name":"account...',
          required: true,
        },
        {
          option: 'condition',
          label: 'Condition',
          default: '',
          description: 'The condition the contract call response must pass.',
          placeholder: '>1000',
          required: true,
        },
        {
          option: 'error',
          label: 'Error',
          default: "Contract call response doesn't pass condition.",
          description: 'The error to display to the author.',
        },
      ];
    default:
      return [];
  }
};
