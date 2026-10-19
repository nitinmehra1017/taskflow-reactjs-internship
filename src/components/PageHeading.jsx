/** eyebrow provides context; title is the page h1; children is supporting copy. */
export default function PageHeading({ eyebrow, title, children }) {
  return (
    <div className="page-heading">
      <p className="eyebrow">{eyebrow}</p>
      <h1>{title}</h1>
      <p className="page-description">{children}</p>
    </div>
  );
}
