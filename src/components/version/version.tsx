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
      seedit v{commitRef ? '-dev' : version}
    </a>
  );
};

export default Version;
