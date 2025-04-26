import React, { useMemo, useState } from 'react';
import remarkGfm from 'remark-gfm';
import supersub from 'remark-supersub';
import ReactMarkdown, { Components } from 'react-markdown';
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize';
import styles from './markdown.module.css';
import rehypeRaw from 'rehype-raw';
import SpoilerTooltip from '../spoiler-tooltip';

interface MarkdownProps {
  content: string;
}

interface ExtendedComponents extends Components {
  spoiler: React.ComponentType<{ children: React.ReactNode }>;
}

const MAX_LENGTH_FOR_GFM = 10000; // remarkGfm lags with large content

const spoilerTransform = () => (tree: any) => {
  const visit = (node: any) => {
    if (node.tagName === 'spoiler') {
      node.tagName = 'span';
      node.properties = node.properties || {};
      node.properties.className = 'spoilertext';
    }

    if (node.children) {
      node.children.forEach(visit);
    }
  };

  if (tree.children) {
    tree.children.forEach(visit);
  }
};

const SpoilerText = ({ children }: { children: React.ReactNode }) => {
  const [revealed, setRevealed] = useState(false);

  return (
    <SpoilerTooltip
      children={
        <span className={revealed ? 'spoilerTextRevealed' : 'spoilerText'} onClick={() => setRevealed(true)}>
          {children}
        </span>
      }
      content='Reveal spoiler'
      showTooltip={!revealed}
    />
  );
};

const Markdown = ({ content }: MarkdownProps) => {
  const remarkPlugins: any[] = [[supersub]];

  if (content && content.length <= MAX_LENGTH_FOR_GFM) {
    remarkPlugins.push([remarkGfm, { singleTilde: false }]);
  }

  remarkPlugins.push([spoilerTransform]);

  const customSchema = useMemo(
    () => ({
      ...defaultSchema,
      tagNames: [...(defaultSchema.tagNames || []), 'span', 'spoiler'],
      attributes: {
        ...defaultSchema.attributes,
        span: ['className'],
        spoiler: [],
      },
    }),
    [],
  );

  return (
    <span className={styles.markdown}>
      <ReactMarkdown
        children={content}
        remarkPlugins={remarkPlugins}
        rehypePlugins={[[rehypeRaw as any], [rehypeSanitize, customSchema]]}
        components={
          {
            a: ({ children, href }) => (
              <a href={href} target='_blank' rel='noopener noreferrer'>
                {children}
              </a>
            ),
            p: ({ children }) => {
              const isEmpty =
                !children ||
                (Array.isArray(children) && children.every((child) => child === null || child === undefined || (typeof child === 'string' && child.trim() === '')));

              return !isEmpty && <p>{children}</p>;
            },
            img: ({ src, alt }) => {
              const displayText = src || alt || 'image';
              return <span>{displayText}</span>;
            },
            video: ({ src }) => <span>{src}</span>,
            iframe: ({ src }) => <span>{src}</span>,
            source: ({ src }) => <span>{src}</span>,
            spoiler: ({ children }) => <SpoilerText>{children}</SpoilerText>,
          } as ExtendedComponents
        }
      />
    </span>
  );
};

export default React.memo(Markdown);
