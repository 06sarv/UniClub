// =====================================================================
// UniClub — Faculty Module (API-driven)
// =====================================================================

// ── Local State (populated from API on init) ──
let facultyClubs = [];
let facultyPosts = [];
let facultyProfile = null;
let postImageData = null;
let postImageFile = null;

// ── Templates ─────────────────────────────────────────────────────────
const FACULTY_PAGE_TEMPLATES = {
  home: `
    <section class="faculty-page active" id="page-home">
      <div class="greeting-header">
        <h1 class="greeting-text" id="greetingText">Hello,<br>Faculty</h1>
        <p class="greeting-subtext" id="greetingSub">Manage your clubs and track engagement.</p>
      </div>
      <div class="dashboard-stat-grid">
        <div class="dashboard-stat-card blue-theme">
          <div class="stat-val" id="stat-total-clubs">0</div>
          <div class="stat-name">Total Clubs</div>
        </div>
        <div class="dashboard-stat-card cream-theme">
          <div class="stat-val" id="stat-total-members">0</div>
          <div class="stat-name">Total Members</div>
        </div>
        <div class="dashboard-stat-card blue-theme">
          <div class="stat-val" id="stat-total-posts">0</div>
          <div class="stat-name">Total Posts</div>
        </div>
        <div class="dashboard-stat-card cream-theme">
          <div class="stat-val" id="stat-post-impressions">0</div>
          <div class="stat-name">Post Impressions</div>
        </div>
      </div>
      <div class="chart-container">
        <div class="chart-header">
          <div class="chart-title-wrap">
            <span class="chart-kicker">Faculty Analytics</span>
            <h2 class="chart-growth" id="chartGrowthValue">—</h2>
            <p class="chart-subtitle">Post impressions across all your clubs for the last 14 days.</p>
          </div>
          <span class="chart-meta" id="chartMetaLabel">Last 14 Days</span>
        </div>
        <div class="chart-svg-wrap">
          <svg id="engagementChart" class="chart-svg" viewBox="0 0 960 260" preserveAspectRatio="xMidYMid meet"></svg>
        </div>
      </div>

      <!-- Pending Requests Preview -->
      <div style="margin-top:32px;" id="requestsPreview"></div>
    </section>
  `,
  clubs: `
    <section class="faculty-page active" id="page-clubs">
      <div class="section-header">
        <h2 class="display-lg">Manage Clubs</h2>
        <button class="btn btn-primary" onclick="openEditClubModal()" style="border-radius:12px">+ Add New Club</button>
      </div>
      <div class="club-grid" id="facultyOwnedClubsGrid" style="grid-template-columns: repeat(2, 1fr); gap: 48px; margin-top: 48px"></div>
    </section>
  `,
  community: `
    <section class="faculty-page active" id="page-community">
      <div class="section-header">
        <h2 class="display-lg">Manage Community</h2>
      </div>
      <div class="post-composer-card">
        <div class="composer-main">
          <div class="composer-heading">
            <div class="label" style="font-weight:950; text-transform:uppercase">Faculty Broadcast Studio</div>
            <div class="composer-title">Draft an announcement that actually gets seen.</div>
            <div class="composer-note">Create event pushes, recruitment calls, and polished club updates.</div>
          </div>
          <div class="form-group">
            <label class="form-label">Post for Club</label>
            <select id="postClubSelect" class="form-input"></select>
          </div>
          <div class="form-group">
            <input type="text" id="postTitle" class="form-input" placeholder="Title for the community...">
          </div>
          <div class="form-group">
            <div class="post-type-row">
              <button class="post-type-btn active" onclick="setPostType(this)">Event</button>
              <button class="post-type-btn" onclick="setPostType(this)">Recruitment</button>
              <button class="post-type-btn" onclick="setPostType(this)">Announcement</button>
            </div>
          </div>
          <textarea id="postContent" class="post-input" placeholder="Share your message..."></textarea>
          <div class="file-chooser-row">
            <label class="file-chooser-btn" for="postImageInput">
              <svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></svg>
              Add Image
            </label>
            <input type="file" id="postImageInput" accept="image/*" style="display:none" onchange="handlePostImage(this)">
            <span class="file-name-display" id="postFileName"></span>
          </div>
          <div id="previewContainer" style="position:relative; display:none; margin-top:4px;">
            <div class="photo-remove-btn" onclick="removePostPhoto()">✕</div>
            <img id="postImagePreview" style="width:100%; max-height:300px; object-fit:cover; border-radius:18px; border:3px solid var(--border);">
          </div>
        </div>
        <div class="composer-side">
          <div>
            <div class="label" style="font-weight:900; margin-bottom:10px; color:var(--blue)">Post Tips</div>
            <div class="composer-tips">
              <div class="composer-tip"><strong>Best performing</strong><span>Event headlines with a clear action line usually drive the strongest impression spikes.</span></div>
              <div class="composer-tip"><strong>Ideal opener</strong><span>Keep the first sentence sharp. Students decide fast whether a post is worth opening.</span></div>
              <div class="composer-tip"><strong>Visual boost</strong><span>Adding a poster or highlight image makes recruitment and event posts feel much more complete.</span></div>
            </div>
          </div>
          <div class="composer-actions">
            <button class="btn btn-secondary" onclick="cancelPublish()" style="border-radius:14px">Cancel</button>
            <button class="btn btn-primary" onclick="publishFacultyPost()" style="border-radius:14px">Publish Post</button>
          </div>
        </div>
      </div>
      <div id="facultyPostsFeed"></div>
    </section>
  `,
  profile: `
    <section class="faculty-page active" id="page-profile">
      <div class="section-header">
        <h2 class="display-lg">Faculty Profile</h2>
      </div>
      <div class="faculty-profile-shell" id="facultyProfileShell">
        <div class="faculty-profile-top">
          <div class="faculty-profile-identity">
            <div class="faculty-profile-avatar" id="facultyProfileAvatar">FC</div>
            <div>
              <div class="faculty-profile-title" id="facultyProfileHeading">Faculty</div>
              <div class="faculty-profile-meta" id="facultyProfileMeta">Loading...</div>
            </div>
          </div>
          <button type="button" class="faculty-profile-edit-btn" id="facultyProfileEditBtn" onclick="enableFacultyProfileEdit()">Edit Profile</button>
        </div>
        <form onsubmit="saveProfile(event)">
          <div class="faculty-profile-grid">
            <div class="faculty-profile-field">
              <label for="profileName">Full Name</label>
              <input type="text" id="profileName" class="faculty-profile-input" readonly>
            </div>
            <div class="faculty-profile-field">
              <label for="profileDesc">Description</label>
              <textarea id="profileDesc" class="faculty-profile-textarea" readonly></textarea>
            </div>
          </div>
          <div class="faculty-profile-save-row" id="facultyProfileSaveRow">
            <button type="button" class="btn btn-secondary" onclick="cancelFacultyProfileEdit()" style="border-radius:14px">Cancel</button>
            <button type="submit" class="btn btn-primary" style="border-radius:14px">Save Changes</button>
          </div>
        </form>
        <div class="faculty-profile-account">
          <div class="faculty-profile-account-title">Account</div>
          <div class="faculty-profile-account-actions">
            <button class="faculty-account-btn secondary" onclick="requestAccountDeletion()">Delete Account</button>
            <button class="faculty-account-btn primary" onclick="logOutFaculty()">Log Out</button>
          </div>
        </div>
      </div>
    </section>
  `
};

