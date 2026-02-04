# Firebase Integration Testing Guide

## Pre-Testing Checklist

- [ ] Node.js and npm installed
- [ ] Internet connection active
- [ ] Firebase project created and accessible
- [ ] Google account available for testing
- [ ] Browser DevTools available (F12)

## Environment Setup

### 1. Install Dependencies
```bash
cd f:\Downloads\Toi-Task
npm install
```

### 2. Start Development Server
```bash
npm run dev
```

Server will start at `http://localhost:5173`

---

## Test Suite 1: Authentication

### Test 1.1: Regular User Login
**Steps**:
1. Navigate to http://localhost:5173
2. Click "Sign in with Google"
3. Sign in with any Google account
4. Accept permissions

**Expected Result**:
- ✅ Google login dialog appears
- ✅ User data from Google loads
- ✅ Dashboard displays with user name and avatar
- ✅ User email shows in profile

**How to Verify**:
- Check user name in sidebar
- Check avatar image loaded
- Check "Welcome back!" message shows

---

### Test 1.2: Session Persistence
**Steps**:
1. Sign in with Google
2. Refresh the page (F5)
3. Wait for page to load

**Expected Result**:
- ✅ User stays logged in
- ✅ Dashboard loads immediately
- ✅ No login required

**How to Verify**:
- User data persists after refresh
- No redirect to login page

---

### Test 1.3: Logout
**Steps**:
1. Sign in with Google
2. Click profile/menu
3. Click "Sign Out" or "Logout"
4. Verify redirect to login

**Expected Result**:
- ✅ User logged out successfully
- ✅ Session cleared
- ✅ Redirected to login page

**How to Verify**:
- Login page appears
- User data cleared from sidebar

---

### Test 1.4: Admin Email Verification
**Steps**:
1. Sign in with non-admin email (e.g., your regular Gmail)
2. Navigate to http://localhost:5173/admin
3. Try to access admin panel

**Expected Result**:
- ✅ Non-admin user gets "Access Denied" message
- ✅ Cannot access admin panel

---

### Test 1.5: Admin Login Success
**Steps**:
1. Sign out
2. Navigate to http://localhost:5173/admin
3. Sign in with: `abirsabirhossain@gmail.com` (or authorized admin)

**Expected Result**:
- ✅ Admin login succeeds
- ✅ Admin panel displays
- ✅ Can see team members section

---

## Test Suite 2: Task Management

### Test 2.1: Create Task
**Steps**:
1. Sign in with any Google account
2. Type "Test Task" in input field
3. Click "Add Task" button
4. Observe list below

**Expected Result**:
- ✅ Task appears in list immediately
- ✅ Task shows as incomplete (checkbox unchecked)
- ✅ Task creation date/time shows
- ✅ Input field clears

**Firebase Verification**:
1. Open Firebase Console
2. Go to Realtime Database
3. Navigate to: `users/{userId}/tasks/`
4. Verify task data exists

**Console Check**:
- Open DevTools (F12) → Console
- No errors should appear
- Task added successfully message may appear

---

### Test 2.2: Complete Task
**Steps**:
1. Create a task (see Test 2.1)
2. Click checkbox on the task
3. Observe task appearance change

**Expected Result**:
- ✅ Checkbox becomes checked
- ✅ Task text becomes strikethrough
- ✅ Task moves to completed section
- ✅ Completion counter updates

**Firebase Verification**:
1. Check Firebase Console
2. Verify `completed: true` in database

---

### Test 2.3: Add Comment
**Steps**:
1. Create a task
2. Click on task or comment section
3. Type comment text
4. Submit comment

**Expected Result**:
- ✅ Comment appears under task
- ✅ Shows commenter avatar
- ✅ Shows comment timestamp
- ✅ Comment input clears

**Firebase Verification**:
1. Check task in Firebase Console
2. Verify comment in `comments/` sub-object

---

### Test 2.4: Like Task
**Steps**:
1. Create a task
2. Click heart/like button
3. Observe like counter

**Expected Result**:
- ✅ Like counter increments
- ✅ Heart button highlights
- ✅ Count updates immediately

