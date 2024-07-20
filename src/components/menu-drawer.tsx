import { type Dispatch, type SetStateAction } from 'react'

import { Drawer, DrawerContent } from '~/components/ui/drawer'
import MenuSidebar from './menu-sidebar'
import { DialogTitle } from './ui/dialog'

export function MenuDrawer({
  isDrawerOpen,
  setIsDrawerOpen,
}: {
  isDrawerOpen: boolean
  setIsDrawerOpen: Dispatch<SetStateAction<boolean>>
}) {
  return (
    <Drawer onOpenChange={setIsDrawerOpen} open={isDrawerOpen} direction="left">
      <DrawerContent
        className="h-full w-[400px] bg-stone-50"
        aria-describedby={undefined}
      >
        <DialogTitle className="hidden">Menu sidebar</DialogTitle>
        <MenuSidebar
          isSidebarVisible={isDrawerOpen}
          setSidebarVisibility={setIsDrawerOpen}
        />
      </DrawerContent>
    </Drawer>
  )
}
