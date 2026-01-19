"use client"

import { useState, useRef } from "react"
import { Bug, Upload, Trash2, MoreHorizontal, Loader2, CheckCircle } from "lucide-react"
import { toast } from "sonner"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
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
import { PageHeader, EmptyState, LoadingState, DeleteConfirmDialog } from "@/components/common"
import { useCheckers, useCheckerMutations } from "@/hooks/use-resources"
import { api } from "@/lib/api/client"
import { formatDate } from "@/lib/utils"

export default function CheckersPage() {
  const { checkers, total, isLoading, isRefreshing, refresh } = useCheckers()
  const { create, remove, isLoading: isMutating } = useCheckerMutations()

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [validatingId, setValidatingId] = useState<string | null>(null)
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  async function handleUpload() {
    if (!name.trim() || !file) return

    const result = await create(name, file, description || undefined)
    if (result) {
      setIsDialogOpen(false)
      resetForm()
      refresh()
    }
  }

  async function handleValidate(checkerId: string) {
    try {
      setValidatingId(checkerId)
      const result = await api.checkers.validate(checkerId)
      if (result.valid) {
        toast.success("Checker is valid", { description: result.message })
      } else {
        toast.error("Checker validation failed", { description: result.message })
      }
    } catch (error) {
      toast.error("Failed to validate checker")
    } finally {
      setValidatingId(null)
    }
  }

  async function handleDelete(checkerId: string) {
    await remove(checkerId)
    refresh()
  }

  function resetForm() {
    setName("")
    setDescription("")
    setFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Checkers"
        description="Manage SLA checker scripts for CTF services"
        isRefreshing={isRefreshing}
        onRefresh={refresh}
        actions={
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Upload className="mr-2 size-4" />
                Upload Checker
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Upload Checker</DialogTitle>
                <DialogDescription>
                  Upload a Python checker script for SLA checks
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    placeholder="my-checker"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description (optional)</Label>
                  <Textarea
                    id="description"
                    placeholder="A brief description of this checker..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="file">Checker File (.py)</Label>
                  <Input
                    id="file"
                    type="file"
                    accept=".py"
                    ref={fileInputRef}
                    onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                  />
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DialogClose>
                <Button onClick={handleUpload} disabled={isMutating || !name.trim() || !file}>
                  {isMutating && <Loader2 className="mr-2 size-4 animate-spin" />}
                  Upload
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>All Checkers</CardTitle>
          <CardDescription>
            {total} checker{total !== 1 ? "s" : ""} available
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <LoadingState variant="spinner" />
          ) : checkers.length === 0 ? (
            <EmptyState
              icon={Bug}
              title="No checkers yet"
              description="Upload your first checker script to get started"
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Module</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {checkers.map((checker) => (
                  <TableRow key={checker.id}>
                    <TableCell className="font-medium">{checker.name}</TableCell>
                    <TableCell className="max-w-[200px] truncate text-muted-foreground">
                      {checker.description || "-"}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="font-mono text-xs">
                        {checker.module_name}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(checker.created_at)}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => handleValidate(checker.id)}
                            disabled={validatingId === checker.id}
                          >
                            {validatingId === checker.id ? (
                              <Loader2 className="mr-2 size-4 animate-spin" />
                            ) : (
                              <CheckCircle className="mr-2 size-4" />
                            )}
                            Validate
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                            <DeleteConfirmDialog
                              trigger={
                                <span className="flex items-center w-full text-destructive">
                                  <Trash2 className="mr-2 size-4" />
                                  Delete
                                </span>
                              }
                              itemName={checker.name}
                              itemType="Checker"
                              onConfirm={() => handleDelete(checker.id)}
                            />
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
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
