import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSubplebbit } from '@plebbit/plebbit-react-hooks';
import { isValidURL } from '../../lib/utils/url-utils';
import useIsSubplebbitOffline from '../../hooks/use-is-subplebbit-offline';
import usePublishReply from '../../hooks/use-publish-reply';
import Markdown from '../markdown';
import styles from './reply-form.module.css';

type ReplyFormProps = {
  cid: string;
  isReplyingToReply?: boolean;
  hideReplyForm?: () => void;
  subplebbitAddress: string;
  postCid: string | undefined;
};

export const FormattingHelpTable = () => {
  const { t } = useTranslation();
  return (
    <div className={styles.markdownHelp}>
      <table>
        <tbody>
          <tr className={styles.tableFirstRow}>
            <td>{t('you_type')}:</td>
            <td>{t('you_see')}:</td>
          </tr>
          <tr>
            <td>*{t('italics')}*</td>
            <td>
              <Markdown content={`*${t('italics')}*`} />
            </td>
          </tr>
          <tr>
            <td>**{t('bold')}**</td>
            <td>
              <Markdown content={`**${t('bold')}**`} />
            </td>
          </tr>
          <tr>
            <td>[plebbit!](https://plebbit.com)</td>
            <td>
              <Markdown content='[plebbit!](https://plebbit.com)' />
            </td>
          </tr>
          <tr>
            <td>
              * {t('item')} 1<br />* {t('item')} 2<br />* {t('item')} 3
            </td>
            <td>
              <Markdown content={[`* ${t('item')} 1`, `* ${t('item')} 2`, `* ${t('item')} 3`].join('\n')} />
            </td>
          </tr>
          <tr>
            <td>
              {'>'} {t('quoted_text')}
            </td>
            <td>
              <Markdown content={`> ${t('quoted_text')}`} />
            </td>
          </tr>
          <tr>
            <td>~~strikethrough~~</td>
            <td>
              <Markdown content='~~strikethrough~~' />
            </td>
          </tr>
          <tr>
            <td>super^script^</td>
            <td>
              <Markdown content='super^script^' />
            </td>
          </tr>
          <tr>
            <td>sub~script~</td>
            <td>
              <Markdown content='sub~script~' />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

const ReplyForm = ({ cid, isReplyingToReply, hideReplyForm, subplebbitAddress, postCid }: ReplyFormProps) => {
  const { t } = useTranslation();
  const [showOptions, setShowOptions] = useState(false);
  const [showFormattingHelp, setShowFormattingHelp] = useState(false);
  const { setContent, resetContent, replyIndex, publishReply } = usePublishReply({ cid, subplebbitAddress, postCid });

  const mdContainerClass = isReplyingToReply ? `${styles.mdContainer} ${styles.mdContainerReplying}` : styles.mdContainer;
  const urlClass = showOptions ? styles.urlVisible : styles.urlHidden;
  const spoilerClass = showOptions ? styles.spoilerVisible : styles.spoilerHidden;

  const textRef = useRef<HTMLTextAreaElement>(null);
  const urlRef = useRef<HTMLInputElement>(null);
  const spoilerRef = useRef<HTMLInputElement>(null);

  const subplebbit = useSubplebbit({ subplebbitAddress });
  const { isOffline, offlineTitle } = useIsSubplebbitOffline(subplebbit);

  useEffect(() => {
    if (isReplyingToReply && textRef.current) {
      textRef.current.focus();
    }
  }, [isReplyingToReply, textRef]);

  const resetFields = () => {
    if (textRef.current) {
      textRef.current.value = '';
    }
    if (urlRef.current) {
      urlRef.current.value = '';
    }
    if (spoilerRef.current) {
      spoilerRef.current.checked = false;
    }
  };

  const onPublish = () => {
    const currentContent = textRef.current?.value || '';
    const currentUrl = urlRef.current?.value || '';

    if (!currentContent.trim() && !currentUrl) {
      alert(`missing content or url`);
      return;
    }

    if (currentUrl && !isValidURL(currentUrl)) {
      alert('The provided link is not a valid URL.');
      return;
    }
    publishReply();
  };

  useEffect(() => {
    if (typeof replyIndex === 'number') {
      resetContent();

      if (hideReplyForm) {
        hideReplyForm();
      }

      resetFields();
    }
  }, [replyIndex, resetContent, hideReplyForm]);

  return (
    <div className={mdContainerClass}>
      <div className={styles.md}>
        {isOffline && <div className={styles.infobar}>{offlineTitle}</div>}
        <div className={styles.options}>
          <span className={urlClass}>
            {t('media_url')}: <input className={`${styles.url} ${urlClass}`} ref={urlRef} onChange={(e) => setContent.link(e.target.value)} />
          </span>
          <span className={`${styles.spoiler} ${spoilerClass}`}>
            <label>
              {t('spoiler')}: <input type='checkbox' className={styles.checkbox} ref={spoilerRef} onChange={(e) => setContent.spoiler(e.target.checked)} />
            </label>
          </span>
        </div>
        <textarea className={styles.textarea} ref={textRef} onChange={(e) => setContent.content(e.target.value)} />
      </div>
      <div className={styles.bottomArea}>
        <button className={styles.save} onClick={onPublish}>
          {t('save')}
        </button>
        {isReplyingToReply && (
          <button className={styles.cancel} onClick={hideReplyForm}>
            {t('cancel')}
          </button>
        )}
        <span className={styles.optionsButton} onClick={() => setShowFormattingHelp(!showFormattingHelp)}>
          {showFormattingHelp ? t('hide_help') : t('formatting_help')}
        </span>
        <span className={styles.optionsButton} onClick={() => setShowOptions(!showOptions)}>
          {showOptions ? t('hide_options') : t('options')}
        </span>
      </div>
      {showFormattingHelp && <FormattingHelpTable />}
    </div>
  );
};

export default ReplyForm;
