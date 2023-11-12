import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { PublishCommentOptions, usePublishComment, useSubplebbit } from '@plebbit/plebbit-react-hooks';
import { useTranslation } from 'react-i18next';
import { create } from 'zustand';
import { isSubplebbitSubmitView } from '../../lib/utils/view-utils';
import { alertChallengeVerificationFailed } from '../../lib/utils/challenge-utils';
import { isValidENS, isValidIPFS, isValidURL } from '../../lib/utils/validation-utils';
import styles from './submit.module.css';
import challengesStore from '../../hooks/use-challenges';

type SubmitState = {
  subplebbitAddress: string | undefined;
  title: string | undefined;
  content: string | undefined;
  link: string | undefined;
  publishCommentOptions: PublishCommentOptions;
  setSubmitStore: (data: Partial<SubmitState>) => void;
  resetSubmitStore: () => void;
};

const { addChallenge } = challengesStore.getState();

const useSubmitStore = create<SubmitState>((set) => ({
  subplebbitAddress: undefined,
  title: undefined,
  content: undefined,
  link: undefined,
  publishCommentOptions: {},
  setSubmitStore: ({ subplebbitAddress, title, content, link }) =>
    set((state) => {
      const nextState = { ...state };
      if (subplebbitAddress !== undefined) nextState.subplebbitAddress = subplebbitAddress;
      if (title !== undefined) nextState.title = title;
      if (content !== undefined) nextState.content = content;
      if (link !== undefined) nextState.link = link;

      nextState.publishCommentOptions = {
        ...nextState,
        onChallenge: (...args: any) => addChallenge(args),
        onChallengeVerification: alertChallengeVerificationFailed,
        onError: (error: Error) => {
          console.error(error);
          alert(error.message);
        },
      };
      return nextState;
    }),
  resetSubmitStore: () => set({ subplebbitAddress: undefined, title: undefined, content: undefined, link: undefined, publishCommentOptions: undefined }),
}));

const Submit = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const params = useParams();
  const isSubplebbitSubmit = isSubplebbitSubmitView(location.pathname, params);
  const paramsSubplebbitAddress = params.subplebbitAddress;
  const subplebbit = useSubplebbit({ subplebbitAddress: paramsSubplebbitAddress });
  const navigate = useNavigate();
  const [readyToPublish, setReadyToPublish] = useState(false);

  const titleRef = useRef<HTMLTextAreaElement>(null);
  const linkRef = useRef<HTMLInputElement>(null);
  const contentRef = useRef<HTMLTextAreaElement>(null);
  const subplebbitAddressRef = useRef<HTMLInputElement>(null);

  const { subplebbitAddress, publishCommentOptions, setSubmitStore, resetSubmitStore } = useSubmitStore();
  const { index, publishComment } = usePublishComment(publishCommentOptions);

  useEffect(() => {
    document.title = t('submit_to_before') + (isSubplebbitSubmit ? subplebbit?.title || subplebbit?.shortAddress : 'seedit') + t('submit_to_after');
  }, [isSubplebbitSubmit, subplebbit, t]);

  const onPublish = () => {
    if (!titleRef.current?.value) {
      alert(`Missing title`);
      return;
    }
    if (linkRef.current?.value && !isValidURL(linkRef.current?.value)) {
      alert(`Invalid URL`);
      return;
    }
    if (!subplebbitAddressRef.current?.value) {
      alert(`Missing community address`);
      return;
    }
    if (!isValidENS(subplebbitAddressRef.current?.value) && !isValidIPFS(subplebbitAddressRef.current?.value)) {
      alert(`Invalid community address`);
      return;
    }

    setSubmitStore({
      subplebbitAddress: subplebbitAddressRef.current?.value,
      title: titleRef.current?.value,
      content: contentRef.current?.value || undefined,
      link: linkRef.current?.value || undefined,
    });

    setReadyToPublish(true);
  };

  useEffect(() => {
    if (readyToPublish) {
      publishComment();
      setReadyToPublish(false);
    }
  }, [readyToPublish, publishComment]);

  const subplebbitHeaderLink = (
    <Link to={`/p/${subplebbitAddress}`} className={styles.location} onClick={(e) => e.preventDefault()}>
      {subplebbit?.title || subplebbit?.shortAddress}
    </Link>
  );

  useEffect(() => {
    if (typeof index === 'number') {
      resetSubmitStore();
      navigate(`/profile/${index}`);
    }
  }, [index, resetSubmitStore, navigate]);

  return (
    <div className={styles.content}>
      <h1>
        {t('submit_to_before')}
        {isSubplebbitSubmit ? subplebbitHeaderLink : 'seedit'}
        {t('submit_to_after')}
      </h1>
      <div className={styles.form}>
        <div className={styles.formContent}>
          <div className={styles.field}>
            <span className={styles.fieldTitleOptional}>url</span>
            <span className={styles.optional}> ({t('optional')})</span>
            <div className={styles.fieldContent}>
              <input className={`${styles.input} ${styles.inputUrl}`} type='text' ref={linkRef} />
              <div className={styles.description}>{t('submit_url_description')}</div>
            </div>
          </div>
          <div className={styles.field}>
            <span className={styles.fieldTitleRequired}>{t('title')}</span>
            <div className={styles.fieldContent}>
              <textarea className={`${styles.input} ${styles.inputTitle}`} ref={titleRef} />
            </div>
          </div>
          <div className={styles.field}>
            <span className={styles.fieldTitleOptional}>{t('text')}</span>
            <span className={styles.optional}> ({t('optional')})</span>
            <div className={styles.fieldContent}>
              <textarea className={`${styles.input} ${styles.inputText}`} ref={contentRef} />
            </div>
          </div>
          <div className={styles.field}>
            <span className={styles.fieldTitleRequired}>{t('submit_choose')}</span>
            <div className={styles.fieldContent}>
              <span className={styles.fieldSubtitle}>{t('community_address')}:</span>
              <input
                className={`${styles.input} ${styles.inputCommunity}`}
                type='text'
                placeholder='"community.eth" or "12D3KooW..."'
                defaultValue={isSubplebbitSubmit ? paramsSubplebbitAddress : undefined}
                ref={subplebbitAddressRef}
              />
            </div>
          </div>
          <div className={`${styles.field} ${styles.notice}`}>{t('submit_notice')}</div>
          <div>*{t('required')}</div>
          <div className={styles.submit}>
            <button className={styles.submitButton} onClick={onPublish}>
              {t('submit')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Submit;
