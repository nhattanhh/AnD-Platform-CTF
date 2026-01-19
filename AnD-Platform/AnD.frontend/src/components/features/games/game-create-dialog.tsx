"use client"

import { useState } from "react"
import { Plus, Loader2 } from "lucide-react"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
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
import { useGameMutations } from "@/hooks/use-games"

const gameSchema = z.object({
    name: z.string().min(1, "Name is required"),
    description: z.string().optional(),
    tick_duration: z.number().min(10).max(600),
    max_ticks: z.number().min(1).optional().nullable(),
})

type GameFormData = z.infer<typeof gameSchema>

interface GameCreateDialogProps {
    onSuccess?: () => void
}

export function GameCreateDialog({ onSuccess }: GameCreateDialogProps) {
    const [isOpen, setIsOpen] = useState(false)
    const { create, isLoading } = useGameMutations()

    const [name, setName] = useState("")
    const [description, setDescription] = useState("")
    const [tickDuration, setTickDuration] = useState(60)
    const [maxTicks, setMaxTicks] = useState<number | null>(null)

    async function handleSubmit() {
        if (!name.trim()) return

        const result = await create({
            name,
            description: description || undefined,
            tick_duration: tickDuration,
            max_ticks: maxTicks || undefined,
        })

        if (result) {
            setIsOpen(false)
            resetForm()
            onSuccess?.()
        }
    }

    function resetForm() {
        setName("")
        setDescription("")
        setTickDuration(60)
        setMaxTicks(null)
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="mr-2 size-4" />
                    New Game
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Create New Game</DialogTitle>
                    <DialogDescription>
                        Set up a new Attack-Defense CTF competition
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Game Name</Label>
                        <Input
                            id="name"
                            placeholder="CTF 2026"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="description">Description (optional)</Label>
                        <Textarea
                            id="description"
                            placeholder="A brief description of this game..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="tick">Tick Duration (seconds)</Label>
                        <Input
                            id="tick"
                            type="number"
                            min={10}
                            max={600}
                            value={tickDuration}
                            onChange={(e) => setTickDuration(parseInt(e.target.value) || 60)}
                        />
                        <p className="text-xs text-muted-foreground">
                            Time between flag generation cycles (10-600 seconds)
                        </p>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="maxTicks">Max Ticks (optional)</Label>
                        <Input
                            id="maxTicks"
                            type="number"
                            min={1}
                            placeholder="Leave empty for infinite"
                            value={maxTicks ?? ""}
                            onChange={(e) => setMaxTicks(e.target.value ? parseInt(e.target.value) : null)}
                        />
                        <p className="text-xs text-muted-foreground">
                            Game auto-stops after this many ticks. Leave empty for manual stop.
                        </p>
                    </div>
                </div>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="outline">Cancel</Button>
                    </DialogClose>
                    <Button onClick={handleSubmit} disabled={isLoading || !name.trim()}>
                        {isLoading && <Loader2 className="mr-2 size-4 animate-spin" />}
                        Create Game
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
