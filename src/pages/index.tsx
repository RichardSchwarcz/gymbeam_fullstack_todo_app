import { useQueryClient } from '@tanstack/react-query'
import { getQueryKey } from '@trpc/react-query'
import { format } from 'date-fns'
import { Menu, PlusIcon } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { MenuDrawer } from '~/components/menu-drawer'
import MenuSidebar from '~/components/menu-sidebar'
import { TaskDrawer } from '~/components/task-drawer'
import TaskSidebar from '~/components/task-sidebar'
import { Button } from '~/components/ui/button'
import { Checkbox } from '~/components/ui/checkbox'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/ui/table'
import useMediaQuery from '~/hooks/useMediaQuery'
import { hexToRgba } from '~/lib/hextToRrgba'
import priorityColors from '~/lib/priorityColors'
import { cn } from '~/lib/utils'
import { api } from '~/utils/api'

export default function Home() {
  const router = useRouter()

  const [isMenuVisible, setMenuVisibility] = useState(false)
  const [isNewTaskBarVisible, setNewTaskBarVisibility] = useState(false)
  const [isEditTaskBarVisible, setEditTaskBarVisibility] = useState(false)
  const isLargeScreen = useMediaQuery('(min-width: 1280px)')
  const queryClient = useQueryClient()

  useEffect(() => {
    if (isNewTaskBarVisible && isMenuVisible && !isLargeScreen) {
      setMenuVisibility(false)
    }
  }, [isLargeScreen, isNewTaskBarVisible, isMenuVisible])

  const queryKey = getQueryKey(api.task.getTasks)
  const { mutate } = api.task.updateTaskStatus.useMutation({
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey })
    },
  })

  const { data: tasks } = api.task.getTasks.useQuery()

  const { resolvedTheme } = useTheme()

  return (
    <div className="container flex max-h-svh gap-4 p-4">
      {isLargeScreen && isMenuVisible ? (
        <div className="hidden w-80 flex-none lg:block">
          <MenuSidebar
            setSidebarVisibility={setMenuVisibility}
            isSidebarVisible={isMenuVisible}
          />
        </div>
      ) : !isLargeScreen && isMenuVisible ? (
        <MenuDrawer
          isDrawerOpen={isMenuVisible}
          setIsDrawerOpen={setMenuVisibility}
        />
      ) : null}
      <div className="scrollbar-thin w-full flex-1 flex-shrink rounded-3xl p-4">
        <div className="flex gap-2">
          {!isMenuVisible && (
            <Button
              size="icon"
              variant="outline"
              onClick={() => setMenuVisibility(!isMenuVisible)}
            >
              <Menu size={18} />
            </Button>
          )}
          <Button
            className="w-full justify-start gap-2 text-slate-500"
            variant="outline"
            onClick={() => {
              setNewTaskBarVisibility(true)
              setEditTaskBarVisibility(false)
            }}
          >
            <PlusIcon size={18} />
            Add New Task
          </Button>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10" />
              <TableHead>Task</TableHead>
              <TableHead className="hidden sm:table-cell">Due</TableHead>
              <TableHead className="hidden md:table-cell">Tags</TableHead>
              <TableHead className="hidden md:table-cell">Priority</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tasks?.map((task) => {
              console.log(`text-${priorityColors(task.priority)}-400`)
              return (
                <TableRow
                  key={task.id}
                  onClick={() => {
                    void router.push(`/?task=${task.id}`)
                    setEditTaskBarVisibility(true)
                    setNewTaskBarVisibility(false)
                  }}
                  className={cn(
                    'h-14 cursor-pointer',
                    task.completed && 'bg-red-50/40 line-through'
                  )}
                >
                  <TableCell>
                    <Checkbox
                      checked={task.completed}
                      onClick={(e) => {
                        e.stopPropagation()
                        mutate({ id: task.id, completed: !task.completed })
                      }}
                    />
                  </TableCell>
                  <TableCell className="font-semibold">{task.task}</TableCell>
                  <TableCell className="hidden sm:table-cell">
                    {format(task.dueDate, 'dd.MM.yyyy')}
                  </TableCell>
                  <TableCell className="hidden gap-1 md:flex">
                    {task?.tags.map((tag) => {
                      return (
                        <div
                          key={tag.id}
                          className="w-fit rounded-md px-2 py-1"
                          style={{
                            backgroundColor: hexToRgba(
                              tag.color,
                              resolvedTheme!
                            ),
                          }}
                        >
                          {tag.tag}
                        </div>
                      )
                    })}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <div
                      className="w-fit rounded-md px-2 py-1"
                      style={{
                        backgroundColor: hexToRgba(
                          priorityColors(task.priority),
                          resolvedTheme!
                        ),
                      }}
                    >
                      {task?.priority}
                    </div>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>
      {isLargeScreen && isNewTaskBarVisible ? (
        <div className="w-80 flex-none">
          <TaskSidebar
            isTaskbarVisible={isNewTaskBarVisible}
            setTaskbarVisibility={setNewTaskBarVisibility}
            taskAction="newTask"
          />
        </div>
      ) : !isLargeScreen && isNewTaskBarVisible ? (
        <TaskDrawer
          isDrawerOpen={isNewTaskBarVisible}
          setIsDrawerOpen={setNewTaskBarVisibility}
          taskAction="newTask"
        />
      ) : null}
      {isLargeScreen && isEditTaskBarVisible ? (
        <div className="w-80 flex-none">
          <TaskSidebar
            isTaskbarVisible={isEditTaskBarVisible}
            setTaskbarVisibility={setEditTaskBarVisibility}
            taskAction="editTask"
          />
        </div>
      ) : !isLargeScreen && isEditTaskBarVisible ? (
        <TaskDrawer
          isDrawerOpen={isEditTaskBarVisible}
          setIsDrawerOpen={setEditTaskBarVisibility}
          taskAction="editTask"
        />
      ) : null}
    </div>
  )
}
