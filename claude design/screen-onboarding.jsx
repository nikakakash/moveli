/* MOVELI — Onboarding & sign-up (split-screen) — email + password */

const OnboardingScreen = ({ lang = 'ka' }) => {
  const t = (ka, en) => (lang === 'ka' ? ka : en);
  const [mode, setMode] = React.useState('signup'); // 'signup' | 'signin'

  return (
    <div className="screen">
      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1.05fr 1fr', overflow: 'hidden' }}>
        {/* LEFT — brand panel */}
        <div style={{
          background: 'linear-gradient(135deg, #C9C0F3 0%, #B5C9EF 35%, #A8DCEC 75%, #8FD7E9 100%)',
          padding: '40px 56px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
          position: 'relative', overflow: 'hidden',
        }}>
          {/* decorative shapes */}
          <div style={{ position: 'absolute', top: -120, right: -120, width: 360, height: 360, borderRadius: '50%', background: 'rgba(255,255,255,0.18)', filter: 'blur(8px)' }} />
          <div style={{ position: 'absolute', bottom: -80, left: -80, width: 280, height: 280, borderRadius: '50%', background: 'rgba(155,142,229,0.25)' }} />

          {/* top: logo + lang */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative' }}>
            <MoveliLogo size={28} />
            <button style={{
              padding: '8px 14px', background: 'rgba(255,255,255,0.7)',
              border: 0, borderRadius: 999, cursor: 'pointer',
              font: 'var(--text-label-secondary)',
              display: 'flex', alignItems: 'center', gap: 6,
              backdropFilter: 'blur(6px)',
            }}>
              <Icon name="globe" size={14} /> ქართული · EN
            </button>
          </div>

          {/* center: floating product cards */}
          <div style={{ position: 'relative', height: 360, margin: '24px 0' }}>
            <FloatingCard img="sneakers" title="Nike Air Max 270" price="₾349" style={{ top: 0, left: 40, transform: 'rotate(-6deg)' }} />
            <FloatingCard img="airpods" title="AirPods Pro 2" price="₾599" style={{ top: 30, right: 30, transform: 'rotate(8deg)' }} />
            <FloatingCard img="lipstick" title={t('ტუჩსაცხი', 'Lipstick')} price="₾42" style={{ bottom: 20, left: 80, transform: 'rotate(4deg)' }} compact />
            <FloatingCard img="watch" title="Watch Series 9" price="₾1,189" style={{ bottom: 60, right: 60, transform: 'rotate(-10deg)' }} compact />

            {/* center medallion */}
            <div style={{
              position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
              width: 140, height: 140, borderRadius: '50%',
              background: 'white', boxShadow: 'var(--shadow-xl)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexDirection: 'column', gap: 4,
            }}>
              <span className="num" style={{ font: '800 28px/1 var(--font-numbers)', color: 'var(--moveli-purple-700)' }}>50K+</span>
              <span style={{ font: 'var(--text-body-tiny-md)', color: 'var(--fg-secondary)' }}>{t('პროდუქტი', 'products')}</span>
            </div>
          </div>

          {/* bottom: pitch */}
          <div style={{ position: 'relative', maxWidth: 460 }}>
            <h1 style={{ font: '800 38px/1.15 var(--font-display)', color: 'var(--moveli-purple-900)', letterSpacing: '-0.5px' }}>
              {t('საქართველოს ყველაზე სწრაფი', "Georgia's fastest")}<br />
              {t('სავაჭრო ცენტრი', 'online marketplace')}.
            </h1>
            <p style={{ font: 'var(--text-body-base)', color: 'var(--moveli-purple-900)', opacity: 0.75, marginTop: 12, maxWidth: 400 }}>
              {t(
                'მიწოდება 24 საათში, ნაღდი ანგარიშსწორება, საუკეთესო ფასები. შემოგვიერთდი ერთ ნაბიჯში.',
                'Delivery in 24h, cash on delivery, best prices. Join in one step.'
              )}
            </p>

            {/* social proof */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 24 }}>
              <div style={{ display: 'flex' }}>
                {[260, 220, 180, 320].map((hue, i) => (
                  <Avatar key={i} name={['NM', 'GT', 'LK', 'MK'][i]} hue={hue} size={32} style={{ marginLeft: i > 0 ? -10 : 0, border: '2px solid white', boxSizing: 'content-box' }} />
                ))}
              </div>
              <div>
                <div style={{ display: 'flex', gap: 2 }}>
                  {[0, 1, 2, 3, 4].map(i => <Icon key={i} name="star" weight="fill" size={12} style={{ color: '#FFB800' }} />)}
                  <span className="num" style={{ font: 'var(--text-body-tiny-md)', marginLeft: 4 }}>4.8</span>
                </div>
                <div style={{ font: 'var(--text-body-tiny)', color: 'var(--moveli-purple-900)', opacity: 0.7 }}>
                  <span className="num">120,000+</span> {t('მომხმარებელი', 'customers')}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT — form */}
        <div style={{ padding: '40px 64px', display: 'flex', flexDirection: 'column', overflow: 'auto' }}>
          {/* header: signup/signin toggle */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: 4, padding: 4, background: 'var(--neutral-050)', borderRadius: 'var(--radius-pill)' }}>
              <button onClick={() => setMode('signup')} className="chip" style={{
                background: mode === 'signup' ? 'var(--white)' : 'transparent',
                color: mode === 'signup' ? 'var(--fg-primary)' : 'var(--fg-tertiary)',
                boxShadow: mode === 'signup' ? 'var(--shadow-xs)' : 'none',
                padding: '8px 18px', font: 'var(--text-label-secondary)',
              }}>{t('რეგისტრაცია', 'Sign up')}</button>
              <button onClick={() => setMode('signin')} className="chip" style={{
                background: mode === 'signin' ? 'var(--white)' : 'transparent',
                color: mode === 'signin' ? 'var(--fg-primary)' : 'var(--fg-tertiary)',
                boxShadow: mode === 'signin' ? 'var(--shadow-xs)' : 'none',
                padding: '8px 18px', font: 'var(--text-label-secondary)',
              }}>{t('შესვლა', 'Sign in')}</button>
            </div>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6, font: 'var(--text-body-tiny)', color: 'var(--fg-tertiary)' }}>
              <Icon name="shield-check" size={14} style={{ color: 'var(--positive-strong)' }} />
              {t('SSL დაცული', 'SSL secured')}
            </span>
          </div>

          {/* form body */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', maxWidth: 440, margin: '0 auto', width: '100%', padding: '40px 0' }}>
            <h2 style={{ font: '800 32px/1.15 var(--font-display)', letterSpacing: '-0.5px' }}>
              {mode === 'signup' ? t('შექმენი ანგარიში', 'Create your account') : t('კეთილი იყოს დაბრუნება', 'Welcome back')}
            </h2>
            <p style={{ marginTop: 8 }}>
              {mode === 'signup'
                ? t('1 წუთში მზად ვართ. შენი მონაცემები დაცულია.', "Ready in under a minute — your data stays private.")
                : t('შედი შენი ანგარიშით და განაგრძე ყიდვა.', 'Sign in to continue shopping where you left off.')}
            </p>

            {mode === 'signup' ? (
              <div style={{ marginTop: 28, display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <label className="label">{t('სრული სახელი', 'Full name')}</label>
                  <input className="input" placeholder={t('ნინო მელაძე', 'Nino Meladze')} defaultValue="Nino Meladze" />
                </div>
                <div>
                  <label className="label">{t('მომხმარებლის სახელი', 'Username')}</label>
                  <div style={{ position: 'relative' }}>
                    <input className="input" placeholder="nino_m" defaultValue="nino_m" style={{ paddingLeft: 32 }} />
                    <Icon name="at" size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--fg-tertiary)' }} />
                    <Icon name="check-circle" weight="fill" size={16} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--positive-strong)' }} />
                  </div>
                  <span style={{ font: 'var(--text-body-tiny)', color: 'var(--positive-strong)', marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                    {t('თავისუფალია', 'Username available')}
                  </span>
                </div>
                <div>
                  <label className="label">{t('ელ. ფოსტა', 'Email')}</label>
                  <div style={{ position: 'relative' }}>
                    <input className="input" placeholder="nino@example.com" type="email" defaultValue="nino@example.com" style={{ paddingLeft: 36 }} />
                    <Icon name="envelope" size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--fg-tertiary)' }} />
                  </div>
                </div>
                <div>
                  <label className="label">{t('პაროლი', 'Password')}</label>
                  <div style={{ position: 'relative' }}>
                    <input className="input" placeholder="••••••••" type="password" defaultValue="abcd1234" style={{ paddingLeft: 36, paddingRight: 36 }} />
                    <Icon name="lock-key" size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--fg-tertiary)' }} />
                    <button style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 0, cursor: 'pointer', padding: 4 }}>
                      <Icon name="eye" size={16} style={{ color: 'var(--fg-tertiary)' }} />
                    </button>
                  </div>
                  {/* Strength meter */}
                  <div style={{ display: 'flex', gap: 4, marginTop: 8 }}>
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} style={{
                        flex: 1, height: 4, borderRadius: 2,
                        background: i <= 3 ? (i <= 2 ? 'var(--moveli-purple-500)' : 'var(--moveli-cyan-500)') : 'var(--neutral-200)',
                      }} />
                    ))}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
                    <span style={{ font: 'var(--text-body-tiny)', color: 'var(--fg-secondary)' }}>{t('საშუალო პაროლი', 'Decent password')}</span>
                    <span style={{ font: 'var(--text-body-tiny)', color: 'var(--fg-tertiary)' }}>{t('მინ. 8 სიმბოლო', 'min. 8 chars')}</span>
                  </div>
                </div>
                <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginTop: 4 }}>
                  <Checkbox checked />
                  <span style={{ font: 'var(--text-body-secondary)', color: 'var(--fg-secondary)' }}>
                    {t('ვეთანხმები', 'I agree to the')}{' '}
                    <a style={{ color: 'var(--moveli-purple-700)' }}>{t('წესებსა და პირობებს', 'Terms')}</a>{' '}
                    {t('და', 'and')}{' '}
                    <a style={{ color: 'var(--moveli-purple-700)' }}>{t('კონფიდენციალურობის პოლიტიკას', 'Privacy Policy')}</a>
                  </span>
                </label>
              </div>
            ) : (
              <div style={{ marginTop: 28, display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <label className="label">{t('ელ. ფოსტა ან მომხმარებლის სახელი', 'Email or username')}</label>
                  <div style={{ position: 'relative' }}>
                    <input className="input" placeholder="nino@example.com" defaultValue="nino@example.com" style={{ paddingLeft: 36 }} />
                    <Icon name="user" size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--fg-tertiary)' }} />
                  </div>
                </div>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <span className="label" style={{ marginBottom: 0 }}>{t('პაროლი', 'Password')}</span>
                    <a style={{ font: 'var(--text-body-tiny-md)', color: 'var(--moveli-purple-700)', cursor: 'pointer' }}>{t('დაგავიწყდა?', 'Forgot password?')}</a>
                  </div>
                  <div style={{ position: 'relative' }}>
                    <input className="input" placeholder="••••••••" type="password" defaultValue="abcd1234" style={{ paddingLeft: 36, paddingRight: 36 }} />
                    <Icon name="lock-key" size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--fg-tertiary)' }} />
                    <button style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 0, cursor: 'pointer', padding: 4 }}>
                      <Icon name="eye" size={16} style={{ color: 'var(--fg-tertiary)' }} />
                    </button>
                  </div>
                </div>
                <label style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 4 }}>
                  <Checkbox checked />
                  <span style={{ font: 'var(--text-body-secondary)', color: 'var(--fg-secondary)' }}>
                    {t('დამიმახსოვრე', 'Remember me on this device')}
                  </span>
                </label>
              </div>
            )}

            <button className="btn btn-primary btn-lg" style={{ width: '100%', marginTop: 28 }}>
              {mode === 'signup' ? t('ანგარიშის შექმნა', 'Create account') : t('შესვლა', 'Sign in')}
              <Icon name="arrow-right" size={16} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '24px 0' }}>
              <div style={{ flex: 1, height: 1, background: 'var(--border-default)' }} />
              <span style={{ font: 'var(--text-body-tiny)', color: 'var(--fg-tertiary)' }}>{t('ან გააგრძელე', 'or continue with')}</span>
              <div style={{ flex: 1, height: 1, background: 'var(--border-default)' }} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
              {[
                { name: 'Google', icon: 'google-logo' },
                { name: 'Apple', icon: 'apple-logo' },
                { name: 'Facebook', icon: 'facebook-logo' },
              ].map(p => (
                <button key={p.name} className="btn btn-secondary" style={{ padding: '12px 8px' }}>
                  <Icon name={p.icon} size={18} /> {p.name}
                </button>
              ))}
            </div>
          </div>

          {/* footer */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', font: 'var(--text-body-tiny)', color: 'var(--fg-tertiary)' }}>
            <span>© 2026 MOVELI</span>
            <div style={{ display: 'flex', gap: 16 }}>
              <a>{t('დახმარება', 'Help')}</a>
              <a>{t('კონფიდენციალურობა', 'Privacy')}</a>
              <a>{t('წესები', 'Terms')}</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const FloatingCard = ({ img, title, price, style, compact }) => (
  <div className="card-soft" style={{
    position: 'absolute', padding: 10, width: compact ? 160 : 200,
    display: 'flex', flexDirection: 'column', gap: 6,
    boxShadow: 'var(--shadow-lg)',
    background: 'white',
    ...style,
  }}>
    <div style={{
      height: compact ? 100 : 120, borderRadius: 'var(--radius-sm)',
      background: `url(${stockSrc(img, 320, 240)}) center/cover`,
    }} />
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 8 }}>
      <span style={{ font: 'var(--text-body-tiny-md)', color: 'var(--fg-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>{title}</span>
      <span className="num" style={{ font: 'var(--text-body-secondary-md)', color: 'var(--moveli-purple-700)' }}>{price}</span>
    </div>
  </div>
);

Object.assign(window, { OnboardingScreen, FloatingCard });
