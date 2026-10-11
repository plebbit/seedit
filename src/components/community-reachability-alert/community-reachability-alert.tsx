import { useAccount } from '@bitsocial/bitsocial-react-hooks';
import { useTranslation } from 'react-i18next';
import { useNodeReachability } from '../../hooks/use-node-reachability';

const isLoopbackRpcUrl = (rpcUrl: string) => {
  try {
    const { hostname } = new URL(rpcUrl);
    return hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '[::1]';
  } catch {
    return false;
  }
};

interface CommunityReachabilityAlertProps {
  className: string;
  // pkc-js only exposes a community's private settings to the node that hosts it, so callers pass Boolean(community.settings).
  isHostedHere: boolean;
}

/** Tells the owner when browsers cannot load a community hosted by this desktop app, because its node is behind NAT. */
const CommunityReachabilityAlert = ({ className, isHostedHere }: CommunityReachabilityAlertProps) => {
  const { t } = useTranslation();
  const rpcUrls = useAccount()?.pkcOptions?.pkcRpcClientsOptions as string[] | undefined;
  // The reachability check reads the app's own node, so it only applies when the account uses that node.
  const isUsingOwnNode = (rpcUrls ?? []).every(isLoopbackRpcUrl);
  const reachability = useNodeReachability(isHostedHere && isUsingOwnNode);

  if (reachability !== 'private') {
    return null;
  }

  return (
    <div className={className} role='status'>
      {t('community_unreachable_from_browsers')}
    </div>
  );
};

export default CommunityReachabilityAlert;
