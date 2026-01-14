"use client"

import { ReactNode, useState } from "react"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Loader2 } from "lucide-react"

interface ConfirmDialogProps {
    trigger: ReactNode
    title: string
    description: string
    confirmLabel?: string
    cancelLabel?: string
    variant?: "default" | "destructive"
    onConfirm: () => void | Promise<void>
    disabled?: boolean
}

export function ConfirmDialog({
    trigger,
    title,
    description,
    confirmLabel = "Confirm",
    cancelLabel = "Cancel",
    variant = "default",
    onConfirm,
    disabled,
}: ConfirmDialogProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    async function handleConfirm() {
        try {
            setIsLoading(true)
            await onConfirm()
            setIsOpen(false)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
            <AlertDialogTrigger asChild disabled={disabled}>
                {trigger}
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{title}</AlertDialogTitle>
                    <AlertDialogDescription>{description}</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isLoading}>{cancelLabel}</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleConfirm}
                        disabled={isLoading}
                        className={
                            variant === "destructive"
                                ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                : ""
                        }
                    >
                        {isLoading && <Loader2 className="mr-2 size-4 animate-spin" />}
                        {confirmLabel}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}

interface DeleteConfirmDialogProps {
    trigger: ReactNode
    itemName: string
    itemType?: string
    onConfirm: () => void | Promise<void>
    disabled?: boolean
}

export function DeleteConfirmDialog({
    trigger,
    itemName,
    itemType = "item",
    onConfirm,
    disabled,
}: DeleteConfirmDialogProps) {
    return (
        <ConfirmDialog
            trigger={trigger}
            title={`Delete ${itemType}`}
            description={`Are you sure you want to delete "${itemName}"? This action cannot be undone.`}
            confirmLabel="Delete"
            variant="destructive"
            onConfirm={onConfirm}
            disabled={disabled}
        />
    )
}
