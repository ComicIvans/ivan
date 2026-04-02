<script setup lang="ts">
import { socialProfiles } from '~~/shared/constants/profile'

const { t } = useI18n({ useScope: 'global' })
const toast = useToast()

usePageSeo('contactPage.seo.title', 'contactPage.seo.description')

const form = reactive({
  name: '',
  email: '',
  subject: '',
  message: '',
  website: '',
})

const touched = reactive({
  name: false,
  email: false,
  subject: false,
  message: false,
})

const isSubmitting = ref(false)
const formSubmitted = ref(false)

const apiErrorMessages = computed<Record<string, string>>(() => ({
  CONTACT_INVALID_EMAIL: t('contactPage.form.errors.emailInvalid'),
  CONTACT_MESSAGE_LENGTH: t('contactPage.form.apiErrors.messageLength'),
  CONTACT_MISSING_FIELDS: t('contactPage.form.apiErrors.missingFields'),
  CONTACT_NAME_LENGTH: t('contactPage.form.apiErrors.nameLength'),
  CONTACT_PROHIBITED_CONTENT: t('contactPage.form.apiErrors.prohibitedContent'),
  CONTACT_RATE_LIMITED: t('contactPage.form.apiErrors.rateLimited'),
  CONTACT_SEND_FAILED: t('contactPage.form.apiErrors.sendFailed'),
  CONTACT_SERVICE_UNAVAILABLE: t('contactPage.form.apiErrors.serviceUnavailable'),
  CONTACT_SUBJECT_LENGTH: t('contactPage.form.apiErrors.subjectLength'),
}))

const validations = computed(() => ({
  name: {
    valid: form.name.trim().length >= 2 && form.name.trim().length <= 100,
    error:
      form.name.trim().length === 0
        ? t('contactPage.form.errors.nameRequired')
        : form.name.trim().length < 2
          ? t('contactPage.form.errors.nameMin')
          : t('contactPage.form.errors.nameMax'),
  },
  email: {
    valid: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()),
    error:
      form.email.trim().length === 0
        ? t('contactPage.form.errors.emailRequired')
        : t('contactPage.form.errors.emailInvalid'),
  },
  subject: {
    valid: form.subject.trim().length >= 3 && form.subject.trim().length <= 200,
    error:
      form.subject.trim().length === 0
        ? t('contactPage.form.errors.subjectRequired')
        : form.subject.trim().length < 3
          ? t('contactPage.form.errors.subjectMin')
          : t('contactPage.form.errors.subjectMax'),
  },
  message: {
    valid: form.message.trim().length >= 10 && form.message.trim().length <= 5000,
    error:
      form.message.trim().length === 0
        ? t('contactPage.form.errors.messageRequired')
        : form.message.trim().length < 10
          ? t('contactPage.form.errors.messageMin')
          : t('contactPage.form.errors.messageMax'),
  },
}))

function shouldShowError(field: keyof typeof touched): boolean {
  return (touched[field] || formSubmitted.value) && !validations.value[field].valid
}

function getFieldError(field: keyof typeof touched): string | undefined {
  return shouldShowError(field) ? validations.value[field].error : undefined
}

const isFormValid = computed(() => {
  return Object.values(validations.value).every((v) => v.valid)
})

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

