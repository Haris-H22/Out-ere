import {
    Navigate,
    Outlet,
} from "react-router-dom"

import { useAuth } from "../context/AuthContext"

const OrganiserRoute = () => {
    const {
        user,
        role,
        isLoading,
    } = useAuth()

    if (isLoading) {
        return (
            <div className="flex min-h-[50vh] items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-indigo-600" />
            </div>
        )
    }

    if (!user) {
        return (
            <Navigate
                to="/login"
                replace
            />
        )
    }

    if (role !== "organiser") {
        return (
            <Navigate
                to="/"
                replace
            />
        )
    }

    return <Outlet />
}

export default OrganiserRoute