// =====================================================================
// UniClub — Core Application Logic (API-driven)
// =====================================================================

// ===================== CLUB ICONS =====================

// Generates overlapping colored avatar circles + +N count pill
function renderAvatarRow(count, clubName) {
  const COLORS = [
    '#f87171','#fb923c','#fbbf24','#34d399','#60a5fa',
    '#a78bfa','#f472b6','#38bdf8','#4ade80','#e879f9',
  ];
  const seed = (clubName || 'X').charCodeAt(0);
  const c1 = COLORS[seed % COLORS.length];
  const c2 = COLORS[(seed + 3) % COLORS.length];
  const l1 = (clubName || 'C').charAt(0).toUpperCase();
  const l2 = (clubName || 'C').charAt(Math.floor((clubName||'C').length / 2)).toUpperCase();
  const remaining = Math.max(0, count - 2);
  return `
    <div class="featured-card-avatars">
      <div style="background:${c1};color:white">${l1}</div>
      <div style="background:${c2};color:white">${l2}</div>
      ${count > 0 ? `<div class="avatar-count">+${remaining > 0 ? remaining : count}</div>` : ''}
    </div>
  `;
}

function getClubIcon(slug) {
  const icons = {
    aiml: '<svg viewBox="0 0 24 24"><path d="M20 16V7a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v9m16 0H4m16 0 1.28 2.55a1 1 0 0 1-.9 1.45H3.62a1 1 0 0 1-.9-1.45L4 16"/></svg>',
    design: '<svg viewBox="0 0 24 24"><circle cx="13.5" cy="6.5" r=".5"/><circle cx="17.5" cy="10.5" r=".5"/><circle cx="8.5" cy="7.5" r=".5"/><circle cx="6.5" cy="12.5" r=".5"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/></svg>',
    debate: '<svg viewBox="0 0 24 24"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/></svg>',
    coding: '<svg viewBox="0 0 24 24"><path d="m18 16 4-4-4-4"/><path d="m6 8-4 4 4 4"/><path d="m14 4-4 16"/></svg>',
    robotics: '<svg viewBox="0 0 24 24"><rect x="3" y="7" width="18" height="10" rx="2"/><path d="M7 7V5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v2"/><circle cx="8.5" cy="12" r="1"/><circle cx="15.5" cy="12" r="1"/></svg>',
    music: '<svg viewBox="0 0 24 24"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>',
    photo: '<svg viewBox="0 0 24 24"><path d="M4 7h3l2-3h6l2 3h3v12H4z"/><circle cx="12" cy="13" r="3"/></svg>',
    cyber: '<svg viewBox="0 0 24 24"><path d="M12 3 4 7v6c0 5 8 8 8 8s8-3 8-8V7z"/><path d="M9 12h6"/><path d="M12 9v6"/></svg>',
  };
  return icons[slug] || `<svg viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5Z"/><path d="m2 17 10 5 10-5"/><path d="m2 12 10 5 10-5"/></svg>`;
}

function getCategoryColor(category) {
  const colors = { tech: '#EEF2FF', arts: '#fdf4ff', sports: '#f0fdf4', 'non-tech': '#fff7ed' };
  return colors[category] || '#EEF2FF';
}

// ===================== COMPARE =====================
const compareSlots = [null, null, null];
let activeCompareSlot = null;

function initCompare() {
  renderCompare();
  renderComparePicker();
}

