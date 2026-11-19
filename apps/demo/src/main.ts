import './styles.css';

const status = document.querySelector<HTMLElement>('#runtime-status');
const modeDescription = document.querySelector<HTMLElement>('#demo-mode-description');
const demoAccess = document.body.dataset.demoAccess === 'blocked' ? 'blocked' : 'allowed';

document.body.dataset.demoAccess = demoAccess;
if (modeDescription) {
  modeDescription.textContent =
    demoAccess === 'allowed'
      ? 'Allowed demo: origin này được seed trong whitelist và phải tạo được Widget session.'
      : 'Blocked demo: origin này không có trong whitelist và backend phải từ chối Widget session.';
}

window.addEventListener('load', () => {
  const widgetHost = document.querySelector('#poc-chatwidget-root');
  if (!status) return;

  status.textContent = widgetHost?.shadowRoot
    ? 'Shadow DOM: hoạt động'
    : 'Widget chưa tải — kiểm tra cổng 4173';
  status.dataset.ready = widgetHost?.shadowRoot ? 'true' : 'false';
});