const FACULTY_SHELL_TEMPLATE = `
  <div class="top-bar" id="topBar">
    <div class="logo" onclick="window.location.href='home.html'" style="cursor:pointer">Uni<span>Club</span></div>
  </div>
  <div style="background:var(--cream); min-height:100vh; padding-bottom:140px;">
    <div style="max-width:980px; margin:0 auto; padding:0 20px;">
      <div id="facultyPageMount"></div>
    </div>
  </div>
  <nav class="nav-bar faculty-nav" id="navBar">
    <div class="nav-item" id="fnav-home" onclick="showFacultyPage('home')">
      <span class="nav-icon"><svg viewBox="0 0 24 24"><path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"/><path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg></span>
      <span class="nav-label">Home</span>
    </div>
    <div class="nav-item" id="fnav-clubs" onclick="showFacultyPage('clubs')">
      <span class="nav-icon"><svg viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5Z"/><path d="m2 17 10 5 10-5"/><path d="m2 12 10 5 10-5"/></svg></span>
      <span class="nav-label">Clubs</span>
    </div>
    <div class="nav-item" id="fnav-community" onclick="showFacultyPage('community')">
      <span class="nav-icon"><svg viewBox="0 0 24 24"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg></span>
      <span class="nav-label">Community</span>
    </div>
    <div class="nav-item" id="fnav-profile" onclick="showFacultyPage('profile')">
      <span class="nav-icon"><svg viewBox="0 0 24 24"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg></span>
      <span class="nav-label">Profile</span>
    </div>
  </nav>

  <div class="modal-overlay" id="editClubModal" onclick="if(event.target === this) closeEditModal()">
    <div class="modal-card" style="background: white; max-width: 780px; max-height: 90vh; display:flex; flex-direction:column;">
      <div class="modal-body" style="padding: 36px 48px 0; flex-shrink:0;">
        <h3 class="display-md" style="margin-bottom:20px; text-transform:uppercase" id="modalTitle">Manage Club</h3>
        <!-- TABS -->
        <div style="display:flex; gap:0; border-bottom:2px solid var(--border); margin-bottom:28px;">
          <button id="tabDetails" onclick="switchClubTab('details')" style="background:none;border:none;padding:10px 24px;font-family:var(--font-head);font-weight:800;font-size:0.9rem;text-transform:uppercase;cursor:pointer;border-bottom:3px solid var(--black);margin-bottom:-2px;color:var(--black);">Details</button>
          <button id="tabMembers" onclick="switchClubTab('members')" style="background:none;border:none;padding:10px 24px;font-family:var(--font-head);font-weight:800;font-size:0.9rem;text-transform:uppercase;cursor:pointer;border-bottom:3px solid transparent;margin-bottom:-2px;color:var(--gray);">Members</button>
        </div>
      </div>
      <!-- DETAILS PANEL -->
      <div id="panelDetails" style="overflow-y:auto; padding: 0 48px; flex:1;">
        <form id="editClubForm" onsubmit="saveClub(event)">
          <input type="hidden" id="editId">
          <div class="modal-grid">
            <div class="form-group">
              <label class="form-label">Club Name</label>
              <input type="text" id="editName" class="form-input" placeholder="e.g. AI Hackers" required>
            </div>
            <div class="form-group">
              <label class="form-label">Category</label>
              <select id="editCategory" class="form-input">
                <option value="tech">Tech</option>
                <option value="arts">Arts</option>
                <option value="sports">Sports</option>
                <option value="non-tech">Non-Tech</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Club Status</label>
              <select id="editStatus" class="form-input">
                <option value="ACTIVE HIRING">Active Hiring</option>
                <option value="AUDITIONS OPEN">Auditions Open</option>
                <option value="CLOSING SOON">Closing Soon</option>
                <option value="CLOSED">Closed</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Domain</label>
              <input type="text" id="editDomain" class="form-input" placeholder="e.g. Technology">
            </div>
            <div class="form-group modal-full">
              <label class="form-label">About Club</label>
              <textarea id="editDesc" class="form-input" style="height:100px; resize:vertical" required></textarea>
            </div>
            <div class="form-group modal-full">
              <label class="form-label">Tags (comma separated)</label>
              <input type="text" id="editTags" class="form-input" placeholder="AI, Machine Learning, Data">
            </div>
            <div class="form-group">
              <label class="form-label">Instagram URL</label>
              <input type="text" id="editSocialInstagram" class="form-input" placeholder="https://instagram.com/clubname">
            </div>
            <div class="form-group">
              <label class="form-label">GitHub URL</label>
              <input type="text" id="editSocialGithub" class="form-input" placeholder="https://github.com/clubname">
            </div>
            <div class="form-group">
              <label class="form-label">LinkedIn URL</label>
              <input type="text" id="editSocialLinkedin" class="form-input" placeholder="https://linkedin.com/company/...">
            </div>
            <div class="form-group">
              <label class="form-label">Website URL</label>
              <input type="text" id="editSocialWebsite" class="form-input" placeholder="https://yourclub.in">
            </div>
          </div>
          <div style="padding:28px 0 36px; display:flex; align-items:center; justify-content:flex-end; gap:24px">
            <button type="button" class="modal-delete-btn" onclick="triggerDeleteClub()">Delete</button>
            <button type="submit" class="save-club-btn">Save Club</button>
          </div>
        </form>
      </div>
      <!-- MEMBERS PANEL -->
      <div id="panelMembers" style="display:none; overflow-y:auto; padding: 0 48px; flex:1;">
        <!-- Add member form -->
        <div style="display:flex;gap:10px;margin-bottom:20px;align-items:flex-end;flex-wrap:wrap;">
          <div style="flex:1;min-width:140px;">
            <label class="form-label" style="font-size:0.7rem;margin-bottom:4px;">Student Name</label>
            <input type="text" id="newMemberName" class="form-input" placeholder="e.g. Rahul Sharma" style="height:42px;">
          </div>
          <div style="flex:1;min-width:180px;">
            <label class="form-label" style="font-size:0.7rem;margin-bottom:4px;">Email</label>
            <input type="email" id="newMemberEmail" class="form-input" placeholder="rahul@srm.edu" style="height:42px;">
          </div>
          <div style="width:150px;">
            <label class="form-label" style="font-size:0.7rem;margin-bottom:4px;">Role</label>
            <select id="newMemberRole" class="form-input" style="height:42px;">
              <option value="Member">Member</option>
              <option value="Lead">Lead</option>
              <option value="Secretary">Secretary</option>
              <option value="Treasurer">Treasurer</option>
              <option value="Vice President">Vice President</option>
              <option value="President">President</option>
            </select>
          </div>
          <button class="save-club-btn" style="white-space:nowrap;padding:10px 20px;height:42px;" onclick="addMemberByForm()">+ Add</button>
        </div>
        <!-- Members list -->
        <div id="modalMembersList" style="display:flex;flex-direction:column;gap:10px;padding-bottom:36px;">Loading members…</div>
      </div>
    </div>
  </div>

  <div class="modal-overlay" id="deleteModal" onclick="if(event.target === this) closeDeleteModal()">
    <div class="modal-card" style="max-width: 440px">
      <div class="modal-body" style="padding: 32px">
        <h3 class="display-sm" id="deleteModalTitle" style="margin-bottom:16px; font-weight: 950;">Confirm Action?</h3>
        <p class="body-text" id="deleteModalMessage" style="margin-bottom: 24px; color: var(--gray);">Are you sure?</p>
        <div class="dialog-buttons">
          <button class="btn-dialog-cancel" onclick="closeDeleteModal()">Cancel</button>
          <button class="btn-dialog-confirm" id="confirmDeleteActionBtn">Proceed</button>
        </div>
      </div>
    </div>
  </div>
`;

