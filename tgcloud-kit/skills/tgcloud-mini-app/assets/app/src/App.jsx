import { useState } from 'react';
import { useTelegramTheme, haptic } from './lib/telegram.js';
import { useEndpoint } from './lib/useEndpoint.js';
import { callEndpoint } from './lib/serverless.js';
import { fa, faDate } from './lib/format.js';

// An EndpointError's message is written for the user; anything else gets a generic text.
const errorText = (e) => (e.type === 'ENDPOINT_ERROR' ? e.message : `خطا در ارتباط با سرور (${e.type ?? e.message})`);

const FEEDBACK_MAX = 2000;   // same limit as tgcloud/lib/feedback.js

function Notice({ icon, text }) {
  return (
    <main className="app app--center">
      <div className="notice">
        <span className="notice__icon" aria-hidden="true">{icon}</span>
        <p>{text}</p>
      </div>
    </main>
  );
}

function Section({ title, children }) {
  return (
    <section className="section">
      {title && <h2 className="section__title">{title}</h2>}
      <div className="section__body">{children}</div>
    </section>
  );
}

function Row({ label, children }) {
  return (
    <div className="row">
      <span className="row__label">{label}</span>
      <span className="row__value">{children}</span>
    </div>
  );
}

// The caller's own profile, from the `me` endpoint (verified on the server).
function Profile({ me }) {
  return (
    <Section title="پروفایل">
      <Row label="نام"><bdi>{me.first_name || '—'}</bdi></Row>
      <Row label="یوزرنیم"><bdi>{me.username ? `@${me.username}` : '—'}</bdi></Row>
      <Row label="آیدی عددی"><span className="num">{me.id}</span></Row>
      {me.started
        ? (
          <>
            <Row label="عضو از">{faDate(me.first_seen_at)}</Row>
            <Row label="تعداد استارت">{fa(me.start_count)}</Row>
          </>
        )
        : <p className="hint">هنوز ربات رو استارت نکردی. توی چت ربات /start رو بزن.</p>}
    </Section>
  );
}

// A form that calls an endpoint: disabled while sending, server errors shown inline.
function Feedback({ enabled }) {
  const [text, setText] = useState('');
  const [state, setState] = useState({ sending: false, sent: false, error: null });

  async function submit(e) {
    e.preventDefault();
    setState({ sending: true, sent: false, error: null });
    try {
      await callEndpoint('feedback', { text });
      setText('');
      setState({ sending: false, sent: true, error: null });
      haptic('success');
    } catch (err) {
      setState({ sending: false, sent: false, error: errorText(err) });
      haptic('error');
    }
  }

  return (
    <Section title="ارسال نظر">
      <form className="form" onSubmit={submit}>
        <textarea
          className="input"
          rows={4}
          maxLength={FEEDBACK_MAX}
          placeholder="نظر، پیشنهاد یا مشکلی که دیدی…"
          value={text}
          disabled={!enabled}
          onChange={(e) => { setText(e.target.value); setState((s) => ({ ...s, sent: false, error: null })); }}
        />
        <div className="form__footer">
          <span className="hint num">{fa(text.length)} / {fa(FEEDBACK_MAX)}</span>
          <button className="button" type="submit" disabled={!enabled || state.sending || !text.trim()}>
            {state.sending ? 'در حال ارسال…' : 'ارسال'}
          </button>
        </div>
        {state.sent && <p className="status status--ok">رسید، ممنون 🙏</p>}
        {state.error && <p className="status status--error">{state.error}</p>}
      </form>
    </Section>
  );
}

export default function App() {
  useTelegramTheme();
  const me = useEndpoint('me');

  if (me.loading) return <Notice icon="⏳" text="در حال بارگذاری…" />;
  if (me.error?.type === 'NOT_IN_TELEGRAM') return <Notice icon="📱" text="این صفحه رو از داخل تلگرام باز کن." />;
  if (me.error) return <Notice icon="⚠️" text={errorText(me.error)} />;

  return (
    <main className="app">
      <header className="header">
        <h1 className="header__title">__APP_TITLE__</h1>
        <p className="hint">سلام {me.data.first_name} 👋</p>
      </header>
      <Profile me={me.data} />
      <Feedback enabled={me.data.started} />
    </main>
  );
}
