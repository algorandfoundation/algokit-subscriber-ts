// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import starlightTypeDoc from 'starlight-typedoc';
import sidebar from './sidebar.config.json';
import remarkGithubAlerts from 'remark-github-alerts';
import remarkFixIndexUrls from './plugins/remark-fix-index-urls';

// https://astro.build/config
export default defineConfig({
  site: 'https://algorandfoundation.github.io',
  base: '/algokit-subscriber-ts/',
  trailingSlash: 'always',
  markdown: {
    remarkPlugins: [remarkGithubAlerts, remarkFixIndexUrls],
  },
  integrations: [
    starlight({
      title: 'AlgoKit Subscriber TypeScript',
      customCss: [
        'remark-github-alerts/styles/github-colors-light.css',
        'remark-github-alerts/styles/github-colors-dark-media.css',
        'remark-github-alerts/styles/github-base.css',
      ],
      social: [
        { icon: 'github', label: 'GitHub', href: 'https://github.com/algorandfoundation/algokit-subscriber-ts' },
        { icon: 'discord', label: 'Discord', href: 'https://discord.gg/algorand' },
      ],
      plugins: [
        starlightTypeDoc({
          entryPoints: ['../src/index.ts', '../src/types/index.ts'],
          tsconfig: '../tsconfig.build.json',
          output: 'api',
          sidebar: {
            label: 'API Reference',
            collapsed: true,
          },
          typeDoc: {
            excludeReferences: true,
            gitRevision: 'main',
            entryFileName: 'index',
          },
        }),
      ],
      sidebar,
    }),
  ],
});