async function handleSubmit() {
  formSubmitted.value = true

  if (!isFormValid.value || isSubmitting.value) {
    const firstInvalidField = Object.keys(validations.value).find(
      (key) => !validations.value[key as keyof typeof validations.value].valid
    )
    if (firstInvalidField) {
      const element = document.getElementById(`contact-${firstInvalidField}`)
      element?.focus()
    }
    return
  }

  isSubmitting.value = true

  try {
    await $fetch('/api/contact', {
      method: 'POST',
      body: {
        name: form.name.trim(),
        email: form.email.trim(),
        subject: form.subject.trim(),
        message: form.message.trim(),
        website: form.website,
      },
    })

    toast.add({
      title: t('contactPage.form.success'),
      icon: 'i-tabler-check',
      color: 'success',
    })

    form.name = ''
    form.email = ''
    form.subject = ''
    form.message = ''
    form.website = ''
    formSubmitted.value = false
    Object.keys(touched).forEach((key) => (touched[key as keyof typeof touched] = false))
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
</script>

<template>
  <section role="region" :aria-label="t('contactPage.title')" class="section-enter">
    <div class="mx-auto max-w-2xl">
      <!-- Header -->
      <div class="mb-8 text-center">
        <h1 class="text-primary-500 text-3xl font-bold sm:text-4xl">
          {{ t('contactPage.title') }}
        </h1>
        <p class="text-muted mt-4">
          {{ t('contactPage.subtitle') }}
        </p>
      </div>

      <!-- Contact Form -->
      <UCard>
        <form class="space-y-6" aria-describedby="form-description" @submit.prevent="handleSubmit">
          <p id="form-description" class="sr-only">{{ t('contactPage.subtitle') }}</p>

          <!-- Honeypot field -->
          <div class="sr-only" aria-hidden="true">
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

          <!-- Name -->
          <UFormField :label="t('contactPage.form.name') + ' *'" :error="getFieldError('name')">
            <UInput
              id="contact-name"
              v-model="form.name"
              name="name"
              type="text"
              :placeholder="t('contactPage.form.namePlaceholder')"
              autocomplete="name"
              minlength="2"
              maxlength="100"
              required
              :disabled="isSubmitting"
              :color="shouldShowError('name') ? 'error' : undefined"
              :aria-invalid="shouldShowError('name')"
              class="w-full"
              @blur="touched.name = true"
            />
          </UFormField>

          <!-- Email -->
          <UFormField :label="t('contactPage.form.email') + ' *'" :error="getFieldError('email')">
            <UInput
              id="contact-email"
              v-model="form.email"
              name="email"
              type="email"
              :placeholder="t('contactPage.form.emailPlaceholder')"
              autocomplete="email"
              inputmode="email"
              maxlength="254"
              required
              :disabled="isSubmitting"
              :color="shouldShowError('email') ? 'error' : undefined"
              :aria-invalid="shouldShowError('email')"
              class="w-full"
              @blur="touched.email = true"
            />
          </UFormField>

          <!-- Subject -->
          <UFormField
            :label="t('contactPage.form.subject') + ' *'"
            :error="getFieldError('subject')"
          >
            <UInput
              id="contact-subject"
              v-model="form.subject"
              name="subject"
              type="text"
              :placeholder="t('contactPage.form.subjectPlaceholder')"
              autocomplete="off"
              minlength="3"
              maxlength="200"
              required
              :disabled="isSubmitting"
              :color="shouldShowError('subject') ? 'error' : undefined"
              :aria-invalid="shouldShowError('subject')"
              class="w-full"
              @blur="touched.subject = true"
            />
          </UFormField>

          <!-- Message -->
          <UFormField
            :label="t('contactPage.form.message') + ' *'"
            :error="getFieldError('message')"
          >
            <UTextarea
              id="contact-message"
              v-model="form.message"
              name="message"
              :placeholder="t('contactPage.form.messagePlaceholder')"
              :rows="5"
              minlength="10"
              maxlength="5000"
              autocomplete="off"
              spellcheck="true"
              required
              :disabled="isSubmitting"
              :color="shouldShowError('message') ? 'error' : undefined"
              :aria-invalid="shouldShowError('message')"
              class="w-full"
              @blur="touched.message = true"
            />
            <template #hint>
              <span
                :class="form.message.trim().length < 10 ? 'text-error' : 'text-muted'"
                aria-live="polite"
              >
                {{
                  t('contactPage.form.messageLength', {
                    count: form.message.trim().length,
                    max: 5000,
                  })
                }}
              </span>
            </template>
          </UFormField>

          <!-- Submit Button -->
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

          <!-- Privacy Note -->
          <p class="text-dimmed text-center text-sm">
            {{ t('contactPage.form.privacyNote') }}
          </p>
        </form>
      </UCard>

      <!-- Alternative Contact -->
      <div class="mt-8 text-center">
        <p class="text-muted">
          {{ t('contactPage.alternative') }}
        </p>
        <div class="mt-4 flex flex-wrap justify-center gap-4">
          <UButton
            :to="socialProfiles.linkedin"
            target="_blank"
            rel="noopener noreferrer"
            color="neutral"
            variant="outline"
            icon="i-tabler-brand-linkedin"
            :aria-label="t('contact.linkedinLabel')"
          >
            LinkedIn
          </UButton>
          <UButton
            :to="socialProfiles.instagram"
            target="_blank"
            rel="noopener noreferrer"
            color="neutral"
            variant="outline"
            icon="i-tabler-brand-instagram"
            :aria-label="t('contact.instagramLabel')"
          >
            Instagram
          </UButton>
        </div>
      </div>
    </div>
  </section>
</template>
