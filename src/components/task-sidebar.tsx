import { zodResolver } from '@hookform/resolvers/zod'
import { useQueryClient } from '@tanstack/react-query'
import { getQueryKey } from '@trpc/react-query'
import { X } from 'lucide-react'
import { useRouter } from 'next/router'
import { useEffect, useState, type Dispatch, type SetStateAction } from 'react'
import { Controller, useForm, useFormState } from 'react-hook-form'
import { z } from 'zod'
import { Button } from '~/components/ui/button'
import { api } from '~/utils/api'
import { MenuSeparator } from './menu-separator'
import SidebarContainer from './sidebar-container'
import { DatePicker } from './ui/datepicker'
import { Input } from './ui/input'
import { MultiSelect } from './ui/multi-select'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select'
import { Textarea } from './ui/textarea'
import { toast } from './ui/use-toast'

const formSchema = z.object({
  task: z
    .string({ required_error: 'Please enter a task title' })
    .min(3, { message: 'Task must be at least 3 characters long.' }),
  description: z.string().optional(),
  list: z.string({ required_error: 'Please select a todo list' }),
  priority: z.union([
    z.literal('low', { message: 'Please select task priority' }),
    z.literal('medium', { message: 'Please select task priority' }),
    z.literal('high', { message: 'Please select task priority' }),
    z.literal('urgent', { message: 'Please select task priority' }),
  ]),
  dueDate: z.date({ required_error: 'Please pick a date' }),
  tags: z.array(
    z.object({
      id: z.string(),
      tag: z.string(),
    })
  ),
})

