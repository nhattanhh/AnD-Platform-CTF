"use client"

import Link from "next/link"
import { Gamepad2, Plus, Loader2 } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { PageHeader, EmptyState, LoadingState, GameStatusBadge, DeleteConfirmDialog } from "@/components/common"
import { useAuth } from "@/hooks/use-auth"
import { useGames, useGameMutations } from "@/hooks/use-games"
import { formatDate } from "@/lib/utils"
import { GameCreateDialog } from "@/components/features/games/game-create-dialog"
import { GameActionsMenu } from "@/components/features/games/game-actions-menu"
import { TeamGamesView } from "@/components/features/games/team-games-view"
import type { Game } from "@/lib/types"

function GamesPageContent() {
  const { games, total, isLoading, isRefreshing, refresh } = useGames()
  const mutations = useGameMutations()

  return (
    <div className="space-y-6">
      <PageHeader
        title="Games"
        description="Manage CTF Attack-Defense competitions"
        isRefreshing={isRefreshing}
        onRefresh={refresh}
        actions={<GameCreateDialog onSuccess={refresh} />}
      />

      <Card>
        <CardHeader>
          <CardTitle>All Games</CardTitle>
          <CardDescription>
            {total} game{total !== 1 ? "s" : ""} total
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <LoadingState variant="spinner" />
          ) : games.length === 0 ? (
            <EmptyState
              icon={Gamepad2}
              title="No games yet"
              description="Create your first game to get started"
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Current Tick</TableHead>
                  <TableHead>Max Ticks</TableHead>
                  <TableHead>Tick Duration</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {games.map((game) => (
                  <TableRow key={game.id}>
                    <TableCell>
                      <Link
                        href={`/games/${game.id}`}
                        className="font-medium hover:underline"
                      >
                        {game.name}
                      </Link>
                      {game.description && (
                        <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                          {game.description}
                        </p>
                      )}
                    </TableCell>
                    <TableCell>
                      <GameStatusBadge status={game.status} />
                    </TableCell>
                    <TableCell className="font-mono">
                      {game.current_tick}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {game.max_ticks ?? "∞"}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {game.tick_duration_seconds}s
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(game.created_at)}
                    </TableCell>
                    <TableCell>
                      <GameActionsMenu
                        game={game}
                        mutations={mutations}
                        onSuccess={refresh}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default function GamesPage() {
  const { user } = useAuth()
  const isStaff = user?.role === "ADMIN" || user?.role === "TEACHER"

  if (!user) {
    return <LoadingState variant="spinner" />
  }

  return isStaff ? <GamesPageContent /> : <TeamGamesView />
}