function renderCompare() {
  const table = document.getElementById('compareTable');
  if (!table) return;
  table.innerHTML = compareSlots.map((id, idx) => {
    if (!id) {
      return `
        <div class="compare-col compare-ticket compare-ticket--empty" onclick="openComparePicker(${idx})">
          <div class="ticket-top">
            <div class="ticket-logo" aria-hidden="true">
              <svg viewBox="0 0 24 24"><path d="M12 5v14"/><path d="M5 12h14"/></svg>
            </div>
            <div class="ticket-name">Add Club</div>
            <div class="ticket-sub">Pick from list</div>
            <button class="ticket-change" onclick="event.stopPropagation();openComparePicker(${idx})">Choose</button>
          </div>
          <div class="ticket-divider"></div>
          <div class="ticket-body">
            <div class="ticket-row"><div class="ticket-key">Category</div><div class="ticket-val">—</div></div>
            <div class="ticket-row"><div class="ticket-key">Faculty Coord.</div><div class="ticket-val">—</div></div>
            <div class="ticket-row"><div class="ticket-key">Members</div><div class="ticket-val">—</div></div>
            <div class="ticket-row"><div class="ticket-key">Founded</div><div class="ticket-val">—</div></div>
            <div class="ticket-row"><div class="ticket-key">Achievements</div><div class="ticket-val">—</div></div>
            <div class="ticket-row"><div class="ticket-key">Meetings</div><div class="ticket-val">—</div></div>
            <div class="ticket-row"><div class="ticket-key">Open Recruitment</div><div class="ticket-val">—</div></div>
          </div>
        </div>
      `;
    }

    const c = modalData[id];
    if (!c) return '';
    const membersCount = c.member_count || 0;
    return `
      <div class="compare-col compare-ticket" onclick="openComparePicker(${idx})">
        <div class="ticket-top" style="background:${getCategoryColor(c.category)}">
          <button class="ticket-action" onclick="event.stopPropagation();removeCompareClub(${idx})">✕</button>
          <div class="ticket-logo" aria-hidden="true">${getClubIcon(c.slug)}</div>
          <div class="ticket-name">${c.name}</div>
          <div class="ticket-sub">${c.domain}</div>
          <button class="ticket-change" onclick="event.stopPropagation();openComparePicker(${idx})">Change</button>
        </div>
        <div class="ticket-divider"></div>
        <div class="ticket-body">
          <div class="ticket-row"><div class="ticket-key">Category</div><div class="ticket-val">${c.domain}</div></div>
          <div class="ticket-row"><div class="ticket-key">Faculty Coord.</div><div class="ticket-val">${c.faculty_name || 'N/A'}</div></div>
          <div class="ticket-row"><div class="ticket-key">Members</div><div class="ticket-val">${membersCount} Students</div></div>
          <div class="ticket-row"><div class="ticket-key">Founded</div><div class="ticket-val">${c.founded_year || 'N/A'}</div></div>
          <div class="ticket-row"><div class="ticket-key">Achievements</div><div class="ticket-val">${(c.achievements || []).length || 0} Awards</div></div>
          <div class="ticket-row"><div class="ticket-key">Meetings</div><div class="ticket-val">${c.meeting_schedule || 'Weekly'}</div></div>
          <div class="ticket-row"><div class="ticket-key">Open Recruitment</div><div class="ticket-val ticket-status">${c.status !== 'CLOSED' ? 'Open Now' : 'Closed'}</div></div>
        </div>
      </div>
    `;
  }).join('');
}

function renderComparePicker() {
  const list = document.getElementById('comparePickerList');
  if (!list) return;
  list.innerHTML = clubs.map(c => `
    <div class="compare-picker-item" data-id="${c.slug}" onclick="selectCompareClub('${c.slug}')">
      <div class="compare-picker-item-left">
        <div class="compare-picker-logo">${getClubIcon(c.slug)}</div>
        <div>
          <div class="compare-picker-name">${c.name}</div>
          <div class="compare-picker-tag">${c.domain}</div>
        </div>
      </div>
    </div>
  `).join('');
}

function openComparePicker(slotIndex) {
  activeCompareSlot = slotIndex;
  const overlay = document.getElementById('comparePicker');
  if (overlay) overlay.classList.add('open');
  updateComparePicker();
}

function closeComparePicker() {
  const overlay = document.getElementById('comparePicker');
  if (overlay) overlay.classList.remove('open');
  activeCompareSlot = null;
}

function closeComparePickerOutside(e) {
  if (e.target && e.target.id === 'comparePicker') closeComparePicker();
}

function updateComparePicker() {
  const list = document.getElementById('comparePickerList');
  if (!list) return;
  const used = compareSlots.filter(Boolean);
  Array.from(list.children).forEach(item => {
    const id = item.getAttribute('data-id');
    const isUsed = used.includes(id) && compareSlots[activeCompareSlot] !== id;
    if (isUsed) item.classList.add('disabled');
    else item.classList.remove('disabled');
  });
}

function selectCompareClub(slug) {
  if (activeCompareSlot === null) return;
  if (compareSlots.includes(slug) && compareSlots[activeCompareSlot] !== slug) return;
  compareSlots[activeCompareSlot] = slug;
  closeComparePicker();
  renderCompare();
}

function removeCompareClub(slotIndex) {
  compareSlots[slotIndex] = null;
  renderCompare();
}

