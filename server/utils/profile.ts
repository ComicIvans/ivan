import { queryCollection } from '@nuxt/content/server'
import type { H3Event } from 'h3'
import type { ProfileData } from '~~/shared/content/schemas'

/**
 * Loads every profile section with all languages side by side. Locale
 * resolution happens in the app (useProfile), so one response serves every
 * locale and a language switch never refetches.
 */
export async function fetchProfile(event: H3Event): Promise<ProfileData> {
  const [highlights, experience, representation, projects, training] = await Promise.all([
    queryCollection(event, 'profile_highlights').select('items').first(),
    queryCollection(event, 'profile_experience').select('items').first(),
    queryCollection(event, 'profile_representation').select('items').first(),
    queryCollection(event, 'profile_projects').select('stack', 'items').first(),
    queryCollection(event, 'profile_training')
      .select('academic', 'languages', 'certifications', 'competencies')
      .first(),
  ])

  if (!highlights || !experience || !representation || !projects || !training) {
    console.error('[profile] A profile collection is empty; check content/profile/*.yml')
    throw createError({ statusCode: 500, statusMessage: 'Profile content unavailable' })
  }

  // The collection types are generated from the same zod schemas, and
  // verify-content guarantees the YAML matches them.
  return {
    highlights: highlights.items,
    experience: experience.items,
    representation: representation.items,
    projects: { stack: projects.stack, items: projects.items },
    training: {
      academic: training.academic,
      languages: training.languages,
      certifications: training.certifications,
      competencies: training.competencies,
    },
  }
}
