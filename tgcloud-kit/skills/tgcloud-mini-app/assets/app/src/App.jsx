import { useState } from 'react';
import { useTelegramTheme, haptic } from './lib/telegram.js';
import { useEndpoint } from './lib/useEndpoint.js';
import { callEndpoint } from './lib/serverless.js';
import { formatNumber, formatDate } from './lib/format.js';
import { useI18n } from './lib/i18n.js';

// An EndpointError's message is written for the user (in their language, by the
// endpoint); anything else gets a generic text.
const errorText = (t, e) => (e.type === 'ENDPOINT_ERROR' ? e.message : t('server_error', e.type ?? e.message));

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
function Profile({ me, i18n: { t, lang } }) {
  return (
    <Section title={t('profile')}>
      <Row label={t('name')}><bdi>{me.first_name || '—'}</bdi></Row>
      <Row label={t('username')}><bdi>{me.username ? `@${me.username}` : '—'}</bdi></Row>
      <Row label={t('user_id')}><span className="num">{me.id}</span></Row>
      {me.started
        ? (
          <>
            <Row label={t('member_since')}>{formatDate(lang, me.first_seen_at)}</Row>
            <Row label={t('starts')}>{formatNumber(lang, me.start_count)}</Row>
          </>
        )
        : <p className="hint">{t('not_started')}</p>}
    </Section>
  );
}

// A form that calls an endpoint: disabled while sending, server errors shown inline.
function Feedback({ enabled, i18n: { t, lang } }) {
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
      setState({ sending: false, sent: false, error: errorText(t, err) });
      haptic('error');
    }
  }

  return (
    <Section title={t('feedback')}>
      <form className="form" onSubmit={submit}>
        <textarea
          className="input"
          rows={4}
          maxLength={FEEDBACK_MAX}
          placeholder={t('feedback_placeholder')}
          value={text}
          disabled={!enabled}
          onChange={(e) => { setText(e.target.value); setState((s) => ({ ...s, sent: false, error: null })); }}
        />
        <div className="form__footer">
          <span className="hint num">{formatNumber(lang, text.length)} / {formatNumber(lang, FEEDBACK_MAX)}</span>
          <button className="button" type="submit" disabled={!enabled || state.sending || !text.trim()}>
            {state.sending ? t('sending') : t('send')}
          </button>
        </div>
        {state.sent && <p className="status status--ok">{t('sent')}</p>}
        {state.error && <p className="status status--error">{state.error}</p>}
      </form>
    </Section>
  );
}

export default function App() {
  useTelegramTheme();
  const me = useEndpoint('me');
  const i18n = useI18n(me.data?.lang);   // the bot's language for this user; until then, Telegram's
  const { t } = i18n;

  if (me.loading) return <Notice icon="⏳" text={t('loading')} />;
  if (me.error?.type === 'NOT_IN_TELEGRAM') return <Notice icon="📱" text={t('open_in_telegram')} />;
  if (me.error) return <Notice icon="⚠️" text={errorText(t, me.error)} />;

  return (
    <main className="app">
      <header className="header">
        <h1 className="header__title">__APP_TITLE__</h1>
        <p className="hint"><bdi>{t('hello', me.data.first_name)}</bdi></p>
      </header>
      <Profile me={me.data} i18n={i18n} />
      <Feedback enabled={me.data.started} i18n={i18n} />
    </main>
  );
}
