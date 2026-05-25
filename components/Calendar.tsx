'use client'

import { useEffect, useState } from 'react'

import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'

import { supabase } from '@/lib/supabase'

export default function Calendar() {

  const [properties, setProperties] = useState<any[]>([])
  const [selected, setSelected] = useState<any>(null)

  const [guests, setGuests] = useState(1)

  const [range, setRange] = useState<any>(null)

  const [total, setTotal] = useState(0)

  // LOAD DATA
  useEffect(() => {

    const load = async () => {

      const { data: rooms } = await supabase
        .from('rooms')
        .select('*')

      const { data: sheds } = await supabase
        .from('sheds')
        .select('*')

      const formattedRooms =
        (rooms || []).map((r: any) => ({
          ...r,
          type: 'room'
        }))

      const formattedSheds =
        (sheds || []).map((s: any) => ({
          ...s,
          type: 'shed'
        }))

      setProperties([
        ...formattedRooms,
        ...formattedSheds
      ])
    }

    load()

  }, [])

  // SELECT DATES
  const handleSelect = (info: any) => {

    const start = new Date(info.startStr)
    const end = new Date(info.endStr)

    const nights =
      (end.getTime() - start.getTime()) /
      (1000 * 60 * 60 * 24)

    setRange({
      start: info.startStr,
      end: info.endStr,
      nights
    })
  }

  // CALCULATE PRICE
  useEffect(() => {

    const calculatePrice = async () => {

      if (!selected || !range) return

      let price = 0

      // ROOM
      if (selected.type === 'room') {

        const { data } = await supabase
          .from('room_pricing')
          .select('*')
          .eq('room_id', selected.id)
          .eq('guests', guests)
          .single()

        price = data?.price || 0
      }

      // SHED
      if (selected.type === 'shed') {

        const { data } = await supabase
          .from('shed_pricing')
          .select('*')
          .eq('shed_id', selected.id)
          .eq('guests', guests)
          .single()

        price = data?.price || 0
      }

      const total =
        price *
        Math.max(1, range.nights)

      setTotal(total)
    }

    calculatePrice()

  }, [selected, guests, range])

  return (

    <div style={{ padding: 20 }}>

      <h1>Booking Calendar</h1>

      {/* PROPERTY BUTTONS */}
      <div style={{ marginBottom: 20 }}>

        {properties.map((p) => (

          <button
            key={p.id}
            onClick={() => setSelected(p)}
            style={{
              marginRight: 10,
              padding: 10,
              background:
                selected?.id === p.id
                  ? 'black'
                  : 'gray',
              color: 'white'
            }}
          >
            {p.name} ({p.type})
          </button>

        ))}

      </div>

      {/* GUESTS */}
      <div style={{ marginBottom: 20 }}>

        <select
          value={guests}
          onChange={(e) =>
            setGuests(Number(e.target.value))
          }
        >
          <option value={1}>1 guest</option>
          <option value={2}>2 guests</option>
          <option value={3}>3 guests</option>
        </select>

      </div>

      {/* RANGE */}
      {range && (

        <div style={{ marginBottom: 20 }}>

          <strong>Dates:</strong>

          <br />

          {range.start} → {range.end}

          <br />

          Nights: {range.nights}

        </div>

      )}

      {/* TOTAL */}
      <div style={{ marginBottom: 20 }}>

        <strong>Total:</strong>

        <br />

        ${total}

      </div>

      {/* CALENDAR */}
      <FullCalendar
        plugins={[
          dayGridPlugin,
          interactionPlugin
        ]}
        initialView="dayGridMonth"
        selectable={true}
        select={handleSelect}
      />

    </div>
  )
}