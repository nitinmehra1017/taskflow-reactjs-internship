import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import './Modal.scss';

const selector =
  'button:not([disabled]), a[href], input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

function focusableWithin(dialog) {
  return [...dialog.querySelectorAll(selector)].filter((element) => {
    if (element.tabIndex < 0 || element.matches(':disabled')) return false;
    if (element.closest('[hidden], [inert]')) return false;
    for (
      let ancestor = element;
      ancestor && ancestor !== dialog.parentElement;
      ancestor = ancestor.parentElement
    ) {
      const style = getComputedStyle(ancestor);
      if (
        style.display === 'none' ||
        style.visibility === 'hidden' ||
        style.visibility === 'collapse'
      )
        return false;
    }
    return true;
  });
}

function ModalSurface({
  title,
  description,
  children,
  footer,
  onClose,
  size,
  initialFocusRef,
  closeOnBackdrop,
}) {
  const titleId = useId();
  const descriptionId = useId();
  const dialogRef = useRef(null);
  const closeRef = useRef(onClose);
  const [portal] = useState(() => {
    const element = document.createElement('div');
    element.dataset.taskflowModal = '';
    return element;
  });

  useEffect(() => {
    closeRef.current = onClose;
  }, [onClose]);

  useLayoutEffect(() => {
    const returnTarget = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.append(portal);
    const siblings = [...document.body.children].filter((element) => element !== portal);
    const previousInert = siblings.map((element) => element.hasAttribute('inert'));
    siblings.forEach((element) => {
      element.setAttribute('inert', '');
    });
    document.body.style.overflow = 'hidden';
    const dialog = dialogRef.current;
    const focusFirst = () => (focusableWithin(dialog)[0] || dialog).focus();
    if (initialFocusRef?.current && dialog.contains(initialFocusRef.current))
      initialFocusRef.current.focus();
    else focusFirst();

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        event.preventDefault();
        event.stopPropagation();
        closeRef.current();
      }
      if (event.key === 'Tab') {
        const elements = focusableWithin(dialog);
        const first = elements[0];
        const last = elements.at(-1);
        if (!first) {
          event.preventDefault();
          dialog.focus();
          return;
        }
        if (
          event.shiftKey &&
          (document.activeElement === first || document.activeElement === dialog)
        ) {
          event.preventDefault();
          last.focus();
        } else if (
          !event.shiftKey &&
          (document.activeElement === last || document.activeElement === dialog)
        ) {
          event.preventDefault();
          first.focus();
        }
      }
    }
    function handleFocusIn(event) {
      if (!dialog.contains(event.target)) focusFirst();
    }
    document.addEventListener('keydown', handleKeyDown, true);
    document.addEventListener('focusin', handleFocusIn);
    return () => {
      document.removeEventListener('keydown', handleKeyDown, true);
      document.removeEventListener('focusin', handleFocusIn);
      siblings.forEach((element, index) => {
        if (previousInert[index]) element.setAttribute('inert', '');
        else element.removeAttribute('inert');
      });
      document.body.style.overflow = previousOverflow;
      portal.remove();
      if (returnTarget?.isConnected && typeof returnTarget.focus === 'function')
        returnTarget.focus();
    };
  }, [portal, initialFocusRef]);

  return createPortal(
    <div
      className="ui-modal-backdrop"
      onClick={(event) => {
        if (closeOnBackdrop && event.target === event.currentTarget) onClose();
      }}
    >
      <section
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        tabIndex={-1}
        className={`ui-modal ui-modal--${size}`}
      >
        <header className="ui-modal__header">
          <h2 id={titleId}>{title}</h2>
          <button
            className="ui-modal__close"
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
          >
            ×
          </button>
        </header>
        {description && (
          <p id={descriptionId} className="ui-modal__description">
            {description}
          </p>
        )}
        <div className="ui-modal__body">{children}</div>
        {footer && <footer className="ui-modal__footer">{footer}</footer>}
      </section>
    </div>,
    portal,
  );
}

/** Controlled single modal. onClose is required; nested/concurrent modals are unsupported. */
export default function Modal({
  open = false,
  size = 'md',
  closeOnBackdrop = false,
  ...props
}) {
  return open ? (
    <ModalSurface {...props} size={size} closeOnBackdrop={closeOnBackdrop} />
  ) : null;
}
