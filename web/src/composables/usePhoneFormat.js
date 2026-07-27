/* Uzbek mobile numbers are always 9 digits after the +998 country code.
   The kit stores the raw digits and only formats on the way to the screen, so
   stores and the API never have to unpick a mask. */

export const PHONE_DIGITS = 9

const PATTERNS = {
  /* Matches the design system mockup: "90 123 45 67" */
  spaced: [2, 3, 2, 2],
  /* Matches the build brief: "(90) 123-45-67" */
  parens: [2, 3, 2, 2],
}

export function usePhoneFormat() {
  function onlyDigits(value) {
    return String(value ?? '')
      .replace(/\D/g, '')
      .slice(0, PHONE_DIGITS)
  }

  function format(value, style = 'spaced') {
    const digits = onlyDigits(value)
    if (!digits) return ''

    const groups = []
    let cursor = 0
    for (const size of PATTERNS[style] ?? PATTERNS.spaced) {
      if (cursor >= digits.length) break
      groups.push(digits.slice(cursor, cursor + size))
      cursor += size
    }

    if (style === 'parens') {
      const [operator, ...rest] = groups
      const head = digits.length > 2 ? `(${operator})` : `(${operator}`
      return rest.length ? `${head} ${rest.join('-')}` : head
    }
    return groups.join(' ')
  }

  /* Where the caret belongs once `count` digits sit to its left. */
  function caretAfterDigits(formatted, count) {
    if (count <= 0) return 0
    let seen = 0
    for (let i = 0; i < formatted.length; i += 1) {
      if (/\d/.test(formatted[i])) {
        seen += 1
        if (seen === count) return i + 1
      }
    }
    return formatted.length
  }

  /* How many digits precede `caret` in the raw input text. */
  function digitsBeforeCaret(text, caret) {
    return (text.slice(0, caret).match(/\d/g) ?? []).length
  }

  function isComplete(value) {
    return onlyDigits(value).length === PHONE_DIGITS
  }

  return { onlyDigits, format, caretAfterDigits, digitsBeforeCaret, isComplete }
}
