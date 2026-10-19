import { useRef, useState } from 'react';
import { Input, Select, Button, Alert } from '../ui';
import {
  priorities,
  statuses,
  statusLabel,
  validateTask,
} from '../../utils/taskValidation';
export const emptyTask = {
  title: '',
  description: '',
  priority: 'medium',
  status: 'pending',
  dueDate: '',
};
export default function TaskForm({ task = emptyTask, onSave, onCancel }) {
  const [values, setValues] = useState(() => ({ ...task }));
  const [errors, setErrors] = useState({});
  const formRef = useRef(null);
  const field = (name) => ({
    value: values[name],
    onChange: (event) =>
      setValues((previous) => ({ ...previous, [name]: event.target.value })),
    error: errors[name],
    name,
  });
  function submit(event) {
    event.preventDefault();
    const nextErrors = validateTask(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) {
      formRef.current.elements.namedItem(Object.keys(nextErrors)[0])?.focus();
      return;
    }
    onSave(values);
  }
  return (
    <form ref={formRef} onSubmit={submit} noValidate className="task-form">
      {Object.keys(errors).length > 0 && (
        <Alert variant="error" announce title="Check the highlighted fields">
          Your task has not been saved.
        </Alert>
      )}
      <Input label="Task title" required maxLength={120} {...field('title')} />
      <Input
        label="Description"
        multiline
        rows={3}
        maxLength={2000}
        {...field('description')}
      />
      <div className="task-form__row">
        <Select
          label="Priority"
          options={priorities.map((value) => ({
            value,
            label: value[0].toUpperCase() + value.slice(1),
          }))}
          {...field('priority')}
        />
        <Select
          label="Status"
          options={statuses.map((value) => ({ value, label: statusLabel(value) }))}
          {...field('status')}
        />
      </div>
      <Input
        label="Due date"
        type="date"
        {...field('dueDate')}
        onInput={(event) =>
          setValues((previous) => ({ ...previous, dueDate: event.target.value }))
        }
      />
      <div className="task-actions">
        <Button type="submit">Save task</Button>
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
