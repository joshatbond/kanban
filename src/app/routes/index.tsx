import { convexQuery } from '@convex-dev/react-query'
import { useSuspenseQuery } from '@tanstack/react-query'
import { Link, createFileRoute } from '@tanstack/react-router'
import { Loader } from '~/app/components/ui/Loader'
import { api } from '~/server/convex/_generated/api'

export const Route = createFileRoute('/')({
  component: Home,
  pendingComponent: () => <Loader />,
})

function Home() {
  const boardsQuery = useSuspenseQuery(convexQuery(api.board.getBoards, {}))

  return (
    <div className="space-y-2 p-8">
      <h1 className="text-2xl font-black">Boards</h1>
      <ul className="flex list-disc flex-wrap">
        {boardsQuery.data.map(board => (
          <li key={board.id} className="ml-4">
            <Link
              to="/boards/$boardId"
              params={{
                boardId: board.id,
              }}
              className="font-bold text-blue-500"
            >
              {board.name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
