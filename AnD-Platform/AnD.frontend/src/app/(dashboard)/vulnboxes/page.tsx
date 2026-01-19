"use client"

import { useState, useRef } from "react"
import { Shield, Upload, Trash2, MoreHorizontal, Loader2 } from "lucide-react"

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
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { PageHeader, EmptyState, LoadingState, DeleteConfirmDialog } from "@/components/common"
import { useVulnboxes, useVulnboxMutations } from "@/hooks/use-resources"
import { formatDate } from "@/lib/utils"

export default function VulnboxesPage() {
  const { vulnboxes, total, isLoading, isRefreshing, refresh } = useVulnboxes()
  const { create, remove, isLoading: isMutating, uploadProgress } = useVulnboxMutations()

  const [isDialogOpen, setIsDialogOpen] = useState(false)
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

  async function handleDelete(vulnboxId: string) {
    await remove(vulnboxId)
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
        title="Vulnboxes"
        description="Manage vulnerable Docker images for CTF challenges"
        isRefreshing={isRefreshing}
        onRefresh={refresh}
        actions={
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Upload className="mr-2 size-4" />
                Upload Vulnbox
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Upload Vulnbox</DialogTitle>
                <DialogDescription>
                  Upload a .zip file containing your vulnerable Docker image
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    placeholder="my-vulnbox"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description (optional)</Label>
                  <Textarea
                    id="description"
                    placeholder="A brief description of this vulnbox..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="file">Vulnbox File (.zip)</Label>
                  <Input
                    id="file"
                    type="file"
                    accept=".zip"
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
          <CardTitle>All Vulnboxes</CardTitle>
          <CardDescription>
            {total} vulnbox{total !== 1 ? "es" : ""} available
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <LoadingState variant="spinner" />
          ) : vulnboxes.length === 0 ? (
            <EmptyState
              icon={Shield}
              title="No vulnboxes yet"
              description="Upload your first vulnbox to get started"
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Docker Image</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {vulnboxes.map((vulnbox) => (
                  <TableRow key={vulnbox.id}>
                    <TableCell className="font-medium">{vulnbox.name}</TableCell>
                    <TableCell className="max-w-[200px] truncate text-muted-foreground">
                      {vulnbox.description || "-"}
                    </TableCell>
                    <TableCell>
                      {vulnbox.docker_image ? (
                        <Badge variant="secondary">{vulnbox.docker_image}</Badge>
                      ) : (
                        <Badge variant="outline">Not built</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(vulnbox.created_at)}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                            <DeleteConfirmDialog
                              trigger={
                                <span className="flex items-center w-full text-destructive">
                                  <Trash2 className="mr-2 size-4" />
                                  Delete
                                </span>
                              }
                              itemName={vulnbox.name}
                              itemType="Vulnbox"
                              onConfirm={() => handleDelete(vulnbox.id)}
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
