import { useUser } from '@clerk/nextjs'
import { useEffect, useState } from 'react'

interface DatabaseUser {
  id: string
  email: string
  name: string
  role: 'ADMIN' | 'USER'
  isActive: boolean
  createdAt: string
}

export function useDatabaseUser() {
  const { user: clerkUser, isSignedIn } = useUser()
  const [dbUser, setDbUser] = useState<DatabaseUser | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isSignedIn || !clerkUser) {
      setDbUser(null)
      return
    }

    const syncAndGetUser = async () => {
      setLoading(true)
      setError(null)
      
      try {
        // Đồng bộ user với database
        await fetch('/api/users/sync', { method: 'POST' })
        
        // Lấy thông tin user từ database
        const response = await fetch('/api/users/me')
        const result = await response.json()
        
        if (result.success) {
          setDbUser(result.user)
        } else {
          setError(result.error)
        }
      } catch (err) {
        setError('Failed to sync user data')
        console.error('Error syncing user:', err)
      } finally {
        setLoading(false)
      }
    }

    syncAndGetUser()
  }, [isSignedIn, clerkUser])

  return {
    dbUser,
    loading,
    error,
    isAdmin: dbUser?.role === 'ADMIN'
  }
}