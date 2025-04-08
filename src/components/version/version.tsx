import packageJson from '../../../package.json';

const { version } = packageJson;
const commitRef = process.env.REACT_APP_COMMIT_REF;

const Version = () => {
  return (
    <a
      href={commitRef ? `https://github.com/plebbit/seedit/commit/${commitRef}` : `https://github.com/plebbit/seedit/releases/tag/v${version}`}
      target='_blank'
      rel='noopener noreferrer'
    >
      v{commitRef ? `${version}-dev (#${commitRef.slice(0, 7)})` : version}
    </a>
  );
};

export default Version;
