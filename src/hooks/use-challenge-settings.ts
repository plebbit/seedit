import { useEffect, useState } from 'react';
import { usePlebbitRpcSettings } from '@plebbit/plebbit-react-hooks';

const useChallengeSettings = (challengeName: string) => {
  const [settings, setSettings] = useState(null);
  const { challenges } = usePlebbitRpcSettings().plebbitRpcSettings || {};

  useEffect(() => {
    if (challenges) {
      setSettings(challenges[challengeName]);
    }
  }, [challenges, challengeName]);

  return settings;
};

export default useChallengeSettings;
