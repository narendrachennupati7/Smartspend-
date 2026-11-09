(function () {
  let charts = [];

  function stat(label, value, note, icon) {
    return `<article class="stat-card"><div class="stat-label">${label}<span class="stat-icon">${icon}</span></div><strong class="stat-value">${value}</strong><span class="stat-note">${note}</span></article>`;
  }

  function renderCategories(categories) {
    const target = document.getElementById('dashboard-categories');
    if (!categories.length) {
      target.innerHTML = '<div class="empty-state"><strong>No categories yet</strong>Create a category to start planning your spending.</div>';
      return;
    }
    target.innerHTML = categories.map(item => {
      const state = SmartSpend.statusMeta(item.status);
      const percent = Number(item.utilizationPercent) || 0;
      const width = Math.min(100, Math.max(0, percent));
      const progress = SmartSpend.progressClass(item.status);
      return `<article class="category-card">
        <div class="category-top"><div><h3 class="category-name">${SmartSpend.escapeHtml(item.categoryName)}</h3><div class="category-sub">Spent ${SmartSpend.money(item.spent)} of ${SmartSpend.money(item.allocated)}</div></div><span class="status ${state.style}">${state.label}</span></div>
        <div class="progress-track"><div class="progress-fill ${progress}" style="width:${width}%"></div></div>
        <div class="category-foot"><span>${item.status === 'NO_BUDGET' ? 'No budget allocated' : `${percent.toFixed(1)}% used`}</span><span>${item.exceeded > 0 ? `${SmartSpend.money(item.exceeded)} over budget` : `${SmartSpend.money(item.remaining)} left`}</span></div>
      </article>`;
    }).join('');
  }

  function renderCharts(summary) {
    charts.forEach(chart => chart.destroy());
    charts = [];
    if (typeof Chart === 'undefined') {
      SmartSpend.toast('Charts could not load. The budget summary is still available.', 'error');
      return;
    }
    const palette = ['#197a57', '#80b79b', '#e3a456', '#758bc4', '#d97565', '#61a4a4', '#9c7abd'];
    const nonZero = summary.categories.filter(item => Number(item.spent) > 0);
    charts.push(new Chart(document.getElementById('spending-chart'), {
      type: 'pie',
      data: { labels: nonZero.map(item => item.categoryName), datasets: [{ data: nonZero.map(item => Number(item.spent)), backgroundColor: nonZero.map((_, index) => palette[index % palette.length]), borderWidth: 0 }] },
      options: { maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { boxWidth: 9, usePointStyle: true, font: { size: 10 } } } } }
    }));
    charts.push(new Chart(document.getElementById('comparison-chart'), {
      type: 'bar',
      data: {
        labels: summary.categories.map(item => item.categoryName),
        datasets: [
          { label: 'Allocated', data: summary.categories.map(item => Number(item.allocated)), backgroundColor: '#cfe5d6', borderRadius: 4 },
          { label: 'Spent', data: summary.categories.map(item => Number(item.spent)), backgroundColor: '#197a57', borderRadius: 4 }
        ]
      },
      options: { maintainAspectRatio: false, scales: { x: { grid: { display: false }, ticks: { font: { size: 9 } } }, y: { beginAtZero: true, ticks: { font: { size: 9 } } } }, plugins: { legend: { position: 'bottom', labels: { boxWidth: 9, usePointStyle: true, font: { size: 10 } } } } }
    }));
    const exceeded = Math.max(0, Number(summary.totalSpent) - Number(summary.totalAllocated));
    const used = Math.max(0, Number(summary.totalSpent) - exceeded);
    const left = Math.max(0, Number(summary.totalAllocated) - Number(summary.totalSpent));
    charts.push(new Chart(document.getElementById('utilization-chart'), {
      type: 'doughnut',
      data: { labels: ['Used', 'Remaining', 'Exceeded'], datasets: [{ data: [used, left, exceeded], backgroundColor: ['#197a57', '#e8efe9', '#d7655d'], borderWidth: 0 }] },
      options: { cutout: '72%', maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { boxWidth: 9, usePointStyle: true, font: { size: 10 } } } } }
    }));
  }

  async function load() {
    try {
      const summary = await SmartSpend.api(`/summary?${SmartSpend.monthQuery()}`);
      const monthName = new Date(summary.year, summary.month - 1, 1).toLocaleString('en', { month: 'long', year: 'numeric' });
      document.getElementById('welcome-title').textContent = `Your ${monthName} at a glance.`;
      document.getElementById('dashboard-stats').innerHTML = [
        stat('Total allocated', SmartSpend.money(summary.totalAllocated), 'Across all categories', '◷'),
        stat('Total spent', SmartSpend.money(summary.totalSpent), 'Recorded this month', '↗'),
        stat('Budget remaining', SmartSpend.money(summary.remaining), 'Available within your plan', '＋'),
        stat('Categories', summary.categoryCount, 'Active spending categories', '◈')
      ].join('');
      renderCategories(summary.categories);
      renderCharts(summary);
    } catch (error) {
      SmartSpend.toast(error.message, 'error');
    }
  }

  load();
  document.addEventListener('smartspend:month-change', load);
}());
