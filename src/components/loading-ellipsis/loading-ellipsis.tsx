import styles from './loading-ellipsis.module.css';

interface LoadingEllipsisProps {
  string: string;
}

const LoadingEllipsis = ({ string }: LoadingEllipsisProps) => {
  const words = string.split(' ');
  const lastWord = words.pop();
  const restOfString = words.join(' ');

  return (
    <span>
      {restOfString}
      {restOfString && ' '}
      <span className={styles.nowrap}>
        {lastWord}
        <span className={styles.ellipsis} />
      </span>
    </span>
  );
};

export default LoadingEllipsis;
