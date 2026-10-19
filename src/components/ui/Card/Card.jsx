import './Card.scss';

/** Presentational surface. title/description/actions/footer are optional React nodes. */
export default function Card({
  title,
  description,
  actions,
  footer,
  children,
  className = '',
  ...props
}) {
  return (
    <div {...props} className={`ui-card ${className}`}>
      {(title || description || actions) && (
        <div className="ui-card__header">
          <div>
            {title && <h3 className="ui-card__title">{title}</h3>}
            {description && <p className="ui-card__description">{description}</p>}
          </div>
          {actions && <div className="ui-card__actions">{actions}</div>}
        </div>
      )}
      {children && <div className="ui-card__body">{children}</div>}
      {footer && <div className="ui-card__footer">{footer}</div>}
    </div>
  );
}
