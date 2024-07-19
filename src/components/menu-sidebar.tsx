import { useQuery } from '@tanstack/react-query'
import {
  ChevronsRight,
  ListTodo,
  Menu,
  Monitor,
  Moon,
  PlusIcon,
  Sun,
  X,
} from 'lucide-react'
import { useTheme } from 'next-themes'
import { type Dispatch, type SetStateAction } from 'react'
import { Button } from '~/components/ui/button'
import { getTags } from '~/service/getTags'
import { MenuSeparator } from './menu-separator'

export default function MenuSidebar({
  isSidebarVisible,
  setSidebarVisibility,
}: {
  isSidebarVisible: boolean
  setSidebarVisibility: Dispatch<SetStateAction<boolean>>
}) {
  const { setTheme } = useTheme()
  const { data: tags } = useQuery({
    queryKey: ['tags'],
    queryFn: getTags,
  })

  return (
    <div className="flex w-1/3 flex-col justify-between rounded-3xl bg-stone-50 p-4">
      <div>
        <div className="mb-4 flex items-center justify-between">
          <p className="text-xl font-bold">Menu</p>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => setSidebarVisibility(!isSidebarVisible)}
          >
            <Menu />
          </Button>
        </div>

        <MenuSeparator />

        <div className="mb-4 flex flex-col gap-2">
          <p className="text-sm font-semibold text-slate-800">TASKS</p>
          <div className="flex gap-4">
            <ChevronsRight />
            <p>Upcoming</p>
          </div>
          <div className="flex gap-4">
            <ListTodo />
            <p>Today</p>
          </div>
        </div>

        <MenuSeparator />

        <div className="mb-4 flex flex-col gap-2">
          <p className="text-sm font-semibold text-slate-800">LISTS</p>
          <div>
            <ListItem color="#dc2626">Personal</ListItem>
            <ListItem color="#b45309">Work</ListItem>
            <ListItem color="#0e7490">Climbing</ListItem>
            <ListItem color="#404040">Books</ListItem>
          </div>
          <div className="flex gap-4">
            <PlusIcon />
            <p>Add New List</p>
          </div>
        </div>

        <MenuSeparator />

        <div className="mb-4 flex flex-col gap-2">
          <p className="text-sm font-semibold text-slate-800">TAGS</p>
          <div className="flex flex-wrap gap-2">
            {tags?.map((tag) => {
              return (
                <div
                  key={tag.id}
                  className="flex w-fit items-center gap-1 rounded-lg border px-2 py-1"
                  style={{ backgroundColor: hexToRgba(tag.color, '0.2') }}
                >
                  <p>{tag.tag}</p>
                  <X className="h-5 w-5 cursor-pointer rounded-sm p-1 hover:bg-red-400" />
                </div>
              )
            })}
          </div>
          <div className="flex gap-4">
            <PlusIcon />
            <p>Add New Tag</p>
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        <Button variant="ghost" size="icon" onClick={() => setTheme('dark')}>
          <Moon />
        </Button>
        <Button variant="ghost" size="icon" onClick={() => setTheme('light')}>
          <Sun />
        </Button>
        <Button variant="ghost" size="icon" onClick={() => setTheme('system')}>
          <Monitor />
        </Button>
      </div>
    </div>
  )
}

function ListItem({ children, color }: { children: string; color: string }) {
  return (
    <div className="flex items-center gap-2">
      <div
        className="h-4 w-4 rounded-sm"
        style={{ backgroundColor: hexToRgba(color, '0.2') }}
      />
      <p>{children}</p>
    </div>
  )
}

function hexToRgba(hex: string, alpha: string) {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)

  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}
