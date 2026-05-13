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
    categoryLabel: z.string().optional(),
    edition: z.string().optional(),
    flavor: z.string(),
    volume: z.string(),
    shortDescription: z.string(),
    ingredients: z.array(z.string()).default([]),
    images: z.array(z.string()).min(1),
    available: z.boolean().default(true),
    featured: z.boolean().default(false),
    order: z.number().default(100),
    tag: z.string().optional(),
    badges: z.array(z.string()).default([]),
    specs: z.array(z.object({ k: z.string(), v: z.string() })).default([]),
    flavorProfile: z.array(z.object({ label: z.string(), value: z.number().min(0).max(10) })).default([]),
    detailedIngredients: z.array(z.object({ name: z.string(), note: z.string() })).default([]),
    process: z.array(z.object({ label: z.string(), duration: z.string(), desc: z.string() })).default([]),
    story: z.object({
      eyebrow: z.string(),
      title: z.string(),
      paragraphs: z.array(z.string()),
      image: z.string(),
      caption: z.string().optional(),
    }).optional(),
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
    accentColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).default('#c33366'),
    accentDeepColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).default('#663366'),
    homeSections: z.object({
      manifest: z.boolean().default(true),
      featured: z.boolean().default(true),
      process: z.boolean().default(true),
      blog: z.boolean().default(true),
      b2b: z.boolean().default(true),
    }).default({ manifest: true, featured: true, process: true, blog: true, b2b: true }),
    homeHero: z.object({
      eyebrow: z.string().default('Kombucha · Sosy · Octy'),
      title: z.string().default('Rzemieślnicze fermenty z Wrocławia.'),
      subtitle: z.string().default('Ręcznie, w małych partiach. Bez kompromisów.'),
    }).default({
      eyebrow: 'Kombucha · Sosy · Octy',
      title: 'Rzemieślnicze fermenty z Wrocławia.',
      subtitle: 'Ręcznie, w małych partiach. Bez kompromisów.',
    }),
    manifestText: z.string().default('Wszystko, co tu pijesz, powstało w naszym studio.'),
  }),
});

export const collections = { blog, products, site };
