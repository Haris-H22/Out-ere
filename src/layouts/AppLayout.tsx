import {
    Compass,
    Heart,
    Home,
    LogIn,
    LogOut,
    Ticket,
    User,
    LayoutDashboard,
    Menu,
    X,
} from "lucide-react"

import {
    NavLink,
    Outlet,
    useNavigate,
} from "react-router-dom"

import { useState } from "react"

import { useAuth } from "../context/AuthContext"

const publicNavigation = [
    {
        to: "/",
        label: "Home",
        icon: Home,
        end: true,
    },
    {
        to: "/discover",
        label: "Discover",
        icon: Compass,
        end: false,
    },
]

const studentNavigation = [
    {
        to: "/saved",
        label: "Saved",
        icon: Heart,
        end: false,
    },
    {
        to: "/bookings",
        label: "Bookings",
        icon: Ticket,
        end: false,
    },
    {
        to: "/profile",
        label: "Profile",
        icon: User,
        end: false,
    },
]

const organiserNavigation = [
    {
        to: "/organiser",
        label: "Organiser",
        icon: LayoutDashboard,
        end: false,
    },
    {
        to: "/profile",
        label: "Profile",
        icon: User,
        end: false,
    },
]

const AppLayout = () => {
    const {
        user,
        role,
        isLoading,
        signOut,
    } = useAuth()

    const navigate = useNavigate()

    const [isMobileMenuOpen, setIsMobileMenuOpen] =
        useState(false)

    const handleSignOut = async () => {
        try {
            await signOut()

            setIsMobileMenuOpen(false)

            navigate("/", {
                replace: true,
            })
        } catch (error) {
            console.error(
                "Failed to sign out:",
                error,
            )
        }
    }

    const navigation = user
        ? role === "organiser"
            ? organiserNavigation
            : studentNavigation
        : []

    const closeMobileMenu = () => {
        setIsMobileMenuOpen(false)
    }

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900">
            <header className="border-b border-slate-200 bg-white">
                <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">

                    <NavLink
                        to="/"
                        onClick={closeMobileMenu}
                        className="text-2xl font-bold tracking-tight text-slate-900"
                    >
                        out-ere
                        <span className="text-indigo-600">
                            .
                        </span>
                    </NavLink>

                    <nav className="hidden items-center gap-1 md:flex">
                        {publicNavigation.map(
                            ({
                                 to,
                                 label,
                                 icon: Icon,
                                 end,
                             }) => (
                                <NavLink
                                    key={to}
                                    to={to}
                                    end={end}
                                    className={({
                                                    isActive,
                                                }) =>
                                        `flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition ${
                                            isActive
                                                ? "bg-indigo-50 text-indigo-700"
                                                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                                        }`
                                    }
                                >
                                    <Icon size={18} />

                                    {label}
                                </NavLink>
                            ),
                        )}

                        {navigation.map(
                            ({
                                 to,
                                 label,
                                 icon: Icon,
                                 end,
                             }) => (
                                <NavLink
                                    key={to}
                                    to={to}
                                    end={end}
                                    className={({
                                                    isActive,
                                                }) =>
                                        `flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition ${
                                            isActive
                                                ? "bg-indigo-50 text-indigo-700"
                                                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                                        }`
                                    }
                                >
                                    <Icon size={18} />

                                    {label}
                                </NavLink>
                            ),
                        )}
                    </nav>

                    <div className="flex items-center gap-3">
                        {!isLoading &&
                            !user && (
                                <>
                                    <NavLink
                                        to="/login"
                                        className="hidden items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100 md:flex"
                                    >
                                        <LogIn size={18} />

                                        Sign in
                                    </NavLink>

                                    <NavLink
                                        to="/register"
                                        className="hidden rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 sm:block"
                                    >
                                        Get started
                                    </NavLink>
                                </>
                            )}

                        {!isLoading &&
                            user && (
                                <button
                                    type="button"
                                    onClick={
                                        handleSignOut
                                    }
                                    className="hidden items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-red-50 hover:text-red-600 md:flex"
                                >
                                    <LogOut size={18} />

                                    Sign out
                                </button>
                            )}

                        <button
                            type="button"
                            onClick={() =>
                                setIsMobileMenuOpen(
                                    (current) =>
                                        !current,
                                )
                            }
                            aria-label={
                                isMobileMenuOpen
                                    ? "Close menu"
                                    : "Open menu"
                            }
                            aria-expanded={
                                isMobileMenuOpen
                            }
                            className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-700 transition hover:bg-slate-100 md:hidden"
                        >
                            {isMobileMenuOpen ? (
                                <X size={23} />
                            ) : (
                                <Menu size={23} />
                            )}
                        </button>
                    </div>
                </div>

                {isMobileMenuOpen && (
                    <div className="border-t border-slate-100 bg-white md:hidden">
                        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6">

                            <nav className="space-y-1">
                                {publicNavigation.map(
                                    ({
                                         to,
                                         label,
                                         icon: Icon,
                                         end,
                                     }) => (
                                        <NavLink
                                            key={to}
                                            to={to}
                                            end={end}
                                            onClick={
                                                closeMobileMenu
                                            }
                                            className={({
                                                            isActive,
                                                        }) =>
                                                `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
                                                    isActive
                                                        ? "bg-indigo-50 text-indigo-700"
                                                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                                                }`
                                            }
                                        >
                                            <Icon size={19} />

                                            {label}
                                        </NavLink>
                                    ),
                                )}

                                {navigation.map(
                                    ({
                                         to,
                                         label,
                                         icon: Icon,
                                         end,
                                     }) => (
                                        <NavLink
                                            key={to}
                                            to={to}
                                            end={end}
                                            onClick={
                                                closeMobileMenu
                                            }
                                            className={({
                                                            isActive,
                                                        }) =>
                                                `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
                                                    isActive
                                                        ? "bg-indigo-50 text-indigo-700"
                                                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                                                }`
                                            }
                                        >
                                            <Icon size={19} />

                                            {label}
                                        </NavLink>
                                    ),
                                )}
                            </nav>

                            <div className="mt-4 border-t border-slate-100 pt-4">
                                {!isLoading &&
                                    !user && (
                                        <div className="space-y-2">
                                            <NavLink
                                                to="/login"
                                                onClick={
                                                    closeMobileMenu
                                                }
                                                className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                                            >
                                                <LogIn
                                                    size={19}
                                                />

                                                Sign in
                                            </NavLink>

                                            <NavLink
                                                to="/register"
                                                onClick={
                                                    closeMobileMenu
                                                }
                                                className="flex items-center justify-center rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
                                            >
                                                Get started
                                            </NavLink>
                                        </div>
                                    )}

                                {!isLoading &&
                                    user && (
                                        <button
                                            type="button"
                                            onClick={
                                                handleSignOut
                                            }
                                            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium text-red-600 transition hover:bg-red-50"
                                        >
                                            <LogOut
                                                size={19}
                                            />

                                            Sign out
                                        </button>
                                    )}
                            </div>
                        </div>
                    </div>
                )}
            </header>

            <main className="mx-auto min-h-[calc(100vh-4rem)] max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                <Outlet />
            </main>
        </div>
    )
}

export default AppLayout