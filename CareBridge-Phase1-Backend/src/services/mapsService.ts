import { HealthcareFacility, FacilityType } from '../types';
import { RURAL_HEALTHCARE_FACILITIES } from './mockData';

export interface UserCoordinates {
  lat: number;
  lng: number;
  label: string;
}

export const DEFAULT_RURAL_LOCATION: UserCoordinates = {
  lat: 27.5700,
  lng: 80.6750,
  label: 'Rampur Village Centre (Sitapur, UP)'
};

// Calculate geographic distance in Kilometers via Haversine equation
export function calculateDistanceKm(
  lat1: number, 
  lon1: number, 
  lat2: number, 
  lon2: number
): number {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

class MapsService {
  private facilities: HealthcareFacility[] = RURAL_HEALTHCARE_FACILITIES;

  public getFacilities(filter?: {
    type?: FacilityType | 'ALL';
    maxDistanceKm?: number;
    emergencyOnly?: boolean;
    searchQuery?: string;
  }): HealthcareFacility[] {
    let result = [...this.facilities];

    if (filter) {
      if (filter.type && filter.type !== 'ALL') {
        result = result.filter(f => f.type === filter.type);
      }
      if (filter.emergencyOnly) {
        result = result.filter(f => f.has24x7Emergency);
      }
      if (filter.maxDistanceKm) {
        result = result.filter(f => f.distanceKm <= filter.maxDistanceKm!);
      }
      if (filter.searchQuery) {
        const q = filter.searchQuery.toLowerCase().trim();
        result = result.filter(f => 
          f.name.toLowerCase().includes(q) ||
          f.address.toLowerCase().includes(q) ||
          f.services.some(s => s.toLowerCase().includes(q))
        );
      }
    }

    return result.sort((a, b) => a.distanceKm - b.distanceKm);
  }

  public getFacilityById(id: string): HealthcareFacility | undefined {
    return this.facilities.find(f => f.id === id);
  }

  public getEmergencyHelplines() {
    return [
      { name: 'National Ambulance Service', number: '108', desc: '24x7 Critical Medical Emergency & Accident Response' },
      { name: 'Janani Shishu Suraksha (Maternal)', number: '102', desc: 'Free Transport for Pregnant Women & Newborns' },
      { name: 'National Emergency Helpline', number: '112', desc: 'Police, Fire, and Emergency Assistance' },
      { name: 'Tele-MANAS (Mental Health)', number: '14416', desc: '24x7 Free Psychological Support & Counseling' }
    ];
  }
}

export const mapsService = new MapsService();
