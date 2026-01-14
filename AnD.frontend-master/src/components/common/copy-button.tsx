"use client"

import { useState } from "react"
import { Check, Copy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface CopyButtonProps {
    text: string
    className?: string
    variant?: "ghost" | "outline" | "default"
    size?: "icon" | "sm" | "default"
}

export function CopyButton({
    text,
    className,
    variant = "ghost",
    size = "icon",
}: CopyButtonProps) {
    const [copied, setCopied] = useState(false)

    async function handleCopy() {
        await navigator.clipboard.writeText(text)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <Button
            variant={variant}
            size={size}
            onClick={handleCopy}
            className={cn("transition-all", className)}
        >
            {copied ? (
                <Check className="size-4 text-emerald-500" />
            ) : (
                <Copy className="size-4" />
            )}
        </Button>
    )
}

interface CopyFieldProps {
    label: string
    value: string
    mono?: boolean
    hidden?: boolean
    className?: string
}

export function CopyField({
    label,
    value,
    mono = false,
    hidden = false,
    className,
}: CopyFieldProps) {
    const [isHidden, setIsHidden] = useState(hidden)
    const [copied, setCopied] = useState(false)

    async function handleCopy() {
        await navigator.clipboard.writeText(value)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <div className={cn("flex items-center justify-between", className)}>
            <div>
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className={cn("text-sm", mono && "font-mono")}>
                    {isHidden ? "••••••••" : value}
                </p>
            </div>
            <div className="flex gap-1">
                {hidden && (
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setIsHidden(!isHidden)}
                    >
                        {isHidden ? (
                            <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                        ) : (
                            <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                            </svg>
                        )}
                    </Button>
                )}
                <Button variant="ghost" size="icon" onClick={handleCopy}>
                    {copied ? (
                        <Check className="size-4 text-emerald-500" />
                    ) : (
                        <Copy className="size-4" />
                    )}
                </Button>
            </div>
        </div>
    )
}
