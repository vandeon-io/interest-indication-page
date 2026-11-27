// components.jsx — Vandeon landing page components

// ── Terminal animation ──────────────────────────────────────────────────────
// A self-driving CLI that cycles through the deploy sequence.

const DEPLOY_SCRIPT = [
  { t: 0,    kind: 'prompt', text: 'vandeon deploy --env production' },
  { t: 700,  kind: 'info',   text: '→ resolving infrastructure manifest' },
  { t: 1100, kind: 'ok',     text: '  manifest.yaml · 3 services · 2 regions' },
  { t: 1700, kind: 'info',   text: '→ provisioning servers · region us-east' },
  { t: 2300, kind: 'tree',   text: '  ├── network · private · ready' },
  { t: 2600, kind: 'tree',   text: '  ├── nodes · 2× 4gb · ready' },
  { t: 2900, kind: 'tree',   text: '  └── database · postgres-16 · ready' },
  { t: 3500, kind: 'info',   text: '→ deploying api@a91c2fe' },
  { t: 3900, kind: 'prog',   text: '  [████████████████████] 100%  12.4 MB/s' },
  { t: 4400, kind: 'ok',     text: '✓ api healthy · 2/2 · 214ms' },
  { t: 4800, kind: 'ok',     text: '✓ worker healthy · 1/1 · 89ms' },
  { t: 5100, kind: 'ok',     text: '✓ web healthy · 2/2 · 66ms' },
  { t: 5700, kind: 'done',   text: 'deploy complete · 00:47 · https://app.vandeon.io' },
];

const TOTAL_DURATION = 7200;

