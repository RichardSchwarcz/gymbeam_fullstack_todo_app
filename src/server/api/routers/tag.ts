import { z } from 'zod'
import { createTRPCRouter, publicProcedure } from '~/server/api/trpc'

export const tagRouter = createTRPCRouter({
  createTag: publicProcedure
    .input(
      z.object({
        tag: z.string(),
        color: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.tag.create({
        data: input,
      })
    }),
  getTags: publicProcedure.query(async ({ ctx }) => {
    return ctx.db.tag.findMany()
  }),
  deleteTag: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.tag.delete({
        where: { id: input.id },
      })
    }),
})
