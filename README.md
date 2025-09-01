# Verfolia - Resume Analytics Platform

Verfolia is a powerful resume analytics platform that helps users track and analyze the performance of their resumes with sophisticated metrics.

## Overview

Verfolia allows users to create, manage, and share their resumes while providing detailed analytics on how those resumes perform. The platform tracks views, interactions, and engagement metrics to provide insights that help users optimize their resumes for better results.

## Features

- **Resume Creation and Management**: Create and manage multiple resumes
- **Resume Sharing**: Share resumes with unique URLs
- **Comprehensive Analytics**: Track views, interactions, and performance
- **Statistical Insights**: Advanced metrics to understand resume performance
- **Mobile-Responsive Design**: Works on all devices

## Analytics Metrics

The platform provides a range of analytics metrics to help users understand their resume performance:

### Statistical Insights

| Metric            | Description                                      | Formula                                                               |
| ----------------- | ------------------------------------------------ | --------------------------------------------------------------------- |
| Peak Activity     | Identifies the date with highest traffic         | `max(daily_views)`                                                    |
| View Consistency  | Percentage of days with at least one view        | `(days_with_views / total_days) * 100`                                |
| Avg. Daily Growth | Average day-over-day change in views             | `(last_day_views - first_day_views) / total_days`                     |
| Quality Score     | Composite score of view duration and total views | `((avg_view_duration / 60) * 0.5) + (min(total_views / 100, 1) * 50)` |

### Performance Analytics

| Metric         | Description                              | Formula                                                 |
| -------------- | ---------------------------------------- | ------------------------------------------------------- |
| View Trend     | Percentage of days with increasing views | `(days_with_increasing_views / (total_days - 1)) * 100` |
| Retention Rate | Percentage of views lasting 60+ seconds  | `(views_over_60_seconds / total_views) * 100`           |
| View Variance  | Standard deviation of daily views        | Standard deviation calculation of view counts           |
| Peak Ratio     | Ratio of peak views to average views     | `(max_daily_views / avg_daily_views)`                   |

## Analytics Operations

The platform performs several key operations to collect and analyze data:

### Data Collection

1. **View Tracking**: Records when a resume is viewed

   ```javascript
   // When a user views a resume
   trackResumeView(resumeId);
   ```

2. **Duration Tracking**: Measures how long each view lasts

   ```javascript
   // When user leaves the page
   const duration = Math.floor((Date.now() - startTime) / 1000);
   updateViewDuration(resumeId, duration);
   ```

3. **Interaction Tracking**: Records when users interact with resume elements
   ```javascript
   // When user clicks on an element
   trackResumeInteraction(resumeId, sectionName, interactionType);
   ```

### Data Processing

1. **Time Series Processing**: Aggregates data into meaningful time intervals

   ```javascript
   // Group views by day or hour based on timeframe
   const dateIndex = new Map();

   if (is24Hours) {
     // Create hour slots for 24-hour view
     Array.from({ length: 24 }).forEach((_, i) => {
       const hourDate = hoursAgo(23 - i);
       dateIndex.set(toISODateTime(hourDate), {
         /* data structure */
       });
     });
   } else {
     // Create day slots
     Array.from({ length: range + 1 }).forEach((_, i) => {
       const d = toISODate(daysAgo(range - i));
       dateIndex.set(d, {
         /* data structure */
       });
     });
   }
   ```

2. **Data Aggregation**: Combines views and interactions data

   ```javascript
   // Process views data
   analyticsData.views.forEach((v) => {
     const viewDate = new Date(v.viewed_at);
     const key = is24Hours ? toISODateTime(viewDate) : toISODate(viewDate);
     const cell = dateIndex.get(key);
     if (cell) {
       cell.views += 1;
       cell.durSum += Number(v.view_duration || 0);
       cell.durCount += 1;
     }
   });

   // Process interactions data
   analyticsData.interactions.forEach((i) => {
     const interactionDate = new Date(i.clicked_at);
     const key = is24Hours
       ? toISODateTime(interactionDate)
       : toISODate(interactionDate);
     const cell = dateIndex.get(key);
     if (cell) {
       cell.interactions += 1;
     }
   });
   ```

### Statistical Calculations

1. **Growth Rate Calculation**: Compares recent vs previous periods

   ```javascript
   const calculateGrowthRate = (series, metric) => {
     if (!series || series.length < 2) return 0;

     // For shorter timeframes, compare last half vs first half
     const midpoint = Math.floor(series.length / 2);
     const recentData = series.slice(midpoint);
     const previousData = series.slice(0, midpoint);

     const recentSum = recentData.reduce((sum, d) => sum + (d[metric] || 0), 0);
     const previousSum = previousData.reduce(
       (sum, d) => sum + (d[metric] || 0),
       0
     );

     if (previousSum === 0) return recentSum > 0 ? 100 : 0;

     return Math.round(((recentSum - previousSum) / previousSum) * 100);
   };
   ```

2. **Standard Deviation**: Measures consistency of views

   ```javascript
   const calculateStandardDeviation = (values) => {
     if (values.length === 0) return 0;
     const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
     const variance =
       values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) /
       values.length;
     return Math.sqrt(variance);
   };
   ```

3. **Trend Score Calculation**: Measures upward momentum

   ```javascript
   const calculateTrendScore = (series, metric) => {
     if (!series || series.length < 3) return 0;

     const values = series.map((d) => d[metric] || 0);
     const increasing = values.filter(
       (val, i) => i > 0 && val > values[i - 1]
     ).length;
     const total = values.length - 1;

     return total > 0 ? Math.round((increasing / total) * 100) : 0;
   };
   ```

4. **Retention Rate Calculation**: Measures quality of engagement

   ```javascript
   const calculateRetentionRate = (analyticsData) => {
     if (!analyticsData || analyticsData.views.length === 0) return 0;

     const longViews = analyticsData.views.filter(
       (v) => (v.view_duration || 0) >= 60
     ).length;

     return analyticsData.views.length > 0
       ? Math.round((longViews / analyticsData.views.length) * 100)
       : 0;
   };
   ```

## Tech Stack

- **Frontend**: Next.js, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Styling**: Shadcn UI components

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env.local` file from the example and set Supabase:
   ```bash
   cp env.example .env.local
   ```
   Fill in:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   NEXT_PUBLIC_SITE_URL=http://localhost:3000
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```
5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

The project follows a standard Next.js application structure:

- `/src/app` - Next.js App Router pages and API routes
- `/src/components` - React components
- `/src/services` - Service classes for data operations
- `/src/hooks` - Custom React hooks
- `/src/types` - TypeScript type definitions
- `/src/utils` - Utility functions and services
#   T r i g g e r   V e r c e l   r e d e p l o y  
 