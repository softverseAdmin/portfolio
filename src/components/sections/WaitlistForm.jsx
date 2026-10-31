"use client"

import { useState } from "react"

const KIT_FORM_ACTION = "https://app.kit.com/forms/10123090/subscriptions"

export default function WaitlistForm() {
  const [email, setEmail] = useState("")
  const [status, setStatus] = useState("idle") // idle | sending | success | error

  async function handleSubmit(e) {
    e.preventDefault()
    if (!email || status === "sending") return
    setStatus("sending")
    try {
      const body = new URLSearchParams({ email_address: email })
      const res = await fetch(KIT_FORM_ACTION, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Accept: "application/json",
        },
        body,
      })
      const data = await res.json().catch(() => null)
      // Kit's anti-bot guard sometimes quarantines a direct post and returns
      // a verification page URL instead. Hand the visitor to that page so
      // they can complete the human check and the signup goes through.
      if (data && data.status === "quarantined" && data.url) {
        window.location.href = data.url
        return
      }
      if (res.ok && (!data || data.status === "success" || data.status === undefined)) {
        setStatus("success")
      } else {
        setStatus("error")
      }
    } catch {
      setStatus("error")
    }
  }

  if (status === "success") {
    return (
      <p className="max-w-md mx-auto px-5 py-4 rounded-lg bg-gold/10 border border-gold/40 text-gold font-medium">
        You&apos;re on the list! I&apos;ll email you the moment the pack opens — waitlist members get the launch price.
      </p>
    )
  }

  return (
    <div className="max-w-md mx-auto">
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email address"
          className="flex-1 px-5 py-3.5 rounded-lg bg-charcoal/80 border border-gold/30 text-warm-white placeholder-warm-white/50 focus:outline-none focus:ring-2 focus:ring-gold focus:border-gold transition-all"
        />
        <button
          type="submit"
          disabled={status === "sending"}
          className="bg-gradient-gold hover:shadow-xl hover:shadow-gold/50 text-deep-black px-8 py-3.5 rounded-lg font-bold transition-all transform hover:scale-105 whitespace-nowrap disabled:opacity-60 disabled:transform-none"
        >
          {status === "sending" ? "Joining..." : "Join the Waitlist"}
        </button>
      </form>
      {status === "error" && (
        <p className="text-sm text-red-300 mt-4">
          Something went wrong while joining. Please try again in a moment.
        </p>
      )}
    </div>
  )
}
