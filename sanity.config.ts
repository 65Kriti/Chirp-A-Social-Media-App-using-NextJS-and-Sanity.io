import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { schemaTypes } from './src/sanity/schemas';

export default defineConfig({
  name: 'default',
  title: 'Chirp Studio',

  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'kw43lk0d',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',

  basePath: '/studio',

  plugins: [structureTool()],

  schema: {
    types: schemaTypes,
  },
});
