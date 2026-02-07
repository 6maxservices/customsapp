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
  constructor() {
    console.log('TasksService V2 Loaded - Relations Fixed');
  }

  async getTaskById(id: string, actor: AuthenticatedUser) {
    const task = await prisma.task.findUnique({
      where: { id },
      include: {
        originSubmission: true,
        resolutionSubmission: true,
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
          originSubmission: true,
          resolutionSubmission: true,
          station: { include: { company: true } },
          obligation: true,
          createdBy: true,
          assignedTo: true,
        },
        orderBy: { createdAt: 'desc' },
      });
    }

    if (actor.stationId) {
      // Station users see tasks for their specific station
      return prisma.task.findMany({
        where: {
          stationId: actor.stationId
        },
        include: {
          originSubmission: true,
          resolutionSubmission: true,
          station: { include: { company: true } },
          obligation: true,
          createdBy: true,
          assignedTo: true,
        },
        orderBy: { createdAt: 'desc' },
      })
    }

    // Customs users see all tasks
    return prisma.task.findMany({
      include: {
        originSubmission: true,
        resolutionSubmission: true,
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
      include: {
        station: { include: { company: true } },
      }
    });

    if (!submission) {
      throw new NotFoundError('Submission', submissionId);
    }

    // Check permissions
    if (actor.stationId) {
      if (submission.stationId !== actor.stationId) {
        throw new PermissionError('Permission denied');
      }
    } else if (actor.companyId) {
      if (submission.companyId !== actor.companyId) {
        throw new PermissionError('Permission denied');
      }
    }

    return prisma.task.findMany({
      where: {
        OR: [
          { originSubmissionId: submissionId },
          { resolutionSubmissionId: submissionId }
        ]
      },
      include: {
        originSubmission: true,
        resolutionSubmission: true,
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

    const station = await prisma.station.findUnique({
      where: { id: input.stationId },
      include: { company: true }
    });

    if (!station) {
      throw new NotFoundError('Station', input.stationId);
    }

    const task = await prisma.task.create({
      data: {
        title: input.title,
        description: input.description,
        status: TaskStatus.AWAITING_COMPANY,
        stationId: station.id,
        obligationId: input.obligationId,
        originSubmissionId: input.submissionId,
        createdById: actor.id,
        assignedToId: input.assignedToId,
        dueDate: input.dueDate,
        fineAmount: input.fineAmount,
      },
      include: {
        originSubmission: true,
        resolutionSubmission: true,
        station: { include: { company: true } },
        obligation: true,
        createdBy: true,
        assignedTo: true,
      },
    });

    return task;
  }

  async updateTask(id: string, input: UpdateTaskInput, actor: AuthenticatedUser) {
    const task = await this.getTaskById(id, actor);
    const isCustoms = this.isCustomsUser(actor);

    // Determine company context
    const isCompany = actor.companyId && !actor.stationId && task.station.companyId === actor.companyId;
    const isStation = actor.stationId && task.stationId === actor.stationId;
    const isAssigned = task.assignedToId === actor.id;

    // RBAC: Customs: Create and Resolve. Company: Delegate and Reply. Station: Reply to assigned.

    // 1. Resolve/Close: Only Customs
    if (input.status === TaskStatus.CLOSED) {
      if (!isCustoms) {
        throw new PermissionError('Only customs users can resolve/close tickets');
      }
    }

    // 2. Delegate: Only Customs or Company
    if (input.assignedToId !== undefined && input.assignedToId !== task.assignedToId) {
      if (!isCustoms && !isCompany) {
        throw new PermissionError('Only customs or company users can delegate tasks');
      }
    }

    // 3. General Access: Must be Customs, Company (of this station), Station (owner), or Assigned
    if (!isCustoms && !isCompany && !isStation && !isAssigned) {
      throw new PermissionError('Permission denied');
    }

    return prisma.task.update({
      where: { id },
      data: input,
      include: {
        originSubmission: true,
        resolutionSubmission: true,
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

  async updateTaskStatus(id: string, input: UpdateTaskInput, actor: AuthenticatedUser) {
    return this.updateTask(id, input, actor);
  }

  async addTaskMessage(taskId: string, input: CreateTaskMessageInput, actor: AuthenticatedUser) {
    const task = await this.getTaskById(taskId, actor);

    const isCustoms = this.isCustomsUser(actor);
    const isCompany = actor.companyId && !actor.stationId && task.station.companyId === actor.companyId;
    const isAssigned = task.assignedToId === actor.id;
    const isStationOwner = actor.stationId && task.stationId === actor.stationId;

    if (!isCustoms && !isCompany && !isAssigned && !isStationOwner) {
      throw new PermissionError('Permission denied: You cannot reply to this ticket');
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
    ].includes(actor.role as any);
  }
}