**Firebase Verification**:
1. Check Firebase Console
2. Verify `likes` field incremented

---

### Test 2.5: Real-Time Sync - Multiple Tabs
**Steps**:
1. Open app in two browser tabs (same user)
2. Create task in Tab A
3. Watch Tab B

**Expected Result**:
- ✅ Task appears in Tab B instantly (within 1 second)
- ✅ No page refresh needed
- ✅ Data stays synchronized

**Edge Cases**:
- Complete task in Tab A, watch Tab B update
- Add comment in Tab A, watch Tab B update
- Like task in Tab A, watch counter update in Tab B

---

## Test Suite 3: Real-Time Synchronization

### Test 3.1: Offline & Online
**Steps**:
1. Create a task
2. Disable WiFi/Internet
3. Try to create another task
4. Enable WiFi/Internet
5. Observe synchronization

**Expected Result**:
- ✅ Error shown when offline
- ✅ Queue's changes when offline
- ✅ Syncs when back online
- ✅ Data consistency maintained

---

### Test 3.2: Multiple Users (Simulated)
**Steps**:
1. Tab A: Sign in as User1 (Gmail)
2. Tab B: Sign in as User2 (different Gmail)
3. Tab A: User1 creates tasks
4. Tab B: Verify User1's tasks don't appear
5. Verify task isolation

**Expected Result**:
- ✅ Each user only sees their own tasks
- ✅ No cross-user data visibility
- ✅ Data properly partitioned

---

### Test 3.3: Fast Updates
**Steps**:
1. Create multiple tasks rapidly
2. Like several tasks in quick succession
3. Add multiple comments quickly
4. Verify all changes sync

**Expected Result**:
- ✅ All changes sync correctly
- ✅ No lost updates
- ✅ Order preserved
- ✅ No duplicates

---

## Test Suite 4: Admin Panel

### Test 4.1: Admin Access
**Steps**:
1. Navigate to /admin
2. Sign in with authorized admin email
3. Wait for panel to load

**Expected Result**:
- ✅ Admin panel displays
- ✅ Team members section visible
- ✅ Admin controls available

---

### Test 4.2: Add Team Member
**Steps**:
1. Sign in as admin
2. Fill team member form
3. Click "Add Member"
4. Verify list updates

**Expected Result**:
- ✅ Team member added successfully
- ✅ Member appears in list
- ✅ Data saved to Firebase
- ✅ Real-time sync to home page

---

### Test 4.3: Non-Admin Blocked
**Steps**:
1. Sign in as regular user
2. Navigate to /admin
3. Try to access features

**Expected Result**:
- ✅ "Access Denied" message
- ✅ Redirected away from admin
- ✅ Cannot modify team members

---

## Test Suite 5: Error Handling

### Test 5.1: Network Error
**Steps**:
1. Disable internet
2. Try to create task
3. Enable internet

**Expected Result**:
- ✅ Error message displays
- ✅ User informed of issue
- ✅ Task queued for retry
- ✅ Auto-syncs when online

---

### Test 5.2: Invalid Data
**Steps**:
1. Try to submit empty task
2. Try with only spaces
3. Try with very long text

**Expected Result**:
- ✅ Empty tasks blocked
- ✅ Whitespace trimmed
- ✅ Long text handled gracefully
- ✅ Appropriate error messages

---

### Test 5.3: Database Error
**Steps**:
1. Simulate Firebase unavailable
2. Try operations
3. Restore Firebase

**Expected Result**:
- ✅ Error caught gracefully
- ✅ User informed
- ✅ App remains functional
- ✅ Retries when available

---

## Test Suite 6: Performance

### Test 6.1: Load Time
**Steps**:
1. Open DevTools (F12)
2. Go to Network tab
3. Load app
4. Check load time

**Expected Result**:
- ✅ Page loads in < 3 seconds
- ✅ Firebase loads quickly
- ✅ Auth state determined quickly

---

### Test 6.2: Task Rendering
**Steps**:
1. Create 20-30 tasks
2. Observe performance
3. Scroll through list
4. Check responsiveness

**Expected Result**:
- ✅ All tasks render
- ✅ Smooth scrolling
- ✅ No lag or freezing
- ✅ Updates still responsive

