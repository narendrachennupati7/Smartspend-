(function () {
  function stat(label, value, note, icon) {
    return `<article class="stat-card"><div class="stat-label">${label}<span class="stat-icon">${icon}</span></div><strong class="stat-value">${value}</strong><span class="stat-note">${note}</span></article>`;
  }

  async function load() {
    try {
      const data = await SmartSpend.api(`/summary?${SmartSpend.monthQuery()}`);
      document.getElementById('summary-stats').innerHTML = [
        stat('Allocated', SmartSpend.money(data.totalAllocated), 'Across category budgets', '◷'),
        stat('Spent', SmartSpend.money(data.totalSpent), 'Expenses in the selected month', '↗'),
        stat('Remaining', SmartSpend.money(data.remaining), 'Floored at zero if over budget', '＋'),
        stat('Categories', data.categoryCount, 'Including categories without budgets', '◈')
      ].join('');
      const rows = document.getElementById('summary-rows');
      rows.innerHTML = data.categories.length ? data.categories.map(item => {
        const status = SmartSpend.statusMeta(item.status);
        const percent = Number(item.utilizationPercent) || 0;
        const fill = SmartSpend.progressClass(item.status);
        return `<tr>
          <td><strong>${SmartSpend.escapeHtml(item.categoryName)}</strong></td>
          <td>${SmartSpend.money(item.allocated)}</td>
          <td>${SmartSpend.money(item.spent)}</td>
          <td>${SmartSpend.money(item.remaining)}</td>
          <td>${item.exceeded > 0 ? `<strong style="color:var(--red)">${SmartSpend.money(item.exceeded)}</strong>` : '—'}</td>
          <td style="min-width:135px"><div class="progress-track" style="margin:0 0 5px"><div class="progress-fill ${fill}" style="width:${Math.min(100, Math.max(0, percent))}%"></div></div><span class="muted">${item.status === 'NO_BUDGET' ? 'No budget' : `${percent.toFixed(1)}%`}</span></td>
          <td><span class="status ${status.style}">${status.label}</span></td>
        </tr>`;
      }).join('') : '<tr><td colspan="7"><div class="empty-state"><strong>No categories to summarize</strong>Add categories to begin tracking your budget.</div></td></tr>';
    } catch (error) {
      SmartSpend.toast(error.message, 'error');
    }
  }

  load();
  document.addEventListener('smartspend:month-change', load);
}());