// ===================== RENDER CLUBS =====================
function renderClubs(containerId, filter = 'all') {
  const container = document.getElementById(containerId);
  if (!container) return;
  let filtered = filter === 'all' ? clubs : clubs.filter(c => c.category === filter);
  if (filter === 'alpha') filtered = [...clubs].sort((a, b) => a.name.localeCompare(b.name));
  container.innerHTML = filtered.map(c => `
    <div class="club-card" onclick="openModal('${c.slug}')">
      <div class="club-logo" style="background:${getCategoryColor(c.category)}">${getClubIcon(c.slug)}</div>
      <div class="club-info">
        <div class="club-name">${c.name}</div>
        <div style="margin-bottom:4px">
          <span class="chip ${c.category === 'tech' ? 'tech' : 'non-tech'}" style="font-size:0.68rem;padding:2px 8px">${c.domain}</span>
        </div>
        <div class="club-desc">${c.description || ''}</div>
        <div class="club-meta">
          <div class="club-faculty">${c.faculty_name || ''} · ${c.member_count || 0} Members</div>
          <button class="btn btn-ghost" style="padding:5px 12px;font-size:0.72rem" onclick="event.stopPropagation();openModal('${c.slug}')">View Club</button>
        </div>
      </div>
    </div>
  `).join('');
}

async function initExplore() {
  await loadClubs();
  buildModalData();
  renderClubs('exploreClubGrid');
}

// ===================== MODAL =====================
async function openModal(slugOrId) {
  if (!clubsLoaded) { await loadClubs(); buildModalData(); }
  const c = modalData[slugOrId];
  if (!c) return;

  document.getElementById('modalLogo').innerHTML = getClubIcon(c.slug);
  document.getElementById('modalCategory').textContent = c.domain;
  document.getElementById('modalName').textContent = c.name;
  const membersCount = c.member_count || 0;
  document.getElementById('modalFaculty').textContent = `Coordinator: ${c.faculty_name || 'N/A'} · ${membersCount} Members`;
  document.getElementById('modalDesc').textContent = c.description || '';
  document.getElementById('modalAchievements').innerHTML = (c.achievements || []).map(a => `<li>${a}</li>`).join('');

  const membersLabel = document.getElementById('modalMembersLabel');
  const membersList = document.getElementById('modalMembersList');
  if (membersLabel) membersLabel.textContent = `View Members (${membersCount})`;

  // Fetch all real members from API
  if (membersList) {
    try {
      const members = await UniClubAPI.getClubMembers(c.id);
      membersList.innerHTML = members.length
        ? members.map(m =>
            `<div class="member-chip">${m.profiles?.full_name || 'Unknown'} <small style="opacity:0.5">(${m.role})</small></div>`
          ).join('')
        : '<div class="member-chip" style="opacity:0.5">No members yet</div>';
    } catch (e) {
      membersList.innerHTML = `<div class="member-chip">${membersCount} members</div>`;
    }
  }

  // Social links — make them real clickable anchors
  const socialsEl = document.getElementById('modalSocials');
  if (socialsEl) {
    const links = c.social_links || {};
    const icons = [
      { key: 'github',    label: 'GitHub' },
      { key: 'instagram', label: 'Instagram' },
      { key: 'linkedin',  label: 'LinkedIn' },
      { key: 'website',   label: 'Website' },
    ];
    socialsEl.innerHTML = icons.map(({ key, label }) => {
      const url = links[key];
      if (!url || url === '#') return '';
      return `<a class="social-link" href="${url}" target="_blank" rel="noopener noreferrer">${label}</a>`;
    }).join('') || '<span style="opacity:0.5;font-size:0.85rem">No links available</span>';
  }

  // Join/Leave button
  const modalActions = document.querySelector('#modalCard .modal-body > div:last-child');
  if (modalActions) {
    try {
      const isMember = await UniClubAPI.isMember(c.id);
      const session = await UniClubAPI.getSession();
      const profile = session ? await UniClubAPI.getMyProfile() : null;
      const isStudent = profile?.role === 'student';

      if (isStudent) {
        if (isMember) {
          modalActions.innerHTML = `
            <button class="btn btn-primary" style="flex:1;justify-content:center" onclick="showPage('compare')">Compare</button>
            <button class="btn btn-ghost" style="flex:1;justify-content:center;color:#dc2626;border-color:#dc2626" onclick="handleLeaveClub('${c.id}')">Request Leave</button>
          `;
        } else {
          // Not a member — can only compare, joining is by faculty invite only
          modalActions.innerHTML = `
            <button class="btn btn-primary" style="flex:1;justify-content:center" onclick="showPage('compare')">Compare</button>
          `;
        }
      }
    } catch (e) { /* keep defaults */ }
  }

  document.getElementById('modal').classList.add('open');
}

// Join request removed — faculty adds members directly


