"use client"

import { createContext, useContext, useEffect, useState } from 'react'
import { User } from 'firebase/auth'
import { auth, getCurrentUser, signOut as firebaseSignOut } from '@/lib/firebase'
import { onAuthStateChanged } from 'firebase/auth'

interface UserData {
  uid: string
  email: string
  name: string
  role: 'recruiter' | 'applicant'
  orgId?: string
  orgName?: string
}

interface AuthContextType {
  user: User | null
  userData: UserData | null
  loading: boolean
  signOut: () => Promise<void>
  refreshUserData: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [userData, setUserData] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchUserData = async (firebaseUser: User) => {
    try {
      const token = await firebaseUser.getIdToken()
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/sync`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        setUserData(data.user)
        localStorage.setItem('userData', JSON.stringify(data.user))
      }
    } catch (error) {
      console.error('Failed to fetch user data:', error)
    }
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser)
      
      if (firebaseUser) {
        // Try to get from localStorage first
        const cached = localStorage.getItem('userData')
        if (cached) {
          setUserData(JSON.parse(cached))
        }
        
        // Fetch fresh data
        await fetchUserData(firebaseUser)
      } else {
        setUserData(null)
        localStorage.removeItem('userData')
      }
      
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const refreshUserData = async () => {
    if (user) {
      await fetchUserData(user)
    }
  }

  const signOut = async () => {
    await firebaseSignOut()
    setUser(null)
    setUserData(null)
  }

  return (
    <AuthContext.Provider value={{ user, userData, loading, signOut, refreshUserData }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

