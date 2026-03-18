import { describe, expect, it } from 'vitest';
import { buildProjectTaskSessionRows, buildProjectTaskSummaryRows, resolveTimeEntryDurationSeconds } from '@/lib/projectTaskReporting';
import type { Project, Task, TimeEntry, User } from '@/types';

describe('resolveTimeEntryDurationSeconds', () => {
  it('uses the live elapsed time for open entries', () => {
    expect(
      resolveTimeEntryDurationSeconds(
        {
          id: 1,
          user_id: 1,
          organization_id: 1,
          start_time: '2026-03-18T09:00:00.000Z',
          end_time: undefined,
          duration: 0,
          billable: true,
          is_manual: false,
          created_at: '',
          updated_at: '',
        },
        new Date('2026-03-18T09:15:00.000Z')
      )
    ).toBe(900);
  });
});

describe('buildProjectTaskSummaryRows', () => {
  it('groups time by employee, project, and task', () => {
    const user = {
      id: 7,
      name: 'Mavli',
      email: 'mavli@example.com',
      role: 'employee',
      organization_id: 1,
      is_active: true,
      created_at: '',
      updated_at: '',
    } satisfies User;

    const project = {
      id: 11,
      organization_id: 1,
      name: 'Website Revamp',
      color: '#00AAFF',
      status: 'active',
      created_at: '',
      updated_at: '',
    } satisfies Project;

    const task = {
      id: 19,
      project_id: 11,
      title: 'Header polish',
      status: 'in_progress',
      priority: 'high',
      created_at: '',
      updated_at: '',
    } satisfies Task;

    const entries = [
      {
        id: 101,
        user_id: 7,
        organization_id: 1,
        project_id: 11,
        task_id: 19,
        start_time: '2026-03-18T09:00:00.000Z',
        end_time: '2026-03-18T09:30:00.000Z',
        duration: 1800,
        billable: true,
        is_manual: false,
        created_at: '',
        updated_at: '',
      },
      {
        id: 102,
        user_id: 7,
        organization_id: 1,
        project_id: 11,
        task_id: 19,
        start_time: '2026-03-18T10:00:00.000Z',
        end_time: '2026-03-18T10:45:00.000Z',
        duration: 2700,
        billable: true,
        is_manual: false,
        created_at: '',
        updated_at: '',
      },
    ] satisfies TimeEntry[];

    const rows = buildProjectTaskSummaryRows(entries, {
      projectsById: new Map([[project.id, project]]),
      tasksById: new Map([[task.id, task]]),
      usersById: new Map([[user.id, user]]),
    });

    expect(rows).toEqual([
      expect.objectContaining({
        user_name: 'Mavli',
        project_name: 'Website Revamp',
        task_title: 'Header polish',
        entries_count: 2,
        tracked_seconds: 4500,
        first_start_time: '2026-03-18T09:00:00.000Z',
        last_end_time: '2026-03-18T10:45:00.000Z',
      }),
    ]);
  });
});

describe('buildProjectTaskSessionRows', () => {
  it('returns detailed session rows with exact start and end times', () => {
    const user = {
      id: 7,
      name: 'Mavli',
      email: 'mavli@example.com',
      role: 'employee',
      organization_id: 1,
      is_active: true,
      created_at: '',
      updated_at: '',
    } satisfies User;

    const project = {
      id: 11,
      organization_id: 1,
      name: 'Website Revamp',
      color: '#00AAFF',
      status: 'active',
      created_at: '',
      updated_at: '',
    } satisfies Project;

    const task = {
      id: 19,
      project_id: 11,
      title: 'Header polish',
      status: 'in_progress',
      priority: 'high',
      created_at: '',
      updated_at: '',
    } satisfies Task;

    const entries = [
      {
        id: 101,
        user_id: 7,
        organization_id: 1,
        project_id: 11,
        task_id: 19,
        start_time: '2026-03-18T09:00:00.000Z',
        end_time: '2026-03-18T09:30:00.000Z',
        duration: 1800,
        billable: true,
        is_manual: false,
        created_at: '',
        updated_at: '',
      },
    ] satisfies TimeEntry[];

    const rows = buildProjectTaskSessionRows(entries, {
      projectsById: new Map([[project.id, project]]),
      tasksById: new Map([[task.id, task]]),
      usersById: new Map([[user.id, user]]),
    });

    expect(rows).toEqual([
      expect.objectContaining({
        entry_id: 101,
        user_name: 'Mavli',
        project_name: 'Website Revamp',
        task_title: 'Header polish',
        session_start_time: '2026-03-18T09:00:00.000Z',
        session_end_time: '2026-03-18T09:30:00.000Z',
        tracked_seconds: 1800,
      }),
    ]);
  });
});
