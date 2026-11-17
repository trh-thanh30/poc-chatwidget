import './styles.css';

const status = document.querySelector<HTMLElement>('#runtime-status');

window.addEventListener('load', () => {
  const widgetHost = document.querySelector('#poc-chatwidget-root');
  if (!status) return;

  status.textContent = widgetHost?.shadowRoot
    ? 'Shadow DOM: hoạt động'
    : 'Widget chưa tải — kiểm tra cổng 4173';
  status.dataset.ready = widgetHost?.shadowRoot ? 'true' : 'false';
});
