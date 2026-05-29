/* MOVELI — Admin dashboard (platform operator) */

const AdminScreen = ({ lang = 'ka' }) => {
  const t = (ka, en) => (lang === 'ka' ? ka : en);

  const nav = [
    { icon: 'gauge', ka: 'მთავარი', en: 'Overview', active: true },
    { icon: 'users-three', ka: 'მომხმარებლები', en: 'Customers', count: '12.4K' },
    { icon: 'receipt', ka: 'შეკვეთები', en: 'Orders', count: 184, dot: true },
    { icon: 'package', ka: 'პროდუქცია', en: 'Products', count: '2,840' },
    { icon: 'squares-four', ka: 'კატეგორიები', en: 'Categories' },
    { icon: 'star', ka: 'შეფასებები', en: 'Reviews', count: 23, dot: true },
    { icon: 'tag', ka: 'პრომოაქციები', en: 'Promotions' },
    { icon: 'wallet', ka: 'ფინანსები', en: 'Finance' },
    { icon: 'chart-line-up', ka: 'ანგარიშები', en: 'Reports' },
    { icon: 'gear', ka: 'პარამეტრები', en: 'Settings' },
  ];

  const chart = [40, 52, 48, 65, 72, 58, 78, 85, 79, 92, 88, 96, 102, 95, 110, 124, 118, 130, 142, 138, 154, 162, 158, 174, 188, 195, 210, 224];

  return (
    <div className="screen" style={{ background: 'var(--neutral-050)' }}>
      <div style={{ display: 'flex', height: '100%' }}>
        {/* SIDEBAR */}
        <aside style={{
          width: 240, background: 'var(--white)', borderRight: '1px solid var(--border-default)',
          display: 'flex', flexDirection: 'column', flexShrink: 0,
        }}>
          <div style={{ padding: '20px 20px 12px', display: 'flex', alignItems: 'center', gap: 8 }}>
            <MoveliLogo size={22} wordmark={false} />
            <span style={{ font: '700 14px/1 var(--font-display)' }} className="brand-text">MOVELI</span>
            <span style={{ font: 'var(--text-body-tiny-md)', color: 'var(--white)', padding: '2px 8px', background: 'var(--neutral-900)', borderRadius: 4, letterSpacing: 0.5 }}>ADMIN</span>
          </div>

          {/* admin info */}
          <div style={{ padding: '8px 12px' }}>
            <div style={{
              width: '100%', padding: '10px 12px', background: 'var(--neutral-050)',
              border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)',
              display: 'flex', alignItems: 'center', gap: 10,
            }}>
              <Avatar name="DK" hue={300} size={32} />
              <div style={{ flex: 1, textAlign: 'left', minWidth: 0 }}>
                <div style={{ font: 'var(--text-body-secondary-md)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Davit Kapanadze</div>
                <div style={{ font: 'var(--text-body-tiny)', color: 'var(--fg-tertiary)', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ width: 6, height: 6, borderRadius: 999, background: 'var(--positive-strong)' }} />
                  {t('სუპერ ადმინი', 'Super admin')}
                </div>
              </div>
            </div>
          </div>

          <nav style={{ padding: 8, flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
            {nav.map(n => (
              <a key={n.en} style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px',
                borderRadius: 'var(--radius-sm)',
                background: n.active ? 'var(--moveli-purple-050)' : 'transparent',
                color: n.active ? 'var(--moveli-purple-700)' : 'var(--fg-primary)',
                cursor: 'pointer', position: 'relative',
              }}>
                <Icon name={n.icon} size={18} weight={n.active ? 'fill' : 'regular'} />
                <span style={{ flex: 1, font: 'var(--text-body-secondary-md)' }}>{t(n.ka, n.en)}</span>
                {n.count != null && (
                  <span className="num" style={{
                    font: 'var(--text-body-tiny-md)', padding: '1px 7px', borderRadius: 999,
                    background: n.dot ? 'var(--moveli-gradient)' : 'var(--neutral-100)',
                    color: n.dot ? 'white' : 'var(--fg-secondary)',
                  }}>{n.count}</span>
                )}
              </a>
            ))}
          </nav>

          {/* system status */}
          <div style={{ margin: 12, padding: 14, background: 'var(--positive-soft)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(14,177,46,0.15)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 8, height: 8, borderRadius: 999, background: 'var(--positive-strong)', boxShadow: '0 0 0 4px rgba(14,177,46,0.15)' }} />
              <span style={{ font: 'var(--text-body-secondary-md)', color: 'var(--positive-strong)' }}>{t('სისტემა იმუშავებს', 'All systems operational')}</span>
            </div>
            <div style={{ font: 'var(--text-body-tiny)', color: 'var(--fg-secondary)', marginTop: 4 }} className="num">
              {t('Uptime', 'Uptime')} 99.98% · 24h
            </div>
          </div>
        </aside>

        {/* MAIN */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {/* Topbar */}
          <div style={{ padding: '14px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--white)', borderBottom: '1px solid var(--border-default)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', background: 'var(--neutral-050)', borderRadius: 'var(--radius-pill)', minWidth: 380 }}>
                <Icon name="magnifying-glass" size={16} style={{ color: 'var(--fg-tertiary)' }} />
                <span style={{ flex: 1, font: 'var(--text-body-secondary)', color: 'var(--fg-tertiary)' }}>{t('მოძებნე შეკვეთა, მომხმარებელი, პროდუქტი…', 'Search orders, users, products…')}</span>
                <kbd style={{ font: 'var(--text-body-tiny-md)', color: 'var(--fg-tertiary)', background: 'var(--white)', padding: '2px 6px', borderRadius: 4, border: '1px solid var(--border-default)' }}>⌘K</kbd>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span className="chip" style={{ padding: '6px 12px', background: 'var(--negative-soft)', color: 'var(--negative-strong)' }}>
                <Icon name="warning" size={12} weight="fill" /> {t('5 საჩივარი მოლოდინში', '5 issues pending')}
              </span>
              <button className="btn btn-ghost btn-sm" style={{ padding: 8, position: 'relative' }}>
                <Icon name="bell" size={18} />
                <span style={{ position: 'absolute', top: 6, right: 6, width: 8, height: 8, borderRadius: 999, background: 'var(--negative)' }} />
              </button>
              <button className="btn btn-ghost btn-sm" style={{ padding: 8 }}>
                <Icon name="question" size={18} />
              </button>
              <Avatar name="DK" hue={300} size={32} />
            </div>
          </div>

          <div style={{ flex: 1, overflow: 'auto', padding: '24px 32px 32px' }}>
            {/* Heading */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 20 }}>
              <div>
                <div style={{ font: 'var(--text-body-secondary)', color: 'var(--fg-secondary)' }}>{t('პლატფორმის შემაჯამებელი', 'Platform overview')}</div>
                <h2 style={{ font: '800 28px/1.1 var(--font-display)', letterSpacing: '-0.5px', marginTop: 4 }}>
                  {t('მთავარი დაფა', 'Dashboard')}
                </h2>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ display: 'flex', gap: 4, padding: 4, background: 'var(--white)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)' }}>
                  {[t('დღეს', 'Today'), t('7 დღე', '7d'), t('30 დღე', '30d'), t('წელი', 'Year')].map((p, i) => (
                    <button key={p} className={i === 2 ? 'chip chip-active' : 'chip'} style={{ background: i === 2 ? 'var(--moveli-purple-050)' : 'transparent', padding: '6px 14px' }}>{p}</button>
                  ))}
                </div>
                <button className="btn btn-secondary btn-sm">
                  <Icon name="download-simple" size={14} /> {t('ექსპორტი', 'Export')}
                </button>
              </div>
            </div>

            {/* KPI cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 20 }}>
              {[
                { ka: 'GMV (ბრუნვა)', en: 'GMV', val: '₾482K', delta: '+14.2%', up: true, icon: 'currency-circle-dollar', spark: chart },
                { ka: 'შეკვეთები', en: 'Orders', val: '5,420', delta: '+9.8%', up: true, icon: 'package', spark: chart.map(v => v * 0.7) },
                { ka: 'აქტიური მომხმარებლები', en: 'Active customers', val: '12,420', delta: '+24.6%', up: true, icon: 'users-three', spark: chart.map(v => v * 1.2 + 30) },
                { ka: 'საშ. შეკვეთა', en: 'Avg. order value', val: '₾89', delta: '−2.1%', up: false, icon: 'receipt', spark: chart.map(v => 240 - v * 0.6) },
              ].map((k, i) => (
                <div key={i} className="card-soft" style={{ padding: 18 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <span style={{ font: 'var(--text-body-secondary)', color: 'var(--fg-secondary)' }}>{t(k.ka, k.en)}</span>
                    <span style={{ width: 32, height: 32, borderRadius: 999, background: 'var(--moveli-gradient-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Icon name={k.icon} size={16} style={{ color: 'var(--moveli-purple-700)' }} />
                    </span>
                  </div>
                  <div className="num" style={{ font: '800 28px/1 var(--font-numbers)', marginTop: 10 }}>{k.val}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6 }}>
                    <span className="num" style={{ font: 'var(--text-body-tiny-md)', color: k.up ? 'var(--positive-strong)' : 'var(--negative-strong)' }}>
                      {k.up ? '↑' : '↓'} {k.delta}
                    </span>
                    <span style={{ font: 'var(--text-body-tiny)', color: 'var(--fg-tertiary)' }}>{t('წინა პერიოდთან', 'vs prev period')}</span>
                  </div>
                  <svg viewBox="0 0 240 40" style={{ width: '100%', height: 40, marginTop: 8 }} preserveAspectRatio="none">
                    <defs>
                      <linearGradient id={`admspark-${i}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0" stopColor={k.up ? '#8B7DD8' : '#D12515'} stopOpacity="0.25" />
                        <stop offset="1" stopColor={k.up ? '#8B7DD8' : '#D12515'} stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    <polyline
                      points={k.spark.map((v, j) => `${(j / (k.spark.length - 1)) * 240},${40 - (v / 240) * 36}`).join(' ')}
                      fill="none"
                      stroke={k.up ? '#8B7DD8' : '#D12515'}
                      strokeWidth="1.5"
                    />
                    <polygon
                      points={`0,40 ${k.spark.map((v, j) => `${(j / (k.spark.length - 1)) * 240},${40 - (v / 240) * 36}`).join(' ')} 240,40`}
                      fill={`url(#admspark-${i})`}
                    />
                  </svg>
                </div>
              ))}
            </div>

            {/* Chart + needs-attention */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 16, marginBottom: 20 }}>
              <div className="card-soft" style={{ padding: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                  <div>
                    <h4>{t('ბრუნვა — ბოლო 30 დღე', 'GMV — last 30 days')}</h4>
                    <p style={{ marginTop: 4 }}>{t('მთლიანი გაყიდვები პლატფორმაზე', 'Total marketplace sales')}</p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6, font: 'var(--text-body-tiny)', color: 'var(--fg-secondary)' }}>
                      <span style={{ width: 10, height: 10, borderRadius: 2, background: 'var(--moveli-purple-500)' }} /> {t('მიმდინარე', 'Current')}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6, font: 'var(--text-body-tiny)', color: 'var(--fg-secondary)' }}>
                      <span style={{ width: 10, height: 10, borderRadius: 2, background: 'var(--neutral-300)' }} /> {t('წინა', 'Previous')}
                    </span>
                  </div>
                </div>
                <RevenueChart data={chart} />
              </div>

              {/* Needs attention */}
              <div className="card-soft" style={{ padding: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <h4>{t('საჭიროებს ყურადღებას', 'Needs attention')}</h4>
                  <span className="chip" style={{ background: 'var(--negative-soft)', color: 'var(--negative-strong)', padding: '2px 8px' }}>
                    <span className="num">5</span>
                  </span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {[
                    { icon: 'arrow-u-up-left', tint: 'red', ka: 'დაბრუნების მოთხოვნა', en: 'Refund request', meta: '#MV-829140 · ₾948', time: t('2 წთ', '2 min ago') },
                    { icon: 'flag', tint: 'red', ka: 'შეტყობინებული შეფასება', en: 'Flagged review', meta: t('მკრეხელური ენა', 'Inappropriate language'), time: t('18 წთ', '18 min ago') },
                    { icon: 'package-x', tint: 'red', ka: 'მარაგი ამოწურულია', en: 'Stock-out', meta: t('iPhone 15 Pro · 256GB', 'iPhone 15 Pro · 256GB'), time: t('1 სთ', '1 hr ago') },
                    { icon: 'warning', tint: 'red', ka: 'გადახდის შეცდომა', en: 'Payment failure', meta: '5x ' + t('ბოლო საათში', 'in last hour'), time: t('45 წთ', '45 min ago') },
                    { icon: 'chat-circle-dots', tint: 'red', ka: 'პასუხგაუცემელი ჩატი', en: 'Unanswered chat', meta: t('მომხმარებელი 3+ წთ', 'customer 3+ min'), time: t('3 წთ', '3 min ago') },
                  ].map((a, i) => (
                    <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'center', padding: '8px 0', borderBottom: i < 4 ? '1px solid var(--border-default)' : 0 }}>
                      <span style={{ width: 32, height: 32, borderRadius: 'var(--radius-sm)', background: 'var(--negative-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Icon name={a.icon} size={16} style={{ color: 'var(--negative-strong)' }} />
                      </span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ font: 'var(--text-body-secondary-md)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t(a.ka, a.en)}</div>
                        <div style={{ font: 'var(--text-body-tiny)', color: 'var(--fg-tertiary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.meta}</div>
                      </div>
                      <span style={{ font: 'var(--text-body-tiny)', color: 'var(--fg-tertiary)', flexShrink: 0 }}>{a.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Categories + Top customers */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
              {/* Categories breakdown */}
              <div className="card-soft" style={{ padding: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <h4>{t('კატეგორიების წილი', 'Sales by category')}</h4>
                  <a style={{ font: 'var(--text-body-tiny-md)', color: 'var(--moveli-purple-700)' }}>{t('დეტალები', 'Details')} →</a>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {[
                    { ka: 'ელექტრონიკა', en: 'Electronics', val: 38, rev: '₾183K', icon: 'devices' },
                    { ka: 'ტანსაცმელი', en: 'Clothing', val: 24, rev: '₾116K', icon: 't-shirt' },
                    { ka: 'სილამაზე', en: 'Beauty', val: 16, rev: '₾77K', icon: 'sparkle' },
                    { ka: 'სახლი', en: 'Home', val: 12, rev: '₾58K', icon: 'house-line' },
                    { ka: 'სხვა', en: 'Other', val: 10, rev: '₾48K', icon: 'dots-three' },
                  ].map((c, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <span style={{ width: 32, height: 32, borderRadius: 'var(--radius-sm)', background: 'var(--moveli-gradient-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Icon name={c.icon} size={14} style={{ color: 'var(--moveli-purple-700)' }} />
                      </span>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                          <span style={{ font: 'var(--text-body-secondary-md)' }}>{t(c.ka, c.en)}</span>
                          <span style={{ display: 'flex', gap: 12 }}>
                            <span className="num" style={{ font: 'var(--text-body-secondary)', color: 'var(--fg-secondary)' }}>{c.rev}</span>
                            <span className="num" style={{ font: 'var(--text-body-secondary-md)', minWidth: 36, textAlign: 'right' }}>{c.val}%</span>
                          </span>
                        </div>
                        <div style={{ height: 6, background: 'var(--neutral-100)', borderRadius: 999, overflow: 'hidden' }}>
                          <div style={{ width: `${c.val * 2.5}%`, height: '100%', background: 'var(--moveli-gradient)' }} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Live activity feed */}
              <div className="card-soft" style={{ padding: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <h4 style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {t('მიმდინარე აქტივობა', 'Live activity')}
                    <span style={{ width: 8, height: 8, borderRadius: 999, background: 'var(--positive-strong)', boxShadow: '0 0 0 4px rgba(14,177,46,0.15)', animation: 'cursor 1.5s infinite' }} />
                  </h4>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {[
                    { who: 'Nino M.', hue: 260, ka: 'ახალი შეკვეთა', en: 'New order placed', val: '₾948', icon: 'shopping-bag', time: t('ახლა', 'just now') },
                    { who: 'Giorgi T.', hue: 100, ka: 'რეგისტრაცია', en: 'New signup', val: 'giorgi@…', icon: 'user-plus', time: t('1 წთ', '1 min') },
                    { who: 'Mariam K.', hue: 320, ka: 'შეფასება', en: 'Left a review', val: '★★★★★', icon: 'star', time: t('2 წთ', '2 min') },
                    { who: 'Levan G.', hue: 180, ka: 'გადახდა', en: 'Payment received', val: '₾349', icon: 'credit-card', time: t('3 წთ', '3 min') },
                    { who: 'Tamta L.', hue: 40, ka: 'ჩექაუთი დაიწყო', en: 'Started checkout', val: '4 ' + t('ნივთი', 'items'), icon: 'shopping-cart', time: t('4 წთ', '4 min') },
                    { who: 'Beka A.', hue: 220, ka: 'სასურველში დაამატა', en: 'Added to wishlist', val: 'AirPods Pro 2', icon: 'heart', time: t('5 წთ', '5 min') },
                  ].map((a, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <Avatar name={a.who.split(' ').map(s => s[0]).join('')} hue={a.hue} size={28} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ font: 'var(--text-body-secondary)', display: 'flex', alignItems: 'baseline', gap: 6 }}>
                          <span style={{ font: 'var(--text-body-secondary-md)' }}>{a.who}</span>
                          <span style={{ color: 'var(--fg-secondary)' }}>{t(a.ka, a.en)}</span>
                        </div>
                        <div className="num" style={{ font: 'var(--text-body-tiny)', color: 'var(--fg-tertiary)' }}>{a.val}</div>
                      </div>
                      <span style={{ font: 'var(--text-body-tiny)', color: 'var(--fg-tertiary)' }}>{a.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Recent orders table */}
            <div className="card-soft" style={{ padding: 0 }}>
              <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-default)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h4>{t('ბოლო შეკვეთები', 'Recent orders')}</h4>
                  <p style={{ marginTop: 2, font: 'var(--text-body-tiny)' }}>{t('მთელი პლატფორმის შეკვეთები რეალურ დროში', 'All platform orders in real time')}</p>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn btn-ghost btn-sm">
                    <Icon name="funnel" size={14} /> {t('ფილტრი', 'Filter')}
                  </button>
                  <button className="btn btn-ghost btn-sm">
                    <Icon name="download-simple" size={14} /> {t('CSV', 'Export')}
                  </button>
                </div>
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: 'var(--neutral-050)' }}>
                    {[t('შეკვეთა', 'Order'), t('მომხმარებელი', 'Customer'), t('პროდუქცია', 'Items'), t('გადახდა', 'Payment'), t('ჯამი', 'Total'), t('სტატუსი', 'Status'), t('თარიღი', 'Date'), ''].map((h, i) => (
                      <th key={i} style={{ padding: '10px 16px', textAlign: i === 4 ? 'right' : 'left', font: 'var(--text-label-tertiary-bold)', color: 'var(--fg-secondary)', letterSpacing: 0.4, textTransform: 'uppercase' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    { id: '#MV-829140', cust: 'Nino Meladze', email: 'nino.m@gmail.com', hue: 260, items: 2, payment: 'COD', total: 948, status: 'new', date: t('2 წთ', '2 min ago') },
                    { id: '#MV-829132', cust: 'Levan Gabunia', email: 'l.gabunia@…', hue: 180, items: 1, payment: 'Card', total: 349, status: 'packed', date: t('18 წთ', '18 min ago') },
                    { id: '#MV-829108', cust: 'Mariam Kvirikashvili', email: 'mariamk@…', hue: 320, items: 4, payment: 'COD', total: 1240, status: 'shipped', date: t('1 სთ', '1 hr ago') },
                    { id: '#MV-829089', cust: 'Giorgi Tabatadze', email: 'giorgi.t@…', hue: 100, items: 1, payment: 'Card', total: 599, status: 'delivered', date: t('3 სთ', '3 hrs ago') },
                    { id: '#MV-829044', cust: 'Tamta Lekishvili', email: 'tamtal@…', hue: 40, items: 3, payment: 'COD', total: 287, status: 'delivered', date: t('5 სთ', '5 hrs ago') },
                    { id: '#MV-829012', cust: 'Beka Akhalaia', email: 'beka.a@…', hue: 220, items: 2, payment: 'Card', total: 1189, status: 'refunded', date: t('8 სთ', '8 hrs ago') },
                  ].map((o, i) => {
                    const statusMap = {
                      new: { c: 'purple', ka: 'ახალი', en: 'New' },
                      packed: { c: 'cyan', ka: 'შეფუთული', en: 'Packed' },
                      shipped: { c: 'cyan', ka: 'გზაში', en: 'Shipped' },
                      delivered: { c: 'green', ka: 'მიწოდებული', en: 'Delivered' },
                      refunded: { c: 'red', ka: 'დაბრუნებული', en: 'Refunded' },
                    };
                    const s = statusMap[o.status];
                    return (
                      <tr key={i} style={{ borderTop: '1px solid var(--border-default)' }}>
                        <td style={{ padding: '14px 16px' }}>
                          <a style={{ font: 'var(--text-body-secondary-md)', color: 'var(--moveli-purple-700)', cursor: 'pointer' }} className="num">{o.id}</a>
                        </td>
                        <td style={{ padding: '14px 16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <Avatar name={o.cust.split(' ').map(s => s[0]).join('')} hue={o.hue} size={28} />
                            <div style={{ minWidth: 0 }}>
                              <div style={{ font: 'var(--text-body-secondary)', whiteSpace: 'nowrap' }}>{o.cust}</div>
                              <div style={{ font: 'var(--text-body-tiny)', color: 'var(--fg-tertiary)' }}>{o.email}</div>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '14px 16px' }} className="num"><span style={{ font: 'var(--text-body-secondary)' }}>{o.items}</span></td>
                        <td style={{ padding: '14px 16px' }}>
                          <span className="chip" style={{ padding: '3px 10px', background: o.payment === 'COD' ? 'var(--moveli-cyan-050)' : 'var(--moveli-purple-050)', color: o.payment === 'COD' ? 'var(--moveli-cyan-700)' : 'var(--moveli-purple-700)' }}>
                            {o.payment === 'COD' ? <Icon name="hand-coins" size={11} weight="fill" /> : <Icon name="credit-card" size={11} weight="fill" />}
                            {o.payment}
                          </span>
                        </td>
                        <td style={{ padding: '14px 16px', textAlign: 'right' }} className="num"><span style={{ font: 'var(--text-body-secondary-md)' }}>₾{o.total.toLocaleString()}</span></td>
                        <td style={{ padding: '14px 16px' }}>
                          <span className={`chip chip-tint-${s.c}`} style={{ padding: '4px 10px', font: 'var(--text-body-tiny-md)' }}>{t(s.ka, s.en)}</span>
                        </td>
                        <td style={{ padding: '14px 16px' }}><span style={{ font: 'var(--text-body-tiny)', color: 'var(--fg-tertiary)' }}>{o.date}</span></td>
                        <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                          <button className="btn btn-ghost btn-sm" style={{ padding: 6 }}>
                            <Icon name="dots-three" size={16} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* Re-export RevenueChart (was in screen-seller.jsx, now moved here) */
const RevenueChart = ({ data }) => {
  const w = 600, h = 220, pad = 32;
  const max = 240;
  const pts = data.map((v, i) => [pad + (i / (data.length - 1)) * (w - pad * 2), h - pad - (v / max) * (h - pad * 2)]);
  const prev = data.map((v, i) => [pad + (i / (data.length - 1)) * (w - pad * 2), h - pad - ((v * 0.78 + 20) / max) * (h - pad * 2)]);
  const line = pts.map((p, i) => (i === 0 ? `M${p[0]},${p[1]}` : `L${p[0]},${p[1]}`)).join(' ');
  const area = `${line} L${pts[pts.length - 1][0]},${h - pad} L${pts[0][0]},${h - pad} Z`;
  const prevLine = prev.map((p, i) => (i === 0 ? `M${p[0]},${p[1]}` : `L${p[0]},${p[1]}`)).join(' ');

  return (
    <svg viewBox={`0 0 ${w} ${h}`} style={{ width: '100%', height: 220 }}>
      <defs>
        <linearGradient id="rev-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#8B7DD8" stopOpacity="0.25" />
          <stop offset="1" stopColor="#7BC8E6" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="rev-line" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#9B8EE5" />
          <stop offset="1" stopColor="#7DCEEA" />
        </linearGradient>
      </defs>
      {[0, 1, 2, 3, 4].map(i => (
        <line key={i} x1={pad} x2={w - pad} y1={pad + (i / 4) * (h - pad * 2)} y2={pad + (i / 4) * (h - pad * 2)} stroke="var(--border-default)" strokeWidth="1" strokeDasharray={i === 4 ? '0' : '3 3'} />
      ))}
      {['₾60K', '₾45K', '₾30K', '₾15K', '₾0'].map((l, i) => (
        <text key={l} x="4" y={pad + (i / 4) * (h - pad * 2) + 4} fontSize="10" fill="var(--fg-tertiary)" fontFamily="var(--font-numbers)">{l}</text>
      ))}
      <path d={prevLine} stroke="var(--neutral-300)" strokeWidth="1.5" fill="none" strokeDasharray="4 4" />
      <path d={area} fill="url(#rev-fill)" />
      <path d={line} stroke="url(#rev-line)" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <circle cx={pts[20][0]} cy={pts[20][1]} r="5" fill="white" stroke="#8B7DD8" strokeWidth="2.5" />
      <g transform={`translate(${pts[20][0] - 60},${pts[20][1] - 50})`}>
        <rect width="120" height="40" rx="6" fill="#1B1E21" />
        <text x="10" y="16" fill="rgba(255,255,255,0.6)" fontSize="10" fontFamily="var(--font-body)">May 21</text>
        <text x="10" y="32" fill="white" fontSize="13" fontWeight="700" fontFamily="var(--font-numbers)">₾18,420</text>
      </g>
      {[0, 7, 14, 21, 27].map(i => (
        <text key={i} x={pts[i][0] - 10} y={h - 6} fontSize="10" fill="var(--fg-tertiary)" fontFamily="var(--font-body)">
          {['1', '7', '14', '21', '28'][[0, 7, 14, 21, 27].indexOf(i)]}
        </text>
      ))}
    </svg>
  );
};

Object.assign(window, { AdminScreen, RevenueChart });
