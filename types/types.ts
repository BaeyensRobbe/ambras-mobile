export enum Category {
  Spots = 'Spots',
  Gym = 'Gym',
  Non_spot = 'Non_spot',
  Parkour_park = 'Parkour_park',
  Challenge = 'Challenge',
  Poleslide = 'Poleslide',
  Descent = 'Descent',
  Roofgap = 'Roofgap',
  NBD = 'NBD',
}

export type Spot = {
  id: number;
  name: string;
  city: string;
  category?: Category;
  rating?: number;
  isFavorite: boolean;
  isCovered: boolean;
  isPkPark: boolean;
  hasFlipArea: boolean;
  hasSwings: boolean;
  hasWaterChallenge: boolean;
  websiteLink?: string;
  uploadedBy?: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  notes?: string;
  lat: number;
  lng: number;
  photos: Photo[];
};

export type ApprovedSpot = {
  id: number;
  name: string;
  city: string;
  notes?: string;
  category: Category;
  isFavorite: boolean;
  isCovered: boolean;
  isPkPark: boolean;
  hasFlipArea: boolean;
  hasSwings: boolean;
  hasWaterChallenge: boolean;
  websiteLink?: string;
  status: 'Approved';
  lat: number;
  lng: number;
  photos: Photo[];
}

export type formDataSpot = {
  id: number;
  name: string;
  city: string;
  category?: string;
  isFavorite: boolean;
  isCovered: boolean;
  isPkPark: boolean;
  hasFlipArea: boolean;
  hasSwings: boolean;
  hasWaterChallenge: boolean;
  websiteLink?: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  notes?: string;
  lat: number;
  lng: number;
  photos: (Photo | String)[];
}

export type editFormDataSpot = {
  id: number;
  name: string;
  city: string;
  category?: string;
  isFavorite: boolean;
  isCovered: boolean;
  isPkPark: boolean;
  hasFlipArea: boolean;
  hasSwings: boolean;
  status: 'Pending' | 'Approved' | 'Rejected';
  notes?: string;
  lat: number;
  lng: number;
  photos: (Photo)[];
}


export type addSpotData = {
  name: string;
  city: string;
  category?: string;
  isFavorite: boolean;
  isCovered: boolean;
  isPkPark: boolean;
  hasFlipArea: boolean;
  hasSwings: boolean;
  hasWaterChallenge: boolean;
  websiteLink?: string;
  lat: number;
  lng: number;
  photos: (Photo | String)[];
  notes?: string;  
}

export type CompleteSpot = {
  id: number;
  name: string;
  city: string;
  category?: string;
  rating?: number;
  isFavorite: boolean;
  lat: number;
  lng: number;
  isPkPark: boolean;
  isCovered: boolean;
  hasSwings: boolean;
  hasFlipArea: boolean;
  status: 'Pending' | 'Approved' | 'Rejected';
  notes?: string;
  photos: Photo[];
  createdAt: string;
};

export type Photo = {
  id: number;
  url: string;
  lowResUrl?: string;
  uuid: string;
  spotId: number;
  order?: number;
};


export type SpotFilters = {
  filterCategory: string;
  selectedCity: string;
  showPoleslides: boolean;
  showRoofgaps: boolean;
  showChallenges: boolean;
  showDescents: boolean;
  showNBDs: boolean;
  selectedFeatures: string[];
}

export interface SpotInsertPayload {
  name: string;
  notes?: string;
  city: string;
  lat: number;
  lng: number;
}

/** Returned shape for uploads */
export interface UploadResult {
  filePath: string;
  publicUrl: string | null;
}

export interface SpotSubmissionResult {
  success: boolean;
  spotId?: number;
  error?: Error;
}

export type Event = {
  "id": 2,
  "title": string,
  "description": string,
  "start_time": string,
  "end_time": string,
  "all_day": boolean,
  "location": string,
  "created_at": string,
  "updated_at": string
}

export type Task = {
  id: number;
  title: string;
  description?: string;
  due_date: string; // ISO date string
  completed: boolean;
}