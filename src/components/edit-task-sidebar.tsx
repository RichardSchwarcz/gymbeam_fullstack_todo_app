import { useQueryClient } from '@tanstack/react-query'
import { getQueryKey } from '@trpc/react-query'
import { X } from 'lucide-react'
import { useRouter } from 'next/router'
import { useEffect, useState, type Dispatch, type SetStateAction } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'
import { Button } from '~/components/ui/button'
import { api } from '~/utils/api'
import { MenuSeparator } from './menu-separator'
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

const formSchema = z.object({
  task: z.string(),
  description: z.string().optional(),
  list: z.string(),
  priority: z.union([
    z.literal('low'),
    z.literal('medium'),
    z.literal('high'),
    z.literal('urgent'),
  ]),
  dueDate: z.date(),
  tags: z.array(
    z.object({
      id: z.string(),
      tag: z.string(),
    })
  ),
})

export default function EditTaskSidebar({
  isTaskbarVisible,
  setTaskbarVisibility,
}: {
  isTaskbarVisible: boolean
  setTaskbarVisibility: Dispatch<SetStateAction<boolean>>
}) {
  const router = useRouter()
  // this key remounts the select component on every task change
  const [key, setKey] = useState(0)
  const { task } = router.query as {
    task: string
  }
  const form = useForm<z.infer<typeof formSchema>>({
    defaultValues: {
      task: '',
      description: '',
      list: '',
      priority: 'low',
      tags: [],
    },
  })
  const { data: tags } = api.tag.getTags.useQuery()
  const { data: lists } = api.list.getLists.useQuery()
  const { data: taskData, isSuccess } = api.task.getTask.useQuery({
    id: task,
  })
  const queryClient = useQueryClient()

  const queryKey = getQueryKey(api.task.getTasks)
  const { mutate } = api.task.updateTaskProperties.useMutation({
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey })
      form.reset()
      setTaskbarVisibility(false)
    },
  })
  const { mutate: deleteTask } = api.task.deleteTask.useMutation({
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey })
      form.reset()
      setTaskbarVisibility(false)
    },
  })

  useEffect(() => {
    if (taskData && isSuccess) {
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
    <div className="flex min-h-screen w-1/3 flex-col justify-between rounded-3xl bg-stone-50 p-4">
      <div>
        <div className="mb-4 flex items-center justify-between">
          <p className="text-xl font-bold">Edit Task</p>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => {
              void router.push('/')
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
              <p className="text-sm font-semibold text-slate-500">Task</p>
              <Controller
                name="task"
                control={form.control}
                render={({ field }) => (
                  <Input {...field} placeholder="New Task" />
                )}
              />
            </div>
            <div className="flex flex-col">
              <p className="text-sm font-semibold text-slate-500">
                Description
              </p>
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
            <p className="text-sm font-semibold text-slate-500">List</p>
            <Controller
              control={form.control}
              name="list"
              render={({ field }) => {
                return (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pick A List" />
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
          </div>

          <div className="mb-4 flex flex-col">
            <p className="text-sm font-semibold text-slate-500">Priority</p>
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
          </div>

          <div className="mb-4 flex flex-col">
            <p className="text-sm font-semibold text-slate-500">Due Date</p>
            <DatePicker<z.infer<typeof formSchema>>
              name="dueDate"
              control={form.control}
            />
          </div>

          <MenuSeparator />

          <div className="flex flex-col">
            <p className="text-sm font-semibold text-slate-500">Tags</p>
            <Controller
              control={form.control}
              name="tags"
              render={() => {
                return (
                  <MultiSelect
                    key={key}
                    placeholder="Add Tags"
                    defaultValue={taskData?.tags.map((tag) => tag.id) ?? []}
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

      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={() => {
            deleteTask({ id: task })
          }}
        >
          Delete Task
        </Button>
        <Button
          onClick={() => {
            const data = {
              ...form.getValues(),
              id: task,
            }
            mutate(data)
          }}
        >
          Save Changes
        </Button>
      </div>
    </div>
  )
}
