import { Suspense, lazy } from 'react'
import { usePageMeta } from '../hooks/usePageMeta'
import { ScrollReveal } from '../components/ScrollReveal'
import { SectionDivider } from '../components/SectionDivider'

const FAQ = lazy(() => import('../components/FAQ').then(m => ({ default: m.FAQ })))
const Pricing = lazy(() => import('../components/Pricing').then(m => ({ default: m.Pricing })))

function SectionFallback() {
  return <div className="py-24" />
}

export function FAQPage() {
  usePageMeta({
    title: 'FAQ',
    description: 'Frequently asked questions about KinBot. Pricing, requirements, and common use cases.',
  })

  return (
    <div className="pt-24">
      <Suspense fallback={<SectionFallback />}>
        <ScrollReveal><FAQ /></ScrollReveal>
      </Suspense>
      <SectionDivider variant="glow" />
      <Suspense fallback={<SectionFallback />}>
        <ScrollReveal><Pricing /></ScrollReveal>
      </Suspense>
    </div>
  )
}
