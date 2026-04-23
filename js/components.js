const TOP_BAR_HTML = `<div class="top-bar" id="topBar">
  <div class="logo" onclick="showPage('home')" style="cursor:pointer">Uni<span>Club</span></div>`;
const BOTTOM_NAV_HTML = `<nav class="nav-bar" id="navBar">
  <div class="nav-item" id="nav-home" onclick="showPage('home')">
    <span class="nav-icon"><svg viewBox="0 0 24 24"><path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"/><path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg></span>
    <span class="nav-label">Home</span>
  </div>
  <div class="nav-item" id="nav-explore" onclick="showPage('explore')">
    <span class="nav-icon"><svg viewBox="0 0 24 24"><path d="m16.24 7.76-1.804 5.411a2 2 0 0 1-1.265 1.265L7.76 16.24l1.804-5.411a2 2 0 0 1 1.265-1.265z"/><circle cx="12" cy="12" r="10"/></svg></span>
    <span class="nav-label">Explore</span>
  </div>
  <div class="nav-item" id="nav-community" onclick="showPage('community')">
    <span class="nav-icon"><svg viewBox="0 0 24 24"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg></span>
    <span class="nav-label">Community</span>
  </div>
  <div class="nav-item" id="nav-compare" onclick="showPage('compare')">
    <span class="nav-icon"><svg viewBox="0 0 24 24"><circle cx="18" cy="18" r="3"/><circle cx="6" cy="6" r="3"/><path d="M13 6h3a2 2 0 0 1 2 2v7"/><path d="M11 18H8a2 2 0 0 1-2-2V9"/></svg></span>
    <span class="nav-label">Compare</span>
  </div>
  <div class="nav-item" id="nav-profile" onclick="showPage('profile')">
    <span class="nav-icon"><svg viewBox="0 0 24 24"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg></span>
    <span class="nav-label">Profile</span>
  </div>
</nav>`;
const MODAL_HTML = `<div class="modal-overlay" id="modal" onclick="closeModalOutside(event)">
  <div class="modal-card" id="modalCard">
    <div class="modal-header">
      <div class="modal-logo" id="modalLogo"><svg viewBox="0 0 24 24"><path d="m16.24 7.76-1.804 5.411a2 2 0 0 1-1.265 1.265L7.76 16.24l1.804-5.411a2 2 0 0 1 1.265-1.265z"/><circle cx="12" cy="12" r="10"/></svg></div>
      <div style="flex:1">
        <div class="label" id="modalCategory">Technology</div>
        <div class="display-md" id="modalName" style="margin:4px 0">AI & ML Society</div>
        <div class="body-sm" id="modalFaculty">Coordinator: Dr. Rajesh Menon</div>
      </div>
      <div class="modal-close" onclick="closeModal()">✕</div>
    </div>
    <div class="modal-body">
      <div class="label" style="margin-bottom:8px">About</div>
      <p class="body-text" id="modalDesc">A community for AI enthusiasts to explore machine learning, deep learning, and cutting-edge research. We host hackathons, workshops, and guest lectures by industry experts.</p>

      <div class="divider" style="margin:20px 0"></div>

      <div class="label" style="margin-bottom:10px">Achievements</div>
      <ul class="achievement-list" id="modalAchievements">
        <li>1st Place – National AI Hackathon 2024</li>
        <li>Best Research Paper – TechFest IIT Bombay</li>
        <li>Google Developer Student Club Partner</li>
      </ul>

      <div class="divider" style="margin:20px 0"></div>

      <div class="label" style="margin-bottom:10px">Connect</div>
      <div class="social-links" id="modalSocials">
        <a class="social-link" href="#">GitHub</a>
        <a class="social-link" href="#">Instagram</a>
        <a class="social-link" href="#">LinkedIn</a>
        <a class="social-link" href="#">Website</a>
      </div>

      <button class="expandable-toggle" onclick="toggleExpand(this)">
        <span id="modalMembersLabel">View Members (0)</span>
        <span>↓</span>
      </button>
      <div class="expandable-content">
        <div class="member-list" id="modalMembersList"></div>
      </div>

      <div style="display:flex; gap:10px; margin-top:24px">
        <button class="btn btn-primary" style="flex:1;justify-content:center" onclick="showPage('compare')">Compare</button>
        <button class="btn btn-ghost" style="flex:1;justify-content:center">Save</button>
      </div>
    </div>
  </div>
</div>`;

const THEMED_MODAL_HTML = `<div class="modal-overlay" id="themedModal" style="z-index:10000" onclick="if(event.target === this) closeThemedModal()">
  <div class="modal-card" style="max-width: 440px; border-radius: 24px; border: 4px solid var(--black); box-shadow: 12px 12px 0 var(--black); background: white; text-align: center; padding: 48px; position: relative;">
    <h3 class="display-sm" id="themedModalTitle" style="margin-bottom: 16px; text-transform: uppercase; font-weight: 950; font-family: 'Barlow', sans-serif;">Confirm Action?</h3>
    <p class="body-text" id="themedModalMessage" style="margin-bottom: 32px; color: var(--gray); font-size: 1.1rem; line-height: 1.5;">Are you sure you want to perform this action?</p>
    <div style="display: flex; gap: 16px; justify-content: center;" id="themedModalActions">
      <button class="btn-dialog-cancel" id="themedModalCancel" onclick="closeThemedModal()" style="padding: 12px 24px; font-weight: 950; text-transform: uppercase; border: 3px solid var(--black); background: white; color: var(--black); border-radius: 14px; cursor: pointer; box-shadow: 3px 3px 0 var(--black); transition: all 0.2s ease;">Cancel</button>
      <button class="btn-dialog-confirm" id="themedModalConfirm" style="padding: 12px 24px; font-weight: 950; text-transform: uppercase; border: 3px solid var(--black); background: #111; color: white; border-radius: 14px; cursor: pointer; box-shadow: 3px 3px 0 var(--black); transition: all 0.2s ease;">Proceed</button>
    </div>
  </div>
</div>`;

function initLayout(pageId) {
    document.body.insertAdjacentHTML("afterbegin", TOP_BAR_HTML);
    document.body.insertAdjacentHTML("beforeend", BOTTOM_NAV_HTML);
    document.body.insertAdjacentHTML("beforeend", MODAL_HTML);
    document.body.insertAdjacentHTML("beforeend", THEMED_MODAL_HTML);

    const navItems = {
        "home": "nav-home",
        "explore": "nav-explore",
        "community": "nav-community",
        "compare": "nav-compare",
        "profile": "nav-profile",
    };
    if (navItems[pageId]) {
      const el = document.getElementById(navItems[pageId]);
      if(el) el.classList.add("active");
    }
}
let themedModalAction = null;
function showThemedModal({title, message, confirmText, hideCancel, onConfirm}) {
    document.getElementById('themedModalTitle').textContent = title || 'Confirm Action?';
    document.getElementById('themedModalMessage').textContent = message || 'Are you sure?';
    const confirmBtn = document.getElementById('themedModalConfirm');
    confirmBtn.textContent = confirmText || 'Proceed';
    
    const cancelBtn = document.getElementById('themedModalCancel');
    cancelBtn.style.display = hideCancel ? 'none' : 'block';

    themedModalAction = onConfirm;
    document.getElementById('themedModal').classList.add('open');

    confirmBtn.onclick = () => {
        if (themedModalAction) themedModalAction();
        closeThemedModal();
    };
}

function closeThemedModal() {
    document.getElementById('themedModal').classList.remove('open');
    themedModalAction = null;
}