export default function TaskSidebar({
  isTaskbarVisible,
  setTaskbarVisibility,
  taskAction,
}: {
  isTaskbarVisible: boolean
  setTaskbarVisibility: Dispatch<SetStateAction<boolean>>
  taskAction: 'editTask' | 'newTask'
}) {
  // this key remounts the select component on every task change
  const [key, setKey] = useState(0)

  const router = useRouter()
  const { task } = router.query as {
    task: string | undefined
  }
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      tags: [],
    },
    mode: 'onSubmit',
  })
  const formState = useFormState({ control: form.control })

  const { data: tags } = api.tag.getTags.useQuery()
  const { data: lists } = api.list.getLists.useQuery()
  const { data: taskData, isSuccess } = api.task.getTask.useQuery(
    {
      id: task,
    },
    {
      enabled: taskAction === 'editTask',
    }
  )

  const queryClient = useQueryClient()
  const tasksQueryKey = getQueryKey(api.task.getTasks)
  const groupedTasksQueryKey = getQueryKey(api.task.getTasksGroupedByDate)
  const onSuccessfulMutation = () => {
    setTaskbarVisibility(false)
    void router.push('/')
    void queryClient.invalidateQueries({ queryKey: tasksQueryKey })
    void queryClient.invalidateQueries({ queryKey: groupedTasksQueryKey })
    form.reset()
  }

  const { mutate: createTask } = api.task.createTask.useMutation({
    onSuccess: (task) => {
      onSuccessfulMutation()
      toast({
        title: 'Task added to a list.',
        description: task.task,
      })
    },
  })
  const { mutate: updateTaskProperties } =
    api.task.updateTaskProperties.useMutation({
      onSuccess: (task) => {
        onSuccessfulMutation()
        toast({
          title: 'Task updated.',
          description: task.task,
        })
      },
    })
  const { mutate: deleteTask } = api.task.deleteTask.useMutation({
    onSuccess: (task) => {
      onSuccessfulMutation()
      toast({
        title: 'Task deleted.',
        description: task.task,
      })
    },
  })

  useEffect(() => {
    if (taskData && isSuccess && taskAction === 'editTask') {
      const parsedData = {
        ...taskData,
        list: taskData.list.id,
        description: taskData.description ?? undefined,
      }
      form.reset(parsedData)
      setKey((prev) => prev + 1)
    }
  }, [taskData, isSuccess]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <SidebarContainer>
      <div>
        <div className="mb-4 flex items-center justify-between">
          {taskAction === 'editTask' ? (
            <p className="text-2xl">
              Edit <span className="text-primary">Task</span>
            </p>
          ) : (
            <p className="text-2xl">
              New <span className="text-primary">Task</span>
            </p>
          )}
          <Button
            size="icon"
            variant="ghost"
            onClick={() => {
              // eslint-disable-next-line @typescript-eslint/no-unused-vars
              const { task, ...restQueries } = router.query
              void router.push({
                pathname: '/',
                query: restQueries,
              })
              setTaskbarVisibility(!isTaskbarVisible)
            }}
          >
            <X />
          </Button>
        </div>

        <MenuSeparator />

        <form>
          <div className="mb-4 flex flex-col gap-4">
            <div className="flex flex-col">
              <SectionTitle>Task</SectionTitle>
              <Controller
                name="task"
                control={form.control}
                render={({ field }) => <Input {...field} placeholder="Title" />}
              />

              <p className="text-destructive">
                {formState.errors.task?.message}
              </p>
            </div>
            <div className="flex flex-col">
              <SectionTitle>Description</SectionTitle>
              <Controller
                name="description"
                control={form.control}
                render={({ field }) => (
                  <Textarea
                    placeholder="Task Description"
                    {...field}
                    value={field.value ?? ''}
                  />
                )}
              />
            </div>
          </div>

          <MenuSeparator />

          <div className="mb-4 flex flex-col">
            <SectionTitle>List</SectionTitle>
            <Controller
              control={form.control}
              name="list"
              render={({ field }) => {
                return (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select list" />
                    </SelectTrigger>
                    <SelectContent>
                      {lists?.map((list) => {
                        return (
                          <SelectItem value={list.id} key={list.id}>
                            {list.list}
                          </SelectItem>
                        )
                      })}
                    </SelectContent>
                  </Select>
                )
              }}
            />

            <p className="text-destructive">{formState.errors.list?.message}</p>
          </div>

          <div className="mb-4 flex flex-col">
            <SectionTitle>Priority</SectionTitle>
            <Controller
              control={form.control}
              name="priority"
              render={({ field }) => {
                return (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose priority" />
                    </SelectTrigger>
                    <SelectContent>
                      {formSchema.shape.priority.options.map((priority) => {
                        return (
                          <SelectItem
                            value={priority.value}
                            key={priority.value}
                          >
                            {priority.value}
                          </SelectItem>
                        )
                      })}
                    </SelectContent>
                  </Select>
                )
              }}
            />

            <p className="text-destructive">
              {formState.errors.priority?.message}
            </p>
          </div>

          <div className="mb-4 flex flex-col">
            <SectionTitle>Due Date</SectionTitle>
            <DatePicker<z.infer<typeof formSchema>>
              name="dueDate"
              control={form.control}
            />

            <p className="text-destructive">
              {formState.errors.dueDate?.message}
            </p>
          </div>

          <MenuSeparator />

          <div className="flex flex-col">
            <SectionTitle>Tags</SectionTitle>
            <Controller
              control={form.control}
              name="tags"
              render={({ field }) => {
                return (
                  <MultiSelect
                    key={key}
                    placeholder="Add Tags"
                    defaultValue={field.value.map((tag) => tag.id)}
                    options={
                      tags?.map((tag) => ({
                        label: tag.tag,
                        value: tag.id,
                      })) ?? []
                    }
                    onValueChange={(values) => {
                      const selectedOptions = values.map((value) => ({
                        id: value,
                        tag: tags?.find((tag) => tag.id === value)?.tag ?? '',
                      }))
                      form.setValue('tags', selectedOptions)
                    }}
                  />
                )
              }}
            />
          </div>
        </form>
      </div>

      <div className="flex justify-between py-4">
        {taskAction === 'editTask' && typeof task === 'string' ? (
          <Button
            variant="outline"
            onClick={() => {
              deleteTask({ id: task })
            }}
          >
            Delete Task
          </Button>
        ) : (
          <div className="h-10 w-10" />
        )}
        <Button
          onClick={() => {
            const validated = formSchema.safeParse(form.getValues())
            void form.trigger()
            if (taskAction === 'editTask' && typeof task === 'string') {
              if (validated.success) {
                updateTaskProperties({
                  ...validated.data,
                  id: task,
                })
              }
            }

            if (taskAction === 'newTask') {
              if (validated.success) {
                createTask(form.getValues())
              }
            }
          }}
        >
          Save Changes
        </Button>
      </div>
    </SidebarContainer>
  )
}

function SectionTitle({ children }: { children: string }) {
  return <p className="text-muted-foreground">{children}</p>
}
