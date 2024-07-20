import { faker } from '@faker-js/faker'
import { useQueryClient } from '@tanstack/react-query'
import { getQueryKey } from '@trpc/react-query'
import {
  ChevronsLeft,
  ChevronsRight,
  ListTodo,
  Monitor,
  Moon,
  PlusIcon,
  Sun,
  X,
} from 'lucide-react'
import { useTheme } from 'next-themes'
import { useEffect, useState, type Dispatch, type SetStateAction } from 'react'
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
  const [isNewListInputVisible, setNewListInputVisibility] = useState(false)
  const { data: tags } = api.tag.getTags.useQuery()
  const { data: lists } = api.list.getLists.useQuery()

  const queryClient = useQueryClient()
  const { mutate: createTag } = api.tag.createTag.useMutation({
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: getQueryKey(api.tag.getTags),
      })
      setNewTagInputVisibility(false)
    },
  })
  const { mutate: createList } = api.list.createList.useMutation({
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: getQueryKey(api.list.getLists),
      })
      setNewListInputVisibility(false)
    },
  })

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setNewTagInputVisibility(false)
        setNewListInputVisibility(false)
      }
    }

    // Add event listener for the Escape key
    document.addEventListener('keydown', handleKeyDown)

    // Clean up the event listener
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  return (
    <div className="flex min-h-[calc(100vh-2rem)] flex-col justify-between rounded-3xl bg-stone-50 p-4">
      <div>
        <div className="mb-4 flex items-center justify-between">
          <p className="text-xl font-bold">Menu</p>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => setSidebarVisibility(!isSidebarVisible)}
          >
            <ChevronsLeft />
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
            {lists?.map((list) => {
              return (
                <div key={list.id}>
                  <ListItem color={list.color}>{list.list}</ListItem>
                </div>
              )
            })}
          </div>

          {isNewListInputVisible && (
            <ReactiveInput
              onMutate={(value) =>
                createList({ list: value, color: faker.color.rgb() })
              }
              placeholder=""
            />
          )}

          <button
            className="border-bpy-4 flex w-full gap-4 text-left"
            onClick={() => setNewListInputVisibility(true)}
          >
            <PlusIcon />
            Add New List
          </button>
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
              onMutate={(value) =>
                createTag({ tag: value, color: faker.color.rgb() })
              }
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
