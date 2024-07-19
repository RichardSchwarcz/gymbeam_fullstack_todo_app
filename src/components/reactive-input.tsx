import React, { useEffect, useRef, useState } from 'react'

import { Input } from './ui/input'

export default function ReactiveInput({
  onMutate,
  placeholder,
}: {
  onMutate: (value: string) => void
  placeholder: string
}) {
  const [inputValue, setInputValue] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    // Automatically focus the input when the component is rendered or conditionally shown
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }, [])

  const submitMutation = () => {
    if (inputValue === '') {
      return
    }
    onMutate(inputValue)
    setInputValue('')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      submitMutation()
    }
  }

  const handleBlur = () => {
    submitMutation()
  }

  return (
    <Input
      ref={inputRef}
      className="border-b border-slate-200"
      placeholder={placeholder}
      type="text"
      value={inputValue}
      onChange={(e) => setInputValue(e.target.value)}
      onKeyDown={handleKeyDown}
      onBlur={handleBlur}
    />
  )
}
