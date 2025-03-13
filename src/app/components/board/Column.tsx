import { ComponentProps, useCallback, useMemo, useRef, useState } from 'react'
import { flushSync } from 'react-dom'
import { twMerge } from 'tailwind-merge'
import invariant from 'tiny-invariant'
import {
  useDeleteColumnMutation,
  useUpdateCardMutation,
  useUpdateColumnMutation,
} from '~/app/queries'
import { CONTENT_TYPES } from '~/app/types'
import type { RenderedItem } from '~/app/types'
import { EditableText } from '~/components/ui/EditableText'
import { Icon } from '~/components/ui/icon'

import { Card } from './Card'
import { NewCard } from './NewCard'

export function Column(
  props: ComponentProps<'div'> & {
    name: string
    boardId: string
    columnId: string
    items: Array<RenderedItem>
    nextOrder: number
    previousOrder: number
    order: number
  }
) {
  const [acceptCardDrop, acceptCardDropAssign] = useState(false)
  const editState = useState(false)

  const [acceptColumnDrop, aceeptColumnDropAssign] = useState<
    'none' | 'left' | 'right'
  >('none')

  const [edit, setEdit] = useState(false)

  const itemRef = useCallback((node: HTMLElement | null) => {
    node?.scrollIntoView({
      block: 'nearest',
    })
  }, [])

  const listRef = useRef<HTMLUListElement>(null!)

  function scrollList() {
    invariant(listRef.current)
    listRef.current.scrollTop = listRef.current.scrollHeight
  }

  const updateColumnMutation = useUpdateColumnMutation()
  const deleteColumnMutation = useDeleteColumnMutation()
  const updateCardMutation = useUpdateCardMutation()

  const sortedItems = useMemo(
    () => [...props.items].sort((a, b) => a.order - b.order),
    [props.items]
  )

  const cardDndProps = {
    onDragOver: (event: React.DragEvent) => {
      if (event.dataTransfer.types.includes(CONTENT_TYPES.card)) {
        event.preventDefault()
        acceptCardDropAssign(true)
      }
    },
    onDragLeave: () => {
      acceptCardDropAssign(false)
    },
    onDrop: (event: React.DragEvent) => {
      const transfer = JSON.parse(
        event.dataTransfer.getData(CONTENT_TYPES.card) || 'null'
      )

      if (!transfer) {
        return
      }

      invariant(transfer.id, 'missing transfer.id')
      invariant(transfer.title, 'missing transfer.title')

      updateCardMutation.mutate({
        order: (sortedItems[sortedItems.length - 1]?.order ?? 0) + 1,
        columnId: props.columnId,
        boardId: props.boardId,
        id: transfer.id,
        title: transfer.title,
      })

      acceptCardDropAssign(false)
    },
  }

  return (
    <div
      ref={props.ref}
      onDragOver={(event: React.DragEvent) => {
        if (event.dataTransfer.types.includes(CONTENT_TYPES.column)) {
          event.preventDefault()
          event.stopPropagation()
          const rect = event.currentTarget.getBoundingClientRect()
          const midpoint = (rect.left + rect.right) / 2
          aceeptColumnDropAssign(event.clientX <= midpoint ? 'left' : 'right')
        }
      }}
      onDragLeave={() => {
        aceeptColumnDropAssign('none')
      }}
      onDrop={(event: React.DragEvent) => {
        const transfer = JSON.parse(
          event.dataTransfer.getData(CONTENT_TYPES.column) || 'null'
        )

        if (!transfer) {
          return
        }

        invariant(transfer.id, 'missing transfer.id')

        const droppedOrder =
          acceptColumnDrop === 'left' ? props.previousOrder : props.nextOrder
        const moveOrder = (droppedOrder + props.order) / 2

        updateColumnMutation.mutate({
          boardId: props.boardId,
          id: transfer.id,
          order: moveOrder,
        })

        aceeptColumnDropAssign('none')
      }}
      className={twMerge(
        '-mr-[2px] flex max-h-full flex-shrink-0 cursor-grab flex-col border-r-2 border-l-2 border-r-transparent border-l-transparent px-2 last:mr-0 active:cursor-grabbing',
        acceptColumnDrop === 'left'
          ? 'border-r-transparent border-l-red-500'
          : acceptColumnDrop === 'right'
            ? 'border-r-red-500 border-l-transparent'
            : ''
      )}
    >
      <div
        draggable={!editState[0]}
        onDragStart={(event: React.DragEvent) => {
          event.dataTransfer.effectAllowed = 'move'
          event.dataTransfer.setData(
            CONTENT_TYPES.column,
            JSON.stringify({ id: props.columnId, name })
          )
        }}
        {...(!props.items.length ? cardDndProps : {})}
        className={twMerge(
          'relative flex max-h-full w-80 flex-shrink-0 flex-col rounded-xl border-slate-400 bg-slate-100 shadow-sm shadow-slate-400',
          acceptCardDrop && `outline-2 outline-red-500`
        )}
      >
        <div className="p-2" {...(props.items.length ? cardDndProps : {})}>
          <EditableText
            fieldName="name"
            editState={editState}
            value={
              // optimistic update
              updateColumnMutation.isPending &&
              updateColumnMutation.variables.name
                ? updateColumnMutation.variables.name
                : props.name
            }
            inputLabel="Edit column name"
            buttonLabel={`Edit column "${name}" name`}
            inputClassName="border border-slate-400 w-full rounded-lg py-1 px-2 font-medium text-black"
            buttonClassName="block rounded-lg text-left w-full border border-transparent py-1 px-2 font-medium text-slate-600"
            onChange={value => {
              updateColumnMutation.mutate({
                boardId: props.boardId,
                id: props.columnId,
                name: value,
              })
            }}
          />
        </div>

        <ul ref={listRef} className="flex-grow overflow-auto">
          {sortedItems.map((item, index, items) => (
            <Card
              ref={itemRef}
              key={item.id}
              title={item.title}
              content={item.content ?? ''}
              id={item.id}
              boardId={props.boardId}
              order={item.order}
              columnId={props.columnId}
              previousOrder={items[index - 1] ? items[index - 1].order : 0}
              nextOrder={
                items[index + 1] ? items[index + 1].order : item.order + 1
              }
            />
          ))}
        </ul>
        {edit ? (
          <NewCard
            columnId={props.columnId}
            boardId={props.boardId}
            nextOrder={
              props.items.length === 0
                ? 1
                : props.items[props.items.length - 1].order + 1
            }
            onComplete={() => setEdit(false)}
          />
        ) : (
          <div className="p-2" {...(props.items.length ? cardDndProps : {})}>
            <button
              type="button"
              onClick={() => {
                flushSync(() => {
                  setEdit(true)
                })
                scrollList()
              }}
              className="flex w-full items-center gap-2 rounded-lg p-2 text-left font-medium text-slate-500 hover:bg-slate-200 focus:bg-slate-200"
            >
              <Icon name="plus" /> Add a card
            </button>
          </div>
        )}
        <form
          onSubmit={event => {
            event.preventDefault()

            deleteColumnMutation.mutate({
              id: props.columnId,
              boardId: props.boardId,
            })
          }}
        >
          <button
            aria-label="Delete column"
            className="absolute top-4 right-4 flex items-center gap-2 hover:text-red-500"
            type="submit"
          >
            <Icon name="trash" />
          </button>
        </form>
      </div>
    </div>
  )
}
