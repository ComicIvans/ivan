<script setup lang="ts">
import type { FormSchema, FormSubmitEvent } from '@nuxt/ui'
import type { ContactFormData } from '~~/shared/utils/contactValidation'
import { CONTACT_FIELD_LIMITS, isContactFieldError } from '~~/shared/utils/contactShared'

defineProps<{ id: string }>()

const { t, locale } = useI18n({ useScope: 'global' })
const localePath = useLocalePath()
const toast = useToast()

const form = reactive<ContactFormData>({
  name: '',
  email: '',
  subject: '',
  message: '',
  website: '',
})

const isSubmitting = ref(false)

// When the form appeared, on the visitor's own monotonic clock: the server
// only receives the elapsed time, so a skewed device clock cannot make a
// genuine message look like an instant bot submission.
let formShownAt = 0

// Live name printing on the credential badge. Once accredited, the printed
// name is frozen: the form reset below would otherwise blank it right as the
// stamp lands.
const journey = useCredentialJourney()
watch(
  () => form.name,
  (value) => {
    if (!journey.accredited.value) journey.visitorName.value = value
  }
)

onMounted(() => {
  formShownAt = performance.now()
})

// The schema reports error codes; they are also the keys of the localized
// messages.
function fieldErrorMessage(code: string): string {
  return isContactFieldError(code)
    ? t(`contactPage.form.errors.${code}`)
    : t('contactPage.form.apiErrors.missingFields')
}

// The shared zod schema (and zod with it) loads on the first validation, not
// with the home page: the form sits at the very bottom. UForm accepts any
// Standard Schema and awaits its validate(), so this wrapper behaves like
// passing the zod schema itself (same issues, same parsed output), except
// that each issue carries its translated message.
const contactSchema = {
  '~standard': {
    version: 1,
    vendor: 'zod',
    validate: async (value: unknown) => {
      const { contactFormSchema } = await import('~~/shared/utils/contactValidation')
      const result = await contactFormSchema['~standard'].validate(value)
      if (!result.issues) return result
      return {
        issues: result.issues.map((issue) => ({
          ...issue,
          message: fieldErrorMessage(issue.message),
        })),
      }
    },
  },
} satisfies FormSchema<ContactFormData>

const apiErrorMessages = computed<Record<string, string>>(() => ({
  CONTACT_VALIDATION: t('contactPage.form.apiErrors.missingFields'),
  CONTACT_PROHIBITED_CONTENT: t('contactPage.form.apiErrors.prohibitedContent'),
  CONTACT_RATE_LIMITED: t('contactPage.form.apiErrors.rateLimited'),
  CONTACT_SEND_FAILED: t('contactPage.form.apiErrors.sendFailed'),
  CONTACT_SERVICE_UNAVAILABLE: t('contactPage.form.apiErrors.serviceUnavailable'),
}))

function resolveContactErrorMessage(error: unknown): string {
  const fetchError = error as {
    data?: { message?: string; statusMessage?: string }
    statusMessage?: string
    message?: string
  }

  const possibleCodes = [
    fetchError.data?.statusMessage,
    fetchError.statusMessage,
    fetchError.data?.message,
    fetchError.message,
  ]

  for (const possibleCode of possibleCodes) {
    if (typeof possibleCode === 'string') {
      const localizedMessage = apiErrorMessages.value[possibleCode]

      if (localizedMessage) {
        return localizedMessage
      }
    }
  }

  return t('contactPage.form.errorGeneric')
}

async function onSubmit(event: FormSubmitEvent<ContactFormData>) {
  if (isSubmitting.value) {
    return
  }

  isSubmitting.value = true

  try {
    await $fetch('/api/contact', {
      method: 'POST',
      body: {
        ...event.data,
        locale: locale.value,
        elapsedMs: Math.round(performance.now() - formShownAt),
      },
    })

    toast.add({
      title: t('contactPage.form.success'),
      icon: 'i-tabler-check',
      color: 'success',
    })

    // Freeze the submitted name on the badge BEFORE clearing the form.
    journey.visitorName.value = event.data.name
    journey.accredited.value = true

    form.name = ''
    form.email = ''
    form.subject = ''
    form.message = ''
    form.website = ''
    formShownAt = performance.now()
  } catch (error: unknown) {
    toast.add({
      title: resolveContactErrorMessage(error),
      icon: 'i-tabler-alert-circle',
      color: 'error',
    })
  } finally {
    isSubmitting.value = false
  }
}

function onFormError(event: { errors: Array<{ name?: string }> }) {
  const fieldName = event.errors[0]?.name
  if (!fieldName) return
  document.querySelector<HTMLElement>(`[name="${CSS.escape(fieldName)}"]`)?.focus()
}
</script>

