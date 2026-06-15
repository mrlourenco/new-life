import { useState, useEffect } from 'react'
import type { User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import { initSync, pullAll, pushAll } from '../lib/sync'

const redirectTo = window.location.origin + import.meta.env.BASE_URL

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [emailSent, setEmailSent] = useState(false)

  useEffect(() => {
    initSync()

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
      if (session?.user) {
        setSyncing(true)
        pullAll()
          .then(changed => { if (changed) window.location.reload() })
          .finally(() => setSyncing(false))
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null)
      if (event === 'SIGNED_IN') {
        setSyncing(true)
        try {
          // Pull first so remote data wins over empty local defaults,
          // then push any local-only entities the remote doesn't have yet.
          const changed = await pullAll()
          await pushAll()
          if (changed) window.location.reload()
        } finally {
          setSyncing(false)
        }
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email: string) => {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: redirectTo },
    })
    if (!error) setEmailSent(true)
    return { error }
  }

  const signInWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo },
    })
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
  }

  const syncNow = async () => {
    if (!user) return
    setSyncing(true)
    try {
      const changed = await pullAll()
      await pushAll()
      if (changed) window.location.reload()
    } finally {
      setSyncing(false)
    }
  }

  return { user, loading, syncing, emailSent, signIn, signInWithGoogle, signOut, syncNow }
}
