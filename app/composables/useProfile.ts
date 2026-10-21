import type { CefrLevel, LocalizedText, ProfileData } from '~~/shared/content/schemas'
import { displayUrl, formatPeriod, isCurrentPeriod, resolveLocalized } from '~/utils/profileFormat'

const PROFILE_KEY = 'profile'

const fetchProfileData = () => $fetch<ProfileData>('/api/profile')

// Reuse the payload (SSR) or an earlier client fetch: the response holds every
// language, so neither a locale switch nor a return to the home refetches it.
const getCachedProfile = (
  key: string,
  nuxtApp: ReturnType<typeof useNuxtApp>
): ProfileData | undefined => nuxtApp.payload.data[key] ?? nuxtApp.static.data[key]

/**
 * Starts the profile request, or joins the one already running. A page that
 * renders profile content awaits it in setup, so it mounts with the content
 * in place: mount-time effects (GSAP pins, the credential thread) and the
 * hash scroll after a client-side navigation measure the final layout. On
 * SSR and hydration the cached payload resolves it at once.
 */
export function loadProfile() {
  return useAsyncData(PROFILE_KEY, fetchProfileData, {
    getCachedData: getCachedProfile,
    // Many components ask at once: join the pending request instead of
    // cancelling it and starting another one per caller.
    dedupe: 'defer',
  })
}

/**
 * Profile content (content/profile/*.yml) resolved for the current locale,
 * with Spanish as the fallback for any missing translation. Every consumer
 * shares one request; all values are computed refs, so counters, periods and
 * the current role follow the data and the active language.
 */
export function useProfile() {
  const { data } = loadProfile()
  return resolveProfile(data)
}

/**
 * The same view without a request of its own: it fills in once a page (the
 * home) has loaded the profile. Site-wide consumers such as the Person
 * JSON-LD in app.vue use it, so other pages do not carry the profile in their
 * payload.
 */
export function useLoadedProfile() {
  const { data } = useNuxtData<ProfileData>(PROFILE_KEY)
  return resolveProfile(data)
}

function resolveProfile(data: { readonly value: ProfileData | null | undefined }) {
  const { t, locale } = useI18n({ useScope: 'global' })

  const lt = (value: LocalizedText) => resolveLocalized(value, locale.value)
  const ltOptional = (value: LocalizedText | undefined) =>
    value === undefined ? undefined : lt(value)

  const highlights = computed(() =>
    (data.value?.highlights ?? []).map((item) => ({
      id: item.id,
      icon: item.icon,
      title: lt(item.title),
      description: lt(item.description),
    }))
  )

  const experience = computed(() =>
    (data.value?.experience ?? []).map((item) => {
      const title = lt(item.title)
      return {
        id: item.id,
        icon: item.icon,
        title,
        organization: lt(item.organization),
        organizationUrl: item.organizationUrl,
        link:
          item.showLink && item.organizationUrl
            ? { url: item.organizationUrl, text: displayUrl(item.organizationUrl) }
            : undefined,
        description: lt(item.description),
        period: formatPeriod(item, locale.value, t('period.present')),
        current: isCurrentPeriod(item),
        badgeRole: ltOptional(item.badgeRole) ?? title,
      }
    })
  )

  const currentRole = computed(() => experience.value.find((item) => item.current) ?? null)

  const representation = computed(() =>
    (data.value?.representation ?? []).map((item) => ({
      id: item.id,
      icon: item.icon,
      pin: item.pin,
      date: item.current ? `${lt(item.dateText)} – ${t('period.present')}` : lt(item.dateText),
      title: lt(item.title),
      description: lt(item.description),
      roles: (item.roles ?? []).map(lt),
    }))
  )

  const representationStats = computed(() => {
    const items = data.value?.representation ?? []
    const years = items.map((item) => Number(String(item.date).slice(0, 4)))
    const startYear = years.length ? Math.min(...years) : undefined
    return {
      startYear,
      // Whole calendar years since the first milestone (same on server and
      // client within a render).
      yearsActive: startYear === undefined ? 0 : new Date().getFullYear() - startYear,
      milestones: items.length,
      roles: items.reduce((total, item) => total + (item.roles?.length ?? 0), 0),
    }
  })

  const toStackItem = (item: ProfileData['projects']['stack']['primary'][number]) => ({
    id: item.id,
    name: lt(item.name),
    icon: item.icon,
    tint: item.tint ?? 'ember',
    description: ltOptional(item.description),
  })

  const stack = computed(() => ({
    primary: (data.value?.projects.stack.primary ?? []).map(toStackItem),
    secondary: (data.value?.projects.stack.secondary ?? []).map(toStackItem),
  }))

  const projects = computed(() =>
    (data.value?.projects.items ?? []).map((item) => ({
      id: item.id,
      icon: item.icon,
      url: item.url,
      linkText: displayUrl(item.url),
      repository: item.repository,
      year: item.year,
      title: lt(item.title),
      description: lt(item.description),
      tags: (item.tags ?? []).map(lt),
      accent: item.accent,
      metrics: (item.metrics ?? []).map((metric) => ({
        value: String(metric.value),
        label: lt(metric.label),
      })),
      screenshot: item.screenshot
        ? { src: item.screenshot.src, alt: lt(item.screenshot.alt) }
        : undefined,
    }))
  )

  const academic = computed(() =>
    (data.value?.training.academic ?? []).map((item) => {
      const title = lt(item.title)
      return {
        id: item.id,
        icon: item.icon,
        title,
        organization: lt(item.organization),
        organizationUrl: item.organizationUrl,
        description: lt(item.description),
        period: formatPeriod(item, locale.value, t('period.ongoing')),
        current: isCurrentPeriod(item),
        badgeRole: ltOptional(item.badgeRole) ?? title,
      }
    })
  )

  const currentAcademic = computed(() => academic.value.find((item) => item.current) ?? null)

  const levelLabel = (cefr: CefrLevel, certificate?: string) =>
    cefr === 'native'
      ? t('training.languages.native')
      : [t('training.languages.level', { level: cefr }), certificate].filter(Boolean).join(' ')

  const languages = computed(() =>
    (data.value?.training.languages ?? []).map((item) => ({
      id: item.id,
      code: item.code,
      flag: item.flag,
      cefr: item.cefr,
      name: lt(item.name),
      level: ltOptional(item.level) ?? levelLabel(item.cefr, item.certificate),
      description: lt(item.description),
    }))
  )

  const certifications = computed(() =>
    (data.value?.training.certifications ?? []).map((item) => ({
      id: item.id,
      icon: item.icon,
      title: lt(item.title),
      description: lt(item.description),
    }))
  )

  const competencies = computed(() =>
    (data.value?.training.competencies ?? []).map((item) => ({
      id: item.id,
      icon: item.icon,
      name: lt(item.name),
    }))
  )

  return {
    highlights,
    experience,
    currentRole,
    representation,
    representationStats,
    stack,
    projects,
    academic,
    currentAcademic,
    languages,
    certifications,
    competencies,
  }
}
