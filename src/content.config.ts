import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

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
    metaTitle: z.string().optional(),
    metaDescription: z.string().optional(),
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

// Strona główna — pełna treść home (hero, manifest, proces, blog, B2B)
const home = defineCollection({
  loader: glob({ pattern: 'home.md', base: './src/content/site' }),
  schema: z.object({
    heroImages: z.array(z.string()).default([]),
    homeHero: z.object({
      eyebrow: z.string(),
      title: z.string(),
      subtitle: z.string(),
      primaryCta: z.object({ label: z.string(), href: z.string() }),
      secondaryCta: z.object({ label: z.string(), href: z.string() }),
    }),
    homeSections: z.object({
      manifest: z.boolean().default(true),
      featured: z.boolean().default(true),
      process: z.boolean().default(true),
      blog: z.boolean().default(true),
      b2b: z.boolean().default(true),
    }),
    manifest: z.object({
      eyebrow: z.string(),
      title: z.string(),
      body: z.string(),
      image: z.string(),
      caption: z.string().optional(),
      ctaLabel: z.string().optional(),
      ctaHref: z.string().optional(),
    }),
    featured: z.object({
      eyebrow: z.string(),
      title: z.string(),
    }),
    processSection: z.object({
      eyebrow: z.string(),
      title: z.string(),
      steps: z.array(z.object({ n: z.string(), label: z.string(), desc: z.string() })),
    }),
    blogSection: z.object({
      eyebrow: z.string(),
      title: z.string(),
    }),
    b2b: z.object({
      eyebrow: z.string(),
      title: z.string(),
      accent: z.string(),
      body: z.string().optional(),
      mail: z.string().optional(),
      buttonLabel: z.string(),
      buttonHref: z.string(),
    }),
  }),
});

// Globalne ustawienia — marka, kolor, kontakt, social, stopka
const global = defineCollection({
  loader: glob({ pattern: 'global.md', base: './src/content/site' }),
  schema: z.object({
    brandName: z.string(),
    tagline: z.string(),
    accentColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).default('#c33366'),
    accentDeepColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).default('#663366'),
    contactEmail: z.string(),
    orderEmail: z.string(),
    phone: z.string().optional(),
    address: z.string().optional(),
    socials: z.object({
      instagram: z.string().optional(),
      facebook: z.string().optional(),
    }).default({}),
    footer: z.object({
      description: z.string().default(''),
      copyright: z.string().default('© Gary Wrotka'),
      taxId: z.string().optional(),
      shopHeading: z.string().default('Sklep'),
      aboutHeading: z.string().default('O nas'),
      contactHeading: z.string().default('Kontakt'),
    }).default({
      description: '',
      copyright: '© Gary Wrotka',
      shopHeading: 'Sklep',
      aboutHeading: 'O nas',
      contactHeading: 'Kontakt',
    }),
    analytics: z.object({
      ga4Id: z.string().optional(),
      cookieBannerText: z.string().default('Używamy ciasteczek do analityki — pomaga nam to ulepszać stronę. Możesz odmówić.'),
    }).default({
      ga4Id: '',
      cookieBannerText: 'Używamy ciasteczek do analityki — pomaga nam to ulepszać stronę. Możesz odmówić.',
    }),
  }),
});

export const collections = { blog, products, home, global };
