import { useEffect } from 'react';
import { useAccount, setAccount } from '@plebbit/plebbit-react-hooks';
import { getAutoSubscribeAddresses } from './use-default-subplebbits';

const AUTO_SUBSCRIBE_KEY_PREFIX = 'seedit-auto-subscribe-done-';
const AUTO_SUBSCRIBE_DELAY = 200;

export const useAutoSubscribe = () => {
  const account = useAccount();
  const accountAddress = account?.author?.address;
  const hasExistingSubscriptions = account?.subscriptions?.length > 0;

  useEffect(() => {
    if (!accountAddress || hasExistingSubscriptions) return;

    const storageKey = AUTO_SUBSCRIBE_KEY_PREFIX + accountAddress;
    const hasAutoSubscribed = localStorage.getItem(storageKey);

    if (!hasAutoSubscribed) {
      const initialDelay = setTimeout(() => {
        const autoSubscribeAddresses = getAutoSubscribeAddresses();

        if (autoSubscribeAddresses.length) {
          const newSubscriptions = Array.from(new Set([...(account.subscriptions || []), ...autoSubscribeAddresses]));

          setAccount({
            ...account,
            subscriptions: newSubscriptions,
          });

          localStorage.setItem(storageKey, 'true');
        }
      }, AUTO_SUBSCRIBE_DELAY);

      return () => clearTimeout(initialDelay);
    }
  }, [accountAddress, account, hasExistingSubscriptions]);
};
