import { useState } from "react"
import { createFileRoute } from '@tanstack/react-router'
import { GigList } from "@/components/features/gigs/gig-list"
import { useGigs } from '@/hooks/useGigs'
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useDebouncer } from '@tanstack/react-pacer'
import { GigStatus } from "@/types/gig"
import { Search } from "lucide-react"

// Note: Trailing slash is important for index route of a layout
export const Route = createFileRoute('/dashboard/')({
  component: DashboardPage,
})

function DashboardPage() {
  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [status, setStatus] = useState<string>("ALL")

  const debouncer = useDebouncer(
    (value: string) => setDebouncedSearch(value),
    { wait: 500 }
  )

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearch(value)
    debouncer.maybeExecute(value)
  }

  const {
    data,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  } = useGigs({
    search: debouncedSearch || undefined,
    status: status === "ALL" ? undefined : status as GigStatus
  })

  const gigList = data?.pages.flatMap((page) => page.gigs) || []

  return (
    <div className="mx-auto max-w-7xl animate-in fade-in slide-in-from-bottom-4 duration-700 ease-in-out">
      <div className="mb-6 md:mb-8 space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Public Gigs</h2>

          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
            <div className="relative w-full md:w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search gigs..."
                value={search}
                onChange={handleSearchChange}
                className="pl-8"
              />
            </div>

            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Status</SelectItem>
                <SelectItem value={GigStatus.OPEN}>Open</SelectItem>
                <SelectItem value={GigStatus.ASSIGNED}>Assigned</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {isLoading ? (
          <div className="flex h-full items-center justify-center min-h-[50vh]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : isError ? (
          <div className="flex h-full items-center justify-center min-h-[50vh] text-red-500">
            Error loading dashboard data. Please try again.
          </div>
        ) : (
          <GigList
            gigs={gigList}
            onLoadMore={() => fetchNextPage()}
            hasNextPage={hasNextPage}
            isFetchingNextPage={isFetchingNextPage}
          />
        )}
      </div>
    </div>
  )
}
