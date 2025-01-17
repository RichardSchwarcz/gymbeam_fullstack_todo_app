import { faker } from '@faker-js/faker'
import { useQueryClient } from '@tanstack/react-query'
import { getQueryKey } from '@trpc/react-query'
import {
  ChevronsLeft,
  ChevronsRight,
  CircleAlert,
  EllipsisVertical,
  ListTodo,
  Monitor,
  Moon,
  PlusIcon,
  Sun,
  Trash2Icon,
  X,
} from 'lucide-react'
import { useTheme } from 'next-themes'
import { useRouter } from 'next/router'
import {
  useEffect,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from 'react'
import { Button } from '~/components/ui/button'
import { getAlphaByTheme, hexToRgba } from '~/lib/hextToRrgba'
import { cn } from '~/lib/utils'
import { api } from '~/utils/api'
import { MenuSeparator } from './menu-separator'
import ReactiveInput from './reactive-input'
import SidebarContainer from './sidebar-container'
import { Command } from './ui/command'
import { Input } from './ui/input'
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover'
import { toast } from './ui/use-toast'

export default function MenuSidebar({
  isSidebarVisible,
  setSidebarVisibility,
}: {
  isSidebarVisible: boolean
  setSidebarVisibility: Dispatch<SetStateAction<boolean>>
}) {
  const { setTheme, resolvedTheme, theme } = useTheme()
  const [isNewTagInputVisible, setNewTagInputVisibility] = useState(false)
  const [isNewListInputVisible, setNewListInputVisibility] = useState(false)
  const { data: tags } = api.tag.getTags.useQuery()
  const { data: lists } = api.list.getLists.useQuery()
  const { data: groupedTasksByDueDate } =
    api.task.getTasksGroupedByDate.useQuery()

  const queryClient = useQueryClient()
  const { mutate: createTag } = api.tag.createTag.useMutation({
    onSuccess: (tag) => {
      void queryClient.invalidateQueries({
        queryKey: getQueryKey(api.tag.getTags),
      })
      setNewTagInputVisibility(false)
      toast({
        title: 'Tag created.',
        description: tag.tag,
      })
    },
  })
  const { mutate: createList } = api.list.createList.useMutation({
    onSuccess: (list) => {
      void queryClient.invalidateQueries({
        queryKey: getQueryKey(api.list.getLists),
      })
      setNewListInputVisibility(false)
      toast({
        title: 'List created.',
        description: list.list,
      })
    },
  })
  const { mutate: deleteTag } = api.tag.deleteTag.useMutation({
    onSuccess: (tag) => {
      void queryClient.invalidateQueries({
        queryKey: getQueryKey(api.tag.getTags),
      })
      void queryClient.invalidateQueries({
        queryKey: getQueryKey(api.task.getTasks),
      })
      toast({
        title: 'Tag deleted.',
        description: tag.tag,
      })
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
    <SidebarContainer>
      <div>
        <div className="mb-8 flex items-center justify-between">
          <p className="text-2xl">Menu</p>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => setSidebarVisibility(!isSidebarVisible)}
          >
            <ChevronsLeft />
          </Button>
        </div>

        <div className="flex flex-col">
          <p className="mb-2 text-sm font-semibold text-accent-foreground">
            TASKS
          </p>
          <TaskButton
            data={groupedTasksByDueDate?.upcomingTasks.length}
            icon={<ChevronsRight strokeWidth={1.5} />}
          >
            Upcoming
          </TaskButton>
          <TaskButton
            data={groupedTasksByDueDate?.todaysTasks.length}
            icon={<ListTodo strokeWidth={1.5} />}
            className="bg-primary text-secondary"
          >
            Today
          </TaskButton>
          <TaskButton
            data={groupedTasksByDueDate?.overdueTasks.length}
            icon={<CircleAlert strokeWidth={1.5} />}
          >
            Overdue
          </TaskButton>
        </div>

        <MenuSeparator />

        <div className="flex flex-col">
          <p className="mb-2 text-sm font-semibold text-accent-foreground">
            LISTS
          </p>
          <div className="flex flex-col">
            {lists?.map((list) => {
              return (
                <ListItem
                  color={list.color}
                  id={list.id}
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
            className="mt-4 w-full justify-start gap-2 text-accent-foreground"
            variant="outline"
            onClick={() => setNewListInputVisibility(true)}
          >
            <PlusIcon size={18} />
            Add New List
          </Button>
        </div>

        <MenuSeparator />

        <div className="mb-4 flex flex-col gap-2">
          <p className="text-sm font-semibold text-accent-foreground">TAGS</p>
          <div className="flex flex-wrap gap-2">
            {tags?.map((tag) => {
              return (
                <div
                  key={tag.id}
                  className="flex w-fit items-center gap-1 rounded-lg border px-2 py-1"
                  style={{
                    backgroundColor: hexToRgba(
                      tag.color,
                      getAlphaByTheme(resolvedTheme!)
                    ),
                  }}
                >
                  <p>{tag.tag}</p>
                  <button onClick={() => deleteTag({ id: tag.id })}>
                    <X className="h-5 w-5 cursor-pointer rounded-sm p-1 hover:bg-destructive" />
                  </button>
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
            className="mt-4 w-full justify-start gap-2 text-accent-foreground"
            variant="outline"
            onClick={() => setNewTagInputVisibility(true)}
          >
            <PlusIcon size={18} />
            Add New Tag
          </Button>
        </div>
      </div>

      <div className="flex w-fit gap-2 py-4">
        <Button
          className={cn(theme === 'dark' && 'border')}
          variant="ghost"
          size="icon"
          onClick={() => setTheme('dark')}
        >
          <Moon strokeWidth={1.5} size={20} />
        </Button>
        <Button
          className={cn(theme === 'light' && 'border')}
          variant="ghost"
          size="icon"
          onClick={() => setTheme('light')}
        >
          <Sun strokeWidth={1.5} size={20} />
        </Button>
        <Button
          className={cn(theme === 'system' && 'border')}
          variant="ghost"
          size="icon"
          onClick={() => setTheme('system')}
        >
          <Monitor strokeWidth={1.5} size={20} />
        </Button>
      </div>
    </SidebarContainer>
  )
}

function ListItem({
  children,
  color,
  theme,
  id,
}: {
  id: string
  children: string
  color: string
  theme: string
}) {
  const [renamedItem, setRenamedItem] = useState('')
  const queryClient = useQueryClient()
  const router = useRouter()
  const isCurrentList = router.query.list === children

  const { mutate: deleteList } = api.list.deleteList.useMutation({
    onSuccess: (list) => {
      void queryClient.invalidateQueries({
        queryKey: getQueryKey(api.list.getLists),
      })
      toast({
        title: 'List deleted.',
        description: list.list,
      })
    },
  })
  const { mutate: updateList } = api.list.updateList.useMutation({
    onSuccess: (list) => {
      void queryClient.invalidateQueries({
        queryKey: getQueryKey(api.list.getLists),
      })
      toast({
        title: 'List updated.',
        description: list.list,
      })
    },
  })

  const submitMutation = () => {
    if (renamedItem === '') {
      return
    }
    updateList({ id, list: renamedItem })
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      submitMutation()
    }
  }

  return (
    <div className="flex items-center justify-between">
      <Button
        variant="ghost"
        className={cn(
          'w-full justify-start gap-2',
          isCurrentList && 'bg-secondary'
        )}
        onClick={() =>
          router.push({
            pathname: '/',
            query: { ...router.query, list: children },
          })
        }
      >
        <div
          className={cn('h-4 w-4 rounded-sm', theme === 'dark' && 'border')}
          style={{
            backgroundColor: hexToRgba(color, getAlphaByTheme(theme)),
          }}
        />

        <p>{children}</p>
      </Button>

      <Popover>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="icon">
            <EllipsisVertical size={18} />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[200px]">
          <Command>
            <Input
              className="focus-visible:ring-0"
              defaultValue={children}
              onChange={(e) => setRenamedItem(e.target.value)}
              onKeyDown={(e) => handleKeyDown(e)}
              onBlur={() => submitMutation()}
            />
            <Button
              className="mt-2 gap-2 hover:bg-destructive"
              variant="outline"
              onClick={() => deleteList({ id })}
            >
              <Trash2Icon size={18} />
              <div className="font-bold">Delete</div>
            </Button>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  )
}

function TaskButton({
  children,
  data,
  icon,
  className,
}: {
  children: string
  data: number | undefined
  icon: ReactNode
  className?: string
}) {
  const router = useRouter()
  const isCurrentTasks = router.query.due === children

  return (
    <Button
      className={cn(
        'w-full items-center px-2',
        isCurrentTasks && 'bg-secondary'
      )}
      variant="ghost"
      onClick={() =>
        router.push({
          pathname: '/',
          query: { ...router.query, due: children },
        })
      }
    >
      <div className="flex w-full items-center justify-between">
        <div className="flex items-center gap-2">
          {icon}
          <p>{children}</p>
        </div>
        <p
          className={cn(
            'w-8 rounded-md border bg-secondary px-2 py-1 font-bold',
            className
          )}
        >
          {data}
        </p>
      </div>
    </Button>
  )
}
