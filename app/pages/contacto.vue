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

const isSubmitting = ref(false)

const isFormValid = computed(() => {
  return (
    form.name.trim() !== '' &&
    form.email.trim() !== '' &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email) &&
    form.subject.trim() !== '' &&
    form.message.trim() !== ''
  )
})

async function handleSubmit() {
  if (!isFormValid.value || isSubmitting.value) return

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
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : t('contactPage.form.errorGeneric')
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
          <UFormField :label="t('contactPage.form.name') + ' *'">
            <UInput
              v-model="form.name"
              type="text"
              :placeholder="t('contactPage.form.namePlaceholder')"
              required
              :disabled="isSubmitting"
              class="w-full"
            />
          </UFormField>

          <!-- Email -->
          <UFormField :label="t('contactPage.form.email') + ' *'">
            <UInput
              v-model="form.email"
              type="email"
              :placeholder="t('contactPage.form.emailPlaceholder')"
              required
              :disabled="isSubmitting"
              class="w-full"
            />
          </UFormField>

          <!-- Subject -->
          <UFormField :label="t('contactPage.form.subject') + ' *'">
            <UInput
              v-model="form.subject"
              type="text"
              :placeholder="t('contactPage.form.subjectPlaceholder')"
              required
              :disabled="isSubmitting"
              class="w-full"
            />
          </UFormField>

          <!-- Message -->
          <UFormField :label="t('contactPage.form.message') + ' *'">
            <UTextarea
              v-model="form.message"
              :placeholder="t('contactPage.form.messagePlaceholder')"
              :rows="5"
              required
              :disabled="isSubmitting"
              class="w-full"
            />
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
