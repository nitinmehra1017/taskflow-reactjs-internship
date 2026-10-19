import { useCallback, useRef, useState } from 'react';
import PageHeading from '../components/PageHeading';
import { Alert, Button, Modal } from '../components/ui';
import TaskForm from '../components/tasks/TaskForm';
import TaskList from '../components/tasks/TaskList';
import TaskFilters from '../components/tasks/TaskFilters';
import { useTasks } from '../hooks/useTasks';
import { useTaskFilters } from '../hooks/useTaskFilters';
import '../styles/tasks.css';
export default function TasksPage() {
  const { tasks, addTask, updateTask, deleteTask, toggleTaskStatus, storageError } =
    useTasks();
  const filtering = useTaskFilters(tasks);
  const [dialog, setDialog] = useState(null);
  const [message, setMessage] = useState('');
  const createRef = useRef(null);
  const cancelRef = useRef(null);
  const resultsRef = useRef(null);
  const editTriggerRef = useRef(null);
  const selected = tasks.find((task) => task.id === dialog?.id);
  const close = () => setDialog(null);
  const edit = useCallback((id) => {
    editTriggerRef.current = document.activeElement;
    setDialog({ mode: 'edit', id });
  }, []);
  const requestDelete = useCallback((id) => setDialog({ mode: 'delete', id }), []);
  const toggle = useCallback(
    (id) => {
      const trigger = document.activeElement;
      toggleTaskStatus(id);
      requestAnimationFrame(() => {
        if (!trigger?.isConnected) resultsRef.current?.focus();
      });
      setMessage('Task status updated.');
    },
    [toggleTaskStatus],
  );
  function save(values) {
    if (selected) updateTask(selected.id, values);
    else addTask(values);
    setMessage(selected ? 'Task updated.' : 'Task created.');
    close();
    if (selected)
      requestAnimationFrame(() => {
        if (!editTriggerRef.current?.isConnected) resultsRef.current?.focus();
      });
  }
  return (
    <>
      <div className="heading-row">
        <PageHeading eyebrow="SMALL STEPS, STEADY PROGRESS" title="Your task space.">
          Capture a thought. Choose your focus. Keep moving forward.
        </PageHeading>
        <Button ref={createRef} onClick={() => setDialog({ mode: 'create' })}>
          New task
        </Button>
      </div>
      {storageError && (
        <Alert variant="warning" title="Device storage unavailable">
          {storageError}
        </Alert>
      )}
      <p role="status" className="task-feedback">
        {message}
      </p>
      <TaskFilters {...filtering} />
      <div className="task-results">
        <h2 ref={resultsRef} tabIndex={-1}>
          My tasks
        </h2>
        <p role="status">
          {filtering.filteredTasks.length} of {tasks.length} tasks
        </p>
      </div>
      <TaskList
        tasks={filtering.filteredTasks}
        hasTasks={tasks.length > 0}
        onEdit={edit}
        onDelete={requestDelete}
        onToggle={toggle}
      />
      <Modal
        open={dialog?.mode === 'create' || dialog?.mode === 'edit'}
        title={selected ? 'Edit task' : 'Create task'}
        description="Make space for what matters. You can change these details later."
        onClose={close}
      >
        <TaskForm
          key={selected?.id || 'new'}
          task={selected}
          onSave={save}
          onCancel={close}
        />
      </Modal>
      <Modal
        open={dialog?.mode === 'delete'}
        title="Delete task?"
        description={`Delete “${selected?.title || ''}”? This cannot be undone.`}
        initialFocusRef={cancelRef}
        onClose={close}
        footer={
          <>
            <Button ref={cancelRef} variant="outline" onClick={close}>
              Keep task
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                deleteTask(selected.id);
                close();
                setMessage('Task deleted.');
                requestAnimationFrame(() => createRef.current?.focus());
              }}
            >
              Delete permanently
            </Button>
          </>
        }
      />
    </>
  );
}
