import { useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { PublishSubplebbitEditOptions, useSubplebbit, usePublishSubplebbitEdit, Role } from '@plebbit/plebbit-react-hooks';
import { Roles } from '../../../lib/utils/user-utils';
import { useTranslation } from 'react-i18next';
import { create } from 'zustand';
import styles from './subplebbit-settings.module.css';
import { isValidURL } from '../../../lib/utils/url-utils';
import {
  OptionInput,
  Exclude,
  getDefaultChallengeDescription,
  getDefaultExclude,
  getDefaultChallengeOptions,
  getDefaultChallengeSettings,
} from '../../../lib/utils/challenge-utils';
import LoadingEllipsis from '../../../components/loading-ellipsis';
import Sidebar from '../../../components/sidebar';

type SubplebbitSettingsState = {
  challenges: any[] | undefined;
  title: string | undefined;
  description: string | undefined;
  address: string | undefined;
  suggested: any | undefined;
  rules: string[] | undefined;
  roles: Roles | undefined;
  settings: any | undefined;
  subplebbitAddress: string | undefined;
  publishSubplebbitEditOptions: PublishSubplebbitEditOptions;
  setSubmitStore: (data: Partial<SubplebbitSettingsState>) => void;
};

const useSubplebbitSettingsStore = create<SubplebbitSettingsState>((set) => ({
  challenges: undefined,
  title: undefined,
  description: undefined,
  address: undefined,
  suggested: undefined,
  rules: undefined,
  roles: undefined,
  settings: undefined,
  subplebbitAddress: undefined,
  publishSubplebbitEditOptions: {},
  setSubmitStore: ({ challenges, title, description, address, suggested, rules, roles, settings, subplebbitAddress }) =>
    set((state) => {
      const nextState = { ...state };
      if (challenges !== undefined) nextState.challenges = challenges;
      if (title !== undefined) nextState.title = title;
      if (description !== undefined) nextState.description = description;
      if (address !== undefined) nextState.address = address;
      if (suggested?.avatarUrl !== undefined) {
        nextState.suggested = { ...state.suggested, avatarUrl: suggested.avatarUrl };
      }
      if (rules !== undefined) nextState.rules = rules;
      if (roles !== undefined) nextState.roles = roles;
      if (settings?.challenges !== undefined) {
        nextState.settings = { ...state.settings, challenges: settings.challenges };
      }
      if (subplebbitAddress !== undefined) nextState.subplebbitAddress = subplebbitAddress;

      nextState.publishSubplebbitEditOptions = {
        ...nextState,
      };

      return nextState;
    }),
}));

const Title = ({ isReadOnly }: { isReadOnly: boolean }) => {
  const { t } = useTranslation();
  const { title, setSubmitStore } = useSubplebbitSettingsStore();

  return (
    <div className={styles.box}>
      <div className={styles.boxTitle}>{t('title')}</div>
      <div className={styles.boxSubtitle}>e.g., books: made from trees or pixels. recommendations, news, or thoughts</div>
      <div className={styles.boxInput}>
        {isReadOnly ? <span>{title}</span> : <input type='text' value={title ?? ''} onChange={(e) => setSubmitStore({ title: e.target.value })} />}
      </div>
    </div>
  );
};

const Description = ({ isReadOnly }: { isReadOnly: boolean }) => {
  const { t } = useTranslation();
  const { description, setSubmitStore } = useSubplebbitSettingsStore();

  return (
    <div className={styles.box}>
      <div className={styles.boxTitle}>{t('description')}</div>
      <div className={styles.boxSubtitle}>shown in the sidebar of your community</div>
      <div className={styles.boxInput}>
        {isReadOnly ? (
          <pre className={styles.readOnlyDescription}>{description}</pre>
        ) : (
          <textarea value={description ?? ''} onChange={(e) => setSubmitStore({ description: e.target.value })} />
        )}
      </div>
    </div>
  );
};

const Address = ({ isReadOnly }: { isReadOnly: boolean }) => {
  const { t } = useTranslation();
  const { address, setSubmitStore } = useSubplebbitSettingsStore();

  return (
    <div className={styles.box}>
      <div className={styles.boxTitle}>{t('address')}</div>
      <div className={styles.boxSubtitle}>set a readable community address using ens.domains</div>
      <div className={styles.boxInput}>
        {isReadOnly ? <span>{address}</span> : <input type='text' value={address ?? ''} onChange={(e) => setSubmitStore({ address: e.target.value })} />}
      </div>
    </div>
  );
};

const Logo = ({ isReadOnly }: { isReadOnly: boolean }) => {
  const { t } = useTranslation();
  const { suggested, setSubmitStore } = useSubplebbitSettingsStore();

  const [logoUrl, setLogoUrl] = useState(suggested?.avatarUrl);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    setLogoUrl(suggested?.avatarUrl);
    setImageError(false);
  }, [suggested?.avatarUrl]);

  return (
    <div className={styles.box}>
      <div className={styles.boxTitle}>{t('logo')}</div>
      <div className={styles.boxSubtitle}>set a community logo using its direct image link (ending in .jpg, .png)</div>
      <div className={styles.boxInput}>
        {isReadOnly ? (
          <span>{logoUrl}</span>
        ) : (
          <input
            type='text'
            value={logoUrl ?? ''}
            onChange={(e) => {
              setLogoUrl(e.target.value);
              setImageError(false);
              setSubmitStore({ suggested: { ...suggested, avatarUrl: e.target.value } });
            }}
          />
        )}
        {logoUrl && isValidURL(logoUrl) && (
          <div className={styles.logoPreview}>
            preview:
            {imageError ? <span className={styles.logoError}>no image found</span> : <img src={logoUrl} alt='logo preview' onError={() => setImageError(true)} />}
          </div>
        )}
      </div>
    </div>
  );
};

