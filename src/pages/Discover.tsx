import { useMemo, useState } from "react"
import {
    AlertCircle,
    Search,
    SlidersHorizontal,
    X,
} from "lucide-react"

import ActivityCard from "../components/activities/ActivityCard"
import { useActivities } from "../hooks/useActivities"

type DateFilter = "all" | "7" | "30"
type PriceFilter = "all" | "free" | "5" | "10"

const Discover = () => {
    const {
        data: activities = [],
        isLoading,
        isError,
        error,
    } = useActivities()

    const [search, setSearch] = useState("")
    const [showFilters, setShowFilters] = useState(false)

    const [categoryFilter, setCategoryFilter] = useState("all")
    const [priceFilter, setPriceFilter] =
        useState<PriceFilter>("all")
    const [dateFilter, setDateFilter] =
        useState<DateFilter>("all")

    const categories = useMemo(() => {
        const categoryNames = activities
            .map((activity) => activity.category?.name)
            .filter(Boolean)

        return Array.from(new Set(categoryNames)).sort()
    }, [activities])

    const filteredActivities = useMemo(() => {
        const now = new Date()

        return activities.filter((activity) => {
            const searchTerm = search.trim().toLowerCase()

            if (searchTerm) {
                const searchableText = [
                    activity.title,
                    activity.description ?? "",
                    activity.category?.name ?? "",
                    activity.venue_name ?? "",
                    activity.address ?? "",
                    activity.university?.name ?? "",
                ]
                    .join(" ")
                    .toLowerCase()

                if (!searchableText.includes(searchTerm)) {
                    return false
                }
            }

            if (
                categoryFilter !== "all" &&
                activity.category?.name !== categoryFilter
            ) {
                return false
            }

            const price = Number(activity.price ?? 0)

            if (priceFilter === "free" && price !== 0) {
                return false
            }

            if (priceFilter === "5" && price > 5) {
                return false
            }

            if (priceFilter === "10" && price > 10) {
                return false
            }

            if (dateFilter !== "all") {
                const activityDate = new Date(
                    activity.start_time,
                )

                const days =
                    dateFilter === "7"
                        ? 7
                        : 30

                const endDate = new Date(now)
                endDate.setDate(
                    endDate.getDate() + days,
                )

                if (
                    activityDate < now ||
                    activityDate > endDate
                ) {
                    return false
                }
            }

            return true
        })
    }, [
        activities,
        search,
        categoryFilter,
        priceFilter,
        dateFilter,
    ])

    const hasActiveFilters =
        categoryFilter !== "all" ||
        priceFilter !== "all" ||
        dateFilter !== "all"

    const clearFilters = () => {
        setCategoryFilter("all")
        setPriceFilter("all")
        setDateFilter("all")
    }

    return (
        <div className="space-y-8">
            <section>
                <p className="text-sm font-semibold text-indigo-600">
                    Explore
                </p>

                <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                    Discover activities
                </h1>

                <p className="mt-2 max-w-2xl text-slate-500">
                    Find something happening that matches your
                    interests, schedule and university.
                </p>
            </section>

            <section>
                <div className="flex flex-col gap-3 sm:flex-row">
                    <div className="relative flex-1">
                        <Search
                            size={19}
                            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                        />

                        <input
                            type="search"
                            value={search}
                            onChange={(event) =>
                                setSearch(event.target.value)
                            }
                            placeholder="Search activities..."
                            className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-11 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50"
                        />

                        {search && (
                            <button
                                type="button"
                                onClick={() => setSearch("")}
                                aria-label="Clear search"
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-700"
                            >
                                <X size={18} />
                            </button>
                        )}
                    </div>

                    <button
                        type="button"
                        onClick={() =>
                            setShowFilters((current) => !current)
                        }
                        className={`inline-flex items-center justify-center gap-2 rounded-xl border px-5 py-3 font-medium transition ${
                            showFilters || hasActiveFilters
                                ? "border-indigo-200 bg-indigo-50 text-indigo-700"
                                : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                        }`}
                    >
                        <SlidersHorizontal size={18} />

                        Filters

                        {hasActiveFilters && (
                            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-indigo-600 px-1.5 text-xs font-bold text-white">
                                {[
                                    categoryFilter !== "all",
                                    priceFilter !== "all",
                                    dateFilter !== "all",
                                ].filter(Boolean).length}
                            </span>
                        )}
                    </button>
                </div>

                {showFilters && (
                    <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                        <div className="flex flex-col gap-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="font-semibold text-slate-900">
                                        Filter activities
                                    </h3>

                                    <p className="mt-1 text-sm text-slate-500">
                                        Narrow down activities to find
                                        something that suits you.
                                    </p>
                                </div>

                                {hasActiveFilters && (
                                    <button
                                        type="button"
                                        onClick={clearFilters}
                                        className="text-sm font-semibold text-indigo-600 transition hover:text-indigo-700"
                                    >
                                        Clear filters
                                    </button>
                                )}
                            </div>

                            <div className="grid gap-5 sm:grid-cols-3">
                                <div>
                                    <label
                                        htmlFor="category-filter"
                                        className="text-sm font-semibold text-slate-700"
                                    >
                                        Category
                                    </label>

                                    <select
                                        id="category-filter"
                                        value={categoryFilter}
                                        onChange={(event) =>
                                            setCategoryFilter(
                                                event.target.value,
                                            )
                                        }
                                        className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50"
                                    >
                                        <option value="all">
                                            All categories
                                        </option>

                                        {categories.map(
                                            (category) => (
                                                <option
                                                    key={category}
                                                    value={category}
                                                >
                                                    {category}
                                                </option>
                                            ),
                                        )}
                                    </select>
                                </div>

                                <div>
                                    <label
                                        htmlFor="price-filter"
                                        className="text-sm font-semibold text-slate-700"
                                    >
                                        Price
                                    </label>

                                    <select
                                        id="price-filter"
                                        value={priceFilter}
                                        onChange={(event) =>
                                            setPriceFilter(
                                                event.target
                                                    .value as PriceFilter,
                                            )
                                        }
                                        className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50"
                                    >
                                        <option value="all">
                                            Any price
                                        </option>

                                        <option value="free">
                                            Free
                                        </option>

                                        <option value="5">
                                            £5 or less
                                        </option>

                                        <option value="10">
                                            £10 or less
                                        </option>
                                    </select>
                                </div>

                                <div>
                                    <label
                                        htmlFor="date-filter"
                                        className="text-sm font-semibold text-slate-700"
                                    >
                                        Date
                                    </label>

                                    <select
                                        id="date-filter"
                                        value={dateFilter}
                                        onChange={(event) =>
                                            setDateFilter(
                                                event.target
                                                    .value as DateFilter,
                                            )
                                        }
                                        className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50"
                                    >
                                        <option value="all">
                                            Any date
                                        </option>

                                        <option value="7">
                                            Next 7 days
                                        </option>

                                        <option value="30">
                                            Next 30 days
                                        </option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </section>

            <section>
                <div className="mb-5 flex items-end justify-between">
                    <div>
                        <h2 className="text-xl font-bold tracking-tight text-slate-900">
                            Upcoming activities
                        </h2>

                        {!isLoading && !isError && (
                            <p className="mt-1 text-sm text-slate-500">
                                {filteredActivities.length}{" "}
                                {filteredActivities.length === 1
                                    ? "activity"
                                    : "activities"}{" "}
                                available
                            </p>
                        )}
                    </div>
                </div>

                {isLoading && (
                    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                        {Array.from({ length: 6 }).map(
                            (_, index) => (
                                <div
                                    key={index}
                                    className="overflow-hidden rounded-2xl border border-slate-200 bg-white"
                                >
                                    <div className="aspect-16/10 animate-pulse bg-slate-200" />

                                    <div className="space-y-3 p-5">
                                        <div className="h-5 w-3/4 animate-pulse rounded bg-slate-200" />

                                        <div className="h-4 w-1/2 animate-pulse rounded bg-slate-200" />

                                        <div className="h-4 w-2/3 animate-pulse rounded bg-slate-200" />
                                    </div>
                                </div>
                            ),
                        )}
                    </div>
                )}

                {isError && (
                    <div className="rounded-2xl border border-red-200 bg-red-50 p-8">
                        <div className="flex items-start gap-3">
                            <AlertCircle
                                size={20}
                                className="mt-0.5 shrink-0 text-red-600"
                            />

                            <div>
                                <h3 className="font-semibold text-red-900">
                                    We couldn't load activities
                                </h3>

                                <p className="mt-1 text-sm text-red-700">
                                    {error instanceof Error
                                        ? error.message
                                        : "Something went wrong while loading activities."}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {!isLoading &&
                    !isError &&
                    filteredActivities.length === 0 && (
                        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
                            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
                                <Search
                                    size={22}
                                    className="text-slate-400"
                                />
                            </div>

                            <h3 className="mt-4 font-semibold text-slate-900">
                                No activities found
                            </h3>

                            <p className="mt-2 text-sm text-slate-500">
                                Try changing your search or filters.
                            </p>

                            {(search || hasActiveFilters) && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setSearch("")
                                        clearFilters()
                                    }}
                                    className="mt-5 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
                                >
                                    Clear search and filters
                                </button>
                            )}
                        </div>
                    )}

                {!isLoading &&
                    !isError &&
                    filteredActivities.length > 0 && (
                        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                            {filteredActivities.map(
                                (activity) => (
                                    <ActivityCard
                                        key={activity.id}
                                        activity={activity}
                                    />
                                ),
                            )}
                        </div>
                    )}
            </section>
        </div>
    )
}

export default Discover