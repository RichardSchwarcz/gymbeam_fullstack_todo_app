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
import { cn } from '~/lib/utils'
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
  const { setTheme, resolvedTheme } = useTheme()
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
        <div className="mb-8 flex items-center justify-between">
          <p className="text-xl font-bold">Menu</p>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => setSidebarVisibility(!isSidebarVisible)}
          >
            <ChevronsLeft />
          </Button>
        </div>

        <div className="flex flex-col">
          <p className="mb-2 text-sm font-semibold text-slate-800">TASKS</p>
          <Button
            className="w-full items-center justify-start gap-2 px-2"
            variant="ghost"
          >
            <ChevronsRight strokeWidth={1.5} />
            <p>Upcoming</p>
          </Button>
          <Button
            className="w-full items-center justify-start gap-2 px-2"
            variant="ghost"
          >
            <ListTodo strokeWidth={1.5} />
            <p>Today</p>
          </Button>
        </div>

        <MenuSeparator />

        <div className="flex flex-col">
          <p className="mb-2 text-sm font-semibold text-slate-800">LISTS</p>
          <div className="flex flex-col gap-2">
            {lists?.map((list) => {
              return (
                <ListItem
                  color={list.color}
                  key={list.id}
                  theme={resolvedTheme!}
                >
                  {list.list}
                </ListItem>
              )
            })}
          </div>

          {isNewListInputVisible && (
            <div className="mt-4">
              <ReactiveInput
                onMutate={(value) =>
                  createList({ list: value, color: faker.color.rgb() })
                }
                placeholder="List name"
              />
            </div>
          )}

          <Button
            className="mt-4 w-full justify-start gap-2 bg-transparent text-slate-500"
            variant="outline"
            onClick={() => setNewListInputVisibility(true)}
          >
            <PlusIcon size={18} />
            Add New List
          </Button>
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
                  style={{
                    backgroundColor: hexToRgba(tag.color, resolvedTheme!),
                  }}
                >
                  <p>{tag.tag}</p>
                  <X className="h-5 w-5 cursor-pointer rounded-sm p-1 hover:bg-red-400" />
                </div>
              )
            })}
          </div>

          {isNewTagInputVisible && (
            <div className="mt-4">
              <ReactiveInput
                onMutate={(value) =>
                  createTag({ tag: value, color: faker.color.rgb() })
                }
                placeholder="Tag name"
              />
            </div>
          )}

          <Button
            className="mt-4 w-full justify-start gap-2 bg-transparent text-slate-500"
            variant="outline"
            onClick={() => setNewTagInputVisibility(true)}
          >
            <PlusIcon size={18} />
            Add New Tag
          </Button>
        </div>
      </div>

      <div className="flex w-fit gap-2">
        <Button variant="ghost" size="icon" onClick={() => setTheme('dark')}>
          <Moon strokeWidth={1.5} size={20} />
        </Button>
        <Button variant="ghost" size="icon" onClick={() => setTheme('light')}>
          <Sun strokeWidth={1.5} size={20} />
        </Button>
        <Button variant="ghost" size="icon" onClick={() => setTheme('system')}>
          <Monitor strokeWidth={1.5} size={20} />
        </Button>
      </div>
    </div>
  )
}

function ListItem({
  children,
  color,
  theme,
}: {
  children: string
  color: string
  theme: string
}) {
  return (
    <div className="flex items-center gap-2">
      <div
        className={cn('h-4 w-4 rounded-sm', theme === 'dark' && 'border')}
        style={{ backgroundColor: hexToRgba(color, theme) }}
      />
      <p>{children}</p>
    </div>
  )
}

function hexToRgba(hex: string, theme: string) {
  const alpha = theme === 'dark' ? 0.5 : 0.2
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)

  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}