const Rules = ({ isReadOnly }: { isReadOnly: boolean }) => {
  const { t } = useTranslation();
  const { rules, setSubmitStore } = useSubplebbitSettingsStore();
  const lastRuleRef = useRef(null);

  const handleRuleChange = (index: number, newRule: string) => {
    const updatedRules = [...(rules ?? [])];
    updatedRules[index] = newRule;
    setSubmitStore({ rules: updatedRules });
  };

  const addRule = () => {
    const newRules = rules ? [...rules, ''] : [''];
    setSubmitStore({ rules: newRules });
  };

  useEffect(() => {
    if (!isReadOnly && rules && rules.length > 0) {
      (lastRuleRef.current as any).focus();
    }
  }, [rules?.length, isReadOnly, rules]);

  const deleteRule = (index: number) => {
    if (rules) {
      const filteredRules = rules.filter((_, i) => i !== index);
      setSubmitStore({ rules: filteredRules });
    }
  };

  return (
    <div className={styles.box}>
      <div className={styles.boxTitle}>{t('rules')}</div>
      <div className={styles.boxSubtitle}>shown in the sidebar of your community</div>
      <div className={styles.boxInput}>
        {!isReadOnly && (
          <button className={styles.addButton} onClick={addRule} disabled={isReadOnly}>
            Add a Rule
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

const Moderators = ({ isReadOnly }: { isReadOnly: boolean }) => {
  const { t } = useTranslation();
  const { roles, setSubmitStore } = useSubplebbitSettingsStore();
  const lastModeratorRef = useRef(null);

  const handleAddModerator = () => {
    if (roles) {
      const newRoles: Roles = { ...roles, '': { role: 'moderator' } };
      setSubmitStore({ roles: newRoles });
    }
  };

  const numberOfModerators = useMemo(() => Object.keys(roles || {}).length, [roles]);

  useEffect(() => {
    if (!isReadOnly && numberOfModerators > 0) {
      (lastModeratorRef.current as any).focus();
    }
  }, [numberOfModerators, isReadOnly, roles]);

  const handleRoleChange = (address: string, newRole: 'owner' | 'admin' | 'moderator') => {
    if (roles) {
      const updatedRole: Role = { role: newRole };
      const updatedRoles: Roles = { ...roles, [address]: updatedRole };
      setSubmitStore({ roles: updatedRoles });
    }
  };

  const handleDeleteModerator = (address: string) => {
    if (roles) {
      const { [address]: _, ...remainingRoles } = roles;
      setSubmitStore({ roles: remainingRoles });
    }
  };

  const handleAddressChange = (index: number, newAddress: string) => {
    const rolesArray = Object.entries(roles || {});
    rolesArray[index] = [newAddress, rolesArray[index][1]];
    const updatedRoles = Object.fromEntries(rolesArray);
    setSubmitStore({ roles: updatedRoles });
  };

  return (
    <div className={styles.box}>
      <div className={styles.boxTitle}>{t('moderators')}</div>
      <div className={styles.boxSubtitle}>let other users moderate and post without challenges</div>
      <div className={styles.boxInput}>
        {!isReadOnly && (
          <button className={styles.addButton} onClick={handleAddModerator} disabled={isReadOnly}>
            add a moderator
          </button>
        )}
        {roles &&
          Object.entries(roles).map(([address, role], index) => (
            <div className={`${styles.moderator} ${index === 0 && styles.firstModerator}`} key={index}>
              Moderator #{index + 1}
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

const challengesNames = ['text-math', 'captcha-canvas-v3', 'fail', 'blacklist', 'question', 'evm-contract-call'];

interface ChallengeSettingsProps {
  challenge: any;
  index: number;
  isReadOnly: boolean;
  setSubmitStore: (data: Partial<SubplebbitSettingsState>) => void;
  settings: any;
  showSettings: boolean;
}

const rolesToExclude = ['moderator', 'admin', 'owner'];
const actionsToExclude: Array<'post' | 'reply' | 'vote'> = ['post', 'reply', 'vote'];
const customActions: Array<'non-post' | 'non-reply' | 'non-vote'> = ['non-post', 'non-reply', 'non-vote'];

const ChallengeSettings = ({ challenge, index, isReadOnly, setSubmitStore, settings, showSettings }: ChallengeSettingsProps) => {
  const { name, options } = challenge || {};
  const challengeSettings: OptionInput[] = getDefaultChallengeSettings(name);

  const handleOptionChange = (optionName: string, newValue: string) => {
    const updatedOptions = { ...options, [optionName]: newValue };
    const updatedChallenges = settings.challenges.map((ch: any, idx: number) => (idx === index ? { ...ch, options: updatedOptions } : ch));
    setSubmitStore({ settings: { ...settings, challenges: updatedChallenges } });
  };

  const addExcludeGroup = () => {
    const newExclude = getDefaultExclude()[0];
    const updatedChallenges = settings.challenges.map((ch: any, idx: number) => (idx === index ? { ...ch, exclude: [...ch.exclude, newExclude] } : ch));
    setSubmitStore({ settings: { ...settings, challenges: updatedChallenges } });
  };

  const deleteExcludeGroup = (excludeIndex: number) => {
    const updatedChallenges = [...settings.challenges];
    const currentChallenge = updatedChallenges[index];
    currentChallenge.exclude.splice(excludeIndex, 1);
    setSubmitStore({ settings: { ...settings, challenges: updatedChallenges } });
  };

  const [showExcludeSettings, setShowExcludeSettings] = useState<boolean[]>(challenge.exclude.map(() => (isReadOnly ? true : false)));
  const toggleExcludeSettings = (excludeIndex: number) => {
    const newShowExcludeSettings = [...showExcludeSettings];
    newShowExcludeSettings[excludeIndex] = !newShowExcludeSettings[excludeIndex];
    setShowExcludeSettings(newShowExcludeSettings);
  };

  const handleExcludeChange = (excludeIndex: number, type: keyof Exclude | 'non-post' | 'non-reply' | 'non-vote', value: any) => {
    const updatedChallenges = settings.challenges.map((ch: any, idx: number) => {
      if (idx === index) {
        const updatedExclude = ch.exclude.map((ex: any, exIdx: number) => {
          if (exIdx === excludeIndex) {
            let newEx = { ...ex };

            // Convert empty string to undefined
            const processedValue = value === '' ? undefined : value;

            switch (type) {
              case 'non-post':
                newEx.post = value ? undefined : false;
                break;
              case 'non-reply':
                newEx.reply = value ? undefined : false;
                break;
              case 'non-vote':
                newEx.vote = value ? undefined : false;
                break;
              case 'role':
                if (typeof value === 'string') {
                  const roleIndex = newEx.role.indexOf(value);
                  if (roleIndex > -1) {
                    newEx.role.splice(roleIndex, 1);
                  } else {
                    newEx.role.push(value);
                  }
                }
                break;
              default:
                newEx[type] = processedValue;
            }
            return newEx;
          }
          return ex;
        });
        return { ...ch, exclude: updatedExclude };
      }
      return ch;
    });

    setSubmitStore({ settings: { ...settings, challenges: updatedChallenges } });
  };

  const handleExcludeAddress = (excludeIndex: number, value: string) => {
    const addresses = value
      .split(',')
      .map((addr) => addr.trim())
      .filter((addr) => addr !== '');
    handleExcludeChange(excludeIndex, 'address', addresses);
  };

  return (
    <div className={showSettings ? styles.visible : styles.hidden}>
      {isReadOnly ? (
        <>
          <div className={styles.readOnlyChallengeType}>type: {challenge?.type}</div>
          <div className={styles.readOnlyChallengeDescription}>{challenge?.description}</div>
        </>
      ) : (
        <div className={styles.challengeDescription}>{getDefaultChallengeDescription(name)}</div>
      )}
      {challengeSettings.map((setting) => (
        <div key={setting?.option} className={styles.challengeOption}>
          <div className={styles.challengeOptionLabel}>{setting?.label}</div>
          <div className={styles.challengeOptionDescription}>{setting?.description}</div>
          {isReadOnly ? (
            <span>{options && (options[setting?.option] || '')}</span>
          ) : (
            <input
              type='text'
              value={options && (options[setting?.option] || '')}
              defaultValue={setting?.default || ''}
              placeholder={setting?.placeholder || ''}
              onChange={(e) => handleOptionChange(setting?.option, e.target.value)}
            />
          )}
        </div>
      ))}
      <div className={styles.challengeDescription}>Exclude from challenge #{index + 1}</div>
      <div className={styles.excludeGroupSection}>
        {!isReadOnly && (
          <button className={`${styles.addButton} ${styles.addExclude}`} onClick={addExcludeGroup} disabled={isReadOnly}>
            Add Group
          </button>
        )}
        {challenge.exclude.map((exclude: any, excludeIndex: number) => (
          <div key={excludeIndex} className={styles.excludeGroup}>
            Exclude Group #{excludeIndex + 1}
            {!isReadOnly && <span className={styles.deleteButton} onClick={() => deleteExcludeGroup(excludeIndex)} title='delete group' />}
            {!isReadOnly && (
              <button className={styles.hideCombo} onClick={() => toggleExcludeSettings(excludeIndex)} disabled={isReadOnly}>
                {showExcludeSettings[excludeIndex] ? 'Hide' : 'Show'} Group Settings
              </button>
            )}
            {showExcludeSettings[excludeIndex] && (
              <>
                {isReadOnly && !exclude?.address ? null : (
                  <div className={styles.challengeOption}>
                    Users
                    <div className={styles.challengeOptionDescription}>Exclude specific users by their addresses, separated by a comma</div>
                    {isReadOnly ? (
                      <span>{exclude?.address?.join(', ')}</span>
                    ) : (
                      <input
                        type='text'
                        placeholder='address1.eth, address2.eth, address3.eth'
                        value={exclude?.address?.join(', ')}
                        onChange={(e) => handleExcludeAddress(excludeIndex, e.target.value)}
                      />
                    )}
                  </div>
                )}
                {isReadOnly && !exclude?.postScore && !exclude?.postReply ? null : (
                  <div className={styles.challengeOption}>
                    Users with Karma
                    {isReadOnly && !exclude?.postScore ? null : (
                      <>
                        <div className={styles.challengeOptionDescription}>Minimum post karma required:</div>
                        {isReadOnly ? (
                          <span>{exclude?.postScore}</span>
                        ) : (
                          <input type='number' value={exclude?.postScore || undefined} onChange={(e) => handleExcludeChange(excludeIndex, 'postScore', e.target.value)} />
                        )}
                      </>
                    )}
                    {isReadOnly && !exclude?.postReply ? null : (
                      <>
                        <div className={styles.challengeOptionDescription}>Minimum comment karma required:</div>
                        {isReadOnly ? (
                          <span>{exclude?.postReply}</span>
                        ) : (
                          <input type='number' value={exclude?.postReply || undefined} onChange={(e) => handleExcludeChange(excludeIndex, 'postReply', e.target.value)} />
                        )}
                      </>
                    )}
                  </div>
                )}
                {isReadOnly && !exclude?.firstCommentTimestamp ? null : (
                  <div className={styles.challengeOption}>
                    Users by account age
                    <div className={styles.challengeOptionDescription}>Minimum account age in seconds (eg. 86400 = 24h):</div>
                    {isReadOnly ? (
                      <span>{exclude?.firstCommentTimestamp}</span>
                    ) : (
                      <input
                        type='number'
                        value={exclude?.firstCommentTimestamp || undefined}
                        onChange={(e) => handleExcludeChange(excludeIndex, 'firstCommentTimestamp', e.target.value)}
                      />
                    )}
                  </div>
                )}
                {isReadOnly && !exclude?.role ? null : (
                  <div className={styles.challengeOption}>
                    Moderators
                    <div className={styles.challengeOptionDescription}>Exclude a specific moderator role</div>
                    {rolesToExclude.map((role) =>
                      isReadOnly && !exclude?.role?.includes(role) ? null : (
                        <div key={role}>
                          {isReadOnly ? (
                            <span className={styles.readOnlyRoleExclude}>{role} excluded</span>
                          ) : (
                            <label>
                              <input
                                type='checkbox'
                                checked={exclude?.role?.includes(role)}
                                onChange={() => handleExcludeChange(excludeIndex, 'role', role)}
                                disabled={isReadOnly}
                              />
                              exclude {role}
                            </label>
                          )}
                        </div>
                      ),
                    )}
                  </div>
                )}
                {isReadOnly && actionsToExclude.some((action) => exclude.hasOwnProperty(action)) ? null : (
                  <div className={styles.challengeOption}>
                    Actions
                    <div className={styles.challengeOptionDescription}>Exclude a specific user action</div>
                    {actionsToExclude.map((action) =>
                      isReadOnly && !exclude?.[action] ? null : (
                        <div key={action}>
                          {isReadOnly ? (
                            <span className={styles.readOnlyActionExclude}>{action} excluded</span>
                          ) : (
                            <label>
                              <input
                                type='checkbox'
                                checked={exclude?.[action]}
                                onChange={(e) => handleExcludeChange(excludeIndex, action, e.target.checked)}
                                disabled={isReadOnly}
                              />
                              exclude {action}
                            </label>
                          )}
                        </div>
                      ),
                    )}
                    {customActions.map((action) =>
                      isReadOnly && exclude?.[action.replace('non-', '')] ? null : (
                        <div key={action}>
                          {isReadOnly ? (
                            <span className={styles.readOnlyActionExclude}>{action} excluded</span>
                          ) : (
                            <label>
                              <input
                                type='checkbox'
                                checked={exclude?.[action.replace('non-', '')]}
                                onChange={(e) => handleExcludeChange(excludeIndex, action, e.target.checked)}
                                disabled={isReadOnly}
                              />
                              exclude {action}
                            </label>
                          )}
                        </div>
                      ),
                    )}
                  </div>
                )}
                {isReadOnly && !exclude?.rateLimit ? null : (
                  <div className={styles.challengeOption}>
                    Rate Limit
                    <div className={styles.challengeOptionDescription}>Number of free user actions per hour:</div>
                    {isReadOnly ? (
                      <div>{exclude?.rateLimit}</div>
                    ) : (
                      <input type='number' value={exclude?.rateLimit || undefined} onChange={(e) => handleExcludeChange(excludeIndex, 'rateLimit', e.target.value)} />
                    )}
                    {isReadOnly && !exclude?.rateLimitChallengeSuccess ? null : (
                      <label>
                        <input
                          type='checkbox'
                          checked={exclude?.rateLimitChallengeSuccess}
                          onChange={(e) => handleExcludeChange(excludeIndex, 'rateLimitChallengeSuccess', e.target.checked)}
                          disabled={isReadOnly}
                        />
                        apply rate limit only to successfully completed challenges
                      </label>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

const Challenges = ({ isReadOnly, readOnlyChallenges }: { isReadOnly: boolean; readOnlyChallenges: any }) => {
  const { t } = useTranslation();
  const { settings, setSubmitStore } = useSubplebbitSettingsStore();
  const challenges = settings?.challenges || readOnlyChallenges || [];
  const [showSettings, setShowSettings] = useState<boolean[]>(challenges.map(() => (isReadOnly ? true : false)));

  const toggleSettings = (index: number) => {
    const newShowSettings = [...showSettings];
    newShowSettings[index] = !newShowSettings[index];
    setShowSettings(newShowSettings);
  };

  const handleAddChallenge = () => {
    const defaultChallenge = 'captcha-canvas-v3';
    const options = getDefaultChallengeOptions(defaultChallenge);
    const newChallenge = {
      name: defaultChallenge,
      options,
      exclude: getDefaultExclude(),
    };
    const updatedChallenges = [...(settings?.challenges || []), newChallenge];
    setSubmitStore({ settings: { ...settings, challenges: updatedChallenges } });
    setShowSettings((oldShowSettings) => [...oldShowSettings, true]);
  };

  const handleDeleteChallenge = (index: number) => {
    const updatedChallenges = settings?.challenges.filter((_: any, idx: number) => idx !== index);
    setSubmitStore({ settings: { ...settings, challenges: updatedChallenges } });
    setShowSettings((oldShowSettings) => oldShowSettings.filter((_, idx) => idx !== index));
  };

  const handleChallengeTypeChange = (index: number, newType: string) => {
    const updatedChallenges = [...challenges];
    updatedChallenges[index] = { ...updatedChallenges[index], name: newType, options: getDefaultChallengeOptions(newType) };
    setSubmitStore({ settings: { ...settings, challenges: updatedChallenges } });
  };

  return (
    <div className={styles.box}>
      <div className={styles.boxTitle}>{t('challenges')}</div>
      <div className={styles.boxSubtitle}>choose one or more challenges to prevent spam</div>
      <div className={styles.boxInput}>
        {!isReadOnly && (
          <button className={styles.addButton} onClick={handleAddChallenge} disabled={isReadOnly}>
            add a challenge
          </button>
        )}
        {challenges.length === 0 && <span className={styles.noChallengeWarning}>Warning: vulnerable to spam attacks.</span>}
        {challenges.map((challenge: any, index: number) => (
          <div key={index} className={styles.challenge}>
            Challenge #{index + 1}
            {!isReadOnly && <span className={styles.deleteButton} title='delete challenge' onClick={() => (isReadOnly ? {} : handleDeleteChallenge(index))} />}
            <br />
            {isReadOnly ? (
              <span className={styles.readOnlyChallenge}>{challenge?.name}</span>
            ) : (
              <select value={challenge?.name} onChange={(e) => handleChallengeTypeChange(index, e.target.value)} disabled={isReadOnly}>
                {challengesNames.map((challenge) => (
                  <option key={challenge} value={challenge}>
                    {challenge}
                  </option>
                ))}
              </select>
            )}
            {!isReadOnly && (
              <button className={styles.challengeEditButton} onClick={() => toggleSettings(index)} disabled={isReadOnly}>
                {showSettings[index] ? 'hide settings' : 'show settings'}
              </button>
            )}
            <ChallengeSettings
              challenge={challenge}
              index={index}
              isReadOnly={isReadOnly}
              setSubmitStore={setSubmitStore}
              settings={settings}
              showSettings={showSettings[index]}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

const JSONSettings = ({ isReadOnly }: { isReadOnly: boolean }) => {
  const { challenges, title, description, address, suggested, rules, roles, settings, subplebbitAddress, setSubmitStore } = useSubplebbitSettingsStore();
  const [text, setText] = useState('');

  useEffect(() => {
    const JSONSettings = JSON.stringify({ title, description, address, suggested, rules, roles, settings, challenges, subplebbitAddress }, null, 2);
    setText(JSONSettings);
  }, [challenges, title, description, address, suggested, rules, roles, settings, subplebbitAddress]);

  const handleChange = (newText: string) => {
    setText(newText);
    try {
      const newSettings = JSON.parse(newText);
      setSubmitStore(newSettings);
    } catch (e) {
      console.error('Invalid JSON format');
    }
  };

  return (
    <div className={styles.box}>
      <div className={`${styles.boxTitle} ${styles.JSONSettingsTitle}`}>JSON settings</div>
      <div className={styles.boxSubtitle}>quickly copy or paste the community settings</div>
      <div className={`${styles.boxInput} ${styles.JSONSettings}`}>
        <textarea onChange={(e) => handleChange(e.target.value)} autoCorrect='off' autoComplete='off' spellCheck='false' value={text} disabled={isReadOnly} />
      </div>
    </div>
  );
};

const SubplebbitSettings = () => {
  const { t } = useTranslation();
  const { subplebbitAddress } = useParams<{ subplebbitAddress: string }>();
  const subplebbit = useSubplebbit({ subplebbitAddress });
  const { address, challenges, createdAt, description, rules, settings, suggested, roles, title, updatedAt } = subplebbit || {};
  const isReadOnly = !settings;

  const { publishSubplebbitEditOptions, setSubmitStore } = useSubplebbitSettingsStore();
  const { publishSubplebbitEdit } = usePublishSubplebbitEdit(publishSubplebbitEditOptions);

  const [showLoading, setShowLoading] = useState(false);
  const saveSubplebbit = async () => {
    try {
      setShowLoading(true);
      await publishSubplebbitEdit();
      setShowLoading(false);
      alert(`saved`);
    } catch (e) {
      if (e instanceof Error) {
        console.warn(e);
        alert(`failed editing subplebbit: ${e.message}`);
      } else {
        console.error('An unknown error occurred:', e);
      }
      setShowLoading(false);
    }
  };

  // set the store with the initial data
  useEffect(() => {
    setSubmitStore({
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

    window.scrollTo(0, 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    document.title = `${t('preferences')} - seedit`;
  }, [t]);

  return (
    <div className={styles.content}>
      <div className={styles.sidebar}>
        <Sidebar address={subplebbitAddress} createdAt={createdAt} description={description} roles={roles} rules={rules} title={title} updatedAt={updatedAt} />
      </div>
      {/* subplebbit.settings is private, only shows to the sub owner */}
      {!settings && <div className={styles.infobar}>can't connect to community p2p node - only the owner of a community can edit its settings.</div>}
      <Title isReadOnly={isReadOnly} />
      <Description isReadOnly={isReadOnly} />
      <Address isReadOnly={isReadOnly} />
      <Logo isReadOnly={isReadOnly} />
      <Rules isReadOnly={isReadOnly} />
      <Moderators isReadOnly={isReadOnly} />
      <Challenges isReadOnly={isReadOnly} readOnlyChallenges={subplebbit?.challenges} />
      <JSONSettings isReadOnly={isReadOnly} />
      <div className={styles.saveOptions}>
        {!isReadOnly && (
          <button onClick={saveSubplebbit} disabled={showLoading}>
            {t('save_options')}
          </button>
        )}
        {showLoading && <LoadingEllipsis string={t('saving')} />}
      </div>
    </div>
  );
};

export default SubplebbitSettings;
