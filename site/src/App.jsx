import { Fragment, useEffect, useState } from 'react';
import { content, REPO_URL, PREVIEW_URL, TREE } from './content.js';

// ---------- preferences (language, theme): per-browser conveniences ----------

const store = {
  get(key) {
    try { return window.localStorage.getItem(key); } catch { return null; }
  },
  set(key, value) {
    try {
      if (value == null) window.localStorage.removeItem(key);
      else window.localStorage.setItem(key, value);
    } catch { /* private mode: keep it for this visit only */ }
  },
};

function initialLang() {
  const fromUrl = new URLSearchParams(window.location.search).get('lang');
  if (fromUrl === 'fa' || fromUrl === 'en') return fromUrl;
  const saved = store.get('lang');
  return saved === 'en' || saved === 'fa' ? saved : 'en';   // English by default
}

function useLang() {
  const [lang, setLang] = useState(initialLang);
  const t = content[lang];
  useEffect(() => {
    const root = document.documentElement;
    root.lang = t.lang;
    root.dir = t.dir;
    document.title = t.title;
    store.set('lang', lang);
  }, [lang, t]);
  return [t, () => setLang((l) => (l === 'fa' ? 'en' : 'fa'))];
}

function useTheme() {
  const [theme, setTheme] = useState(() => store.get('theme'));   // 'light' | 'dark' | null (follow the system)
  useEffect(() => {
    const root = document.documentElement;
    if (theme) root.dataset.theme = theme;
    else delete root.dataset.theme;
    store.set('theme', theme);
  }, [theme]);
  const toggle = () => {
    const systemDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches;
    const current = theme ?? (systemDark ? 'dark' : 'light');
    setTheme(current === 'dark' ? 'light' : 'dark');
  };
  return toggle;
}

// ---------- small pieces ----------

// @handles stay "@name" inside right-to-left text (otherwise the @ jumps to the end).
const Handle = ({ children }) => <bdi dir="ltr">{children}</bdi>;

// `code`, **bold** and @handles inside a text.
function Rich({ text }) {
  const parts = String(text).split(/(`[^`]+`|\*\*[^*]+\*\*|@[A-Za-z0-9_]+)/g);
  return parts.map((p, i) => {
    if (p.startsWith('`') && p.endsWith('`')) return <code key={i} className="ic">{p.slice(1, -1)}</code>;
    if (p.startsWith('**') && p.endsWith('**')) {
      const inner = p.slice(2, -2);
      return <strong key={i}>{inner.startsWith('@') ? <Handle>{inner}</Handle> : inner}</strong>;
    }
    if (/^@[A-Za-z0-9_]+$/.test(p)) return <Handle key={i}>{p}</Handle>;
    return <Fragment key={i}>{p}</Fragment>;
  });
}

const Icon = {
  copy: <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="9" y="9" width="11" height="11" rx="2" /><path d="M5 15V5a2 2 0 0 1 2-2h10" /></svg>,
  check: <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>,
  sun: <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4.5" /><path d="M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M4.9 19.1l1.8-1.8M17.3 6.7l1.8-1.8" /></svg>,
  moon: <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z" /></svg>,
  github: <svg viewBox="0 0 24 24" aria-hidden="true" className="fill"><path d="M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48v-1.7c-2.78.6-3.37-1.34-3.37-1.34-.45-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.9 1.52 2.34 1.08 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.64 0 0 .84-.27 2.75 1.02a9.56 9.56 0 0 1 5 0c1.91-1.29 2.75-1.02 2.75-1.02.55 1.37.2 2.39.1 2.64.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.68-4.57 4.93.36.31.68.92.68 1.85v2.75c0 .27.18.58.69.48A10 10 0 0 0 12 2z" /></svg>,
};

function CopyButton({ text, t }) {
  const [done, setDone] = useState(false);
  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const area = document.createElement('textarea');
      area.value = text;
      document.body.appendChild(area);
      area.select();
      try { document.execCommand('copy'); } finally { area.remove(); }
    }
    setDone(true);
    setTimeout(() => setDone(false), 1500);
  }
  return (
    <button type="button" className={`copy${done ? ' copy--done' : ''}`} onClick={copy} aria-label={done ? t.copied : t.copy} title={done ? t.copied : t.copy}>
      {done ? Icon.check : Icon.copy}
    </button>
  );
}

function Code({ code, t }) {
  return (
    <div className="code">
      <pre dir="ltr"><code>{code}</code></pre>
      <CopyButton text={code} t={t} />
    </div>
  );
}

// The direction of a text from its first letter: a slash command or an English
// request reads left to right even on the Persian page.
const dirOf = (text) => (/^[^A-Za-z\u0600-\u06FF]*[\u0600-\u06FF]/.test(text) ? 'rtl' : 'ltr');

// A request typed to an agent.
function Prompt({ text, t }) {
  const dir = dirOf(text);
  return (
    <div className={`prompt prompt--${dir}`}>
      <span className="prompt__mark" aria-hidden="true">›</span>
      <p dir={dir}>{text}</p>
      <CopyButton text={text} t={t} />
    </div>
  );
}

const num = (n, lang) => (lang === 'fa' ? n.toLocaleString('fa-IR') : String(n));

function Section({ id, title, lead, children, tone }) {
  return (
    <section id={id} className={`section${tone ? ` section--${tone}` : ''}`}>
      <div className="container">
        <header className="section__head">
          <h2>{title}</h2>
          {lead && <p className="lead"><Rich text={lead} /></p>}
        </header>
        {children}
      </div>
    </section>
  );
}

// ---------- page parts ----------

function Header({ t, onLang, onTheme }) {
  return (
    <header className="topbar">
      <div className="container topbar__inner">
        <a className="brand" href="#top" aria-label="tgcloud-kit">
          <svg viewBox="0 0 64 64" aria-hidden="true" className="brand__mark">
            <rect width="64" height="64" rx="16" />
            <path d="M16 22l12 10-12 10" className="brand__chev" />
            <path d="M33 44h15" className="brand__line" />
          </svg>
          <span>tgcloud-kit</span>
        </a>
        <nav className="topnav" aria-label="sections">
          {t.nav.map((n) => <a key={n.id} href={`#${n.id}`}>{n.label}</a>)}
        </nav>
        <div className="topbar__actions">
          <button type="button" className="chip" onClick={onLang}>{t.switchLabel}</button>
          <button type="button" className="icon-btn" onClick={onTheme} aria-label={t.themeLabel} title={t.themeLabel}>
            <span className="only-light">{Icon.moon}</span>
            <span className="only-dark">{Icon.sun}</span>
          </button>
          <a className="icon-btn" href={REPO_URL} aria-label="GitHub" title="GitHub">{Icon.github}</a>
        </div>
      </div>
    </header>
  );
}

