import { useState, ReactNode } from 'react';
import { useFloating, autoUpdate, offset, shift, useHover, useFocus, useDismiss, useRole, useInteractions, FloatingPortal } from '@floating-ui/react';
import styles from './tooltip.module.css';

interface TooltipProps {
  content: string;
  children: ReactNode;
  showTooltip?: boolean;
}

const Tooltip = ({ content, children, showTooltip = true }: TooltipProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const { refs, floatingStyles, context } = useFloating({
    open: isOpen,
    onOpenChange: setIsOpen,
    placement: 'top-start',
    whileElementsMounted: autoUpdate,
    middleware: [offset(7), shift()],
  });

  const hover = useHover(context, { move: false, delay: { open: 200, close: 0 } });
  const focus = useFocus(context);
  const dismiss = useDismiss(context);
  const role = useRole(context, { role: 'tooltip' });

  const { getReferenceProps, getFloatingProps } = useInteractions([hover, focus, dismiss, role]);

  return (
    <>
      <span ref={refs.setReference} {...getReferenceProps()}>
        {children}
      </span>
      {showTooltip && (
        <FloatingPortal>
          {isOpen && (
            <div className={styles.tooltip} ref={refs.setFloating} style={floatingStyles} {...getFloatingProps()}>
              {content}
            </div>
          )}
        </FloatingPortal>
      )}
    </>
  );
};

export default Tooltip;
