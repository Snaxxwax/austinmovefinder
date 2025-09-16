import { describe, it, expect } from 'vitest'
import { cn, austinNeighborhoods, movingChecklist, austinMovingTips } from '../utils'

describe('Austin Utils', () => {
  describe('cn utility function', () => {
    it('merges class names correctly', () => {
      expect(cn('class1', 'class2')).toBe('class1 class2')
    })

    it('handles conditional classes', () => {
      expect(cn('base', true && 'conditional', false && 'hidden')).toBe('base conditional')
    })

    it('merges Tailwind classes with proper precedence', () => {
      expect(cn('p-4', 'p-2')).toBe('p-2')
    })
  })

  describe('Austin Neighborhoods Data', () => {
    it('contains comprehensive neighborhood information', () => {
      expect(austinNeighborhoods).toHaveLength(25)
      expect(austinNeighborhoods[0]).toHaveProperty('name')
      expect(austinNeighborhoods[0]).toHaveProperty('slug')
      expect(austinNeighborhoods[0]).toHaveProperty('description')
      expect(austinNeighborhoods[0]).toHaveProperty('averageRent')
      expect(austinNeighborhoods[0]).toHaveProperty('walkScore')
      expect(austinNeighborhoods[0]).toHaveProperty('features')
      expect(austinNeighborhoods[0]).toHaveProperty('zipCodes')
      expect(austinNeighborhoods[0]).toHaveProperty('coordinates')
    })

    it('includes major Austin neighborhoods', () => {
      const neighborhoodNames = austinNeighborhoods.map(n => n.name)

      expect(neighborhoodNames).toContain('Downtown Austin')
      expect(neighborhoodNames).toContain('South Austin (SoCo)')
      expect(neighborhoodNames).toContain('East Austin')
      expect(neighborhoodNames).toContain('West Lake Hills')
      expect(neighborhoodNames).toContain('Cedar Park')
      expect(neighborhoodNames).toContain('Round Rock')
      expect(neighborhoodNames).toContain('The Domain')
      expect(neighborhoodNames).toContain('Mueller')
      expect(neighborhoodNames).toContain('Zilker')
    })

    it('has proper data structure for each neighborhood', () => {
      austinNeighborhoods.forEach(neighborhood => {
        expect(neighborhood.name).toBeTruthy()
        expect(neighborhood.slug).toBeTruthy()
        expect(neighborhood.description).toBeTruthy()
        expect(neighborhood.averageRent).toMatch(/^\$[\d,]+$/)
        expect(neighborhood.walkScore).toBeGreaterThanOrEqual(0)
        expect(neighborhood.walkScore).toBeLessThanOrEqual(100)
        expect(Array.isArray(neighborhood.features)).toBe(true)
        expect(neighborhood.features.length).toBeGreaterThan(0)
        expect(Array.isArray(neighborhood.zipCodes)).toBe(true)
        expect(neighborhood.zipCodes.length).toBeGreaterThan(0)
        expect(neighborhood.coordinates).toHaveProperty('lat')
        expect(neighborhood.coordinates).toHaveProperty('lng')
        expect(typeof neighborhood.coordinates.lat).toBe('number')
        expect(typeof neighborhood.coordinates.lng).toBe('number')
      })
    })

    it('includes Austin-specific features and amenities', () => {
      const downtown = austinNeighborhoods.find(n => n.name === 'Downtown Austin')
      expect(downtown?.features).toContain('Public transportation')
      expect(downtown?.features).toContain('Business district')

      const soco = austinNeighborhoods.find(n => n.name === 'South Austin (SoCo)')
      expect(soco?.features).toContain('Zilker Park (350+ acres)')
      expect(soco?.features).toContain('Barton Springs Pool')
      expect(soco?.features).toContain('Austin City Limits Festival')
      expect(soco?.features).toContain('Keep Austin Weird culture')

      const eastAustin = austinNeighborhoods.find(n => n.name === 'East Austin')
      expect(eastAustin?.features).toContain('Art galleries')
      expect(eastAustin?.features).toContain('Creative community')
    })

    it('has realistic Austin zip codes', () => {
      const allZipCodes = austinNeighborhoods.flatMap(n => n.zipCodes)

      // Check for common Austin zip codes
      expect(allZipCodes).toContain('78701') // Downtown
      expect(allZipCodes).toContain('78704') // South Austin
      expect(allZipCodes).toContain('78702') // East Austin
      expect(allZipCodes).toContain('78758') // North Austin/Domain
      expect(allZipCodes).toContain('78746') // West Austin

      // All zip codes should be Austin area (787xx or 786xx)
      allZipCodes.forEach(zip => {
        expect(zip).toMatch(/^787\d{2}$|^786\d{2}$/)
      })
    })

    it('has reasonable rent prices for Austin market', () => {
      austinNeighborhoods.forEach(neighborhood => {
        const rentNumber = parseInt(neighborhood.averageRent.replace(/[$,]/g, ''))
        expect(rentNumber).toBeGreaterThan(1000) // Minimum reasonable rent
        expect(rentNumber).toBeLessThan(5000) // Maximum reasonable rent
      })
    })

    it('includes specific Austin landmarks and businesses', () => {
      const cedarPark = austinNeighborhoods.find(n => n.name === 'Cedar Park')
      expect(cedarPark?.features).toContain('H-E-B Center venues')
      expect(cedarPark?.features).toContain('Nebraska Furniture Mart (2025)')

      const pflugerville = austinNeighborhoods.find(n => n.name === 'Pflugerville')
      expect(pflugerville?.features).toContain('Lake Pflugerville (180 acres)')
      expect(pflugerville?.features).toContain('Hawaiian Falls waterpark')
    })

    it('has unique slugs for each neighborhood', () => {
      const slugs = austinNeighborhoods.map(n => n.slug)
      const uniqueSlugs = new Set(slugs)
      expect(uniqueSlugs.size).toBe(slugs.length)
    })

    it('maintains proper geographic coordinates for Austin area', () => {
      austinNeighborhoods.forEach(neighborhood => {
        // Austin area latitude range: ~30.1 to 30.6
        expect(neighborhood.coordinates.lat).toBeGreaterThan(30.1)
        expect(neighborhood.coordinates.lat).toBeLessThan(30.6)

        // Austin area longitude range: ~-98.1 to -97.5
        expect(neighborhood.coordinates.lng).toBeGreaterThan(-98.1)
        expect(neighborhood.coordinates.lng).toBeLessThan(-97.5)
      })
    })
  })

  describe('Moving Checklist Data', () => {
    it('provides comprehensive moving timeline', () => {
      expect(movingChecklist).toHaveLength(5)

      const timelines = movingChecklist.map(item => item.timeline)
      expect(timelines).toContain('8 weeks before')
      expect(timelines).toContain('6 weeks before')
      expect(timelines).toContain('4 weeks before')
      expect(timelines).toContain('2 weeks before')
      expect(timelines).toContain('Moving week')
    })

    it('includes Austin-specific moving tasks', () => {
      const allTasks = movingChecklist.flatMap(item => item.tasks)

      expect(allTasks).toContain('Research Austin neighborhoods')
      expect(allTasks).toContain('Research Austin utilities (Austin Energy, etc.)')
      expect(allTasks).toContain('Research Austin schools if you have kids')
      expect(allTasks).toContain('Research Texas vehicle registration')
      expect(allTasks).toContain('Research Texas driver\'s license requirements')
    })

    it('has proper structure for each timeline item', () => {
      movingChecklist.forEach(item => {
        expect(item).toHaveProperty('timeline')
        expect(item).toHaveProperty('tasks')
        expect(Array.isArray(item.tasks)).toBe(true)
        expect(item.tasks.length).toBeGreaterThan(0)
        expect(typeof item.timeline).toBe('string')
      })
    })

    it('includes essential pre-move research tasks', () => {
      const earlyTasks = movingChecklist
        .filter(item => item.timeline.includes('8 weeks') || item.timeline.includes('6 weeks'))
        .flatMap(item => item.tasks)

      expect(earlyTasks).toContain('Research Austin neighborhoods')
      expect(earlyTasks).toContain('Get moving quotes from local companies')
      expect(earlyTasks).toContain('Start apartment/house hunting')
    })

    it('includes Texas-specific legal requirements', () => {
      const allTasks = movingChecklist.flatMap(item => item.tasks)

      expect(allTasks).toContain('Research Texas vehicle registration')
      expect(allTasks).toContain('Research Texas driver\'s license requirements')
      expect(allTasks).toContain('Update voter registration')
    })
  })

  describe('Austin Moving Tips Data', () => {
    it('provides Austin-specific moving advice', () => {
      expect(austinMovingTips).toHaveLength(4)

      austinMovingTips.forEach(tip => {
        expect(tip).toHaveProperty('title')
        expect(tip).toHaveProperty('content')
        expect(typeof tip.title).toBe('string')
        expect(typeof tip.content).toBe('string')
        expect(tip.title.length).toBeGreaterThan(0)
        expect(tip.content.length).toBeGreaterThan(0)
      })
    })

    it('includes seasonal moving advice for Austin climate', () => {
      const seasonalTip = austinMovingTips.find(tip =>
        tip.title.includes('Best Time to Move')
      )

      expect(seasonalTip).toBeDefined()
      expect(seasonalTip?.content).toContain('summer months')
      expect(seasonalTip?.content).toContain('June-August')
      expect(seasonalTip?.content).toContain('hottest')
    })

    it('addresses Austin traffic patterns', () => {
      const trafficTip = austinMovingTips.find(tip =>
        tip.title.includes('Traffic')
      )

      expect(trafficTip).toBeDefined()
      expect(trafficTip?.content).toContain('I-35')
      expect(trafficTip?.content).toContain('MoPac')
      expect(trafficTip?.content).toContain('183')
      expect(trafficTip?.content).toContain('rush hour')
    })

    it('covers Texas residency requirements', () => {
      const residencyTip = austinMovingTips.find(tip =>
        tip.title.includes('Texas Residency')
      )

      expect(residencyTip).toBeDefined()
      expect(residencyTip?.content).toContain('90 days')
      expect(residencyTip?.content).toContain('Texas driver\'s license')
      expect(residencyTip?.content).toContain('30 days')
      expect(residencyTip?.content).toContain('register your vehicle')
    })

    it('provides Austin utility information', () => {
      const utilityTip = austinMovingTips.find(tip =>
        tip.title.includes('Austin Utility')
      )

      expect(utilityTip).toBeDefined()
      expect(utilityTip?.content).toContain('Austin Energy')
      expect(utilityTip?.content).toContain('City of Austin')
      expect(utilityTip?.content).toContain('Google Fiber')
      expect(utilityTip?.content).toContain('Spectrum')
      expect(utilityTip?.content).toContain('AT&T')
    })

    it('has unique titles for each tip', () => {
      const titles = austinMovingTips.map(tip => tip.title)
      const uniqueTitles = new Set(titles)
      expect(uniqueTitles.size).toBe(titles.length)
    })
  })

  describe('Data Consistency', () => {
    it('has consistent Austin references across all data', () => {
      // Check neighborhoods mention Austin
      const neighborhoodDescriptions = austinNeighborhoods.map(n => n.description).join(' ')
      expect(neighborhoodDescriptions.toLowerCase()).toContain('austin')

      // Check moving tips mention Austin
      const tipContent = austinMovingTips.map(t => t.content).join(' ')
      expect(tipContent.toLowerCase()).toContain('austin')
    })

    it('maintains consistent data types', () => {
      // All neighborhood walk scores should be numbers
      austinNeighborhoods.forEach(neighborhood => {
        expect(typeof neighborhood.walkScore).toBe('number')
      })

      // All coordinates should be valid numbers
      austinNeighborhoods.forEach(neighborhood => {
        expect(Number.isFinite(neighborhood.coordinates.lat)).toBe(true)
        expect(Number.isFinite(neighborhood.coordinates.lng)).toBe(true)
      })
    })

    it('has no duplicate neighborhood names', () => {
      const names = austinNeighborhoods.map(n => n.name)
      const uniqueNames = new Set(names)
      expect(uniqueNames.size).toBe(names.length)
    })
  })

  describe('Austin Market Research', () => {
    it('includes diverse price ranges for different demographics', () => {
      const rentPrices = austinNeighborhoods.map(n =>
        parseInt(n.averageRent.replace(/[$,]/g, ''))
      )

      const minRent = Math.min(...rentPrices)
      const maxRent = Math.max(...rentPrices)

      // Should have affordable options under $2000
      expect(minRent).toBeLessThan(2000)

      // Should have luxury options over $3000
      expect(maxRent).toBeGreaterThan(3000)

      // Should have good spread
      expect(maxRent - minRent).toBeGreaterThan(1500)
    })

    it('reflects Austin\'s tech industry presence', () => {
      const features = austinNeighborhoods.flatMap(n => n.features).join(' ').toLowerCase()

      expect(features).toContain('tech')
      expect(features).toContain('dell') // Major Austin employer
    })

    it('captures Austin\'s cultural identity', () => {
      const features = austinNeighborhoods.flatMap(n => n.features).join(' ').toLowerCase()

      expect(features).toContain('music')
      expect(features).toContain('keep austin weird')
      expect(features).toContain('live music')
      expect(features).toContain('sxsw')
    })
  })
})