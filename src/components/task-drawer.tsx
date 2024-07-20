import { type Dispatch, type SetStateAction } from 'react'

import { Drawer, DrawerContent } from '~/components/ui/drawer'
import TaskSidebar from './task-sidebar'
import { DialogTitle } from './ui/dialog'

export function TaskDrawer({
  isDrawerOpen,
  setIsDrawerOpen,
  taskAction,
}: {
  isDrawerOpen: boolean
  setIsDrawerOpen: Dispatch<SetStateAction<boolean>>
  taskAction: 'editTask' | 'newTask'
}) {
  return (
    <Drawer
      onOpenChange={setIsDrawerOpen}
      open={isDrawerOpen}
      direction="right"
    >
      <DrawerContent
        className="fixed bottom-0 right-0 h-full w-[400px] bg-stone-50"
        aria-describedby={undefined}
      >
        <DialogTitle className="hidden">Task sidebar</DialogTitle>
        <TaskSidebar
          isTaskbarVisible={isDrawerOpen}
          setTaskbarVisibility={setIsDrawerOpen}
          taskAction={taskAction}
        />
      </DrawerContent>
    </Drawer>
  )
}
