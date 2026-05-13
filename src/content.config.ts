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
      primaryCta: z.object({
        label: z.string().default('Zobacz katalog'),
        href: z.string().default('/katalog'),
      }).default({ label: 'Zobacz katalog', href: '/katalog' }),
      secondaryCta: z.object({
        label: z.string().default('Manifest'),
        href: z.string().default('#manifest'),
      }).default({ label: 'Manifest', href: '#manifest' }),
    }).default({
      eyebrow: 'Kombucha · Sosy · Octy',
      title: 'Rzemieślnicze fermenty z Wrocławia.',
      subtitle: 'Ręcznie, w małych partiach. Bez kompromisów.',
      primaryCta: { label: 'Zobacz katalog', href: '/katalog' },
      secondaryCta: { label: 'Manifest', href: '#manifest' },
    }),
    manifest: z.object({
      eyebrow: z.string().default('Manifest'),
      title: z.string().default('Fermentacja to powolna sztuka.'),
      body: z.string().default(''),
      image: z.string().default('/images/photos/fermento-nero-2.jpg'),
      caption: z.string().default('Studio · Wrocław'),
      ctaLabel: z.string().default('Czytaj cały manifest'),
      ctaHref: z.string().default('/o-nas'),
    }).default({
      eyebrow: 'Manifest',
      title: 'Fermentacja to powolna sztuka.',
      body: '',
      image: '/images/photos/fermento-nero-2.jpg',
      caption: 'Studio · Wrocław',
      ctaLabel: 'Czytaj cały manifest',
      ctaHref: '/o-nas',
    }),
    featured: z.object({
      eyebrow: z.string().default('Katalog'),
      title: z.string().default('Wybrane fermenty.'),
    }).default({ eyebrow: 'Katalog', title: 'Wybrane fermenty.' }),
    processSection: z.object({
      eyebrow: z.string().default('Jak powstają'),
      title: z.string().default('Cztery kroki, sześć tygodni, jedna ręka.'),
      steps: z.array(z.object({
        n: z.string(),
        label: z.string(),
        desc: z.string(),
      })),
    }).default({
      eyebrow: 'Jak powstają',
      title: 'Cztery kroki, sześć tygodni, jedna ręka.',
      steps: [
        { n: '01', label: 'Surowiec', desc: 'Polska palarnia, lokalne warzywa, indyjskie przyprawy.' },
        { n: '02', label: 'Fermentacja', desc: 'Powolna, 14–60 dni.' },
        { n: '03', label: 'Smak', desc: 'Macerat ziół, leżakowanie, panel sensoryczny.' },
        { n: '04', label: 'Butelka', desc: 'Ręcznie. Numerowana. Datowana.' },
      ],
    }),
    blogSection: z.object({
      eyebrow: z.string().default('Dziennik'),
      title: z.string().default('Co właśnie czytamy.'),
    }).default({ eyebrow: 'Dziennik', title: 'Co właśnie czytamy.' }),
    b2b: z.object({
      eyebrow: z.string().default('Dla restauracji, sklepów i barów'),
      title: z.string().default('Postaw nas w swoim menu.'),
      accent: z.string().default('Powiedz nam, w jakiej skali — odpiszemy w 24h.'),
      body: z.string().default(''),
      mail: z.string().default('b2b@garywrotka.pl'),
      buttonLabel: z.string().default('Formularz B2B'),
      buttonHref: z.string().default('/b2b'),
    }).default({
      eyebrow: 'Dla restauracji, sklepów i barów',
      title: 'Postaw nas w swoim menu.',
      accent: 'Powiedz nam, w jakiej skali — odpiszemy w 24h.',
      body: '',
      mail: 'b2b@garywrotka.pl',
      buttonLabel: 'Formularz B2B',
      buttonHref: '/b2b',
    }),
  }),
});

export const collections = { blog, products, site };
