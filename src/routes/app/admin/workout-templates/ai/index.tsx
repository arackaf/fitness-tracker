import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/app/admin/workout-templates/ai/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/app/admin/workout-templates/ai/"!</div>
}
