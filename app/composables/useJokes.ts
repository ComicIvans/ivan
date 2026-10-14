import { loadJokes } from '~/utils/locales'

/**
 * Shared joke-modal state so both the masthead portrait and the fixed navbar
 * portrait open the same modal. State lives in useState (one instance per
 * app); the modal itself is rendered once, inside SiteNavBar.
 */
export function useJokes() {
  const { t, locale } = useI18n({ useScope: 'global' })

  const jokes = useState<string[]>('jokes-list', () => [])
  const loadedJokesLocale = useState<string | null>('jokes-locale', () => null)
  const jokeModalOpen = useState('joke-modal-open', () => false)
  const currentJoke = useState('joke-current', () => '')

  async function loadJokesForLocale(localeCode = locale.value) {
    if (loadedJokesLocale.value === localeCode && jokes.value.length > 0) {
      return
    }

    jokes.value = await loadJokes(localeCode)
    loadedJokesLocale.value = localeCode
  }

  async function showRandomJoke() {
    if (loadedJokesLocale.value !== locale.value || jokes.value.length === 0) {
      await loadJokesForLocale()
    }

    const jokeList = jokes.value
    currentJoke.value = jokeList[Math.floor(Math.random() * jokeList.length)] || t('joke.error')
    jokeModalOpen.value = true
  }

  function resetJokes() {
    jokes.value = []
    loadedJokesLocale.value = null
    jokeModalOpen.value = false
  }

  return { jokeModalOpen, currentJoke, showRandomJoke, resetJokes }
}
