<script setup lang="ts">
import type { FormSubmitEvent } from '@nuxt/ui'
import { socialProfiles } from '~~/shared/constants/profile'
import { contactFormSchema, type ContactFormData } from '~~/shared/utils/contactValidation'
import { CONTACT_FIELD_LIMITS } from '~~/shared/utils/contactShared'

const { t } = useI18n({ useScope: 'global' })
const toast = useToast()

defineI18nRoute({
  paths: {
    es: '/contacto',
    en: '/contact',
    de: '/kontakt',
  },
})

usePageSeo('contactPage.seo.title', 'contactPage.seo.description')

const form = reactive<ContactFormData>({
  name: '',
  email: '',
  subject: '',
  message: '',
  website: '',
  startedAt: undefined,
})

const isSubmitting = ref(false)

onMounted(() => {
  form.startedAt = Date.now()
})

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
      body: event.data,
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
    form.startedAt = Date.now()
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
  <section :aria-label="t('contactPage.title')" class="section-enter">
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
        <UForm
          :schema="contactFormSchema"
          :state="form"
          class="space-y-6"
          aria-describedby="form-description"
          @submit="onSubmit"
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

          <!-- Name -->
          <UFormField name="name" :label="t('contactPage.form.name') + ' *'">
            <UInput
              id="contact-name"
              v-model="form.name"
              name="name"
              type="text"
              :placeholder="t('contactPage.form.namePlaceholder')"
              autocomplete="name"
              :maxlength="CONTACT_FIELD_LIMITS.name.max"
              :disabled="isSubmitting"
              class="w-full"
            />
          </UFormField>

          <!-- Email -->
          <UFormField name="email" :label="t('contactPage.form.email') + ' *'">
            <UInput
              id="contact-email"
              v-model="form.email"
              name="email"
              type="email"
              :placeholder="t('contactPage.form.emailPlaceholder')"
              autocomplete="email"
              inputmode="email"
              :maxlength="CONTACT_FIELD_LIMITS.emailMax"
              :disabled="isSubmitting"
              class="w-full"
            />
          </UFormField>

          <!-- Subject -->
          <UFormField name="subject" :label="t('contactPage.form.subject') + ' *'">
            <UInput
              id="contact-subject"
              v-model="form.subject"
              name="subject"
              type="text"
              :placeholder="t('contactPage.form.subjectPlaceholder')"
              autocomplete="off"
              :maxlength="CONTACT_FIELD_LIMITS.subject.max"
              :disabled="isSubmitting"
              class="w-full"
            />
          </UFormField>

          <!-- Message -->
          <UFormField name="message" :label="t('contactPage.form.message') + ' *'">
            <UTextarea
              id="contact-message"
              v-model="form.message"
              name="message"
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
                aria-live="polite"
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
        </UForm>
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
