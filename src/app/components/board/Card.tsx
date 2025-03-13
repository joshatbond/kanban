import { type ComponentProps, useState } from 'react'
import invariant from 'tiny-invariant'
import { Icon } from '~/components/ui/icon'
import { deleteItemSchema } from '~/server/db/schema'

import { useDeleteCardMutation, useUpdateCardMutation } from '../../queries'
import { CONTENT_TYPES } from '../../types'

export function Card(
  props: ComponentProps<'li'> & {
    columnId: string
    id: string
    boardId: string
    order: number
    nextOrder: number
    previousOrder: number
  }
) {
  const [acceptDrop, acceptDropAssign] = useState<'none' | 'top' | 'bottom'>(
    'none'
  )
  const deleteCard = useDeleteCardMutation()
  const moveCard = useUpdateCardMutation()

  return (
    <li
      ref={props.ref}
      onDragOver={event => {
        if (event.dataTransfer.types.includes(CONTENT_TYPES.card)) {
          event.preventDefault()
          event.stopPropagation()
          const rect = event.currentTarget.getBoundingClientRect()
          const midpoint = (rect.top + rect.bottom) / 2
          acceptDropAssign(event.clientY <= midpoint ? 'top' : 'bottom')
        }
      }}
      onDragLeave={() => {
        acceptDropAssign('none')
      }}
      onDrop={event => {
        event.stopPropagation()

        const transfer = JSON.parse(
          event.dataTransfer.getData(CONTENT_TYPES.card) || 'null'
        )

        if (!transfer) {
          return
        }

        invariant(transfer.id, 'missing cardId')
        invariant(transfer.title, 'missing title')

        const droppedOrder =
          acceptDrop === 'top' ? props.previousOrder : props.nextOrder
        const moveOrder = (droppedOrder + props.order) / 2

        moveCard.mutate({
          order: moveOrder,
          columnId: props.columnId,
          boardId: props.boardId,
          id: transfer.id,
          title: transfer.title,
        })

        acceptDropAssign('none')
      }}
      className={
        '-mb-[2px] cursor-grab border-t-2 border-b-2 px-2 py-1 last:mb-0 active:cursor-grabbing ' +
        (acceptDrop === 'top'
          ? 'border-t-red-500 border-b-transparent'
          : acceptDrop === 'bottom'
            ? 'border-t-transparent border-b-red-500'
            : 'border-t-transparent border-b-transparent')
      }
    >
      <div
        draggable
        className="relative w-full rounded-lg border-slate-300 bg-white px-2 py-1 text-sm shadow shadow-slate-300"
        onDragStart={event => {
          event.dataTransfer.effectAllowed = 'move'
          event.dataTransfer.setData(
            CONTENT_TYPES.card,
            JSON.stringify({ id: props.id, title: props.title })
          )
          event.stopPropagation()
        }}
      >
        <h3>{props.title}</h3>

        <div className="mt-2">{props.content ?? <>&nbsp;</>}</div>
        <form
          onSubmit={event => {
            event.preventDefault()

            deleteCard.mutate(
              deleteItemSchema.parse({
                id: props.id,
                boardId: props.boardId,
              })
            )
          }}
        >
          <button
            aria-label="Delete card"
            className="absolute top-4 right-4 flex items-center gap-2 hover:text-red-500"
            type="submit"
          >
            <div className="text-xs opacity-50">{props.order}</div>
            <Icon name="trash" />
          </button>
        </form>
      </div>
    </li>
  )
}
