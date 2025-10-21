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

// Interaction type values
export type InteractionTypeValue = 
  | 'email_click' 
  | 'phone_click' 
  | 'link_click' 
  | 'download' 
  | 'section_view' 
  | 'section_click'
  | 'section_view_duration'
  | 'social_link_click'
  | string; // Allow custom interaction types

// Creation Analytics Types
export interface CreationEvent {
  id: string;
  session_id: string;
  user_id?: string;
  event_type: string;
  event_data: Record<string, unknown>;
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

// Additional types for analytics components
export interface TimeSeriesDataPoint {
  date: string;
  views: number;
  interactions: number;
  avgDuration: number;
}

export interface MetricCardProps {
  icon: React.ReactNode;
  title: string;
  value: number | string;
  change?: number;
  data: { x: string; y: number }[];
  color: string;
}

export interface ChartDataPoint {
  x: string;
  y: number;
}

export interface PaginationState {
  currentPage: number;
  pageSize: number;
}

export type TimeframeOption = "1" | "7" | "30" | "90";
