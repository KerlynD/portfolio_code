import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'

/** Blog posts & reviews — the feed. */
export const posts = sqliteTable('posts', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  slug: text('slug').notNull().unique(),
  kind: text('kind').notNull().default('Post'), // 'Post' | 'Review' | 'Paper Notes'
  title: text('title').notNull(),
  category: text('category').notNull().default(''),
  excerpt: text('excerpt').notNull().default(''),
  body: text('body').notNull().default(''), // markdown
  cover: text('cover'), // image URL (Vercel Blob)
  rating: integer('rating'), // 1-5 for reviews, null otherwise
  published: integer('published', { mode: 'boolean' }).notNull().default(true),
  postDate: text('post_date').notNull(), // ISO 'YYYY-MM-DD' — display + sort
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp_ms' }).notNull().$defaultFn(() => new Date()),
})

/** Work experience. */
export const experiences = sqliteTable('experiences', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  extId: text('ext_id').notNull().unique(),
  company: text('company').notNull(),
  role: text('role').notNull(),
  team: text('team').notNull().default(''),
  period: text('period').notNull().default(''),
  description: text('description').notNull().default(''),
  logo: text('logo'),
  logoFallback: text('logo_fallback').notNull().default(''),
  logoBackground: text('logo_background'),
  tags: text('tags', { mode: 'json' }).$type<string[]>().notNull(),
  highlights: text('highlights', { mode: 'json' }).$type<string[]>().notNull(),
  responsibilities: text('responsibilities', { mode: 'json' }).$type<string[]>().notNull(),
  current: integer('current', { mode: 'boolean' }).notNull().default(false),
  sort: integer('sort').notNull().default(0),
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp_ms' }).notNull().$defaultFn(() => new Date()),
})

/** Projects. */
export const projects = sqliteTable('projects', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  extId: text('ext_id').notNull().unique(),
  name: text('name').notNull(),
  shortDescription: text('short_description').notNull().default(''),
  description: text('description').notNull().default(''),
  tags: text('tags', { mode: 'json' }).$type<string[]>().notNull(),
  image: text('image'),
  links: text('links', { mode: 'json' }).$type<Record<string, string>>().notNull(),
  confidential: integer('confidential', { mode: 'boolean' }).notNull().default(false),
  hackathon: text('hackathon'),
  sort: integer('sort').notNull().default(0),
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp_ms' }).notNull().$defaultFn(() => new Date()),
})

/** Communities. */
export const communities = sqliteTable('communities', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  extId: text('ext_id').notNull().unique(),
  name: text('name').notNull(),
  icon: text('icon'),
  description: text('description').notNull().default(''),
  sort: integer('sort').notNull().default(0),
})

/** Site config — simple key/value; values are JSON-encoded. */
export const config = sqliteTable('config', {
  key: text('key').primaryKey(),
  value: text('value').notNull(), // JSON string
})

export type Post = typeof posts.$inferSelect
export type NewPost = typeof posts.$inferInsert
export type Experience = typeof experiences.$inferSelect
export type Project = typeof projects.$inferSelect
export type Community = typeof communities.$inferSelect
