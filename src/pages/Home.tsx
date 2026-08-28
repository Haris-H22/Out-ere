import {
    ArrowRight,
    CalendarDays,
    CheckCircle2,
    Compass,
    Heart,
    MapPin,
    Sparkles,
    Ticket,
    User,
} from "lucide-react"

import { Link } from "react-router-dom"

import { useQuery } from "@tanstack/react-query"

import { useAuth } from "../context/AuthContext"

type Recommendation = {
    id: string
    title: string
    description: string | null
    image_url: string | null
    start_time: string
    end_time: string
    venue_name: string | null
    address: string | null
    price: number
    capacity: number
    category_id: string
    category_name: string
    university_id: string
    university_name: string
    recommendation_score: number
    recommendation_reason: string
}

type RecommendationResponse = {
    recommendations: Recommendation[]
}

const categories = [
    "Sports",
    "Fitness",
    "Social",
    "Gaming",
    "Music",
    "Arts & Culture",
    "Careers",
    "Food & Drink",
]

const formatDate = (date: string): string => {
    return new Intl.DateTimeFormat("en-GB", {
        weekday: "short",
        day: "numeric",
        month: "short",
    }).format(new Date(date))
}

const formatTime = (date: string): string => {
    return new Intl.DateTimeFormat("en-GB", {
        hour: "numeric",
        minute: "2-digit",
    }).format(new Date(date))
}

