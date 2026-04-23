// =====================================================================
// UniClub — Data Layer (API-driven, replaces hardcoded clubs array)
// =====================================================================

// Global clubs cache (populated from API)
let clubs = [];
let clubsLoaded = false;

async function loadClubs() {
  if (clubsLoaded && clubs.length > 0) return clubs;
  try {
    clubs = await UniClubAPI.getAllClubs();
    clubsLoaded = true;
  } catch (e) {
    console.error('Failed to load clubs:', e);
    clubs = [];
  }
  return clubs;
}

// Build the modalData lookup from loaded clubs
let modalData = {};
function buildModalData() {
  modalData = {};
  clubs.forEach(c => {
    modalData[c.slug] = c;
    modalData[c.id] = c;
  });
}