// ===================== DELETE MODAL LOGIC =====================
let deleteAction = null;

function openDeleteModal({title, message, confirmText, hideCancel, onConfirm}) {
  document.getElementById('deleteModalTitle').textContent = title || 'Confirm Action?';
  document.getElementById('deleteModalMessage').textContent = message || 'Are you sure?';
  const confirmBtn = document.getElementById('confirmDeleteActionBtn');
  confirmBtn.textContent = confirmText || 'Proceed';
  const cancelBtn = document.querySelector('.btn-dialog-cancel');
  if (hideCancel) cancelBtn.style.display = 'none';
  else cancelBtn.style.display = 'block';
  deleteAction = onConfirm;
  document.getElementById('deleteModal').classList.add('open');
}

function closeDeleteModal() {
  document.getElementById('deleteModal').classList.remove('open');
  deleteAction = null;
}

function initFacultyModalBindings() {
  const confirmBtn = document.getElementById('confirmDeleteActionBtn');
  if (!confirmBtn) return;
  confirmBtn.onclick = () => {
    if (deleteAction) deleteAction();
    closeDeleteModal();
  };
}

// ===================== ROUTING =====================
function getFacultyPagePath(name) { return `${name}.html`; }

function showFacultyPage(name) {
  const currentPage = document.body.dataset.facultyPage || 'home';
  if (currentPage !== name) {
    window.location.href = getFacultyPagePath(name);
    return;
  }
  document.querySelectorAll('.faculty-nav .nav-item').forEach(i => i.classList.remove('active'));
  const activeNav = document.getElementById('fnav-' + name);
  if (activeNav) activeNav.classList.add('active');
  window.scrollTo(0, 0);
  if (name === 'home') { loadHomeData(); }
  if (name === 'clubs') { loadClubsData(); }
  if (name === 'community') { loadCommunityData(); }
  if (name === 'profile') { loadProfileData(); }
}

// ===================== HELPERS =====================
function getInitials(name) {
  return (name || '').trim().split(/\s+/).slice(0, 2).map(part => part.charAt(0).toUpperCase()).join('') || 'FC';
}

function getClubVisual(club) {
  const cat = (club.category || '').toLowerCase();
  const name = (club.name || '').toLowerCase();
  if (cat === 'tech' || name.includes('ai') || name.includes('code') || name.includes('cyber') || name.includes('robot') || name.includes('data') || name.includes('cloud') || name.includes('dev')) {
    return { bg: '#EEF2FF', icon: `<svg viewBox="0 0 24 24"><path d="M20 16V7a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v9m16 0H4m16 0 1.28 2.55a1 1 0 0 1-.9 1.45H3.62a1 1 0 0 1-.9-1.45L4 16"/></svg>` };
  }
  if (cat === 'arts' || name.includes('design') || name.includes('music') || name.includes('photo') || name.includes('dance')) {
    return { bg: '#FDF4FF', icon: `<svg viewBox="0 0 24 24"><circle cx="13.5" cy="6.5" r=".5" fill="currentColor"/><circle cx="17.5" cy="10.5" r=".5" fill="currentColor"/><circle cx="8.5" cy="7.5" r=".5" fill="currentColor"/><circle cx="6.5" cy="12.5" r=".5" fill="currentColor"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/></svg>` };
  }
  if (cat === 'sports' || name.includes('cricket') || name.includes('football') || name.includes('sport')) {
    return { bg: '#F0FDF4', icon: `<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="m4.93 4.93 14.14 14.14"/><path d="m14.12 9.88-4.24 4.24"/></svg>` };
  }
  return { bg: '#FFF7ED', icon: `<svg viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5Z"/><path d="m2 17 10 5 10-5"/><path d="m2 12 10 5 10-5"/></svg>` };
}

