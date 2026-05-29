/* MOVELI — Profile / Orders history */

const ProfileScreen = ({ lang = 'ka' }) => {
  const t = (ka, en) => (lang === 'ka' ? ka : en);

  const nav = [
    { id: 'orders', icon: 'package', ka: 'ჩემი შეკვეთები', en: 'My orders', count: 12, active: true },
    { id: 'wish', icon: 'heart', ka: 'სასურველი', en: 'Wishlist', count: 28 },
    { id: 'reviews', icon: 'star', ka: 'ჩემი შეფასებები', en: 'My reviews', count: 7 },
    { id: 'addr', icon: 'map-pin', ka: 'მისამართები', en: 'Addresses' },
    { id: 'pay', icon: 'credit-card', ka: 'გადახდის მეთოდები', en: 'Payment methods' },
    { id: 'loyal', icon: 'medal', ka: 'ლოიალობა', en: 'Loyalty' },
    { id: 'notif', icon: 'bell', ka: 'შეტყობინებები', en: 'Notifications' },
    { id: 'sett', icon: 'gear', ka: 'პარამეტრები', en: 'Settings' },
  ];

  const orders = [
    {
      id: '#MV-829140',
      date: t('27 მაისი, 2026', 'May 27, 2026'),
      status: 'shipping', statusKa: 'მიწოდების პროცესში', statusEn: 'In transit',
      items: [
        { img: 'sneakers', qty: 1 },
        { img: 'airpods', qty: 1 },
      ],
      total: 948,
      eta: t('დღეს 16:30–18:00', 'Today 16:30–18:00'),
      progress: 3,
    },
    {
      id: '#MV-827331',
      date: t('25 მაისი, 2026', 'May 25, 2026'),
      status: 'delivered', statusKa: 'მიწოდებული', statusEn: 'Delivered',
      items: [
        { img: 'lipstick', qty: 2 },
        { img: 'serum', qty: 1 },
        { img: 'perfume', qty: 1 },
      ],
      total: 312,
      eta: t('მიწოდებული 25 მაისს', 'Delivered May 25'),
      progress: 4,
    },
    {
      id: '#MV-824012',
      date: t('20 მაისი, 2026', 'May 20, 2026'),
      status: 'returned', statusKa: 'დაბრუნებული', statusEn: 'Returned',
      items: [
        { img: 'jacket', qty: 1 },
      ],
      total: 189,
      eta: t('თანხა დაბრუნდა', 'Refund processed'),
      progress: 4,
    },
  ];

  const stages = [
    { ka: 'შეკვეთა', en: 'Order' },
    { ka: 'შეფუთვა', en: 'Packed' },
    { ka: 'გზაშია', en: 'In transit' },
    { ka: 'მიწოდებული', en: 'Delivered' },
  ];

  return (
    <div className="screen">
      <TopBar lang={lang} active="" />

      <div style={{ overflow: 'auto', flex: 1, background: 'var(--neutral-050)' }}>
        <div style={{ padding: '24px 40px 40px', display: 'grid', gridTemplateColumns: '260px 1fr', gap: 24, alignItems: 'flex-start' }}>
          {/* SIDEBAR */}
          <aside style={{ position: 'sticky', top: 20 }}>
            <div className="card-soft" style={{ padding: 20, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, textAlign: 'center', background: 'linear-gradient(180deg, var(--moveli-purple-050) 0%, var(--white) 100%)' }}>
              <div style={{ position: 'relative' }}>
                <Avatar name="NM" hue={260} size={72} />
                <button style={{ position: 'absolute', bottom: 0, right: 0, width: 24, height: 24, borderRadius: 999, background: 'var(--moveli-gradient)', border: '2px solid white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon name="pencil-simple" size={10} style={{ color: 'white' }} />
                </button>
              </div>
              <div>
                <div style={{ font: 'var(--text-heading-compact)' }}>{t('ნინო მელაძე', 'Nino Meladze')}</div>
                <div style={{ font: 'var(--text-body-tiny)', color: 'var(--fg-tertiary)' }}>nino.m@gmail.com</div>
              </div>
              <span className="chip chip-tint-purple" style={{ padding: '4px 12px' }}>
                <Icon name="crown-simple" size={12} weight="fill" /> {t('Gold წევრი', 'Gold member')} · <span className="num">2,840</span> {t('ქულა', 'pts')}
              </span>
            </div>

            <nav className="card-soft" style={{ marginTop: 12, padding: 8 }}>
              {nav.map(n => (
                <a key={n.id} style={{
                  display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px',
                  borderRadius: 'var(--radius-sm)',
                  background: n.active ? 'var(--moveli-purple-050)' : 'transparent',
                  color: n.active ? 'var(--moveli-purple-700)' : 'var(--fg-primary)',
                  cursor: 'pointer',
                }}>
                  <Icon name={n.icon} size={18} weight={n.active ? 'fill' : 'regular'} />
                  <span style={{ flex: 1, font: 'var(--text-body-secondary-md)' }}>{t(n.ka, n.en)}</span>
                  {n.count != null && (
                    <span className="num" style={{
                      font: 'var(--text-body-tiny-md)',
                      color: n.active ? 'var(--moveli-purple-700)' : 'var(--fg-tertiary)',
                      background: n.active ? 'var(--white)' : 'var(--neutral-100)',
                      padding: '2px 8px', borderRadius: 999,
                    }}>{n.count}</span>
                  )}
                </a>
              ))}
              <div style={{ height: 1, background: 'var(--border-default)', margin: '8px 0' }} />
              <a style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', color: 'var(--negative)', cursor: 'pointer' }}>
                <Icon name="sign-out" size={18} />
                <span style={{ font: 'var(--text-body-secondary-md)' }}>{t('გასვლა', 'Sign out')}</span>
              </a>
            </nav>
          </aside>

          {/* MAIN */}
          <div>
            {/* Stat strip */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 16 }}>
              {[
                { ka: 'სულ შეკვეთა', en: 'Total orders', val: '47', sub: t('წლის განმავლობაში', 'this year'), icon: 'package', tint: 'purple' },
                { ka: 'დახარჯული', en: 'Spent', val: '₾8,420', sub: t('კარგი არჩევანი!', 'nice choices!'), icon: 'wallet', tint: 'cyan' },
                { ka: 'ლოიალობის ქულა', en: 'Loyalty points', val: '2,840', sub: t('Gold სტატუსი', 'Gold tier'), icon: 'medal', tint: 'purple' },
                { ka: 'დაზოგილი', en: 'Saved', val: '₾1,260', sub: t('აქციებიდან', 'on deals'), icon: 'piggy-bank', tint: 'cyan' },
              ].map((s, i) => (
                <div key={i} className="card-soft" style={{ padding: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <span style={{ font: 'var(--text-body-tiny)', color: 'var(--fg-secondary)' }}>{t(s.ka, s.en)}</span>
                    <Icon name={s.icon} size={16} style={{ color: `var(--moveli-${s.tint}-600)` }} />
                  </div>
                  <div className="num" style={{ font: '800 26px/1 var(--font-numbers)', marginTop: 8, color: 'var(--fg-primary)' }}>{s.val}</div>
                  <div style={{ font: 'var(--text-body-tiny)', color: 'var(--fg-tertiary)', marginTop: 4 }}>{s.sub}</div>
                </div>
              ))}
            </div>

            {/* Orders header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3>{t('შეკვეთების ისტორია', 'Order history')}</h3>
              <div style={{ display: 'flex', gap: 4, padding: 4, background: 'var(--white)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-default)' }}>
                {[t('ყველა', 'All'), t('აქტიური', 'Active'), t('მიწოდებული', 'Delivered'), t('გაუქმებული', 'Cancelled')].map((f, i) => (
                  <button key={i} className={i === 0 ? 'chip chip-active' : 'chip'} style={{ background: i === 0 ? 'var(--moveli-purple-050)' : 'transparent', padding: '6px 14px' }}>{f}</button>
                ))}
              </div>
            </div>

            {/* Orders */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {orders.map((o, i) => {
                const statusColor =
                  o.status === 'shipping' ? 'cyan' :
                  o.status === 'delivered' ? 'green' :
                  'red';
                return (
                  <div key={i} className="card-soft" style={{ padding: 0 }}>
                    {/* header row */}
                    <div style={{ padding: '14px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-default)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                        <div>
                          <div style={{ font: 'var(--text-body-tiny)', color: 'var(--fg-tertiary)' }}>{t('შეკვეთა', 'Order')}</div>
                          <div className="num" style={{ font: 'var(--text-body-secondary-md)' }}>{o.id}</div>
                        </div>
                        <div>
                          <div style={{ font: 'var(--text-body-tiny)', color: 'var(--fg-tertiary)' }}>{t('თარიღი', 'Date')}</div>
                          <div style={{ font: 'var(--text-body-secondary-md)' }}>{o.date}</div>
                        </div>
                        <div>
                          <div style={{ font: 'var(--text-body-tiny)', color: 'var(--fg-tertiary)' }}>{t('ჯამი', 'Total')}</div>
                          <div className="num" style={{ font: 'var(--text-body-secondary-md)' }}>₾{o.total.toLocaleString()}</div>
                        </div>
                      </div>
                      <span className={`chip chip-tint-${statusColor}`} style={{ padding: '6px 12px' }}>
                        {o.status === 'shipping' && <Icon name="truck" size={12} weight="fill" />}
                        {o.status === 'delivered' && <Icon name="check-circle" size={12} weight="fill" />}
                        {o.status === 'returned' && <Icon name="arrow-u-up-left" size={12} weight="bold" />}
                        {t(o.statusKa, o.statusEn)}
                      </span>
                    </div>

                    {/* body row */}
                    <div style={{ padding: 20, display: 'flex', gap: 24, alignItems: 'center' }}>
                      {/* item thumbs */}
                      <div style={{ display: 'flex', gap: -8 }}>
                        {o.items.map((it, j) => (
                          <div key={j} style={{
                            width: 64, height: 64, borderRadius: 'var(--radius-md)',
                            background: `url(${stockSrc(it.img, 128, 128)}) center/cover var(--neutral-050)`,
                            border: '2px solid white',
                            marginLeft: j > 0 ? -12 : 0,
                          }} />
                        ))}
                        {o.items.length > 2 && (
                          <div style={{
                            width: 64, height: 64, borderRadius: 'var(--radius-md)',
                            background: 'var(--neutral-100)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            font: '700 14px/1 var(--font-body)', color: 'var(--fg-secondary)',
                            marginLeft: -12, border: '2px solid white',
                          }}>+{o.items.length - 2}</div>
                        )}
                      </div>

                      {/* progress / status */}
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                          <span style={{ font: 'var(--text-body-secondary-md)' }}>{o.eta}</span>
                        </div>
                        {o.status !== 'returned' && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            {stages.map((s, j) => (
                              <React.Fragment key={j}>
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                                  <span style={{
                                    width: 20, height: 20, borderRadius: 999,
                                    background: j < o.progress ? 'var(--moveli-gradient)' : 'var(--neutral-100)',
                                    color: j < o.progress ? 'white' : 'var(--fg-tertiary)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                  }}>
                                    {j < o.progress ? <Icon name="check" weight="bold" size={11} /> : <Icon name="circle" size={6} weight="fill" />}
                                  </span>
                                  <span style={{
                                    font: 'var(--text-body-tiny)',
                                    color: j < o.progress ? 'var(--fg-primary)' : 'var(--fg-tertiary)',
                                  }}>{t(s.ka, s.en)}</span>
                                </div>
                                {j < stages.length - 1 && (
                                  <div style={{ flex: 1, height: 2, background: j < o.progress - 1 ? 'var(--moveli-purple-300)' : 'var(--neutral-200)', marginBottom: 16 }} />
                                )}
                              </React.Fragment>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* actions */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, minWidth: 140 }}>
                        {o.status === 'shipping' && <button className="btn btn-primary btn-sm">{t('თვალთვალი', 'Track')}</button>}
                        {o.status === 'delivered' && <button className="btn btn-primary btn-sm">{t('კიდევ ერთხელ', 'Buy again')}</button>}
                        {o.status === 'returned' && <button className="btn btn-secondary btn-sm">{t('დეტალები', 'Details')}</button>}
                        <button className="btn btn-ghost btn-sm" style={{ font: 'var(--text-body-tiny-md)' }}>
                          <Icon name="receipt" size={14} /> {t('ინვოისი', 'Invoice')}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={{ marginTop: 16, textAlign: 'center' }}>
              <button className="btn btn-secondary">{t('მეტი შეკვეთა', 'Load more orders')}</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

Object.assign(window, { ProfileScreen });
