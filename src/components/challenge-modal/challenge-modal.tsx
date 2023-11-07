import { useState } from 'react';
import { FloatingFocusManager, useClick, useDismiss, useFloating, useId, useInteractions, useRole } from '@floating-ui/react';
import { Challenge as ChallengeType } from '@plebbit/plebbit-react-hooks';
import useChallenges from '../../hooks/use-challenges';
import styles from './challenge-modal.module.css';

interface ChallengeProps {
  challenge: ChallengeType;
  closeModal: () => void;
}

const Challenge = ({ challenge, closeModal }: ChallengeProps) => {
  const challenges = challenge?.[0]?.challenges;
  const publication = challenge?.[1];

  const [currentChallengeIndex, setCurrentChallengeIndex] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);

  const onAnswersChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAnswers((prevAnswers) => {
      const updatedAnswers = [...prevAnswers];
      updatedAnswers[currentChallengeIndex] = e.target.value;
      return updatedAnswers;
    });
  };

  const onSubmit = () => {
    publication.publishChallengeAnswers(answers);
    setAnswers([]);
    closeModal();
  };

  const onEnterKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== 'Enter') return;
    if (challenges[currentChallengeIndex + 1]) {
      setCurrentChallengeIndex((prev) => prev + 1);
    } else {
      onSubmit();
    }
  };

  return (
    <div className={styles.container}>
      <div>Challenge</div>
      <div className={styles.challengeMediaWrapper}>
        <img alt='challenge' className={styles.challengeMedia} src={`data:image/png;base64,${challenges[currentChallengeIndex]?.challenge}`} />
      </div>
      <div>
        <input onKeyPress={onEnterKey} onChange={onAnswersChange} value={answers[currentChallengeIndex] || ''} className={styles.challengeInput} />
      </div>
      <div className={styles.challengeFooter}>
        <div className={styles.counter}>
          {currentChallengeIndex + 1} of {challenges?.length}
        </div>
        <span className={styles.buttons}>
          <button onClick={closeModal}>Cancel</button>
          {challenges.length > 1 && (
            <button disabled={!challenges[currentChallengeIndex - 1]} onClick={() => setCurrentChallengeIndex((prev) => prev - 1)}>
              Previous
            </button>
          )}
          {challenges[currentChallengeIndex + 1] && <button onClick={() => setCurrentChallengeIndex((prev) => prev + 1)}>Next</button>}
          {!challenges[currentChallengeIndex + 1] && <button onClick={onSubmit}>Submit</button>}
        </span>
      </div>
    </div>
  );
};

const ChallengeModal = () => {
  const { challenges, removeChallenge } = useChallenges();
  const isOpen = !!challenges.length;
  const closeModal = () => removeChallenge();
  const { refs, context } = useFloating({
    open: isOpen,
    onOpenChange: closeModal,
  });
  const click = useClick(context);
  const dismiss = useDismiss(context, { outsidePress: false });
  const role = useRole(context);
  const headingId = useId();
  const { getFloatingProps } = useInteractions([click, dismiss, role]);

  return (
    <>
      {isOpen && (
        <FloatingFocusManager context={context} modal={false}>
          <div className={styles.modal} ref={refs.setFloating} aria-labelledby={headingId} {...getFloatingProps()}>
            <Challenge challenge={challenges[0]} closeModal={closeModal} />
          </div>
        </FloatingFocusManager>
      )}
    </>
  );
};

export default ChallengeModal;
