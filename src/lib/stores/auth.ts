import { writable } from "svelte/store"

interface User {
    id: string
    email: string
    username: string
    avatar?: string
}

interface AuthState {
    user: User | null
    isAuthenticated: boolean
    isLoading: boolean
    error: string | null
}

function createAuthStore() {
    const initialState: AuthState = {
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
    }

    const { subscribe, set, update } = writable<AuthState>(initialState)

    return {
        subscribe,
        login: async (email: string, password: string) => {
            update((state) => ({ ...state, isLoading: true, error: null }))
            try {
                // Simulate API call - In real app, call your backend
                await new Promise((resolve) => setTimeout(resolve, 500))

                const user: User = {
                    id: "1",
                    email,
                    username: email.split("@")[0],
                    avatar: `/placeholder.svg?height=40&width=40`,
                }

                update((state) => ({
                    ...state,
                    user,
                    isAuthenticated: true,
                    isLoading: false,
                }))

                // Store in localStorage
                localStorage.setItem("user", JSON.stringify(user))
                return { success: true }
            } catch (error) {
                update((state) => ({
                    ...state,
                    error: "Login failed. Please try again.",
                    isLoading: false,
                }))
                return { success: false, error: "Login failed" }
            }
        },
        signup: async (email: string, username: string, password: string) => {
            update((state) => ({ ...state, isLoading: true, error: null }))
            try {
                await new Promise((resolve) => setTimeout(resolve, 500))

                const user: User = {
                    id: "1",
                    email,
                    username,
                    avatar: `/placeholder.svg?height=40&width=40`,
                }

                update((state) => ({
                    ...state,
                    user,
                    isAuthenticated: true,
                    isLoading: false,
                }))

                localStorage.setItem("user", JSON.stringify(user))
                return { success: true }
            } catch (error) {
                update((state) => ({
                    ...state,
                    error: "Signup failed. Please try again.",
                    isLoading: false,
                }))
                return { success: false, error: "Signup failed" }
            }
        },
        logout: () => {
            localStorage.removeItem("user")
            set(initialState)
        },
        init: () => {
            if (typeof window !== "undefined") {
                const stored = localStorage.getItem("user")
                if (stored) {
                    try {
                        const user = JSON.parse(stored)
                        update((state) => ({
                            ...state,
                            user,
                            isAuthenticated: true,
                        }))
                    } catch (e) {
                        localStorage.removeItem("user")
                    }
                }
            }
        },
    }
}

export const auth = createAuthStore()
