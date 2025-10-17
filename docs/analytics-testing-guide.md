# Analytics Tracking - Testing Guide

## 🎯 What We're Testing

The new analytics tracking system that captures:
- ✅ Resume views with accurate duration tracking
- ✅ User interactions (email clicks, link clicks, section views)
- ✅ Geographic data (country, city)
- ✅ Device/browser information
- ✅ Referrer tracking

## 📋 Prerequisites

1. ✅ Dev server running (`npm run dev`)
2. ✅ Supabase configured with edge function
3. ✅ At least one published resume with a slug
4. ✅ Browser DevTools open (F12)

## 🧪 Test Scenarios

### **Test 1: Initial View Tracking**

**Goal**: Verify that viewing a resume creates a record in `resume_views` table

**Steps**:
1. Open browser in **Incognito/Private mode** (to ensure you're not the owner)
2. Navigate to: `http://localhost:3000/resume/[your-resume-slug]`
3. Open DevTools → Network tab
4. Look for request to: `track-analytics`
5. Check Console for: `[Analytics] Initial view tracked`

**Expected Result**:
- ✅ Network request shows 200 OK
- ✅ Console shows tracking confirmation
- ✅ No errors in console

**Verify in Database**:
```sql
-- Check latest view was created
SELECT * FROM resume_views 
WHERE resume_id = 'your-resume-id'
ORDER BY viewed_at DESC 
LIMIT 1;

-- Should show:
-- - session_id (UUID)
-- - view_duration: 0 (initially)
-- - country, city (from IP)
-- - user_agent, referrer
-- - viewed_at (timestamp)
```

---

### **Test 2: View Duration Updates**

**Goal**: Verify duration tracking updates every 15 seconds

**Steps**:
1. Stay on the resume page
2. Keep DevTools Network tab open
3. Wait for **15 seconds**
4. Look for another `track-analytics` request
5. Wait another **15 seconds**
6. Check for 3rd request

**Expected Result**:
- ✅ Request sent every ~15 seconds
- ✅ Console logs: `[ViewDuration] Updating duration: 15s`, `30s`, `45s`, etc.
- ✅ Each request has increasing `viewDuration` value

**Verify in Database**:
```sql
-- Check duration is updating
SELECT id, view_duration, viewed_at, last_updated_at
FROM resume_views 
WHERE resume_id = 'your-resume-id'
ORDER BY viewed_at DESC 
LIMIT 1;

-- After 1 minute, view_duration should be ~60
```

---

### **Test 3: Tab Visibility Handling**

**Goal**: Verify tracking pauses when tab is hidden

**Steps**:
1. Stay on resume page for 15 seconds (duration = 15s)
2. Switch to another tab for 30 seconds
3. Come back to resume tab
4. Wait another 15 seconds
5. Check console logs

**Expected Result**:
- ✅ When tab hidden: `[ViewDuration] Tab hidden, pausing tracking`
- ✅ When tab visible: `[ViewDuration] Tab visible, resuming tracking`
- ✅ Duration only increases when tab is visible
- ✅ After test: duration should be ~30s (not 60s)

**Verify in Database**:
```sql
-- Duration should only count visible time
SELECT view_duration FROM resume_views 
WHERE resume_id = 'your-resume-id'
ORDER BY viewed_at DESC 
LIMIT 1;

-- Should be ~30 seconds (15s before + 15s after hiding)
```

---

### **Test 4: Email Click Tracking**

**Goal**: Verify email link clicks are tracked as `email_click`

**Steps**:
1. On resume page, find email link in contact section
2. Click the email link
3. Check DevTools Network tab for `track-analytics` request
4. Check Console for: `[Interaction] Tracked: email_click`

**Expected Result**:
- ✅ Network request with `event: 'interaction'`
- ✅ Payload includes:
  ```json
  {
    "event": "interaction",
    "interactionType": "email_click",
    "targetValue": "email@example.com",
    "sectionName": "contact"
  }
  ```

**Verify in Database**:
```sql
-- Check interaction was recorded
SELECT * FROM resume_interactions 
WHERE resume_id = 'your-resume-id'
  AND interaction_type = 'email_click'
ORDER BY clicked_at DESC 
LIMIT 1;

-- Should show:
-- - view_id (links to resume_views)
-- - target_value: the email address
-- - section_name: 'contact'
```

---

### **Test 5: Social Link Tracking**

**Goal**: Verify social media links track as `social_link_click`

**Steps**:
1. Find GitHub/LinkedIn/Twitter link on resume
2. Click the social link
3. Check Network tab and Console

**Expected Result**:
- ✅ Request shows `interactionType: 'social_link_click'`
- ✅ `targetValue` contains the social profile URL
- ✅ `sectionName` indicates where link was clicked

**Verify in Database**:
```sql
SELECT * FROM resume_interactions 
WHERE resume_id = 'your-resume-id'
  AND interaction_type = 'social_link_click'
ORDER BY clicked_at DESC;
```

---

### **Test 6: Section Visibility Tracking**

**Goal**: Verify sections trigger `section_view` when scrolled into view

**Steps**:
1. Load resume page (don't scroll)
2. Slowly scroll down to "Experience" section
3. Wait for section to be 50% visible
4. Check Console for: `[SectionVisibility] experience viewed`
5. Continue scrolling to other sections

**Expected Result**:
- ✅ Each section triggers tracking once (not multiple times)
- ✅ Only triggers when 50%+ of section is visible
- ✅ Console shows section name that was viewed

**Verify in Database**:
```sql
SELECT * FROM resume_interactions 
WHERE resume_id = 'your-resume-id'
  AND interaction_type = 'section_view'
ORDER BY clicked_at DESC;

-- Should show multiple rows, one per section:
-- - section_name: 'header', 'experience', 'skills', etc.
```

---

### **Test 7: Multiple Sessions**

**Goal**: Verify different sessions are tracked separately

**Steps**:
1. Visit resume in **Browser 1** (Chrome)
2. Note the session_id in console: `[Session] Using session: abc123...`
3. Visit same resume in **Browser 2** (Firefox/Edge)
4. Note the different session_id: `[Session] Using session: xyz789...`
5. Check database

**Expected Result**:
- ✅ Each browser has unique session_id
- ✅ Two separate rows in `resume_views` table
- ✅ Interactions link to correct session

**Verify in Database**:
```sql
-- Should see 2 distinct sessions
SELECT session_id, user_agent, viewed_at, view_duration
FROM resume_views 
WHERE resume_id = 'your-resume-id'
ORDER BY viewed_at DESC 
LIMIT 5;
```

---

### **Test 8: Session Timeout**

**Goal**: Verify sessions expire after 30 minutes

**Steps**:
1. Visit resume page
2. Note session_id in console
3. Wait 31 minutes (or clear sessionStorage manually)
4. Refresh the page
5. Note new session_id

**Expected Result**:
- ✅ After 30 minutes: new session_id generated
- ✅ New row in `resume_views` table
- ✅ Console shows: `[Session] Session expired, creating new session`

**Shortcut for Testing**:
```javascript
// In browser console, manually expire session:
sessionStorage.clear();
location.reload();
```

---

### **Test 9: Owner vs Visitor**

**Goal**: Verify owner views are NOT tracked

**Steps**:
1. Login as resume owner
2. Visit your own resume: `/resume/your-slug`
3. Check Network tab - should be NO tracking requests
4. Logout
5. Visit same resume as guest
6. Check Network tab - should see tracking requests

**Expected Result**:
- ✅ When logged in as owner: No tracking (privacy)
- ✅ When logged out: Full tracking enabled
- ✅ Console shows: `Tracking disabled for owner` (if implemented)

---

### **Test 10: Edge Function Error Handling**

**Goal**: Verify retry logic when edge function fails

**Steps**:
1. In DevTools Network tab, right-click `track-analytics` request
2. Select "Block request URL"
3. Refresh resume page
4. Check Console for retry attempts

**Expected Result**:
- ✅ Console shows: `[Analytics] Retry 1/3...`
- ✅ Tries up to 3 times before giving up
- ✅ Error logged but doesn't break page
- ✅ User experience unaffected

---

## 🔍 Database Verification Queries

### Quick Health Check
```sql
-- Recent views with duration
SELECT 
  r.slug,
  v.session_id,
  v.view_duration,
  v.country,
  v.city,
  v.viewed_at
FROM resume_views v
JOIN resumes r ON r.id = v.resume_id
ORDER BY v.viewed_at DESC
LIMIT 10;
```

### Interaction Summary
```sql
-- Count interactions by type
SELECT 
  interaction_type,
  COUNT(*) as count,
  COUNT(DISTINCT session_id) as unique_sessions
FROM resume_interactions
WHERE resume_id = 'your-resume-id'
GROUP BY interaction_type
ORDER BY count DESC;
```

### Geographic Distribution
```sql
-- Views by country
SELECT 
  country,
  city,
  COUNT(*) as views,
  AVG(view_duration) as avg_duration
FROM resume_views
WHERE resume_id = 'your-resume-id'
  AND country IS NOT NULL
GROUP BY country, city
ORDER BY views DESC;
```

### Session Analysis
```sql
-- Session details with interaction count
SELECT 
  v.session_id,
  v.view_duration,
  v.country,
  v.viewed_at,
  COUNT(i.id) as interaction_count
FROM resume_views v
LEFT JOIN resume_interactions i ON i.view_id = v.id
WHERE v.resume_id = 'your-resume-id'
GROUP BY v.id, v.session_id, v.view_duration, v.country, v.viewed_at
ORDER BY v.viewed_at DESC;
```

### Funnel Analysis
```sql
-- Views → Email clicks → Social clicks
WITH stats AS (
  SELECT 
    COUNT(DISTINCT v.session_id) as total_views,
    COUNT(DISTINCT CASE WHEN i.interaction_type = 'email_click' THEN i.session_id END) as email_clicks,
    COUNT(DISTINCT CASE WHEN i.interaction_type = 'social_link_click' THEN i.session_id END) as social_clicks
  FROM resume_views v
  LEFT JOIN resume_interactions i ON i.view_id = v.id
  WHERE v.resume_id = 'your-resume-id'
)
SELECT 
  total_views,
  email_clicks,
  ROUND((email_clicks::numeric / total_views * 100), 2) as email_click_rate,
  social_clicks,
  ROUND((social_clicks::numeric / total_views * 100), 2) as social_click_rate
FROM stats;
```

---

## 🐛 Common Issues & Solutions

### Issue: No tracking requests appearing
**Solution**: 
- Check you're NOT logged in as owner
- Verify edge function URL is correct in `client-tracking.ts`
- Check browser console for errors

### Issue: Duration stays at 0
**Solution**:
- Check Network tab - are duration updates being sent?
- Verify edge function is receiving `viewDuration` parameter
- Check database `last_updated_at` column

### Issue: Section views not tracking
**Solution**:
- Templates must be wrapped in `<ResumeViewTracker>`
- Sections need `data-section` attribute
- Check console for Intersection Observer errors

### Issue: Interactions have no view_id
**Solution**:
- Edge function should auto-create view if missing
- Check edge function logs in Supabase dashboard
- Verify session_id is consistent

---

## ✅ Success Criteria

After all tests, you should see:

**In Database:**
- ✅ `resume_views` entries with `view_duration > 0`
- ✅ `resume_interactions` with various types (email_click, social_link_click, section_view)
- ✅ Geographic data (country, city) populated
- ✅ Correct `view_id` linking interactions to views

**In Browser:**
- ✅ No console errors
- ✅ Tracking requests return 200 OK
- ✅ Duration updates every 15 seconds
- ✅ All clicks are tracked

**In Dashboard:**
- ✅ Charts show real data
- ✅ View counts update in real-time
- ✅ Interaction breakdown displays correctly

---

## 📊 Next: Dashboard Testing

Once core tracking works:
1. Navigate to `/analytics` page
2. Verify charts show your test data
3. Test date range filters
4. Check geographic breakdown
5. Validate interaction funnel

---

## 🚀 Performance Benchmarks

**Expected Performance:**
- Initial view tracking: < 200ms
- Duration updates: < 100ms (background)
- Interaction tracking: < 150ms
- Edge function response: < 500ms
- Zero impact on page load time

---

**Last Updated**: Current Session  
**Status**: Ready for Testing  
**Implementation**: Phase 1-3 Complete, Option A Deployed
