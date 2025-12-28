<script setup lang="ts">
const { t } = useI18n()

// SEO meta dinámico según idioma
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
  website: '', // Honeypot field - bots will fill this
})

const isSubmitting = ref(false)
const submitStatus = ref<'idle' | 'success' | 'error'>('idle')
const errorMessage = ref('')

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
  submitStatus.value = 'idle'
  errorMessage.value = ''

  try {
    await $fetch('/api/contact', {
      method: 'POST',
      body: {
        name: form.name.trim(),
        email: form.email.trim(),
        subject: form.subject.trim(),
        message: form.message.trim(),
        website: form.website, // Honeypot
      },
    })

    submitStatus.value = 'success'
    // Reset form
    form.name = ''
    form.email = ''
    form.subject = ''
    form.message = ''
  } catch (error: unknown) {
    submitStatus.value = 'error'
    if (error instanceof Error) {
      errorMessage.value = error.message
    } else {
      errorMessage.value = t('contactPage.form.errorGeneric')
    }
  } finally {
    isSubmitting.value = false
  }
}

function resetStatus() {
  submitStatus.value = 'idle'
  errorMessage.value = ''
}
</script>

<template>
  <section role="region" :aria-label="t('contactPage.title')" class="section-enter">
    <div class="mx-auto max-w-2xl">
      <!-- Header -->
      <div class="mb-8 text-center">
        <h1 class="text-3xl font-bold text-primary sm:text-4xl">
          {{ t('contactPage.title') }}
        </h1>
        <p class="mt-4 text-base-content/80">
          {{ t('contactPage.subtitle') }}
        </p>
      </div>

      <!-- Success Alert -->
      <div v-if="submitStatus === 'success'" class="alert alert-success mb-6 shadow-lg">
        <Icon name="tabler:check" class="size-6" />
        <span>{{ t('contactPage.form.success') }}</span>
        <button class="btn btn-ghost btn-sm" @click="resetStatus">
          <Icon name="tabler:x" class="size-4" />
        </button>
      </div>

      <!-- Error Alert -->
      <div v-if="submitStatus === 'error'" class="alert alert-error mb-6 shadow-lg">
        <Icon name="tabler:alert-circle" class="size-6" />
        <span>{{ errorMessage || t('contactPage.form.errorGeneric') }}</span>
        <button class="btn btn-ghost btn-sm" @click="resetStatus">
          <Icon name="tabler:x" class="size-4" />
        </button>
      </div>

      <!-- Contact Form -->
      <form class="card-border card bg-base-100 shadow-lg" @submit.prevent="handleSubmit">
        <div class="card-body gap-6">
          <!-- Honeypot field - hidden from users, bots will fill it -->
          <div class="absolute -left-[9999px] opacity-0" aria-hidden="true">
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
          <div class="form-control">
            <label class="label" for="name">
              <span class="label-text font-medium">{{ t('contactPage.form.name') }} *</span>
            </label>
            <input
              id="name"
              v-model="form.name"
              type="text"
              :placeholder="t('contactPage.form.namePlaceholder')"
              class="input input-bordered w-full"
              required
              :disabled="isSubmitting"
            />
          </div>

          <!-- Email -->
          <div class="form-control">
            <label class="label" for="email">
              <span class="label-text font-medium">{{ t('contactPage.form.email') }} *</span>
            </label>
            <input
              id="email"
              v-model="form.email"
              type="email"
              :placeholder="t('contactPage.form.emailPlaceholder')"
              class="input input-bordered w-full"
              required
              :disabled="isSubmitting"
            />
          </div>

          <!-- Subject -->
          <div class="form-control">
            <label class="label" for="subject">
              <span class="label-text font-medium">{{ t('contactPage.form.subject') }} *</span>
            </label>
            <input
              id="subject"
              v-model="form.subject"
              type="text"
              :placeholder="t('contactPage.form.subjectPlaceholder')"
              class="input input-bordered w-full"
              required
              :disabled="isSubmitting"
            />
          </div>

          <!-- Message -->
          <div class="form-control">
            <label class="label" for="message">
              <span class="label-text font-medium">{{ t('contactPage.form.message') }} *</span>
            </label>
            <textarea
              id="message"
              v-model="form.message"
              :placeholder="t('contactPage.form.messagePlaceholder')"
              class="textarea textarea-bordered min-h-32 w-full"
              rows="5"
              required
              :disabled="isSubmitting"
            ></textarea>
          </div>

          <!-- Submit Button -->
          <div class="card-actions mt-2">
            <button
              type="submit"
              class="btn btn-primary w-full"
              :disabled="!isFormValid || isSubmitting"
            >
              <span v-if="isSubmitting" class="loading loading-spinner loading-sm"></span>
              <Icon v-else name="tabler:send" class="size-5" />
              {{ isSubmitting ? t('contactPage.form.sending') : t('contactPage.form.submit') }}
            </button>
          </div>

          <!-- Privacy Note -->
          <p class="text-center text-sm text-base-content/60">
            {{ t('contactPage.form.privacyNote') }}
          </p>
        </div>
      </form>

      <!-- Alternative Contact -->
      <div class="mt-8 text-center">
        <p class="text-base-content/70">
          {{ t('contactPage.alternative') }}
        </p>
        <div class="mt-4 flex flex-wrap justify-center gap-4">
          <a
            href="https://www.linkedin.com/in/ivansalidocobo/"
            target="_blank"
            rel="noopener noreferrer"
            class="btn btn-outline"
          >
            <Icon name="tabler:brand-linkedin" class="size-5" />
            LinkedIn
          </a>
          <a
            href="https://www.instagram.com/ivansalidocobo/"
            target="_blank"
            rel="noopener noreferrer"
            class="btn btn-outline"
          >
            <Icon name="tabler:brand-instagram" class="size-5" />
            Instagram
          </a>
        </div>
      </div>
    </div>
  </section>
</template>
