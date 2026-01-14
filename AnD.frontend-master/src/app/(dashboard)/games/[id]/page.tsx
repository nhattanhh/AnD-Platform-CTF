"use client"

import { useEffect, useState, use } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  ArrowLeft, Play, Pause, Square, Plus, Trash2,
  Loader2, RefreshCw, Shield, Bug, Users, Clock,
  ChevronRight, AlertTriangle, Edit2
} from "lucide-react"
import { toast } from "sonner"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { api } from "@/lib/api/client"
import type { Game, GameTeam, Vulnbox, Checker, GameStatus } from "@/lib/types"
import type { Team } from "@/lib/types/auth"

function getStatusColor(status: GameStatus): string {
  switch (status) {
    case "running":
      return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
    case "paused":
      return "bg-amber-500/10 text-amber-500 border-amber-500/20"
    case "finished":
      return "bg-slate-500/10 text-slate-400 border-slate-500/20"
    case "deploying":
      return "bg-blue-500/10 text-blue-500 border-blue-500/20"
    default:
      return "bg-slate-500/10 text-slate-400 border-slate-500/20"
  }
}

interface PageProps {
  params: Promise<{ id: string }>
}

export default function GameDetailPage({ params }: PageProps) {
  const { id: gameId } = use(params)
  const router = useRouter()

  const [game, setGame] = useState<Game | null>(null)
  const [teams, setTeams] = useState<GameTeam[]>([])
  const [allTeams, setAllTeams] = useState<Team[]>([])
  const [vulnboxes, setVulnboxes] = useState<Vulnbox[]>([])
  const [checkers, setCheckers] = useState<Checker[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)

  const [isTeamDialogOpen, setIsTeamDialogOpen] = useState(false)
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false)
  const [assignType, setAssignType] = useState<"vulnbox" | "checker">("vulnbox")
  const [newTeamId, setNewTeamId] = useState("")
  const [selectedVulnboxId, setSelectedVulnboxId] = useState("")
  const [selectedCheckerId, setSelectedCheckerId] = useState("")
  const [deleteTeamId, setDeleteTeamId] = useState<string | null>(null)

  function isValidUUID(id: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    return uuidRegex.test(id)
  }

  async function fetchData() {
    if (!isValidUUID(gameId)) {
      router.replace("/games")
      return
    }

    try {
      setIsLoading(true)
      const [gameData, teamsData, vulnboxesData, checkersData, allTeamsData] = await Promise.all([
        api.games.get(gameId),
        api.games.teams.list(gameId),
        api.vulnboxes.list(),
        api.checkers.list(),
        api.teams.list(),
      ])
      setGame(gameData)
      setTeams(teamsData)
      setVulnboxes(vulnboxesData.items)
      setCheckers(checkersData.items)
      setAllTeams(allTeamsData)
    } catch (error) {
      toast.error("Failed to fetch game details")
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (!isValidUUID(gameId)) {
      router.replace("/games")
      return
    }
    fetchData()
  }, [gameId])

  function handleStart() {
    // Show immediate feedback - don't block UI
    toast.loading("Starting game... Deploying containers", { id: `start-${gameId}` })

    // Fire the request in the background
    api.games.start(gameId)
      .then(() => {
        toast.success("Game started successfully", { id: `start-${gameId}` })
        fetchData()
      })
      .catch((error) => {
        const message = error instanceof Error ? error.message : "Failed to start game"
        toast.error(message, { id: `start-${gameId}` })
        console.error(error)
      })
  }

  function handlePause() {
    toast.loading("Pausing game...", { id: `pause-${gameId}` })

    api.games.pause(gameId)
      .then(() => {
        toast.success("Game paused", { id: `pause-${gameId}` })
        fetchData()
      })
      .catch((error) => {
        const message = error instanceof Error ? error.message : "Failed to pause game"
        toast.error(message, { id: `pause-${gameId}` })
        console.error(error)
      })
  }

  function handleStop() {
    toast.loading("Stopping game... Cleaning up containers", { id: `stop-${gameId}` })

    api.games.stop(gameId)
      .then(() => {
        toast.success("Game stopped", { id: `stop-${gameId}` })
        fetchData()
      })
      .catch((error) => {
        const message = error instanceof Error ? error.message : "Failed to stop game"
        toast.error(message, { id: `stop-${gameId}` })
        console.error(error)
      })
  }

  function handleForceStop() {
    toast.loading("Force stopping game... Please wait", { id: `forcestop-${gameId}` })

    api.games.forceStop(gameId)
      .then((result) => {
        toast.success(`Game force stopped: ${result.containers_stopped} containers cleaned up`, { id: `forcestop-${gameId}` })
        fetchData()
      })
      .catch((error) => {
        const message = error instanceof Error ? error.message : "Failed to force stop game"
        toast.error(message, { id: `forcestop-${gameId}` })
        console.error(error)
      })
  }

  async function handleAddTeam() {
    if (!newTeamId) {
      toast.error("Please select a team")
      return
    }

    try {
      setActionLoading(true)
      await api.games.teams.add(gameId, { team_id: newTeamId })
      toast.success("Team added")
      setIsTeamDialogOpen(false)
      setNewTeamId("")
      fetchData()
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to add team"
      toast.error(message)
      console.error(error)
    } finally {
      setActionLoading(false)
    }
  }

  async function handleRemoveTeam() {
    if (!deleteTeamId) return

    try {
      await api.games.teams.remove(gameId, deleteTeamId)
      toast.success("Team removed")
      setDeleteTeamId(null)
      fetchData()
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to remove team"
      toast.error(message)
      console.error(error)
    }
  }

  async function handleAssign() {
    try {
      setActionLoading(true)
      if (assignType === "vulnbox" && selectedVulnboxId) {
        await api.games.assignVulnbox(gameId, selectedVulnboxId)
        toast.success("Vulnbox assigned")
      } else if (assignType === "checker" && selectedCheckerId) {
        await api.games.assignChecker(gameId, selectedCheckerId)
        toast.success("Checker assigned")
      }
      setIsAssignDialogOpen(false)
      fetchData()
    } catch (error) {
      const message = error instanceof Error ? error.message : `Failed to assign ${assignType}`
      toast.error(message)
      console.error(error)
    } finally {
      setActionLoading(false)
    }
  }

  if (isLoading || !game) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/games">
              <ArrowLeft className="size-4" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight">{game.name}</h1>
              <Badge className={getStatusColor(game.status)}>{game.status}</Badge>
            </div>
            {game.description && (
              <p className="text-muted-foreground">{game.description}</p>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={fetchData} disabled={isLoading}>
            <RefreshCw className={`size-4 ${isLoading ? "animate-spin" : ""}`} />
          </Button>
          {game.status === "draft" && (
            <Button onClick={handleStart} disabled={actionLoading}>
              {actionLoading ? <Loader2 className="mr-2 size-4 animate-spin" /> : <Play className="mr-2 size-4" />}
              Start Game
            </Button>
          )}
          {game.status === "running" && (
            <>
              <Button variant="outline" onClick={handlePause} disabled={actionLoading}>
                <Pause className="mr-2 size-4" />
                Pause
              </Button>
              <Button variant="destructive" onClick={handleStop} disabled={actionLoading}>
                <Square className="mr-2 size-4" />
                Stop
              </Button>
            </>
          )}
          {game.status === "paused" && (
            <>
              <Button onClick={handleStart} disabled={actionLoading}>
                <Play className="mr-2 size-4" />
                Resume
              </Button>
              <Button variant="destructive" onClick={handleStop} disabled={actionLoading}>
                <Square className="mr-2 size-4" />
                Stop
              </Button>
            </>
          )}
          {game.status === "deploying" && (
            <Button variant="destructive" onClick={handleForceStop} disabled={actionLoading}>
              {actionLoading ? <Loader2 className="mr-2 size-4 animate-spin" /> : <AlertTriangle className="mr-2 size-4" />}
              Force Stop
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Current Tick</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Clock className="size-4 text-muted-foreground" />
              <span className="text-2xl font-bold">{game.current_tick}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Max Ticks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {game.max_ticks ? (
                <span>{game.current_tick} / {game.max_ticks}</span>
              ) : (
                <span className="text-muted-foreground">∞</span>
              )}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Tick Duration</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{game.tick_duration_seconds}s</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Teams</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Users className="size-4 text-muted-foreground" />
              <span className="text-2xl font-bold">{teams.length}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <Button variant="outline" size="sm" className="w-full" asChild>
              <Link href={`/scoreboard?game=${gameId}`}>
                View Scoreboard
                <ChevronRight className="ml-2 size-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="size-5" />
              Vulnbox
            </CardTitle>
            <CardDescription>
              Vulnerable Docker image for this game
              {game.status !== "draft" && game.vulnbox_path && (
                <span className="ml-2 text-xs text-amber-500">(locked after game starts)</span>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {game.vulnbox_path ? (
              <div className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <p className="font-medium">{game.vulnbox_path.split("/").pop()}</p>
                  <p className="text-xs text-muted-foreground">{game.vulnbox_path}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">Assigned</Badge>
                  {game.status === "draft" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setAssignType("vulnbox")
                        setIsAssignDialogOpen(true)
                      }}
                    >
                      <Edit2 className="mr-1 size-3" />
                      Change
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-6 text-center">
                <Shield className="mb-2 size-8 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">No vulnbox assigned</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onClick={() => {
                    setAssignType("vulnbox")
                    setIsAssignDialogOpen(true)
                  }}
                >
                  Assign Vulnbox
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bug className="size-5" />
              Checker
            </CardTitle>
            <CardDescription>
              SLA checker script for this game
              {game.status !== "draft" && game.checker_module && (
                <span className="ml-2 text-xs text-amber-500">(locked after game starts)</span>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {game.checker_module ? (
              <div className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <p className="font-medium font-mono">{game.checker_module}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">Assigned</Badge>
                  {game.status === "draft" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setAssignType("checker")
                        setIsAssignDialogOpen(true)
                      }}
                    >
                      <Edit2 className="mr-1 size-3" />
                      Change
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-6 text-center">
                <Bug className="mb-2 size-8 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">No checker assigned</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onClick={() => {
                    setAssignType("checker")
                    setIsAssignDialogOpen(true)
                  }}
                >
                  Assign Checker
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Teams</CardTitle>
              <CardDescription>
                {teams.length} team{teams.length !== 1 ? "s" : ""} participating
              </CardDescription>
            </div>
            <Dialog open={isTeamDialogOpen} onOpenChange={setIsTeamDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="mr-2 size-4" />
                  Add Team
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Team</DialogTitle>
                  <DialogDescription>
                    Select a team to add to this game
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                  <Label>Select Team</Label>
                  <Select value={newTeamId} onValueChange={setNewTeamId}>
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Select a team" />
                    </SelectTrigger>
                    <SelectContent>
                      {allTeams
                        .filter(t => !teams.some(gt => gt.team_id === String(t.id)))
                        .map((team) => (
                          <SelectItem key={team.id} value={String(team.id)}>
                            {team.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  {allTeams.filter(t => !teams.some(gt => gt.team_id === String(t.id))).length === 0 && (
                    <p className="text-sm text-muted-foreground mt-2">
                      All teams are already in this game
                    </p>
                  )}
                </div>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline">Cancel</Button>
                  </DialogClose>
                  <Button onClick={handleAddTeam} disabled={actionLoading || !newTeamId}>
                    {actionLoading && <Loader2 className="mr-2 size-4 animate-spin" />}
                    Add Team
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {teams.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Users className="mb-2 size-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">No teams yet</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Team ID</TableHead>
                  <TableHead>Container</TableHead>
                  <TableHead>SSH</TableHead>
                  <TableHead>Password</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {teams.map((team) => (
                  <TableRow key={team.id}>
                    <TableCell className="font-medium">{team.team_name || team.team_id}</TableCell>
                    <TableCell className="font-mono text-xs">
                      {team.container_name || "-"}
                    </TableCell>
                    <TableCell className="text-xs">
                      {team.ssh_port ? (
                        <span className="font-mono">
                          {team.ssh_username}@{team.container_ip}:{team.ssh_port}
                        </span>
                      ) : (
                        "-"
                      )}
                    </TableCell>
                    <TableCell className="text-xs">
                      {team.ssh_port ? (
                        <span className="font-mono">
                          {team.ssh_password}
                        </span>
                      ) : (
                        "-"
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={team.is_active ? "default" : "secondary"}>
                        {team.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteTeamId(team.team_id)}
                      >
                        <Trash2 className="size-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Assign {assignType === "vulnbox" ? "Vulnbox" : "Checker"}
            </DialogTitle>
            <DialogDescription>
              Select a {assignType} to assign to this game
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {assignType === "vulnbox" ? (
              <Select value={selectedVulnboxId} onValueChange={setSelectedVulnboxId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a vulnbox" />
                </SelectTrigger>
                <SelectContent>
                  {vulnboxes.map((v) => (
                    <SelectItem key={v.id} value={v.id}>
                      {v.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <Select value={selectedCheckerId} onValueChange={setSelectedCheckerId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a checker" />
                </SelectTrigger>
                <SelectContent>
                  {checkers.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={handleAssign} disabled={actionLoading}>
              {actionLoading && <Loader2 className="mr-2 size-4 animate-spin" />}
              Assign
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteTeamId} onOpenChange={(open) => !open && setDeleteTeamId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Team</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove team &quot;{deleteTeamId}&quot; from this game?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleRemoveTeam} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
