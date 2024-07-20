import { z } from 'zod'
import { createTRPCRouter, publicProcedure } from '~/server/api/trpc'

export const ListRouter = createTRPCRouter({
  createList: publicProcedure
    .input(
      z.object({
        list: z.string(),
        color: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.list.create({
        data: input,
      })
    }),
  getLists: publicProcedure.query(async ({ ctx }) => {
    return ctx.db.list.findMany()
  }),
  deleteList: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.list.delete({
        where: {
          id: input.id,
        },
      })
    }),
  updateList: publicProcedure
    .input(z.object({ id: z.string(), list: z.string().min(3) }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.list.update({
        where: {
          id: input.id,
        },
        data: {
          list: input.list,
        },
      })
    }),
})
