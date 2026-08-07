import { describe, it, expect, vi, beforeEach } from 'vitest';
import { calculateDistance, getGoogleMapsNavigationUrl } from '../../shared/services/maps';

describe('Maps Unit Services', () => {
  beforeEach(() => {
    delete window.google;
  });

  describe('calculateDistance() - Haversine Spherical Math & Fallback', () => {
    const testCityPairs = [
      { origin: 'Tel Aviv', dest: 'Ramat Gan', minKm: 0.5, maxKm: 15 },
      { origin: 'Tel Aviv', dest: 'Haifa', minKm: 70, maxKm: 130 },
      { origin: 'Jerusalem', dest: 'Tel Aviv', minKm: 45, maxKm: 90 },
      { origin: 'Netanya', dest: 'Petah Tikva', minKm: 15, maxKm: 60 },
      { origin: 'Herzliya', dest: 'Givatayim', minKm: 5, maxKm: 30 },
    ];

    testCityPairs.forEach(({ origin, dest, minKm, maxKm }, idx) => {
      it(`calculates reasonable distance between ${origin} and ${dest} (pair #${idx + 1})`, async () => {
        const result = await calculateDistance(origin, dest);
        expect(result.numericKm).toBeGreaterThanOrEqual(minKm);
        expect(result.numericKm).toBeLessThanOrEqual(maxKm);
        expect(result.distance).toContain('km');
        expect(result.time).toContain('mins');
        expect(result.numericMinutes).toBeGreaterThan(0);
      });
    });

    it('applies street winding factor offset for identical or intra-street addresses', async () => {
      const result = await calculateDistance('Rothschild Blvd, Tel Aviv', 'Rothschild Blvd, Tel Aviv');
      expect(result.numericKm).toBeGreaterThan(0);
      expect(result.numericMinutes).toBeGreaterThanOrEqual(8);
    });

    it('uses Google Maps DistanceMatrixService when available on window', async () => {
      const mockGetDistanceMatrix = vi.fn((req, callback) => {
        setTimeout(() => {
          callback({
            rows: [
              {
                elements: [
                  {
                    status: 'OK',
                    distance: { value: 12500 }, // 12.5 km
                    duration: { value: 900 }    // 15 mins
                  }
                ]
              }
            ]
          }, 'OK');
        }, 0);
      });

      function MockService() {
        this.getDistanceMatrix = mockGetDistanceMatrix;
      }

      window.google = {
        maps: {
          DistanceMatrixService: MockService,
          TravelMode: { DRIVING: 'DRIVING' }
        }
      };

      const result = await calculateDistance('Tel Aviv', 'Herzliya');
      expect(result.numericKm).toBe(12.5);
      expect(result.numericMinutes).toBe(15);
      expect(result.formattedEta).toBe('15 min (12.5 km away)');
    });

    it('falls back to Haversine if Google DistanceMatrixService returns non-OK status', async () => {
      window.google = {
        maps: {
          DistanceMatrixService: vi.fn().mockImplementation(() => ({
            getDistanceMatrix: (req, callback) => callback(null, 'REQUEST_DENIED')
          })),
          TravelMode: { DRIVING: 'DRIVING' }
        }
      };

      const result = await calculateDistance('Tel Aviv', 'Haifa');
      expect(result.numericKm).toBeGreaterThan(50);
    });
  });

  describe('getGoogleMapsNavigationUrl()', () => {
    it('returns default maps URL when address is empty', () => {
      expect(getGoogleMapsNavigationUrl('')).toBe('https://maps.google.com');
      expect(getGoogleMapsNavigationUrl(null)).toBe('https://maps.google.com');
      expect(getGoogleMapsNavigationUrl(undefined)).toBe('https://maps.google.com');
    });

    it('returns valid search query URL for address', () => {
      const url = getGoogleMapsNavigationUrl('Dizengoff St 100, Tel Aviv');
      expect(url).toContain('https://www.google.com/maps/search/?api=1&query=Dizengoff%20St%20100%2C%20Tel%20Aviv');
    });
  });
});
