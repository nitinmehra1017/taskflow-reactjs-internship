import { useEffect, useRef, useState } from 'react';
import PageHeading from '../components/PageHeading';
import { Alert, Badge, Button, Card, Input, Modal, Select } from '../components/ui';
import './ComponentsPage.scss';

const priorities = [
  { value: 'low', label: 'Low · room to breathe' },
  { value: 'medium', label: 'Medium · steady progress' },
  { value: 'high', label: 'High · first things first' },
  { value: 'archived', label: 'Archived · unavailable', disabled: true },
];
const variants = ['success', 'warning', 'error', 'neutral', 'information'];

export default function ComponentsPage() {
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [priority, setPriority] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [dialogName, setDialogName] = useState('My workspace');
  const [dialogError, setDialogError] = useState('');
  const [showAlert, setShowAlert] = useState(true);
  const inputRef = useRef(null);
  const dialogInputRef = useRef(null);
  const restoreRef = useRef(null);

  useEffect(() => {
    if (!loading) return undefined;
    const timer = setTimeout(() => {
      setLoading(false);
      setFeedback('Loading preview finished. No data was saved.');
    }, 1200);
    return () => clearTimeout(timer);
  }, [loading]);

  useEffect(() => {
    if (!showAlert) restoreRef.current?.focus();
  }, [showAlert]);

  function validateName(event) {
    event.preventDefault();
    if (name.trim().length < 3) {
      setError('Enter at least 3 characters for the workspace name.');
      inputRef.current.focus();
      return;
    }
    setError('');
    setFeedback(`“${name.trim()}” looks good. This is a validation preview only.`);
  }

  function confirmDialog(event) {
    event.preventDefault();
    if (dialogName.trim().length < 3) {
      setDialogError('Enter at least 3 characters.');
      dialogInputRef.current?.focus();
      return;
    }
    setDialogError('');
    setModalOpen(false);
    setFeedback(
      `Dialog confirmed for “${dialogName.trim()}”. Preview only; nothing was persisted.`,
    );
  }

  return (
    <div className="component-library">
      <div className="library-heading">
        <PageHeading
          eyebrow="THE TASKFLOW TOOLKIT"
          title="Small pieces. Better together."
        >
          A considered set of building blocks for a calmer workspace. Explore, interact,
          and make yourself at home.
        </PageHeading>
        <Badge variant="success">Week 02 · UI foundations</Badge>
      </div>
      <div className="library-intro">
        <div>
          <span className="eyebrow">CONSISTENT BY DESIGN</span>
          <h2>One language. Seven components.</h2>
          <p>
            Familiar colors, thoughtful states, and room for every screen. These live
            examples share the same reusable components.
          </p>
        </div>
        <div className="library-count">
          <strong>07</strong>
          <span>reusable building blocks</span>
        </div>
      </div>
      <nav className="library-index" aria-label="Component sections">
        {['Buttons', 'Inputs', 'Modal', 'Cards', 'Badges', 'Selects', 'Alerts'].map(
          (label) => (
            <a key={label} href={`#${label.toLowerCase()}`}>
              {label}
            </a>
          ),
        )}
      </nav>
      <div className="library-feedback" aria-label="Demo feedback">
        {feedback ? (
          <Alert title="Preview feedback" variant="information" announce>
            {feedback}
          </Alert>
        ) : (
          <p>
            Try a component below. Any feedback will appear here. Examples reset when you
            leave this page.
          </p>
        )}
      </div>
      <div className="library-grid">
        <section id="buttons" className="library-section" aria-labelledby="buttons-title">
          <div className="library-section-heading">
            <span>01</span>
            <div>
              <h2 id="buttons-title">Buttons</h2>
              <p>Clear actions, from the everyday to the important.</p>
            </div>
          </div>
          <Card>
            <div className="demo-row">
              {['primary', 'secondary', 'outline', 'danger'].map((variant) => (
                <Button
                  key={variant}
                  variant={variant}
                  onClick={() =>
                    setFeedback(
                      `${variant[0].toUpperCase() + variant.slice(1)} button activated. No destructive action is performed.`,
                    )
                  }
                >
                  {variant[0].toUpperCase() + variant.slice(1)}
                </Button>
              ))}
            </div>
            <p className="demo-label">A SIZE FOR EVERY MOMENT</p>
            <div className="demo-row">
              <Button size="sm" onClick={() => setFeedback('Small button activated.')}>
                Small
              </Button>
              <Button onClick={() => setFeedback('Medium button activated.')}>
                Medium
              </Button>
              <Button size="lg" onClick={() => setFeedback('Large button activated.')}>
                Large
              </Button>
            </div>
            <p className="demo-label">STATES THAT COMMUNICATE</p>
            <div className="demo-row">
              <Button disabled>Disabled</Button>
              <Button
                variant="outline"
                loading={loading}
                loadingText="Previewing…"
                onClick={() => {
                  setLoading(true);
                  setFeedback('Loading preview started.');
                }}
              >
                Try loading state
              </Button>
              <Button loading loadingText="Loading example" />
            </div>
          </Card>
        </section>
        <section id="inputs" className="library-section" aria-labelledby="inputs-title">
          <div className="library-section-heading">
            <span>02</span>
            <div>
              <h2 id="inputs-title">Inputs</h2>
              <p>A little guidance makes every field feel easier.</p>
            </div>
          </div>
          <Card>
            <form noValidate onSubmit={validateName} className="demo-form">
              <Input
                ref={inputRef}
                label="Workspace name"
                name="workspaceName"
                placeholder="e.g. Monday momentum"
                helperText="Required. Use 3–40 characters; this example does not save data."
                required
                maxLength={40}
                value={name}
                onChange={(event) => setName(event.target.value)}
                error={error}
              />
              <Button type="submit" variant="secondary">
                Validate name
              </Button>
            </form>
            <div className="demo-field-separated">
              <Input
                label="Workspace identifier"
                defaultValue="TF-DEMO-002"
                disabled
                helperText="A disabled field cannot be changed."
              />
            </div>
          </Card>
        </section>
        <section id="modal" className="library-section" aria-labelledby="modal-title">
          <div className="library-section-heading">
            <span>03</span>
            <div>
              <h2 id="modal-title">Modal</h2>
              <p>Give a focused decision its own space.</p>
            </div>
          </div>
          <Card
            title="A moment of focus"
            description="Keyboard focus stays in the dialog until you close it. Escape brings you right back."
          >
            <div className="modal-preview-art" aria-hidden="true">
              <span />
              <span />
              <span />
            </div>
            <Button
              onClick={() => {
                setDialogError('');
                setModalOpen(true);
              }}
            >
              Open dialog
            </Button>
          </Card>
        </section>
        <section id="cards" className="library-section" aria-labelledby="cards-title">
          <div className="library-section-heading">
            <span>04</span>
            <div>
              <h2 id="cards-title">Cards</h2>
              <p>A flexible home for related ideas and actions.</p>
            </div>
          </div>
          <div className="demo-card-stack">
            <Card
              title="Your next good idea"
              description="Title, supporting copy, and flexible content."
              actions={
                <Badge variant="success" size="sm">
                  Ready
                </Badge>
              }
              footer={
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setFeedback('Card footer action activated.')}
                >
                  Explore card action
                </Button>
              }
            >
              <p>A shared surface keeps content organized without getting in the way.</p>
            </Card>
            <Card>
              <p>A simpler card. Just the content you need.</p>
            </Card>
          </div>
        </section>
        <section id="badges" className="library-section" aria-labelledby="badges-title">
          <div className="library-section-heading">
            <span>05</span>
            <div>
              <h2 id="badges-title">Badges</h2>
              <p>Useful context, at a glance.</p>
            </div>
          </div>
          <Card>
            <p className="demo-label">MEDIUM</p>
            <div className="demo-row">
              {variants.map((variant) => (
                <Badge key={variant} variant={variant}>
                  {variant[0].toUpperCase() + variant.slice(1)}
                </Badge>
              ))}
            </div>
            <p className="demo-label">SMALL</p>
            <div className="demo-row">
              {variants.map((variant) => (
                <Badge key={variant} variant={variant} size="sm">
                  {variant[0].toUpperCase() + variant.slice(1)}
                </Badge>
              ))}
            </div>
            <p className="demo-note">
              Meaning is always written out. Color is a supporting cue.
            </p>
          </Card>
        </section>
        <section id="selects" className="library-section" aria-labelledby="selects-title">
          <div className="library-section-heading">
            <span>06</span>
            <div>
              <h2 id="selects-title">Selects</h2>
              <p>Familiar choices. Native keyboard support.</p>
            </div>
          </div>
          <Card>
            <Select
              label="Preview priority"
              options={priorities}
              placeholder="Choose a priority"
              value={priority}
              onChange={(event) => setPriority(event.target.value)}
              helperText="Use the native menu or keyboard to choose."
            />
            <p className="selection-feedback" role="status">
              {priority
                ? `Selected: ${priority}. This preview does not change any tasks.`
                : 'No priority selected yet.'}
            </p>
            <Select
              label="Unavailable selection"
              options={priorities}
              placeholder="Not available in this preview"
              value=""
              disabled
            />
          </Card>
        </section>
        <section
          id="alerts"
          className="library-section library-section--wide"
          aria-labelledby="alerts-title"
        >
          <div className="library-section-heading">
            <span>07</span>
            <div>
              <h2 id="alerts-title">Alerts</h2>
              <p>Keep people informed, with the right amount of attention.</p>
            </div>
          </div>
          <Card>
            <div className="demo-alert-grid">
              {showAlert && (
                <Alert
                  title="All set"
                  variant="success"
                  dismissLabel="Dismiss success example"
                  onDismiss={() => setShowAlert(false)}
                >
                  Your workspace is ready for a fresh start. This example can be
                  dismissed.
                </Alert>
              )}
              <Alert title="Something needs a second look" variant="error">
                An example error message, with a clear path to try again.
              </Alert>
              <Alert title="A gentle heads-up" variant="warning">
                Review your changes before moving to the next step.
              </Alert>
              <Alert title="Good to know" variant="information">
                These static examples do not announce on page load.
              </Alert>
            </div>
            <div className="demo-restore">
              <Button
                ref={restoreRef}
                variant="outline"
                size="sm"
                disabled={showAlert}
                onClick={() => setShowAlert(true)}
              >
                Restore success example
              </Button>
            </div>
          </Card>
        </section>
      </div>
      <p className="library-endnote">
        Built for TaskFlow · JavaScript + JSX · SCSS · Native controls · No component
        framework
      </p>
      <Modal
        open={modalOpen}
        title="Make this space your own"
        description="A focused dialog preview. Tab stays inside, and Escape closes it."
        onClose={() => setModalOpen(false)}
        footer={
          <>
            <Button variant="outline" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" form="workspace-preview-form">
              Use this label
            </Button>
          </>
        }
      >
        <form id="workspace-preview-form" noValidate onSubmit={confirmDialog}>
          <Input
            label="Dialog workspace label"
            ref={dialogInputRef}
            required
            maxLength={40}
            value={dialogName}
            onChange={(event) => setDialogName(event.target.value)}
            error={dialogError}
            helperText="A demonstration only. No workspace settings will be saved."
          />
        </form>
      </Modal>
    </div>
  );
}
