document.addEventListener('DOMContentLoaded', () => {
  // Dynamic year in footer
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // FAQ accordion toggle
  document.querySelectorAll('.faq-q').forEach(q => {
    q.addEventListener('click', () => {
      q.parentElement.classList.toggle('open');
    });
  });
});

// Toast notification for upgrade button
function notAvailable() {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = 'Paid plans are coming soon. For now, you can continue using the free plan.';
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 4000);
}
