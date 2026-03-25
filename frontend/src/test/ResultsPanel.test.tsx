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

  it('shows hotel names and booking links', () => {
    const trip: TripCard = {
      ...EMPTY_TRIP,
      hotels: {
        hotels: [{ name: 'Park Hyatt', highlight: 'Great views', booking_url: 'https://booking.com/1' }],
      },
    }
    render(<ResultsPanel tripCard={trip} />)
    expect(screen.getByText('Park Hyatt')).toBeInTheDocument()
  })

  it('shows activity names in numbered list', () => {
    const trip: TripCard = {
      ...EMPTY_TRIP,
      activities: {
        activities: [{ name: 'Visit Mount Fuji', description: 'Iconic peak' }],
      },
    }
    render(<ResultsPanel tripCard={trip} />)
    expect(screen.getByText('Visit Mount Fuji')).toBeInTheDocument()
    expect(screen.getByText('01')).toBeInTheDocument()
  })

  it('hides section icons when no data', () => {
    render(<ResultsPanel tripCard={EMPTY_TRIP} />)
    // Icons row should not render when no data
    expect(screen.queryByText('✈️')).not.toBeInTheDocument()
  })
})
