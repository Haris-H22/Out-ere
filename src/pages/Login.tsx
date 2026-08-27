import { useState } from "react"
import {
    ArrowRight,
    LockKeyhole,
    Mail,
} from "lucide-react"
import {
    Link,
    useLocation,
    useNavigate,
} from "react-router-dom"

import { useAuth } from "../context/AuthContext"

type LocationState = {
    message?: string
}

const Login = () => {
    const navigate = useNavigate()
    const location = useLocation()

    const { signIn } = useAuth()

    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const successMessage = (
        location.state as LocationState | null
    )?.message

    const handleSubmit = async (
        event: React.FormEvent<HTMLFormElement>
    ) => {
        event.preventDefault()

        setError(null)
        setIsSubmitting(true)

        try {
            await signIn(email, password)

            navigate("/discover", {
                replace: true,
            })
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Unable to sign in. Please check your details."
            )
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="min-h-[calc(100vh-4rem)] bg-slate-50">
            <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-md items-center px-4 py-12">
                <div className="w-full">

                    <div className="mb-8 text-center">
                        <Link
                            to="/"
                            className="text-3xl font-bold tracking-tight text-slate-900"
                        >
                            out-ere
                            <span className="text-indigo-600">.</span>
                        </Link>

                        <h1 className="mt-8 text-3xl font-bold tracking-tight text-slate-900">
                            Welcome back
                        </h1>

                        <p className="mt-2 text-sm text-slate-500">
                            Sign in to discover and book student activities.
                        </p>
                    </div>

                    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">

                        <form
                            onSubmit={handleSubmit}
                            className="space-y-5"
                        >

                            {successMessage && (
                                <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                                    {successMessage}
                                </div>
                            )}

                            {error && (
                                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                                    {error}
                                </div>
                            )}

                            <div>
                                <label
                                    htmlFor="email"
                                    className="mb-2 block text-sm font-semibold text-slate-700"
                                >
                                    Email address
                                </label>

                                <div className="relative">
                                    <Mail
                                        size={18}
                                        className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                                    />

                                    <input
                                        id="email"
                                        type="email"
                                        value={email}
                                        onChange={(event) =>
                                            setEmail(event.target.value)
                                        }
                                        placeholder="you@example.com"
                                        autoComplete="email"
                                        required
                                        className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50"
                                    />
                                </div>
                            </div>

                            <div>
                                <label
                                    htmlFor="password"
                                    className="mb-2 block text-sm font-semibold text-slate-700"
                                >
                                    Password
                                </label>

                                <div className="relative">
                                    <LockKeyhole
                                        size={18}
                                        className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                                    />

                                    <input
                                        id="password"
                                        type="password"
                                        value={password}
                                        onChange={(event) =>
                                            setPassword(event.target.value)
                                        }
                                        placeholder="Enter your password"
                                        autoComplete="current-password"
                                        required
                                        className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {isSubmitting
                                    ? "Signing in..."
                                    : "Sign in"}

                                {!isSubmitting && (
                                    <ArrowRight size={17} />
                                )}
                            </button>
                        </form>

                        <div className="mt-6 border-t border-slate-100 pt-6 text-center">
                            <p className="text-sm text-slate-500">
                                Don't have an account?{" "}

                                <Link
                                    to="/register"
                                    className="font-semibold text-indigo-600 transition hover:text-indigo-700"
                                >
                                    Get started
                                </Link>
                            </p>
                        </div>
                    </div>

                    <p className="mt-6 text-center text-xs leading-5 text-slate-400">
                        By continuing, you agree to use Out-ere responsibly
                        and respect the university community.
                    </p>
                </div>
            </div>
        </div>
    )
}

export default Login