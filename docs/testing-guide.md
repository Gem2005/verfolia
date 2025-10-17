# Testing Guide - AI Resume Parser Integration

## Pre-Test Setup

1. **Ensure API Key is Set**
   ```bash
   # Check .env.local has:
   GOOGLE_GEMINI_API_KEY=your_api_key_here
   ```

2. **Start Development Server**
   ```bash
   npm run dev
   ```

3. **Open Browser Console** (for debugging)
   - Press F12
   - Go to Console tab
   - Look for `[Prefill]` and `[AI Parse]` logs

## Test Scenarios

### Test 1: Basic PDF Upload ✅

**Steps:**
1. Navigate to `http://localhost:3000/upload-resume`
2. Upload a PDF resume (e.g., `Gemini_Resume-1.pdf`)
3. Wait for "Resume parsed successfully!" toast

**Expected Results:**
- ✅ Progress bar animates
- ✅ Success toast appears
- ✅ Redirect to `/create-resume?prefill=resume_upload_...`
- ✅ Console shows: `[AI Parse] Parsing: filename.pdf (bytes)`
- ✅ Console shows: `[Prefill] Loaded resume data: {...}`

**What to Check:**
- Personal info populated (first name, last name, email, phone)
- Work experience entries appear (at least 1)
- Education entries appear
- Skills list populated
- Projects appear (if in resume)
- Custom sections appear (Achievements, Leadership, etc.)

---

### Test 2: DOCX Upload ✅

**Steps:**
1. Navigate to `/upload-resume`
2. Upload a DOCX resume
3. Wait for parsing

**Expected Results:**
- ✅ File converts to PDF automatically
- ✅ Parsing completes successfully
- ✅ All data extracted correctly

**What to Check:**
- DOCX conversion works (console: "Converting DOCX to PDF")
- All sections extracted like PDF test

---

### Test 3: Education Parsing (College + High School) ✅

**Upload a resume with:**
- Bachelor's degree
- High school education

**Expected Results:**
- ✅ College shows: "B.Tech in Computer Science"
- ✅ High School shows: "High School Diploma" or "Secondary Education"
- ✅ No "null" appears for degree field
- ✅ Both entries have proper dates

**What to Check in Console:**
```javascript
{
  educationCount: 2,  // Should be 2 or more
}
```

---

### Test 4: Custom Sections Detection ✅

**Upload a resume with:**
- Achievements section
- Leadership & Activities section
- Awards section
- Volunteer Work section

**Expected Results:**
- ✅ Console shows: `customSectionsCount: 2` (or more)
- ✅ Custom sections appear in create-resume form
- ✅ Each section has title and items
- ✅ Items have proper structure (title, subtitle, description, etc.)

**What to Check:**
```javascript
// In console:
customSectionsCount: 2  // Should match resume

// In form data:
customSections: [
  {
    id: "uuid",
    title: "Achievements",
    items: [
      {
        title: "First Prize - Hackathon",
        description: "...",
        date: "March 2024"
      }
    ]
  }
]
```

---

### Test 5: Internships Merged with Experience ✅

**Upload a resume with:**
- Work experience section
- Internship section (separate)

**Expected Results:**
- ✅ All entries appear in experience array
- ✅ Sorted by date (latest first)
- ✅ Internships NOT in custom sections
- ✅ Experience count includes internships

**What to Check:**
```javascript
// Console should show:
experienceCount: 4  // e.g., 2 jobs + 2 internships

// NOT duplicated in custom sections
```

---

### Test 6: No Duplication (Leadership vs Experience) ✅

**Upload a resume with:**
- "Tech Lead" in Leadership section
- "Software Engineer" in Experience section

**Expected Results:**
- ✅ Tech Lead appears ONLY in custom sections
- ✅ Software Engineer appears ONLY in experience
- ✅ No duplication between arrays

**What to Check:**
- Experience array has work positions only
- Custom sections (Leadership) has club/org positions only

---

### Test 7: Warnings Display ⏳

**Upload a resume with missing data:**
- Missing email
- Missing dates
- Incomplete sections

**Expected Results:**
- ✅ Orange warning toast appears
- ✅ Shows warning count: "2 warning(s) during parsing"
- ✅ Data still loads (partial)

**What to Check in Console:**
```javascript
{
  warnings: [
    "Missing email in personal info",
    "Experience entry missing start date"
  ]
}
```

---

### Test 8: Form Validation ⏳

