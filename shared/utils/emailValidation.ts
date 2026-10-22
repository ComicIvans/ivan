export const EMAIL_MAX_LENGTH = 254

// Deliberately loose so internationalised addresses (josé@müller.de) pass,
// but without whitespace, control characters or the separators and quotes
// that would turn the Reply-To header into a list or a display name.
const EMAIL_CHAR = String.raw`[^\s\p{Cc}@,;:<>()[\]\\"]`
export const EMAIL_PATTERN = new RegExp(`^${EMAIL_CHAR}+@${EMAIL_CHAR}+\\.${EMAIL_CHAR}+$`, 'u')
