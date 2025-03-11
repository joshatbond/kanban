import { useRef, useState } from 'react'
import invariant from 'tiny-invariant'
import { CancelButton } from '~/app/components/CancelButton'
import { SaveButton } from '~/app/components/SaveButton'

import { Icon } from '../icons/icons'
import { useCreateColumnMutation } from '../queries'

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
        <SaveButton>Save Column</SaveButton>
        <CancelButton onClick={() => setEditing(false)}>Cancel</CancelButton>
      </div>
    </form>
  ) : (
    <button
      onClick={() => {
        setEditing(true)
      }}
      aria-label="Add new column"
      className="bg-opacity-10 hover:bg-opacity-5 ml-2 flex h-16 w-16 flex-shrink-0 justify-center rounded-xl bg-black hover:bg-white"
    >
      <Icon name="plus" size="xl" />
    </button>
  )
}
