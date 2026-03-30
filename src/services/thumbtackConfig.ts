export interface ThumbtackServiceConfig {
  serviceKey: string;
  categoryPk: string;
  searchQuery: string;
  displayName: string;
  headline: string;
  subtitle: string;
}

export const THUMBTACK_SERVICES: Record<string, ThumbtackServiceConfig> = {
  windows: {
    serviceKey: 'windows',
    categoryPk: '166570397309092258',
    searchQuery: 'window installation',
    displayName: 'Window Installation',
    headline: 'Compare & Book Top-Rated Window Pros Near You in Minutes',
    subtitle: 'Compare local window specialists with verified reviews',
  },
  roofing: {
    serviceKey: 'roofing',
    categoryPk: '174454027063083482',
    searchQuery: 'roofing',
    displayName: 'Roofing',
    headline: 'Compare & Book Top-Rated Roofing Pros Near You in Minutes',
    subtitle: 'Compare local roofing contractors with verified reviews',
  },
  hvac: {
    serviceKey: 'hvac',
    categoryPk: '135559407444107609',
    searchQuery: 'hvac',
    displayName: 'HVAC',
    headline: 'Compare & Book Top-Rated HVAC Pros Near You in Minutes',
    subtitle: 'Compare local heating & cooling specialists with verified reviews',
  },
};

export interface ThumbtackBusiness {
  businessID: string;
  businessName: string;
  businessIntroduction: string;
  businessLocation: string;
  rating: number;
  numberOfReviews: number;
  numberOfHires: number;
  yearsInBusiness: number;
  isTopPro: boolean;
  isBackgroundChecked: boolean;
  featuredReview: string;
  featuredReviewerName: string;
  responseTimeHours: number;
  businessImageURL: string;
  servicePageURL: string;
  quote: {
    startingCost: number;
    maximumCost: number;
    costUnit: string;
  };
  pills: string[];
  opinionatedSignal: string;
  widgets: {
    requestFlowURL: string;
    servicePageURL: string;
  };
}

export interface ThumbtackSearchResponse {
  searchID: string;
  data: ThumbtackBusiness[];
  metadata: {
    categoryID: string;
    categoryName: string;
  };
}

export async function searchThumbtackPros(
  searchQuery: string,
  zipCode: string,
  limit: number = 10,
  utmParams: Record<string, string> = {}
): Promise<ThumbtackSearchResponse> {
  const response = await fetch('/api/thumbtack-search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ searchQuery, zipCode, limit, utmParams }),
  });

  if (!response.ok) {
    throw new Error('Failed to search for pros');
  }

  return response.json();
}
