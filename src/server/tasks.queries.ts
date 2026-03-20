import { queryOptions } from '@tanstack/react-query'
import { getTasks } from './tasks'

export const tasksQueryOptions = () =>
  queryOptions({
    queryKey: ['tasks'],
    queryFn: () => getTasks(),
  })
