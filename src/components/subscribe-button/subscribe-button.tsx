import { useSubscribe } from '@plebbit/plebbit-react-hooks';
import styles from './subscribe-button.module.css';
import { useTranslation } from 'react-i18next';

interface subscribeButtonProps {
  address: string | undefined;
}

const SubscribeButton = ({ address }: subscribeButtonProps) => {
  const { subscribe, subscribed, unsubscribe } = useSubscribe({ subplebbitAddress: address });
  const { t } = useTranslation();

  const handleSubscribe =  () => {
    if (subscribed === false) {
      subscribe();
    } else if (subscribed === true) {
      unsubscribe();
    }
  };

  return (
    <span className={`${styles.subscribeButton} ${subscribed ? styles.leaveButton : styles.joinButton}`} onClick={handleSubscribe}>
      {subscribed ? `${t('leave')}` : `${t('join')}`}
    </span>
  );
};

export default SubscribeButton;
