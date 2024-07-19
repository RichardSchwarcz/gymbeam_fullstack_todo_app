import { format } from 'date-fns'
import { Calendar as CalendarIcon } from 'lucide-react'
import {
  Controller,
  type FieldValues,
  type UseControllerProps,
} from 'react-hook-form'

import { Button } from '~/components/ui/button'
import { Calendar } from '~/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '~/components/ui/popover'
import { cn } from '~/lib/utils'

export function DatePicker<T extends FieldValues>(
  props: UseControllerProps<T>
) {
  return (
    <Controller
      control={props.control}
      name={props.name}
      render={({ field }) => (
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={'outline'}
              className={cn(
                'justify-center text-left font-normal',
                !field.value && 'text-muted-foreground'
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {field.value ? (
                format(field.value, 'dd.MM.yyyy')
              ) : (
                <span>Pick a date</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={field.value}
              onSelect={field.onChange}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      )}
    />
  )
}
