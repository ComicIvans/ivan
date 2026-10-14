import { variantsById, type SectionId } from '~/components/credential/credentialVariants'

/**
 * Singleton state for the traveling credential badge. Anchors register their
 * slot elements here; CredentialLayer (full tier, home only) reads them to
 * home the badge onto the active section's anchor. Every operation is a safe
 * no-op when the layer is not mounted (lite/static tiers, non-home routes).
 *
 * No watchers or timers live at module scope: this module is also evaluated
 * during SSR (anchors and navbar import it), so anything with a lifecycle
 * belongs to CredentialLayer's setup.
 */
const slots = new Map<SectionId, HTMLElement>()

function registerSlot(id: SectionId, el: HTMLElement) {
  slots.set(id, el)
}

function unregisterSlot(id: SectionId) {
  slots.delete(id)
}

export function useCredentialJourney() {
  const active = useState<SectionId>('credential-active', () => 'inicio')
  const isJumping = useState('credential-is-jumping', () => false)
  const layerMounted = useState('credential-layer-mounted', () => false)
  const roleLine = useState('credential-role-line', () => '')
  const pins = useState<string[]>('credential-pins', () => [])
  const projectIndex = useState('credential-project-index', () => '')
  const photoSrc = useState('credential-photo-src', () => '')
  const galleryCovers = useState<string[]>('credential-gallery-covers', () => [])
  const visitorName = useState('credential-visitor-name', () => '')
  const accredited = useState('credential-accredited', () => false)

  function setActive(id: SectionId) {
    if (active.value !== id) active.value = id
  }

  function jumpTo(id: SectionId) {
    if (id === active.value) return
    isJumping.value = true
    setActive(id)
  }

  return {
    slots,
    registerSlot,
    unregisterSlot,
    setActive,
    jumpTo,
    active: readonly(active),
    isJumping,
    layerMounted,
    currentVariant: computed(() => variantsById[active.value]),
    roleLine,
    pins,
    projectIndex,
    photoSrc,
    galleryCovers,
    visitorName,
    accredited,
  }
}
