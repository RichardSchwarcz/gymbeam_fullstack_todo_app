import React from 'react'
import useMediaQuery from '~/hooks/useMediaQuery'
import { cn } from '~/lib/utils'

export default function SidebarContainer({
  children,
}: {
  children: React.ReactNode
}) {
  const isLargeScreen = useMediaQuery('(min-width: 1280px)')
  return (
    <div
      className={cn(
        'scrollbar-thin flex flex-col justify-between rounded-3xl bg-card p-4',
        isLargeScreen
          ? 'min-h-[calc(100vh-2rem)] border shadow'
          : 'h-screen overflow-y-scroll'
      )}
    >
      {children}
    </div>
  )
}
