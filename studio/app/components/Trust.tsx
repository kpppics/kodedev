import Icon from './Icon'

const PILLARS: { icon: React.ComponentProps<typeof Icon>['name']; title: string; body: string }[] = [
  {
    icon: 'lock',
    title: 'Your data, never trained on',
    body: 'Inputs and outputs are never used to train any model — yours or ours. 30-day retention, deletable on request, zero on enterprise.',
  },
  {
    icon: 'shield',
    title: 'Compliance you can hand to legal',
    body: 'ISO 27001, SOC 2 Type II, GDPR DPA, UK DPA. Audit logs on every workspace. SSO and SCIM on Scale and above.',
  },
  {
    icon: 'globe',
    title: 'Run where your users live',
    body: 'UK (lhr1), EU (fra1), US (iad1) regions. Pin a workspace, route by request, or run dedicated capacity in your VPC.',
  },
  {
    icon: 'cpu',
    title: 'Scale without surprise',
    body: 'Per-key budgets, hard caps, rate-limit shaping and provisioned throughput. Webhooks at 50/80/100% utilisation.',
  },
  {
    icon: 'graph',
    title: 'Observability built-in',
    body: 'Per-prompt logs, evals, A/B routing, prompt versioning, drift alerts. Or pipe everything to Datadog & OpenTelemetry.',
  },
  {
    icon: 'layers',
    title: 'Bring your own keys (BYOK)',
    body: 'Use your OpenAI, Anthropic, Google or Bedrock keys for any model — billed at cost, governed in our workspace.',
  },
]

export default function Trust() {
  return (
    <section className="relative py-24 md:py-32 bg-white/[0.015] border-y border-white/5">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-3 gap-10 items-start">
          <div>
            <p className="text-xs font-semibold tracking-[0.25em] uppercase text-emerald-300">Trust & control</p>
            <h2 className="font-display mt-3 text-3xl md:text-4xl font-bold tracking-tight">
              Built for production. <span className="text-prism">Audited for serious teams.</span>
            </h2>
            <p className="mt-5 text-text-muted">
              Six things that matter once you’re past the demo.
            </p>
          </div>

          <div className="md:col-span-2 grid sm:grid-cols-2 gap-5">
            {PILLARS.map(p => (
              <div key={p.title} className="card-glass p-5">
                <span className="inline-flex h-9 w-9 rounded-lg bg-emerald-500/15 border border-emerald-400/30 text-emerald-300 grid place-items-center">
                  <Icon name={p.icon} size={16} />
                </span>
                <h3 className="font-display mt-3 font-semibold">{p.title}</h3>
                <p className="mt-1.5 text-sm text-text-muted">{p.body}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
