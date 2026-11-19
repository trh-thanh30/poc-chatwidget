import { defineConfig } from 'vite';

export default defineConfig(() => {
  const replacements = {
    __DEMO_ACCESS__: process.env.DEMO_ACCESS ?? 'allowed',
    __WIDGET_SCRIPT_URL__: process.env.DEMO_WIDGET_SCRIPT_URL ?? 'http://localhost:4173/widget.js',
    __WIDGET_API_URL__: process.env.DEMO_API_URL ?? 'http://localhost:3000/api/v1',
  };

  return {
    plugins: [
      {
        name: 'demo-runtime-config',
        transformIndexHtml: {
          order: 'pre',
          handler(html) {
            return Object.entries(replacements).reduce(
              (output, [name, value]) => output.replaceAll(name, value),
              html,
            );
          },
        },
      },
    ],
    server: {
      cors: true,
    },
  };
});
