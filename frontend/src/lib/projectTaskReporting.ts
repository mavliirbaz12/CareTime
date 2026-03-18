import type { Project, Task, TimeEntry, User } from '@/types';

export interface ProjectTaskSummaryRow {
  key: string;
  user_id: number | null;
  user_name: string;
  user_email: string;
  project_id: number | null;
  project_name: string;
  project_status: string;
  task_id: number | null;
  task_title: string;
  task_status: string;
  entries_count: number;
  tracked_seconds: number;
  first_start_time: string | null;
  last_end_time: string | null;
}

export interface ProjectTaskSessionRow {
  key: string;
  entry_id: number;
  user_id: number | null;
  user_name: string;
  user_email: string;
  project_id: number | null;
  project_name: string;
  project_status: string;
  task_id: number | null;
  task_title: string;
  task_status: string;
  session_start_time: string | null;
  session_end_time: string | null;
  tracked_seconds: number;
}

type LookupMap<T> = Map<number, T>;

const toPositiveInt = (value: unknown): number | null => {
  const normalized = Number(value);
  return Number.isFinite(normalized) && normalized > 0 ? normalized : null;
};

export const resolveTimeEntryDurationSeconds = (
  entry: Pick<TimeEntry, 'duration' | 'start_time' | 'end_time'>,
  now: Date = new Date()
) => {
  const storedDuration = Math.max(0, Math.floor(Number(entry.duration || 0)));
  const startTimestamp = Date.parse(String(entry.start_time || ''));
  if (!Number.isFinite(startTimestamp)) {
    return storedDuration;
  }

  const endTimestamp = entry.end_time ? Date.parse(String(entry.end_time)) : now.getTime();
  if (!Number.isFinite(endTimestamp) || endTimestamp <= startTimestamp) {
    return storedDuration;
  }

  return Math.max(storedDuration, Math.floor((endTimestamp - startTimestamp) / 1000));
};

const resolveStartTimestamp = (entry: Pick<TimeEntry, 'start_time'>) => {
  const startTimestamp = Date.parse(String(entry.start_time || ''));
  return Number.isFinite(startTimestamp) ? startTimestamp : null;
};

const resolveEndTimestamp = (
  entry: Pick<TimeEntry, 'start_time' | 'end_time'>,
  now: Date = new Date()
) => {
  const startTimestamp = resolveStartTimestamp(entry);
  if (!startTimestamp) {
    return null;
  }

  if (!entry.end_time) {
    return now.getTime();
  }

  const endTimestamp = Date.parse(String(entry.end_time));
  if (!Number.isFinite(endTimestamp) || endTimestamp <= startTimestamp) {
    return null;
  }

  return endTimestamp;
};

export const buildProjectTaskSessionRows = (
  entries: TimeEntry[],
  options: {
    projectsById: LookupMap<Project>;
    tasksById: LookupMap<Task>;
    usersById: LookupMap<User>;
    now?: Date;
  }
) => {
  const now = options.now ?? new Date();

  return entries
    .map((entry) => {
      const userId = toPositiveInt(entry.user_id);
      const projectId = toPositiveInt(entry.project_id);
      const taskId = toPositiveInt(entry.task_id);

      const user = (userId ? options.usersById.get(userId) : undefined) ?? entry.user;
      const project = (projectId ? options.projectsById.get(projectId) : undefined) ?? entry.project;
      const task = (taskId ? options.tasksById.get(taskId) : undefined) ?? entry.task;
      const startTimestamp = resolveStartTimestamp(entry);
      const endTimestamp = resolveEndTimestamp(entry, now);

      return {
        key: String(entry.id),
        entry_id: entry.id,
        user_id: userId,
        user_name: user?.name || 'Unknown employee',
        user_email: user?.email || '',
        project_id: projectId,
        project_name: project?.name || 'No project',
        project_status: project?.status || '',
        task_id: taskId,
        task_title: task?.title || 'No task',
        task_status: task?.status || '',
        session_start_time: startTimestamp ? new Date(startTimestamp).toISOString() : null,
        session_end_time: endTimestamp ? new Date(endTimestamp).toISOString() : null,
        tracked_seconds: resolveTimeEntryDurationSeconds(entry, now),
      } satisfies ProjectTaskSessionRow;
    })
    .sort((left, right) => {
      const byUser = left.user_name.localeCompare(right.user_name);
      if (byUser !== 0) return byUser;

      const leftStart = left.session_start_time ? Date.parse(left.session_start_time) : 0;
      const rightStart = right.session_start_time ? Date.parse(right.session_start_time) : 0;
      if (leftStart !== rightStart) return leftStart - rightStart;

      return left.entry_id - right.entry_id;
    });
};

export const buildProjectTaskSummaryRows = (
  entries: TimeEntry[],
  options: {
    projectsById: LookupMap<Project>;
    tasksById: LookupMap<Task>;
    usersById: LookupMap<User>;
    now?: Date;
  }
) => {
  const buckets = new Map<string, ProjectTaskSummaryRow>();
  const now = options.now ?? new Date();

  entries.forEach((entry) => {
    const userId = toPositiveInt(entry.user_id);
    const projectId = toPositiveInt(entry.project_id);
    const taskId = toPositiveInt(entry.task_id);

    const user = (userId ? options.usersById.get(userId) : undefined) ?? entry.user;
    const project = (projectId ? options.projectsById.get(projectId) : undefined) ?? entry.project;
    const task = (taskId ? options.tasksById.get(taskId) : undefined) ?? entry.task;

    const bucketKey = `${userId ?? 'unknown'}:${projectId ?? 'none'}:${taskId ?? 'none'}`;
    const trackedSeconds = resolveTimeEntryDurationSeconds(entry, now);
    const startTimestamp = resolveStartTimestamp(entry);
    const endTimestamp = resolveEndTimestamp(entry, now);
    const existing = buckets.get(bucketKey);

    if (existing) {
      existing.entries_count += 1;
      existing.tracked_seconds += trackedSeconds;
      if (startTimestamp && (!existing.first_start_time || startTimestamp < Date.parse(existing.first_start_time))) {
        existing.first_start_time = new Date(startTimestamp).toISOString();
      }
      if (endTimestamp && (!existing.last_end_time || endTimestamp > Date.parse(existing.last_end_time))) {
        existing.last_end_time = new Date(endTimestamp).toISOString();
      }
      return;
    }

    buckets.set(bucketKey, {
      key: bucketKey,
      user_id: userId,
      user_name: user?.name || 'Unknown employee',
      user_email: user?.email || '',
      project_id: projectId,
      project_name: project?.name || 'No project',
      project_status: project?.status || '',
      task_id: taskId,
      task_title: task?.title || 'No task',
      task_status: task?.status || '',
      entries_count: 1,
      tracked_seconds: trackedSeconds,
      first_start_time: startTimestamp ? new Date(startTimestamp).toISOString() : null,
      last_end_time: endTimestamp ? new Date(endTimestamp).toISOString() : null,
    });
  });

  return Array.from(buckets.values()).sort((left, right) => {
    const byUser = left.user_name.localeCompare(right.user_name);
    if (byUser !== 0) return byUser;

    const byProject = left.project_name.localeCompare(right.project_name);
    if (byProject !== 0) return byProject;

    const byTask = left.task_title.localeCompare(right.task_title);
    if (byTask !== 0) return byTask;

    return left.key.localeCompare(right.key);
  });
};
