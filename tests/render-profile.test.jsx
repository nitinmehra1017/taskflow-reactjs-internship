import { screen, waitFor } from '@testing-library/react';
import { writeFileSync } from 'node:fs';
import { renderApp } from './helpers/renderApp';
import { mockRemoteFetch } from './helpers/fixtures';
const mockCommits = [];
jest.mock('../src/components/ui', () => {
  const actual = jest.requireActual('../src/components/ui');
  const { Profiler } = jest.requireActual('react');
  return {
    ...actual,
    Card: function ProfiledCard(props) {
      return (
        <Profiler
          id={props.title || 'card'}
          onRender={(id, phase, actualDuration, baseDuration) =>
            mockCommits.push({ id, phase, actualDuration, baseDuration })
          }
        >
          <actual.Card {...props} />
        </Profiler>
      );
    },
  };
});
test('profile visible remote card commits when importing one of eight records', async () => {
  const todos = Array.from({ length: 8 }, (_, index) => ({
    id: index + 1,
    userId: 1,
    title: `Profile record ${index + 1}`,
    completed: false,
  }));
  global.fetch = mockRemoteFetch(todos);
  const { user } = await renderApp('/explore');
  await screen.findByRole('button', { name: 'Import remote task 8', exact: true });
  mockCommits.length = 0;
  await user.click(
    screen.getByRole('button', { name: 'Import remote task 1', exact: true }),
  );
  await waitFor(() =>
    expect(
      screen.getByRole('button', { name: 'Imported remote task 1', exact: true }),
    ).toBeDisabled(),
  );
  const cardCommits = mockCommits.filter((row) => row.id.startsWith('Profile record'));
  expect(cardCommits).toHaveLength(1);
  expect(cardCommits[0].id).toBe('Profile record 1');
  if (process.env.PROFILE_OUTPUT)
    writeFileSync(
      process.env.PROFILE_OUTPUT,
      JSON.stringify(
        {
          environment:
            'React development profiling build in Jest/jsdom; deterministic eight-record fixture; single import',
          cardCommits,
          count: cardCommits.length,
        },
        null,
        2,
      ) + '\n',
    );
});
