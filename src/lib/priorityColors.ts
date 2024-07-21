import { type Priority } from '@prisma/client'

export default function priorityColors(priority: Priority, theme: string) {
  const dark = {
    low: '#57a557', // darker green
    medium: '#cfc25e', // muted yellow
    high: '#cc8e4a', // darker orange
    urgent: '#cc4930', // deeper red
  }
  const light = {
    low: '#74d674', //green
    medium: '#fcf47c', //yellow
    high: '#f2ae5a', //orange
    urgent: '#f56545', //red
  }

  return theme === 'dark' ? dark[priority] : light[priority]
}
