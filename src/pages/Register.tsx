import { useState } from "react"
import {
    ArrowRight,
    LockKeyhole,
    Mail,
} from "lucide-react"
import { Link, useNavigate } from "react-router-dom"

import { useAuth } from "../context/AuthContext"

const Register = () => {
    const navigate = useNavigate()
    const { signUp } = useAuth()

    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")

    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleSubmit = async (
        event: React.FormEvent<HTMLFormElement>
    ) => {
        event.preventDefault()

        setError(null)

        if (password !== confirmPassword) {
            setError("Passwords do not match.")
            return
        }

        if (password.length < 6) {
            setError("Your password must be at least 6 characters.")
            return
        }

        setIsSubmitting(true)

        try {
            await signUp(email, password)

            navigate("/login", {
                replace: true,
                state: {
                    message:
                        "Account created successfully. Please sign in.",
                },
            })
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Unable to create your account."
            )
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="min-h-[calc(100vh-4rem)] bg-slate-50">
            <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-md items-center px-4 py-12">
                <div className="w-full">
                    {/* Header */}
                    <div className="mb-8 text-center">
                        <Link
                            to="/"
                            className="text-3xl font-bold tracking-tight text-slate-900"
                        >
                            out-ere
                            <span className="text-indigo-600">.</span>
                        </Link>

                        <h1 className="mt-8 text-3xl font-bold tracking-tight text-slate-900">
                            Create your account
                        </h1>

                        <p className="mt-2 text-sm text-slate-500">
                            Join Out-ere and start discovering student
                            activities.
                        </p>
                    </div>

                    {/* Register card */}
                    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                        <form
                            onSubmit={handleSubmit}
                            className="space-y-5"
                        >
                            {/* Error */}
                            {error && (
                                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                                    {error}
                                </div>
                            )}

                            {/* Email */}
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

                            {/* Password */}
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
                                        placeholder="Create a password"
                                        autoComplete="new-password"
                                        required
                                        className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50"
                                    />
                                </div>

                                <p className="mt-2 text-xs text-slate-400">
                                    Use at least 6 characters.
                                </p>
                            </div>

                            {/* Confirm password */}
                            <div>
                                <label
                                    htmlFor="confirmPassword"
                                    className="mb-2 block text-sm font-semibold text-slate-700"
                                >
                                    Confirm password
                                </label>

                                <div className="relative">
                                    <LockKeyhole
                                        size={18}
                                        className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                                    />

                                    <input
                                        id="confirmPassword"
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(event) =>
                                            setConfirmPassword(
                                                event.target.value
                                            )
                                        }
                                        placeholder="Confirm your password"
                                        autoComplete="new-password"
                                        required
                                        className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50"
                                    />
                                </div>
                            </div>

                            {/* Submit */}
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {isSubmitting
                                    ? "Creating account..."
                                    : "Create account"}

                                {!isSubmitting && (
                                    <ArrowRight size={17} />
                                )}
                            </button>
                        </form>

                        {/* Login link */}
                        <div className="mt-6 border-t border-slate-100 pt-6 text-center">
                            <p className="text-sm text-slate-500">
                                Already have an account?{" "}
                                <Link
                                    to="/login"
                                    className="font-semibold text-indigo-600 transition hover:text-indigo-700"
                                >
                                    Sign in
                                </Link>
                            </p>
                        </div>
                    </div>

                    <p className="mt-6 text-center text-xs leading-5 text-slate-400">
                        By creating an account, you agree to use Out-ere
                        responsibly and respect the university community.
                    </p>
                </div>
            </div>
        </div>
    )
}

export default Register