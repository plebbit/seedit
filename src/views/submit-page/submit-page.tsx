import { ChangeEvent, useCallback, useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { Trans, useTranslation } from 'react-i18next';
import Plebbit from '@plebbit/plebbit-js/dist/browser/index.js';
import { useAccount, usePublishComment, useSubplebbit } from '@plebbit/plebbit-react-hooks';
import useSubmitStore from '../../stores/use-submit-store';
import { useDefaultSubplebbitAddresses } from '../../hooks/use-default-subplebbits';
import { getLinkMediaInfo } from '../../lib/utils/media-utils';
import { isValidURL } from '../../lib/utils/url-utils';
import { isSubmitView } from '../../lib/utils/view-utils';
import Embed from '../../components/post/embed';
import Markdown from '../../components/markdown';
import styles from './submit-page.module.css';

const UrlField = () => {
  const { t } = useTranslation();
  const { setSubmitStore } = useSubmitStore();
  const [mediaError, setMediaError] = useState(false);
  const [url, setUrl] = useState('');

  const mediaInfo = getLinkMediaInfo(url);
  const mediaType = mediaInfo?.type;

  let mediaComponent;

  if (mediaType === 'image' || mediaType === 'gif') {
    mediaComponent = <img src={url} alt='' onError={() => setMediaError(true)} />;
  } else if (mediaType === 'video') {
    mediaComponent = <video src={url} controls />;
  } else if (mediaType === 'webpage') {
    mediaComponent = <></>;
  } else if (mediaType === 'audio') {
    mediaComponent = <audio src={url} controls />;
  } else if (mediaType === 'iframe') {
    mediaComponent = <Embed url={url} />;
  }

  return (
    <>
      {url && isValidURL(url) ? (
        <span className={styles.boxTitleOptional}>{mediaType}</span>
      ) : (
        <>
          <span className={styles.boxTitleOptional}>url</span>
          <span className={styles.optional}> ({t('optional')})</span>
        </>
      )}
      <div className={styles.boxContent}>
        <input
          className={`${styles.input} ${styles.inputUrl}`}
          type='text'
          value={url ?? ''}
          autoCorrect='off'
          autoComplete='off'
          spellCheck='false'
          onChange={(e) => {
            setUrl(e.target.value);
            setMediaError(false);
            setSubmitStore({ link: e.target.value });
          }}
        />
        {url && isValidURL(url) ? (
          <div className={styles.mediaPreview}>{mediaError ? <span className={styles.mediaError}>{t('no_media_found')}</span> : mediaComponent}</div>
        ) : (
          <div className={styles.description}>{t('submit_url_description')}</div>
        )}
      </div>
    </>
  );
};

const Submit = () => {
  const account = useAccount();
  const { t } = useTranslation();
  const params = useParams();
  const paramsSubplebbitAddress = params.subplebbitAddress;
  const [inputAddress, setInputAddress] = useState('');
  const [selectedSubplebbit, setSelectedSubplebbit] = useState(paramsSubplebbitAddress);
  const subplebbit = useSubplebbit({ subplebbitAddress: selectedSubplebbit });
  const navigate = useNavigate();

  const location = useLocation();
  const isInSubmitView = isSubmitView(location.pathname);

  const { title, content, link, subplebbitAddress, publishCommentOptions, setSubmitStore, resetSubmitStore } = useSubmitStore();
  const { index, publishComment } = usePublishComment(publishCommentOptions);
  const { subscriptions } = account || {};
  const defaultSubplebbitAddresses = useDefaultSubplebbitAddresses();

  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    const checkOfflineStatus = () => {
      if (subplebbit?.updatedAt !== undefined) {
        setIsOffline(subplebbit.updatedAt < Date.now() / 1000 - 60 * 60);
      } else {
        setTimeout(() => {
          setIsOffline(subplebbit?.updatedAt === undefined || subplebbit.updatedAt < Date.now() / 1000 - 60 * 60);
        }, 5000);
      }
    };

    if (subplebbitAddress) {
      checkOfflineStatus();
    }
  }, [subplebbit?.updatedAt, subplebbitAddress]);

  const onPublish = () => {
    if (!title) {
      alert(`Missing title`);
      return;
    }
    if (link && !isValidURL(link)) {
      alert(`Invalid URL`);
      return;
    }
    if (!subplebbitAddress) {
      alert(`Missing community address`);
      return;
    }

    publishComment();
  };

  // redirect to pending page when pending comment is created
  useEffect(() => {
    if (typeof index === 'number') {
      resetSubmitStore();
      navigate(`/profile/${index}`);
    }
  }, [index, resetSubmitStore, navigate]);

  const subsDescription = <div className={styles.subsDescription}>{subscriptions?.length > 5 ? t('submit_subscriptions') : t('submit_subscriptions_notice')}</div>;

  const getRandomSubplebbits = (addresses: string[], count: number) => {
    let shuffled = addresses.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  };

  const [randomSubplebbits, setRandomSubplebbits] = useState<string[]>([]);
  useEffect(() => {
    // Generate random subplebbits only once when the component mounts
    const generatedSubplebbits = getRandomSubplebbits(defaultSubplebbitAddresses, 10);
    setRandomSubplebbits(generatedSubplebbits);
  }, [defaultSubplebbitAddresses]);
  const listSource = subscriptions?.length > 5 ? subscriptions : randomSubplebbits;
  const subscriptionsList = (
    <div className={styles.subs}>
      {listSource.map((subscription: string) => (
        <span key={subscription} className={styles.sub} onClick={() => setSelectedSubplebbit(subscription)}>
          {Plebbit.getShortAddress(subscription)}
        </span>
      ))}
    </div>
  );

  const [activeDropdownIndex, setActiveDropdownIndex] = useState<number>(-1);
  const [isInputAddressFocused, setIsInputAddressFocused] = useState(false);

  const filteredSubplebbitAddresses = defaultSubplebbitAddresses.filter((address) => address.toLowerCase().includes(inputAddress.toLowerCase())).slice(0, 10);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        setActiveDropdownIndex((prevIndex) => (prevIndex < filteredSubplebbitAddresses.length - 1 ? prevIndex + 1 : prevIndex));
      } else if (e.key === 'ArrowUp') {
        setActiveDropdownIndex((prevIndex) => (prevIndex > 0 ? prevIndex - 1 : 0));
      } else if (e.key === 'Enter' && activeDropdownIndex !== -1) {
        const selectedAddress = filteredSubplebbitAddresses[activeDropdownIndex];
        setSelectedSubplebbit(selectedAddress);
        setSubmitStore({ subplebbitAddress: selectedAddress });
        setInputAddress(selectedAddress);
        setActiveDropdownIndex(-1);
      }
    },
    [filteredSubplebbitAddresses, activeDropdownIndex, setSubmitStore, setSelectedSubplebbit],
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  const defaultSubplebbitsDropdown = inputAddress && (
    <ul className={styles.dropdown}>
      {filteredSubplebbitAddresses.map((subplebbitAddress, index) => (
        <li
          key={subplebbitAddress}
          className={`${styles.dropdownItem} ${index === activeDropdownIndex ? styles.activeDropdownItem : ''}`}
          onClick={() => setSelectedSubplebbit(subplebbitAddress)}
          onMouseEnter={() => setActiveDropdownIndex(index)}
        >
          {subplebbitAddress}
        </li>
      ))}
    </ul>
  );

  const handleAddressChange = (e: ChangeEvent<HTMLInputElement>) => {
    setInputAddress(e.target.value);
    setSelectedSubplebbit(e.target.value);
  };

  useEffect(() => {
    if (inputAddress) {
      setSelectedSubplebbit(inputAddress);
    }
  }, [inputAddress]);

  useEffect(() => {
    if (selectedSubplebbit) {
      setSubmitStore({ subplebbitAddress: selectedSubplebbit });
    }
  }, [selectedSubplebbit, setSubmitStore]);

  useEffect(() => {
    if (paramsSubplebbitAddress) {
      setSubmitStore({ subplebbitAddress: paramsSubplebbitAddress });
    }
  }, [paramsSubplebbitAddress, setSubmitStore]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const documentTitle = t('submit_to_string', { string: subplebbit?.title || subplebbit?.shortAddress || 'Seedit', interpolation: { escapeValue: false } });
  useEffect(() => {
    document.title = documentTitle;
  }, [documentTitle]);

  return (
    <div className={styles.content}>
      {isOffline && <div className={styles.infobar}>test</div>}
      <h1>
        <Trans
          i18nKey='submit_to'
          shouldUnescape={true}
          values={{ link: subplebbit?.title || subplebbit?.shortAddress || 'seedit' }}
          components={{ 1: isInSubmitView ? <></> : <Link to={`/p/${subplebbitAddress}`} className={styles.location} /> }}
        />
      </h1>
      <div className={styles.form}>
        <div className={styles.formContent}>
          <div className={styles.box}>
            <UrlField />
          </div>
          <div className={styles.box}>
            <span className={styles.boxTitleRequired}>{t('title')}</span>
            <div className={styles.boxContent}>
              <textarea
                className={`${styles.input} ${styles.inputTitle}`}
                onChange={(e) => {
                  setSubmitStore({ title: e.target.value });
                }}
              />
            </div>
          </div>
          <div className={styles.box}>
            <span className={styles.boxTitleOptional}>{t('text')}</span>
            <span className={styles.optional}> ({t('optional')})</span>
            <div className={styles.boxContent}>
              <textarea
                className={`${styles.input} ${styles.inputText}`}
                onChange={(e) => {
                  setSubmitStore({ content: e.target.value });
                }}
              />
              {content && (
                <div className={styles.contentPreview}>
                  <div className={styles.contentPreviewTitle}>{t('preview')}:</div>
                  <div className={styles.contentPreviewMarkdown}>
                    <Markdown content={content} />
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className={styles.box}>
            <span className={styles.boxTitleRequired}>{t('submit_choose')}</span>
            <div className={styles.boxContent}>
              <span className={styles.boxSubtitle}>{t('community_address')}:</span>
              <input
                className={`${styles.input} ${styles.inputCommunity}`}
                type='text'
                placeholder={`"community.eth/.sol" ${t('or')} "12D3KooW..."`}
                onFocus={() => setIsInputAddressFocused(true)}
                onBlur={() => setTimeout(() => setIsInputAddressFocused(false), 100)}
                autoCorrect='off'
                autoComplete='off'
                spellCheck='false'
                value={selectedSubplebbit}
                onChange={(e) => {
                  handleAddressChange(e);
                  setSubmitStore({ subplebbitAddress: e.target.value });
                }}
              />
              {inputAddress && isInputAddressFocused && defaultSubplebbitsDropdown}
              {subsDescription}
              {subscriptionsList}
            </div>
          </div>
          {subplebbit?.rules?.length > 0 && (
            <div className={styles.box}>
              <span className={`${styles.boxTitle} ${styles.rulesTitle}`}>
                {t('rules_for')} p/{subplebbit?.shortAddress}
              </span>
              <div className={styles.boxContent}>
                <div className={styles.description}>
                  <ol className={styles.rules}>{subplebbit?.rules?.map((rule: string, index: number) => <li key={index}>{rule}</li>)}</ol>
                </div>
              </div>
            </div>
          )}
          <div className={styles.box}>
            <div className={styles.boxTitle}>{t('options')}</div>
            <div className={styles.boxContent}>
              <div className={styles.options}>
                <label>
                  <input type='checkbox' onChange={(e) => setSubmitStore({ spoiler: e.target.checked })} />
                  {t('spoiler')}
                </label>
              </div>
            </div>
          </div>
          <div className={`${styles.box} ${styles.notice}`}>{t('submit_notice')}</div>
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
