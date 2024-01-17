import ReactMarkdown from 'react-markdown';
import rehypeSanitize from 'rehype-sanitize';
import styles from './markdown.module.css';
import remarkGfm from 'remark-gfm';

const Markdown = ({ content }: { content: string }) => {
  return (
    <span className={styles.markdown}>
      <ReactMarkdown children={content} remarkPlugins={[[remarkGfm, { singleTilde: false }]]} rehypePlugins={[rehypeSanitize]} />
    </span>
  );
};

export default Markdown;
