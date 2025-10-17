# Analytics Page Refactoring Progress

## Overview
Refactoring the monolithic 1758-line `analytics/page.tsx` into a maintainable component architecture with ~30 separate files.

## 8-Phase Refactoring Plan

### ✅ Phase 1: Setup & Utilities (COMPLETE)
Created foundational utility functions and constants:

1. **src/lib/analytics/constants.ts** (44 lines)
   - `TIMEFRAME_OPTIONS`: 4 time range options (24h, 7d, 30d, all)
   - `PAGE_SIZE_OPTIONS`: Pagination sizes [5, 10, 20, 50]
   - `CHART_COLORS`: 4 CSS variable color references
   - `COUNTRY_CODE_MAP`: 20 country name mappings

2. **src/lib/analytics/timeUtils.ts** (57 lines)
   - `toISODate()`: Format date to ISO date string
   - `toISODateTime()`: Format date to ISO datetime string
   - `daysAgo()`: Get date N days in the past
   - `hoursAgo()`: Get date N hours in the past
   - `getDateRange()`: Calculate start/end dates for timeframe
   - `createTimeSlots()`: Generate time slot map for 24h/multi-day views

3. **src/lib/analytics/formatters.ts** (45 lines)
   - `formatCountry()`: Truncate long country names
   - `formatReferrer()`: Extract domain from URL
   - `formatDuration()`: Convert seconds to readable format
   - `formatDate()`: Format date with locale

4. **src/lib/analytics/calculations.ts** (116 lines)
   - `calculateGrowthRate()`: Compare first half vs second half data
   - `calculateStandardDeviation()`: Statistical variance
   - `calculateTrendScore()`: Percentage of increasing values
   - `calculateRetentionRate()`: Views ≥60 seconds
   - `calculateQualityScore()`: Duration + view count score
   - `calculatePeakActivity()`: Highest traffic day
   - `calculateViewConsistency()`: Days with >0 views percentage
   - `calculateDailyGrowth()`: Average daily view increase
   - `calculatePeakRatio()`: Peak vs average comparison

5. **src/lib/analytics/dataTransformers.ts** (147 lines)
   - `transformToCombinedSeries()`: Combine views/interactions/duration by time
   - `transformToStackedCountries()`: Top 4 countries + "Others"
   - `processAnalyticsData()`: Validate and normalize API response
   - Uses `TimeSeriesInternal` interface for type safety

**Type Enhancements in src/types/analytics.ts:**
- `TimeSeriesDataPoint`: Date-based chart data point
- `MetricCardProps`: Props for metric display cards
- `ChartDataPoint`: Generic chart data structure
- `PaginationState`: Pagination state management
- `TimeframeOption`: Timeframe selector option

---

### ✅ Phase 2: Custom Hooks (COMPLETE)
Created data management and business logic hooks:

1. **src/hooks/use-pagination.ts** (49 lines)
   - Generic pagination hook with type parameter `<T>`
   - Returns: `currentPage`, `pageSize`, `totalPages`, `paginatedData`
   - Navigation: `goToFirstPage`, `goToLastPage`, `goToNextPage`, `goToPreviousPage`
   - Auto-resets to page 1 when page size changes
   - Fully memoized for performance

2. **src/hooks/use-analytics-data.ts** (129 lines)
   - Central data fetching and state management
   - Manages: resume selection, analytics data, loading states, timeframe
   - URL synchronization with search params
   - Auto-selects first resume if none selected
   - Processes data through `processAnalyticsData()` transformer
   - Returns: `resumes`, `selectedResumeId`, `setSelectedResumeId`, `timeframe`, `setTimeframe`, `analyticsData`, `loading`, `resumesLoading`, `error`

3. **src/hooks/use-analytics-calculations.ts** (178 lines)
   - Comprehensive derived metrics and chart data
   - Fully memoized calculations based on `analyticsData` and `timeframe`
   - Returns 24 calculated values:
     - **Key Metrics**: totalViews, totalInteractions, avgViewDuration, avgEngagementRate
     - **Growth Metrics**: viewsGrowthRate, interactionsGrowthRate, durationGrowthRate, viewsTrendScore, interactionsTrendScore, durationTrendScore, dailyGrowth
     - **Quality Metrics**: retentionRate, qualityScore, viewConsistency
     - **Activity Metrics**: peakActivity, peakRatio
     - **Statistical**: stdDeviation
     - **Chart Data**: combinedSeries, stackedCountries
     - **Counts**: uniqueCountries, uniqueReferrers
   - All calculations use proper TypeScript types, no "any" types

