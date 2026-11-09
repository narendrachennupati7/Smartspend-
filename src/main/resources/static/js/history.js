(function () {
  let categories = [];
  let expenses = [];
  const dialog = document.getElementById('edit-expense-dialog');
  const editForm = document.getElementById('edit-expense-form');
  const categoryFilter = document.getElementById('history-category');
  const editCategory = document.getElementById('edit-expense-category');

  function populateCategoryOptions(target, includeAll) {
    const first = includeAll ? '<option value="">All categories</option>' : '<option value="">Choose a category</option>';
    target.innerHTML = first + categories.map(item =>
      `<option value="${item.id}">${SmartSpend.escapeHtml(item.name)}</option>`
    ).join('');
  }

  function render() {
    const rows = document.getElementById('history-rows');
    const total = expenses.reduce((sum, item) => sum + Number(item.amount), 0);
    document.getElementById('history-total').textContent =
      `${expenses.length} ${expenses.length === 1 ? 'expense' : 'expenses'} · ${SmartSpend.money(total)} total`;
    rows.innerHTML = expenses.length ? expenses.map(item =>
      `<tr><td><strong>${SmartSpend.escapeHtml(item.title)}</strong></td><td>${SmartSpend.escapeHtml(item.categoryName)}</td><td>${item.expenseDate}</td><td>${SmartSpend.escapeHtml(item.description || '—')}</td><td class="text-right">${SmartSpend.money(item.amount)}</td><td class="text-right"><button class="button secondary small" data-edit="${item.id}">Edit</button> <button class="button danger-button small" data-delete="${item.id}">Delete</button></td></tr>`
    ).join('') : '<tr><td colspan="6"><div class="empty-state"><strong>No expenses found</strong>Try another category or add spending for this month.</div></td></tr>';
  }

  async function loadExpenses() {
    try {
      const query = new URLSearchParams(SmartSpend.monthQuery());
      if (categoryFilter.value) query.set('categoryId', categoryFilter.value);
      expenses = await SmartSpend.api(`/expenses?${query.toString()}`);
      expenses.sort((a, b) => b.expenseDate.localeCompare(a.expenseDate));
      render();
    } catch (error) {
      SmartSpend.toast(error.message, 'error');
    }
  }

  function openEditor(expense) {
    document.getElementById('edit-expense-id').value = expense.id;
    document.getElementById('edit-expense-title').value = expense.title;
    editCategory.value = expense.categoryId;
    document.getElementById('edit-expense-amount').value = expense.amount;
    document.getElementById('edit-expense-date').value = expense.expenseDate;
    document.getElementById('edit-expense-description').value = expense.description || '';
    dialog.showModal();
  }

  document.getElementById('history-rows').addEventListener('click', async event => {
    const edit = event.target.closest('[data-edit]');
    const remove = event.target.closest('[data-delete]');
    if (edit) {
      const expense = expenses.find(item => item.id === Number(edit.dataset.edit));
      if (expense) openEditor(expense);
    } else if (remove) {
      if (!window.confirm('Delete this expense? This will update your budget summary.')) return;
      try {
        await SmartSpend.api(`/expenses/${remove.dataset.delete}`, { method: 'DELETE' });
        SmartSpend.toast('Expense deleted.', 'success');
        await loadExpenses();
      } catch (error) {
        SmartSpend.toast(error.message, 'error');
      }
    }
  });

  editForm.addEventListener('submit', async event => {
    event.preventDefault();
    const id = document.getElementById('edit-expense-id').value;
    const body = {
      title: document.getElementById('edit-expense-title').value.trim(),
      categoryId: Number(editCategory.value),
      amount: Number(document.getElementById('edit-expense-amount').value),
      expenseDate: document.getElementById('edit-expense-date').value,
      description: document.getElementById('edit-expense-description').value.trim()
    };
    try {
      const updated = await SmartSpend.api(`/expenses/${id}`, { method: 'PUT', body });
      dialog.close();
      await loadExpenses();
      const date = new Date(`${updated.expenseDate}T00:00:00`);
      const summary = await SmartSpend.api(`/summary/category/${updated.categoryId}?month=${date.getMonth() + 1}&year=${date.getFullYear()}`);
      if (summary.status === 'OVER_BUDGET') {
        SmartSpend.toast(`${summary.categoryName} is ${SmartSpend.money(summary.exceeded)} over budget.`, 'error');
      } else {
        SmartSpend.toast('Expense updated.', 'success');
      }
    } catch (error) {
      SmartSpend.toast(error.message, 'error');
    }
  });

  document.getElementById('close-edit').addEventListener('click', () => dialog.close());
  categoryFilter.addEventListener('change', loadExpenses);
  document.addEventListener('smartspend:month-change', loadExpenses);

  SmartSpend.api('/categories').then(data => {
    categories = data;
    populateCategoryOptions(categoryFilter, true);
    populateCategoryOptions(editCategory, false);
    return loadExpenses();
  }).catch(error => SmartSpend.toast(error.message, 'error'));
}());
