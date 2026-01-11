import { prisma } from '../../shared/db/prisma';
import { NotFoundError, PermissionError } from '../../shared/errors';
import { AuthenticatedUser } from '../../shared/auth/auth-provider';
import { TaskStatus, UserRole } from '@prisma/client';

export interface CreateTaskInput {
  submissionId?: string;
  stationId: string;
  obligationId?: string;
  title: string;
  description?: string;
  dueDate?: Date;
  assignedToId?: string;
}

export interface UpdateTaskInput {
  title?: string;
  description?: string;
  status?: TaskStatus;
  dueDate?: Date;
  assignedToId?: string;
}

export interface CreateTaskMessageInput {
  content: string;
}

export class TasksService {
  async getTaskById(id: string, actor: AuthenticatedUser) {
    const task = await prisma.task.findUnique({
      where: { id },
      include: {
        submission: true,
        station: { include: { company: true } },
        obligation: true,
        createdBy: true,
        assignedTo: true,
        messages: {
          include: { user: true },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!task) {
      throw new NotFoundError('Task', id);
    }

    // Check tenant access
    const station = await prisma.station.findUnique({
      where: { id: task.stationId },
      include: { company: true },
    });

    if (!station) {
      throw new NotFoundError('Station', task.stationId);
    }

    if (actor.companyId !== station.companyId && !this.isCustomsUser(actor)) {
      throw new PermissionError('Permission denied');
    }

    return task;
  }

  async getAllTasks(actor: AuthenticatedUser) {
    if (actor.companyId) {
      // Company users see tasks for their stations
      return prisma.task.findMany({
        where: {
          station: {
            companyId: actor.companyId,
          },
        },
        include: {
          submission: true,
          station: { include: { company: true } },
          obligation: true,
          createdBy: true,
          assignedTo: true,
        },
        orderBy: { createdAt: 'desc' },
      });
    }

    // Customs users see all tasks
    return prisma.task.findMany({
      include: {
        submission: true,
        station: { include: { company: true } },
        obligation: true,
        createdBy: true,
        assignedTo: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getTasksBySubmission(submissionId: string, actor: AuthenticatedUser) {
    const submission = await prisma.submission.findUnique({
      where: { id: submissionId },
      include: { company: true },
    });

    if (!submission) {
      throw new NotFoundError('Submission', submissionId);
    }

    // Check tenant access
    if (actor.companyId !== submission.companyId && !this.isCustomsUser(actor)) {
      throw new PermissionError('Permission denied');
    }

    return prisma.task.findMany({
      where: { submissionId },
      include: {
        station: { include: { company: true } },
        obligation: true,
        createdBy: true,
        assignedTo: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createTask(input: CreateTaskInput, actor: AuthenticatedUser) {
    // Only customs users can create tasks
    if (!this.isCustomsUser(actor)) {
      throw new PermissionError('Only customs users can create tasks');
    }

    // Verify station exists and check access
    const station = await prisma.station.findUnique({
      where: { id: input.stationId },
      include: { company: true },
    });

    if (!station) {
      throw new NotFoundError('Station', input.stationId);
    }

    // Verify submission if provided
    if (input.submissionId) {
      const submission = await prisma.submission.findUnique({
        where: { id: input.submissionId },
      });

      if (!submission) {
        throw new NotFoundError('Submission', input.submissionId);
      }
    }

    // Verify obligation if provided
    if (input.obligationId) {
      const obligation = await prisma.obligation.findUnique({
        where: { id: input.obligationId },
      });

      if (!obligation) {
        throw new NotFoundError('Obligation', input.obligationId);
      }
    }

    // Verify assigned user if provided
    if (input.assignedToId) {
      const assignedUser = await prisma.user.findUnique({
        where: { id: input.assignedToId },
      });

      if (!assignedUser) {
        throw new NotFoundError('User', input.assignedToId);
      }
    }

    return prisma.task.create({
      data: {
        submissionId: input.submissionId,
        stationId: input.stationId,
        obligationId: input.obligationId,
        title: input.title,
        description: input.description,
        dueDate: input.dueDate,
        createdById: actor.id,
        assignedToId: input.assignedToId,
      },
      include: {
        submission: true,
        station: { include: { company: true } },
        obligation: true,
        createdBy: true,
        assignedTo: true,
      },
    });
  }

  async updateTask(id: string, input: UpdateTaskInput, actor: AuthenticatedUser) {
    const task = await this.getTaskById(id, actor);

    // Company users can only update tasks assigned to them
    if (!this.isCustomsUser(actor)) {
      if (task.assignedToId !== actor.id) {
        throw new PermissionError('Permission denied');
      }
    }

    return prisma.task.update({
      where: { id },
      data: input,
      include: {
        submission: true,
        station: { include: { company: true } },
        obligation: true,
        createdBy: true,
        assignedTo: true,
        messages: {
          include: { user: true },
          orderBy: { createdAt: 'asc' },
        },
      },
    });
  }

  async addTaskMessage(taskId: string, input: CreateTaskMessageInput, actor: AuthenticatedUser) {
    const task = await this.getTaskById(taskId, actor);

    // Verify user has access (either assigned to task or customs user)
    if (!this.isCustomsUser(actor) && task.assignedToId !== actor.id) {
      throw new PermissionError('Permission denied');
    }

    return prisma.taskMessage.create({
      data: {
        taskId,
        userId: actor.id,
        content: input.content,
      },
      include: {
        user: true,
      },
    });
  }

  async getTaskMessages(taskId: string, actor: AuthenticatedUser) {
    const task = await this.getTaskById(taskId, actor);

    return prisma.taskMessage.findMany({
      where: { taskId },
      include: { user: true },
      orderBy: { createdAt: 'asc' },
    });
  }

  private isCustomsUser(actor: AuthenticatedUser): boolean {
    return [
      UserRole.CUSTOMS_REVIEWER,
      UserRole.CUSTOMS_SUPERVISOR,
      UserRole.CUSTOMS_DIRECTOR,
      UserRole.SYSTEM_ADMIN,
    ].includes(actor.role);
  }
}

