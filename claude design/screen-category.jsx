/* MOVELI — Category / Search results screen */

const CategoryScreen = ({ lang = 'ka' }) => {
  const t = (ka, en) => (lang === 'ka' ? ka : en);

  const suggestions = [
    { ka: 'სმარტფონი iPhone', en: 'iPhone smartphone', count: '1,247' },
    { ka: 'სმარტ საათი', en: 'Smart watch', count: '892' },
    { ka: 'სმარტ ტელევიზორი', en: 'Smart TV', count: '341' },
  ];
  const histSuggestions = [
    { ka: 'უსადენო ყურსასმენი', en: 'Wireless earbuds' },
    { ka: 'ლეპტოპი MacBook', en: 'MacBook laptop' },
  ];

  const filters = {
    brands: [
      { name: 'Apple', count: 1247 },
      { name: 'Samsung', count: 892 },
      { name: 'Xiaomi', count: 643 },
      { name: 'Sony', count: 421 },
      { name: 'Huawei', count: 287 },
    ],
    sellers: [
      { name: 'Apple Store Georgia', count: 412 },
      { name: 'Veli.store', count: 1203 },
      { name: 'TechHub', count: 678 },
    ],
  };

  const products = [
    { image: 'airpods', title: 'AirPods Pro 2nd gen', titleKa: 'AirPods Pro მე-2 თაობა', vendor: 'Apple', price: '599', oldPrice: '729', rating: '4.9', reviews: '2,341', badge: '-18%', badgeTint: 'red' },
    { image: 'headphone', title: 'Sony WH-1000XM5', titleKa: 'Sony WH-1000XM5', vendor: 'Sony', price: '789', rating: '4.8', reviews: '1,820', badge: 'Top rated', badgeTint: 'cyan' },
    { image: 'iphone', title: 'iPhone 15 Pro · 256GB', titleKa: 'iPhone 15 Pro · 256GB', vendor: 'Apple', price: '2,890', oldPrice: '3,490', rating: '4.9', reviews: '1,124', badge: 'Deal', badgeTint: 'red' },
    { image: 'watch', title: 'Apple Watch Series 9 · 45mm', titleKa: 'Apple Watch Series 9 · 45mm', vendor: 'Apple', price: '1,189', rating: '4.8', reviews: '892' },
    { image: 'laptop', title: 'MacBook Air M3 · 13"', titleKa: 'MacBook Air M3 · 13"', vendor: 'Apple', price: '2,989', rating: '4.9', reviews: '654', badge: 'New', badgeTint: 'cyan' },
    { image: 'camera', title: 'Sony α7 IV body', titleKa: 'Sony α7 IV კორპუსი', vendor: 'Sony', price: '4,890', rating: '4.7', reviews: '231' },
    { image: 'speaker', title: 'JBL Flip 6 Bluetooth', titleKa: 'JBL Flip 6 ბლუთუს', vendor: 'JBL', price: '289', oldPrice: '349', rating: '4.6', reviews: '2,104', badge: '-17%', badgeTint: 'red' },
    { image: 'drone', title: 'DJI Mini 4 Pro', titleKa: 'DJI Mini 4 Pro', vendor: 'DJI', price: '2,340', rating: '4.7', reviews: '187' },
  ];

  return (
    <div className="screen">
      <TopBar lang={lang} active="cat" />

      <div style={{ overflow: 'auto', flex: 1, background: 'var(--neutral-050)' }}>
        {/* Breadcrumb + title */}
        <div style={{ padding: '20px 40px 12px', background: 'var(--white)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, font: 'var(--text-body-tiny)', color: 'var(--fg-tertiary)' }}>
            <span style={{ cursor: 'pointer' }}>{t('მთავარი', 'Home')}</span>
            <Icon name="caret-right" size={12} />
            <span style={{ cursor: 'pointer' }}>{t('ელექტრონიკა', 'Electronics')}</span>
            <Icon name="caret-right" size={12} />
            <span style={{ color: 'var(--fg-primary)' }}>{t('აუდიო', 'Audio')}</span>
          </div>
          <div style={{ marginTop: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <div>
              <h2 style={{ font: '800 32px/1 var(--font-display)', letterSpacing: '-0.5px' }}>
                {t('აუდიო · ყურსასმენები', 'Audio · Headphones')}
              </h2>
              <p style={{ marginTop: 6 }}>
                <span className="num">1,847</span> {t('პროდუქტი ნაპოვნია', 'products found')}
              </p>
            </div>
          </div>
        </div>

        <div style={{ padding: '20px 40px 40px', display: 'grid', gridTemplateColumns: '260px 1fr', gap: 24, alignItems: 'flex-start' }}>
          {/* ─── FILTERS SIDEBAR ─── */}
          <aside style={{ background: 'var(--white)', borderRadius: 'var(--radius-lg)', padding: 20, position: 'sticky', top: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h4>{t('ფილტრები', 'Filters')}</h4>
              <button className="btn btn-ghost btn-sm" style={{ padding: '4px 8px', font: 'var(--text-body-tiny-md)', color: 'var(--moveli-purple-700)' }}>
                {t('გასუფთავება', 'Clear all')}
              </button>
            </div>

            <FilterGroup title={t('ფასი (₾)', 'Price (₾)')}>
              <div style={{ display: 'flex', gap: 8 }}>
                <input className="input" placeholder={t('მინ', 'Min')} style={{ padding: '8px 10px', font: 'var(--text-body-secondary)' }} />
                <input className="input" placeholder={t('მაქს', 'Max')} style={{ padding: '8px 10px', font: 'var(--text-body-secondary)' }} />
              </div>
              {/* mini histogram */}
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 2, height: 36, marginTop: 12 }}>
                {[12, 18, 32, 48, 64, 80, 90, 78, 60, 42, 28, 18, 12, 8, 6, 4].map((h, i) => (
                  <div key={i} style={{
                    flex: 1, height: `${h}%`,
                    background: i >= 3 && i <= 11 ? 'var(--moveli-purple-400)' : 'var(--neutral-200)',
                    borderRadius: 2,
                  }} />
                ))}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', font: 'var(--text-body-tiny)', color: 'var(--fg-tertiary)', marginTop: 6 }}>
                <span className="num">₾0</span>
                <span className="num">₾5,000+</span>
              </div>
            </FilterGroup>

            <FilterGroup title={t('ბრენდი', 'Brand')}>
              {filters.brands.map((b, i) => (
                <label key={b.name} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0', cursor: 'pointer' }}>
                  <Checkbox checked={i < 2} />
                  <span style={{ flex: 1, font: 'var(--text-body-secondary)', color: 'var(--fg-primary)' }}>{b.name}</span>
                  <span className="num" style={{ font: 'var(--text-body-tiny)', color: 'var(--fg-tertiary)' }}>{b.count}</span>
                </label>
              ))}
              <a style={{ font: 'var(--text-body-tiny-md)', color: 'var(--moveli-purple-700)', cursor: 'pointer' }}>{t('+ მეტი', '+ Show more')}</a>
            </FilterGroup>

            <FilterGroup title={t('შეფასება', 'Rating')}>
              {[4.5, 4.0, 3.5].map(r => (
                <label key={r} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0', cursor: 'pointer' }}>
                  <Checkbox />
                  <span style={{ display: 'flex', gap: 2 }}>
                    {[0, 1, 2, 3, 4].map(i => (
                      <Icon key={i} name="star" weight="fill" size={12} style={{ color: i < Math.floor(r) ? '#FFB800' : 'var(--neutral-200)' }} />
                    ))}
                  </span>
                  <span className="num" style={{ font: 'var(--text-body-tiny-md)', color: 'var(--fg-primary)' }}>{r}+</span>
                </label>
              ))}
            </FilterGroup>

            <FilterGroup title={t('მიწოდება', 'Delivery')} last>
              {[
                { ka: 'დღეს', en: 'Today', icon: 'lightning' },
                { ka: 'ხვალ', en: 'Tomorrow', icon: 'truck' },
                { ka: '2–3 დღე', en: '2–3 days', icon: 'calendar' },
              ].map((d, i) => (
                <label key={d.en} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0', cursor: 'pointer' }}>
                  <Checkbox checked={i === 0} />
                  <Icon name={d.icon} size={14} style={{ color: 'var(--fg-secondary)' }} />
                  <span style={{ flex: 1, font: 'var(--text-body-secondary)' }}>{t(d.ka, d.en)}</span>
                </label>
              ))}
            </FilterGroup>
          </aside>

          {/* ─── RESULTS ─── */}
          <div>
            {/* Search bar with LIVE SUGGESTIONS popover */}
            <div style={{ position: 'relative', marginBottom: 16 }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 12,
                background: 'var(--white)', borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--moveli-purple-300)', padding: '12px 16px',
                boxShadow: '0 0 0 4px rgba(139,125,216,0.12)',
              }}>
                <Icon name="magnifying-glass" size={18} style={{ color: 'var(--moveli-purple-600)' }} />
                <span style={{ flex: 1, font: 'var(--text-body-base-md)', color: 'var(--fg-primary)' }}>{t('სმარტ', 'smart')}<span style={{ display: 'inline-block', width: 2, height: 18, background: 'var(--moveli-purple-600)', verticalAlign: 'middle', marginLeft: 1, animation: 'cursor 1s steps(2) infinite' }} /></span>
                <button className="btn btn-ghost btn-sm" style={{ padding: 6 }}>
                  <Icon name="x" size={14} style={{ color: 'var(--fg-tertiary)' }} />
                </button>
              </div>

              {/* live suggestions dropdown */}
              <div className="card-soft" style={{
                position: 'absolute', top: 'calc(100% + 8px)', left: 0, right: 0, zIndex: 10,
                padding: 16, boxShadow: 'var(--shadow-pop)',
              }}>
                <div style={{ font: 'var(--text-label-tertiary-bold)', color: 'var(--fg-tertiary)', textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 8 }}>
                  {t('შემოთავაზებები', 'Suggestions')}
                </div>
                {suggestions.map((s, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 8px', borderRadius: 'var(--radius-sm)', cursor: 'pointer', background: i === 0 ? 'var(--moveli-purple-050)' : 'transparent' }}>
                    <Icon name="magnifying-glass" size={16} style={{ color: 'var(--fg-tertiary)' }} />
                    <span style={{ flex: 1, font: 'var(--text-body-base)' }}>
                      <span style={{ fontWeight: 600 }}>{t(s.ka, s.en).split(' ')[0]}</span> {t(s.ka, s.en).split(' ').slice(1).join(' ')}
                    </span>
                    <span className="num" style={{ font: 'var(--text-body-tiny)', color: 'var(--fg-tertiary)' }}>{s.count} {t('შედეგი', 'results')}</span>
                    <Icon name="arrow-up-left" size={14} style={{ color: 'var(--fg-tertiary)' }} />
                  </div>
                ))}
                <div style={{ height: 1, background: 'var(--border-default)', margin: '8px 0' }} />
                <div style={{ font: 'var(--text-label-tertiary-bold)', color: 'var(--fg-tertiary)', textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 8 }}>
                  {t('ბოლო ძიება', 'Recent searches')}
                </div>
                {histSuggestions.map((s, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px', borderRadius: 'var(--radius-sm)', cursor: 'pointer' }}>
                    <Icon name="clock-counter-clockwise" size={16} style={{ color: 'var(--fg-tertiary)' }} />
                    <span style={{ flex: 1, font: 'var(--text-body-base)', color: 'var(--fg-secondary)' }}>{t(s.ka, s.en)}</span>
                  </div>
                ))}
                <div style={{ height: 1, background: 'var(--border-default)', margin: '8px 0' }} />
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 4 }}>
                  <span style={{ font: 'var(--text-body-tiny)', color: 'var(--fg-tertiary)' }}>{t('პოპულარული', 'Trending')}:</span>
                  {[t('iPhone 15', 'iPhone 15'), t('AirPods', 'AirPods'), t('PS5', 'PS5'), t('სამზარეულო', 'Kitchen')].map(c => (
                    <span key={c} className="chip" style={{ padding: '4px 10px' }}>{c}</span>
                  ))}
                </div>
              </div>
            </div>

            {/* Active filters row + sort */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, marginTop: 240 }}>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <span className="chip chip-active">Apple <Icon name="x" size={12} /></span>
                <span className="chip chip-active">Samsung <Icon name="x" size={12} /></span>
                <span className="chip chip-active">{t('მიწოდება დღეს', 'Delivery today')} <Icon name="x" size={12} /></span>
                <span className="chip chip-active">₾100–₾2,000 <Icon name="x" size={12} /></span>
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <span style={{ font: 'var(--text-body-secondary)', color: 'var(--fg-secondary)' }}>{t('დახარისხება:', 'Sort by:')}</span>
                <div style={{ display: 'flex', gap: 2, padding: 4, background: 'var(--white)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-default)' }}>
                  <button className="chip chip-active" style={{ padding: '6px 12px' }}>{t('პოპულარული', 'Popular')}</button>
                  <button className="chip" style={{ background: 'transparent', padding: '6px 12px' }}>{t('ფასი ↑', 'Price ↑')}</button>
                  <button className="chip" style={{ background: 'transparent', padding: '6px 12px' }}>{t('ფასი ↓', 'Price ↓')}</button>
                  <button className="chip" style={{ background: 'transparent', padding: '6px 12px' }}>{t('ახალი', 'Newest')}</button>
                </div>
                <button className="btn btn-secondary btn-sm" style={{ padding: 8 }}>
                  <Icon name="squares-four" size={16} />
                </button>
                <button className="btn btn-ghost btn-sm" style={{ padding: 8 }}>
                  <Icon name="list" size={16} />
                </button>
              </div>
            </div>

            {/* Results grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
              {products.map((p, i) => (
                <ProductCard
                  key={i}
                  image={p.image}
                  title={lang === 'ka' ? p.titleKa : p.title}
                  vendor={p.vendor}
                  priceLari={p.price}
                  oldPriceLari={p.oldPrice}
                  rating={p.rating}
                  reviews={p.reviews}
                  badge={p.badge}
                  badgeTint={p.badgeTint}
                />
              ))}
            </div>

            {/* Pagination */}
            <div style={{ marginTop: 32, display: 'flex', justifyContent: 'center', gap: 6 }}>
              <button className="btn btn-secondary btn-sm" style={{ padding: 8 }}><Icon name="caret-left" size={16} /></button>
              {[1, 2, 3, 4, '...', 47].map((p, i) => (
                <button key={i} className={p === 1 ? 'btn btn-primary btn-sm' : 'btn btn-secondary btn-sm'} style={{ padding: '8px 12px', minWidth: 36, background: p === '...' ? 'transparent' : undefined, border: p === '...' ? 0 : undefined }}>
                  <span className="num">{p}</span>
                </button>
              ))}
              <button className="btn btn-secondary btn-sm" style={{ padding: 8 }}><Icon name="caret-right" size={16} /></button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const FilterGroup = ({ title, children, last }) => (
  <div style={{ marginBottom: last ? 0 : 16, paddingBottom: last ? 0 : 16, borderBottom: last ? 0 : '1px solid var(--border-default)' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, cursor: 'pointer' }}>
      <span style={{ font: 'var(--text-label-secondary-bold)', color: 'var(--fg-primary)' }}>{title}</span>
      <Icon name="caret-down" size={12} style={{ color: 'var(--fg-tertiary)' }} />
    </div>
    {children}
  </div>
);

const Checkbox = ({ checked }) => (
  <span style={{
    width: 18, height: 18, borderRadius: 6,
    background: checked ? 'var(--moveli-gradient)' : 'transparent',
    border: checked ? 0 : '1.5px solid var(--border-strong)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  }}>
    {checked && <Icon name="check" weight="bold" size={12} style={{ color: 'white' }} />}
  </span>
);

Object.assign(window, { CategoryScreen, FilterGroup, Checkbox });
