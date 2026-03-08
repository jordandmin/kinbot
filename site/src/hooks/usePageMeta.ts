import { useEffect } from 'react'

const BASE_TITLE = 'KinBot'
const BASE_URL = 'https://marlburrow.github.io/kinbot/'

interface PageMeta {
  title: string
  description?: string
}

/**
 * Set document title and meta description per page.
 * Restores defaults on unmount.
 */
export function usePageMeta({ title, description }: PageMeta) {
  useEffect(() => {
    const prev = document.title
    document.title = title === BASE_TITLE ? title : `${title} | ${BASE_TITLE}`

    const metaDesc = document.querySelector('meta[name="description"]')
    const prevDesc = metaDesc?.getAttribute('content') ?? ''
    if (description && metaDesc) {
      metaDesc.setAttribute('content', description)
    }

    const ogTitle = document.querySelector('meta[property="og:title"]')
    const prevOgTitle = ogTitle?.getAttribute('content') ?? ''
    if (ogTitle) ogTitle.setAttribute('content', document.title)

    const twitterTitle = document.querySelector('meta[name="twitter:title"]')
    const prevTwitterTitle = twitterTitle?.getAttribute('content') ?? ''
    if (twitterTitle) twitterTitle.setAttribute('content', document.title)

    return () => {
      document.title = prev
      if (metaDesc) metaDesc.setAttribute('content', prevDesc)
      if (ogTitle) ogTitle.setAttribute('content', prevOgTitle)
      if (twitterTitle) twitterTitle.setAttribute('content', prevTwitterTitle)
    }
  }, [title, description])
}
