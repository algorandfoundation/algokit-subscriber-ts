// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import starlightTypeDoc, { typeDocSidebarGroup } from 'starlight-typedoc';
import remarkGithubAlerts from 'remark-github-alerts';

// https://astro.build/config
export default defineConfig({
  site: 'https://algorandfoundation.github.io',
  base: '/algokit-subscriber-ts/',
  trailingSlash: 'always',
  markdown: {
    remarkPlugins: [remarkGithubAlerts],
  },
  integrations: [
    starlight({
      title: 'AlgoKit Subscriber TypeScript',
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
          },
        }),
      ],
      sidebar: [
        { label: 'Home', link: '/' },
        {
          label: 'Getting Started',
          items: [{ label: 'Quick Start', slug: 'tutorials/quick-start' }],
        },
        {
          label: 'Guides',
          items: [
            { slug: 'guide/subscriber' },
            { slug: 'guide/subscriptions' },
          ],
        },
        {
          label: 'Concepts',
          items: [
            { slug: 'concepts/sync-behaviour' },
            { slug: 'concepts/low-latency' },
            { slug: 'concepts/watermarking' },
            { slug: 'concepts/filtering' },
            { slug: 'concepts/arc28-events' },
            { slug: 'concepts/emit-arc28-events' },
            { slug: 'concepts/inner-transactions' },
            { slug: 'concepts/state-proofs' },
            { slug: 'concepts/fast-catchup' },
          ],
        },
        {
          label: 'Examples',
          items: [{ label: 'Overview', link: '/examples/' }],
        },
        {
          label: 'Migration Guides',
          collapsed: true,
          autogenerate: { directory: 'migration' },
        },
        typeDocSidebarGroup,
      ],
    }),
  ],
});
