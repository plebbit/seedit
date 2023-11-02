import { useMemo } from 'react';
import { useClientsStates } from '@plebbit/plebbit-react-hooks';

interface CommentOrSubplebbit {
  state?: string;
  publishingState?: string;
  updatingState?: string;
}

interface States {
  [key: string]: string[];
}

const clientHosts: { [key: string]: string } = {};

const getClientHost = (clientUrl: string): string => {
  if (!clientHosts[clientUrl]) {
    try {
      clientHosts[clientUrl] = new URL(clientUrl).hostname || clientUrl;
    } catch (e) {
      clientHosts[clientUrl] = clientUrl;
    }
  }
  return clientHosts[clientUrl];
};

const useStateString = (commentOrSubplebbit: CommentOrSubplebbit): string | undefined => {
  const { states } = useClientsStates({ comment: commentOrSubplebbit }) as { states: States };
  return useMemo(() => {
    let stateString: string | undefined = '';

    for (const state in states) {
      const clientUrls = states[state];
      const clientHosts = clientUrls.map((clientUrl) => getClientHost(clientUrl));

      if (clientHosts.length === 0) {
        continue;
      }

      if (stateString) {
        stateString += ', ';
      }

      const formattedState = state.replaceAll('-', ' ').replace('ipfs', 'IPFS').replace('ipns', 'IPNS');
      stateString += `${formattedState} from ${clientHosts.join(', ')}`;
    }

    if (!stateString && commentOrSubplebbit?.state !== 'succeeded') {
      if (commentOrSubplebbit?.publishingState && commentOrSubplebbit?.publishingState !== 'stopped' && commentOrSubplebbit?.publishingState !== 'succeeded') {
        stateString = commentOrSubplebbit.publishingState;
      } else if (commentOrSubplebbit?.updatingState !== 'stopped' && commentOrSubplebbit?.updatingState !== 'succeeded') {
        stateString = commentOrSubplebbit.updatingState;
      }
      if (stateString) {
        stateString = stateString.replaceAll('-', ' ').replace('ipfs', 'IPFS').replace('ipns', 'IPNS');
      }
    }

    if (stateString) {
      stateString = stateString.charAt(0).toUpperCase() + stateString.slice(1);
    }

    return stateString === '' ? undefined : stateString;
  }, [states, commentOrSubplebbit]);
};

export default useStateString;
