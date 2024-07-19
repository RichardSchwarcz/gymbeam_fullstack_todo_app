import { useQueryClient } from '@tanstack/react-query'
import { getQueryKey } from '@trpc/react-query'
import { X } from 'lucide-react'
import { type Dispatch, type SetStateAction } from 'react'
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
  list: z.union([
    z.literal('Personal'),
    z.literal('Work'),
    z.literal('Climbing'),
    z.literal('Books'),
  ]),
  dueDate: z.date(),
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
}: {
  isTaskbarVisible: boolean
  setTaskbarVisibility: Dispatch<SetStateAction<boolean>>
}) {
  const { data: tags } = api.tag.getTags.useQuery()
  const queryClient = useQueryClient()

  const queryKey = getQueryKey(api.task.getTasks)
  const { mutate } = api.task.createTask.useMutation({
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey })
    },
  })

  const form = useForm<z.infer<typeof formSchema>>({
    defaultValues: {
      task: '',
      description: '',
      list: 'Personal',
    },
  })

  return (
    <div className="flex min-h-screen w-1/3 flex-col justify-between rounded-3xl bg-stone-50 p-4">
      <div>
        <div className="mb-4 flex items-center justify-between">
          <p className="text-xl font-bold">Task</p>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => setTaskbarVisibility(!isTaskbarVisible)}
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
                  <Textarea {...field} placeholder="Task Description" />
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
              render={({ field }) => (
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pick A List" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Personal">Personal</SelectItem>
                    <SelectItem value="Work">Work</SelectItem>
                    <SelectItem value="Climbing">Climbing</SelectItem>
                    <SelectItem value="Books">Books</SelectItem>
                  </SelectContent>
                </Select>
              )}
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
              render={() => (
                <MultiSelect
                  placeholder="Add Tags"
                  defaultValue={[]}
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
              )}
            />
          </div>
        </form>
      </div>

      <div className="flex justify-between">
        <Button variant="outline">Delete Task</Button>
        <Button
          onClick={() => {
            mutate(form.getValues())
          }}
        >
          Save Changes
        </Button>
      </div>
    </div>
  )
}