**Status**: ✅ All 3 hooks created with no TypeScript errors or lint warnings

---

### ❌ Phase 3: Small Reusable Components (NOT STARTED)
Create atomic UI components:

1. **Flag Component** (~30 lines)
   - Display country flag emoji
   - Props: `countryCode`, `size`
   - Fallback for unknown countries

2. **PaginationControls Component** (~80 lines)
   - Page navigation UI
   - Page size selector
   - Props: from `use-pagination` hook
   - Displays: "Showing X-Y of Z"

3. **InsightItem Component** (~40 lines)
   - Single insight card
   - Props: `icon`, `title`, `value`, `trend`, `color`
   - Trend indicators (up/down/neutral)

4. **PerformanceMetric Component** (~50 lines)
   - Metric display with comparison
   - Props: `label`, `value`, `change`, `format`
   - Color-coded change indicators

5. **EmptyState Component** (~40 lines)
   - No data placeholder
   - Props: `message`, `icon`, `action`
   - Call-to-action button optional

6. **MetricCard Component** (~60 lines)
   - Reusable card for key metrics
   - Props: `title`, `value`, `subtitle`, `icon`, `trend`
   - Consistent styling

---

### ❌ Phase 4: Chart Components (NOT STARTED)
Extract chart visualizations:

1. **ViewsOverTimeChart** (~120 lines)
   - Line chart for views/interactions/duration
   - Uses `combinedSeries` from calculations hook
   - Recharts LineChart with 3 lines
   - Responsive container

2. **CountryDistributionChart** (~100 lines)
   - Stacked area chart for top countries
   - Uses `stackedCountries` from calculations hook
   - Recharts AreaChart
   - Legend with country flags

3. **InteractionTypeChart** (~90 lines)
   - Bar chart for interaction types
   - Groups by type: click_email, click_linkedin, etc.
   - Recharts BarChart
   - Horizontal layout

4. **ReferrerSourcesChart** (~90 lines)
   - Pie chart for traffic sources
   - Top 5 referrers + "Others"
   - Recharts PieChart
   - Custom label formatting

5. **EngagementHeatmap** (~110 lines)
   - Hour-of-day engagement visualization
   - 24-hour grid with color intensity
   - Custom SVG or Recharts implementation
   - Tooltip with exact values

---

### ❌ Phase 5: Table Components (NOT STARTED)
Extract data tables:

1. **CountryViewsTable** (~100 lines)
   - Paginated table of country views
   - Columns: Flag, Country, Views, % of Total
   - Uses `use-pagination` hook
   - Sortable columns

2. **ReferrerViewsTable** (~100 lines)
   - Paginated table of referrer sources
   - Columns: Referrer, Views, % of Total
   - Uses `use-pagination` hook
   - Domain extraction formatting

3. **InteractionDetailsTable** (~120 lines)
   - Recent interactions list
   - Columns: Type, Section, Value, Time
   - Uses `use-pagination` hook
   - Time ago formatting

---

### ❌ Phase 6: Section Components (NOT STARTED)
Group related components into sections:

1. **OverviewSection** (~150 lines)
   - Key metrics cards grid
   - Uses MetricCard components
   - Shows: Total Views, Avg Duration, Engagement Rate, Growth Rate
   - Responsive grid layout

2. **ChartsSection** (~200 lines)
   - All chart components
   - Grid layout with responsive breakpoints
   - Tab navigation for chart types
   - Export chart data buttons

3. **InsightsSection** (~180 lines)
   - AI-generated insights
   - Performance metrics
   - Trend analysis
   - Quality score breakdown

4. **DataTablesSection** (~150 lines)
   - All table components
   - Tab navigation between tables
   - Export to CSV functionality
   - Search/filter controls

---

### ❌ Phase 7: Main Page Refactor (NOT STARTED)
Rebuild `analytics/page.tsx` as composition:

