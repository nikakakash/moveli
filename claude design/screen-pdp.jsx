/* MOVELI — Product Detail Page (PDP) — gallery + zoom + add-to-cart animation */

const PdpScreen = ({ lang = 'ka' }) => {
  const t = (ka, en) => (lang === 'ka' ? ka : en);
  const [activeImg, setActiveImg] = React.useState(0);
  const [hovering, setHovering] = React.useState(false);
  const [zoomPos, setZoomPos] = React.useState({ x: 50, y: 50 });
  const [selectedColor, setSelectedColor] = React.useState(0);
  const [qty, setQty] = React.useState(1);
  const [flying, setFlying] = React.useState(false);
  const [cartBump, setCartBump] = React.useState(false);
  const heroRef = React.useRef(null);

  const colors = [
    { name: t('თეთრი', 'White'), bg: '#F2F2F2', img: 'sneakers2' },
    { name: t('წითელი', 'Red'), bg: '#D12515', img: 'sneakers' },
    { name: t('შავი', 'Black'), bg: '#1B1E21', img: 'shoes' },
  ];

  const gallery = [
    colors[selectedColor].img,
    'shoes',
    'sneakers',
    'sneakers2',
    'hat',
  ];

  const handleAddToCart = () => {
    setFlying(true);
    setTimeout(() => setCartBump(true), 600);
    setTimeout(() => setFlying(false), 900);
    setTimeout(() => setCartBump(false), 1300);
  };

  return (
    <div className="screen" style={{ position: 'relative' }}>
      <style>{`
        @keyframes flyToCart {
          0%   { transform: translate(0, 0) scale(1); opacity: 1; }
          30%  { transform: translate(160px, -120px) scale(0.7); opacity: 1; }
          70%  { transform: translate(560px, -340px) scale(0.4); opacity: 0.9; }
          100% { transform: translate(920px, -540px) scale(0.1); opacity: 0; }
        }
        @keyframes cartBump {
          0%, 100% { transform: scale(1); }
          40% { transform: scale(1.25) rotate(-8deg); }
          70% { transform: scale(0.92); }
        }
      `}</style>
      <TopBar lang={lang} active="cat" cartBump={cartBump} />
      {/* Cart bump overlay — re-renders the top bar's cart badge animation via override */}
      <style>{`
        ${cartBump ? `.pdp-cart-target { animation: cartBump 700ms var(--ease-out); }` : ''}
      `}</style>

      <div style={{ overflow: 'auto', flex: 1 }}>
        {/* Breadcrumb */}
        <div style={{ padding: '16px 40px 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, font: 'var(--text-body-tiny)', color: 'var(--fg-tertiary)' }}>
            <span>{t('მთავარი', 'Home')}</span><Icon name="caret-right" size={12} />
            <span>{t('ტანსაცმელი', 'Clothing')}</span><Icon name="caret-right" size={12} />
            <span>{t('ფეხსაცმელი', 'Footwear')}</span><Icon name="caret-right" size={12} />
            <span style={{ color: 'var(--fg-primary)' }}>Nike Air Max 270</span>
          </div>
        </div>

        {/* Main grid */}
        <section style={{ padding: '20px 40px 40px', display: 'grid', gridTemplateColumns: '90px 1fr 420px', gap: 24, alignItems: 'flex-start' }}>
          {/* Thumbnails column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {gallery.map((img, i) => (
              <button
                key={i}
                onClick={() => setActiveImg(i)}
                style={{
                  width: 84, height: 84, padding: 0, borderRadius: 'var(--radius-md)',
                  border: i === activeImg ? '2px solid var(--moveli-purple-500)' : '1px solid var(--border-default)',
                  background: `url(${stockSrc(img, 168, 168)}) center/cover var(--neutral-050)`,
                  cursor: 'pointer',
                }}
              />
            ))}
            <button style={{
              width: 84, height: 84, borderRadius: 'var(--radius-md)', background: 'var(--neutral-050)',
              border: '1px dashed var(--border-strong)', cursor: 'pointer',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2,
            }}>
              <Icon name="play-circle" size={20} style={{ color: 'var(--moveli-purple-600)' }} />
              <span style={{ font: 'var(--text-body-tiny-md)', color: 'var(--fg-secondary)' }}>{t('ვიდეო', 'Video')}</span>
            </button>
          </div>

          {/* Hero image with zoom */}
          <div
            ref={heroRef}
            onMouseEnter={() => setHovering(true)}
            onMouseLeave={() => setHovering(false)}
            onMouseMove={(e) => {
              const r = e.currentTarget.getBoundingClientRect();
              setZoomPos({
                x: ((e.clientX - r.left) / r.width) * 100,
                y: ((e.clientY - r.top) / r.height) * 100,
              });
            }}
            style={{
              position: 'relative', borderRadius: 'var(--radius-xl)',
              background: `var(--neutral-050)`,
              aspectRatio: '1 / 1', overflow: 'hidden',
              cursor: 'zoom-in',
              border: '1px solid var(--border-default)',
            }}
          >
            <img
              id="pdp-hero-img"
              src={stockSrc(gallery[activeImg], 1200, 1200)}
              alt=""
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />
            {/* zoom overlay */}
            {hovering && (
              <div style={{
                position: 'absolute', inset: 0, pointerEvents: 'none',
                backgroundImage: `url(${stockSrc(gallery[activeImg], 2000, 2000)})`,
                backgroundSize: '250%',
                backgroundPosition: `${zoomPos.x}% ${zoomPos.y}%`,
              }} />
            )}
            {/* badges + actions */}
            <div style={{ position: 'absolute', top: 16, left: 16, display: 'flex', gap: 8 }}>
              <span className="chip chip-tint-red" style={{ padding: '6px 12px', font: 'var(--text-label-tertiary-bold)' }}>−19%</span>
              <span className="chip" style={{ background: 'var(--neutral-900)', color: 'white', padding: '6px 12px' }}>
                <Icon name="lightning" size={12} weight="fill" /> {t('ბესტსელერი', 'Best seller')}
              </span>
            </div>
            <div style={{ position: 'absolute', top: 16, right: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {['heart', 'share-fat', 'arrows-out'].map((ic, i) => (
                <button key={ic} style={{
                  width: 40, height: 40, borderRadius: 999,
                  background: 'rgba(255,255,255,0.95)', border: 0, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  backdropFilter: 'blur(4px)',
                }}>
                  <Icon name={ic} size={16} />
                </button>
              ))}
            </div>
            {/* zoom hint */}
            <div style={{
              position: 'absolute', bottom: 16, left: 16,
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '6px 12px', background: 'rgba(255,255,255,0.95)', borderRadius: 999,
              font: 'var(--text-body-tiny-md)', color: 'var(--fg-secondary)',
            }}>
              <Icon name="magnifying-glass-plus" size={12} /> {t('მაუსით გადახედე', 'Hover to zoom')}
            </div>
            <div style={{
              position: 'absolute', bottom: 16, right: 16,
              padding: '6px 12px', background: 'rgba(255,255,255,0.95)', borderRadius: 999,
              font: 'var(--text-body-tiny-md)', color: 'var(--fg-secondary)',
            }}><span className="num">{activeImg + 1} / {gallery.length}</span></div>

            {/* Flying-to-cart particle */}
            {flying && (
              <div style={{
                position: 'absolute', top: '50%', left: '50%', width: 100, height: 100,
                marginTop: -50, marginLeft: -50,
                borderRadius: 'var(--radius-lg)',
                background: `url(${stockSrc(gallery[activeImg], 200, 200)}) center/cover`,
                boxShadow: 'var(--shadow-lg)',
                animation: 'flyToCart 900ms var(--ease-out) forwards',
                zIndex: 50,
              }} />
            )}
          </div>

          {/* Right info column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <a style={{ font: 'var(--text-body-tiny-md)', color: 'var(--moveli-purple-700)', cursor: 'pointer' }}>Nike →</a>
              <h1 style={{ font: '800 28px/1.15 var(--font-display)', letterSpacing: '-0.5px', marginTop: 6 }}>
                Nike Air Max 270 · {t('წითელი / თეთრი', 'Red / White')}
              </h1>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  {[0, 1, 2, 3, 4].map(i => (
                    <Icon key={i} name="star" weight="fill" size={14} style={{ color: i < 4 ? '#FFB800' : 'var(--neutral-200)' }} />
                  ))}
                  <span className="num" style={{ font: 'var(--text-body-secondary-md)', marginLeft: 4 }}>4.7</span>
                </div>
                <a style={{ font: 'var(--text-body-tiny-md)', color: 'var(--moveli-purple-700)' }} className="num">1,205 {t('შეფასება', 'reviews')}</a>
                <span style={{ color: 'var(--fg-tertiary)' }}>·</span>
                <span className="num" style={{ font: 'var(--text-body-tiny)', color: 'var(--fg-tertiary)' }}>{t('გაყიდულია 12,400+', 'Sold 12,400+')}</span>
              </div>
            </div>

            {/* Price block */}
            <div style={{ padding: 16, background: 'var(--moveli-gradient-soft)', borderRadius: 'var(--radius-lg)' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
                <span className="num" style={{ font: '800 38px/1 var(--font-numbers)', color: 'var(--fg-primary)' }}>₾349</span>
                <span className="num" style={{ font: 'var(--text-body-base)', color: 'var(--fg-tertiary)', textDecoration: 'line-through' }}>₾429</span>
                <span className="chip chip-tint-red" style={{ padding: '4px 10px' }}>{t('დაზოგე', 'Save')} ₾80</span>
              </div>
              <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 6, font: 'var(--text-body-tiny-md)', color: 'var(--fg-secondary)' }}>
                <Icon name="clock-countdown" size={14} style={{ color: 'var(--negative)' }} />
                {t('აქცია სრულდება', 'Deal ends in')} <span className="num" style={{ color: 'var(--fg-primary)' }}>04:12:38</span>
              </div>
            </div>

            {/* Color picker */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <span className="label" style={{ marginBottom: 0 }}>{t('ფერი', 'Color')}: <span style={{ color: 'var(--fg-primary)', textTransform: 'none' }}>{colors[selectedColor].name}</span></span>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                {colors.map((c, i) => (
                  <button key={i} onClick={() => setSelectedColor(i)} style={{
                    width: 56, height: 56, borderRadius: 'var(--radius-md)', padding: 0,
                    border: i === selectedColor ? '2px solid var(--moveli-purple-500)' : '1px solid var(--border-default)',
                    background: `url(${stockSrc(c.img, 112, 112)}) center/cover ${c.bg}`,
                    cursor: 'pointer',
                  }} />
                ))}
              </div>
            </div>

            {/* Size picker */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <span className="label" style={{ marginBottom: 0 }}>{t('ზომა (EU)', 'Size (EU)')}</span>
                <a style={{ font: 'var(--text-body-tiny-md)', color: 'var(--moveli-purple-700)', cursor: 'pointer' }}>{t('ზომების ცხრილი', 'Size chart')}</a>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 6 }}>
                {['39', '40', '41', '42', '43', '44'].map((s, i) => (
                  <button key={s} disabled={i === 0} style={{
                    padding: '10px 0', borderRadius: 'var(--radius-sm)',
                    background: i === 2 ? 'var(--moveli-purple-050)' : i === 0 ? 'var(--neutral-100)' : 'var(--white)',
                    color: i === 2 ? 'var(--moveli-purple-700)' : i === 0 ? 'var(--fg-tertiary)' : 'var(--fg-primary)',
                    border: i === 2 ? '1.5px solid var(--moveli-purple-500)' : '1px solid var(--border-default)',
                    font: 'var(--text-label-secondary-bold)',
                    cursor: i === 0 ? 'not-allowed' : 'pointer',
                    textDecoration: i === 0 ? 'line-through' : 'none',
                  }} className="num">{s}</button>
                ))}
              </div>
            </div>

            {/* Quantity + buy */}
            <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
              <div style={{
                display: 'flex', alignItems: 'center', border: '1px solid var(--border-default)',
                borderRadius: 'var(--radius-md)', overflow: 'hidden',
              }}>
                <button onClick={() => setQty(Math.max(1, qty - 1))} style={{ padding: '12px 14px', background: 'transparent', border: 0, cursor: 'pointer' }}>
                  <Icon name="minus" size={14} />
                </button>
                <span className="num" style={{ padding: '0 8px', minWidth: 32, textAlign: 'center', font: 'var(--text-label-primary-bold)' }}>{qty}</span>
                <button onClick={() => setQty(qty + 1)} style={{ padding: '12px 14px', background: 'transparent', border: 0, cursor: 'pointer' }}>
                  <Icon name="plus" size={14} />
                </button>
              </div>
              <button onClick={handleAddToCart} className="btn btn-primary btn-lg" style={{ flex: 1 }}>
                <Icon name="shopping-bag" size={18} /> {t('კალათაში დამატება', 'Add to cart')} · <span className="num">₾{349 * qty}</span>
              </button>
            </div>
            <button className="btn btn-secondary btn-lg" style={{ width: '100%' }}>
              <Icon name="lightning" size={18} weight="fill" style={{ color: 'var(--moveli-cyan-700)' }} />
              {t('სწრაფი ყიდვა · ნაღდი ანგარიშსწორებით', 'Buy now · Cash on delivery')}
            </button>

            {/* Delivery card */}
            <div className="card" style={{ padding: 14, borderRadius: 'var(--radius-md)', display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <Icon name="map-pin" size={18} style={{ color: 'var(--moveli-purple-600)', marginTop: 2 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ font: 'var(--text-body-secondary-md)' }}>{t('მიწოდება — თბილისი, ვაკე', 'Deliver to — Tbilisi, Vake')}</div>
                  <a style={{ font: 'var(--text-body-tiny-md)', color: 'var(--moveli-purple-700)' }}>{t('მისამართის შეცვლა', 'Change address')}</a>
                </div>
              </div>
              <div style={{ height: 1, background: 'var(--border-default)' }} />
              {[
                { icon: 'lightning', ka: 'მიწოდება დღეს', en: 'Delivery today', meta: t('5 საათში · უფასოდ', 'in 5 hrs · free') },
                { icon: 'hand-coins', ka: 'ნაღდი გადახდა', en: 'Cash on delivery', meta: t('გადაიხადე როცა მიიღებ', 'Pay on receipt') },
                { icon: 'arrow-u-up-left', ka: '14 დღე დაბრუნება', en: '14-day returns', meta: t('უფასოდ', 'Free') },
              ].map((r, i) => (
                <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <Icon name={r.icon} size={16} style={{ color: 'var(--moveli-cyan-700)' }} />
                  <span style={{ flex: 1, font: 'var(--text-body-secondary)' }}>{t(r.ka, r.en)}</span>
                  <span style={{ font: 'var(--text-body-tiny-md)', color: 'var(--fg-secondary)' }}>{r.meta}</span>
                </div>
              ))}
            </div>

            {/* Seller card */}
            <div className="card" style={{ padding: 14, borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: 12 }}>
              <Avatar name="NS" hue={200} size={44} />
              <div style={{ flex: 1 }}>
                <div style={{ font: 'var(--text-body-secondary-md)' }}>Nike Store Georgia</div>
                <div style={{ font: 'var(--text-body-tiny)', color: 'var(--fg-secondary)', display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                  <Icon name="seal-check" size={12} weight="fill" style={{ color: 'var(--moveli-cyan-600)' }} />
                  {t('ვერიფიცირებული გამყიდველი', 'Verified seller')} · <span className="num">4.9 ★</span>
                </div>
              </div>
              <button className="btn btn-secondary btn-sm">{t('მაღაზია', 'Visit store')}</button>
            </div>
          </div>
        </section>

        {/* Tabs */}
        <section style={{ padding: '0 40px' }}>
          <div style={{ display: 'flex', gap: 32, borderBottom: '1px solid var(--border-default)' }}>
            {[t('აღწერა', 'Description'), t('მახასიათებლები', 'Specifications'), t('შეფასებები (1,205)', 'Reviews (1,205)'), t('კითხვები', 'Q&A')].map((tab, i) => (
              <button key={i} style={{
                padding: '14px 0', background: 'transparent', border: 0, cursor: 'pointer',
                font: i === 0 ? 'var(--text-label-primary-bold)' : 'var(--text-label-primary)',
                color: i === 0 ? 'var(--fg-primary)' : 'var(--fg-secondary)',
                borderBottom: i === 0 ? '2px solid var(--moveli-purple-500)' : '2px solid transparent',
                marginBottom: -1,
              }}>{tab}</button>
            ))}
          </div>
          <div style={{ padding: '24px 0', display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 48 }}>
            <div>
              <h4 style={{ marginBottom: 12 }}>{t('სტილი, კომფორტი და უმთავრესი — Air Max', 'Style, comfort and signature Air Max cushioning')}</h4>
              <p style={{ lineHeight: 1.65 }}>
                {t(
                  'Nike Air Max 270 — წარმოგიდგენთ Air Max-ის ერთ-ერთ ყველაზე გაბედულ ვერსიას. დიდი Air ბუშტი ქუსლის ქვეშ უზრუნველყოფს რბილ ფეხსაცმელს, ხოლო მსუბუქი mesh-ი ფეხს გრილად ინახავს მთელი დღის განმავლობაში.',
                  'The Nike Air Max 270 delivers one of the boldest Air Max designs ever. A large Air unit under the heel provides plush cushioning, while a lightweight mesh upper keeps your foot cool all day long.'
                )}
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginTop: 20 }}>
                {[
                  { icon: 'feather', ka: 'მსუბუქი', en: 'Lightweight', sub: '320g' },
                  { icon: 'wind', ka: 'სუნთქვადი mesh', en: 'Breathable mesh', sub: t('მთელი დღე', 'all day') },
                  { icon: 'shield', ka: 'რეზინის ლანდი', en: 'Rubber outsole', sub: t('გრიპი', 'grip') },
                ].map((f, i) => (
                  <div key={i} style={{ padding: 14, background: 'var(--neutral-050)', borderRadius: 'var(--radius-md)' }}>
                    <Icon name={f.icon} size={20} style={{ color: 'var(--moveli-purple-600)' }} />
                    <div style={{ font: 'var(--text-body-secondary-md)', marginTop: 8 }}>{t(f.ka, f.en)}</div>
                    <div style={{ font: 'var(--text-body-tiny)', color: 'var(--fg-tertiary)' }}>{f.sub}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Spec table */}
            <div className="card" style={{ padding: 16, alignSelf: 'flex-start' }}>
              <div style={{ font: 'var(--text-label-primary-bold)', marginBottom: 12 }}>{t('მახასიათებლები', 'Specifications')}</div>
              {[
                { ka: 'მწარმოებელი', en: 'Brand', val: 'Nike' },
                { ka: 'მოდელი', en: 'Model', val: 'Air Max 270' },
                { ka: 'სქესი', en: 'Gender', val: t('უნისექსი', 'Unisex') },
                { ka: 'მასალა', en: 'Upper', val: t('Mesh / სინთეტიკა', 'Mesh / synthetic') },
                { ka: 'ლანდი', en: 'Sole', val: t('რეზინი + Air', 'Rubber + Air') },
                { ka: 'ქვეყანა', en: 'Origin', val: 'Vietnam' },
              ].map((r, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: i < 5 ? '1px solid var(--border-default)' : 0 }}>
                  <span style={{ font: 'var(--text-body-secondary)', color: 'var(--fg-secondary)' }}>{t(r.ka, r.en)}</span>
                  <span style={{ font: 'var(--text-body-secondary-md)', color: 'var(--fg-primary)' }}>{r.val}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Related */}
        <section style={{ padding: '32px 40px 48px' }}>
          <h3 style={{ marginBottom: 16 }}>{t('მსგავსი პროდუქტი', 'Similar products')}</h3>
          <div style={{ display: 'flex', gap: 16 }}>
            <ProductCard image="sneakers2" title={t('Adidas Ultraboost Light', 'Adidas Ultraboost Light')} vendor="Adidas" priceLari="389" rating="4.8" reviews="847" />
            <ProductCard image="shoes" title={t('New Balance 530', 'New Balance 530')} vendor="New Balance" priceLari="289" rating="4.6" reviews="412" />
            <ProductCard image="sneakers" title={t('Puma RS-X', 'Puma RS-X')} vendor="Puma" priceLari="249" oldPriceLari="319" rating="4.5" reviews="687" badge="-22%" badgeTint="red" />
            <ProductCard image="sneakers2" title={t('Reebok Classic Leather', 'Reebok Classic Leather')} vendor="Reebok" priceLari="199" rating="4.7" reviews="234" />
            <ProductCard image="shoes" title={t('Asics Gel-Lyte III', 'Asics Gel-Lyte III')} vendor="Asics" priceLari="329" rating="4.6" reviews="156" />
          </div>
        </section>
      </div>
    </div>
  );
};

Object.assign(window, { PdpScreen });
