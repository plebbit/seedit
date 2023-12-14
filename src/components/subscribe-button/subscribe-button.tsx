import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useSubscribe } from '@plebbit/plebbit-react-hooks';
import styles from './subscribe-button.module.css';
import { isAuthorView, isProfileView } from '../../lib/utils/view-utils';

interface subscribeButtonProps {
  address: string | undefined;
}

const SubscribeButton = ({ address }: subscribeButtonProps) => {
  const { subscribe, subscribed, unsubscribe } = useSubscribe({ subplebbitAddress: address });
  const { t } = useTranslation();
  const location = useLocation();
  const isAuthorPage = isAuthorView(location.pathname);
  const isProfilePage = isProfileView(location.pathname);
  const subplebbitPageString = subscribed ? `${t('leave')}` : `${t('join')}`;
  const authorPageString = '+ friends'; // TODO: add functionality once implemented in backend

  const handleSubscribe = () => {
    if (isAuthorPage) return; // TODO: remove once implemented in backend

    if (subscribed === false) {
      subscribe();
    } else if (subscribed === true) {
      unsubscribe();
    }
  };

  return (
    <span className={`${isProfilePage ? styles.hidden : ''} ${styles.subscribeButton} ${subscribed ? styles.leaveButton : styles.joinButton}`} onClick={handleSubscribe}>
      {isAuthorPage ? authorPageString : subplebbitPageString}
    </span>
  );
};

export default SubscribeButton;
