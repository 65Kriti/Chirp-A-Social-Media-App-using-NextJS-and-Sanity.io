import { createClient } from '@sanity/client';
import imageUrlBuilder from '@sanity/image-url';

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'dummy';
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production';
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-01-01';

// Read-only client (Cdn enabled for faster response)
export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: true,
});

// Write-enabled client (Cdn disabled for immediate updates, token required)
export const writeClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
  token: process.env.SANITY_API_WRITE_TOKEN,
});

const builder = imageUrlBuilder(client);

export function urlFor(source: any) {
  if (!source) return '';
  return builder.image(source).url();
}
