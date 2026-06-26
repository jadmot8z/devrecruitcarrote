// ============================================================
// DEVRECRUIT — Layout partagé (sidebar, navbar, auth guard)
// Uses Supabase (aligned with the rest of the project)
// ============================================================
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const SUPABASE_URL  = 'https://lourmvzgwyacvcdjpjge.supabase.co';
const SUPABASE_ANON = 'sb_publishable_ITSh6yTSqROXFnv8x7O9dw_3gMv_WXg';
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON);

export let currentUser    = null;
export let currentProfile = null;

// ── Auth guard + profile load ──────────────────────────────
export function requireAuth(callback) {
  supabase.auth.getSession().then(async ({ data: { session } }) => {
    if (!session) { window.location.href = '../pages/auth.html'; return; }
    currentUser = session.user;

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', currentUser.id)
      .single();

    if (!profile?.role) { window.location.href = '../pages/onboarding.html'; return; }
    currentProfile = profile;

    renderLayout();
    listenUnread();
    if (callback) callback(currentUser, currentProfile);
  });
}

// ── Toast ──────────────────────────────────────────────────
export function toast(msg, type = 'info') {
  const c = document.getElementById('toast-container');
  if (!c) return;
  const t = document.createElement('div');
  t.className = `toast ${type}`;
  t.textContent = msg;
  c.appendChild(t);
  setTimeout(() => t.remove(), 3500);
}

// ── Render sidebar layout ──────────────────────────────────
function renderLayout() {
  const role = currentProfile.role;
  const isOwner = role === 'owner';

  const roleLabel = { owner: 'Propriétaire', admin: 'Créateur de contenu', comms: 'Chargé de com.' }[role] || role;
  const roleChip  = { owner: 'chip-owner', admin: 'chip-dev', comms: 'chip-comms' }[role] || '';

  const links = isOwner ? [
    { id: 'nav-home',     icon: '🏠', label: 'Accueil',                href: 'home.html' },
    { id: 'nav-results',  icon: '📊', label: 'Résultats',             href: 'results.html' },
    { id: 'nav-post',     icon: '📋', label: 'Créer une annonce',      href: 'post.html' },
    { id: 'nav-messages', icon: '💬', label: 'Messages', badge: true,  href: 'messages.html' },
    { id: 'nav-role',     icon: '🔄', label: 'Changer de rôle',        href: 'change-role.html' },
    { id: 'nav-shop',     icon: '🛒', label: 'Boutique',               href: 'shop.html' },
    { id: 'nav-settings', icon: '⚙️', label: 'Paramètres',            href: 'settings.html' },
  ] : [
    { id: 'nav-home',     icon: '🏠', label: 'Accueil',                href: 'home.html' },
    { id: 'nav-results',  icon: '📊', label: 'Résultats',             href: 'results.html' },
    { id: 'nav-messages', icon: '💬', label: 'Messages', badge: true,  href: 'messages.html' },
    { id: 'nav-role',     icon: '🔄', label: 'Changer de rôle',        href: 'change-role.html' },
    { id: 'nav-settings', icon: '⚙️', label: 'Paramètres',            href: 'settings.html' },
  ];

  const linksHtml = links.map(l => `
    <a class="nav-link" id="${l.id}" href="${l.href}">
      <span class="nav-icon">${l.icon}</span>
      <span class="nav-label">${l.label}</span>
      ${l.badge ? '<span class="nav-badge hidden" id="msg-badge">0</span>' : ''}
    </a>
  `).join('');

  const coinHtml = isOwner
    ? `<div class="sidebar-coins"><span class="coin-badge" id="sidebar-coins">${currentProfile.coins ?? 0}</span></div>`
    : '';

  const sidebarHtml = `
    <aside class="sidebar" id="sidebar">
      <div class="sidebar-header">
        <div class="brand-mark">🎮 <strong>DevRecruit</strong></div>
        <button class="sidebar-close" id="sidebar-close" onclick="toggleSidebar()">✕</button>
      </div>
      <div class="sidebar-profile">
        <div class="profile-avatar">${(currentProfile.email || '?')[0].toUpperCase()}</div>
        <div>
          <div class="profile-email">${currentProfile.email}</div>
          <span class="chip ${roleChip}">${roleLabel}</span>
        </div>
      </div>
      ${coinHtml}
      <nav class="sidebar-nav">${linksHtml}</nav>
      <div class="sidebar-footer">
        <button class="btn btn-ghost btn-sm sidebar-logout" onclick="doSignOut()">🚪 Déconnexion</button>
      </div>
    </aside>
    <div class="sidebar-overlay" id="sidebar-overlay" onclick="toggleSidebar()"></div>
  `;

  const topbarHtml = `
    <header class="topbar">
      <button class="hamburger" onclick="toggleSidebar()">
        <span></span><span></span><span></span>
      </button>
      <div class="topbar-title" id="page-title">Accueil</div>
      <div class="topbar-right">
        ${isOwner ? `<span class="coin-badge" id="topbar-coins">${currentProfile.coins ?? 0}</span>` : ''}
      </div>
    </header>
  `;

  // Injection
  const layoutEl = document.getElementById('app-layout');
  if (!layoutEl) return;
  layoutEl.insertAdjacentHTML('afterbegin', topbarHtml);
  document.body.insertAdjacentHTML('afterbegin', sidebarHtml);

  // Marque le lien actif
  const page = window.location.pathname.split('/').pop();
  document.querySelectorAll('.nav-link').forEach(a => {
    a.classList.toggle('active', a.getAttribute('href') === page);
  });

  // Apply saved theme
  const theme = localStorage.getItem('dr-theme') || 'light';
  document.documentElement.setAttribute('data-theme', theme);
}

// ── Sidebar toggle ─────────────────────────────────────────
window.toggleSidebar = () => {
  document.getElementById('sidebar')?.classList.toggle('open');
  document.getElementById('sidebar-overlay')?.classList.toggle('show');
};

// ── Sign out ───────────────────────────────────────────────
window.doSignOut = async () => {
  await supabase.auth.signOut();
  window.location.href = '../pages/auth.html';
};

// ── Unread messages badge ──────────────────────────────────
async function listenUnread() {
  if (!currentUser) return;
  const { data } = await supabase
    .from('conversations')
    .select('unread')
    .contains('members', [currentUser.id]);
  if (!data) return;
  let unread = 0;
  data.forEach(d => {
    if (d.unread && d.unread[currentUser.id]) {
      unread += d.unread[currentUser.id];
    }
  });
  const badge = document.getElementById('msg-badge');
  if (badge) {
    badge.textContent = unread;
    badge.classList.toggle('hidden', unread === 0);
  }
}

// ── Mise à jour des coins en temps réel ───────────────────
export function watchCoins() {
  if (!currentUser) return;
  supabase
    .channel('coins-' + currentUser.id)
    .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'profiles', filter: 'id=eq.' + currentUser.id }, (payload) => {
      const coins = payload.new?.coins ?? 0;
      if (currentProfile) currentProfile.coins = coins;
      const sb = document.getElementById('sidebar-coins');
      const tb = document.getElementById('topbar-coins');
      if (sb) sb.textContent = coins;
      if (tb) tb.textContent = coins;
    })
    .subscribe();
}
