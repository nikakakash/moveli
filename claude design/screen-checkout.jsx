/* MOVELI — Cart & Checkout (single page, 2 cols) */

const CheckoutScreen = ({ lang = 'ka' }) => {
  const t = (ka, en) => (lang === 'ka' ? ka : en);
  const [step, setStep] = React.useState(1); // 1: address, 2: delivery, 3: payment

  const items = [
    { image: 'sneakers', title: t('Nike Air Max 270 · წითელი', 'Nike Air Max 270 · Red'), variant: t('EU 42 · წითელი/თეთრი', 'EU 42 · Red/White'), price: 349, qty: 1, vendor: 'Nike Store Georgia' },
    { image: 'airpods', title: t('AirPods Pro მე-2 თაობა', 'AirPods Pro 2nd gen'), variant: t('USB-C ვერსია', 'USB-C version'), price: 599, qty: 1, vendor: 'Apple Store Georgia' },
    { image: 'serum', title: t('The Ordinary Niacinamide 10%', 'The Ordinary Niacinamide 10%'), variant: '30ml', price: 28, qty: 2, vendor: 'Beauty Hub' },
  ];

  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
  const delivery = 0;
  const discount = 80;
  const total = subtotal + delivery - discount;

  return (
    <div className="screen">
      <TopBar lang={lang} active="" cartCount={items.length} />

      <div style={{ overflow: 'auto', flex: 1, background: 'var(--neutral-050)' }}>
        {/* Header + stepper */}
        <div style={{ padding: '24px 40px 16px', background: 'var(--white)', borderBottom: '1px solid var(--border-default)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2>{t('შენი კალათა', 'Your cart')}</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
              {[
                { id: 1, ka: 'მისამართი', en: 'Address' },
                { id: 2, ka: 'მიწოდება', en: 'Delivery' },
                { id: 3, ka: 'გადახდა', en: 'Payment' },
              ].map((s, i, arr) => (
                <React.Fragment key={s.id}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{
                      width: 28, height: 28, borderRadius: 999,
                      background: s.id <= step ? 'var(--moveli-gradient)' : 'var(--neutral-100)',
                      color: s.id <= step ? 'white' : 'var(--fg-tertiary)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      font: '700 13px/1 var(--font-numbers)',
                    }}>
                      {s.id < step ? <Icon name="check" weight="bold" size={14} /> : s.id}
                    </span>
                    <span style={{
                      font: 'var(--text-body-secondary-md)',
                      color: s.id <= step ? 'var(--fg-primary)' : 'var(--fg-tertiary)',
                    }}>{t(s.ka, s.en)}</span>
                  </div>
                  {i < arr.length - 1 && (
                    <div style={{ width: 32, height: 2, background: s.id < step ? 'var(--moveli-purple-300)' : 'var(--neutral-200)' }} />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>

        <div style={{ padding: '24px 40px 40px', display: 'grid', gridTemplateColumns: '1fr 380px', gap: 24, alignItems: 'flex-start' }}>
          {/* LEFT: cart items + accordions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Items group */}
            <div className="card-soft" style={{ padding: 0 }}>
              <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-default)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h4>{t('კალათის ნივთები', 'Cart items')} <span className="num" style={{ color: 'var(--fg-tertiary)', fontWeight: 400 }}>({items.length})</span></h4>
                <a style={{ font: 'var(--text-body-tiny-md)', color: 'var(--moveli-purple-700)', cursor: 'pointer' }}>{t('გასუფთავება', 'Clear cart')}</a>
              </div>
              {items.map((item, i) => (
                <div key={i} style={{
                  padding: '16px 20px', display: 'flex', gap: 16, alignItems: 'center',
                  borderBottom: i < items.length - 1 ? '1px solid var(--border-default)' : 0,
                }}>
                  <div style={{
                    width: 80, height: 80, borderRadius: 'var(--radius-md)',
                    background: `url(${stockSrc(item.image, 160, 160)}) center/cover var(--neutral-050)`,
                    flexShrink: 0,
                  }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ font: 'var(--text-body-tiny)', color: 'var(--fg-tertiary)' }}>{item.vendor}</div>
                    <div style={{ font: 'var(--text-body-base-md)', marginTop: 2 }}>{item.title}</div>
                    <div style={{ font: 'var(--text-body-secondary)', color: 'var(--fg-secondary)', marginTop: 4 }}>{item.variant}</div>
                  </div>
                  <div style={{
                    display: 'flex', alignItems: 'center', border: '1px solid var(--border-default)',
                    borderRadius: 'var(--radius-sm)', overflow: 'hidden',
                  }}>
                    <button style={{ padding: '8px 12px', background: 'transparent', border: 0, cursor: 'pointer' }}>
                      <Icon name="minus" size={12} />
                    </button>
                    <span className="num" style={{ padding: '0 8px', minWidth: 24, textAlign: 'center', font: 'var(--text-label-secondary-bold)' }}>{item.qty}</span>
                    <button style={{ padding: '8px 12px', background: 'transparent', border: 0, cursor: 'pointer' }}>
                      <Icon name="plus" size={12} />
                    </button>
                  </div>
                  <div style={{ textAlign: 'right', minWidth: 90 }}>
                    <div className="num" style={{ font: 'var(--text-num-small)', fontSize: 18, color: 'var(--fg-primary)' }}>₾{(item.price * item.qty).toLocaleString()}</div>
                    {item.qty > 1 && <div className="num" style={{ font: 'var(--text-body-tiny)', color: 'var(--fg-tertiary)' }}>₾{item.price} × {item.qty}</div>}
                  </div>
                  <button style={{ background: 'transparent', border: 0, cursor: 'pointer', color: 'var(--fg-tertiary)', padding: 6 }}>
                    <Icon name="trash" size={16} />
                  </button>
                </div>
              ))}
            </div>

            {/* Address section */}
            <div className="card-soft">
              <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-default)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h4 style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ width: 24, height: 24, borderRadius: 999, background: 'var(--moveli-gradient)', color: 'white', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', font: '700 12px/1 var(--font-numbers)' }}>1</span>
                  {t('მიწოდების მისამართი', 'Delivery address')}
                </h4>
                <a style={{ font: 'var(--text-body-tiny-md)', color: 'var(--moveli-purple-700)', cursor: 'pointer' }}>{t('+ ახალი მისამართი', '+ Add new')}</a>
              </div>
              <div style={{ padding: 20, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {[
                  { id: 0, ka: 'სახლი', en: 'Home', icon: 'house', addr: t('თბილისი · ვაკე · ჭავჭავაძის გამზ. 47, ბ. 12', 'Tbilisi · Vake · Chavchavadze ave. 47, apt. 12') },
                  { id: 1, ka: 'სამსახური', en: 'Work', icon: 'briefcase', addr: t('თბილისი · საბურთალო · პეკინის ქ. 1', 'Tbilisi · Saburtalo · Pekini st. 1') },
                ].map(a => (
                  <label key={a.id} style={{
                    padding: 16, border: a.id === 0 ? '2px solid var(--moveli-purple-500)' : '1px solid var(--border-default)',
                    background: a.id === 0 ? 'var(--moveli-purple-050)' : 'var(--white)',
                    borderRadius: 'var(--radius-md)', cursor: 'pointer',
                    display: 'flex', alignItems: 'flex-start', gap: 12,
                  }}>
                    <span style={{
                      width: 18, height: 18, borderRadius: 999, marginTop: 2, flexShrink: 0,
                      border: a.id === 0 ? '5px solid var(--moveli-purple-500)' : '1.5px solid var(--border-strong)',
                      background: a.id === 0 ? 'var(--white)' : 'transparent',
                    }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Icon name={a.icon} size={14} style={{ color: 'var(--fg-secondary)' }} />
                        <span style={{ font: 'var(--text-body-secondary-md)' }}>{t(a.ka, a.en)}</span>
                      </div>
                      <div style={{ font: 'var(--text-body-secondary)', color: 'var(--fg-secondary)', marginTop: 4 }}>{a.addr}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Delivery method */}
            <div className="card-soft">
              <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-default)' }}>
                <h4 style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ width: 24, height: 24, borderRadius: 999, background: 'var(--moveli-gradient)', color: 'white', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', font: '700 12px/1 var(--font-numbers)' }}>2</span>
                  {t('მიწოდების მეთოდი', 'Delivery method')}
                </h4>
              </div>
              <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[
                  { ka: 'ექსპრეს მიწოდება დღეს', en: 'Express delivery today', sub: t('2–5 საათში', '2–5 hours'), price: 'უფასოდ', priceEn: 'Free', icon: 'lightning', selected: true, badge: t('რეკომენდებული', 'Recommended') },
                  { ka: 'სტანდარტული მიწოდება ხვალ', en: 'Standard delivery tomorrow', sub: t('09:00 – 18:00', '09:00 – 18:00'), price: '₾0', priceEn: '₾0', icon: 'truck', selected: false },
                  { ka: 'მოგქონდე თვითონ', en: 'Pickup', sub: t('5 პუნქტი თბილისში', '5 pickup points in Tbilisi'), price: '₾0', priceEn: '₾0', icon: 'storefront', selected: false },
                ].map((d, i) => (
                  <label key={i} style={{
                    padding: '14px 16px', border: d.selected ? '2px solid var(--moveli-purple-500)' : '1px solid var(--border-default)',
                    background: d.selected ? 'var(--moveli-purple-050)' : 'var(--white)',
                    borderRadius: 'var(--radius-md)', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: 14,
                  }}>
                    <span style={{
                      width: 18, height: 18, borderRadius: 999,
                      border: d.selected ? '5px solid var(--moveli-purple-500)' : '1.5px solid var(--border-strong)',
                      background: d.selected ? 'var(--white)' : 'transparent', flexShrink: 0,
                    }} />
                    <Icon name={d.icon} size={20} style={{ color: 'var(--moveli-purple-600)' }} weight="fill" />
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ font: 'var(--text-body-base-md)' }}>{t(d.ka, d.en)}</span>
                        {d.badge && <span className="chip chip-tint-purple" style={{ padding: '2px 8px', font: 'var(--text-body-tiny-md)' }}>{d.badge}</span>}
                      </div>
                      <div style={{ font: 'var(--text-body-secondary)', color: 'var(--fg-secondary)', marginTop: 2 }}>{d.sub}</div>
                    </div>
                    <span className="num" style={{ font: 'var(--text-num-small)', fontSize: 16 }}>{lang === 'ka' ? d.price : d.priceEn}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Payment method */}
            <div className="card-soft">
              <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-default)' }}>
                <h4 style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ width: 24, height: 24, borderRadius: 999, background: 'var(--moveli-gradient)', color: 'white', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', font: '700 12px/1 var(--font-numbers)' }}>3</span>
                  {t('გადახდის მეთოდი', 'Payment method')}
                </h4>
              </div>
              <div style={{ padding: 20, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {[
                  { ka: 'ნაღდი ანგარიშსწორებით', en: 'Cash on delivery', sub: t('გადაიხადე როცა მიიღებ', 'Pay when received'), icon: 'hand-coins', selected: true, badge: '0%' },
                  { ka: 'საბანკო ბარათით', en: 'Bank card', sub: t('Visa, Mastercard', 'Visa, Mastercard'), icon: 'credit-card', selected: false },
                ].map((p, i) => (
                  <label key={i} style={{
                    padding: 16, border: p.selected ? '2px solid var(--moveli-purple-500)' : '1px solid var(--border-default)',
                    background: p.selected ? 'var(--moveli-purple-050)' : 'var(--white)',
                    borderRadius: 'var(--radius-md)', cursor: 'pointer',
                    display: 'flex', alignItems: 'flex-start', gap: 12, position: 'relative',
                  }}>
                    {p.badge && (
                      <span className="chip chip-tint-cyan" style={{ position: 'absolute', top: 12, right: 12, padding: '2px 8px', font: 'var(--text-body-tiny-md)' }}>
                        {p.badge} {t('საკომისიო', 'fee')}
                      </span>
                    )}
                    <span style={{
                      width: 18, height: 18, borderRadius: 999, marginTop: 2,
                      border: p.selected ? '5px solid var(--moveli-purple-500)' : '1.5px solid var(--border-strong)',
                      background: p.selected ? 'var(--white)' : 'transparent', flexShrink: 0,
                    }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Icon name={p.icon} size={18} style={{ color: 'var(--moveli-purple-600)' }} weight="fill" />
                        <span style={{ font: 'var(--text-body-base-md)' }}>{t(p.ka, p.en)}</span>
                      </div>
                      <div style={{ font: 'var(--text-body-secondary)', color: 'var(--fg-secondary)', marginTop: 4 }}>{p.sub}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT: order summary */}
          <aside style={{ position: 'sticky', top: 20 }}>
            <div className="card-soft" style={{ padding: 20 }}>
              <h4 style={{ marginBottom: 16 }}>{t('შეკვეთის შეჯამება', 'Order summary')}</h4>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[
                  { ka: 'პროდუქტის ღირებულება', en: 'Subtotal', val: `₾${subtotal.toLocaleString()}` },
                  { ka: 'მიწოდება', en: 'Delivery', val: t('უფასოდ', 'Free'), valStyle: { color: 'var(--positive-strong)' } },
                  { ka: 'ფასდაკლება (MOVELI15)', en: 'Discount (MOVELI15)', val: `−₾${discount}`, valStyle: { color: 'var(--positive-strong)' } },
                ].map((r, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ font: 'var(--text-body-secondary)', color: 'var(--fg-secondary)' }}>{t(r.ka, r.en)}</span>
                    <span className="num" style={{ font: 'var(--text-body-secondary-md)', ...r.valStyle }}>{r.val}</span>
                  </div>
                ))}
              </div>

              {/* Promo */}
              <div style={{ marginTop: 14, display: 'flex', gap: 8 }}>
                <input className="input" placeholder={t('პრომოკოდი', 'Promo code')} style={{ padding: '10px 12px', font: 'var(--text-body-secondary)' }} />
                <button className="btn btn-secondary btn-sm">{t('გამოყენება', 'Apply')}</button>
              </div>

              <div style={{ marginTop: 14, padding: '10px 12px', background: 'var(--positive-soft)', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', gap: 8 }}>
                <Icon name="tag" size={14} weight="fill" style={{ color: 'var(--positive-strong)' }} />
                <span style={{ font: 'var(--text-body-tiny-md)', color: 'var(--positive-strong)' }}>
                  MOVELI15 {t('გამოყენებულია', 'applied')} · −₾{discount}
                </span>
              </div>

              <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--border-default)', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={{ font: 'var(--text-label-primary-bold)' }}>{t('ჯამი', 'Total')}</span>
                <span className="num" style={{ font: '800 28px/1 var(--font-numbers)' }}>₾{total.toLocaleString()}</span>
              </div>
              <div style={{ font: 'var(--text-body-tiny)', color: 'var(--fg-tertiary)', textAlign: 'right', marginTop: 2 }}>
                {t('დღგ ჩათვლით', 'VAT included')}
              </div>

              <button className="btn btn-primary btn-lg" style={{ width: '100%', marginTop: 18 }}>
                <Icon name="lock-simple" size={16} weight="fill" />
                {t('შეკვეთის გაფორმება', 'Place order')} · ₾{total.toLocaleString()}
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 12, font: 'var(--text-body-tiny)', color: 'var(--fg-tertiary)' }}>
                <Icon name="shield-check" size={14} style={{ color: 'var(--positive-strong)' }} />
                {t('უსაფრთხო შენახვა · SSL დაშიფვრით', 'Secure checkout · SSL encrypted')}
              </div>
            </div>

            <div className="card-soft" style={{ padding: 16, marginTop: 12, display: 'flex', gap: 12, alignItems: 'center', background: 'var(--moveli-cyan-050)' }}>
              <div style={{ width: 40, height: 40, borderRadius: 999, background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon name="gift" size={20} style={{ color: 'var(--moveli-cyan-700)' }} weight="fill" />
              </div>
              <div>
                <div style={{ font: 'var(--text-body-secondary-md)', color: 'var(--moveli-cyan-800)' }}>{t('₾48 ქულის გასაკეთებლად', "You'll earn 48 points")}</div>
                <div style={{ font: 'var(--text-body-tiny)', color: 'var(--moveli-cyan-700)' }}>{t('ლოიალობის პროგრამა', 'Loyalty program')}</div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

Object.assign(window, { CheckoutScreen });