function TerminalDemo({ accent }) {
  const [tick, setTick] = React.useState(0);
  const [cycle, setCycle] = React.useState(0);

  React.useEffect(() => {
    let raf;
    const start = performance.now();
    const loop = (now) => {
      const elapsed = (now - start) % TOTAL_DURATION;
      const c = Math.floor((now - start) / TOTAL_DURATION);
      setCycle(c);
      setTick(elapsed);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  const visible = DEPLOY_SCRIPT.filter((l) => l.t <= tick);
  const elapsedSec = (tick / 1000).toFixed(2);

  const colorFor = (kind) => {
    if (kind === 'ok' || kind === 'done') return accent;
    if (kind === 'info') return 'rgba(255,255,255,0.92)';
    if (kind === 'tree') return 'rgba(255,255,255,0.6)';
    if (kind === 'prog') return 'rgba(255,255,255,0.75)';
    if (kind === 'prompt') return 'rgba(255,255,255,0.95)';
    return 'rgba(255,255,255,0.8)';
  };

  return (
    <div className="term">
      <div className="term-chrome">
        <div className="term-dots">
          <span /><span /><span />
        </div>
        <div className="term-title">~/vandeon · zsh</div>
        <div className="term-clock">
          <span className="term-clock-dot" style={{ background: accent }} /> {elapsedSec}s
        </div>
      </div>
      <div className="term-body" key={cycle}>
        {visible.map((line, i) => (
          <div key={i} className="term-line" style={{ color: colorFor(line.kind) }}>
            {line.kind === 'prompt' && <span className="term-ps1" style={{ color: accent }}>$ </span>}
            {line.kind === 'done' && <span style={{ color: accent }}>◉ </span>}
            <span>{line.text}</span>
          </div>
        ))}
        <div className="term-cursor" style={{ background: accent }} />
      </div>
    </div>
  );
}

// ── Abstract graphic (alt hero layout) ──────────────────────────────────────
// A wireframe graph of nodes/edges deploying — pure geometry.

function NodeGraph({ accent }) {
  const [t, setT] = React.useState(0);
  React.useEffect(() => {
    let raf;
    const start = performance.now();
    const loop = (now) => {
      setT((now - start) / 1000);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  // Layout: source (left) → orchestrator (mid) → 3 provider groups (right)
  // Each provider group contains 2 server nodes so the graph reads as a real fleet.
  const SRC = { x: 70,  y: 220, label: 'git · main' };
  const ORC = { x: 260, y: 220, label: 'vandeon' };
  const providers = [
    { id: 'do',   x: 500, y: 96,  name: 'cluster a', region: 'us-east',
      servers: [
        { id: 'do-1', label: 'api-1',   y: 70,  status: 'ok' },
        { id: 'do-2', label: 'api-2',   y: 122, status: 'ok' },
      ],
    },
    { id: 'hz',   x: 500, y: 220, name: 'cluster b', region: 'eu-central',
      servers: [
        { id: 'hz-1', label: 'worker',  y: 194, status: 'deploy' },
        { id: 'hz-2', label: 'cache',   y: 246, status: 'ok' },
      ],
    },
    { id: 'vl',   x: 500, y: 344, name: 'cluster c', region: 'ap-south',
      servers: [
        { id: 'vl-1', label: 'edge-1',  y: 318, status: 'ok' },
        { id: 'vl-2', label: 'edge-2',  y: 370, status: 'ok' },
      ],
    },
  ];

  // All edges: src→orc, orc→each provider group
  const edges = [
    { from: SRC, to: ORC, phase: 0 },
    ...providers.map((p, i) => ({
      from: ORC,
      to: { x: p.x - 80, y: p.y },
      phase: i * 0.33,
    })),
  ];

  const dot = (x, y, r, color, opacity = 1) => (
    <circle cx={x} cy={y} r={r} fill={color} opacity={opacity} />
  );

  // Sparkline generator — seeded by server id so each is stable but different
  const sparkPath = (seed, w = 48, h = 12) => {
    const pts = [];
    for (let i = 0; i <= 12; i++) {
      const n = Math.sin(seed * 0.7 + i * 0.6 + t * 1.5) * 0.5
              + Math.sin(seed * 1.3 + i * 1.1) * 0.3;
      pts.push([i / 12 * w, h / 2 - n * h * 0.4]);
    }
    return pts.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' ');
  };

  return (
    <div className="console">
      <div className="console-chrome">
        <div className="console-tabs">
          <span className="console-tab console-tab--on">
            <span className="console-tab-dot" style={{ background: accent }} />
            infrastructure
          </span>
          <span className="console-tab">deployments</span>
          <span className="console-tab">logs</span>
          <span className="console-tab">costs</span>
        </div>
        <div className="console-meta">
          <span>fleet · 6 nodes</span>
          <span className="console-meta-sep">·</span>
          <span style={{ color: accent }}>● live</span>
        </div>
      </div>

      <svg viewBox="0 0 620 440" className="graph-svg" preserveAspectRatio="xMidYMid meet">
        <defs>
          <pattern id="grid-pat" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="620" height="440" fill="url(#grid-pat)" />

        {/* Provider group backdrops */}
        {providers.map((p) => (
          <g key={'bg-' + p.id}>
            <rect x={p.x - 10} y={p.y - 60} width="130" height="120" rx="4"
                  fill="rgba(255,255,255,0.015)"
                  stroke="rgba(255,255,255,0.1)" strokeWidth="0.5"
                  strokeDasharray="3 3" />
            <text x={p.x - 4} y={p.y - 44} fontSize="9"
                  fontFamily="'JetBrains Mono', monospace"
                  fill="rgba(255,255,255,0.45)" letterSpacing="0.08em">
              {p.name.toUpperCase()} · {p.region}
            </text>
          </g>
        ))}

        {/* Static edges */}
        {edges.map((e, i) => (
          <line key={'e-' + i} x1={e.from.x} y1={e.from.y} x2={e.to.x} y2={e.to.y}
                stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
        ))}
        {/* Orchestrator → individual servers (thinner) */}
        {providers.flatMap((p) =>
          p.servers.map((s) => (
            <line key={'se-' + s.id}
                  x1={p.x - 10} y1={p.y} x2={p.x + 24} y2={s.y}
                  stroke="rgba(255,255,255,0.08)" strokeWidth="0.5" />
          ))
        )}

        {/* Animated packets flowing along edges */}
        {edges.map((e, i) => {
          const dx = e.to.x - e.from.x, dy = e.to.y - e.from.y;
          const prog = ((t * 0.5 + e.phase) % 1);
          const px = e.from.x + dx * prog;
          const py = e.from.y + dy * prog;
          return (
            <g key={'pkt-' + i}>
              {dot(px, py, 3, accent)}
              {dot(px, py, 6, accent, 0.25)}
            </g>
          );
        })}

        {/* Source node */}
        <g>
          <circle cx={SRC.x} cy={SRC.y} r="22"
                  fill="rgba(10,10,10,0.95)"
                  stroke="rgba(255,255,255,0.25)" strokeWidth="0.5" />
          <text x={SRC.x} y={SRC.y + 4} fontSize="11" textAnchor="middle"
                fontFamily="'JetBrains Mono', monospace"
                fill="rgba(255,255,255,0.85)">git</text>
          <text x={SRC.x} y={SRC.y + 44} fontSize="9" textAnchor="middle"
                fontFamily="'JetBrains Mono', monospace"
                fill="rgba(255,255,255,0.4)">{SRC.label}</text>
        </g>

        {/* Orchestrator */}
        <g>
          <rect x={ORC.x - 40} y={ORC.y - 22} width="80" height="44" rx="3"
                fill="rgba(10,10,10,0.95)"
                stroke={accent} strokeWidth="1" />
          <circle cx={ORC.x - 26} cy={ORC.y} r="3" fill={accent}>
            <animate attributeName="opacity" values="1;0.3;1" dur="1.6s" repeatCount="indefinite" />
          </circle>
          <text x={ORC.x - 16} y={ORC.y + 4} fontSize="11"
                fontFamily="'JetBrains Mono', monospace"
                fill="rgba(255,255,255,0.95)" fontWeight="600">{ORC.label}</text>
          <text x={ORC.x} y={ORC.y + 42} fontSize="9" textAnchor="middle"
                fontFamily="'JetBrains Mono', monospace"
                fill="rgba(255,255,255,0.4)">orchestrator</text>
        </g>

        {/* Provider / server nodes */}
        {providers.flatMap((p) =>
          p.servers.map((s, i) => {
            const isDeploy = s.status === 'deploy';
            const cardX = p.x + 24, cardY = s.y - 13;
            const statusColor = isDeploy
              ? 'rgba(255,255,255,0.5)'
              : accent;
            return (
              <g key={s.id}>
                <rect x={cardX} y={cardY} width="96" height="26" rx="3"
                      fill="rgba(10,10,10,0.95)"
                      stroke="rgba(255,255,255,0.2)" strokeWidth="0.5" />
                {/* status LED */}
                <circle cx={cardX + 8} cy={s.y} r="3" fill={statusColor}>
                  {isDeploy && (
                    <animate attributeName="opacity" values="1;0.2;1"
                             dur="0.9s" repeatCount="indefinite" />
                  )}
                </circle>
                {/* label */}
                <text x={cardX + 16} y={s.y + 3.5} fontSize="10"
                      fontFamily="'JetBrains Mono', monospace"
                      fill="rgba(255,255,255,0.85)">{s.label}</text>
                {/* sparkline */}
                <g transform={`translate(${cardX + 54}, ${s.y - 6})`}>
                  <path d={sparkPath(cardX + cardY + i)}
                        fill="none" stroke={statusColor} strokeWidth="1"
                        opacity="0.7" />
                </g>
              </g>
            );
          })
        )}

        {/* Corner labels */}
        <text x="20" y="26" fontSize="9" fontFamily="'JetBrains Mono', monospace"
              fill="rgba(255,255,255,0.35)" letterSpacing="0.15em">
          VANDEON › FLEET
        </text>
        <text x="600" y="26" fontSize="9" fontFamily="'JetBrains Mono', monospace"
              fill="rgba(255,255,255,0.35)" letterSpacing="0.15em" textAnchor="end">
          {new Date().toISOString().slice(11, 19)} UTC
        </text>

        {/* Footer status line */}
        <line x1="20" y1="412" x2="600" y2="412"
              stroke="rgba(255,255,255,0.08)" strokeWidth="0.5" />
        <text x="20" y="428" fontSize="9" fontFamily="'JetBrains Mono', monospace"
              fill="rgba(255,255,255,0.45)">
          <tspan fill={accent}>●</tspan> 5 healthy
          <tspan dx="12" fill="rgba(255,255,255,0.45)">◐ 1 deploying</tspan>
          <tspan dx="12">· avg cpu 34%</tspan>
          <tspan dx="12">· p95 118ms</tspan>
        </text>
        <text x="600" y="428" fontSize="9" textAnchor="end"
              fontFamily="'JetBrains Mono', monospace"
              fill="rgba(255,255,255,0.35)">
          uptime 14d 06:22
        </text>
      </svg>
    </div>
  );
}

// ── Signup form ─────────────────────────────────────────────────────────────

const ROLES = ['Engineer', 'Lead / Staff', 'CTO / VPE', 'Founder', 'DevOps / SRE', 'Other'];

const LOOPS_FORM_URL = 'https://app.loops.so/api/newsletter-form/cmoe4inz50z3b0ixj7wdg4jgx';

function SignupForm({ accent, compact }) {
  const [step, setStep] = React.useState(0); // 0 = email, 1 = details, 2 = done
  const [f, setF] = React.useState({
    email: '', role: '', useCase: '', telegram: '',
  });
  const [touched, setTouched] = React.useState({});
  const [submitting, setSubmitting] = React.useState(false);
  const [submitErr, setSubmitErr] = React.useState('');
  const set = (k, v) => setF((p) => ({ ...p, [k]: v }));

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email);
  const step1Valid = f.role && f.useCase.trim().length >= 4;

  const advance = (e) => {
    e.preventDefault();
    setTouched({ ...touched, email: true });
    if (emailValid) setStep(1);
  };

  const submit = async (e) => {
    e.preventDefault();
    setTouched({ ...touched, role: true, useCase: true });
    if (!step1Valid || submitting) return;
    setSubmitting(true);
    setSubmitErr('');
    try {
      const body = new URLSearchParams();
      body.append('email', f.email);
      body.append('userGroup', f.role);
      body.append('useCase', f.useCase);
      if (f.telegram.trim()) body.append('telegram', f.telegram.trim());
      const res = await fetch(LOOPS_FORM_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: body.toString(),
      });
      if (!res.ok) {
        if (res.status === 429) throw new Error('too many requests · try again in a minute');
        throw new Error('signup failed · please retry');
      }
      setStep(2);
    } catch (err) {
      setSubmitErr(err.message || 'something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  if (step === 2) {
    const rawHandle = f.telegram.trim();
    const tgDisplay = rawHandle
      ? (rawHandle.startsWith('@') ? rawHandle : '@' + rawHandle)
      : '';
    return (
      <div className="signup signup--done">
        <div className="signup-check" style={{ borderColor: accent, color: accent }}>
          <svg viewBox="0 0 16 16" width="18" height="18">
            <path d="M3 8.5L6.5 12L13 5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="square" />
          </svg>
        </div>
        <div className="signup-done-body">
          <div className="signup-done-head">
            <span className="mono-label" style={{ color: accent }}>◉ confirmed</span>
            <span className="mono-dim">· {new Date().toISOString().slice(0,19).replace('T',' ')}</span>
          </div>
          <h3>You're on the list.</h3>
          <p>
            We'll reach out via <span className="mono">{f.email}</span>
            {tgDisplay ? <> or <span className="mono">{tgDisplay}</span></> : null}
            {' '}when early access opens. No marketing, no spam — just a heads-up and your API key.
          </p>
          <button type="button" className="btn-ghost"
                  onClick={() => { setStep(0); setF({email:'',role:'',useCase:'',telegram:''}); setTouched({}); setSubmitErr(''); }}>
            ← sign up another
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="signup">
      <div className="signup-head">
        <span className="mono-label">$ vandeon waitlist</span>
        <span className="mono-dim">step {step + 1}/2</span>
      </div>

      {step === 0 && (
        <form className="signup-body" onSubmit={advance}>
          <label className="field field--inline">
            <span className="field-lbl">email</span>
            <input type="email" autoFocus value={f.email}
                   placeholder="you@company.dev"
                   onChange={(e) => set('email', e.target.value)}
                   onBlur={() => setTouched({ ...touched, email: true })}
                   data-invalid={touched.email && !emailValid ? '1' : '0'} />
            <button type="submit" className="btn-primary"
                    style={{ background: accent, color: '#0a0a0a' }}>
              next →
            </button>
          </label>
          {touched.email && !emailValid && f.email.length > 0 && (
            <div className="field-err">not a valid email</div>
          )}
          <div className="signup-foot">
            <span className="mono-dim">we'll never share your email · unsubscribe anytime</span>
          </div>
        </form>
      )}

      {step === 1 && (
        <form className="signup-body" onSubmit={submit}>
          <div className="field-grid">
            <label className="field field--full">
              <span className="field-lbl">role</span>
              <div className="chip-row">
                {ROLES.map((r) => (
                  <button key={r} type="button"
                          className={'chip' + (f.role === r ? ' chip--on' : '')}
                          style={f.role === r ? { borderColor: accent, color: accent } : null}
                          onClick={() => { set('role', r); setTouched({ ...touched, role: true }); }}>
                    {r}
                  </button>
                ))}
              </div>
            </label>
            <label className="field field--full">
              <span className="field-lbl">
                use case <span className="mono-dim">— what would you automate first?</span>
              </span>
              <textarea rows="2" value={f.useCase}
                        placeholder="e.g. spin up staging envs for every PR"
                        onChange={(e) => set('useCase', e.target.value)}
                        onBlur={() => setTouched({ ...touched, useCase: true })}
                        data-invalid={touched.useCase && f.useCase.trim().length < 4 ? '1' : '0'} />
            </label>
            <label className="field field--full">
              <span className="field-lbl">
                telegram <span className="mono-dim">— optional, for faster updates</span>
              </span>
              <input type="text" value={f.telegram}
                     placeholder="@yourhandle"
                     onChange={(e) => set('telegram', e.target.value)} />
            </label>
          </div>
          {submitErr && <div className="field-err" style={{ marginTop: 12 }}>{submitErr}</div>}
          <div className="signup-actions">
            <button type="button" className="btn-ghost" onClick={() => setStep(0)} disabled={submitting}>
              ← back
            </button>
            <button type="submit" className="btn-primary"
                    style={{ background: accent, color: '#0a0a0a' }}
                    disabled={!step1Valid || submitting}>
              {submitting ? 'submitting…' : 'join waitlist →'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

// ── Feature block ───────────────────────────────────────────────────────────

const FEATURES = [
  {
    id: '01',
    title: 'One console for every server',
    body: 'Wire up your servers once. Vandeon gives you a single, consistent place to provision, deploy, and watch them — no console-hopping, no shell scripts pinned to a wiki.',
    ascii: [
      '┌─ fleet ────────────────────────────────┐',
      '│ cluster-a   cluster-b   cluster-c │',
      '│    ◉           ◉            ○     │',
      '└────────────────────────────────┘',
    ],
  },
  {
    id: '02',
    title: 'Smarter deploy decisions',
    body: 'Make fast, effective release calls — or let Vandeon ship for you, with safe fallbacks the moment health drifts.',
    ascii: [
      'main ─●─●─●─●─●─▶ prod',
      '         ▲',
      '         └─ guarded',
    ],
  },
  {
    id: '03',
    title: 'Early signals, not late pages',
    body: 'Get alerts the moment something needs a decision — with the action to take, ranked by urgency. Catch the slow drift before it turns into a 2 a.m. page.',
    ascii: [
      '⚠ disk · api-2 · 87%    → resize',
      '↑ p95  · worker · +12%  → inspect',
      'ℹ cert · 14d left       → renew',
    ],
  },
  {
    id: '04',
    title: 'Hyperscaler reach, without the bill',
    body: 'Multi-region rollouts, auto-scaling, edge routing — the capabilities of a hyperscaler stack, at a fraction of the cost and operational tax.',
    ascii: [
      'hyperscaler  $$$$ ████████',
      'vandeon      $    █▏      ',
      'parity   ● ● ● ● ● ● ● ●  ',
    ],
  },
  {
    id: '05',
    title: 'Observability, built in',
    body: 'Metrics, logs, and traces wired up the moment a service comes online. OpenTelemetry out of the box.',
    ascii: [
      'p50  32ms  ▁▂▂▁▂▃▂▁▂',
      'p95  118ms ▂▃▅▃▂▄▆▃▂',
      'err  0.04% ▁▁▁▁▂▁▁▁▁',
    ],
  },
];

function FeatureCard({ f, accent }) {
  return (
    <article className="feat">
      <div className="feat-head">
        <span className="feat-id">{f.id}</span>
        <span className="feat-rule" />
      </div>
      <h3 className="feat-title">{f.title}</h3>
      <p className="feat-body">{f.body}</p>
      <pre className="feat-ascii" style={{ color: 'rgba(10,10,10,0.55)' }}>
        {f.ascii.join('\n')}
      </pre>
    </article>
  );
}

function FeaturesSection({ accent }) {
  return (
    <section className="features" id="features">
      <div className="sect-head">
        <span className="sect-tag">§ capabilities</span>
        <h2 className="sect-h">
          Infrastructure that acts like <em>code</em>, behaves like <em>a product</em>.
        </h2>
      </div>
      <div className="feat-grid">
        {FEATURES.map((f) => <FeatureCard key={f.id} f={f} accent={accent} />)}
      </div>
    </section>
  );
}

Object.assign(window, {
  TerminalDemo, NodeGraph, SignupForm, FeaturesSection,
});