function ChatDemo({ chat }) {
  return (
    <div className="demo" aria-hidden="true">
      <div className="demo__bar"><i /><i /><i /></div>
      <div className="demo__body">
        <div className="msg msg--you">
          <span className="msg__who">{chat.you}</span>
          <p dir="auto">{chat.prompt}</p>
        </div>
        <div className="msg msg--agent">
          <span className="msg__who">{chat.agent}</span>
          <ul>
            {chat.steps.map((s, i) => <li key={s} style={{ '--i': i }} dir="auto">{s}</li>)}
          </ul>
        </div>
        <div className="msg msg--bot">
          <span className="msg__who">{chat.bot}</span>
          <p dir="auto">{chat.botReply}</p>
          <div className="msg__buttons">
            {chat.buttons.map((b) => <span key={b}>{b}</span>)}
          </div>
        </div>
      </div>
    </div>
  );
}

function Hero({ t }) {
  const h = t.hero;
  return (
    <section className="hero" id="top">
      <div className="container hero__grid">
        <div className="hero__text">
          <span className="eyebrow">{h.eyebrow}</span>
          <h1>{h.title}</h1>
          <p className="lead">{h.lead}</p>
          <div className="hero__cta">
            <a className="btn btn--primary" href="#start">{h.primary}</a>
            <a className="btn" href={REPO_URL}>{Icon.github}<span>{h.secondary}</span></a>
            <a className="btn" href={PREVIEW_URL} target="_blank" rel="noopener"><span aria-hidden="true">🤖</span><span>{h.preview}</span></a>
          </div>
        </div>
        <ChatDemo chat={h.chat} />
      </div>
    </section>
  );
}

function How({ t }) {
  return (
    <Section id="how" title={t.how.title} lead={t.how.lead}>
      <ol className="flow">
        {t.how.steps.map((s) => (
          <li key={s.title} className="card flow__step">
            <span className="flow__icon" aria-hidden="true">{s.icon}</span>
            <h3>{s.title}</h3>
            <p><Rich text={s.body} /></p>
          </li>
        ))}
      </ol>
    </Section>
  );
}

function Skills({ t }) {
  return (
    <Section id="skills" title={t.skills.title} lead={t.skills.lead} tone="alt">
      <div className="grid">
        {t.skills.items.map((s) => (
          <article key={s.name} className="card skill">
            <div className="skill__head">
              <code className="skill__name">{s.name}</code>
              <span className="tag">{s.tag}</span>
            </div>
            <p><Rich text={s.body} /></p>
            <ul className="ticks">
              {s.points.map((p) => <li key={p}><Rich text={p} /></li>)}
            </ul>
          </article>
        ))}
      </div>
    </Section>
  );
}

