(function () {
  const links = [
    ['index.html', 'Dashboard', '▦'],
    ['categories.html', 'Categories', '◈'],
    ['budget.html', 'Budget allocation', '◷'],
    ['expenses.html', 'Add spending', '＋'],
    ['history.html', 'Spending history', '≡'],
    ['summary.html', 'Budget summary', '◉']
  ];

  function getMonth() {
    const picker = document.getElementById('month-filter');
    const parts = picker.value.split('-');
    return { month: Number(parts[1]), year: Number(parts[0]) };
  }

  function monthQuery() {
    const selected = getMonth();
    return `month=${selected.month}&year=${selected.year}`;
  }

  async function api(path, options) {
    const settings = Object.assign({ headers: {} }, options || {});
    if (settings.body && typeof settings.body !== 'string') {
      settings.headers['Content-Type'] = 'application/json';
      settings.body = JSON.stringify(settings.body);
    }
    const response = await fetch(`/api${path}`, settings);
    if (response.status === 204) return null;
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.message || `Request failed (${response.status}).`);
    return data;
  }

  function toast(message, type) {
    const region = document.getElementById('toast-region');
    const item = document.createElement('div');
    item.className = `toast ${type || ''}`;
    item.textContent = message;
    region.appendChild(item);
    window.setTimeout(() => item.remove(), 4200);
  }

  function money(value) {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency', currency: 'INR', maximumFractionDigits: 2
    }).format(Number(value) || 0);
  }

  function selectedDate() {
    return getMonth();
  }

  function statusMeta(status) {
    if (status === 'OVER_BUDGET') return { label: 'Overspending', style: 'danger' };
    if (status === 'APPROACHING') return { label: 'Almost used', style: 'warn' };
    if (status === 'NO_BUDGET') return { label: 'No allocation', style: 'neutral' };
    return { label: 'Within budget', style: 'good' };
  }

  function progressClass(status) {
    if (status === 'OVER_BUDGET') return 'danger';
    if (status === 'APPROACHING') return 'warn';
    return '';
  }

  function escapeHtml(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, character => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    })[character]);
  }

  function initialize() {
    const selected = document.getElementById('month-filter');
    const now = new Date();
    selected.value = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    selected.addEventListener('change', () => {
      document.dispatchEvent(new CustomEvent('smartspend:month-change'));
    });

    const activePage = document.body.dataset.page;
    document.querySelectorAll('.nav-links').forEach(nav => {
      nav.innerHTML = links.map(([href, label, icon]) =>
        `<a href="${href}" class="${href === activePage ? 'active' : ''}"><span class="nav-icon">${icon}</span>${label}</a>`
      ).join('');
    });
  }

  window.SmartSpend = { api, toast, money, monthQuery, selectedDate, statusMeta, progressClass, escapeHtml };
  initialize();
}());
