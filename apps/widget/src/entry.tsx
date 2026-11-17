import { mountChatWidget } from './mount-widget';

const script = document.currentScript instanceof HTMLScriptElement ? document.currentScript : null;

mountChatWidget({
  apiUrl: script?.dataset.apiUrl,
  widgetId: script?.dataset.widgetId,
});
