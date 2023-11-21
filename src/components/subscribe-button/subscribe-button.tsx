import { useSubscribe } from '@plebbit/plebbit-react-hooks';
import styles from './subscribe-button.module.css';

interface subscribeButtonProps {
  address: string | undefined;
}

const SubscribeButton = ({ address }: subscribeButtonProps) => {
  const { subscribe, subscribed, unsubscribe } = useSubscribe({ subplebbitAddress: address });

  const handleSubscribe = async () => {
    try {
      if (subscribed === false) {
        await subscribe();
      } else if (subscribed === true) {
        await unsubscribe();
      }
    } catch (error) {
      if (error instanceof Error) {
        alert(error.message);
        console.log(error);
      } else {
        console.error('An unknown error occurred:', error);
      }
    }
  };

  return (
    <span className={`${styles.subscribeButton} ${subscribed ? styles.leaveButton : styles.joinButton}`} onClick={handleSubscribe}>
      {subscribed ? 'leave' : 'join'}
    </span>
  );
};

export default SubscribeButton;
