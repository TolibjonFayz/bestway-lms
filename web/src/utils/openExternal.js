/* window.open is blocked by several mobile and in-app browsers even from a
   genuine click — a synthetic <a target="_blank"> click is treated as
   ordinary navigation instead of a JS-initiated popup and gets through more
   reliably. */
export function openExternal(url) {
  const link = document.createElement('a')
  link.href = url
  link.target = '_blank'
  link.rel = 'noopener noreferrer'
  document.body.appendChild(link)
  link.click()
  link.remove()
}
