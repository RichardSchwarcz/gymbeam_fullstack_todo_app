import { type Dispatch, type SetStateAction } from 'react'

import { Drawer, DrawerContent } from '~/components/ui/drawer'
import NewTaskSidebar from './new-task-sidebar'

export function TaskDrawer({
  isDrawerOpen,
  setIsDrawerOpen,
}: {
  isDrawerOpen: boolean
  setIsDrawerOpen: Dispatch<SetStateAction<boolean>>
}) {
  return (
    <Drawer
      onOpenChange={setIsDrawerOpen}
      open={isDrawerOpen}
      direction="right"
    >
      <DrawerContent className="fixed bottom-0 right-0 h-full w-[400px] bg-stone-50">
        <NewTaskSidebar
          isTaskbarVisible={isDrawerOpen}
          setTaskbarVisibility={setIsDrawerOpen}
        />
      </DrawerContent>
    </Drawer>
  )
}