const Home = () => {
    const { user } = useAuth()

    const {
        data,
        isLoading,
        isError,
    } = useQuery({
        queryKey: ["recommendations", user?.id],

        queryFn: async (): Promise<RecommendationResponse> => {
            if (!user) {
                return {
                    recommendations: [],
                }
            }

            const response = await fetch(
                `${import.meta.env.VITE_RECOMMENDATION_API_URL}/recommendations/${user.id}`,
            )

            if (!response.ok) {
                throw new Error(
                    "Unable to load recommendations.",
                )
            }

            return response.json()
        },

        enabled: Boolean(user),
    })

    const recommendations =
        data?.recommendations ?? []

    return (
        <div className="space-y-20 pb-12">

            <section className="relative overflow-hidden rounded-3xl bg-slate-950">

                <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-indigo-600/30 blur-3xl" />

                <div className="pointer-events-none absolute -bottom-32 left-1/3 h-72 w-72 rounded-full bg-purple-600/20 blur-3xl" />

                <div className="relative grid gap-12 px-8 py-12 sm:px-12 sm:py-16 lg:grid-cols-[1.1fr_0.9fr] lg:px-16 lg:py-20">

                    <div className="flex flex-col justify-center">

                        <div className="flex items-center gap-2 text-sm font-semibold text-indigo-300">
                            <Sparkles size={18} />

                            <span>
                                Discover more. Do more.
                            </span>
                        </div>

                        <h1 className="mt-5 max-w-3xl text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
                            Find something
                            <span className="text-indigo-400">
                                {" "}worth doing.
                            </span>
                        </h1>

                        <p className="mt-6 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
                            Discover activities, events and experiences
                            happening around your university. Find something
                            new, meet people and make the most of student life.
                        </p>

                        <div className="mt-8">
                            <Link
                                to="/discover"
                                className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 transition hover:bg-indigo-500"
                            >
                                Explore activities

                                <ArrowRight size={17} />
                            </Link>
                        </div>

                        <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm text-slate-400">

                            <div className="flex items-center gap-2">
                                <CheckCircle2
                                    size={16}
                                    className="text-indigo-400"
                                />

                                University activities
                            </div>

                            <div className="flex items-center gap-2">
                                <CheckCircle2
                                    size={16}
                                    className="text-indigo-400"
                                />

                                Personalised recommendations
                            </div>

                        </div>

                    </div>

                    <div className="relative hidden min-h-90 lg:block">

                        <div className="absolute right-0 top-4 w-72 rotate-2 overflow-hidden rounded-2xl border border-white/10 bg-white shadow-2xl">

                            <div className="aspect-16/10 bg-linear-to-br from-indigo-100 via-slate-100 to-slate-200">

                                {recommendations[0]?.image_url ? (
                                    <img
                                        src={recommendations[0].image_url}
                                        alt={recommendations[0].title}
                                        className="h-full w-full object-cover"
                                    />
                                ) : (
                                    <div className="flex h-full items-center justify-center">
                                        <Compass
                                            size={40}
                                            className="text-indigo-300"
                                        />
                                    </div>
                                )}

                            </div>

                            <div className="p-4">

                                <div className="text-xs font-semibold text-indigo-600">
                                    Recommended for you
                                </div>

                                <h3 className="mt-1 text-base font-bold text-slate-900">
                                    {recommendations[0]?.title ??
                                        "Discover your next activity"}
                                </h3>

                                <p className="mt-2 text-xs text-slate-500">
                                    Find activities matched to your interests.
                                </p>

                            </div>

                        </div>

                        <div className="absolute bottom-8 left-4 w-64 -rotate-3 overflow-hidden rounded-2xl border border-white/10 bg-white shadow-2xl">

                            <div className="flex items-center gap-4 p-5">

                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                                    <Heart
                                        size={21}
                                        fill="currentColor"
                                    />
                                </div>

                                <div>
                                    <p className="text-sm font-bold text-slate-900">
                                        Save what you love
                                    </p>

                                    <p className="mt-1 text-xs text-slate-500">
                                        Build your personal activity list.
                                    </p>
                                </div>

                            </div>

                        </div>

                        <div className="absolute bottom-1 right-10 rounded-2xl border border-white/10 bg-white px-5 py-4 shadow-xl">

                            <div className="flex items-center gap-3">

                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                                    <Ticket size={19} />
                                </div>

                                <div>
                                    <p className="text-xs text-slate-500">
                                        Student life
                                    </p>

                                    <p className="text-sm font-bold text-slate-900">
                                        All in one place
                                    </p>
                                </div>

                            </div>

                        </div>

                    </div>

                </div>

            </section>

            <section>

                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">

                    <div>

                        <p className="text-sm font-semibold text-indigo-600">
                            Explore your interests
                        </p>

                        <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                            What are you into?
                        </h2>

                        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                            Browse different types of activities and find
                            something that fits your interests.
                        </p>

                    </div>

                    <Link
                        to="/discover"
                        className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 transition hover:text-indigo-700"
                    >
                        View all

                        <ArrowRight size={16} />
                    </Link>

                </div>

                <div className="mt-6 flex flex-wrap gap-3">

                    {categories.map((category) => (
                        <Link
                            key={category}
                            to="/discover"
                            className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700"
                        >
                            {category}
                        </Link>
                    ))}

                </div>

            </section>

            <section>

                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">

                    <div>

                        <p className="text-sm font-semibold text-indigo-600">
                            Personalised for you
                        </p>

                        <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                            Recommended activities
                        </h2>

                        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                            Out-ere uses your interests and activity history
                            to help you discover things you are likely to enjoy.
                        </p>

                    </div>

                    {recommendations.length > 0 && (
                        <Link
                            to="/discover"
                            className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 transition hover:text-indigo-700"
                        >
                            Explore all

                            <ArrowRight size={16} />
                        </Link>
                    )}

                </div>

                {isLoading && (
                    <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">

                        {[1, 2, 3].map((item) => (
                            <div
                                key={item}
                                className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
                            >

                                <div className="aspect-16/10 animate-pulse bg-slate-200" />

                                <div className="space-y-3 p-5">

                                    <div className="h-5 w-3/4 animate-pulse rounded bg-slate-200" />

                                    <div className="h-4 w-1/2 animate-pulse rounded bg-slate-200" />

                                    <div className="h-4 w-2/3 animate-pulse rounded bg-slate-200" />

                                    <div className="h-4 w-1/3 animate-pulse rounded bg-slate-200" />

                                </div>

                            </div>
                        ))}

                    </div>
                )}

                {!isLoading && isError && (
                    <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">

                        <Compass
                            size={28}
                            className="mx-auto text-slate-400"
                        />

                        <h3 className="mt-4 text-base font-semibold text-slate-900">
                            Recommendations are unavailable
                        </h3>

                        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                            We couldn't load your personalised
                            recommendations right now. You can still explore
                            all available activities.
                        </p>

                        <Link
                            to="/discover"
                            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
                        >
                            Explore activities

                            <ArrowRight size={16} />
                        </Link>

                    </div>
                )}

                {!user && !isLoading && (
                    <div className="mt-6 rounded-2xl border border-slate-200 bg-white px-6 py-12 text-center shadow-sm">

                        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
                            <Sparkles size={24} />
                        </div>

                        <h3 className="mt-5 text-lg font-bold text-slate-900">
                            Get recommendations made for you
                        </h3>

                        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                            Create an account and tell Out-ere what you enjoy.
                            Your recommendations will become more personalised
                            as you explore, save and book activities.
                        </p>

                        <div className="mt-6 flex justify-center gap-3">

                            <Link
                                to="/register"
                                className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
                            >
                                Get started

                                <ArrowRight size={16} />
                            </Link>

                            <Link
                                to="/login"
                                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                            >
                                Sign in
                            </Link>

                        </div>

                    </div>
                )}

                {!isLoading &&
                    !isError &&
                    user &&
                    recommendations.length > 0 && (

                        <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">

                            {recommendations.map((activity) => (

                                <Link
                                    key={activity.id}
                                    to={`/discover/${activity.id}`}
                                    className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                                >

                                    <div className="relative aspect-16/10 overflow-hidden bg-slate-100">

                                        {activity.image_url ? (
                                            <img
                                                src={activity.image_url}
                                                alt={activity.title}
                                                className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                                            />
                                        ) : (
                                            <div className="flex h-full items-center justify-center bg-linear-to-br from-indigo-100 via-slate-100 to-slate-200">
                                                <span className="text-lg font-semibold text-slate-400">
                                                    {activity.category_name}
                                                </span>
                                            </div>
                                        )}

                                        <div className="absolute bottom-4 left-4">

                                            <span className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-slate-900 shadow-sm">
                                                {activity.category_name}
                                            </span>

                                        </div>

                                        <div className="absolute right-4 top-4">

                                            <span className="flex items-center gap-1.5 rounded-full bg-slate-950/80 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-sm">

                                                <Sparkles size={12} />

                                                Recommended

                                            </span>

                                        </div>

                                    </div>

                                    <div className="p-5">

                                        <h3 className="text-lg font-bold text-slate-900 transition group-hover:text-indigo-600">
                                            {activity.title}
                                        </h3>

                                        <div className="mt-2 flex items-start gap-2">

                                            <Sparkles
                                                size={14}
                                                className="mt-0.5 shrink-0 text-indigo-600"
                                            />

                                            <p className="text-xs font-semibold text-indigo-600">
                                                {activity.recommendation_reason}
                                            </p>

                                        </div>

                                        <div className="mt-4 flex items-center gap-2 text-sm text-slate-500">

                                            <CalendarDays size={16} />

                                            <span>
                                                {formatDate(
                                                    activity.start_time,
                                                )}
                                            </span>

                                        </div>

                                        <div className="mt-2 flex items-center gap-2 text-sm text-slate-500">

                                            <span className="flex h-4 w-4 items-center justify-center text-sm">
                                                ◷
                                            </span>

                                            <span>
                                                {formatTime(
                                                    activity.start_time,
                                                )}{" "}
                                                –{" "}
                                                {formatTime(
                                                    activity.end_time,
                                                )}
                                            </span>

                                        </div>

                                        <div className="mt-2 flex items-center gap-2 text-sm text-slate-500">

                                            <MapPin size={16} />

                                            <span className="truncate">
                                                {activity.venue_name ??
                                                    "Location TBC"}
                                            </span>

                                        </div>

                                        <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">

                                            <span className="text-sm font-semibold text-slate-900">

                                                {activity.price === 0
                                                    ? "Free"
                                                    : `£${activity.price.toFixed(
                                                        2,
                                                    )}`}

                                            </span>

                                            <span className="text-sm font-semibold text-slate-900 transition group-hover:text-indigo-600">
                                                View →
                                            </span>

                                        </div>

                                    </div>

                                </Link>

                            ))}

                        </div>

                    )}

                {!isLoading &&
                    !isError &&
                    user &&
                    recommendations.length === 0 && (

                        <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">

                            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border-2 border-slate-200 text-slate-400">
                                <Compass size={24} />
                            </div>

                            <h3 className="mt-5 text-base font-semibold text-slate-900">
                                No recommendations yet
                            </h3>

                            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                                Explore, save and book activities to help
                                Out-ere understand what you enjoy.
                            </p>

                            <Link
                                to="/discover"
                                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
                            >
                                Explore activities

                                <ArrowRight size={16} />
                            </Link>

                        </div>

                    )}

            </section>

            <section>

                <div className="text-center">

                    <p className="text-sm font-semibold text-indigo-600">
                        Simple by design
                    </p>

                    <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                        Make the most of student life
                    </h2>

                    <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-slate-500">
                        Out-ere makes it easier to discover things happening
                        around your university and find activities that fit you.
                    </p>

                </div>

                <div className="mt-8 grid gap-5 md:grid-cols-3">

                    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                            <Compass size={23} />
                        </div>

                        <h3 className="mt-5 text-lg font-bold text-slate-900">
                            Discover
                        </h3>

                        <p className="mt-2 text-sm leading-6 text-slate-500">
                            Find sports, fitness, social events, gaming,
                            music and more in one place.
                        </p>

                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                            <Heart size={23} />
                        </div>

                        <h3 className="mt-5 text-lg font-bold text-slate-900">
                            Save & personalise
                        </h3>

                        <p className="mt-2 text-sm leading-6 text-slate-500">
                            Save activities you like and tell Out-ere about
                            your interests to improve your recommendations.
                        </p>

                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                            <Ticket size={23} />
                        </div>

                        <h3 className="mt-5 text-lg font-bold text-slate-900">
                            Book & go
                        </h3>

                        <p className="mt-2 text-sm leading-6 text-slate-500">
                            Book activities directly through Out-ere and keep
                            track of everything from your account.
                        </p>

                    </div>

                </div>

            </section>

            <section className="overflow-hidden rounded-3xl bg-indigo-600">

                <div className="relative px-8 py-12 text-center sm:px-12 sm:py-16">

                    <div className="pointer-events-none absolute -left-20 -top-20 h-56 w-56 rounded-full bg-white/10 blur-3xl" />

                    <div className="pointer-events-none absolute -bottom-24 -right-20 h-64 w-64 rounded-full bg-purple-400/20 blur-3xl" />

                    <div className="relative">

                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-white/15 text-white">
                            {user ? (
                                <User size={22} />
                            ) : (
                                <Sparkles size={22} />
                            )}
                        </div>

                        <h2 className="mt-5 text-2xl font-bold tracking-tight text-white sm:text-3xl">
                            {user
                                ? "Ready to find your next thing?"
                                : "Your next experience is waiting."}
                        </h2>

                        <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-indigo-100 sm:text-base">
                            {user
                                ? "Explore what's happening around your university and discover something new."
                                : "Join Out-ere and discover activities, events and experiences happening around your university."}
                        </p>

                        <Link
                            to={user ? "/discover" : "/register"}
                            className="mt-7 inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3.5 text-sm font-semibold text-indigo-700 shadow-lg transition hover:bg-slate-50"
                        >
                            {user
                                ? "Explore activities"
                                : "Get started"}

                            <ArrowRight size={17} />
                        </Link>

                    </div>

                </div>

            </section>

        </div>
    )
}

export default Home