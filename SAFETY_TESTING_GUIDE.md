# Safety Feature Testing Guide

## ⚠️ Important Note
The safety features only appear for jobs that are in **"assigned"** status or were started with the new safety workflow. Existing "in_progress" jobs from before the safety feature was implemented will NOT show safety features.

## 🎯 How to Test Safety Features

### Step 1: Get a Job in "Assigned" Status

**Option A: Accept a New Request**
1. Login as **Engineer**
2. Go to **Engineer Dashboard** → **"All Requests"** tab
3. Find a job with **green "NEW"** badge
4. Click **"Accept Request"** button
5. Job will change to **"assigned"** status
6. Click on the job to open **JobDetailsPage**

**Option B: Get Manager to Assign a Job**
1. Login as **Manager**
2. Create/find an unassigned request
3. Assign it to an engineer
4. Login as that **Engineer**
5. Accept the assignment
6. Job will be in **"assigned"** status
7. Click on the job to open **JobDetailsPage**

### Step 2: Look for Safety Features on JobDetailsPage

When viewing an **"assigned"** job, you should see:

#### 🟠 Orange Safety Card (Top of Page)
```
┌─────────────────────────────────────────────────────┐
│  THIS IS THE SAFETY CARD - ORANGE BACKGROUND        │
│                                                     │
│  🛡️  Safety Check Required                          │
│  Complete safety verification before starting work  │
│                                                     │
│  ┌─────────────────────────────────────────────┐   │
│  │  🛡️  Start Work with Safety Check           │   │
│  └─────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────┘
```

**Location**: Between the job header and job details
**Color**: Orange/amber background
**Button**: Large button with Shield icon

### Step 3: Click "Start Work with Safety Check"

This will open the **Safety Modal** with:

#### Left Side: Safety Parameters Checklist
- ☑️ Hard hat/helmet properly fitted
- ☑️ Safety glasses/goggles worn
- ☑️ Appropriate work boots worn
- ☑️ Work area hazards identified
- ☑️ Emergency exits located
- ☑️ Tools inspected before use
- ☑️ Electrical hazards assessed

#### Right Side: Safety Photos
- 📸 Site Conditions photo (REQUIRED)
- 📸 Safety Equipment photo (REQUIRED)
- 📸 Optional additional safety photos

### Step 4: Complete Safety Checks

1. **Check all required safety parameters** (marked with red text)
2. **Upload required photos**:
   - Click "+ Site Conditions" button
   - Click "+ Safety Equipment" button
3. Click **"Start Work with Safety Check"** button at bottom

### Step 5: After Starting Work

Once work is started with safety checks, you'll see:

#### 🟢 Green Safety Compliance Card
```
┌─────────────────────────────────────────────────────┐
│  🛡️  Safety Compliance              ✅ COMPLIANT    │
│  ✓ Safety checks completed before work start        │
│                                                     │
│  ┌─────────────┬─────────────┬─────────────┐      │
│  │ 📸 Safety    │ ✓ Safety    │ 📅 Safety    │      │
│  │ Photos: 2   │ Checks: ✓   │ Start Time   │      │
│  └─────────────┴─────────────┴─────────────┘      │
│                                                     │
│  Safety Photos Preview:                            │
│  [🛡️] [🛡️] [🛡️]                                     │
└─────────────────────────────────────────────────────┘
```

#### 📸 Enhanced Photo Gallery
At the bottom, photos are now separated into:
- **🛡️ Safety Documentation** (with orange borders)
- **📸 Work Progress Photos** (regular photos)

## 🔍 Troubleshooting

### "I don't see the orange safety card"

**Possible reasons:**
1. ❌ Job is not in "assigned" status → Must be exactly "assigned" status
2. ❌ Job assignment not accepted → Must accept the assignment first
3. ❌ Looking at an old job → Use a newly assigned job
4. ❌ Not logged in as Engineer → Must be Engineer role

**Solution**:
- Check job status badge - must show "ASSIGNED"
- Make sure you accepted the job assignment
- Try with a fresh new request

### "I don't see the green compliance card"

**Reason:** Job was started with old "Start Work" button (before safety feature)

**Solution:**
- This only shows for jobs started with NEW safety workflow
- The existing in-progress jobs won't have this
- Start a new job with safety checks to see this feature

### "Safety modal won't open"

**Check:**
- Job status is exactly "assigned"
- Assignment status is "accepted"
- Browser console for errors (F12)

## 📊 Database Status Check

To see which jobs have safety data, check:

```sql
-- Check safety parameters
SELECT * FROM safety_parameters;

-- Check safety checklist completions
SELECT sc.*, sr.ticket_number
FROM safety_checklist_items sc
JOIN service_requests sr ON sc.request_id = sr.id;

-- Check safety photos
SELECT jp.*, sr.ticket_number
FROM job_photos jp
JOIN service_requests sr ON jp.request_id = sr.id
WHERE jp.safety_category IS NOT NULL;
```

## ✅ Expected Behavior Summary

| Job Status | What You Should See |
|------------|-------------------|
| NEW | Normal accept/reject buttons |
| ASSIGNED | 🟠 **Orange safety card** with "Start Work with Safety Check" |
| IN PROGRESS (with safety) | 🟢 **Green compliance card** + safety photos |
| IN PROGRESS (without safety) | Normal job details (old jobs) |
| COMPLETED (with safety) | 🟢 **Green compliance card** + full safety audit trail |

## 🚀 Quick Test Scenario

1. **As Customer**: Create a new service request
2. **As Engineer**: Accept that request
3. **Verify**: Job status shows "ASSIGNED"
4. **Open job**: Click on the job
5. **Look for**: Orange safety card at top
6. **Click**: "Start Work with Safety Check"
7. **Complete**: Fill safety checks and upload 2 photos
8. **Submit**: Click "Start Work with Safety Check" in modal
9. **Verify**: Job status changes to "IN PROGRESS" and green compliance card appears

## 📝 Files Modified for Safety Features

- `/frontend/src/pages/engineer/JobDetailsPage.tsx` - Main UI changes
- `/frontend/src/components/engineer/SafetyStartWorkModal.tsx` - Safety modal
- `/frontend/src/components/common/PhotoUpload.tsx` - Enhanced with safety categories
- `/frontend/src/types/index.ts` - Safety type definitions
- `/frontend/src/services/requestService.ts` - Safety API calls
- `/backend/app/models/service_request.py` - Safety models
- `/backend/app/routers/requests.py` - Safety endpoints
- `/backend/safety_migration.sql` - Database migration

## 🐛 Report Issues

If safety features still don't appear after following this guide:
1. Check browser console (F12) for errors
2. Check backend server logs
3. Verify database migration ran successfully
4. Clear browser cache and reload
