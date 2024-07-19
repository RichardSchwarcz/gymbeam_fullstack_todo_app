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
        priority: Priority,
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
})
