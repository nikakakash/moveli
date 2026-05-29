/* MOVELI — Home / Landing screen */

const HomeScreen = ({ lang = 'ka' }) => {
  const t = (ka, en) => (lang === 'ka' ? ka : en);

  const categories = [
    { ka: 'ელექტრონიკა', en: 'Electronics', icon: 'devices', img: 'laptop', hue: 1 },
    { ka: 'ტანსაცმელი', en: 'Clothing', icon: 't-shirt', img: 'jacket', hue: 2 },
    { ka: 'სილამაზე', en: 'Beauty', icon: 'sparkle', img: 'serum', hue: 3 },
    { ka: 'სახლი', en: 'Home & garden', icon: 'house-line', img: 'sofa', hue: 4 },
    { ka: 'სპორტი', en: 'Sports', icon: 'basketball', img: 'yoga', hue: 5 },
    { ka: 'ბავშვები', en: 'Kids', icon: 'baby', img: 'toy', hue: 6 },
    { ka: 'საკვები', en: 'Food', icon: 'fork-knife', img: 'coffee', hue: 7 },
    { ka: 'წიგნები', en: 'Books', icon: 'book-open', img: 'book', hue: 8 },
  ];

  return (
    <div className="screen">
      <TopBar lang={lang} active="home" />

      <div style={{ overflow: 'auto', flex: 1 }}>
        {/* ─── HERO ─── */}
        <section style={{ padding: '32px 40px 0' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1.3fr 1fr',
            gap: 24,
            borderRadius: 'var(--radius-2xl)',
            overflow: 'hidden',
            background: 'linear-gradient(115deg, #F0EBFE 0%, #E6F4FB 60%, #DAF0FA 100%)',
            padding: '52px 56px',
            position: 'relative',
            minHeight: 360,
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20, position: 'relative', zIndex: 2 }}>
              <span className="chip chip-tint-purple" style={{ alignSelf: 'flex-start' }}>
                <Icon name="lightning" size={14} weight="fill" /> {t('შავი პარასკევი', 'Black Friday')} · {t('აქცია', 'Sale')}
              </span>
              <h1 style={{ font: '800 56px/1.05 var(--font-display)', letterSpacing: '-1.5px', color: 'var(--fg-primary)' }}>
                {t('ყველაფერი ერთ', 'Everything in one')}{' '}
                <span className="brand-text">{t('სივრცეში', 'place')}.</span><br />
                {t('მიწოდება 24 საათში', 'Delivered in 24 hours')}
              </h1>
              <p style={{ font: 'var(--text-body-base)', color: 'var(--fg-secondary)', maxWidth: 480 }}>
                {t(
                  'საუკეთესო ფასები, ნაღდი ანგარიშსწორება, უფასო მიწოდება ₾80-დან. შენი სავაჭრო ცენტრი ახლა ჯიბეშია.',
                  'Best prices, cash-on-delivery, free shipping from ₾80. Your marketplace, now in your pocket.'
                )}
              </p>
              <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                <button className="btn btn-primary btn-lg">
                  {t('დაიწყე ყიდვა', 'Start shopping')} <Icon name="arrow-right" size={18} />
                </button>
                <button className="btn btn-secondary btn-lg">
                  {t('აქციები', 'View deals')}
                </button>
              </div>
              <div style={{ display: 'flex', gap: 24, marginTop: 12 }}>
                {[
                  { ka: '50K+', en: '50K+', kasub: 'პროდუქტი', ensub: 'products' },
                  { ka: '1,200+', en: '1,200+', kasub: 'გამყიდველი', ensub: 'sellers' },
                  { ka: '4.8', en: '4.8', kasub: 'შეფასება', ensub: 'rating' },
                ].map((s, i) => (
                  <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <span className="num" style={{ font: '800 22px/1 var(--font-numbers)', color: 'var(--moveli-purple-700)' }}>{lang === 'ka' ? s.ka : s.en}</span>
                    <span style={{ font: 'var(--text-body-tiny)', color: 'var(--fg-secondary)' }}>{lang === 'ka' ? s.kasub : s.ensub}</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ position: 'relative' }}>
              {/* floating product images */}
              <div style={{
                position: 'absolute', right: -40, top: -20, width: 360, height: 360,
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(157,142,229,0.18), rgba(125,206,234,0.05) 70%)',
                filter: 'blur(20px)',
              }} />
              <img src={stockSrc('sneakers', 360, 360)} alt="" style={{
                position: 'absolute', right: 24, top: 0, width: 280, height: 280, objectFit: 'cover',
                borderRadius: 'var(--radius-2xl)', boxShadow: 'var(--shadow-lg)',
                transform: 'rotate(-6deg)',
              }} />
              <img src={stockSrc('headphone', 200, 200)} alt="" style={{
                position: 'absolute', right: 220, bottom: -10, width: 160, height: 160, objectFit: 'cover',
                borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-lg)',
                transform: 'rotate(8deg)',
                border: '4px solid white',
              }} />
              <div style={{
                position: 'absolute', right: -10, bottom: 30, padding: '12px 14px',
                background: 'white', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-md)',
                display: 'flex', alignItems: 'center', gap: 10,
              }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 999, background: 'var(--moveli-purple-050)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Icon name="truck" size={20} style={{ color: 'var(--moveli-purple-600)' }} />
                </div>
                <div>
                  <div style={{ font: 'var(--text-label-secondary-bold)', color: 'var(--fg-primary)' }}>{t('მიწოდება დღეს', 'Delivery today')}</div>
                  <div style={{ font: 'var(--text-body-tiny)', color: 'var(--fg-secondary)' }}>{t('თბილისში 2 საათში', '2 hours in Tbilisi')}</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── CATEGORY TILES ─── */}
        <section style={{ padding: '48px 40px 16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 20 }}>
            <h2>{t('ყიდვა კატეგორიის მიხედვით', 'Shop by category')}</h2>
            <a style={{ font: 'var(--text-label-secondary)', color: 'var(--moveli-purple-700)', cursor: 'pointer' }}>
              {t('ყველა კატეგორია', 'All categories')} →
            </a>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: 12 }}>
            {categories.map(c => (
              <div key={c.en} className="card-soft" style={{
                padding: 16, display: 'flex', flexDirection: 'column', alignItems: 'center',
                gap: 10, cursor: 'pointer',
              }}>
                <div style={{
                  width: 64, height: 64, borderRadius: 'var(--radius-lg)',
                  background: `url(${stockSrc(c.img, 128, 128)}) center/cover`,
                }} />
                <span style={{ font: 'var(--text-body-secondary-md)', color: 'var(--fg-primary)', textAlign: 'center' }}>
                  {t(c.ka, c.en)}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* ─── DEAL BANNER STRIP ─── */}
        <section style={{ padding: '24px 40px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 16 }}>
            <div style={{
              background: 'var(--neutral-900)',
              color: 'white', borderRadius: 'var(--radius-xl)',
              padding: '28px 32px', position: 'relative', overflow: 'hidden',
              minHeight: 180, display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
            }}>
              <div>
                <span className="chip" style={{ background: 'rgba(255,255,255,0.12)', color: 'white', alignSelf: 'flex-start' }}>
                  {t('თვის შეთავაზება', 'Deal of the month')}
                </span>
                <h3 style={{ color: 'white', font: '700 28px/1.2 var(--font-display)', marginTop: 12, maxWidth: 320 }}>
                  {t('iPhone 15 Pro · 256GB', 'iPhone 15 Pro · 256GB')}
                </h3>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginTop: 12 }}>
                  <span className="num" style={{ font: '800 32px/1 var(--font-numbers)', color: 'white' }}>₾2,890</span>
                  <span className="num" style={{ font: 'var(--text-body-base)', color: 'rgba(255,255,255,0.55)', textDecoration: 'line-through' }}>₾3,490</span>
                  <span className="chip" style={{ background: 'var(--moveli-cyan-400)', color: 'var(--neutral-900)' }}>−17%</span>
                </div>
              </div>
              <img src={stockSrc('iphone', 240, 240)} alt="" style={{
                position: 'absolute', right: -20, bottom: -20, width: 220, height: 220,
                objectFit: 'cover', borderRadius: 'var(--radius-2xl)', transform: 'rotate(-8deg)',
              }} />
            </div>
            {[
              { ka: 'უფასო\nმიწოდება', en: 'Free\ndelivery', sub: t('₾80-დან', 'from ₾80'), icon: 'truck', tint: 'purple' },
              { ka: 'ნაღდი\nანგარიშსწორება', en: 'Cash on\ndelivery', sub: t('კარდან კარამდე', 'door to door'), icon: 'hand-coins', tint: 'cyan' },
            ].map((d, i) => (
              <div key={i} style={{
                background: i === 0 ? 'var(--moveli-purple-050)' : 'var(--moveli-cyan-050)',
                borderRadius: 'var(--radius-xl)', padding: 24,
                display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                minHeight: 180,
              }}>
                <Icon name={d.icon} size={32} weight="fill" style={{
                  color: i === 0 ? 'var(--moveli-purple-600)' : 'var(--moveli-cyan-700)',
                }} />
                <div>
                  <h3 style={{ font: '700 22px/1.15 var(--font-display)', whiteSpace: 'pre-line' }}>
                    {lang === 'ka' ? d.ka : d.en}
                  </h3>
                  <p style={{ marginTop: 4, color: 'var(--fg-secondary)' }}>{d.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ─── BEST SELLERS ─── */}
        <section style={{ padding: '32px 40px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 20 }}>
            <div>
              <h2>{t('ბესტსელერები', 'Best sellers')}</h2>
              <p style={{ marginTop: 4 }}>{t('ყველაზე გაყიდვადი ამ კვირას', 'Most popular this week')}</p>
            </div>
            <div style={{ display: 'flex', gap: 4 }}>
              <button className="btn btn-secondary btn-sm" style={{ borderRadius: 999, padding: 8 }}><Icon name="caret-left" size={16} /></button>
              <button className="btn btn-secondary btn-sm" style={{ borderRadius: 999, padding: 8 }}><Icon name="caret-right" size={16} /></button>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 16, overflow: 'hidden' }}>
            <ProductCard image="airpods" title={t('AirPods Pro მე-2 თაობა', 'AirPods Pro 2nd gen')} vendor="Apple" priceLari="599" oldPriceLari="729" rating="4.9" reviews="2,341" badge={t('-18%', '-18%')} badgeTint="red" />
            <ProductCard image="sneakers" title={t('Nike Air Max 270', 'Nike Air Max 270')} vendor="Nike" priceLari="349" oldPriceLari="429" rating="4.7" reviews="1,205" badge={t('ბესტსელერი', 'Best seller')} badgeTint="purple" />
            <ProductCard image="watch" title={t('Apple Watch Series 9 · 45mm', 'Apple Watch Series 9 · 45mm')} vendor="Apple" priceLari="1,189" rating="4.8" reviews="892" badge={t('ახალი', 'New')} badgeTint="cyan" />
            <ProductCard image="serum" title={t('The Ordinary Niacinamide 10%', 'The Ordinary Niacinamide 10%')} vendor="The Ordinary" priceLari="28" rating="4.6" reviews="3,402" />
            <ProductCard image="bag" title={t('ჩარმის ჩანთა · ბეჟი', 'Leather tote · Beige')} vendor="MOVELI Studio" priceLari="189" oldPriceLari="249" rating="4.5" reviews="421" badge={t('-24%', '-24%')} badgeTint="red" />
          </div>
        </section>

        {/* ─── EDITORIAL DUO ─── */}
        <section style={{ padding: '32px 40px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {[
              {
                title: t('გაზაფხულის კოლექცია', 'Spring collection'),
                sub: t('200+ ახალი ნივთი ქართველი დიზაინერებისგან', '200+ new items from Georgian designers'),
                cta: t('გადახედვა', 'Browse'),
                img: 'jacket',
              },
              {
                title: t('ტექნიკის გადასვლა', 'Tech upgrades'),
                sub: t('ლეპტოპები, ტელეფონები, აქსესუარები 40%-მდე ფასდაკლებით', 'Laptops, phones, accessories up to 40% off'),
                cta: t('აქციები', 'Shop deals'),
                img: 'laptop',
              },
            ].map((c, i) => (
              <div key={i} style={{
                borderRadius: 'var(--radius-2xl)',
                background: `linear-gradient(120deg, ${i === 0 ? 'rgba(155,142,229,0.18)' : 'rgba(125,206,234,0.18)'} 0%, rgba(255,255,255,0) 60%), url(${stockSrc(c.img, 720, 360)}) right/cover`,
                padding: '36px 40px', minHeight: 280,
                display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
                color: 'white',
                position: 'relative',
              }}>
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(120deg, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0) 50%)', borderRadius: 'var(--radius-2xl)' }} />
                <div style={{ position: 'relative', maxWidth: 320 }}>
                  <h3 style={{ color: 'white', font: '800 32px/1.1 var(--font-display)', letterSpacing: '-0.5px' }}>{c.title}</h3>
                  <p style={{ color: 'rgba(255,255,255,0.85)', marginTop: 8 }}>{c.sub}</p>
                  <button className="btn btn-sm" style={{ marginTop: 16, background: 'white', color: 'var(--fg-primary)' }}>{c.cta} <Icon name="arrow-right" size={14} /></button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ─── NEW ARRIVALS GRID ─── */}
        <section style={{ padding: '32px 40px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 20 }}>
            <h2>{t('ახალი მოსული', 'New arrivals')}</h2>
            <a style={{ font: 'var(--text-label-secondary)', color: 'var(--moveli-purple-700)', cursor: 'pointer' }}>
              {t('ყველა', 'View all')} →
            </a>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12 }}>
            {[
              { image: 'lamp', title: t('ხის ლუსტრა · მუხის', 'Wood pendant lamp · Oak'), vendor: 'Nordic Home', price: '249', rating: '4.7', reviews: '184' },
              { image: 'lipstick', title: t('ვაშლისფერი ტუჩსაცხი', 'Velvet matte lipstick · Apple'), vendor: 'Lumière', price: '42', rating: '4.6', reviews: '512' },
              { image: 'plant', title: t('მონსტერა · დიდი ქოთანში', 'Monstera deliciosa · Large pot'), vendor: 'Green Co.', price: '89', rating: '4.9', reviews: '267' },
              { image: 'console', title: t('PlayStation 5 Slim · 1TB', 'PlayStation 5 Slim · 1TB'), vendor: 'Sony', price: '1,549', rating: '4.8', reviews: '1,124', badge: t('აქცია', 'Sale'), badgeTint: 'red' },
              { image: 'coffee', title: t('სპეციალური ყავა · ეთიოპია', 'Specialty coffee · Ethiopia'), vendor: 'Roasters', price: '34', rating: '4.7', reviews: '89' },
            ].map((p, i) => <ProductCard key={i} {...p} priceLari={p.price} />)}
          </div>
        </section>

        {/* ─── TRUST STRIP ─── */}
        <section style={{ padding: '32px 40px' }}>
          <div className="card" style={{ padding: '24px 32px', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24, borderRadius: 'var(--radius-xl)' }}>
            {[
              { icon: 'truck', ka: 'უფასო მიწოდება', en: 'Free delivery', subka: '₾80-დან, თბილისში 24სთ-ში', suben: 'From ₾80, 24h in Tbilisi' },
              { icon: 'hand-coins', ka: 'ნაღდი გადახდა', en: 'Cash on delivery', subka: 'გადაიხადე როცა მიიღებ', suben: 'Pay when you receive' },
              { icon: 'shield-check', ka: '14 დღე დაბრუნება', en: '14-day returns', subka: 'შეფუთული ნივთები მთლიანად', suben: 'Full refund on unopened items' },
              { icon: 'headset', ka: 'მხარდაჭერა 24/7', en: '24/7 support', subka: 'ცოცხალი ჩატი, ქართულად', suben: 'Live chat, in Georgian' },
            ].map((f, i) => (
              <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 'var(--radius-md)',
                  background: 'var(--moveli-gradient-soft)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  <Icon name={f.icon} size={22} style={{ color: 'var(--moveli-purple-700)' }} />
                </div>
                <div>
                  <div style={{ font: 'var(--text-label-primary)', color: 'var(--fg-primary)' }}>{t(f.ka, f.en)}</div>
                  <div style={{ font: 'var(--text-body-secondary)', color: 'var(--fg-secondary)', marginTop: 2 }}>{t(f.subka, f.suben)}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ─── FOOTER ─── */}
        <footer style={{ marginTop: 32, padding: '48px 40px 32px', background: 'var(--neutral-050)', borderTop: '1px solid var(--border-default)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr 1fr', gap: 32 }}>
            <div>
              <MoveliLogo size={24} />
              <p style={{ marginTop: 12, maxWidth: 280 }}>
                {t('საქართველოს ყველაზე სწრაფი ონლაინ ბაზრობა. შენი არჩევანი, ჩვენი მიწოდება.', "Georgia's fastest online marketplace. Your choice, our delivery.")}
              </p>
              <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
                {['instagram-logo', 'facebook-logo', 'youtube-logo', 'tiktok-logo'].map(n => (
                  <button key={n} style={{ width: 36, height: 36, borderRadius: 999, background: 'white', border: '1px solid var(--border-default)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon name={n} size={16} />
                  </button>
                ))}
              </div>
            </div>
            {[
              { title: t('კომპანია', 'Company'), items: [t('ჩვენ შესახებ', 'About'), t('კარიერა', 'Careers'), t('პრესა', 'Press'), t('ბლოგი', 'Blog')] },
              { title: t('დახმარება', 'Help'), items: [t('კონტაქტი', 'Contact'), t('FAQ', 'FAQ'), t('მიწოდება', 'Delivery'), t('დაბრუნება', 'Returns')] },
              { title: t('სამართლებრივი', 'Legal'), items: [t('წესები და პირობები', 'Terms'), t('კონფიდენციალურობა', 'Privacy'), t('Cookies', 'Cookies')] },
            ].map((col, i) => (
              <div key={i}>
                <div style={{ font: 'var(--text-label-secondary-bold)', color: 'var(--fg-primary)', marginBottom: 12 }}>{col.title}</div>
                {col.items.map(it => (
                  <div key={it} style={{ font: 'var(--text-body-secondary)', color: 'var(--fg-secondary)', padding: '4px 0', cursor: 'pointer' }}>{it}</div>
                ))}
              </div>
            ))}
          </div>
          <div style={{ marginTop: 32, paddingTop: 24, borderTop: '1px solid var(--border-default)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ font: 'var(--text-body-tiny)', color: 'var(--fg-tertiary)' }}>© 2026 MOVELI LLC · {t('თბილისი, საქართველო', 'Tbilisi, Georgia')}</span>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <span style={{ font: 'var(--text-body-tiny)', color: 'var(--fg-tertiary)' }}>{t('მიიღე', 'We accept')}:</span>
              {['VISA', 'MC', '₾', 'TBC', 'BOG'].map(p => (
                <span key={p} style={{ font: 'var(--text-body-tiny-md)', color: 'var(--fg-secondary)', padding: '4px 10px', background: 'white', border: '1px solid var(--border-default)', borderRadius: 6 }}>{p}</span>
              ))}
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

Object.assign(window, { HomeScreen });
