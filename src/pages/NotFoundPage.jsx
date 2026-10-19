import { Link } from 'react-router-dom';
import PageHeading from '../components/PageHeading';

export default function NotFoundPage() {
  return (
    <>
      <PageHeading eyebrow="404 · PAGE NOT FOUND" title="Let’s get back in flow.">
        This page doesn’t exist in your workspace.
      </PageHeading>
      <Link to="/" className="button button-dark">
        Back to overview
      </Link>
    </>
  );
}
