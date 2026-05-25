import { supabase } from './supabase'

export async function getRoomPrice(roomId: string, guests: number) {
  const { data, error } = await supabase
    .from('room_pricing')
    .select('price')
    .eq('room_id', roomId)
    .eq('guests', guests)
    .single()

  if (error) {
    console.error(error)
    return 0
  }

  return data?.price || 0
}

export function calculateNights(start: string, end: string) {
  const s = new Date(start)
  const e = new Date(end)

  return Math.max(1, (e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24))
}