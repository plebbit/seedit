import { useEffect, useMemo, useState, lazy, Suspense } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { setAccount, useAccount } from '@plebbit/plebbit-react-hooks';
import useTheme from '../../../stores/use-theme-store';
import stringify from 'json-stringify-pretty-compact';
import styles from './account-data-editor.module.css';
import useIsMobile from '../../../hooks/use-is-mobile';
import { Link, useNavigate } from 'react-router-dom';

const LazyAceEditor = lazy(async () => {
  const ReactAceModule = await import('react-ace');
  await import('ace-builds/src-noconflict/mode-json');
  await import('ace-builds/src-noconflict/theme-github');
  await import('ace-builds/src-noconflict/theme-tomorrow_night');
  return ReactAceModule;
});

const AccountDataEditor = () => {
  const account = useAccount();
  const theme = useTheme((state) => state.theme);
  const [text, setText] = useState('');
  const [showEditor, setShowEditor] = useState(false);

  const accountJson = useMemo(
    () =>
      stringify({
        account: { ...account },
      }),
    [account],
  );

  useEffect(() => {
    setText(accountJson);
  }, [accountJson]);

  const saveAccount = async () => {
    try {
      const editorAccount = JSON.parse(text).account;
      await setAccount(editorAccount);
      alert(`Saved ${editorAccount.name}`);
    } catch (error) {
      if (error instanceof Error) {
        alert(error.message);
        console.log(error);
      } else {
        console.error('An unknown error occurred:', error);
      }
    }
  };

  const isMobile = useIsMobile();
  const { t } = useTranslation();
  const navigate = useNavigate();

  if (!showEditor) {
    return (
      <div className={styles.securityWarning}>
        <img src={`/assets/privacy_icon.png`} alt='security warning' />
        <div className={styles.warning}>
          <h3>Your private key will be displayed</h3>
          <p>You're about to view your account data, which includes your private key. You should never share your private key with anyone.</p>
        </div>
        <div className={styles.warningButtons}>
          <button onClick={() => navigate('/settings')}>go back</button>
          <button onClick={() => setShowEditor(true)}>{t('continue')}</button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.content}>
      <Suspense fallback={<div className={styles.loading}>Loading editor...</div>}>
        <LazyAceEditor
          mode='json'
          theme={theme === 'dark' ? 'tomorrow_night' : 'github'}
          value={text}
          onChange={setText}
          name='ACCOUNT_DATA_EDITOR'
          editorProps={{ $blockScrolling: true }}
          className={styles.editor}
          width='100%'
          height={isMobile ? 'calc(80vh - 95px)' : 'calc(90vh - 77px)'}
          setOptions={{
            useWorker: false,
            enableBasicAutocompletion: false,
            enableLiveAutocompletion: false,
            enableSnippets: false,
            showPrintMargin: false,
            highlightActiveLine: true,
            showGutter: true,
            foldStyle: 'markbeginend',
            showFoldWidgets: true,
          }}
          fontSize={14}
        />
        <div className={styles.buttons}>
          <Trans
            i18nKey='save_reset_changes'
            components={{
              1: <button key='saveAccountButton' onClick={saveAccount} />,
              2: <button key='resetAccountButton' onClick={() => setText(accountJson)} />,
            }}
          />
        </div>
      </Suspense>
    </div>
  );
};

export default AccountDataEditor;
