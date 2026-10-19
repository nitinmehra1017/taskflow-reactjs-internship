import Icon from './Icon';

/** label and detail describe the value; icon is an Icon name. */
export default function StatCard({ label, value, detail, icon }) {
  return (
    <article className="stat-card">
      <div className="stat-top">
        <p>{label}</p>
        <span className="stat-icon">
          <Icon name={icon} size={19} />
        </span>
      </div>
      <strong className="stat-value">{value}</strong>
      <p className="stat-detail">{detail}</p>
    </article>
  );
}
