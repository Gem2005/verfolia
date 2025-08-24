// Simple test script to verify analytics system
// Run this in your browser console on a resume page

console.log("🧪 Testing Analytics System...");

// Test 1: Check if resumeService is available
if (typeof window !== "undefined" && window.resumeService) {
  console.log("✅ resumeService is available");
} else {
  console.log("❌ resumeService is not available");
}

// Test 2: Check if analytics components are loaded
const viewTracker = document.querySelector('[data-analytics="view-tracker"]');
const trackableLinks = document.querySelectorAll(
  '[data-analytics="trackable-link"]'
);
const sectionTrackers = document.querySelectorAll(
  '[data-analytics="section-tracker"]'
);

console.log("📊 Analytics Components Found:");
console.log("- ViewTracker:", viewTracker ? "✅" : "❌");
console.log("- TrackableLinks:", trackableLinks.length);
console.log("- SectionTrackers:", sectionTrackers.length);

// Test 3: Check console for analytics logs
console.log("🔍 Check the console above for analytics tracking logs");
console.log("📝 Look for: 🔍, ✅, ❌, 🔗, 👁️, ⏱️ emojis");

// Test 4: Manual interaction test
console.log("🖱️ Try clicking on links and scrolling to see sections");
console.log(
  "📊 Check the Network tab for API calls to resume_views and resume_interactions"
);
