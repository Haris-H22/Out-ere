import { useEffect, useState } from "react"

import {
    CalendarDays,
    CheckCircle2,
    ChevronRight,
    Edit3,
    Heart,
    LogOut,
    Mail,
    ShieldCheck,
} from "lucide-react"

import { useNavigate } from "react-router-dom"

import { supabase } from "../lib/supabase"

type University = {
    id: string
    name: string
}

type Category = {
    id: string
    name: string
}

const Profile = () => {
    const navigate = useNavigate()

    const [email, setEmail] = useState("")
    const [displayName, setDisplayName] = useState("")

    const [bookingsCount, setBookingsCount] = useState(0)
    const [savedCount, setSavedCount] = useState(0)

    const [universities, setUniversities] = useState<University[]>([])
    const [categories, setCategories] = useState<Category[]>([])

    const [selectedUniversity, setSelectedUniversity] =
        useState("")

    const [selectedInterests, setSelectedInterests] =
        useState<string[]>([])

    const [isLoading, setIsLoading] = useState(true)
    const [isSavingPreferences, setIsSavingPreferences] =
        useState(false)

    const [preferencesMessage, setPreferencesMessage] =
        useState<string | null>(null)

    const [preferencesError, setPreferencesError] =
        useState<string | null>(null)

    const [isSigningOut, setIsSigningOut] = useState(false)

    useEffect(() => {
        let isMounted = true

        const loadProfile = async () => {
            try {
                const {
                    data: { session },
                    error: sessionError,
                } = await supabase.auth.getSession()

                if (sessionError) {
                    throw sessionError
                }

                if (!session?.user) {
                    navigate("/login")
                    return
                }

                const user = session.user

                if (isMounted) {
                    setEmail(user.email ?? "")

                    const metadata = user.user_metadata ?? {}

                    const name =
                        metadata.display_name ??
                        metadata.full_name ??
                        metadata.name ??
                        ""

                    setDisplayName(name)
                }

                const bookingsResult = await supabase
                    .from("bookings")
                    .select("id", {
                        count: "exact",
                        head: true,
                    })
                    .eq("user_id", user.id)

                if (bookingsResult.error) {
                    console.error(
                        "Failed to load booking count:",
                        bookingsResult.error,
                    )
                } else if (isMounted) {
                    setBookingsCount(
                        bookingsResult.count ?? 0,
                    )
                }

                const savedResult = await supabase
                    .from("saved_activities")
                    .select("activity_id", {
                        count: "exact",
                        head: true,
                    })
                    .eq("user_id", user.id)

                if (savedResult.error) {
                    console.error(
                        "Failed to load saved activity count:",
                        savedResult.error,
                    )
                } else if (isMounted) {
                    setSavedCount(
                        savedResult.count ?? 0,
                    )
                }

                const universitiesResult = await supabase
                    .from("universities")
                    .select("id, name")
                    .order("name")

                if (universitiesResult.error) {
                    throw universitiesResult.error
                }

                if (isMounted) {
                    setUniversities(
                        universitiesResult.data ?? [],
                    )
                }

                const categoriesResult = await supabase
                    .from("categories")
                    .select("id, name")
                    .order("name")

                if (categoriesResult.error) {
                    throw categoriesResult.error
                }

                if (isMounted) {
                    setCategories(
                        categoriesResult.data ?? [],
                    )
                }

                const preferencesResult = await supabase
                    .from("user_preferences")
                    .select(
                        "university_id, interest_category_ids",
                    )
                    .eq("user_id", user.id)
                    .maybeSingle()

                if (preferencesResult.error) {
                    throw preferencesResult.error
                }

                if (
                    preferencesResult.data &&
                    isMounted
                ) {
                    setSelectedUniversity(
                        preferencesResult.data
                            .university_id ?? "",
                    )

                    setSelectedInterests(
                        preferencesResult.data
                            .interest_category_ids ?? [],
                    )
                }

                if (isMounted) {
                    setIsLoading(false)
                }
            } catch (error) {
                console.error(
                    "Failed to load profile:",
                    error,
                )

                if (isMounted) {
                    setIsLoading(false)
                }
            }
        }

        void loadProfile()

        return () => {
            isMounted = false
        }
    }, [navigate])

    const handleSavePreferences = async () => {
        setIsSavingPreferences(true)
        setPreferencesMessage(null)
        setPreferencesError(null)

        try {
            const {
                data: { session },
            } = await supabase.auth.getSession()

            if (!session?.user) {
                navigate("/login")
                return
            }

            const { error } = await supabase
                .from("user_preferences")
                .upsert(
                    {
                        user_id: session.user.id,
                        university_id:
                            selectedUniversity || null,
                        interest_category_ids:
                        selectedInterests,
                        updated_at:
                            new Date().toISOString(),
                    },
                    {
                        onConflict: "user_id",
                    },
                )

            if (error) {
                throw error
            }

            setPreferencesMessage(
                "Your preferences have been saved.",
            )
        } catch (error) {
            console.error(
                "Failed to save preferences:",
                error,
            )

            setPreferencesError(
                error instanceof Error
                    ? error.message
                    : "Unable to save your preferences.",
            )
        } finally {
            setIsSavingPreferences(false)
        }
    }

    const toggleInterest = (categoryId: string) => {
        setSelectedInterests((current) => {
            if (current.includes(categoryId)) {
                return current.filter(
                    (id) => id !== categoryId,
                )
            }

            return [...current, categoryId]
        })
    }

    const handleSignOut = async () => {
        setIsSigningOut(true)

        try {
            const { error } =
                await supabase.auth.signOut()

            if (error) {
                throw error
            }

            navigate("/login")
        } catch (error) {
            console.error(
                "Failed to sign out:",
                error,
            )
        } finally {
            setIsSigningOut(false)
        }
    }

    const getInitial = () => {
        if (displayName.trim()) {
            return displayName
                .trim()
                .charAt(0)
                .toUpperCase()
        }

        if (email) {
            return email.charAt(0).toUpperCase()
        }

        return "U"
    }

    if (isLoading) {
        return (
            <div className="space-y-8">
                <div className="h-56 animate-pulse rounded-3xl bg-slate-200" />

                <div className="h-8 w-48 animate-pulse rounded bg-slate-200" />

                <div className="grid gap-4 sm:grid-cols-2">
                    <div className="h-28 animate-pulse rounded-2xl bg-slate-200" />

                    <div className="h-28 animate-pulse rounded-2xl bg-slate-200" />
                </div>

                <div className="h-48 animate-pulse rounded-2xl bg-slate-200" />

                <div className="h-80 animate-pulse rounded-2xl bg-slate-200" />
            </div>
        )
    }

    return (
        <div className="space-y-8">
            <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                <div className="h-36 bg-linear-to-r from-indigo-600 via-indigo-500 to-violet-500" />

                <div className="relative px-6 pb-6 sm:px-8">
                    <div className="-mt-12 flex h-24 w-24 items-center justify-center rounded-3xl border-4 border-white bg-indigo-100 text-3xl font-bold text-indigo-700 shadow-sm">
                        {getInitial()}
                    </div>

                    <div className="mt-4 flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                            {displayName && (
                                <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                                    {displayName}
                                </h1>
                            )}

                            <div className="mt-2 flex items-center gap-2 text-sm text-slate-500">
                                <Mail size={17} />

                                <span>{email}</span>
                            </div>
                        </div>

                        <button
                            type="button"
                            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700"
                        >
                            <Edit3 size={17} />

                            Edit profile
                        </button>
                    </div>
                </div>
            </section>

            <section>
                <h2 className="text-xl font-bold text-slate-900">
                    Your Out-ere activity
                </h2>

                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <button
                        type="button"
                        onClick={() =>
                            navigate("/bookings")
                        }
                        className="group flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:border-indigo-200 hover:shadow-md"
                    >
                        <div className="flex items-center gap-4">
                            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                                <CalendarDays size={24} />
                            </div>

                            <div>
                                <p className="text-2xl font-bold text-slate-900">
                                    {bookingsCount}
                                </p>

                                <p className="text-sm text-slate-500">
                                    Bookings
                                </p>
                            </div>
                        </div>

                        <ChevronRight
                            size={20}
                            className="text-slate-300 transition group-hover:translate-x-1 group-hover:text-indigo-500"
                        />
                    </button>

                    <button
                        type="button"
                        onClick={() =>
                            navigate("/saved")
                        }
                        className="group flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:border-pink-200 hover:shadow-md"
                    >
                        <div className="flex items-center gap-4">
                            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-pink-50 text-pink-500">
                                <Heart size={24} />
                            </div>

                            <div>
                                <p className="text-2xl font-bold text-slate-900">
                                    {savedCount}
                                </p>

                                <p className="text-sm text-slate-500">
                                    Saved activities
                                </p>
                            </div>
                        </div>

                        <ChevronRight
                            size={20}
                            className="text-slate-300 transition group-hover:translate-x-1 group-hover:text-pink-500"
                        />
                    </button>
                </div>
            </section>

            <section>
                <div>
                    <p className="text-sm font-semibold text-indigo-600">
                        Personalisation
                    </p>

                    <h2 className="mt-2 text-xl font-bold text-slate-900">
                        Help us recommend better activities
                    </h2>

                    <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                        Tell Out-ere which university you attend
                        and what types of activities interest you.
                        These preferences will be used alongside
                        your views, saves and bookings.
                    </p>
                </div>

                <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                    <div>
                        <label
                            htmlFor="university"
                            className="text-sm font-semibold text-slate-900"
                        >
                            University
                        </label>

                        <p className="mt-1 text-xs text-slate-500">
                            Used to prioritise activities at your
                            university.
                        </p>

                        <select
                            id="university"
                            value={selectedUniversity}
                            onChange={(event) =>
                                setSelectedUniversity(
                                    event.target.value,
                                )
                            }
                            className="mt-3 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                        >
                            <option value="">
                                Select your university
                            </option>

                            {universities.map(
                                (university) => (
                                    <option
                                        key={university.id}
                                        value={university.id}
                                    >
                                        {university.name}
                                    </option>
                                ),
                            )}
                        </select>
                    </div>

                    <div className="mt-7">
                        <div>
                            <p className="text-sm font-semibold text-slate-900">
                                Your interests
                            </p>

                            <p className="mt-1 text-xs text-slate-500">
                                Select the types of activities
                                you'd like to see more of.
                            </p>
                        </div>

                        <div className="mt-4 flex flex-wrap gap-2">
                            {categories.map(
                                (category) => {
                                    const isSelected =
                                        selectedInterests.includes(
                                            category.id,
                                        )

                                    return (
                                        <button
                                            key={category.id}
                                            type="button"
                                            onClick={() =>
                                                toggleInterest(
                                                    category.id,
                                                )
                                            }
                                            className={`rounded-full border px-4 py-2.5 text-sm font-medium transition ${
                                                isSelected
                                                    ? "border-indigo-600 bg-indigo-600 text-white"
                                                    : "border-slate-200 bg-white text-slate-600 hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700"
                                            }`}
                                        >
                                            {category.name}
                                        </button>
                                    )
                                },
                            )}
                        </div>
                    </div>

                    {preferencesMessage && (
                        <div className="mt-5 flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
                            <CheckCircle2 size={17} />

                            {preferencesMessage}
                        </div>
                    )}

                    {preferencesError && (
                        <p className="mt-5 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
                            {preferencesError}
                        </p>
                    )}

                    <div className="mt-6 flex justify-end">
                        <button
                            type="button"
                            onClick={handleSavePreferences}
                            disabled={
                                isSavingPreferences
                            }
                            className="rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {isSavingPreferences
                                ? "Saving..."
                                : "Save preferences"}
                        </button>
                    </div>
                </div>
            </section>

            <section>
                <h2 className="text-xl font-bold text-slate-900">
                    Account
                </h2>

                <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <div className="flex items-center justify-between border-b border-slate-100 p-5">
                        <div className="flex items-center gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                                <ShieldCheck size={23} />
                            </div>

                            <div>
                                <p className="font-semibold text-slate-900">
                                    Account security
                                </p>

                                <p className="mt-1 text-sm text-slate-500">
                                    Your account is securely managed
                                    through Supabase authentication.
                                </p>
                            </div>
                        </div>

                        <CheckCircle2
                            size={21}
                            className="shrink-0 text-emerald-500"
                        />
                    </div>

                    <button
                        type="button"
                        onClick={handleSignOut}
                        disabled={isSigningOut}
                        className="group flex w-full items-center justify-between p-5 text-left transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        <div className="flex items-center gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-600">
                                <LogOut size={23} />
                            </div>

                            <div>
                                <p className="font-semibold text-red-600">
                                    {isSigningOut
                                        ? "Signing out..."
                                        : "Sign out"}
                                </p>

                                <p className="mt-1 text-sm text-slate-500">
                                    Sign out of your Out-ere account.
                                </p>
                            </div>
                        </div>

                        <ChevronRight
                            size={20}
                            className="text-slate-300 transition group-hover:translate-x-1 group-hover:text-red-500"
                        />
                    </button>
                </div>
            </section>

            <div className="pb-6 text-center">
                <p className="text-sm text-slate-400">
                    out-ere. · Discover more. Do more.
                </p>
            </div>
        </div>
    )
}

export default Profile