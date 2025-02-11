import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import {
  deleteSubplebbit,
  Role,
  useAccount,
  useCreateSubplebbit,
  usePlebbitRpcSettings,
  usePublishSubplebbitEdit,
  useSubplebbit,
  useSubscribe,
} from '@plebbit/plebbit-react-hooks';
import { Roles } from '../../lib/utils/user-utils';
import { useTranslation } from 'react-i18next';
import styles from './subplebbit-settings.module.css';
import { isValidURL } from '../../lib/utils/url-utils';
import { isCreateSubplebbitView, isSubplebbitSettingsView } from '../../lib/utils/view-utils';
import useSubplebbitSettingsStore from '../../stores/use-subplebbit-settings-store';
import LoadingEllipsis from '../../components/loading-ellipsis';
import Markdown from '../../components/markdown';
import Sidebar from '../../components/sidebar';
import Challenges from './challenge-settings';
import _ from 'lodash';

const Title = ({ isReadOnly = false }: { isReadOnly?: boolean }) => {
  const { t } = useTranslation();
  const { title, setSubplebbitSettingsStore } = useSubplebbitSettingsStore();

  return (
    <div className={`${styles.box} ${isReadOnly && !title ? styles.hidden : styles.visible}`}>
      <div className={styles.boxTitle}>{t('title')}</div>
      <div className={styles.boxSubtitle}>{t('a_short_title')}</div>
      <div className={styles.boxInput}>
        {isReadOnly ? <span>{title}</span> : <input type='text' value={title ?? ''} onChange={(e) => setSubplebbitSettingsStore({ title: e.target.value })} />}
      </div>
    </div>
  );
};

