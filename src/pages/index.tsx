import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
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

export default function Home() {
  const [isMenuVisible, setMenuVisibility] = useState(true)
  const [isTaskBarVisible, setTaskBarVisibility] = useState(false)
  const queryClient = useQueryClient()
  const { mutate } = useMutation({
    mutationFn: updateTaskMutation,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['tasks'] })
    },
  })

  const { data: tasks } = useQuery({
    queryKey: ['tasks'],
    queryFn: getTasks,
  })

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
              <TableHead>Status</TableHead>
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
                        mutate({ task: task.id, completed: !task.completed })
                      }}
                    />
                  </TableCell>
                  <TableCell>{task.task}</TableCell>
                  <TableCell>{task?.tags}</TableCell>
                  <TableCell>{task.status}</TableCell>
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

type Task = {
  id: string
  createdAt: Date
  task: string
  completed: boolean
  status: string
  dueDate: Date
  priority: string
  tags: string
}

async function getTasks(): Promise<Task[] | undefined> {
  return fetch(
    `https://${process.env.NEXT_PUBLIC_MOCKAPI_SECRET}.mockapi.io/tasks`,
    {
      method: 'GET',
      headers: { 'content-type': 'application/json' },
    }
  )
    .then((res) => {
      if (res.ok) {
        return res.json() as Promise<Task[]>
      }
      throw new Error('Failed to fetch tasks')
    })
    .catch((error) => {
      console.log(error)
      return undefined
    })
}
