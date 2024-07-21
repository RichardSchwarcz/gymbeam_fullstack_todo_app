import { endOfDay, isFuture, isPast, isSameDay, startOfDay } from 'date-fns'
import { z } from 'zod'
import { createTRPCRouter, publicProcedure } from '~/server/api/trpc'

const Priority = z.enum(['low', 'medium', 'high', 'urgent']).default('low')

export const taskRouter = createTRPCRouter({
  createTask: publicProcedure
    .input(
      z.object({
        task: z.string(),
        completed: z.boolean().default(false),
        dueDate: z.date(),
        description: z.string().optional(),
        priority: Priority,
        list: z.string(),
        tags: z
          .array(
            z.object({
              id: z.string(),
            })
          )
          .optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.task.create({
        data: {
          task: input.task,
          completed: input.completed,
          dueDate: input.dueDate,
          description: input.description,
          list: {
            connect: {
              id: input.list,
            },
          },
          priority: input.priority,
          tags: {
            connect: input.tags?.map((tag) => ({ id: tag.id })),
          },
        },
      })
    }),
  getTasks: publicProcedure
    .input(
      z.object({
        list: z.string().optional(),
        dueDate: z.enum(['Today', 'Upcoming', 'Overdue']).optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const today = new Date()
      const startOfToday = startOfDay(today)
      const endOfToday = endOfDay(today)

      let dateFilter = {}

      if (input.dueDate) {
        switch (input.dueDate) {
          case 'Today':
            dateFilter = {
              dueDate: {
                gte: startOfToday,
                lt: endOfToday,
              },
            }
            break
          case 'Upcoming':
            dateFilter = {
              dueDate: {
                gt: endOfToday,
              },
            }
            break
          case 'Overdue':
            dateFilter = {
              dueDate: {
                lt: startOfToday,
              },
            }
            break
        }
      }

      return ctx.db.task.findMany({
        where: {
          list: input.list ? { list: input.list } : undefined,
          ...dateFilter,
        },
        include: {
          tags: true,
        },
        orderBy: {
          completed: 'asc',
        },
      })
    }),
  getTasksGroupedByDate: publicProcedure.query(async ({ ctx }) => {
    const tasks = await ctx.db.task.findMany({
      select: {
        id: true,
        dueDate: true,
      },
    })
    return groupTasksByDueDate(tasks)
  }),
  getTask: publicProcedure
    .input(
      z.object({
        id: z.string().optional(),
      })
    )
    .query(({ ctx, input }) => {
      return ctx.db.task.findFirst({
        where: {
          id: input.id,
        },
        select: {
          id: true,
          dueDate: true,
          list: {
            select: {
              id: true,
            },
          },
          priority: true,
          tags: {
            select: {
              id: true,
              tag: true,
            },
          },
          task: true,
          description: true,
        },
      })
    }),
  updateTaskStatus: publicProcedure
    .input(
      z.object({
        id: z.string(),
        completed: z.boolean(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.task.update({
        where: {
          id: input.id,
        },
        data: {
          completed: input.completed,
        },
      })
    }),
  updateTaskProperties: publicProcedure
    .input(
      z.object({
        id: z.string(),
        task: z.string(),
        description: z.string().optional(),
        list: z.string(),
        priority: Priority,
        dueDate: z.date(),
        tags: z.array(z.object({ id: z.string(), tag: z.string() })),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.task.update({
        where: {
          id: input.id,
        },
        data: {
          dueDate: input.dueDate,
          task: input.task,
          description: input.description,
          priority: input.priority,
          tags: {
            set: input.tags.map((tag) => ({ id: tag.id })),
          },
          list: {
            connect: {
              id: input.list,
            },
          },
        },
      })
    }),
  deleteTask: publicProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.task.delete({
        where: {
          id: input.id,
        },
      })
    }),
})

type Task = {
  id: string
  dueDate: Date
}

export default function groupTasksByDueDate(tasks: Task[]) {
  const todaysTasks: Task[] = []
  const overdueTasks: Task[] = []
  const upcomingTasks: Task[] = []

  const today = new Date()

  tasks.forEach((task) => {
    if (isSameDay(task.dueDate, today)) {
      todaysTasks.push(task)
    } else if (isPast(task.dueDate) && !isSameDay(task.dueDate, today)) {
      overdueTasks.push(task)
    } else if (isFuture(task.dueDate)) {
      upcomingTasks.push(task)
    }
  })

  return {
    todaysTasks,
    overdueTasks,
    upcomingTasks,
  }
}
