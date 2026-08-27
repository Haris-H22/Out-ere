import {
    Navigate,
    Outlet,
    useLocation,
} from "react-router-dom"

import { useAuth } from "../context/AuthContext"

const ProtectedRoute = () => {
    const {
        user,
        isLoading,
    } = useAuth()

    const location =
        useLocation()

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
                state={{
                    from: location,
                }}
            />
        )
    }

    return <Outlet />
}

export default ProtectedRoute