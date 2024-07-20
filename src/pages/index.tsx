import { useQueryClient } from '@tanstack/react-query'
import { getQueryKey } from '@trpc/react-query'
import { format } from 'date-fns'
import { Menu, PlusIcon } from 'lucide-react'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import EditTaskSidebar from '~/components/edit-task-sidebar'
import { MenuDrawer } from '~/components/menu-drawer'
import MenuSidebar from '~/components/menu-sidebar'
import NewTaskSidebar from '~/components/new-task-sidebar'
import { TaskDrawer } from '~/components/task-drawer'
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
import { cn } from '~/lib/utils'
import { api } from '~/utils/api'

export default function Home() {
  const router = useRouter()
  const [isMenuVisible, setMenuVisibility] = useState(true)
  const [isNewTaskBarVisible, setNewTaskBarVisibility] = useState(false)
  const [isEditTaskBarVisible, setEditTaskBarVisibility] = useState(false)
  const [isLargeScreen, setIsLargeScreen] = useState(true)
  const queryClient = useQueryClient()

  useEffect(() => {
    const mediaQuery = window.matchMedia('(min-width: 1200px)')
    const handleMediaQueryChange = (event: MediaQueryListEvent) => {
      setIsLargeScreen(event.matches)
    }
    mediaQuery.addEventListener('change', handleMediaQueryChange)
    setIsLargeScreen(mediaQuery.matches)

    return () => {
      mediaQuery.removeEventListener('change', handleMediaQueryChange)
    }
  }, [])

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
      ) : (
        <div className="pt-4">
          <Button
            size="icon"
            variant="ghost"
            onClick={() => setMenuVisibility(!isMenuVisible)}
          >
            <Menu />
          </Button>
        </div>
      )}
      <div className="scrollbar-thin w-full flex-1 flex-shrink rounded-3xl p-4">
        <button
          className="flex w-full gap-4 border-b border-slate-200 py-4 text-left text-slate-400"
          onClick={() => {
            setNewTaskBarVisibility(true)
            setEditTaskBarVisibility(false)
          }}
        >
          <PlusIcon />
          Add New Task
        </button>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead />
              <TableHead>Task</TableHead>
              <TableHead>Tags</TableHead>
              <TableHead>Due</TableHead>
              <TableHead>Priority</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tasks?.map((task) => {
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
                      onClick={() => {
                        mutate({ id: task.id, completed: !task.completed })
                      }}
                    />
                  </TableCell>
                  <TableCell>{task.task}</TableCell>
                  <TableCell>
                    {task?.tags.map((tag) => {
                      return <div key={tag.id}>{tag.tag}</div>
                    })}
                  </TableCell>
                  <TableCell>{format(task.dueDate, 'dd.MM.yyyy')}</TableCell>
                  <TableCell>{task?.priority}</TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>
      {isLargeScreen && isNewTaskBarVisible ? (
        <NewTaskSidebar
          isTaskbarVisible={isNewTaskBarVisible}
          setTaskbarVisibility={setNewTaskBarVisibility}
        />
      ) : !isLargeScreen && isNewTaskBarVisible ? (
        <TaskDrawer
          isDrawerOpen={isNewTaskBarVisible}
          setIsDrawerOpen={setNewTaskBarVisibility}
        />
      ) : null}
      {isEditTaskBarVisible ? (
        <EditTaskSidebar
          isTaskbarVisible={isEditTaskBarVisible}
          setTaskbarVisibility={setEditTaskBarVisibility}
        />
      ) : null}
    </div>
  )
}
