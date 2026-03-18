import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import Tasks from '@/pages/Tasks';
import { renderWithProviders } from '@/test/renderWithProviders';

const mocks = vi.hoisted(() => ({
  getAllTasks: vi.fn(),
  createTask: vi.fn(),
  updateTask: vi.fn(),
  deleteTask: vi.fn(),
  updateTaskStatus: vi.fn(),
  getAllProjects: vi.fn(),
  createProject: vi.fn(),
  getAllUsers: vi.fn(),
}));

vi.mock('@/services/api', async () => {
  const actual = await vi.importActual<typeof import('@/services/api')>('@/services/api');
  return {
    ...actual,
    taskApi: {
      getAll: mocks.getAllTasks,
      create: mocks.createTask,
      update: mocks.updateTask,
      delete: mocks.deleteTask,
      updateStatus: mocks.updateTaskStatus,
    },
    projectApi: {
      getAll: mocks.getAllProjects,
      create: mocks.createProject,
    },
    userApi: {
      getAll: mocks.getAllUsers,
    },
  };
});

describe('Tasks page', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mocks.getAllTasks.mockResolvedValue({
      data: [
        {
          id: 1,
          project_id: 7,
          assignee_id: 3,
          assignee_ids: [3],
          title: 'Build KPI overview',
          description: 'Create the first draft of the KPI overview cards.',
          status: 'todo',
          priority: 'high',
          due_date: '2026-03-20',
          estimated_time: 90,
          created_at: '2026-03-15T08:00:00Z',
          updated_at: '2026-03-15T10:00:00Z',
          project: { id: 7, name: 'Core Platform', color: '#3B82F6', status: 'active' },
          assignee: { id: 3, name: 'Alex Johnson', email: 'alex@example.com', role: 'employee' },
          assignees: [{ id: 3, name: 'Alex Johnson', email: 'alex@example.com', role: 'employee' }],
        },
        {
          id: 2,
          project_id: 8,
          assignee_id: null,
          assignee_ids: [],
          title: 'Prepare onboarding docs',
          description: 'Write the setup notes for new hires.',
          status: 'done',
          priority: 'medium',
          due_date: '2026-03-18',
          estimated_time: 60,
          created_at: '2026-03-12T09:00:00Z',
          updated_at: '2026-03-13T09:00:00Z',
          project: { id: 8, name: 'Implementation', color: '#10B981', status: 'active' },
          assignee: null,
        },
      ],
    });

    mocks.getAllProjects.mockResolvedValue({
      data: [
        { id: 7, name: 'Core Platform', color: '#3B82F6', status: 'active' },
        { id: 8, name: 'Implementation', color: '#10B981', status: 'active' },
      ],
    });

    mocks.getAllUsers.mockResolvedValue({
      data: [
        {
          id: 3,
          name: 'Alex Johnson',
          email: 'alex@example.com',
          role: 'employee',
          organization_id: 1,
          is_active: true,
          created_at: '',
          updated_at: '',
        },
        {
          id: 4,
          name: 'Priya Shah',
          email: 'priya@example.com',
          role: 'employee',
          organization_id: 1,
          is_active: true,
          created_at: '',
          updated_at: '',
        },
      ],
    });
  });

  it('shows the quick project action and lets project chips filter the board', async () => {
    const user = userEvent.setup();

    renderWithProviders(<Tasks />);

    expect(await screen.findByRole('button', { name: /new project/i })).toBeInTheDocument();
    expect(screen.getByText('Build KPI overview')).toBeInTheDocument();
    expect(screen.getByText('Prepare onboarding docs')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /core platform/i }));

    expect(screen.getByText('Build KPI overview')).toBeInTheDocument();
    expect(screen.queryByText('Prepare onboarding docs')).not.toBeInTheDocument();
  });

  it('submits multiple assignees from the task composer', async () => {
    const user = userEvent.setup();
    mocks.createTask.mockResolvedValue({ data: { id: 3 } });

    renderWithProviders(<Tasks />);

    await user.click(await screen.findByRole('button', { name: /new task/i }));
    await user.type(screen.getByPlaceholderText(/prepare weekly performance review/i), 'Coordinate rollout');
    const projectSelects = screen.getAllByRole('combobox').filter((element) => {
      return element.querySelector('option[value="7"]') !== null;
    });
    expect(projectSelects.length).toBeGreaterThan(0);
    await user.selectOptions(projectSelects[projectSelects.length - 1], '7');

    await user.click(screen.getByRole('button', { name: /unassigned/i }));
    await user.click(screen.getByLabelText(/alex johnson/i));
    await user.click(screen.getByLabelText(/priya shah/i));
    await user.click(screen.getByRole('button', { name: /^done$/i }));
    await user.click(screen.getByRole('button', { name: /create task/i }));

    expect(mocks.createTask).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Coordinate rollout',
        project_id: 7,
        assignee_ids: [3, 4],
      })
    );
  });
});
