import { createCallerFactory, createTRPCRouter } from '~/server/api/trpc'
import { ListRouter } from './routers/list'
import { tagRouter } from './routers/tag'
import { taskRouter } from './routers/task'

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  task: taskRouter,
  list: ListRouter,
  tag: tagRouter,
})

// export type definition of API
export type AppRouter = typeof appRouter

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter)
