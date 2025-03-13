import { createFileRoute } from '@tanstack/react-router'
import { Board } from '~/app/components/board/Board'
import { Loader } from '~/app/components/ui/Loader'
import { boardQueries } from '~/app/queries'

export const Route = createFileRoute('/_authed/boards/$boardId')({
  component: Home,
  pendingComponent: () => <Loader />,
  loader: async ({ params, context: { queryClient } }) => {
    await queryClient.ensureQueryData(boardQueries.detail(params.boardId))
  },
})

function Home() {
  const { boardId } = Route.useParams()

  return <Board boardId={boardId} />
}