const Description = ({ isReadOnly = false }: { isReadOnly?: boolean }) => {
  const { t } = useTranslation();
  const { description, setSubplebbitSettingsStore } = useSubplebbitSettingsStore();

  return (
    <div className={`${styles.box} ${isReadOnly && !description ? styles.hidden : styles.visible}`}>
      <div className={styles.boxTitle}>{t('description')}</div>
      <div className={styles.boxSubtitle}>{t('shown_in_sidebar')}</div>
      <div className={styles.boxInput}>
        {isReadOnly ? (
          <pre className={styles.readOnlyDescription}>{description}</pre>
        ) : (
          <>
            <textarea value={description ?? ''} onChange={(e) => setSubplebbitSettingsStore({ description: e.target.value })} />
            <div className={styles.descriptionPreview}>
              {description && (
                <>
                  <div className={styles.descriptionMarkdownPreviewTitle}>{t('preview')}:</div>
                  <div className={styles.descriptionPreviewMarkdown}>
                    <Markdown content={description} />
                  </div>
                </>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

const Address = ({ isReadOnly = false }: { isReadOnly?: boolean }) => {
  const { t } = useTranslation();
  const { address, setSubplebbitSettingsStore } = useSubplebbitSettingsStore();

  const alertCryptoAddressInfo = () => {
    alert(`steps to set a .eth community address:\n1. go to app.ens.domains and search the address\n2.  once you own the address, go to its page, click on "records", then "edit records"\n3. add a new text record with name "subplebbit-address" and value: ${address}\n\n steps to set a .sol community address:\n1. go to sns.id and search the address\n2. once you own the address, go to your profile, click the address menu "...", then "create subdomain"\n3. enter subdomain "subplebbit-address" and create\n4. go to subdomain, "content", change content to: ${address}
    `);
  };

  return (
    <div className={styles.box}>
      <div className={styles.boxTitle}>{t('address')}</div>
      <div className={styles.boxSubtitle}>
        {t('address_setting_info')}
        <span onClick={alertCryptoAddressInfo}>[?]</span>
      </div>
      <div className={styles.boxInput}>
        {isReadOnly ? (
          <span className={styles.readOnlyAddress}>{address}</span>
        ) : (
          <input type='text' value={address ?? ''} onChange={(e) => setSubplebbitSettingsStore({ address: e.target.value })} />
        )}
      </div>
    </div>
  );
};

const Logo = ({ isReadOnly = false }: { isReadOnly?: boolean }) => {
  const { t } = useTranslation();
  const { suggested, setSubplebbitSettingsStore } = useSubplebbitSettingsStore();

  const [logoUrl, setLogoUrl] = useState(suggested?.avatarUrl);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    setLogoUrl(suggested?.avatarUrl);
    setImageError(false);
  }, [suggested?.avatarUrl]);

  return (
    <div className={`${styles.box} ${isReadOnly && !logoUrl ? styles.hidden : styles.visible}`}>
      <div className={styles.boxTitle}>{t('logo')}</div>
      <div className={styles.boxSubtitle}>{t('community_logo_info')}</div>
      <div className={styles.boxInput}>
        {isReadOnly ? (
          <span>{logoUrl}</span>
        ) : (
          <input
            type='text'
            value={logoUrl ?? ''}
            onChange={(e) => {
              setLogoUrl(e.target.value.trim());
              setImageError(false);
              setSubplebbitSettingsStore({ suggested: { ...suggested, avatarUrl: e.target.value.trim() || undefined } });
            }}
          />
        )}
        {logoUrl && isValidURL(logoUrl) && (
          <div className={styles.logoPreview}>
            {t('preview')}:
            {imageError ? <span className={styles.logoError}>{t('no_image_found')}</span> : <img src={logoUrl} alt='' onError={() => setImageError(true)} />}
          </div>
        )}
      </div>
    </div>
  );
};

const Rules = ({ isReadOnly = false }: { isReadOnly?: boolean }) => {
  const { t } = useTranslation();
  const { rules, setSubplebbitSettingsStore } = useSubplebbitSettingsStore();
  const lastRuleRef = useRef(null);

  const handleRuleChange = (index: number, newRule: string) => {
    if (!rules) return;
    const updatedRules = [...(rules ?? [])];
    updatedRules[index] = newRule;
    setSubplebbitSettingsStore({ rules: updatedRules });
  };

  const addedRuleRef = useRef(false);
  const addRule = () => {
    const newRules = rules ? [...rules, ''] : [''];
    setSubplebbitSettingsStore({ rules: newRules });
    addedRuleRef.current = true;
  };

  useEffect(() => {
    if (!isReadOnly && rules && rules.length > 0 && addedRuleRef.current) {
      (lastRuleRef.current as any).focus({ preventScroll: true });
      addedRuleRef.current = false;
    }
  }, [rules?.length, isReadOnly, rules]);

  const deleteRule = (index: number) => {
    if (rules) {
      const filteredRules = rules.filter((_, i) => i !== index);
      setSubplebbitSettingsStore({ rules: filteredRules });
    }
  };

  return (
    <div className={`${styles.box} ${isReadOnly && (!rules || rules.length < 1) ? styles.hidden : styles.visible}`}>
      <div className={styles.boxTitle}>{t('rules')}</div>
      <div className={styles.boxSubtitle}>{t('shown_in_sidebar')}</div>
      <div className={styles.boxInput}>
        {!isReadOnly && (
          <button className={styles.addButton} onClick={addRule} disabled={isReadOnly}>
            {t('add_rule')}
          </button>
        )}
        {rules?.map((rule, index) => (
          <div className={`${styles.rule} ${index === 0 && styles.firstRule}`} key={index}>
            Rule #{index + 1}
            {!isReadOnly && <span className={styles.deleteButton} title='Delete Rule' onClick={() => (isReadOnly ? {} : deleteRule(index))} />}
            <br />
            {isReadOnly ? (
              <span className={styles.readOnlyRule}>{rule}</span>
            ) : (
              <input ref={index === rules?.length - 1 ? lastRuleRef : null} value={rule} onChange={(e) => handleRuleChange(index, e.target.value)} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

const Moderators = ({ isReadOnly = false }: { isReadOnly?: boolean }) => {
  const { t } = useTranslation();
  const { roles, setSubplebbitSettingsStore } = useSubplebbitSettingsStore();
  const lastModeratorRef = useRef(null);

  const addedModeratorRef = useRef(false);
  const handleAddModerator = () => {
    if (roles) {
      const newRoles: Roles = { ...roles, '': { role: 'moderator' } };
      setSubplebbitSettingsStore({ roles: newRoles });
      addedModeratorRef.current = true;
    } else {
      setSubplebbitSettingsStore({ roles: { '': { role: 'moderator' } } });
      addedModeratorRef.current = true;
    }
  };

  useEffect(() => {
    if (!isReadOnly && roles && Object.keys(roles).length > 0 && addedModeratorRef.current) {
      (lastModeratorRef.current as any).focus({ preventScroll: true });
      addedModeratorRef.current = false;
    }
  }, [roles, isReadOnly]);

  const handleRoleChange = (address: string, newRole: 'owner' | 'admin' | 'moderator') => {
    if (roles) {
      const updatedRole: Role = { role: newRole };
      const updatedRoles: Roles = { ...roles, [address]: updatedRole };
      setSubplebbitSettingsStore({ roles: updatedRoles });
    }
  };

  const handleDeleteModerator = (address: string) => {
    if (roles) {
      const { [address]: _, ...remainingRoles } = roles;
      setSubplebbitSettingsStore({ roles: remainingRoles });
    }
  };

  const handleAddressChange = (index: number, newAddress: string) => {
    const rolesArray = Object.entries(roles || {});
    rolesArray[index] = [newAddress, rolesArray[index][1]];
    const updatedRoles = Object.fromEntries(rolesArray);
    setSubplebbitSettingsStore({ roles: updatedRoles });
  };

  return (
    <div className={`${styles.box} ${isReadOnly && !roles ? styles.hidden : styles.visible}`}>
      <div className={styles.boxTitle}>{t('moderators')}</div>
      <div className={styles.boxSubtitle}>{t('moderators_setting_info')}</div>
      <div className={styles.boxInput}>
        {!isReadOnly && (
          <button className={styles.addButton} onClick={handleAddModerator} disabled={isReadOnly}>
            {t('add_moderator')}
          </button>
        )}
        {roles &&
          Object.entries(roles)?.map(([address, role], index) => (
            <div className={`${styles.moderator} ${index === 0 && styles.firstModerator}`} key={index}>
              {t('moderator')} #{index + 1}
              {!isReadOnly && <span className={styles.deleteButton} title='delete moderator' onClick={() => (isReadOnly ? {} : handleDeleteModerator(address))} />}
              <br />
              <span className={styles.moderatorAddress}>
                User address:
                <br />
                {isReadOnly ? (
                  <span>{address}</span>
                ) : (
                  <input
                    ref={index === Object.keys(roles).length - 1 ? lastModeratorRef : null}
                    type='text'
                    value={address}
                    onChange={(e) => handleAddressChange(index, e.target.value)}
                  />
                )}
                <br />
              </span>
              <span className={styles.moderatorRole}>
                Moderator role:
                <br />
                {isReadOnly ? (
                  <span>{role.role}</span>
                ) : (
                  <select value={role.role} onChange={(e) => handleRoleChange(address, e.target.value as any)}>
                    <option value='moderator'>moderator</option>
                    <option value='admin'>admin</option>
                    <option value='owner'>owner</option>
                  </select>
                )}
              </span>
            </div>
          ))}
      </div>
    </div>
  );
};

const JSONSettings = ({ isReadOnly = false }: { isReadOnly?: boolean }) => {
  const { t } = useTranslation();
  const { challenges, title, description, address, suggested, rules, roles, settings, subplebbitAddress, setSubplebbitSettingsStore } = useSubplebbitSettingsStore();
  const [text, setText] = useState('');

  useEffect(() => {
    const JSONSettings = JSON.stringify({ title, description, address, suggested, rules, roles, settings, challenges, subplebbitAddress }, null, 2);
    setText(JSONSettings);
  }, [challenges, title, description, address, suggested, rules, roles, settings, subplebbitAddress]);

  const handleChange = (newText: string) => {
    setText(newText);
    try {
      const newSettings = JSON.parse(newText);
      setSubplebbitSettingsStore(newSettings);
    } catch (e) {
      console.error('Invalid JSON format');
    }
  };

  return (
    <div className={`${styles.box}`}>
      <div className={`${styles.boxTitle} ${styles.JSONSettingsTitle}`}>{t('json_settings')}</div>
      <div className={styles.boxSubtitle}>{t('json_settings_info')}</div>
      <div className={`${styles.boxInput} ${styles.JSONSettings}`}>
        <textarea onChange={(e) => handleChange(e.target.value)} autoCorrect='off' autoComplete='off' spellCheck='false' value={text} disabled={isReadOnly} />
      </div>
    </div>
  );
};

const isElectron = window.isElectron === true;

const SubplebbitSettings = () => {
  const { t } = useTranslation();
  const { subplebbitAddress } = useParams<{ subplebbitAddress: string }>();
  const subplebbit = useSubplebbit({ subplebbitAddress });
  const { address, challenges, createdAt, description, rules, shortAddress, settings, suggested, roles, title } = subplebbit || {};
  const hasLoaded = !!createdAt;

  const { challenges: rpcChallenges } = usePlebbitRpcSettings().plebbitRpcSettings || {};
  const challengeNames = Object.keys(rpcChallenges || {});

  const account = useAccount();
  const location = useLocation();
  const navigate = useNavigate();
  const params = useParams();
  const isInCreateSubplebbitView = isCreateSubplebbitView(location.pathname);
  const isInSubplebbitSettingsView = isSubplebbitSettingsView(location.pathname, params);
  const isConnectedToRpc = !!account?.plebbitOptions.plebbitRpcClientsOptions;
  const isOnFullNode = isElectron || isConnectedToRpc;

  const isReadOnly = (!settings && isInSubplebbitSettingsView) || (!isOnFullNode && isInCreateSubplebbitView);

  const { publishSubplebbitEditOptions, resetSubplebbitSettingsStore, setSubplebbitSettingsStore } = useSubplebbitSettingsStore();
  const { error: publishSubplebbitEditError, publishSubplebbitEdit } = usePublishSubplebbitEdit(publishSubplebbitEditOptions);
  const { error: createSubplebbitError, createdSubplebbit, createSubplebbit } = useCreateSubplebbit(publishSubplebbitEditOptions);

  const [showSaving, setShowSaving] = useState(false);
  const [currentError, setCurrentError] = useState<Error | undefined>(undefined);

  useEffect(() => {
    if (publishSubplebbitEditError || createSubplebbitError) {
      setCurrentError(publishSubplebbitEditError || createSubplebbitError);
    }
  }, [publishSubplebbitEditError, createSubplebbitError]);

  const saveSubplebbit = async () => {
    try {
      setShowSaving(true);
      setCurrentError(undefined);
      console.log('Saving subplebbit with options:', publishSubplebbitEditOptions);
      await publishSubplebbitEdit();
      setShowSaving(false);
      if (publishSubplebbitEditError) {
        setCurrentError(publishSubplebbitEditError);
        alert(publishSubplebbitEditError.message || 'Error: ' + publishSubplebbitEditError);
      } else {
        alert(t('settings_saved', { subplebbitAddress }));
      }
    } catch (e) {
      if (e instanceof Error) {
        console.warn(e);
        setCurrentError(e);
        alert(`failed editing subplebbit: ${e.message}`);
      } else {
        console.error('An unknown error occurred:', e);
      }
    }
  };

  const [showDeleting, setShowDeleting] = useState(false);
  const _deleteSubplebbit = async () => {
    if (subplebbitAddress && window.confirm(t('delete_confirm', { value: `p/${shortAddress}`, interpolation: { escapeValue: false } }))) {
      if (window.confirm(t('double_confirm'))) {
        try {
          setShowDeleting(true);
          await deleteSubplebbit(subplebbitAddress);
          setShowDeleting(false);
          alert(`Deleted p/${shortAddress}`);
          navigate('/communities', { replace: true });
        } catch (e) {
          if (e instanceof Error) {
            console.warn(e);
            alert(`failed deleting subplebbit: ${e.message}`);
          } else {
            console.error('An unknown error occurred:', e);
          }
        }
      }
    }
  };

  const _createSubplebbit = async () => {
    try {
      setShowSaving(true);
      setCurrentError(undefined);
      console.log('Creating subplebbit with settings:', publishSubplebbitEditOptions);
      await createSubplebbit();
      setShowSaving(false);
      if (createSubplebbitError) {
        setCurrentError(createSubplebbitError);
        alert(createSubplebbitError.message || 'Error: ' + createSubplebbitError);
      }
    } catch (e) {
      if (e instanceof Error) {
        console.warn(e);
        setCurrentError(e);
        alert(`failed creating subplebbit: ${e.message}`);
      } else {
        console.error('An unknown error occurred:', e);
      }
    }
  };

  const { subscribe } = useSubscribe({ subplebbitAddress: createdSubplebbit?.address });

  useEffect(() => {
    if (createdSubplebbit) {
      console.log('createdSubplebbit', createdSubplebbit);
      alert(`community created, address: ${createdSubplebbit?.address}`);

      if (account && createdSubplebbit.address) {
        subscribe();
      }

      resetSubplebbitSettingsStore();
      navigate(`/p/${createdSubplebbit?.address}/`);
    }
  }, [createdSubplebbit, navigate, resetSubplebbitSettingsStore, account]);

  useEffect(() => {
    resetSubplebbitSettingsStore();
    if (hasLoaded) {
      setSubplebbitSettingsStore({
        title: title ?? '',
        description: description ?? '',
        address,
        suggested: suggested ?? {},
        rules: rules ?? [],
        roles: roles ?? {},
        settings: settings ?? {},
        challenges: challenges ?? [],
        subplebbitAddress,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetSubplebbitSettingsStore, hasLoaded]);

  const documentTitle = useMemo(() => {
    let title;
    if (isInSubplebbitSettingsView) {
      title = _.startCase(t('community_settings', { interpolation: { escapeValue: false } }));
    } else if (isInCreateSubplebbitView) {
      title = _.startCase(t('create_community', { interpolation: { escapeValue: false } }));
    }
    return `${title} - Seedit`;
  }, [isInCreateSubplebbitView, isInSubplebbitSettingsView, t]);

  useEffect(() => {
    document.title = documentTitle;
  }, [documentTitle]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (!hasLoaded && !isInCreateSubplebbitView) {
    return (
      <div className={styles.loading}>
        <LoadingEllipsis string={t('loading')} />
      </div>
    );
  }

  return (
    <div className={styles.content}>
      {!isInCreateSubplebbitView && (
        <div className={styles.sidebar}>
          <Sidebar subplebbit={subplebbit} />
        </div>
      )}
      {isReadOnly && <div className={styles.infobar}>{t('owner_settings_notice')}</div>}
      <Title isReadOnly={isReadOnly} />
      <Description isReadOnly={isReadOnly} />
      {!isInCreateSubplebbitView && <Address isReadOnly={isReadOnly} />}
      <Logo isReadOnly={isReadOnly} />
      <Rules isReadOnly={isReadOnly} />
      <Moderators isReadOnly={isReadOnly} />
      <Challenges isReadOnly={isReadOnly} readOnlyChallenges={subplebbit?.challenges} challengeNames={challengeNames} challengesSettings={rpcChallenges} />
      {!isInCreateSubplebbitView && <JSONSettings isReadOnly={isReadOnly} />}
      <div className={styles.saveOptions}>
        {!isInCreateSubplebbitView && !isReadOnly && (
          <div className={`${styles.box} ${styles.deleteCommunity}`}>
            <div className={styles.boxTitle}>{t('delete_community')}</div>
            <div className={styles.boxSubtitle}>{t('delete_community_description')}</div>
            <div className={styles.boxInput}>
              <div className={styles.deleteSubplebbit}>
                <button onClick={_deleteSubplebbit} disabled={showDeleting || showSaving}>
                  {t('delete')}
                </button>
                <span className={styles.deletingString}>{showDeleting && <LoadingEllipsis string={t('deleting')} />}</span>
              </div>
            </div>
          </div>
        )}
        {!isReadOnly && (
          <button onClick={() => (isInCreateSubplebbitView ? _createSubplebbit() : saveSubplebbit())} disabled={showSaving || showDeleting}>
            {isInCreateSubplebbitView ? t('create_community') : t('save_options')}
          </button>
        )}
        {showSaving && <LoadingEllipsis string={t('saving')} />}
        {currentError && <div className={styles.error}>error: {currentError.message || 'unknown error'}</div>}
      </div>
    </div>
  );
};

export default SubplebbitSettings;
