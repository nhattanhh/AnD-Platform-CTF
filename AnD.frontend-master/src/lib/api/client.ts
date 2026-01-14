import type {
  Game,
  GameCreate,
  GameUpdate,
  GameListResponse,
  GameTeam,
  GameTeamAdd,
  Vulnbox,
  VulnboxUpdate,
  VulnboxListResponse,
  Checker,
  CheckerUpdate,
  CheckerListResponse,
  ValidateResponse,
  Tick,
  TickListResponse,
  Flag,
  FlagListResponse,
  FlagStats,
  FlagSubmit,
  SubmissionResponse,
  SubmissionDetail,
  SubmissionListResponse,
  ScoreboardResponse,
  ScoreboardEntry,
  ServiceStatus,
  ServiceStatusListResponse,
  DeleteResponse,
  PaginationParams,
  SubmissionStatus,
} from "@/lib/types"
import type { JwtResponse, User, LoginRequest, SignupRequest, Team, CreateTeamRequest, TeamCreateResponse, UserListItem } from "@/lib/types/auth"

// Proxy through Next.js API routes to hide backend URL from browser
const API_BASE = "/api"

// Get auth token from localStorage
function getAuthToken(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem("auth_token")
}

async function fetchApi<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...options?.headers as Record<string, string>,
  }

  // Add Authorization header if token exists
  const token = getAuthToken()
  if (token) {
    headers["Authorization"] = `Bearer ${token}`
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  })

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({ error: "Unknown error" }))
    // Wrapper returns errors in 'error' field, which may be a JSON string or plain message
    let errorMessage = errorBody.error || errorBody.detail || `HTTP ${response.status}`

    // Try to parse nested JSON in error field (e.g., {"detail":"..."} )
    if (typeof errorMessage === 'string' && errorMessage.startsWith('{')) {
      try {
        const parsed = JSON.parse(errorMessage)
        errorMessage = parsed.detail || parsed.error || errorMessage
      } catch {
        // Keep original message if parsing fails
      }
    }

    throw new Error(errorMessage)
  }

  return response.json()
}

async function fetchFormData<T>(
  endpoint: string,
  formData: FormData
): Promise<T> {
  const headers: Record<string, string> = {}

  // Add Authorization header if token exists
  const token = getAuthToken()
  if (token) {
    headers["Authorization"] = `Bearer ${token}`
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    method: "POST",
    body: formData,
    headers,
  })

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({ error: "Unknown error" }))
    // Wrapper returns errors in 'error' field, which may be a JSON string or plain message
    let errorMessage = errorBody.error || errorBody.detail || `HTTP ${response.status}`

    // Try to parse nested JSON in error field (e.g., {"detail":"..."} )
    if (typeof errorMessage === 'string' && errorMessage.startsWith('{')) {
      try {
        const parsed = JSON.parse(errorMessage)
        errorMessage = parsed.detail || parsed.error || errorMessage
      } catch {
        // Keep original message if parsing fails
      }
    }

    throw new Error(errorMessage)
  }

  return response.json()
}

