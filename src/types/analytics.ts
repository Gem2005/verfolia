export interface View {
  id: string;
  viewed_at: string;
  country?: string;
  city?: string;
  view_duration?: number;
  referrer?: string;
}

export interface Interaction {
  id: string;
  clicked_at: string;
  interaction_type: string;
  section_name?: string;
  target_value?: string;
}

export interface CountryView {
  name: string;
  count: number;
}

export interface ReferrerView {
  name: string;
  count: number;
}

export interface DateView {
  date: string;
  count: number;
}

export interface InteractionType {
  name: string;
  count: number;
}

export interface AnalyticsData {
  views: View[];
  interactions: Interaction[];
  summary: {
    totalViews: number;
    totalInteractions: number;
    avgViewDuration: number;
    viewsByDate: DateView[];
    interactionsByType: InteractionType[];
    viewsByCountry: CountryView[];
    viewsByReferrer: ReferrerView[];
  };
}
