import type { Metadata } from 'next'
import ServicePage from '../components/ServicePage'
import { CAPABILITIES } from '../lib/site'

export const metadata: Metadata = {
  title: 'iOS app development & App Store submission, UK',
  description:
    'Native iOS apps built with React Native and Expo, tested through TestFlight and taken all the way through App Store review, including privacy answers, screenshots and over-the-air updates.',
  alternates: { canonical: '/ios-apps' },
}

const cap = CAPABILITIES.find(c => c.slug === 'ios-apps')!

export default function IosApps() {
  return (
    <ServicePage
      eyebrow="iOS apps"
      title={
        <>
          Through Apple review, not just <em>compiled</em>.
        </>
      }
      intro={cap.blurb}
      bullets={cap.bullets}
      blocksTitle="What shipping an iOS app really involves"
      blocksIntro="Anyone can produce a build. The work that decides whether your app ever reaches a customer is below, and it is all included."
      blocks={[
        ['Apple Developer setup', 'Enrolment, team roles, certificates and provisioning done properly once, in your name, so it does not bite later.'],
        ['TestFlight testing', 'Real builds on real phones for you and your testers, with feedback coming back before the public sees anything.'],
        ['App Store listing', 'Name, subtitle, keywords, description and screenshots at every size Apple demands, written to be found in search.'],
        ['Privacy and permissions', 'Data-collection answers, tracking disclosures and permission prompts that match what the app actually does.'],
        ['Review responses', 'When Apple rejects something, we read the guideline, fix the real cause and reply. Guideline 5.1.1 and friends are familiar territory.'],
        ['Over-the-air updates', 'Copy fixes and bug fixes reach users in minutes through Expo updates, instead of another week in review.'],
        ['Native device features', 'Camera, photo library, push notifications, Sign in with Apple, offline behaviour, and hardware work such as tethering to a camera.'],
        ['Crash and error reporting', 'You find out about a broken screen from us, not from a one-star review.'],
        ['Android when you want it', 'The same codebase goes to Google Play, so the second platform is a fraction of the first.'],
      ]}
      proof={['PressApp', 'Capture Time Press']}
      proofNote="Two of our own products have native apps in the Apple pipeline right now: a news marketplace with Sign in with Apple and push, and an event app that tethers an iPad to a DSLR. Everything we learned the hard way there is included in your build."
      faqs={[
        {
          q: 'Will my app definitely be accepted?',
          a: 'Nobody honest promises that. What we do is build to the guidelines that actually cause rejections (account deletion, privacy answers, sign-in options, purchase rules) and handle the back-and-forth if review pushes back.',
        },
        {
          q: 'How long does App Store review take?',
          a: 'Usually 24 to 48 hours per submission once the listing is complete. Plan for a couple of rounds on a first release; that is normal, not a failure.',
        },
        {
          q: 'Do I need an Apple Developer account?',
          a: 'Yes, and it should be in your name, and it costs 99 US dollars a year. We set it up with you and use it correctly; you keep control of the app forever.',
        },
        {
          q: 'React Native or fully native Swift?',
          a: 'React Native with Expo for almost everything: one codebase, faster to ship, over-the-air updates, and native modules where a feature genuinely needs them. If a project truly needs pure Swift, we will say so instead of forcing the tool.',
        },
        {
          q: 'Can you take over an app someone else built?',
          a: 'Often, yes. Send the repository and the App Store Connect access and you will get an honest verdict on whether it is worth continuing or restarting.',
        },
      ]}
      ctaTitle="Tell me what the app has to do on day one."
    />
  )
}
