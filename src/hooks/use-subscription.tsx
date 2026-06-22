import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'

export function useSubscription() {
  const { user } = useAuth()
  const [isActive, setIsActive] = useState<boolean>(true)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      setIsLoading(false)
      return
    }
    const fetchSub = async () => {
      try {
        const { data, error } = await supabase
          .from('assinaturas')
          .select('status')
          .eq('user_id', user.id)
          .maybeSingle()

        if (error || !data) {
          setIsActive(false)
        } else {
          setIsActive(data.status === 'ativo')
        }
      } catch (e) {
        setIsActive(false)
      } finally {
        setIsLoading(false)
      }
    }
    fetchSub()
  }, [user])

  return { isActive, isLoading }
}