function setPostType(btn) {
  btn.closest('.post-type-row').querySelectorAll('.post-type-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
}

// Generates overlapping colored avatar circles + +N count pill (like the screenshot)
function renderAvatarRow(count, clubName) {
  const COLORS = [
    '#f87171','#fb923c','#fbbf24','#34d399','#60a5fa',
    '#a78bfa','#f472b6','#38bdf8','#4ade80','#e879f9',
  ];
  const seed = (clubName || 'X').charCodeAt(0);
  const c1 = COLORS[seed % COLORS.length];
  const c2 = COLORS[(seed + 3) % COLORS.length];
  const letter1 = (clubName || 'C').charAt(0).toUpperCase();
  const letter2 = (clubName || 'C').charAt(Math.floor((clubName||'C').length/2)).toUpperCase();
  const remaining = Math.max(0, count - 2);
  const cs = 'width:32px;height:32px;min-width:32px;min-height:32px;border-radius:50%;border:2px solid white;display:flex;align-items:center;justify-content:center;font-size:0.65rem;font-weight:900;color:white;box-sizing:border-box';
  return `
    <div class="featured-card-avatars">
      <div style="${cs};background:${c1}">${letter1}</div>
      <div style="${cs};background:${c2};margin-left:-10px">${letter2}</div>
      ${count > 0 ? `<div class="avatar-count" style="margin-left:-10px;">+${remaining > 0 ? remaining : count}</div>` : ''}
    </div>
  `;
}

// ===================== HOME: LOAD REAL DATA  =====================
async function loadHomeData() {
  try {
    const user = await UniClubAPI.getUser();
    if (!user) { window.location.href = '../auth.html?mode=signin'; return; }

    facultyProfile = await UniClubAPI.getMyProfile();
    const stats = await UniClubAPI.getFacultyStats(user.id);
    facultyClubs = stats.clubs;
    facultyPosts = stats.posts;

    // Greeting
    const greeting = document.getElementById('greetingText');
    if (greeting) greeting.innerHTML = `Hello,<br>${facultyProfile.full_name}`;

    // Stats
    const el = (id) => document.getElementById(id);
    if (el('stat-total-clubs')) el('stat-total-clubs').textContent = stats.totalClubs;
    if (el('stat-total-members')) el('stat-total-members').textContent = stats.totalMembers;
    if (el('stat-total-posts')) el('stat-total-posts').textContent = stats.totalPosts;
    const impText = stats.totalImpressions >= 1000 ? `${(stats.totalImpressions / 1000).toFixed(1)}k` : stats.totalImpressions;
    if (el('stat-post-impressions')) el('stat-post-impressions').textContent = impText;

    // Impression chart
    const impressionData = await UniClubAPI.getFacultyImpressions(user.id, 14);
    renderChart(impressionData);

    // Pending requests preview
    const requests = await UniClubAPI.getAllFacultyRequests(user.id);
    const preview = document.getElementById('requestsPreview');
    if (preview && requests.length > 0) {
      preview.innerHTML = `
        <div style="border:2px solid var(--border); border-radius:16px; padding:24px; background:white; box-shadow:var(--shadow);">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
            <div class="display-md" style="font-size:1.1rem">Pending Requests (${requests.length})</div>
            <button class="btn btn-ghost" onclick="showFacultyPage('clubs')" style="font-size:0.75rem">View All →</button>
          </div>
          ${requests.slice(0, 3).map(r => `
            <div style="display:flex; align-items:center; gap:12px; padding:12px 0; border-top:1px solid var(--cream-dark);">
              <div style="width:36px;height:36px;border-radius:50%;background:var(--blue-tint);display:flex;align-items:center;justify-content:center;font-weight:700;font-size:0.75rem">${getInitials(r.profiles?.full_name || '')}</div>
              <div style="flex:1">
                <div style="font-weight:700;font-size:0.88rem">${r.profiles?.full_name || 'Student'}</div>
                <div style="font-size:0.75rem;color:var(--gray)">${r.clubs?.name || 'club'} — leave request</div>
              </div>
              <div style="display:flex;gap:8px;">
                <button class="btn btn-primary" style="padding:6px 14px;font-size:0.7rem;border-radius:8px" onclick="approveReq('${r.id}')">Approve</button>
                <button class="btn btn-secondary" style="padding:6px 14px;font-size:0.7rem;border-radius:8px" onclick="rejectReq('${r.id}')">Reject</button>
              </div>
            </div>
          `).join('')}
        </div>
      `;
    }
  } catch (e) {
    console.error('Home data error:', e);
  }
}

async function approveReq(reqId) {
  try {
    await UniClubAPI.approveRequest(reqId);
    loadHomeData(); // Refresh
  } catch (e) { openDeleteModal({ title: 'Error', message: e.message, confirmText: 'OK', hideCancel: true, onConfirm: () => {} }); }
}

async function rejectReq(reqId) {
  try {
    await UniClubAPI.rejectRequest(reqId);
    loadHomeData(); // Refresh
  } catch (e) { openDeleteModal({ title: 'Error', message: e.message, confirmText: 'OK', hideCancel: true, onConfirm: () => {} }); }
}

// ===================== CHART =====================
function buildLinePath(points) {
  if (!points.length) return '';
  let path = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    const cp1x = prev.x + (curr.x - prev.x) / 2;
    const cp1y = prev.y;
    const cp2x = prev.x + (curr.x - prev.x) / 2;
    const cp2y = curr.y;
    path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${curr.x} ${curr.y}`;
  }
  return path;
}

function renderChart(data) {
  const svg = document.getElementById('engagementChart');
  if (!svg) return;
  svg.innerHTML = '';

  // If no data, show placeholder
  if (!data || data.length === 0) {
    svg.innerHTML = '<text x="480" y="130" text-anchor="middle" fill="#999" font-size="14">No impression data yet</text>';
    return;
  }

  const svgNs = 'http://www.w3.org/2000/svg';
  const svgWidth = 960;
  const svgHeight = 260;
  const padding = { top: 18, right: 34, bottom: 42, left: 34 };
  const chartWidth = svgWidth - padding.left - padding.right;
  const chartHeight = svgHeight - padding.top - padding.bottom;
  const values = data.map(d => Number(d.impressions));
  const max = Math.max(...values) * 1.12;
  const min = Math.min(...values) * 0.9;
  const yRange = max - min || 1;

  const defs = document.createElementNS(svgNs, 'defs');
  defs.innerHTML = `<linearGradient id="facultyAreaGradient" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#3B5FC0" stop-opacity="0.28"></stop><stop offset="70%" stop-color="#3B5FC0" stop-opacity="0.08"></stop><stop offset="100%" stop-color="#3B5FC0" stop-opacity="0"></stop></linearGradient>`;
  svg.appendChild(defs);

  const points = data.map((entry, index) => {
    const x = padding.left + (index / (data.length - 1 || 1)) * chartWidth;
    const y = padding.top + chartHeight - ((Number(entry.impressions) - min) / yRange) * chartHeight;
    const d = new Date(entry.day);
    const label = d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
    return { x, y, label, value: entry.impressions };
  });

  for (let i = 1; i <= 3; i++) {
    const y = padding.top + (chartHeight / 4) * i;
    const line = document.createElementNS(svgNs, 'line');
    line.setAttribute('class', 'chart-grid-line');
    line.setAttribute('x1', padding.left);
    line.setAttribute('x2', svgWidth - padding.right);
    line.setAttribute('y1', y);
    line.setAttribute('y2', y);
    svg.appendChild(line);
  }

  const areaPath = buildLinePath(points);
  const area = document.createElementNS(svgNs, 'path');
  area.setAttribute('class', 'chart-area');
  area.setAttribute('d', `${areaPath} L ${points[points.length - 1].x} ${padding.top + chartHeight} L ${points[0].x} ${padding.top + chartHeight} Z`);
  svg.appendChild(area);

  const line = document.createElementNS(svgNs, 'path');
  line.setAttribute('class', 'chart-line');
  line.setAttribute('d', areaPath);
  svg.appendChild(line);

  const pathLength = line.getTotalLength();
  line.style.setProperty('--path-length', pathLength);
  line.classList.add('animate');

  // Peak point
  let peakIdx = 0;
  values.forEach((v, i) => { if (v > values[peakIdx]) peakIdx = i; });
  const peakPoint = points[peakIdx];

  const stem = document.createElementNS(svgNs, 'line');
  stem.setAttribute('class', 'chart-stem animate');
  stem.setAttribute('x1', peakPoint.x);
  stem.setAttribute('x2', peakPoint.x);
  stem.setAttribute('y1', peakPoint.y + 8);
  stem.setAttribute('y2', padding.top + chartHeight + 2);
  svg.appendChild(stem);

  const dot = document.createElementNS(svgNs, 'circle');
  dot.setAttribute('class', 'chart-dot animate');
  dot.setAttribute('cx', peakPoint.x);
  dot.setAttribute('cy', peakPoint.y);
  dot.setAttribute('r', '7');
  svg.appendChild(dot);

  const annotation = document.createElementNS(svgNs, 'text');
  annotation.setAttribute('class', 'chart-annotation');
  annotation.setAttribute('x', peakPoint.x - 18);
  annotation.setAttribute('y', peakPoint.y - 16);
  annotation.textContent = `${peakPoint.value} imp`;
  svg.appendChild(annotation);

  points.forEach((point, index) => {
    if (index % 2 !== 0 && index !== points.length - 1) return;
    const label = document.createElementNS(svgNs, 'text');
    label.setAttribute('class', 'chart-axis-label');
    label.setAttribute('x', point.x);
    label.setAttribute('y', svgHeight - 10);
    label.setAttribute('text-anchor', index === 0 ? 'start' : index === points.length - 1 ? 'end' : 'middle');
    label.textContent = point.label;
    svg.appendChild(label);
  });

  // Growth label
  const total = values.reduce((a, b) => a + b, 0);
  const growthEl = document.getElementById('chartGrowthValue');
  const metaEl = document.getElementById('chartMetaLabel');
  if (growthEl) growthEl.textContent = `${total.toLocaleString()} impressions`;
  if (metaEl) metaEl.textContent = `Last 14 Days`;
}

// ===================== CLUBS PAGE =====================
async function loadClubsData() {
  try {
    const user = await UniClubAPI.getUser();
    facultyClubs = await UniClubAPI.getFacultyClubs(user.id);
    renderClubs();
  } catch (e) {
    console.error('Clubs data error:', e);
  }
}

function renderClubs() {
  const grid = document.getElementById('facultyOwnedClubsGrid');
  if (!grid) return;
  grid.innerHTML = facultyClubs.map(c => {
    const visual = getClubVisual(c);
    let badgeColor = 'var(--blue)';
    if (c.status === 'AUDITIONS OPEN') badgeColor = 'var(--black)';
    if (c.status === 'CLOSING SOON') badgeColor = '#dc2626';

    return `
      <div class="faculty-owned-card" onclick="openEditClubModal('${c.id}')">
        <div class="featured-card-badge" style="background:${badgeColor};">${c.status}</div>
        <div class="featured-card-header">
          <div class="featured-card-icon" style="background:${visual.bg};">${visual.icon}</div>
          <div class="featured-card-dept">${c.domain || c.category}</div>
        </div>
        <div class="featured-card-title">${c.name}</div>
        <div class="featured-card-body">${c.description || ''}</div>
        <div class="featured-card-footer">
          ${renderAvatarRow(c.member_count || 0, c.name)}
          <div>
            <button class="featured-card-btn" onclick="event.stopPropagation(); openEditClubModal('${c.id}')">Manage</button>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function openEditClubModal(id = null) {
  const modal = document.getElementById('editClubModal');
  const form = document.getElementById('editClubForm');
  if (id) {
    const c = facultyClubs.find(c => c.id === id);
    if (!c) return;
    document.getElementById('modalTitle').textContent = 'Modify Club';
    document.getElementById('editId').value = c.id;
    document.getElementById('editName').value = c.name;
    document.getElementById('editCategory').value = c.category;
    document.getElementById('editStatus').value = c.status;
    document.getElementById('editDomain').value = c.domain || '';
    document.getElementById('editDesc').value = c.description || '';
    document.getElementById('editTags').value = (c.tags || []).join(', ');
    const sl = c.social_links || {};
    document.getElementById('editSocialInstagram').value = sl.instagram || '';
    document.getElementById('editSocialGithub').value = sl.github || '';
    document.getElementById('editSocialLinkedin').value = sl.linkedin || '';
    document.getElementById('editSocialWebsite').value = sl.website || '';
  } else {
    document.getElementById('modalTitle').textContent = 'Add New Club';
    form.reset();
    document.getElementById('editId').value = '';
  }
  // Always open on Details tab
  switchClubTab('details');
  // Reset members panel
  document.getElementById('modalMembersList').innerHTML = 'Loading members…';
  const nameInput = document.getElementById('newMemberName');
  const emailInput = document.getElementById('newMemberEmail');
  if (nameInput) nameInput.value = '';
  if (emailInput) emailInput.value = '';
  modal.classList.add('open');
}

function closeEditModal() {
  document.getElementById('editClubModal').classList.remove('open');
}

// ===================== TAB SWITCHING =====================
function switchClubTab(tab) {
  const showDetails = tab === 'details';
  document.getElementById('panelDetails').style.display = showDetails ? 'block' : 'none';
  document.getElementById('panelMembers').style.display = showDetails ? 'none' : 'block';
  const tD = document.getElementById('tabDetails');
  const tM = document.getElementById('tabMembers');
  tD.style.borderBottomColor = showDetails ? 'var(--black)' : 'transparent';
  tD.style.color = showDetails ? 'var(--black)' : 'var(--gray)';
  tM.style.borderBottomColor = showDetails ? 'transparent' : 'var(--black)';
  tM.style.color = showDetails ? 'var(--gray)' : 'var(--black)';
  // When switching to members, load the list
  if (!showDetails) {
    const clubId = document.getElementById('editId').value;
    if (clubId) loadClubMembers(clubId);
    else document.getElementById('modalMembersList').innerHTML = '<div style="color:var(--gray);padding:12px">Save the club first, then add members.</div>';
  }
}

// ===================== MEMBER MANAGEMENT =====================
let _currentClubMembers = [];

async function loadClubMembers(clubId) {
  const list = document.getElementById('modalMembersList');
  list.innerHTML = '<div style="color:var(--gray);padding:12px">Loading…</div>';
  try {
    _currentClubMembers = await UniClubAPI.getClubMembers(clubId);
    renderMemberList(clubId);
  } catch(e) {
    list.innerHTML = '<div style="color:#dc2626;padding:12px">Failed to load members.</div>';
  }
}

const ROLES = ['Member','Lead','Secretary','Treasurer','Vice President','President'];

function renderMemberList(clubId) {
  const list = document.getElementById('modalMembersList');
  if (!_currentClubMembers.length) {
    list.innerHTML = '<div style="color:var(--gray);padding:12px">No members yet. Add them above.</div>';
    return;
  }
  list.innerHTML = _currentClubMembers.map(m => {
    const name = m.profiles?.full_name || 'Unknown';
    const uid = m.user_id;
    const roleOpts = ROLES.map(r => `<option value="${r}" ${r === m.role ? 'selected' : ''}>${r}</option>`).join('');
    return `
      <div style="display:flex;align-items:center;gap:12px;padding:12px 16px;background:white;border:2px solid var(--border);border-radius:12px;box-shadow:2px 2px 0 var(--border);">
        <div style="width:36px;height:36px;border-radius:50%;background:var(--blue-tint);display:flex;align-items:center;justify-content:center;font-weight:700;font-size:0.75rem;flex-shrink:0;">${getInitials(name)}</div>
        <div style="flex:1;min-width:0;">
          <div style="font-weight:700;font-size:0.9rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${name}</div>
          <div style="font-size:0.75rem;color:var(--gray);">${m.profiles?.email || ''}</div>
        </div>
        <select onchange="changeMemberRole('${clubId}','${uid}',this.value)" style="border:2px solid var(--border);border-radius:8px;padding:4px 10px;font-family:var(--font-body);font-size:0.8rem;cursor:pointer;background:white;">${roleOpts}</select>
        <button onclick="removeMemberFromClub('${clubId}','${uid}')" style="background:white;border:2px solid var(--border);border-radius:8px;width:32px;height:32px;display:flex;align-items:center;justify-content:center;cursor:pointer;color:#dc2626;flex-shrink:0;" title="Remove member">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>`;
  }).join('');
}

async function addMemberByForm() {
  const clubId = document.getElementById('editId').value;
  const name = document.getElementById('newMemberName').value.trim();
  const email = document.getElementById('newMemberEmail').value.trim();
  const role = document.getElementById('newMemberRole').value;
  if (!clubId) { openDeleteModal({ title: 'Save First', message: 'Please save the club first before adding members.', confirmText: 'OK', hideCancel: true, onConfirm: () => {} }); return; }
  if (!email) { openDeleteModal({ title: 'Email Required', message: 'Please enter the student\'s email address.', confirmText: 'OK', hideCancel: true, onConfirm: () => {} }); return; }
  try {
    await UniClubAPI.addMemberByEmail(clubId, name, email, role);
    document.getElementById('newMemberName').value = '';
    document.getElementById('newMemberEmail').value = '';
    await loadClubMembers(clubId);
    loadClubsData();
  } catch(e) { openDeleteModal({ title: 'Error', message: e.message, confirmText: 'OK', hideCancel: true, onConfirm: () => {} }); }
}

async function removeMemberFromClub(clubId, userId) {
  openDeleteModal({
    title: 'Remove Member?',
    message: 'This will remove the student from this club immediately.',
    confirmText: 'Remove',
    onConfirm: async () => {
      try {
        await UniClubAPI.removeMember(clubId, userId);
        await loadClubMembers(clubId);
        loadClubsData();
      } catch(e) { openDeleteModal({ title: 'Error', message: e.message, confirmText: 'OK', hideCancel: true, onConfirm: () => {} }); }
    }
  });
}

async function changeMemberRole(clubId, userId, role) {
  try {
    await UniClubAPI.updateMemberRole(clubId, userId, role);
    // Optimistically update local state
    const m = _currentClubMembers.find(m => m.user_id === userId);
    if (m) m.role = role;
  } catch(e) {
    openDeleteModal({ title: 'Error', message: 'Failed to update role: ' + e.message, confirmText: 'OK', hideCancel: true, onConfirm: () => {} });
    await loadClubMembers(clubId); // revert
  }
}

function triggerDeleteClub() {
  const id = document.getElementById('editId').value;
  if (!id) return;
  openDeleteModal({
    title: 'Delete Club?',
    message: 'Are you sure you want to delete this club permanently? All members and data will be removed.',
    confirmText: 'Delete Club',
    onConfirm: async () => {
      try {
        await UniClubAPI.deleteClub(id);
        closeEditModal();
        loadClubsData();
      } catch (e) { openDeleteModal({ title: 'Error', message: e.message, confirmText: 'OK', hideCancel: true, onConfirm: () => {} }); }
    }
  });
}

async function saveClub(e) {
  e.preventDefault();
  const id = document.getElementById('editId').value;
  const name = document.getElementById('editName').value.trim();
  const tagsRaw = document.getElementById('editTags').value;
  const tags = tagsRaw.split(',').map(t => t.trim()).filter(t => t.length > 0);
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+$/, '');

  const social_links = {
    instagram: document.getElementById('editSocialInstagram').value.trim() || null,
    github: document.getElementById('editSocialGithub').value.trim() || null,
    linkedin: document.getElementById('editSocialLinkedin').value.trim() || null,
    website: document.getElementById('editSocialWebsite').value.trim() || null,
  };
  // Remove nulls
  Object.keys(social_links).forEach(k => { if (!social_links[k]) delete social_links[k]; });

  const clubData = {
    name,
    category: document.getElementById('editCategory').value,
    status: document.getElementById('editStatus').value,
    domain: document.getElementById('editDomain').value,
    description: document.getElementById('editDesc').value,
    tags,
    social_links,
  };

  try {
    if (id) {
      delete clubData.slug;
      await UniClubAPI.updateClub(id, clubData);
    } else {
      // Check for duplicate name
      const existing = facultyClubs.find(c => c.name.toLowerCase() === name.toLowerCase());
      if (existing) {
        openDeleteModal({
          title: 'Club Already Exists',
          message: `A club named "${name}" already exists. Please choose a different name.`,
          confirmText: 'OK',
          hideCancel: true,
          onConfirm: closeDeleteModal
        });
        return;
      }
      const user = await UniClubAPI.getUser();
      clubData.faculty_id = user.id;
      clubData.slug = slug;
      await UniClubAPI.createClub(clubData);
    }
    closeEditModal();
    loadClubsData();
  } catch (e) {
    openDeleteModal({ title: 'Error', message: 'Failed to save: ' + e.message, confirmText: 'OK', hideCancel: true, onConfirm: () => {} });
  }
}

// ===================== COMMUNITY / POSTS =====================
async function loadCommunityData() {
  try {
    const user = await UniClubAPI.getUser();
    facultyPosts = await UniClubAPI.getFacultyPosts(user.id);
    facultyClubs = await UniClubAPI.getFacultyClubs(user.id);

    // Populate club selector
    const select = document.getElementById('postClubSelect');
    if (select) {
      select.innerHTML = facultyClubs.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
    }

    renderPosts();
  } catch (e) {
    console.error('Community data error:', e);
  }
}

function renderPosts() {
  const feed = document.getElementById('facultyPostsFeed');
  if (!feed) return;
  feed.innerHTML = facultyPosts.map(p => {
    const commentsHtml = ''; // comments loaded on expand
    return `
      <div class="faculty-post-card" data-post-id="${p.id}">
        <div class="post-header" style="padding:24px 24px 16px; display:flex; align-items:center; gap:12px">
          <div class="post-tag ${p.type.toLowerCase()}" style="font-weight:800; font-size:0.75rem">${p.type}</div>
          <div style="margin-left:auto; display:flex; gap:12px; font-size:0.75rem; font-weight:800; text-transform:uppercase; color:var(--gray)">
            <span>Views: ${p.impression_count || 0}</span>
            <span>Likes: ${p.like_count || 0}</span>
            <span>Comments: ${p.comment_count || 0}</span>
          </div>
        </div>
        <div class="post-title" style="font-family:var(--font-head); font-weight:900; font-size:1.5rem; letter-spacing:-0.02em; margin:0 24px 12px; color:var(--black); line-height:1.25">${p.title}</div>
        <div class="post-body" style="padding:0 24px 16px; font-size:0.95rem; color:#444; line-height:1.6">${p.body}</div>
        ${p.image_url ? `<div class="post-image" style="width:100%;padding:0 24px 20px"><img src="${p.image_url}" alt="Post image" style="width:100%;max-height:400px;object-fit:cover;border-radius:8px;border:2px solid var(--border);display:block"></div>` : ''}
        <div class="post-actions" style="display:flex; align-items:center; gap:16px; padding:16px 24px; border-top:2px solid var(--border); background:var(--cream)">
          <button class="post-action-btn" onclick="toggleFacultyComments(this, '${p.id}')">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" style="width:20px;height:20px;stroke-width:2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
            ${p.comment_count || 0} Comments
          </button>
          <button class="post-action-btn" style="margin-left:auto; color:#E11D48" onclick="triggerDeletePost('${p.id}')">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" style="width:18px;height:18px;stroke-width:2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
            Delete
          </button>
        </div>
        <div class="comment-section" style="display:none; padding:20px 24px; background:white; border-top:2px solid var(--border)" data-loaded="false">
          <div class="comments-container"></div>
          <div class="comment-input-row" style="display:flex; gap:12px; margin-top:16px; align-items:center">
            <div class="comment-avatar" style="background:var(--blue);color:white; width:32px; height:32px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:0.75rem; font-weight:700; border:1px solid var(--border); flex-shrink:0">${getInitials(facultyProfile?.full_name || 'FC')}</div>
            <input class="comment-input" placeholder="Write a comment..." style="flex:1; padding:12px 16px; border:2px solid var(--border); border-radius:8px; font-family:var(--font-body); font-size:0.9rem; background:var(--cream); outline:none; height:44px">
            <button class="btn btn-primary" style="padding:0 20px; height:44px; font-size:0.85rem; border-radius:8px" onclick="postFacultyComment(this, '${p.id}')">Post</button>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

async function toggleFacultyComments(btn, postId) {
  const card = btn.closest('.faculty-post-card');
  const section = card.querySelector('.comment-section');
  const isOpen = section.style.display === 'block';
  if (isOpen) { section.style.display = 'none'; return; }
  section.style.display = 'block';

  if (section.dataset.loaded === 'false') {
    await reloadFacultyComments(section, postId);
  }
}

async function reloadFacultyComments(section, postId) {
  const container = section.querySelector('.comments-container');
  container.innerHTML = '<div style="padding:10px;color:var(--gray);font-size:0.85rem">Loading…</div>';
  try {
    const comments = await UniClubAPI.getPostComments(postId);
    const user = await UniClubAPI.getUser();
    // Group: top-level comments and replies
    const topLevel = comments.filter(c => !c.parent_id);
    const replies = comments.filter(c => c.parent_id);
    const replyMap = {};
    replies.forEach(r => {
      if (!replyMap[r.parent_id]) replyMap[r.parent_id] = [];
      replyMap[r.parent_id].push(r);
    });
    container.innerHTML = topLevel.map(c => renderFacultyCommentThread(c, replyMap, postId, user?.id)).join('');
    section.dataset.loaded = 'true';
  } catch (e) {
    container.innerHTML = '<div style="padding:10px;color:#dc2626;font-size:0.85rem">Failed to load</div>';
  }
}

function renderFacultyCommentThread(c, replyMap, postId, currentUserId) {
  const name = c.profiles?.full_name || 'User';
  const initials = getInitials(name);
  const childReplies = replyMap[c.id] || [];
  // Faculty can always delete
  return `
    <div class="comment" data-comment-id="${c.id}">
      <div class="comment-avatar" style="background:var(--cream-dark);width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:0.75rem;font-weight:700;border:1px solid var(--border);flex-shrink:0">${initials}</div>
      <div class="comment-content" style="flex:1;min-width:0;">
        <div class="comment-name">${name}</div>
        <div class="comment-text">${c.body}</div>
        <div style="display:flex;gap:12px;margin-top:4px;">
          <button onclick="showFacultyReplyInput(this,'${postId}','${c.id}')" style="background:none;border:none;font-family:var(--font-body);font-size:0.75rem;font-weight:600;color:var(--blue);cursor:pointer;padding:0;">Reply</button>
          <button onclick="deleteFacultyComment(this,'${c.id}','${postId}')" style="background:none;border:none;font-family:var(--font-body);font-size:0.75rem;font-weight:600;color:#dc2626;cursor:pointer;padding:0;">Delete</button>
        </div>
        <div class="reply-input-slot"></div>
        ${childReplies.length > 0 ? `<div style="margin-top:8px;padding-left:4px;border-left:2px solid var(--border);">
          ${childReplies.map(r => {
            const rName = r.profiles?.full_name || 'User';
            const rInitials = getInitials(rName);
            return `
              <div class="comment" data-comment-id="${r.id}" style="margin-bottom:6px;">
                <div class="comment-avatar" style="background:var(--cream-dark);width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:0.6rem;font-weight:700;border:1px solid var(--border);flex-shrink:0">${rInitials}</div>
                <div class="comment-content" style="flex:1;min-width:0;">
                  <div class="comment-name" style="font-size:0.8rem;">${rName}</div>
                  <div class="comment-text" style="font-size:0.82rem;">${r.body}</div>
                  <div style="display:flex;gap:12px;margin-top:2px;">
                    <button onclick="showFacultyReplyInput(this,'${postId}','${c.id}')" style="background:none;border:none;font-family:var(--font-body);font-size:0.7rem;font-weight:600;color:var(--blue);cursor:pointer;padding:0;">Reply</button>
                    <button onclick="deleteFacultyComment(this,'${r.id}','${postId}')" style="background:none;border:none;font-family:var(--font-body);font-size:0.7rem;font-weight:600;color:#dc2626;cursor:pointer;padding:0;">Delete</button>
                  </div>
                </div>
              </div>`;
          }).join('')}
        </div>` : ''}
      </div>
    </div>
  `;
}

function showFacultyReplyInput(btn, postId, parentId) {
  const card = btn.closest('.faculty-post-card');
  card.querySelectorAll('.inline-reply-row').forEach(el => el.remove());
  const parentComment = btn.closest('.comment');
  const slot = parentComment.querySelector('.reply-input-slot') || parentComment.closest('.comment-content');
  const replyRow = document.createElement('div');
  replyRow.className = 'inline-reply-row';
  replyRow.style.cssText = 'display:flex;gap:8px;align-items:center;margin-top:6px;';
  replyRow.innerHTML = `
    <input class="comment-input" placeholder="Write a reply…" style="flex:1;height:36px;font-size:0.82rem;padding:6px 12px;border:2px solid var(--border);border-radius:8px;font-family:var(--font-body);background:var(--cream);">
    <button class="btn btn-primary" style="padding:0 16px;height:36px;font-size:0.78rem;border-radius:8px" onclick="postFacultyReply(this, '${postId}', '${parentId}')">Reply</button>
  `;
  slot.appendChild(replyRow);
  replyRow.querySelector('input').focus();
}

async function postFacultyReply(btn, postId, parentId) {
  const input = btn.previousElementSibling;
  const text = input.value.trim();
  if (!text) return;
  try {
    await UniClubAPI.addComment(postId, text, parentId);
    const card = btn.closest('.faculty-post-card');
    const section = card.querySelector('.comment-section');
    section.dataset.loaded = 'false';
    await reloadFacultyComments(section, postId);
  } catch (e) { openDeleteModal({ title: 'Error', message: 'Failed to reply: ' + e.message, confirmText: 'OK', hideCancel: true, onConfirm: () => {} }); }
}

async function deleteFacultyComment(btn, commentId, postId) {
  openDeleteModal({
    title: 'Delete Comment?',
    message: 'This comment will be permanently removed.',
    confirmText: 'Delete',
    onConfirm: async () => {
      try {
        await UniClubAPI.deleteComment(commentId);
        const card = btn.closest('.faculty-post-card');
        const section = card.querySelector('.comment-section');
        section.dataset.loaded = 'false';
        await reloadFacultyComments(section, postId);
      } catch (e) { openDeleteModal({ title: 'Error', message: e.message, confirmText: 'OK', hideCancel: true, onConfirm: () => {} }); }
    }
  });
}

async function postFacultyComment(btn, postId) {
  const row = btn.closest('.comment-input-row');
  const input = row.querySelector('.comment-input');
  const text = input.value.trim();
  if (!text) return;
  try {
    await UniClubAPI.addComment(postId, text);
    input.value = '';
    const card = btn.closest('.faculty-post-card');
    const section = card.querySelector('.comment-section');
    section.dataset.loaded = 'false';
    await reloadFacultyComments(section, postId);
  } catch (e) { openDeleteModal({ title: 'Error', message: e.message, confirmText: 'OK', hideCancel: true, onConfirm: () => {} }); }
}

function triggerDeletePost(id) {
  openDeleteModal({
    title: 'Delete Post?',
    message: 'Are you sure you want to delete this announcement?',
    confirmText: 'Delete Post',
    onConfirm: async () => {
      try {
        await UniClubAPI.deletePost(id);
        loadCommunityData();
      } catch (e) { openDeleteModal({ title: 'Error', message: e.message, confirmText: 'OK', hideCancel: true, onConfirm: () => {} }); }
    }
  });
}

// ── Image handling ──
function handlePostImage(input) {
  const file = input.files[0];
  if (!file) return;
  postImageFile = file;
  const fileName = document.getElementById('postFileName');
  if (fileName) fileName.textContent = file.name;
  const reader = new FileReader();
  reader.onload = e => {
    postImageData = e.target.result;
    const preview = document.getElementById('postImagePreview');
    const previewContainer = document.getElementById('previewContainer');
    if (preview) preview.src = postImageData;
    if (previewContainer) previewContainer.style.display = 'block';
  };
  reader.readAsDataURL(file);
}

function removePostPhoto() {
  postImageData = null;
  postImageFile = null;
  const imageInput = document.getElementById('postImageInput');
  const fileName = document.getElementById('postFileName');
  const previewContainer = document.getElementById('previewContainer');
  if (imageInput) imageInput.value = '';
  if (fileName) fileName.textContent = '';
  if (previewContainer) previewContainer.style.display = 'none';
}

function cancelPublish() {
  const title = document.getElementById('postTitle');
  const content = document.getElementById('postContent');
  if (title) title.value = '';
  if (content) content.value = '';
  removePostPhoto();
}

async function publishFacultyPost() {
  const titleInput = document.getElementById('postTitle');
  const contentInput = document.getElementById('postContent');
  const clubSelect = document.getElementById('postClubSelect');
  if (!titleInput || !contentInput) return;
  const title = titleInput.value.trim();
  const text = contentInput.value.trim();
  const typeBtn = document.querySelector('.post-type-btn.active');
  const type = typeBtn ? typeBtn.textContent : 'Event';
  const clubId = clubSelect?.value || null;
  if (!title || !text) { openDeleteModal({ title: 'Missing Fields', message: 'Title and content are required.', confirmText: 'OK', hideCancel: true, onConfirm: () => {} }); return; }

  try {
    const user = await UniClubAPI.getUser();
    let imageUrl = null;

    // Upload image if present
    if (postImageFile) {
      try {
        imageUrl = await UniClubAPI.uploadPostImage(postImageFile);
      } catch (e) {
        console.warn('Image upload failed, posting without image:', e);
      }
    }

    await UniClubAPI.createPost({
      author_id: user.id,
      club_id: clubId,
      title,
      body: text,
      type,
      image_url: imageUrl,
    });

    cancelPublish();
    loadCommunityData();
  } catch (e) {
    openDeleteModal({ title: 'Error', message: 'Failed to publish: ' + e.message, confirmText: 'OK', hideCancel: true, onConfirm: () => {} });
  }
}

// ===================== PROFILE =====================
async function loadProfileData() {
  try {
    const user = await UniClubAPI.getUser();
    facultyProfile = await UniClubAPI.getMyProfile();
    // Also load clubs so "Managing X clubs" is accurate
    if (facultyClubs.length === 0) {
      facultyClubs = await UniClubAPI.getFacultyClubs(user.id);
    }
    syncFacultyProfileUI();
    setFacultyProfileEditing(false);
  } catch (e) {
    console.error('Profile load error:', e);
  }
}

function syncFacultyProfileUI() {
  if (!facultyProfile) return;
  const nameInput = document.getElementById('profileName');
  const descInput = document.getElementById('profileDesc');
  const heading = document.getElementById('facultyProfileHeading');
  const meta = document.getElementById('facultyProfileMeta');
  const avatar = document.getElementById('facultyProfileAvatar');

  if (nameInput) nameInput.value = facultyProfile.full_name;
  if (descInput) descInput.value = `${facultyProfile.department || 'Faculty'} — Faculty Coordinator`;
  if (heading) heading.textContent = facultyProfile.full_name;
  if (meta) meta.textContent = `${facultyProfile.department || 'Faculty'} — Faculty Coordinator. Managing ${facultyClubs.length} clubs.`;
  if (avatar) avatar.textContent = getInitials(facultyProfile.full_name);
}

let facultyProfileEditing = false;

function setFacultyProfileEditing(isEditing) {
  facultyProfileEditing = isEditing;
  const shell = document.getElementById('facultyProfileShell');
  const nameInput = document.getElementById('profileName');
  const descInput = document.getElementById('profileDesc');
  const editBtn = document.getElementById('facultyProfileEditBtn');
  if (shell) shell.classList.toggle('editing', isEditing);
  if (nameInput) nameInput.readOnly = !isEditing;
  if (descInput) descInput.readOnly = !isEditing;
  if (editBtn) editBtn.style.display = isEditing ? 'none' : 'inline-flex';
}

function enableFacultyProfileEdit() { setFacultyProfileEditing(true); }

function cancelFacultyProfileEdit() {
  syncFacultyProfileUI();
  setFacultyProfileEditing(false);
}

async function saveProfile(e) {
  e.preventDefault();
  const newName = document.getElementById('profileName').value.trim();
  if (!newName) return;
  try {
    const user = await UniClubAPI.getUser();
    await UniClubAPI.updateProfile(user.id, { full_name: newName });
    facultyProfile.full_name = newName;
    syncFacultyProfileUI();
    setFacultyProfileEditing(false);
  } catch (e) { openDeleteModal({ title: 'Error', message: 'Failed to save: ' + e.message, confirmText: 'OK', hideCancel: true, onConfirm: () => {} }); }
}

function requestAccountDeletion() {
  openDeleteModal({
    title: 'Account deletion requested.',
    message: 'Your request for account deletion has been sent to the administrator.',
    confirmText: 'Close',
    hideCancel: true,
    onConfirm: () => closeDeleteModal()
  });
}

async function logOutFaculty() {
  await UniClubAPI.signOut();
  window.location.href = '../auth.html?mode=signin';
}

// Faculty nav is always visible — no hide-on-scroll
function initFacultyNavHide() {
  // intentionally empty: faculty nav is a bottom bar that stays fixed
}

// ===================== LAYOUT RENDER =====================
function renderFacultyLayout() {
  const app = document.getElementById('facultyApp');
  const page = document.body.dataset.facultyPage || 'home';
  if (!app) return;
  app.innerHTML = FACULTY_SHELL_TEMPLATE;
  const mount = document.getElementById('facultyPageMount');
  if (mount) mount.innerHTML = FACULTY_PAGE_TEMPLATES[page] || FACULTY_PAGE_TEMPLATES.home;
}

// ===================== INIT (ON DOM READY) =====================
document.addEventListener('DOMContentLoaded', async () => {
  // Guard: must be logged in as faculty
  try {
    const session = await UniClubAPI.getSession();
    if (!session) { window.location.href = '../auth.html?mode=signin'; return; }
    const profile = await UniClubAPI.getMyProfile();
    if (profile.role !== 'faculty') { window.location.href = '../student/home.html'; return; }
    facultyProfile = profile;
  } catch (e) {
    window.location.href = '../auth.html?mode=signin';
    return;
  }

  const initialPage = document.body.dataset.facultyPage || 'home';
  renderFacultyLayout();
  initFacultyModalBindings();
  showFacultyPage(initialPage);
  initFacultyNavHide();
});
