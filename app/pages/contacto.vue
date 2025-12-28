<script setup lang="ts">
const { t } = useI18n()
const toast = useToast()

useSeoMeta({
  title: () => t('contactPage.seo.title'),
  description: () => t('contactPage.seo.description'),
})

// Form state
const form = reactive({
  name: '',
  email: '',
  subject: '',
  message: '',
  website: '', // Honeypot field
})

// Track which fields have been touched (user interacted with them)
const touched = reactive({
  name: false,
  email: false,
  subject: false,
  message: false,
})

const isSubmitting = ref(false)
const formSubmitted = ref(false)

// Validation rules
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

// Check if field should show error (touched or form submitted)
function shouldShowError(field: keyof typeof touched): boolean {
  return (touched[field] || formSubmitted.value) && !validations.value[field].valid
}

// Get error message for a field
function getFieldError(field: keyof typeof touched): string | undefined {
  return shouldShowError(field) ? validations.value[field].error : undefined
}

const isFormValid = computed(() => {
  return Object.values(validations.value).every((v) => v.valid)
})

async function handleSubmit() {
  formSubmitted.value = true

  if (!isFormValid.value || isSubmitting.value) {
    // Focus the first invalid field
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

    // Reset form
    form.name = ''
    form.email = ''
    form.subject = ''
    form.message = ''
    formSubmitted.value = false
    Object.keys(touched).forEach((key) => (touched[key as keyof typeof touched] = false))
  } catch (error: unknown) {
    // FetchError has the message in data.message or statusMessage
    const fetchError = error as {
      data?: { message?: string }
      statusMessage?: string
      message?: string
    }
    const errorMsg =
      fetchError.data?.message ||
      fetchError.statusMessage ||
      fetchError.message ||
      t('contactPage.form.errorGeneric')
    toast.add({
      title: errorMsg,
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
        <form class="space-y-6" @submit.prevent="handleSubmit" aria-describedby="form-description">
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
              type="text"
              :placeholder="t('contactPage.form.namePlaceholder')"
              required
              :disabled="isSubmitting"
              :color="shouldShowError('name') ? 'error' : undefined"
              class="w-full"
              @blur="touched.name = true"
            />
          </UFormField>

          <!-- Email -->
          <UFormField :label="t('contactPage.form.email') + ' *'" :error="getFieldError('email')">
            <UInput
              id="contact-email"
              v-model="form.email"
              type="email"
              :placeholder="t('contactPage.form.emailPlaceholder')"
              required
              :disabled="isSubmitting"
              :color="shouldShowError('email') ? 'error' : undefined"
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
              type="text"
              :placeholder="t('contactPage.form.subjectPlaceholder')"
              required
              :disabled="isSubmitting"
              :color="shouldShowError('subject') ? 'error' : undefined"
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
              :placeholder="t('contactPage.form.messagePlaceholder')"
              :rows="5"
              required
              :disabled="isSubmitting"
              :color="shouldShowError('message') ? 'error' : undefined"
              class="w-full"
              @blur="touched.message = true"
            />
            <template #hint>
              <span :class="form.message.trim().length < 10 ? 'text-error' : 'text-muted'">
                {{ form.message.trim().length }}/5000
              </span>
            </template>
          </UFormField>

          <!-- Submit Button -->
          <UButton
            type="submit"
            color="primary"
            block
            :loading="isSubmitting"
            :disabled="!isFormValid || isSubmitting"
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
            to="https://www.linkedin.com/in/ivansalidocobo/"
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
            to="https://www.instagram.com/ivansalidocobo/"
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
