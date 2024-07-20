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
  getTasks: publicProcedure.query(async ({ ctx }) => {
    return ctx.db.task.findMany({
      include: {
        tags: true,
      },
    })
  }),
  getTask: publicProcedure
    .input(
      z.object({
        id: z.string(),
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
        tags: z.array(z.object({ id: z.string(), tag: z.string() })),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.task.update({
        where: {
          id: input.id,
        },
        data: {
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
