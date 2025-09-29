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

// Creation Analytics Types
export interface CreationEvent {
  id: string;
  session_id: string;
  user_id?: string;
  event_type: string;
  event_data: any;
  step_number?: number;
  template_id?: string;
  theme_id?: string;
  created_at: string;
}

export interface CreationAnalyticsSummary {
  totalSessions: number;
  completedSessions: number;
  averageSessionDuration: number;
  popularTemplates: { name: string; count: number }[];
  popularThemes: { name: string; count: number }[];
  stepDropoff: { step: number; count: number }[];
  conversionRate: number;
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
