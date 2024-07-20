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
})
