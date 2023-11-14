import styles from './loading-ellipsis.module.css';

interface LoadingEllipsisProps {
  string: string;
}

const LoadingEllipsis = ({ string }: LoadingEllipsisProps) => {
  return (
    <span className={styles.ellipsis}>
      {string}
    </span>
  );
}

export default LoadingEllipsis;