async function handleLeaveClub(clubId) {
  try {
    // Check for existing pending request first
    const existing = await UniClubAPI.hasPendingRequest(clubId, 'leave');
    if (existing) {
      closeModal();
      showThemedModal({
        title: 'Already Requested',
        message: 'You already have a pending leave request for this club. Please wait for the faculty to respond.',
        confirmText: 'Got it',
        hideCancel: true,
        onConfirm: () => {}
      });
      return;
    }
    await UniClubAPI.requestLeave(clubId, 'I need to step back from this club.');
    closeModal();
    showThemedModal({
      title: 'Leave Request Sent',
      message: 'Your leave request has been sent to the faculty coordinator for review.',
      confirmText: 'Got it',
      hideCancel: true,
      onConfirm: () => {}
    });
  } catch (e) {
    showThemedModal({ title: 'Error', message: 'Failed to send request: ' + e.message, confirmText: 'OK', hideCancel: true, onConfirm: () => {} });
  }
}

function closeModal() { document.getElementById('modal').classList.remove('open'); }
function closeModalOutside(e) { if (e.target.id === 'modal') closeModal(); }
function toggleExpand(btn) {
  const content = btn.nextElementSibling;
  content.classList.toggle('open');
  const arrow = btn.querySelector('span:last-child');
  arrow.textContent = content.classList.contains('open') ? '↑' : '↓';
}

// ===================== PAGE ROUTER =====================
function inStudentDir() { return window.location.pathname.includes('/student/'); }
function inFacultyDir() { return window.location.pathname.includes('/faculty/'); }

function studentPath(file) {
  if (inStudentDir()) return file;
  if (inFacultyDir()) return `../student/${file}`;
  return `student/${file}`;
}

function facultyPath(file = 'home.html') {
  if (inFacultyDir()) return file;
  if (inStudentDir()) return `../faculty/${file}`;
  return `faculty/${file}`;
}

function authPath() {
  return (inStudentDir() || inFacultyDir()) ? '../auth.html' : 'auth.html';
}

async function showPage(name) {
  const session = await UniClubAPI.getSession();
  if (!session && name !== 'auth') {
    window.location.href = `${authPath()}?mode=signin`;
    return;
  }

  let profile = null;
  if (session) {
    try { profile = await UniClubAPI.getMyProfile(); } catch (e) { }
  }
  const role = profile?.role || 'student';

  if (role === 'faculty' && ['home', 'explore', 'community', 'compare', 'profile'].includes(name)) {
    window.location.href = facultyPath('home.html');
    return;
  }
  if (role === 'student' && name === 'faculty') {
    window.location.href = studentPath('home.html');
    return;
  }
  if (name === 'home') {
    window.location.href = session ? studentPath('home.html') : `${authPath()}?mode=signin`;
    return;
  }
  const studentRoutes = {
    explore: 'explore.html',
    community: 'community.html',
    compare: 'compare.html',
    profile: 'profile.html',
    quest: 'quest.html'
  };
  if (studentRoutes[name]) {
    window.location.href = studentPath(studentRoutes[name]);
    return;
  }
  if (name === 'auth') {
    window.location.href = authPath();
  }
}

async function routeIndex() {
  const session = await UniClubAPI.getSession();
  if (!session) {
    window.location.href = `${authPath()}?mode=signin`;
    return;
  }
  try {
    const profile = await UniClubAPI.getMyProfile();
    if (profile.role === 'faculty') {
      window.location.href = facultyPath('home.html');
      return;
    }
  } catch (e) { }
  window.location.href = studentPath('home.html');
}

async function guardHome() {
  const session = await UniClubAPI.getSession();
  if (!session) { window.location.href = `${authPath()}?mode=signin`; return; }
  try {
    const profile = await UniClubAPI.getMyProfile();
    if (profile.role === 'faculty') { window.location.href = facultyPath('home.html'); return; }
  } catch (e) { }
  initLayout('home');
  await loadClubs();
  buildModalData();
}

async function guardStudentPage(pageId, initFnName) {
  const session = await UniClubAPI.getSession();
  if (!session) { window.location.href = `${authPath()}?mode=signin`; return; }
  try {
    const profile = await UniClubAPI.getMyProfile();
    if (profile.role === 'faculty') { window.location.href = facultyPath('home.html'); return; }
  } catch (e) { }
  initLayout(pageId);
  await loadClubs();
  buildModalData();
  if (initFnName && typeof window[initFnName] === 'function') {
    window[initFnName]();
  }
}

