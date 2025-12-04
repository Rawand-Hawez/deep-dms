/**
 * Design Token System for Deep DMS
 *
 * This file documents the design tokens used throughout the application.
 * All tokens are defined via Tailwind CSS configuration and CSS custom properties.
 *
 * DO NOT use hardcoded values - always reference these tokens via Tailwind classes.
 */

/**
 * TYPOGRAPHY TOKENS
 *
 * Font Sizes (use via Tailwind classes):
 * - text-xs: 0.75rem (12px) - Captions, helper text
 * - text-sm: 0.875rem (14px) - Secondary text, labels
 * - text-base: 1rem (16px) - Body text, default
 * - text-lg: 1.125rem (18px) - Emphasized body text
 * - text-xl: 1.25rem (20px) - Small headings
 * - text-2xl: 1.5rem (24px) - Section headings
 * - text-3xl: 1.875rem (30px) - Page headings
 * - text-4xl: 2.25rem (36px) - Display headings
 *
 * Font Weights:
 * - font-normal: 400 - Body text
 * - font-medium: 500 - Emphasized text, labels
 * - font-semibold: 600 - Subheadings
 * - font-bold: 700 - Headings
 */

/**
 * SPACING TOKENS
 *
 * Use via Tailwind spacing utilities (p-*, m-*, gap-*, space-*):
 * - 0: 0
 * - 1: 0.25rem (4px) - Minimal spacing
 * - 2: 0.5rem (8px) - Tight spacing
 * - 3: 0.75rem (12px) - Comfortable spacing
 * - 4: 1rem (16px) - Default spacing
 * - 5: 1.25rem (20px) - Comfortable spacing
 * - 6: 1.5rem (24px) - Section spacing
 * - 8: 2rem (32px) - Large section spacing
 * - 10: 2.5rem (40px) - Extra large spacing
 * - 12: 3rem (48px) - Major section spacing
 * - 16: 4rem (64px) - Page section spacing
 */

/**
 * COLOR TOKENS
 *
 * Semantic colors (use via Tailwind classes):
 *
 * Background & Foreground:
 * - bg-background, text-foreground - Main page background and text
 * - bg-card, text-card-foreground - Card backgrounds
 * - bg-popover, text-popover-foreground - Dropdown/popover backgrounds
 *
 * Interactive:
 * - bg-primary, text-primary-foreground - Primary actions
 * - bg-secondary, text-secondary-foreground - Secondary actions
 * - bg-accent, text-accent-foreground - Hover states, highlights
 * - bg-destructive, text-destructive-foreground - Danger actions
 *
 * Muted:
 * - bg-muted, text-muted-foreground - Disabled states, subtle backgrounds
 *
 * Borders & Inputs:
 * - border-border - Default borders
 * - border-input - Input borders
 * - ring-ring - Focus ring color
 */

/**
 * BORDER RADIUS TOKENS
 *
 * Use via Tailwind classes:
 * - rounded-sm: calc(var(--radius) - 4px) - Small elements
 * - rounded-md: calc(var(--radius) - 2px) - Medium elements
 * - rounded-lg: var(--radius) - Large elements, cards
 */

/**
 * COMPONENT USE CASES
 *
 * Page Headings:
 * - class="text-3xl font-bold tracking-tight"
 *
 * Section Headings:
 * - class="text-2xl font-semibold"
 *
 * Body Text:
 * - class="text-base text-foreground"
 *
 * Muted/Helper Text:
 * - class="text-sm text-muted-foreground"
 *
 * Cards:
 * - class="rounded-lg border bg-card text-card-foreground"
 *
 * Sections:
 * - class="space-y-6" (vertical spacing between elements)
 * - class="space-x-4" (horizontal spacing between elements)
 */

export const TYPOGRAPHY = {
  heading: {
    page: 'text-3xl font-bold tracking-tight',
    section: 'text-2xl font-semibold',
    subsection: 'text-xl font-semibold',
    card: 'text-lg font-semibold',
  },
  body: {
    default: 'text-base text-foreground',
    large: 'text-lg text-foreground',
    small: 'text-sm text-foreground',
  },
  muted: {
    default: 'text-sm text-muted-foreground',
    large: 'text-base text-muted-foreground',
    small: 'text-xs text-muted-foreground',
  },
  label: {
    default: 'text-sm font-medium',
    large: 'text-base font-medium',
  },
} as const

export const SPACING = {
  section: 'space-y-6',
  subsection: 'space-y-4',
  compact: 'space-y-2',
  inline: 'space-x-4',
  inlineCompact: 'space-x-2',
} as const

export const CONTAINER = {
  page: 'container mx-auto px-6 py-8',
  section: 'rounded-lg border bg-card p-6',
  card: 'rounded-lg border bg-card p-4',
} as const