export const api = {
  auth: {
    signin: (data: LoginRequest) =>
      fetchApi<JwtResponse>("/auth/signin", {
        method: "POST",
        body: JSON.stringify(data),
      }),

    signup: (data: SignupRequest) =>
      fetchApi<void>("/auth/signup", {
        method: "POST",
        body: JSON.stringify(data),
      }),

    me: () =>
      fetchApi<User>("/auth/me"),
  },

  users: {
    list: (params?: PaginationParams & { role?: string; teamId?: string }) =>
      fetchApi<UserListItem[]>(`/users?${params?.role ? `role=${params.role}&` : ""}${params?.teamId ? `teamId=${params.teamId}&` : ""}skip=${params?.skip ?? 0}&limit=${params?.limit ?? 100}`),

    get: (userId: number) =>
      fetchApi<UserListItem>(`/users/${userId}`),

    getUnassigned: () =>
      fetchApi<UserListItem[]>(`/users/unassigned`),

    assignTeam: (userId: number, teamId: string) =>
      fetchApi<{ success: boolean; message: string }>(`/users/${userId}/assign-team?teamId=${teamId}`, {
        method: "POST",
      }),

    removeTeam: (userId: number) =>
      fetchApi<{ success: boolean; message: string }>(`/users/${userId}/remove-team`, {
        method: "DELETE",
      }),

    update: (userId: number, data: { displayName?: string; affiliation?: string; teamId?: string | null; role?: string }) =>
      fetchApi<UserListItem>(`/users/${userId}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      }),

    delete: (userId: number) =>
      fetchApi<{ success: boolean; message: string }>(`/users/${userId}`, {
        method: "DELETE",
      }),

    create: (data: { username: string; password: string; displayName?: string; role?: string; affiliation?: string; teamId?: string }) =>
      fetchApi<{ success: boolean; message: string; user: UserListItem }>(`/users`, {
        method: "POST",
        body: JSON.stringify(data),
      }),
  },

  teams: {
    list: (params?: PaginationParams) =>
      fetchApi<Team[]>(`/teams?skip=${params?.skip ?? 0}&limit=${params?.limit ?? 100}`),

    get: (teamId: string) =>
      fetchApi<Team>(`/teams/${teamId}`),

    create: (data: CreateTeamRequest) =>
      fetchApi<TeamCreateResponse>("/teams", {
        method: "POST",
        body: JSON.stringify(data),
      }),

    update: (teamId: string, data: Partial<Team>) =>
      fetchApi<Team>(`/teams/${teamId}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      }),

    delete: (teamId: string) =>
      fetchApi<DeleteResponse>(`/teams/${teamId}`, { method: "DELETE" }),

    getMembers: (teamId: string) =>
      fetchApi<UserListItem[]>(`/teams/${teamId}/members`),
  },

  games: {
    list: (params?: PaginationParams) =>
      fetchApi<GameListResponse>(`/proxy/games?skip=${params?.skip ?? 0}&limit=${params?.limit ?? 100}`),

    get: (gameId: string) =>
      fetchApi<Game>(`/proxy/games/${gameId}`),

    create: (data: GameCreate) =>
      fetchApi<Game>("/proxy/games", {
        method: "POST",
        body: JSON.stringify(data),
      }),

    update: (gameId: string, data: GameUpdate) =>
      fetchApi<Game>(`/proxy/games/${gameId}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      }),

    delete: (gameId: string) =>
      fetchApi<DeleteResponse>(`/proxy/games/${gameId}`, { method: "DELETE" }),

    start: (gameId: string) =>
      fetchApi<void>(`/proxy/games/${gameId}/start`, { method: "POST" }),

    pause: (gameId: string) =>
      fetchApi<void>(`/proxy/games/${gameId}/pause`, { method: "POST" }),

    stop: (gameId: string) =>
      fetchApi<void>(`/proxy/games/${gameId}/stop`, { method: "POST" }),

    forceStop: (gameId: string) =>
      fetchApi<{ message: string; containers_stopped: number; image_removed: boolean; new_status: string }>(`/proxy/games/${gameId}/force-stop`, { method: "POST" }),

    assignVulnbox: (gameId: string, vulnboxId: string) =>
      fetchApi<Game>(`/proxy/games/${gameId}/assign-vulnbox?vulnboxId=${vulnboxId}`, { method: "POST" }),

    assignChecker: (gameId: string, checkerId: string) =>
      fetchApi<Game>(`/proxy/games/${gameId}/assign-checker?checkerId=${checkerId}`, { method: "POST" }),

    teams: {
      list: (gameId: string) =>
        fetchApi<GameTeam[]>(`/proxy/games/${gameId}/teams`),

      get: (gameId: string, teamId: string) =>
        fetchApi<GameTeam>(`/proxy/games/${gameId}/teams/${teamId}`),

      add: (gameId: string, data: GameTeamAdd) =>
        fetchApi<GameTeam>(`/proxy/games/${gameId}/teams`, {
          method: "POST",
          body: JSON.stringify(data),
        }),

      remove: (gameId: string, teamId: string) =>
        fetchApi<DeleteResponse>(`/proxy/games/${gameId}/teams/${teamId}`, { method: "DELETE" }),
    },
  },

  vulnboxes: {
    list: (params?: PaginationParams) =>
      fetchApi<VulnboxListResponse>(`/proxy/vulnboxes?skip=${params?.skip ?? 0}&limit=${params?.limit ?? 50}`),

    get: (vulnboxId: string) =>
      fetchApi<Vulnbox>(`/proxy/vulnboxes/${vulnboxId}`),

    create: (name: string, file: File, description?: string) => {
      const formData = new FormData()
      formData.append("file", file)
      const url = `/proxy/vulnboxes?name=${encodeURIComponent(name)}${description ? `&description=${encodeURIComponent(description)}` : ""}`
      return fetchFormData<Vulnbox>(url, formData)
    },

    update: (vulnboxId: string, data: VulnboxUpdate) =>
      fetchApi<Vulnbox>(`/proxy/vulnboxes/${vulnboxId}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      }),

    delete: (vulnboxId: string) =>
      fetchApi<DeleteResponse>(`/proxy/vulnboxes/${vulnboxId}`, { method: "DELETE" }),
  },

  checkers: {
    list: (params?: PaginationParams) =>
      fetchApi<CheckerListResponse>(`/proxy/checkers?skip=${params?.skip ?? 0}&limit=${params?.limit ?? 50}`),

    get: (checkerId: string) =>
      fetchApi<Checker>(`/proxy/checkers/${checkerId}`),

    create: (name: string, file: File, description?: string) => {
      const formData = new FormData()
      formData.append("file", file)
      const url = `/proxy/checkers?name=${encodeURIComponent(name)}${description ? `&description=${encodeURIComponent(description)}` : ""}`
      return fetchFormData<Checker>(url, formData)
    },

    update: (checkerId: string, data: CheckerUpdate) =>
      fetchApi<Checker>(`/proxy/checkers/${checkerId}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      }),

    delete: (checkerId: string) =>
      fetchApi<DeleteResponse>(`/proxy/checkers/${checkerId}`, { method: "DELETE" }),

    validate: (checkerId: string) =>
      fetchApi<ValidateResponse>(`/proxy/checkers/${checkerId}/validate`, { method: "POST" }),
  },

  ticks: {
    list: (gameId: string, params?: PaginationParams & { status?: string }) =>
      fetchApi<TickListResponse>(
        `/proxy/ticks?gameId=${gameId}&skip=${params?.skip ?? 0}&limit=${params?.limit ?? 50}${params?.status ? `&status=${params.status}` : ""}`
      ),

    get: (tickId: string) =>
      fetchApi<Tick>(`/proxy/ticks/${tickId}`),

    getCurrent: (gameId: string) =>
      fetchApi<Tick | null>(`/proxy/ticks/current?gameId=${gameId}`),

    getLatest: (gameId: string) =>
      fetchApi<Tick | null>(`/proxy/ticks/latest?gameId=${gameId}`),

    getByNumber: (gameId: string, tickNumber: number) =>
      fetchApi<Tick>(`/proxy/ticks/number/${tickNumber}?gameId=${gameId}`),
  },

  flags: {
    list: (gameId: string, params?: PaginationParams & { team_id?: string; tick_id?: string; is_stolen?: boolean }) =>
      fetchApi<FlagListResponse>(
        `/proxy/flags?gameId=${gameId}&skip=${params?.skip ?? 0}&limit=${params?.limit ?? 50}${params?.team_id ? `&teamId=${params.team_id}` : ""}${params?.tick_id ? `&tickId=${params.tick_id}` : ""}${params?.is_stolen !== undefined ? `&isStolen=${params.is_stolen}` : ""}`
      ),

    get: (flagId: string) =>
      fetchApi<Flag>(`/proxy/flags/${flagId}`),

    getByValue: (flagValue: string) =>
      fetchApi<Flag>(`/proxy/flags/by-value/${encodeURIComponent(flagValue)}`),

    getStats: (gameId: string, teamId?: string) =>
      fetchApi<FlagStats>(`/proxy/flags/stats?gameId=${gameId}${teamId ? `&teamId=${teamId}` : ""}`),

    getByTick: (tickId: string, params?: PaginationParams) =>
      fetchApi<FlagListResponse>(`/proxy/flags/tick/${tickId}?skip=${params?.skip ?? 0}&limit=${params?.limit ?? 50}`),

    getTeamTickFlags: (gameId: string, teamId: string, tickId: string) =>
      fetchApi<Flag[]>(`/proxy/flags/team/${teamId}/tick/${tickId}?gameId=${gameId}`),
  },

  submissions: {
    list: (params?: PaginationParams & { game_id?: string; team_id?: string; status?: SubmissionStatus }) =>
      fetchApi<SubmissionListResponse>(
        `/proxy/submissions?skip=${params?.skip ?? 0}&limit=${params?.limit ?? 50}${params?.game_id ? `&gameId=${params.game_id}` : ""}${params?.team_id ? `&teamId=${params.team_id}` : ""}${params?.status ? `&status=${params.status}` : ""}`
      ),

    get: (submissionId: string) =>
      fetchApi<SubmissionDetail>(`/proxy/submissions/${submissionId}`),

    submit: (data: FlagSubmit) =>
      fetchApi<SubmissionResponse>("/proxy/submissions", {
        method: "POST",
        body: JSON.stringify(data),
      }),

    delete: (submissionId: string) =>
      fetchApi<DeleteResponse>(`/proxy/submissions/${submissionId}`, { method: "DELETE" }),
  },

  scoreboard: {
    // Get latest scoreboard - returns array of scoreboard objects
    list: async () => {
      const result = await fetchApi<ScoreboardResponse | ScoreboardResponse[]>(`/proxy/scoreboard`)
      // If backend returns an array, use it directly; otherwise wrap single object in array
      return Array.isArray(result) ? result : [result]
    },

    get: (gameId: string) =>
      fetchApi<ScoreboardResponse>(`/proxy/scoreboard/${gameId}`),

    getTeamScore: (gameId: string, teamId: string) =>
      fetchApi<ScoreboardEntry>(`/proxy/scoreboard/${gameId}/team/${teamId}`),
  },

  checkerStatus: {
    list: (params?: PaginationParams & { game_id?: string; team_id?: string; tick_id?: string }) =>
      fetchApi<ServiceStatusListResponse>(
        `/proxy/checker/statuses?skip=${params?.skip ?? 0}&limit=${params?.limit ?? 50}${params?.game_id ? `&gameId=${params.game_id}` : ""}${params?.team_id ? `&teamId=${params.team_id}` : ""}${params?.tick_id ? `&tickId=${params.tick_id}` : ""}`
      ),

    get: (statusId: string) =>
      fetchApi<ServiceStatus>(`/proxy/checker/statuses/${statusId}`),

    delete: (statusId: string) =>
      fetchApi<DeleteResponse>(`/proxy/checker/statuses/${statusId}`, { method: "DELETE" }),
  },

  health: {
    check: () => fetchApi<Record<string, unknown>>("/proxy/health"),
  },
}
