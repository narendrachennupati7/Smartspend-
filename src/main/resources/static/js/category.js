(function () {
  let categories = [];
  let editingId = null;
  const form = document.getElementById('category-form');
  const nameInput = document.getElementById('category-name');
  const descriptionInput = document.getElementById('category-description');
  const cancel = document.getElementById('category-cancel');

  function resetForm() {
    editingId = null;
    form.reset();
    document.getElementById('category-form-title').textContent = 'New category';
    document.getElementById('category-submit').textContent = 'Create category';
    cancel.classList.add('hidden');
  }

  async function load() {
    try {
      categories = await SmartSpend.api('/categories');
      const rows = document.getElementById('category-rows');
      rows.innerHTML = categories.length ? categories.map(category => {
        const created = category.createdAt ? new Date(category.createdAt).toLocaleDateString('en-IN') : '—';
        return `<tr><td><strong>${SmartSpend.escapeHtml(category.name)}</strong></td><td>${SmartSpend.escapeHtml(category.description || '—')}</td><td>${created}</td><td class="text-right"><button class="button secondary small" data-edit="${category.id}">Edit</button> <button class="button danger-button small" data-delete="${category.id}">Delete</button></td></tr>`;
      }).join('') : '<tr><td colspan="4"><div class="empty-state"><strong>No categories yet</strong>Add your first category to get started.</div></td></tr>';
    } catch (error) {
      SmartSpend.toast(error.message, 'error');
    }
  }

  form.addEventListener('submit', async event => {
    event.preventDefault();
    const body = { name: nameInput.value.trim(), description: descriptionInput.value.trim() };
    try {
      await SmartSpend.api(editingId ? `/categories/${editingId}` : '/categories', {
        method: editingId ? 'PUT' : 'POST',
        body
      });
      SmartSpend.toast(editingId ? 'Category updated.' : 'Category created.', 'success');
      resetForm();
      await load();
    } catch (error) {
      SmartSpend.toast(error.message, 'error');
    }
  });

  document.getElementById('category-rows').addEventListener('click', async event => {
    const editButton = event.target.closest('[data-edit]');
    const deleteButton = event.target.closest('[data-delete]');
    if (editButton) {
      const item = categories.find(category => category.id === Number(editButton.dataset.edit));
      if (!item) return;
      editingId = item.id;
      nameInput.value = item.name;
      descriptionInput.value = item.description || '';
      document.getElementById('category-form-title').textContent = 'Edit category';
      document.getElementById('category-submit').textContent = 'Save changes';
      cancel.classList.remove('hidden');
      nameInput.focus();
    } else if (deleteButton) {
      const id = Number(deleteButton.dataset.delete);
      if (!window.confirm('Delete this category? Categories with expenses or budgets cannot be deleted.')) return;
      try {
        await SmartSpend.api(`/categories/${id}`, { method: 'DELETE' });
        SmartSpend.toast('Category deleted.', 'success');
        await load();
      } catch (error) {
        SmartSpend.toast(error.message, 'error');
      }
    }
  });

  cancel.addEventListener('click', resetForm);
  load();
}());
