import {
    createContext,
    useContext,
    useEffect,
    useMemo,
    useState,
    type ReactNode,
} from "react"

import type {
    Session,
    User,
} from "@supabase/supabase-js"

import { supabase } from "../lib/supabase"

type UserRole = "student" | "organiser"

type AuthContextValue = {
    user: User | null
    session: Session | null
    role: UserRole | null
    isLoading: boolean

    signIn: (
        email: string,
        password: string,
    ) => Promise<void>

    signUp: (
        email: string,
        password: string,
    ) => Promise<void>

    signOut: () => Promise<void>

    refreshProfile: () => Promise<void>
}

const AuthContext =
    createContext<AuthContextValue | undefined>(
        undefined,
    )

type AuthProviderProps = {
    children: ReactNode
}

export const AuthProvider = ({
                                 children,
                             }: AuthProviderProps) => {
    const [session, setSession] =
        useState<Session | null>(null)

    const [role, setRole] =
        useState<UserRole | null>(null)

    const [isLoading, setIsLoading] =
        useState(true)

    const loadProfile = async (
        userId: string,
    ) => {
        const {
            data,
            error,
        } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", userId)
            .single()

        if (error) {
            console.error(
                "Failed to load profile:",
                error,
            )

            setRole(null)
            return
        }

        if (
            data?.role === "student" ||
            data?.role === "organiser"
        ) {
            setRole(data.role)
        } else {
            setRole("student")
        }
    }

    useEffect(() => {
        let mounted = true

        const initialise = async () => {
            const {
                data: {
                    session,
                },
                error,
            } = await supabase.auth.getSession()

            if (error) {
                console.error(
                    "Failed to load Supabase session:",
                    error,
                )
            }

            if (!mounted) {
                return
            }

            setSession(session)

            if (session?.user) {
                await loadProfile(
                    session.user.id,
                )
            } else {
                setRole(null)
            }

            if (mounted) {
                setIsLoading(false)
            }
        }

        void initialise()

        const {
            data: {
                subscription,
            },
        } =
            supabase.auth.onAuthStateChange(
                (_event, session) => {
                    setSession(session)

                    if (!session?.user) {
                        setRole(null)
                        setIsLoading(false)
                        return
                    }

                    void loadProfile(
                        session.user.id,
                    ).finally(() => {
                        setIsLoading(false)
                    })
                },
            )

        return () => {
            mounted = false
            subscription.unsubscribe()
        }
    }, [])

    const signIn = async (
        email: string,
        password: string,
    ) => {
        const {
            error,
        } =
            await supabase.auth.signInWithPassword({
                email,
                password,
            })

        if (error) {
            throw new Error(error.message)
        }
    }

    const signUp = async (
        email: string,
        password: string,
    ) => {
        const {
            data,
            error,
        } =
            await supabase.auth.signUp({
                email,
                password,
            })

        if (error) {
            throw new Error(error.message)
        }

        if (data.user) {
            await loadProfile(
                data.user.id,
            )
        }
    }

    const signOut = async () => {
        const {
            error,
        } =
            await supabase.auth.signOut()

        if (error) {
            throw new Error(error.message)
        }

        setSession(null)
        setRole(null)
    }

    const refreshProfile = async () => {
        if (!session?.user) {
            setRole(null)
            return
        }

        await loadProfile(
            session.user.id,
        )
    }

    const value =
        useMemo<AuthContextValue>(
            () => ({
                user:
                    session?.user ?? null,
                session,
                role,
                isLoading,
                signIn,
                signUp,
                signOut,
                refreshProfile,
            }),
            [
                session,
                role,
                isLoading,
            ],
        )

    return (
        <AuthContext.Provider
            value={value}
        >
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth =
    (): AuthContextValue => {
        const context =
            useContext(AuthContext)

        if (!context) {
            throw new Error(
                "useAuth must be used inside an AuthProvider.",
            )
        }

        return context
    }