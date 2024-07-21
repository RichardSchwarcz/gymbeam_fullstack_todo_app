import { useState } from 'react'
import { api } from '~/utils/api'
import { Checkbox } from './ui/checkbox'

export default function OptimisticCheckbox({
  task,
}: {
  task: {
    id: string
    completed: boolean
  }
}) {
  const [isChecked, setIsChecked] = useState(task.completed)
  const utils = api.useUtils()

  const { mutate } = api.task.updateTaskStatus.useMutation({
    onMutate: async (updatedTask) => {
      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      await utils.task.getTasks.cancel()

      // Snapshot the previous value
      const previousTasks = utils.task.getTasks.getData()

      // Optimistically update to the new value
      utils.task.getTasks.setData({}, (oldTasks) =>
        oldTasks?.map((t) =>
          t.id === updatedTask.id
            ? { ...t, completed: updatedTask.completed }
            : t
        )
      )

      // Return a context object with the snapshotted value
      return { previousTasks }
    },
    onError: (err, updatedTask, context) => {
      // Revert to the previous value
      utils.task.getTasks.setData({}, context?.previousTasks)
      // Optionally, you can show an error message here
    },
    onSettled: () => {
      void utils.task.getTasks.invalidate()
    },
  })

  return (
    <Checkbox
      checked={isChecked}
      onClick={(e) => {
        e.stopPropagation()
        const newCompletedStatus = !isChecked
        setIsChecked(newCompletedStatus)
        mutate({ id: task.id, completed: newCompletedStatus })
      }}
    />
  )
}
