import { useRef, useState } from 'react'
import invariant from 'tiny-invariant'

import { useCreateColumnMutation } from '../queries'
import { Button } from './ui/button'
import { Icon } from './ui/icon'

export function NewColumn({
  boardId,
  editInitially,
  onNewColumnAdded,
}: {
  boardId: string
  editInitially: boolean
  onNewColumnAdded: () => void
}) {
  const [editing, setEditing] = useState(editInitially)
  const inputRef = useRef<HTMLInputElement>(null)

  const newColumnMutation = useCreateColumnMutation()

  return editing ? (
    <form
      className="flex max-h-full w-80 flex-shrink-0 flex-col gap-5 overflow-hidden rounded-xl border bg-slate-100 p-2 shadow"
      onSubmit={event => {
        event.preventDefault()
        invariant(inputRef.current, 'missing input ref')

        newColumnMutation.mutate({
          boardId,
          name: inputRef.current.value,
        })

        inputRef.current.value = ''

        onNewColumnAdded()
      }}
      onBlur={event => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          setEditing(false)
        }
      }}
    >
      <input
        autoFocus
        required
        ref={inputRef}
        type="text"
        name="columnName"
        autoComplete="off"
        className="w-full rounded-lg border border-slate-400 px-2 py-1 font-medium text-black"
      />

      <div className="flex justify-between">
        <Button>Save Column</Button>

        <Button variant="outline" onClick={() => setEditing(false)}>
          Cancel
        </Button>
      </div>
    </form>
  ) : (
    <Button
      onClick={() => setEditing(true)}
      aria-label="Add new column"
      className="bg-opacity-10 hover:bg-opacity-5 ml-2 flex size-16 flex-shrink-0 justify-center rounded-xl bg-black hover:bg-white"
    >
      <Icon name="plus" size="xl" />
    </Button>
  )
}
