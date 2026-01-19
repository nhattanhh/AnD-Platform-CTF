import { NextRequest, NextResponse } from "next/server"

// Server-only environment variable (NOT exposed to browser)
const API_BASE = process.env.API_URL ?? "http://localhost:8080"

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ path: string[] }> }
) {
    const { path } = await params
    const pathStr = "/api/" + path.join("/")
    const url = new URL(request.url)
    const queryString = url.search

    try {
        const headers: Record<string, string> = {
            "Content-Type": "application/json",
        }

        // Forward Authorization header if present
        const authHeader = request.headers.get("Authorization")
        if (authHeader) {
            headers["Authorization"] = authHeader
        }

        const response = await fetch(`${API_BASE}${pathStr}${queryString}`, {
            headers,
        })

        // Handle empty responses
        const text = await response.text()
        if (!text) {
            return NextResponse.json(null, { status: response.status })
        }

        try {
            const data = JSON.parse(text)
            return NextResponse.json(data, { status: response.status })
        } catch {
            // If response is not JSON, return as-is
            return new NextResponse(text, { status: response.status })
        }
    } catch (error) {
        console.error("API proxy error:", error)
        return NextResponse.json(
            { detail: "Failed to connect to backend" },
            { status: 502 }
        )
    }
}

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ path: string[] }> }
) {
    const { path } = await params
    const pathStr = "/api/" + path.join("/")
    const url = new URL(request.url)
    const queryString = url.search

    console.log("POST catch-all:", { path, pathStr, queryString })

    try {
        const contentType = request.headers.get("content-type") || ""
        let body: BodyInit | undefined
        const headers: Record<string, string> = {}

        // Forward Authorization header if present
        const authHeader = request.headers.get("Authorization")
        if (authHeader) {
            headers["Authorization"] = authHeader
        }

        if (contentType.includes("multipart/form-data")) {
            // Forward FormData for file uploads
            body = await request.formData()
        } else {
            // Forward JSON body
            const text = await request.text()
            body = text || undefined
            headers["Content-Type"] = "application/json"
        }

        const response = await fetch(`${API_BASE}${pathStr}${queryString}`, {
            method: "POST",
            headers,
            body,
        })

        console.log("POST response:", { status: response.status, url: `${API_BASE}${pathStr}${queryString}` })

        // Handle empty responses
        const responseText = await response.text()
        if (!responseText) {
            return NextResponse.json(null, { status: response.status })
        }

        try {
            const data = JSON.parse(responseText)
            return NextResponse.json(data, { status: response.status })
        } catch {
            return new NextResponse(responseText, { status: response.status })
        }
    } catch (error) {
        console.error("API proxy error:", error)
        return NextResponse.json(
            { detail: "Failed to connect to backend" },
            { status: 502 }
        )
    }
}

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ path: string[] }> }
) {
    const { path } = await params
    const pathStr = "/api/" + path.join("/")
    const url = new URL(request.url)
    const queryString = url.search

    try {
        const text = await request.text()

        const headers: Record<string, string> = {
            "Content-Type": "application/json",
        }

        // Forward Authorization header if present
        const authHeader = request.headers.get("Authorization")
        if (authHeader) {
            headers["Authorization"] = authHeader
        }

        const response = await fetch(`${API_BASE}${pathStr}${queryString}`, {
            method: "PATCH",
            headers,
            body: text || undefined,
        })

        // Handle empty responses
        const responseText = await response.text()
        if (!responseText) {
            return NextResponse.json(null, { status: response.status })
        }

        try {
            const data = JSON.parse(responseText)
            return NextResponse.json(data, { status: response.status })
        } catch {
            return new NextResponse(responseText, { status: response.status })
        }
    } catch (error) {
        console.error("API proxy error:", error)
        return NextResponse.json(
            { detail: "Failed to connect to backend" },
            { status: 502 }
        )
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ path: string[] }> }
) {
    const { path } = await params
    const pathStr = "/api/" + path.join("/")
    const url = new URL(request.url)
    const queryString = url.search

    try {
        const headers: Record<string, string> = {
            "Content-Type": "application/json",
        }

        // Forward Authorization header if present
        const authHeader = request.headers.get("Authorization")
        if (authHeader) {
            headers["Authorization"] = authHeader
        }

        const response = await fetch(`${API_BASE}${pathStr}${queryString}`, {
            method: "DELETE",
            headers,
        })

        // Handle empty responses
        const responseText = await response.text()
        if (!responseText) {
            return NextResponse.json(null, { status: response.status })
        }

        try {
            const data = JSON.parse(responseText)
            return NextResponse.json(data, { status: response.status })
        } catch {
            return new NextResponse(responseText, { status: response.status })
        }
    } catch (error) {
        console.error("API proxy error:", error)
        return NextResponse.json(
            { detail: "Failed to connect to backend" },
            { status: 502 }
        )
    }
}