// ===================== AUTH =====================
function initAuth() {
  const authPage = document.getElementById('page-auth');
  if (authPage) authPage.classList.add('active');
  const params = new URLSearchParams(window.location.search);
  const mode = params.get('mode');
  if (mode === 'signup') switchAuthTabByName('signup');
  else switchAuthTabByName('login');
}

function switchAuthTab(btn, tab) {
  document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
  btn.classList.add('active');
  document.getElementById('auth-login').style.display = tab === 'login' ? 'block' : 'none';
  document.getElementById('auth-signup').style.display = tab === 'signup' ? 'block' : 'none';
}

function switchAuthTabByName(tab) {
  const tabs = document.querySelectorAll('.auth-tab');
  tabs.forEach(t => t.classList.remove('active'));
  tabs[tab === 'login' ? 0 : 1].classList.add('active');
  document.getElementById('auth-login').style.display = tab === 'login' ? 'block' : 'none';
  document.getElementById('auth-signup').style.display = tab === 'signup' ? 'block' : 'none';
}

function selectRole(el) {
  el.closest('.role-select').querySelectorAll('.role-option').forEach(r => r.classList.remove('selected'));
  el.classList.add('selected');
}

function getSelectedRoleForAction(action) {
  const scopeId = action === 'signup' ? 'auth-signup' : 'auth-login';
  const scope = document.getElementById(scopeId);
  const selected = scope ? scope.querySelector('.role-option.selected .role-name') : null;
  return selected ? selected.textContent.trim().toLowerCase() : 'student';
}

async function handleAuth(action) {
  const role = getSelectedRoleForAction(action);
  const errEl = document.getElementById('auth-error');

  if (action === 'signup') {
    const nameInput = document.querySelector('#auth-signup .form-input[type="text"]');
    const emailInput = document.querySelector('#auth-signup .form-input[type="email"]');
    const passInput = document.querySelector('#auth-signup .form-input[type="password"]');
    const deptInput = document.querySelectorAll('#auth-signup .form-input[type="text"]')[1];

    const name = nameInput?.value?.trim();
    const email = emailInput?.value?.trim();
    const password = passInput?.value;
    const department = deptInput?.value?.trim() || '';

    if (!name || !email || !password) {
      if (errEl) { errEl.textContent = 'Please fill all required fields.'; errEl.style.display = 'block'; }
      return;
    }

    try {
      await UniClubAPI.signUp(email, password, name, role, department);
      // Auto sign in after signup
      await UniClubAPI.signIn(email, password);
      if (role === 'faculty') window.location.href = facultyPath('home.html');
      else showPage('quest');
    } catch (e) {
      if (errEl) { errEl.textContent = e.message; errEl.style.display = 'block'; }
    }
    return;
  }

  // Login
  const emailInput = document.querySelector('#auth-login .form-input[type="email"]');
  const passInput = document.querySelector('#auth-login .form-input[type="password"]');
  const email = emailInput?.value?.trim();
  const password = passInput?.value;

  if (!email || !password) {
    if (errEl) { errEl.textContent = 'Please enter email and password.'; errEl.style.display = 'block'; }
    return;
  }

  try {
    const { user } = await UniClubAPI.signIn(email, password);
    const profile = await UniClubAPI.getMyProfile();
    if (profile.role === 'faculty') window.location.href = facultyPath('home.html');
    else window.location.href = studentPath('home.html');
  } catch (e) {
    if (errEl) { errEl.textContent = 'Invalid email or password. Try again.'; errEl.style.display = 'block'; }
  }
}

// ===================== FILTER =====================
function setFilter(btn, filter) {
  btn.closest('.filter-bar').querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  const page = btn.closest('.page-container') || document;
  const grid = page.querySelector('.club-grid') || document.getElementById('exploreClubGrid');
  if (grid && grid.id) renderClubs(grid.id, filter);
}

// ===================== CHIPS =====================
function toggleChip(el) { el.classList.toggle('selected'); }

