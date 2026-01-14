"use client"

import { useState } from "react"
import { Plus, Loader2, Check, Copy, Eye, EyeOff } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
import { useTeamMutations } from "@/hooks/use-teams"
import type { TeamCreateResponse } from "@/lib/types/auth"

interface TeamCreateDialogProps {
    onSuccess?: () => void
}

export function TeamCreateDialog({ onSuccess }: TeamCreateDialogProps) {
    const [isOpen, setIsOpen] = useState(false)
    const { create, isLoading } = useTeamMutations()

    // Form state
    const [name, setName] = useState("")
    const [country, setCountry] = useState("")
    const [affiliation, setAffiliation] = useState("")

    // Credentials display
    const [createdTeam, setCreatedTeam] = useState<TeamCreateResponse | null>(null)
    const [showPassword, setShowPassword] = useState(false)
    const [copiedField, setCopiedField] = useState<string | null>(null)

    async function handleSubmit() {
        if (!name.trim()) return

        const result = await create({
            name,
            country: country || undefined,
            affiliation: affiliation || undefined,
        })

        if (result) {
            setCreatedTeam(result)
            resetForm()
        }
    }

    function resetForm() {
        setName("")
        setCountry("")
        setAffiliation("")
    }

    function handleClose() {
        setIsOpen(false)
        setCreatedTeam(null)
        setShowPassword(false)
        onSuccess?.()
    }

    async function copyToClipboard(text: string, field: string) {
        await navigator.clipboard.writeText(text)
        setCopiedField(field)
        setTimeout(() => setCopiedField(null), 2000)
    }

    return (
        <Dialog open={isOpen} onOpenChange={(open) => {
            setIsOpen(open)
            if (!open) {
                setCreatedTeam(null)
                setShowPassword(false)
            }
        }}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="mr-2 size-4" />
                    Add Team
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                {createdTeam ? (
                    <>
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                <Check className="size-5 text-emerald-500" />
                                Team Created
                            </DialogTitle>
                            <DialogDescription>
                                Save these credentials - the password cannot be retrieved later.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="rounded-lg border bg-muted/50 p-4 space-y-3">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs text-muted-foreground">Team Name</p>
                                        <p className="font-medium">{createdTeam.name}</p>
                                    </div>
                                </div>
                                {createdTeam.username && (
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-xs text-muted-foreground">Username</p>
                                            <p className="font-mono">{createdTeam.username}</p>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => copyToClipboard(createdTeam.username!, "username")}
                                        >
                                            {copiedField === "username" ? (
                                                <Check className="size-4 text-emerald-500" />
                                            ) : (
                                                <Copy className="size-4" />
                                            )}
                                        </Button>
                                    </div>
                                )}
                                {createdTeam.generatedPassword && (
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-xs text-muted-foreground">Password</p>
                                            <p className="font-mono">
                                                {showPassword ? createdTeam.generatedPassword : "••••••••••••"}
                                            </p>
                                        </div>
                                        <div className="flex gap-1">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => setShowPassword(!showPassword)}
                                            >
                                                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => copyToClipboard(createdTeam.generatedPassword!, "password")}
                                            >
                                                {copiedField === "password" ? (
                                                    <Check className="size-4 text-emerald-500" />
                                                ) : (
                                                    <Copy className="size-4" />
                                                )}
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                        <DialogFooter>
                            <Button onClick={handleClose}>Done</Button>
                        </DialogFooter>
                    </>
                ) : (
                    <>
                        <DialogHeader>
                            <DialogTitle>Add New Team</DialogTitle>
                            <DialogDescription>
                                Create a new team. Credentials will be auto-generated.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="teamName">Team Name *</Label>
                                <Input
                                    id="teamName"
                                    placeholder="Team Alpha"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="country">Country</Label>
                                <Input
                                    id="country"
                                    placeholder="Vietnam"
                                    value={country}
                                    onChange={(e) => setCountry(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="affiliation">Affiliation</Label>
                                <Input
                                    id="affiliation"
                                    placeholder="University of Technology"
                                    value={affiliation}
                                    onChange={(e) => setAffiliation(e.target.value)}
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <DialogClose asChild>
                                <Button variant="outline">Cancel</Button>
                            </DialogClose>
                            <Button onClick={handleSubmit} disabled={isLoading || !name.trim()}>
                                {isLoading && <Loader2 className="mr-2 size-4 animate-spin" />}
                                Create Team
                            </Button>
                        </DialogFooter>
                    </>
                )}
            </DialogContent>
        </Dialog>
    )
}
