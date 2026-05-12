import { defineCollection, z } from 'astro:content';
import { glob, file } from 'astro/loaders';

const blog = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    author: z.string().default('Studio Wro'),
    cover: z.string().optional(),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
  }),
});

const products = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/products' }),
  schema: z.object({
    name: z.string(),
    category: z.enum(['kombucha', 'sos', 'ocet']),
    flavor: z.string(),
    volume: z.string(),
    shortDescription: z.string(),
    ingredients: z.array(z.string()).default([]),
    images: z.array(z.string()).min(1),
    available: z.boolean().default(true),
    featured: z.boolean().default(false),
    order: z.number().default(100),
  }),
});

const site = defineCollection({
  loader: file('./src/content/site/site.json'),
  schema: z.object({
    id: z.string(),
    brandName: z.string(),
    tagline: z.string(),
    heroImages: z.array(z.string()),
    contactEmail: z.string(),
    orderEmail: z.string(),
    phone: z.string().optional(),
    address: z.string().optional(),
    socials: z.object({
      instagram: z.string().optional(),
      facebook: z.string().optional(),
    }).default({}),
  }),
});

export const collections = { blog, products, site };
