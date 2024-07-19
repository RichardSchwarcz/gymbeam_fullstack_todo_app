import { useQueryClient } from '@tanstack/react-query'
import { getQueryKey } from '@trpc/react-query'
import { format } from 'date-fns'
import { Menu, PlusIcon } from 'lucide-react'
import { useState } from 'react'
import MenuSidebar from '~/components/menu-sidebar'
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
import { cn } from '~/lib/utils'
import { api } from '~/utils/api'

export default function Home() {
  const [isMenuVisible, setMenuVisibility] = useState(true)
  const [isTaskBarVisible, setTaskBarVisibility] = useState(false)
  const queryClient = useQueryClient()

  const queryKey = getQueryKey(api.task.getTasks)
  const { mutate } = api.task.updateTaskStatus.useMutation({
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey })
    },
  })

  const { data: tasks } = api.task.getTasks.useQuery()

  return (
    <div className="container flex max-h-svh gap-4 p-4">
      {isMenuVisible ? (
        <MenuSidebar
          setSidebarVisibility={setMenuVisibility}
          isSidebarVisible={isMenuVisible}
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
      <div className="scrollbar-thin w-full rounded-3xl p-4">
        <button
          className="flex w-full gap-4 border-b border-slate-200 py-4 text-left text-slate-400"
          onClick={() => setTaskBarVisibility(true)}
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
                  className={cn(
                    'h-14',
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
      {isTaskBarVisible ? (
        <TaskSidebar
          isTaskbarVisible={isTaskBarVisible}
          setTaskbarVisibility={setTaskBarVisibility}
        />
      ) : null}
    </div>
  )
}
