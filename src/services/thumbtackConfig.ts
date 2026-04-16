export interface ThumbtackServiceConfig {
  serviceKey: string;
  categoryPk: string;
  searchQuery: string;
  displayName: string;
  headline: string;
  subtitle: string;
  /**
   * When true, the backend will pass categoryPk to Thumbtack's search API so
   * only pros in that exact category are returned. Existing pages (windows,
   * roofing, hvac) leave this false to preserve their current broader
   * free-text search behavior.
   */
  strictCategory?: boolean;
}

// Shared copy helper so every new strict-category entry stays consistent.
const makeService = (
  serviceKey: string,
  categoryPk: string,
  searchQuery: string,
  displayName: string,
  subject: string
): ThumbtackServiceConfig => ({
  serviceKey,
  categoryPk,
  searchQuery,
  displayName,
  headline: `Compare & Book Top-Rated ${displayName} Pros Near You in Minutes`,
  subtitle: `Compare local ${subject} with verified reviews`,
  strictCategory: true,
});

export const THUMBTACK_SERVICES: Record<string, ThumbtackServiceConfig> = {
  // --- Existing pages — unchanged behavior (no strictCategory) ---
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

  // --- New strict-category pages (categoryPk forwarded to Thumbtack) ---
  roofing_install: makeService('roofing_install', '174454027063083482', 'roof installation', 'Roofing Installation', 'roofing installers'),
  kitchen_remodel: makeService('kitchen_remodel', '201565295100608806', 'kitchen remodel', 'Kitchen Remodeling', 'kitchen remodelers'),
  bath_remodel: makeService('bath_remodel', '201564094514635045', 'bathroom remodel', 'Bathroom Remodeling', 'bathroom remodelers'),
  hot_tub: makeService('hot_tub', '135563123555541341', 'hot tub installation', 'Hot Tub Installation', 'hot tub installers'),
  walk_in_tub: makeService('walk_in_tub', '135563123555541341', 'walk in tub installation', 'Walk-In Tub Installation', 'walk-in tub specialists'),
  siding_install: makeService('siding_install', '283110145487618506', 'siding installation', 'Siding Installation', 'siding installers'),
  hvac_install: makeService('hvac_install', '135559407444107609', 'heating and air conditioning', 'Heating & Air Conditioning', 'HVAC specialists'),
  water_heater: makeService('water_heater', '206936878363328818', 'water heater installation', 'Water Heater Installation', 'water heater installers'),
  basement_remodel: makeService('basement_remodel', '242254535857062374', 'basement remodeling', 'Basement Remodeling', 'basement remodelers'),
  roofing_repair: makeService('roofing_repair', '174455213291954651', 'roof repair', 'Roofing Repair', 'roof repair pros'),
  deck_addition: makeService('deck_addition', '212282574864154948', 'deck addition', 'Deck Addition & Remodel', 'deck builders'),
  flooring_install: makeService('flooring_install', '151436204227846419', 'flooring installation', 'Flooring Installation', 'flooring installers'),
  waterproofing: makeService('waterproofing', '135560437133164890', 'basement waterproofing', 'Basement Waterproofing', 'waterproofing pros'),
  interior_painting: makeService('interior_painting', '122681972262289742', 'interior painting', 'Interior Painting', 'interior painters'),
  mold_remediation: makeService('mold_remediation', '135814181314322843', 'mold remediation', 'Mold Remediation', 'mold remediation pros'),
  patio_addition: makeService('patio_addition', '242224544494477771', 'patio remodel addition', 'Patio Remodel & Addition', 'patio builders'),
  fence_install: makeService('fence_install', '167177250904949178', 'fence and gate installation', 'Fence & Gate Installation', 'fence installers'),
  gutters_install: makeService('gutters_install', '167180679626867134', 'gutter installation', 'Gutters Installation', 'gutter installers'),
  tree_service: makeService('tree_service', '240142059022278971', 'tree trimming and removal', 'Tree Trimming & Removal', 'tree service pros'),
  plumbing_install: makeService('plumbing_install', '150853516047139294', 'plumbing installation', 'Plumbing Installation', 'plumbers'),
  windows_install: makeService('windows_install', '166570397309092258', 'window installation', 'Windows Installation', 'window installers'),
  epoxy_floor: makeService('epoxy_floor', '266370366397415800', 'epoxy floor coating', 'Epoxy Floor Coating', 'epoxy floor specialists'),
  garage_door: makeService('garage_door', '166575067142390188', 'garage door installation', 'Garage Door Installation', 'garage door installers'),
  deck_repair: makeService('deck_repair', '124313679584068004', 'deck or porch repair', 'Deck & Porch Repair', 'deck repair pros'),
  insulation: makeService('insulation', '261970033189232981', 'insulation installation', 'Insulation Installation', 'insulation installers'),
  cabinet_install: makeService('cabinet_install', '234489736316256728', 'cabinet installation', 'Cabinet Installation', 'cabinet installers'),
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
  utmParams: Record<string, string> = {},
  categoryPk?: string
): Promise<ThumbtackSearchResponse> {
  const response = await fetch('/api/thumbtack-search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      searchQuery,
      zipCode,
      limit,
      utmParams,
      // Only included when provided — keeps existing calls unchanged.
      ...(categoryPk ? { categoryPk } : {}),
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to search for pros');
  }

  return response.json();
}
