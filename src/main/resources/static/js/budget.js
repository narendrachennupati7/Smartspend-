(function () {
  let budgets = [];
  let summaries = [];
  let editingId = null;
  const form = document.getElementById('budget-form');
  const categorySelect = document.getElementById('budget-category');

  function resetForm() {
    editingId = null;
    form.reset();
    document.getElementById('budget-form-title').textContent = 'Set a budget';
    document.getElementById('budget-submit').textContent = 'Save allocation';
    document.getElementById('budget-cancel').classList.add('hidden');
  }

  async function loadCategories() {
    const categories = await SmartSpend.api('/categories');
    categorySelect.innerHTML = '<option value="">Choose a category</option>' +
      categories.map(item => `<option value="${item.id}">${SmartSpend.escapeHtml(item.name)}</option>`).join('');
  }

  async function load() {
    try {
      const [data, summary] = await Promise.all([
        SmartSpend.api(`/budgets/monthly?${SmartSpend.monthQuery()}`),
        SmartSpend.api(`/summary?${SmartSpend.monthQuery()}`)
      ]);
      budgets = data;
      summaries = summary.categories;
      const rows = document.getElementById('budget-rows');
      rows.innerHTML = budgets.length ? budgets.map(budget => {
        const categorySummary = summaries.find(item => item.categoryId === budget.categoryId);
        const spent = categorySummary ? Number(categorySummary.spent) : 0;
        const percent = Number(budget.allocatedAmount) > 0 ? spent / Number(budget.allocatedAmount) * 100 : 0;
        const status = categorySummary ? SmartSpend.progressClass(categorySummary.status) : '';
        return `<tr><td><strong>${SmartSpend.escapeHtml(budget.categoryName)}</strong></td><td>${SmartSpend.money(budget.allocatedAmount)}</td><td>${SmartSpend.money(spent)}</td><td style="min-width:120px"><div class="progress-track" style="margin:0 0 5px"><div class="progress-fill ${status}" style="width:${Math.min(100, Math.max(0, percent))}%"></div></div><span class="muted">${percent.toFixed(1)}%</span></td><td class="text-right"><button class="button secondary small" data-edit="${budget.id}">Edit</button></td></tr>`;
      }).join('') : '<tr><td colspan="5"><div class="empty-state"><strong>No allocations for this month</strong>Set a category budget to see your progress.</div></td></tr>';
    } catch (error) {
      SmartSpend.toast(error.message, 'error');
    }
  }

  form.addEventListener('submit', async event => {
    event.preventDefault();
    const selected = SmartSpend.selectedDate();
    const body = {
      categoryId: Number(categorySelect.value),
      allocatedAmount: Number(document.getElementById('budget-amount').value),
      month: selected.month,
      year: selected.year
    };
    try {
      await SmartSpend.api(editingId ? `/budgets/${editingId}` : '/budgets', {
        method: editingId ? 'PUT' : 'POST',
        body
      });
      SmartSpend.toast(editingId ? 'Budget updated.' : 'Budget allocation saved.', 'success');
      resetForm();
      await load();
    } catch (error) {
      SmartSpend.toast(error.message, 'error');
    }
  });

  document.getElementById('budget-rows').addEventListener('click', event => {
    const button = event.target.closest('[data-edit]');
    if (!button) return;
    const budget = budgets.find(item => item.id === Number(button.dataset.edit));
    if (!budget) return;
    editingId = budget.id;
    categorySelect.value = budget.categoryId;
    document.getElementById('budget-amount').value = budget.allocatedAmount;
    document.getElementById('budget-form-title').textContent = `Edit ${budget.categoryName} budget`;
    document.getElementById('budget-submit').textContent = 'Save changes';
    document.getElementById('budget-cancel').classList.remove('hidden');
  });

  document.getElementById('budget-cancel').addEventListener('click', resetForm);
  document.addEventListener('smartspend:month-change', () => { resetForm(); load(); });
  loadCategories().then(load).catch(error => SmartSpend.toast(error.message, 'error'));
}());
