export default function RemoteTaskSkeleton() {
  return (
    <div className="remote-skeleton" aria-hidden="true">
      {[1, 2, 3, 4].map((id) => (
        <div className="panel" key={id}>
          <span />
          <span />
          <span />
        </div>
      ))}
    </div>
  );
}