**After prefill loads:**
1. Try to skip to next step without filling required fields
2. Fill in missing data
3. Navigate through all steps

**Expected Results:**
- ✅ Validation errors show for required fields
- ✅ Can edit all prefilled data
- ✅ Can add new items
- ✅ Can delete items
- ✅ Can save resume

---

### Test 9: Custom Sections Editing ⏳

**After resume loads with custom sections:**
1. Navigate to Additional Info step
2. Find custom sections
3. Try editing items

**Expected Results:**
- ✅ Custom sections appear in form
- ✅ Can edit title, subtitle, description
- ✅ Can add/remove items
- ✅ Can add/remove entire sections

---

### Test 10: Save Resume ⏳

**After editing:**
1. Click "Save Resume"
2. Wait for save confirmation

**Expected Results:**
- ✅ Resume saves to database
- ✅ Custom sections saved correctly
- ✅ All data persisted
- ✅ Can view saved resume

---

## Console Logs to Monitor

### Upload Phase:
```
[AI Parse] Parsing: resume.pdf (90730 bytes)
[AI Parse] Successfully parsed with AI in 3500ms
```

### Prefill Phase:
```
[Prefill] Loaded resume data: {
  title: "Resume from resume.pdf",
  hasPersonalInfo: true,
  experienceCount: 2,
  educationCount: 3,
  skillsCount: 27,
  projectsCount: 3,
  certificationsCount: 1,
  languagesCount: 0,
  customSectionsCount: 2
}
```

## Common Issues & Solutions

### Issue: "Resume data not found"
**Cause:** SessionStorage expired or cleared
**Solution:** Re-upload the resume

### Issue: "Failed to parse resume"
**Cause:** API key missing or invalid
**Solution:** Check `.env.local` has valid `GOOGLE_GEMINI_API_KEY`

### Issue: Custom sections not showing
**Cause:** Resume doesn't have custom sections OR they're not being detected
**Solution:** Check console for `customSectionsCount`, verify resume has Achievements/Leadership sections

### Issue: Education shows "null"
**Cause:** Old code (should be fixed)
**Solution:** Check that prompt update is deployed

### Issue: Internships in both experience and custom sections
**Cause:** Duplication logic not working
**Solution:** Check AI parser prompt has anti-duplication instructions

## Success Criteria

After all tests, you should have:
- ✅ Successfully uploaded PDF and DOCX
- ✅ All data extracted and populated
- ✅ Custom sections detected and editable
- ✅ Education (college + high school) parsed correctly
- ✅ Internships merged into experience
- ✅ No duplication
- ✅ Form validation working
- ✅ Resume saves successfully

## Performance Benchmarks

| Metric | Target | Actual |
|--------|--------|--------|
| PDF Upload | < 1s | ___ |
| AI Parsing | < 5s | ___ |
| Redirect | < 500ms | ___ |
| Form Load | < 1s | ___ |
| Total (upload to form) | < 7s | ___ |

## Test Resumes

Use these test files:
1. **Gemini_Resume-1.pdf** - Has custom sections (Achievements, Leadership)
2. **Melroy Joanes.pdf** - Has multiple experiences
3. **Your own resume** - Real-world test

## Debugging Tips

1. **Check Network Tab**
   - Look for POST to `/api/parse-resume`
   - Check response structure
   - Verify status 200

2. **Check Console Logs**
   - Look for `[Prefill]` messages
   - Check data structure matches expectations
   - Verify counts match resume

3. **Check SessionStorage**
   - Open Application tab → Storage → Session Storage
   - Look for `resume_upload_` keys
   - Verify JSON structure

4. **Check API Response**
   - In Network tab, click on parse-resume request
   - Go to Response tab
   - Verify `parsed_resume` has all sections

## Reporting Issues

If you find issues, report with:
1. Test scenario number
2. Resume file used
3. Console logs
4. API response (from Network tab)
5. Expected vs actual behavior

---

## Quick Checklist

- [ ] API key configured
- [ ] Server running
- [ ] Test 1: PDF upload
- [ ] Test 2: DOCX upload
- [ ] Test 3: Education parsing
- [ ] Test 4: Custom sections
- [ ] Test 5: Internships merged
- [ ] Test 6: No duplication
- [ ] Test 7: Warnings
- [ ] Test 8: Form validation
- [ ] Test 9: Custom sections editing
- [ ] Test 10: Save resume
- [ ] All tests passing ✅

**Happy Testing!** 🎉
