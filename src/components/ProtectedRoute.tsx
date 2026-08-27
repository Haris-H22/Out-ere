import { Navigate, Outlet, useLocation } from "react-router-dom"

import { useAuth } from "../context/AuthContext"

const ProtectedRoute = () => {
    const { user, isLoading } = useAuth()
    const location = useLocation()

    if (isLoading) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center">
                <div className="text-center">
                    <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-indigo-600" />

                    <p className="mt-4 text-sm text-slate-500">
                        Loading your account...
                    </p>
                </div>
            </div>
        )
    }

    if (!user) {
        return (
            <Navigate
                to="/login"
                replace
                state={{ from: location.pathname }}
            />
        )
    }

    return <Outlet />
}

export default ProtectedRoute