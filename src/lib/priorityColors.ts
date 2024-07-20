import { type Priority } from '@prisma/client'

export default function priorityColors(priority: Priority) {
  const priorities = {
    low: '#188c27', //green
    medium: '#eeff00', //yellow
    high: '#ffb300', //orange
    urgent: '#de2e28', //red
  }

  return priorities[priority]
}