// ===================== POST TYPE =====================
function setPostType(btn) {
  btn.closest('.post-type-row').querySelectorAll('.post-type-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
}

// ===================== COMMUNITY - API DRIVEN =====================
async function loadCommunityPosts() {
  const container = document.getElementById('communityPostsFeed');
  if (!container) return;
  container.innerHTML = '<div style="text-align:center;padding:40px;color:var(--gray)">Loading posts…</div>';

  try {
    const posts = await UniClubAPI.getAllPosts();
    const session = await UniClubAPI.getSession();
    const user = session?.user;

    // Check which posts the user has liked
    let likedPostIds = new Set();
    if (user) {
      for (const p of posts.slice(0, 30)) { // Check recent posts
        const liked = await UniClubAPI.hasLikedPost(p.id);
        if (liked) likedPostIds.add(p.id);
      }
    }

    container.innerHTML = posts.map(p => {
      const initials = UniClubAPI.getInitials(p.author_name || 'FC');
      const isLiked = likedPostIds.has(p.id);
      return `
        <div class="post-card" data-post-id="${p.id}" data-author-id="${p.author_id || ''}">
          <div class="post-header">
            <div class="post-avatar" style="${p.author_role === 'faculty' ? 'background:var(--blue);color:white' : ''}">${initials}</div>
            <div class="post-author-info">
              <div class="author-name">${p.author_name || 'Faculty'}</div>
              <div class="author-role">Faculty · ${p.club_name || 'UniClub'}</div>
            </div>
          </div>
          <div class="post-title">${p.title}</div>
          <div class="post-body">${p.body}</div>
          ${p.image_url ? `<div class="post-image"><img src="${p.image_url}" alt="Post image"></div>` : ''}
          <div class="post-actions">
            <button class="post-action-btn ${isLiked ? 'liked' : ''}" onclick="toggleLikeAPI(this, '${p.id}')">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${isLiked ? 'currentColor' : 'none'}" stroke="currentColor"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
              <span class="like-count">${p.like_count || 0}</span> Likes
            </button>
            <button class="post-action-btn" onclick="toggleCommentsAPI(this, '${p.id}')">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
              <span class="comment-count">${p.comment_count || 0}</span> Comments
            </button>
          </div>
          <div class="comment-section" data-loaded="false">
            <div class="comments-container"></div>
            <div class="comment-input-row">
              <div class="comment-avatar" style="background:var(--cream-dark)">ME</div>
              <input class="comment-input" placeholder="Write a comment...">
              <button class="btn btn-primary" style="padding:0 24px; height: 48px; font-size: 0.9rem;" onclick="postCommentAPI(this, '${p.id}')">Post</button>
            </div>
          </div>
        </div>
      `;
    }).join('');

    // Record impressions for visible posts
    if (user) {
      for (const p of posts.slice(0, 10)) {
        UniClubAPI.recordImpression(p.id).catch(() => {});
      }
    }
  } catch (e) {
    container.innerHTML = `<div style="text-align:center;padding:40px;color:#dc2626">Failed to load posts: ${e.message}</div>`;
  }
}

async function toggleLikeAPI(btn, postId) {
  const isLiked = btn.classList.contains('liked');
  const countSpan = btn.querySelector('.like-count');
  let count = parseInt(countSpan?.textContent || '0');

  try {
    if (isLiked) {
      await UniClubAPI.unlikePost(postId);
      btn.classList.remove('liked');
      btn.querySelector('svg').setAttribute('fill', 'none');
      count = Math.max(0, count - 1);
    } else {
      await UniClubAPI.likePost(postId);
      btn.classList.add('liked');
      btn.querySelector('svg').setAttribute('fill', 'currentColor');
      count += 1;
    }
    if (countSpan) countSpan.textContent = count;
  } catch (e) {
    console.error('Like error:', e);
  }
}

async function toggleCommentsAPI(btn, postId) {
  const card = btn.closest('.post-card');
  const section = card.querySelector('.comment-section');
  const isOpen = section.style.display === 'block';

  if (isOpen) {
    section.style.display = 'none';
    return;
  }

  section.style.display = 'block';

  // Load comments if not already loaded
  if (section.dataset.loaded === 'false') {
    await reloadComments(section, postId);
  }
}

async function reloadComments(section, postId) {
  const container = section.querySelector('.comments-container');
  container.innerHTML = '<div style="padding:10px;color:var(--gray);font-size:0.85rem">Loading comments…</div>';
  try {
    const comments = await UniClubAPI.getPostComments(postId);
    const user = await UniClubAPI.getUser();
    const profile = user ? await UniClubAPI.getMyProfile() : null;
    const isFaculty = profile?.role === 'faculty';
    // Find the post author to determine if current user is the post author
    const card = section.closest('.post-card');
    const postAuthorId = card?.dataset.authorId || '';
    const isPostAuthor = user && user.id === postAuthorId;

    // Group: top-level comments and replies
    const topLevel = comments.filter(c => !c.parent_id);
    const replies = comments.filter(c => c.parent_id);
    const replyMap = {};
    replies.forEach(r => {
      if (!replyMap[r.parent_id]) replyMap[r.parent_id] = [];
      replyMap[r.parent_id].push(r);
    });

    container.innerHTML = topLevel.map(c => renderCommentThread(c, replyMap, postId, isPostAuthor || isFaculty, user?.id)).join('');
    section.dataset.loaded = 'true';
  } catch (e) {
    container.innerHTML = `<div style="padding:10px;color:#dc2626;font-size:0.85rem">Failed to load comments</div>`;
  }
}

function renderCommentThread(c, replyMap, postId, canDelete, currentUserId) {
  const name = c.profiles?.full_name || 'User';
  const initials = UniClubAPI.getInitials(name);
  const childReplies = replyMap[c.id] || [];
  const showDelete = canDelete || c.user_id === currentUserId;

  return `
    <div class="comment" data-comment-id="${c.id}">
      <div class="comment-avatar">${initials}</div>
      <div class="comment-content" style="flex:1;min-width:0;">
        <div class="comment-name">${name}</div>
        <div class="comment-text">${c.body}</div>
        <div style="display:flex;gap:12px;margin-top:4px;">
          <button onclick="showReplyInput(this,'${postId}','${c.id}')" style="background:none;border:none;font-family:var(--font-body);font-size:0.75rem;font-weight:600;color:var(--blue);cursor:pointer;padding:0;">Reply</button>
          ${showDelete ? `<button onclick="deleteCommentAPI(this,'${c.id}','${postId}')" style="background:none;border:none;font-family:var(--font-body);font-size:0.75rem;font-weight:600;color:#dc2626;cursor:pointer;padding:0;">Delete</button>` : ''}
        </div>
        <div class="reply-input-slot"></div>
        ${childReplies.length > 0 ? `<div style="margin-top:8px;padding-left:4px;border-left:2px solid var(--border);">
          ${childReplies.map(r => {
            const rName = r.profiles?.full_name || 'User';
            const rInitials = UniClubAPI.getInitials(rName);
            const rCanDel = canDelete || r.user_id === currentUserId;
            return `
              <div class="comment" data-comment-id="${r.id}" style="margin-bottom:6px;">
                <div class="comment-avatar" style="width:28px;height:28px;font-size:0.6rem;">${rInitials}</div>
                <div class="comment-content" style="flex:1;min-width:0;">
                  <div class="comment-name" style="font-size:0.8rem;">${rName}</div>
                  <div class="comment-text" style="font-size:0.82rem;">${r.body}</div>
                  <div style="display:flex;gap:12px;margin-top:2px;">
                    <button onclick="showReplyInput(this,'${postId}','${c.id}')" style="background:none;border:none;font-family:var(--font-body);font-size:0.7rem;font-weight:600;color:var(--blue);cursor:pointer;padding:0;">Reply</button>
                    ${rCanDel ? `<button onclick="deleteCommentAPI(this,'${r.id}','${postId}')" style="background:none;border:none;font-family:var(--font-body);font-size:0.7rem;font-weight:600;color:#dc2626;cursor:pointer;padding:0;">Delete</button>` : ''}
                  </div>
                </div>
              </div>`;
          }).join('')}
        </div>` : ''}
      </div>
    </div>
  `;
}

function showReplyInput(btn, postId, parentId) {
  // Remove any existing reply inputs in this post first
  const card = btn.closest('.post-card');
  card.querySelectorAll('.inline-reply-row').forEach(el => el.remove());
  
  // Find the reply slot for this comment (always insert under the top-level parent)
  const parentComment = btn.closest('.comment');
  const slot = parentComment.querySelector('.reply-input-slot') || parentComment.closest('.comment-content');
  
  const replyRow = document.createElement('div');
  replyRow.className = 'inline-reply-row';
  replyRow.style.cssText = 'display:flex;gap:8px;align-items:center;margin-top:6px;';
  replyRow.innerHTML = `
    <input class="comment-input" placeholder="Write a reply…" style="flex:1;height:36px;font-size:0.82rem;padding:6px 12px;">
    <button class="btn btn-primary" style="padding:0 16px;height:36px;font-size:0.78rem;" onclick="postReplyAPI(this, '${postId}', '${parentId}')">Reply</button>
  `;
  slot.appendChild(replyRow);
  replyRow.querySelector('input').focus();
}

async function postReplyAPI(btn, postId, parentId) {
  const input = btn.previousElementSibling;
  const text = input.value.trim();
  if (!text) return;
  try {
    await UniClubAPI.addComment(postId, text, parentId);
    // Reload comments
    const card = btn.closest('.post-card');
    const section = card.querySelector('.comment-section');
    section.dataset.loaded = 'false';
    await reloadComments(section, postId);
    // Update comment count
    const countSpan = card.querySelector('.comment-count');
    if (countSpan) countSpan.textContent = parseInt(countSpan.textContent || '0') + 1;
  } catch (e) {
    showThemedModal({ title: 'Error', message: 'Failed to post reply: ' + e.message, confirmText: 'OK', hideCancel: true, onConfirm: () => {} });
  }
}

async function deleteCommentAPI(btn, commentId, postId) {
  showThemedModal({
    title: 'Delete Comment?',
    message: 'This comment will be permanently removed.',
    confirmText: 'Delete',
    onConfirm: async () => {
      try {
        await UniClubAPI.deleteComment(commentId);
        const card = btn.closest('.post-card');
        const section = card.querySelector('.comment-section');
        section.dataset.loaded = 'false';
        await reloadComments(section, postId);
        const countSpan = card.querySelector('.comment-count');
        if (countSpan) countSpan.textContent = Math.max(0, parseInt(countSpan.textContent || '1') - 1);
      } catch (e) {
        showThemedModal({ title: 'Error', message: 'Failed to delete: ' + e.message, confirmText: 'OK', hideCancel: true, onConfirm: () => {} });
      }
    }
  });
}

async function postCommentAPI(btn, postId) {
  const row = btn.closest('.comment-input-row');
  const input = row.querySelector('.comment-input');
  const text = input.value.trim();
  if (!text) return;

  try {
    await UniClubAPI.addComment(postId, text);
    input.value = '';
    // Reload the whole comment section to show threaded view
    const card = btn.closest('.post-card');
    const section = card.querySelector('.comment-section');
    section.dataset.loaded = 'false';
    await reloadComments(section, postId);
    // Update comment count
    const countSpan = card.querySelector('.comment-count');
    if (countSpan) countSpan.textContent = parseInt(countSpan.textContent || '0') + 1;
  } catch (e) {
    showThemedModal({ title: 'Error', message: 'Failed to post comment: ' + e.message, confirmText: 'OK', hideCancel: true, onConfirm: () => {} });
  }
}

// ===================== REALTIME SUBSCRIPTIONS =====================
function subscribeToRealtimeFeed() {
  // Subscribe to new posts
  sb.channel('posts-realtime')
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'posts' }, async (payload) => {
      // Reload the feed when a new post appears
      await loadCommunityPosts();
    })
    .subscribe();

  // Subscribe to new likes
  sb.channel('likes-realtime')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'post_likes' }, (payload) => {
      const postId = payload.new?.post_id || payload.old?.post_id;
      if (!postId) return;
      // Update like count in UI
      const card = document.querySelector(`[data-post-id="${postId}"]`);
      if (card) {
        UniClubAPI.getPostLikeCount(postId).then(count => {
          const span = card.querySelector('.like-count');
          if (span) span.textContent = count;
        }).catch(() => {});
      }
    })
    .subscribe();

  // Subscribe to new comments
  sb.channel('comments-realtime')
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'post_comments' }, async (payload) => {
      const postId = payload.new?.post_id;
      if (!postId) return;
      const card = document.querySelector(`[data-post-id="${postId}"]`);
      if (card) {
        const countSpan = card.querySelector('.comment-count');
        if (countSpan) countSpan.textContent = parseInt(countSpan.textContent || '0') + 1;
        // If comment section is open, add the new comment
        const section = card.querySelector('.comment-section');
        if (section && section.style.display === 'block') {
          try {
            const profile = await UniClubAPI.getProfile(payload.new.user_id);
            const name = profile?.full_name || 'User';
            const container = section.querySelector('.comments-container');
            const newEl = document.createElement('div');
            newEl.className = 'comment';
            newEl.innerHTML = `
              <div class="comment-avatar">${UniClubAPI.getInitials(name)}</div>
              <div class="comment-content">
                <div class="comment-name">${name}</div>
                <div class="comment-text">${payload.new.body}</div>
              </div>
            `;
            container.appendChild(newEl);
          } catch (e) { /* ignore */ }
        }
      }
    })
    .subscribe();
}

// ===================== NAV HIDE ON SCROLL =====================
let lastScroll = 0;
const nav = document.getElementById('navBar');
if (nav) {
  window.addEventListener('scroll', () => {
    const curr = window.scrollY;
    if (curr < 80) { nav.classList.remove('hidden'); lastScroll = curr; return; }
    if (curr > lastScroll + 10) { nav.classList.add('hidden'); }
    else if (curr < lastScroll - 6) { nav.classList.remove('hidden'); }
    lastScroll = curr;
  }, { passive: true });
}
