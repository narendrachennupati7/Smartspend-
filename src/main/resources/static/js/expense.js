(function () {
  const form = document.getElementById('expense-form');
  const categorySelect = document.getElementById('expense-category');
  const dateInput = document.getElementById('expense-date');
  const notice = document.getElementById('expense-notice');

  function setDateToSelectedMonth() {
    const selected = SmartSpend.selectedDate();
    const now = new Date();
    const currentMonth = selected.month === now.getMonth() + 1 && selected.year === now.getFullYear();
    dateInput.value = currentMonth
      ? `${selected.year}-${String(selected.month).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
      : `${selected.year}-${String(selected.month).padStart(2, '0')}-01`;
  }

  async function loadCategories() {
    const categories = await SmartSpend.api('/categories');
    categorySelect.innerHTML = '<option value="">Choose a category</option>' +
      categories.map(item => `<option value="${item.id}">${SmartSpend.escapeHtml(item.name)}</option>`).join('');
  }

  async function loadRecent() {
    try {
      const expenses = await SmartSpend.api(`/expenses?${SmartSpend.monthQuery()}`);
      const recent = expenses.slice().sort((a, b) => b.expenseDate.localeCompare(a.expenseDate)).slice(0, 5);
      document.getElementById('recent-expenses').innerHTML = recent.length ? recent.map(item =>
        `<tr><td><strong>${SmartSpend.escapeHtml(item.title)}</strong></td><td>${SmartSpend.escapeHtml(item.categoryName)}</td><td>${item.expenseDate}</td><td class="text-right">${SmartSpend.money(item.amount)}</td></tr>`
      ).join('') : '<tr><td colspan="4"><div class="empty-state"><strong>No spending recorded</strong>Your latest transactions will appear here.</div></td></tr>';
    } catch (error) {
      SmartSpend.toast(error.message, 'error');
    }
  }

  form.addEventListener('submit', async event => {
    event.preventDefault();
    const body = {
      title: document.getElementById('expense-title').value.trim(),
      categoryId: Number(categorySelect.value),
      amount: Number(document.getElementById('expense-amount').value),
      expenseDate: dateInput.value,
      description: document.getElementById('expense-description').value.trim()
    };
    try {
      const created = await SmartSpend.api('/expenses', { method: 'POST', body });
      form.reset();
      setDateToSelectedMonth();
      await loadRecent();
      const date = new Date(`${created.expenseDate}T00:00:00`);
      const params = `month=${date.getMonth() + 1}&year=${date.getFullYear()}`;
      const summary = await SmartSpend.api(`/summary/category/${created.categoryId}?${params}`);
      if (summary.status === 'OVER_BUDGET') {
        notice.innerHTML = `<div class="notice"><strong>Budget exceeded.</strong> ${SmartSpend.escapeHtml(summary.categoryName)} is ${SmartSpend.money(summary.exceeded)} over its allocation. This expense was saved successfully.</div>`;
        SmartSpend.toast(`Warning: ${summary.categoryName} budget exceeded by ${SmartSpend.money(summary.exceeded)}.`, 'error');
      } else if (summary.status === 'APPROACHING') {
        notice.innerHTML = `<div class="notice"><strong>Budget almost used.</strong> ${SmartSpend.escapeHtml(summary.categoryName)} has used ${Number(summary.utilizationPercent).toFixed(1)}% of its allocation.</div>`;
        SmartSpend.toast('Expense saved. This category is approaching its budget limit.', 'success');
      } else if (summary.status === 'NO_BUDGET') {
        notice.innerHTML = `<div class="notice"><strong>No budget allocated.</strong> The expense was saved and will appear in your spending summary.</div>`;
        SmartSpend.toast('Expense saved. No budget is set for this category.', 'success');
      } else {
        notice.innerHTML = '';
        SmartSpend.toast('Expense saved successfully.', 'success');
      }
    } catch (error) {
      SmartSpend.toast(error.message, 'error');
    }
  });

  document.addEventListener('smartspend:month-change', () => {
    setDateToSelectedMonth();
    notice.innerHTML = '';
    loadRecent();
  });
  setDateToSelectedMonth();
  loadCategories().then(loadRecent).catch(error => SmartSpend.toast(error.message, 'error'));
}());