<template>
  <section :id="id" class="py-20 sm:py-28" :aria-labelledby="`${id}-title`">
    <RevealHeading
      :title="t('contactPage.title')"
      :heading-id="`${id}-title`"
      :intro="t('contactPage.subtitle')"
      accent="ember"
    />

    <div class="grid gap-6 lg:grid-cols-[1fr_20rem]">
      <!-- Contact Form -->
      <div class="surface-glass reveal rounded-2xl p-4 sm:p-6">
        <!-- novalidate: the browser's own bubbles (e.g. for type="email") would
             block UForm and speak the browser's language, not the page's. -->
        <UForm
          :schema="contactSchema"
          :state="form"
          class="space-y-6"
          novalidate
          aria-describedby="form-description"
          @submit="onSubmit"
          @error="onFormError"
        >
          <p id="form-description" class="sr-only">{{ t('contactPage.subtitle') }}</p>

          <!-- Honeypot field -->
          <div class="hidden" aria-hidden="true">
            <label for="website">Website</label>
            <input
              id="website"
              v-model="form.website"
              type="text"
              name="website"
              tabindex="-1"
              autocomplete="off"
            />
          </div>

          <!-- The controls take their id from UFormField, so each label points
               at its field; `required` draws the asterisk, aria-required
               announces it. -->

          <!-- Name -->
          <UFormField name="name" :label="t('contactPage.form.name')" required>
            <UInput
              v-model="form.name"
              name="name"
              type="text"
              aria-required="true"
              :placeholder="t('contactPage.form.namePlaceholder')"
              autocomplete="name"
              :maxlength="CONTACT_FIELD_LIMITS.name.max"
              :disabled="isSubmitting"
              class="w-full"
            />
          </UFormField>

          <!-- Email -->
          <UFormField name="email" :label="t('contactPage.form.email')" required>
            <UInput
              v-model="form.email"
              name="email"
              type="email"
              aria-required="true"
              :placeholder="t('contactPage.form.emailPlaceholder')"
              autocomplete="email"
              inputmode="email"
              :maxlength="CONTACT_FIELD_LIMITS.emailMax"
              :disabled="isSubmitting"
              class="w-full"
            />
          </UFormField>

          <!-- Subject -->
          <UFormField name="subject" :label="t('contactPage.form.subject')" required>
            <UInput
              v-model="form.subject"
              name="subject"
              type="text"
              aria-required="true"
              :placeholder="t('contactPage.form.subjectPlaceholder')"
              autocomplete="off"
              :maxlength="CONTACT_FIELD_LIMITS.subject.max"
              :disabled="isSubmitting"
              class="w-full"
            />
          </UFormField>

          <!-- Message -->
          <UFormField name="message" :label="t('contactPage.form.message')" required>
            <UTextarea
              v-model="form.message"
              name="message"
              aria-required="true"
              :placeholder="t('contactPage.form.messagePlaceholder')"
              :rows="5"
              :maxlength="CONTACT_FIELD_LIMITS.message.max"
              autocomplete="off"
              spellcheck="true"
              :disabled="isSubmitting"
              class="w-full"
            />
            <template #hint>
              <span
                :class="
                  form.message.trim().length < CONTACT_FIELD_LIMITS.message.min
                    ? 'text-error'
                    : 'text-muted'
                "
              >
                {{
                  t('contactPage.form.messageLength', {
                    count: form.message.trim().length,
                    max: CONTACT_FIELD_LIMITS.message.max,
                  })
                }}
              </span>
            </template>
          </UFormField>

          <!-- Submit button, with the privacy information at the point of collection -->
          <div class="space-y-3">
            <UButton
              type="submit"
              color="primary"
              block
              :loading="isSubmitting"
              :disabled="isSubmitting"
              icon="i-tabler-send"
            >
              {{ isSubmitting ? t('contactPage.form.sending') : t('contactPage.form.submit') }}
            </UButton>

            <i18n-t
              keypath="contactPage.form.privacyNote"
              tag="p"
              scope="global"
              class="text-muted text-sm"
            >
              <template #link>
                <!-- raw: ULink's colour utility would override .inline-link -->
                <ULink
                  :to="{ path: localePath('/legal'), hash: '#formulario-contacto' }"
                  raw
                  class="inline-link"
                >
                  {{ t('contactPage.form.privacyLink') }}
                </ULink>
              </template>
            </i18n-t>
          </div>
        </UForm>
      </div>

      <!-- Alternative contact channels -->
      <aside
        v-spotlight
        class="bg-elevated/50 reveal flex flex-col gap-4 rounded-2xl p-6 lg:self-start"
      >
        <CredentialAnchor section="contacto" class="mx-auto" />

        <h3 class="text-highlighted text-lg font-semibold">
          {{ t('contactPage.aside.title') }}
        </h3>

        <p class="text-muted text-sm">
          {{ t('contactPage.alternative') }}
        </p>

        <div class="flex flex-wrap gap-3">
          <SocialLinks placement="contact" />
        </div>

        <p class="text-muted flex items-center gap-2 font-mono text-sm">
          <UIcon name="i-tabler-clock" class="size-4 shrink-0" aria-hidden="true" />
          {{ t('contactPage.aside.availability') }}
        </p>
      </aside>
    </div>
  </section>
</template>