- **Target**: Reduce to ~150 lines
- **Structure**:
  ```tsx
  export default function AnalyticsPage() {
    const { user } = useAuth();
    const { resumes, selectedResumeId, setSelectedResumeId, timeframe, setTimeframe, analyticsData, loading, error } = useAnalyticsData(user, authLoading);
    const calculations = useAnalyticsCalculations(analyticsData, timeframe);
    
    return (
      <div>
        <ResumeSelector />
        <TimeframeSelector />
        <OverviewSection {...calculations} />
        <ChartsSection {...calculations} />
        <InsightsSection {...calculations} />
        <DataTablesSection analyticsData={analyticsData} />
      </div>
    );
  }
  ```
- All logic moved to hooks and components
- Clean, declarative composition

---

### ❌ Phase 8: Testing & Polish (NOT STARTED)
Quality assurance and optimization:

1. **Unit Tests**
   - Test all utility functions
   - Test calculation functions
   - Test hooks with mock data

2. **Component Tests**
   - Test rendering with various data states
   - Test user interactions
   - Test error states

3. **Performance Optimization**
   - Verify memoization effectiveness
   - Check bundle size impact
   - Optimize chart re-renders

4. **Code Review**
   - Ensure consistent naming
   - Check TypeScript coverage
   - Verify accessibility
   - Documentation comments

---

## Current Status

**Completed**: 8 files (Phases 1-2)
**Remaining**: ~22 files (Phases 3-8)
**Overall Progress**: ~27% complete

### Files Created (8/~30)
✅ src/lib/analytics/constants.ts  
✅ src/lib/analytics/timeUtils.ts  
✅ src/lib/analytics/formatters.ts  
✅ src/lib/analytics/calculations.ts  
✅ src/lib/analytics/dataTransformers.ts  
✅ src/hooks/use-pagination.ts  
✅ src/hooks/use-analytics-data.ts  
✅ src/hooks/use-analytics-calculations.ts  

### Type Definitions Enhanced
✅ src/types/analytics.ts (added 5 new types)

### Original File Status
⚠️ src/app/analytics/page.tsx (1758 lines - UNCHANGED, will refactor in Phase 7)

---

## Next Steps

1. **Phase 3**: Create small reusable components
   - Start with Flag component (simplest)
   - Then PaginationControls
   - Then metric display components

2. **Phase 4**: Extract chart components
   - ViewsOverTimeChart (most complex)
   - Country and interaction charts
   - Heatmap visualization

3. **Phase 5**: Build table components
   - Reuse PaginationControls
   - Implement sorting
   - Add export functionality

4. **Phase 6**: Compose section components
   - Group related components
   - Add section-level state management
   - Implement tab navigation

5. **Phase 7**: Refactor main page
   - Replace all inline code with components
   - Verify all features work
   - Remove old code

6. **Phase 8**: Polish and test
   - Write tests
   - Optimize performance
   - Final code review

---

## Technical Decisions

### TypeScript Strictness
- ✅ No "any" types allowed
- ✅ All function parameters properly typed
- ✅ All return types explicit
- ✅ Type guards for runtime validation

### Code Organization
- ✅ Utilities in `lib/analytics/`
- ✅ Hooks in `hooks/`
- ✅ Components will go in `components/analytics/`
- ✅ Types centralized in `types/analytics.ts`

### Performance Considerations
- ✅ All hooks use `useMemo` for expensive calculations
- ✅ Transformations happen once per data change
- ✅ Components will use `React.memo` where appropriate

### Reusability
- ✅ Generic pagination hook (not analytics-specific)
- ✅ Utility functions pure and testable
- ✅ Components will follow atomic design principles

---

## Benefits Achieved So Far

1. **Code Organization**: Logic separated from presentation
2. **Type Safety**: Full TypeScript coverage with no "any" types
3. **Performance**: Memoized calculations prevent unnecessary re-renders
4. **Testability**: Pure functions easy to unit test
5. **Reusability**: Hooks and utilities can be used elsewhere
6. **Maintainability**: Each file has single responsibility

---

## Estimated Remaining Effort

- **Phase 3**: ~4 hours (6 small components)
- **Phase 4**: ~6 hours (5 chart components)
- **Phase 5**: ~5 hours (3 table components)
- **Phase 6**: ~6 hours (4 section components)
- **Phase 7**: ~3 hours (main page refactor)
- **Phase 8**: ~6 hours (testing & polish)

**Total Remaining**: ~30 hours

---

*Last Updated: Current session*
*Progress: Phase 1-2 Complete (27%)*
