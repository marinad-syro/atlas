import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import ResultsPanel from '../../app/components/ResultsPanel'
import type { TripCard } from '../../app/page'

const EMPTY_TRIP: TripCard = {
  summary: null,
  destination: null,
  flights: null,
  hotels: null,
  activities: null,
  multiCity: null,
  deepDives: null,
}

describe('ResultsPanel', () => {
  it('shows empty state when no trip data', () => {
    render(<ResultsPanel tripCard={EMPTY_TRIP} />)
    expect(screen.getByText('Your trip plan will appear here')).toBeInTheDocument()
  })

  it('shows destination when provided', () => {
    const trip: TripCard = {
      ...EMPTY_TRIP,
      destination: {
        destinations: [{ name: 'Tokyo', summary: 'Great city', source_url: 'https://example.com' }],
      },
    }
    render(<ResultsPanel tripCard={trip} />)
    expect(screen.getByText('Tokyo')).toBeInTheDocument()
    expect(screen.getByText('Great city')).toBeInTheDocument()
  })

  it('shows hotel names', () => {
    const trip: TripCard = {
      ...EMPTY_TRIP,
      hotels: {
        hotels: [{ name: 'Park Hyatt', highlight: 'Great views', booking_url: 'https://booking.com/1' }],
      },
    }
    render(<ResultsPanel tripCard={trip} />)
    expect(screen.getByText('Park Hyatt')).toBeInTheDocument()
  })

  it('shows activity names and descriptions', () => {
    const trip: TripCard = {
      ...EMPTY_TRIP,
      activities: {
        activities: [{ name: 'Visit Mount Fuji', description: 'Iconic peak' }],
      },
    }
    render(<ResultsPanel tripCard={trip} />)
    expect(screen.getByText('Visit Mount Fuji')).toBeInTheDocument()
    expect(screen.getByText('Iconic peak')).toBeInTheDocument()
  })

  it('shows summary bullets when provided', () => {
    const trip: TripCard = {
      ...EMPTY_TRIP,
      summary: { bullets: ['Fly to Tokyo', 'Stay 5 nights'] },
    }
    render(<ResultsPanel tripCard={trip} />)
    expect(screen.getByText('Fly to Tokyo')).toBeInTheDocument()
    expect(screen.getByText('Stay 5 nights')).toBeInTheDocument()
  })

  it('shows multi-city itinerary header when multiCity provided', () => {
    const trip: TripCard = {
      ...EMPTY_TRIP,
      multiCity: {
        ordered_cities: ['Paris', 'Rome'],
        legs: [
          { from: 'NYC', to: 'Paris', nights: 3, arrive: '2026-04-01', depart: '2026-04-04', options: [] },
          { from: 'Paris', to: 'Rome', nights: 4, arrive: '2026-04-04', depart: '2026-04-08', options: [] },
        ],
        segments: [],
      },
    }
    render(<ResultsPanel tripCard={trip} />)
    expect(screen.getByText('Multi-City Itinerary')).toBeInTheDocument()
    expect(screen.getAllByText('Paris').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Rome').length).toBeGreaterThan(0)
  })
})
