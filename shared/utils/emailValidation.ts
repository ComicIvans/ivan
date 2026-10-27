export const EMAIL_MAX_LENGTH = 254

// Deliberately loose so internationalised addresses (josé@müller.de) pass,
// but without whitespace, control characters or the separators and quotes
// that would turn the Reply-To header into a list or a display name.
const EMAIL_CHAR = String.raw`[^\s\p{Cc}@,;:<>()[\]\\"]`
// The same set without the dot: one domain label.
const DOMAIN_LABEL_CHAR = String.raw`[^\s\p{Cc}@,;:<>()[\]\\".]`

// The domain is dot-separated non-empty labels, so there is exactly one way
// to split it and matching stays linear in the input length. (A domain part
// whose characters may include the dot can be split at every dot, and a
// failing match then backtracks quadratically.)
export const EMAIL_PATTERN = new RegExp(
  `^${EMAIL_CHAR}+@(?:${DOMAIN_LABEL_CHAR}+\\.)+${DOMAIN_LABEL_CHAR}+$`,
  'u'
)
