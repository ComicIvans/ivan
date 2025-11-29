<script setup lang="ts">
const { t } = useI18n()
</script>

<template>
  <article
    class="contact-card card-border card mx-auto mt-3 h-fit min-w-fit bg-base-100 transition-shadow hover:shadow-lg"
    aria-labelledby="contact-title"
  >
    <div class="card-body items-center gap-4 text-center">
      <h2 id="contact-title" class="card-title gap-2 text-2xl">
        <Icon name="tabler:address-book" class="h-7 w-7 text-primary" aria-hidden="true" />
        {{ t('contact.title') }}
      </h2>
      <address class="flex flex-col gap-3 not-italic">
        <a
          class="btn btn-ghost justify-start gap-3 font-normal"
          href="tel:+34744481721"
          :aria-label="t('contact.phoneLabel')"
        >
          <Icon name="tabler:phone" class="h-6 w-6 text-primary" aria-hidden="true" />
          {{ t('contact.phone') }}
        </a>
        <a
          class="btn btn-ghost justify-start gap-3 font-normal"
          href="mailto:isalidocobo@gmail.com"
          :aria-label="t('contact.emailLabel')"
        >
          <Icon name="tabler:mail" class="h-6 w-6 text-primary" aria-hidden="true" />
          isalidocobo@gmail.com
        </a>
        <a
          class="btn btn-ghost justify-start gap-3 font-normal"
          href="https://www.linkedin.com/in/ivansalidocobo/"
          target="_blank"
          rel="noopener noreferrer"
          :aria-label="t('contact.linkedinLabel')"
        >
          <Icon name="tabler:brand-linkedin" class="h-6 w-6 text-primary" aria-hidden="true" />
          Iván Salido Cobo
          <Icon name="tabler:external-link" class="h-4 w-4 opacity-60" aria-hidden="true" />
        </a>
      </address>
    </div>
  </article>
</template>

<style scoped>
/* Texto más grande en desktop (hover capability) */
@media (hover: hover) {
  .contact-card {
    font-size: 1.125rem;
  }
}
</style>
