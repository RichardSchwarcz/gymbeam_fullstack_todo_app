import { useQueryClient } from '@tanstack/react-query'
import { getQueryKey } from '@trpc/react-query'
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
import { useState, type Dispatch, type SetStateAction } from 'react'
import { Button } from '~/components/ui/button'
import { api } from '~/utils/api'
import { MenuSeparator } from './menu-separator'
import ReactiveInput from './reactive-input'

export default function MenuSidebar({
  isSidebarVisible,
  setSidebarVisibility,
}: {
  isSidebarVisible: boolean
  setSidebarVisibility: Dispatch<SetStateAction<boolean>>
}) {
  const { setTheme } = useTheme()
  const [isNewTagInputVisible, setNewTagInputVisibility] = useState(false)
  const { data: tags } = api.tag.getTags.useQuery()

  const queryClient = useQueryClient()
  const queryKey = getQueryKey(api.tag.getTags)
  const { mutate } = api.tag.createTag.useMutation({
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey })
      setNewTagInputVisibility(false)
    },
  })

  return (
    <div className="flex min-h-screen w-1/3 flex-col justify-between rounded-3xl bg-stone-50 p-4">
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

          {isNewTagInputVisible && (
            <ReactiveInput
              onMutate={(value) => mutate({ tag: value, color: 'red' })}
              placeholder=""
            />
          )}

          <button
            className="border-bpy-4 flex w-full gap-4 text-left"
            onClick={() => setNewTagInputVisibility(true)}
          >
            <PlusIcon />
            Add New Tag
          </button>
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
