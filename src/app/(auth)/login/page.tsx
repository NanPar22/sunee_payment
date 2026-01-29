'use client'

import { useState } from "react"
import { useLogin } from "@/hooks/useLogin"

export default function LoginForm() {
  const {
    username,
    password,
    setUsername,
    setPassword,
    isLoading,
    error,
    login,
  } = useLogin()

  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    login()
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white px-8 py-10 rounded-3xl shadow-lg w-full max-w-md flex flex-col gap-5 justify-center items-center"
    >
      {/* Avatar */}
      <div className="w-20 bg-linear-to-br from-blue-400 to-blue-600 h-20 rounded-full flex items-center justify-center text-white text-3xl shadow-lg">
        <i className="fa-solid fa-user"></i>
      </div>

      {/* Title */}
      <label className="font-main text-5xl font-bold mb-6">
        Sign in
      </label>

      {/* Error Message */}
      {error && (
        <div className="w-full bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">
          <i className="fa-solid fa-circle-exclamation mr-2"></i>
          {error}
        </div>
      )}

      {/* Username Field */}
      <div className="w-full flex flex-col gap-2">
        <label htmlFor="username" className="text-xl font-main pl-3">
          Username
        </label>
        <div className="w-full relative">
          <i className="fa-solid fa-user absolute top-1/2 -translate-y-1/2 right-4 text-gray-400"></i>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Username"
            required
            className="w-full bg-[#eef2f5] font-main rounded-[14px] text-xl pl-4 pr-12 py-3 border-none focus:outline-none focus:ring-2 focus:ring-[#B3E5FC] transition"
          />
        </div>
      </div>

      {/* Password Field */}
      <div className="w-full flex flex-col gap-2">
        <label htmlFor="password" className="text-xl font-main pl-3">
          Password
        </label>
        <div className="w-full relative">
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute top-1/2 -translate-y-1/2 right-4 text-gray-400 hover:text-gray-600 transition"
          >
            <i
              className={`fa-solid ${
                showPassword ? "fa-eye" : "fa-eye-slash"
              }`}
            />
          </button>

          <input
            type={showPassword ? "text" : "password"}
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            required
            className="w-full bg-[#eef2f5] font-main rounded-[14px] text-xl pl-4 pr-12 py-3 border-none focus:outline-none focus:ring-2 focus:ring-[#B3E5FC] transition"
          />
        </div>
      </div>

      {/* Forgot Password */}
      <div className="w-full flex justify-end">
        <a
          href="#"
          className="text-sm text-blue-500 hover:text-blue-700 transition"
        >
          ลืมรหัสผ่าน?
        </a>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading}
        className="btn-main w-full py-3 rounded-[14px] bg-linear-to-r from-blue-500 to-blue-600 text-white font-medium text-xl hover:from-blue-600 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <i className="fa-solid fa-spinner fa-spin"></i>
            กำลังเข้าสู่ระบบ...
          </span>
        ) : (
          "Sign in"
        )}
      </button>
    </form>
  )
}
