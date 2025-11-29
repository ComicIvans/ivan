<script setup lang="ts">
const { t } = useI18n();
const { width, height } = useWindowSize();
const isMobile = computed(() => width.value < height.value);
</script>

<template>
  <article
    class="card card-border bg-base-100 min-w-fit h-fit mx-auto mt-3 transition-shadow hover:shadow-lg"
    :class="{ 'text-lg': !isMobile }"
    aria-labelledby="contact-title"
  >
    <div class="card-body items-center text-center gap-4">
      <h2 id="contact-title" class="card-title text-2xl gap-2">
        <Icon
          name="tabler:address-book"
          class="w-7 h-7 text-primary"
          aria-hidden="true"
        />
        {{ t("contact.title") }}
      </h2>
      <address class="flex flex-col gap-3 not-italic">
        <a
          class="btn btn-ghost justify-start gap-3 font-normal"
          href="tel:+34744481721"
          :aria-label="t('contact.phoneLabel')"
        >
          <Icon
            name="tabler:phone"
            class="w-6 h-6 text-primary"
            aria-hidden="true"
          />
          {{ t("contact.phone") }}
        </a>
        <a
          class="btn btn-ghost justify-start gap-3 font-normal"
          href="mailto:isalidocobo@gmail.com"
          :aria-label="t('contact.emailLabel')"
        >
          <Icon
            name="tabler:mail"
            class="w-6 h-6 text-primary"
            aria-hidden="true"
          />
          isalidocobo@gmail.com
        </a>
        <a
          class="btn btn-ghost justify-start gap-3 font-normal"
          href="https://www.linkedin.com/in/ivansalidocobo/"
          target="_blank"
          rel="noopener noreferrer"
          :aria-label="t('contact.linkedinLabel')"
        >
          <Icon
            name="tabler:brand-linkedin"
            class="w-6 h-6 text-primary"
            aria-hidden="true"
          />
          Iván Salido Cobo
          <Icon
            name="tabler:external-link"
            class="w-4 h-4 opacity-60"
            aria-hidden="true"
          />
        </a>
      </address>
    </div>
  </article>
</template>