---

### Test 6.3: Real-Time Updates Latency
**Steps**:
1. Note time on first device
2. Create task on first device
3. Check when it appears on second device
4. Calculate latency

**Expected Result**:
- ✅ Appears in < 1 second
- ✅ No noticeable delay
- ✅ Smooth transition

---

## Browser Compatibility Tests

### Test Different Browsers
- [ ] Chrome/Edge
- [ ] Firefox
- [ ] Safari
- [ ] Mobile Safari
- [ ] Mobile Chrome

**Expected Result**: All tests pass in all browsers

---

## Mobile Testing

### Test 6.1: Responsive Design
**Steps**:
1. Open on mobile device
2. Create tasks
3. Complete tasks
4. Add comments
5. Test gestures

**Expected Result**:
- ✅ Responsive layout
- ✅ Touch friendly
- ✅ All features work
- ✅ Performance good

---

## Test Automation Script

```bash
# Run all tests (manual)
npm run dev

# Build for production
npm run build

# Run linter
npm run lint

# Preview production build
npm run preview
```

---

## Firebase Console Checks

After each test, verify in Firebase Console:

### Realtime Database
1. Go to Firebase Console
2. Select "toi-task" project
3. Click "Realtime Database"
4. Verify:
   - [ ] Users collection has user data
   - [ ] Tasks appear under correct user
   - [ ] Comments stored with tasks
   - [ ] Team members in correct collection

### Authentication
1. Click "Authentication"
2. Click "Users"
3. Verify:
   - [ ] New users appear
   - [ ] User emails correct
   - [ ] Sign-in methods show "Google"
   - [ ] Login count correct

### Analytics (Optional)
1. Click "Analytics"
2. Verify:
   - [ ] Page views tracked
   - [ ] User activity logged
   - [ ] Events recorded

---

## Browser DevTools Checks

Press F12 and check:

### Console
- [ ] No JavaScript errors
- [ ] No Firebase errors
- [ ] Loading messages appear
- [ ] Success messages appear

### Network
- [ ] Firebase requests succeed (status 200)
- [ ] JSON payloads correct
- [ ] No blocked requests
- [ ] Response times reasonable

### Application
- [ ] Auth state stored correctly
- [ ] No sensitive data in localStorage
- [ ] Cookies set appropriately
- [ ] Cache working

### Performance
- [ ] Page load < 3 seconds
- [ ] React renders efficiently
- [ ] No memory leaks
- [ ] CPU usage reasonable

---

## Final Checklist

### Functional
- [ ] Login works
- [ ] Tasks sync real-time
- [ ] Admin access restricted
- [ ] Comments work
- [ ] Likes work
- [ ] Team management works
- [ ] Logout works

### Non-Functional
- [ ] Performance acceptable
- [ ] Mobile responsive
- [ ] Error messages clear
- [ ] Loading states shown
- [ ] No console errors

### Security
- [ ] HTTPS in use
- [ ] No exposed credentials
- [ ] Admin access restricted
- [ ] User data isolated
- [ ] Logout clears session

### Data
- [ ] Tasks persist in database
- [ ] Real-time sync works
- [ ] No data loss
- [ ] Correct user associations
- [ ] Comments linked correctly

---

## Bug Report Template

If you find issues:

```
Title: [Brief description]

Expected Behavior:
[What should happen]

Actual Behavior:
[What actually happened]

Steps to Reproduce:
1. [First step]
2. [Second step]
3. [etc]

Browser/Device:
[Device and browser info]

Console Errors:
[Any error messages]

Firebase Console:
[Relevant data in Firebase]

Screenshots:
[Attach if applicable]
```

---

## Performance Targets

| Metric | Target | Actual |
|--------|--------|--------|
| Initial Load Time | < 3s | _____ |
| Task Creation | < 1s | _____ |
| Real-Time Sync | < 1s | _____ |
| Comment Add | < 1s | _____ |
| Page Responsiveness | 60 FPS | _____ |
| Mobile Load | < 4s | _____ |

---

**Good luck with testing! Report any issues found. 🚀**
