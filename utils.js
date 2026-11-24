/**
 * Utilitaires UI
 */

function $(sel, ctx = document) {
  return ctx.querySelector(sel);
}
function $$(sel, ctx = document) {
  return Array.from(ctx.querySelectorAll(sel));
}

function toast(msg, type = '') {
  const el = $('#toast');
  el.textContent = msg;
  el.className = 'toast ' + type;
  el.classList.remove('hidden');
  clearTimeout(el._timer);
  el._timer = setTimeout(() => el.classList.add('hidden'), 3200);
}

function openModal(title, bodyHtml, footerHtml = '', center = false) {
  const modal = $('#modal');
  $('#modal-title').textContent = title;
  $('#modal-body').innerHTML = bodyHtml;
  $('#modal-footer').innerHTML = footerHtml;
  modal.classList.remove('hidden');
  if (center) modal.classList.add('center');
  else modal.classList.remove('center');
}

function closeModal() {
  $('#modal').classList.add('hidden');
}

function formatMoney(n) {
  return new Intl.NumberFormat('fr-FR').format(n || 0) + ' FCFA';
}

function formatDate(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function formatDateTime(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleString('fr-FR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function formValue(id) {
  const el = document.getElementById(id);
  return el ? el.value.trim() : '';
}

function formNum(id) {
  return parseFloat(formValue(id)) || 0;
}

function formInt(id) {
  return parseInt(formValue(id), 10) || 0;
}

function downloadFile(filename, content, mime = 'application/json') {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function confirmAction(msg) {
  return window.confirm(msg);
}
