export default function ContributorPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <h1 className="font-display text-3xl font-bold">Contributor agreement</h1>
      <p className="text-mute mt-2 text-sm">Last updated: April 2026</p>
      <div className="space-y-4 text-sm text-mute mt-6 leading-relaxed">
        <p>By submitting content to Capture Press you confirm that:</p>
        <ul className="list-disc pl-5 space-y-2">
          <li>You captured the content yourself, or have full rights to license it.</li>
          <li>You did not endanger yourself or anyone else to capture it.</li>
          <li>You did not trespass, harass or break the law to capture it.</li>
          <li>The content is unaltered and accurately represents what you saw.</li>
          <li>You understand Capture Press may decline to license your content.</li>
        </ul>
        <p>You retain copyright. We license, you get paid 70% of every sale, and rights revert after the agreed exclusivity period.</p>
      </div>
    </div>
  )
}