function Start({ t }) {
  const s = t.start;
  const [tab, setTab] = useState(s.tabs[0].id);
  const current = s.tabs.find((x) => x.id === tab) ?? s.tabs[0];
  return (
    <Section id="start" title={s.title} lead={s.lead}>
      <div className="start">
        <aside className="card needs">
          <h3>{s.needTitle}</h3>
          <ul className="ticks">
            {s.needs.map((n) => <li key={n}><Rich text={n} /></li>)}
          </ul>
        </aside>

        <div className="card agents">
          <h3>{s.tabsTitle}</h3>
          <div className="tabs" role="tablist">
            {s.tabs.map((x) => (
              <button
                key={x.id}
                type="button"
                role="tab"
                id={`tab-${x.id}`}
                aria-selected={x.id === current.id}
                aria-controls="agent-panel"
                className="tab"
                onClick={() => setTab(x.id)}
              >
                {x.label}
              </button>
            ))}
          </div>
          <div className="tabpanel" role="tabpanel" id="agent-panel" aria-labelledby={`tab-${current.id}`}>
            <p><Rich text={current.intro} /></p>
            <Code code={current.code} t={t} />
            <p><Rich text={current.after} /></p>
            {current.promptIsCode ? <Code code={current.prompt} t={t} /> : <Prompt text={current.prompt} t={t} />}
          </div>
        </div>
      </div>

      <h3 className="subhead">{s.stepsTitle}</h3>
      <ol className="steps">
        {s.steps.map((step, i) => (
          <li key={step.title} className="step">
            <span className="step__n" aria-hidden="true">{num(i + 1, t.lang)}</span>
            <div className="step__body">
              <h4>{step.title}</h4>
              <p><Rich text={step.body} /></p>
              {step.code && <Code code={step.code} t={t} />}
            </div>
          </li>
        ))}
      </ol>
    </Section>
  );
}

function Prompts({ t }) {
  return (
    <Section id="prompts" title={t.prompts.title} lead={t.prompts.lead} tone="alt">
      <div className="prompts">
        {t.prompts.items.map((p) => <Prompt key={p} text={p} t={t} />)}
      </div>
    </Section>
  );
}

function Commands({ t }) {
  const c = t.commands;
  return (
    <Section id="commands" title={c.title} lead={c.lead}>
      <div className="table-wrap">
        <table className="cmds">
          <thead><tr><th scope="col">{c.head[0]}</th><th scope="col">{c.head[1]}</th></tr></thead>
          <tbody>
            {c.rows.map(([cmd, what]) => (
              <tr key={cmd}>
                <td><code dir="ltr">{cmd}</code></td>
                <td><Rich text={what} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Section>
  );
}

function Admin({ t }) {
  const a = t.admin;
  return (
    <Section id="admin" title={a.title} lead={a.lead} tone="alt">
      <div className="grid grid--2">
        {a.items.map((item) => (
          <div key={item.ask} className="card ask">
            <Prompt text={item.ask} t={t} />
            <p className="ask__gets"><span aria-hidden="true">→ </span><Rich text={item.gets} /></p>
          </div>
        ))}
      </div>
      <div className="callout">
        <h3><Rich text={a.sqlTitle} /></h3>
        <Code code={a.sqlCode} t={t} />
        <p><Rich text={a.sqlNote} /></p>
      </div>
    </Section>
  );
}

function Structure({ t }) {
  return (
    <Section id="structure" title={t.structure.title} lead={t.structure.lead}>
      <Code code={TREE} t={t} />
    </Section>
  );
}

function Security({ t }) {
  return (
    <Section id="security" title={t.security.title} tone="alt">
      <div className="grid grid--2">
        {t.security.items.map((s) => (
          <div key={s.title} className="card sec">
            <h3>{s.title}</h3>
            <p><Rich text={s.body} /></p>
          </div>
        ))}
      </div>
    </Section>
  );
}

function Faq({ t }) {
  return (
    <Section id="faq" title={t.faq.title}>
      <div className="faq">
        {t.faq.items.map((f) => (
          <details key={f.q}>
            <summary>{f.q}</summary>
            <p><Rich text={f.a} /></p>
          </details>
        ))}
      </div>
    </Section>
  );
}

function Footer({ t }) {
  return (
    <footer className="footer">
      <div className="container footer__inner">
        <span>
          {t.footer.by} <bdi><a href="https://github.com/IsAmirMmd">IsAmirMmd</a></bdi>
          {' · '}
          <bdi><a href="https://nimbyte.ir">nimbyte</a></bdi>
        </span>
        <span className="footer__links">
          <a href={REPO_URL}>{t.footer.repo}</a>
          <a href="https://core.telegram.org/bots/serverless">{t.footer.docs}</a>
        </span>
      </div>
    </footer>
  );
}

export default function App() {
  const [t, toggleLang] = useLang();
  const toggleTheme = useTheme();
  return (
    <>
      <Header t={t} onLang={toggleLang} onTheme={toggleTheme} />
      <main>
        <Hero t={t} />
        <How t={t} />
        <Skills t={t} />
        <Start t={t} />
        <Prompts t={t} />
        <Commands t={t} />
        <Admin t={t} />
        <Structure t={t} />
        <Security t={t} />
        <Faq t={t} />
      </main>
      <Footer t={t} />
    </>
  );
}
