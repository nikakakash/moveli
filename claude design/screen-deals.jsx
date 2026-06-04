/* MOVELI — Deals / Sale page */

const DealsScreen = ({ lang = 'ka' }) => {
  const t = (ka, en) => (lang === 'ka' ? ka : en);

  const flashDeals = [
    { image: 'iphone', title: t('iPhone 15 Pro · 256GB', 'iPhone 15 Pro · 256GB'), vendor: 'Apple', price: '2,890', oldPrice: '3,490', rating: '4.9', reviews: '1,124', sold: 78, badge: '−17%' },
    { image: 'airpods', title: t('AirPods Pro მე-2 თაობა', 'AirPods Pro 2nd gen'), vendor: 'Apple', price: '599', oldPrice: '729', rating: '4.9', reviews: '2,341', sold: 92, badge: '−18%' },
    { image: 'console', title: t('PlayStation 5 Slim', 'PlayStation 5 Slim'), vendor: 'Sony', price: '1,549', oldPrice: '1,890', rating: '4.8', reviews: '1,124', sold: 64, badge: '−18%' },
    { image: 'sneakers', title: t('Nike Air Max 270', 'Nike Air Max 270'), vendor: 'Nike', price: '349', oldPrice: '429', rating: '4.7', reviews: '1,205', sold: 45, badge: '−19%' },
    { image: 'speaker', title: t('JBL Flip 6', 'JBL Flip 6'), vendor: 'JBL', price: '289', oldPrice: '349', rating: '4.6', reviews: '2,104', sold: 88, badge: '−17%' },
    { image: 'watch', title: t('Apple Watch S9 · 45mm', 'Apple Watch S9 · 45mm'), vendor: 'Apple', price: '989', oldPrice: '1,189', rating: '4.8', reviews: '892', sold: 31, badge: '−17%' },
  ];

  return (
    <div className="screen">
      <TopBar lang={lang} active="deals" />

      <div style={{ overflow: 'auto', flex: 1, background: 'var(--neutral-050)' }}>
        {/* ─── HERO with countdown ─── */}
        <section style={{ padding: '24px 40px 0' }}>
          <div style={{
            borderRadius: 'var(--radius-2xl)', overflow: 'hidden', position: 'relative',
            background: 'linear-gradient(110deg, #2A226B 0%, #44389A 45%, #2C7BA3 100%)',
            padding: '44px 48px', minHeight: 280,
            display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 24, alignItems: 'center',
          }}>
            {/* decorative blobs */}
            <div style={{ position: 'absolute', top: -80, right: 120, width: 320, height: 320, borderRadius: '50%', background: 'radial-gradient(circle, rgba(125,206,234,0.4), transparent 70%)' }} />
            <div style={{ position: 'absolute', bottom: -100, left: -60, width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(155,142,229,0.4), transparent 70%)' }} />

            <div style={{ position: 'relative', zIndex: 2 }}>
              <span className="chip" style={{ background: 'rgba(255,255,255,0.15)', color: 'white', alignSelf: 'flex-start', backdropFilter: 'blur(6px)' }}>
                <Icon name="lightning" size={14} weight="fill" style={{ color: '#FFDA44' }} /> {t('შავი პარასკევი 2026', 'Black Friday 2026')}
              </span>
              <h1 style={{ font: '800 52px/1.05 var(--font-display)', letterSpacing: '-1.5px', color: 'white', marginTop: 16 }}>
                {t('ფასდაკლება', 'Up to')} <span style={{ color: '#FFDA44' }}>70%</span>{t('-მდე', ' off')}
              </h1>
              <p style={{ font: 'var(--text-body-base)', color: 'rgba(255,255,255,0.8)', marginTop: 8, maxWidth: 420 }}>
                {t('ათასობით პროდუქტი ფასდაკლებით. ნაღდი ანგარიშსწორება და უფასო მიწოდება — მხოლოდ 48 საათი.', 'Thousands of products on sale. Cash on delivery & free shipping — 48 hours only.')}
              </p>

              {/* Countdown */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 24 }}>
                <span style={{ font: 'var(--text-body-secondary-md)', color: 'rgba(255,255,255,0.7)' }}>{t('სრულდება:', 'Ends in:')}</span>
                <div style={{ display: 'flex', gap: 8 }}>
                  {[{ v: '01', ka: 'დღე', en: 'days' }, { v: '18', ka: 'სთ', en: 'hrs' }, { v: '42', ka: 'წთ', en: 'min' }, { v: '09', ka: 'წმ', en: 'sec' }].map((u, i) => (
                    <div key={i} style={{
                      minWidth: 56, padding: '8px 10px', background: 'rgba(255,255,255,0.12)',
                      borderRadius: 'var(--radius-md)', textAlign: 'center', backdropFilter: 'blur(6px)',
                      border: '1px solid rgba(255,255,255,0.15)',
                    }}>
                      <div className="num" style={{ font: '800 24px/1 var(--font-numbers)', color: 'white' }}>{u.v}</div>
                      <div style={{ font: 'var(--text-body-tiny)', color: 'rgba(255,255,255,0.6)', marginTop: 2 }}>{t(u.ka, u.en)}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* hero product collage */}
            <div style={{ position: 'relative', height: 200, zIndex: 2 }}>
              <img src={stockSrc('iphone', 280, 280)} alt="" style={{ position: 'absolute', right: 30, top: -20, width: 180, height: 180, objectFit: 'cover', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-xl)', transform: 'rotate(-6deg)' }} />
              <img src={stockSrc('sneakers', 180, 180)} alt="" style={{ position: 'absolute', right: 180, top: 60, width: 130, height: 130, objectFit: 'cover', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-xl)', transform: 'rotate(8deg)', border: '3px solid white' }} />
            </div>
          </div>
        </section>

        {/* ─── DEAL CATEGORY PILLS ─── */}
        <section style={{ padding: '24px 40px 0' }}>
          <div style={{ display: 'flex', gap: 8, overflow: 'hidden' }}>
            {[
              { ka: 'ყველა აქცია', en: 'All deals', active: true },
              { ka: 'ელექტრონიკა', en: 'Electronics' },
              { ka: 'მოდა', en: 'Fashion' },
              { ka: 'სილამაზე', en: 'Beauty' },
              { ka: 'სახლი', en: 'Home' },
              { ka: 'სპორტი', en: 'Sports' },
              { ka: '50%+ ფასდაკლება', en: '50%+ off', tint: 'red' },
            ].map((c, i) => (
              <button key={i} className={c.active ? 'chip chip-active' : (c.tint === 'red' ? 'chip chip-tint-red' : 'chip')} style={{ padding: '8px 16px' }}>
                {c.tint === 'red' && <Icon name="fire" size={14} weight="fill" />}
                {t(c.ka, c.en)}
              </button>
            ))}
          </div>
        </section>

        {/* ─── FLASH SALE ─── */}
        <section style={{ padding: '24px 40px' }}>
          <div className="card-soft" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{
              padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              background: 'linear-gradient(95deg, var(--moveli-purple-500), var(--moveli-cyan-400))',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <Icon name="lightning" size={26} weight="fill" style={{ color: 'white' }} />
                <div>
                  <h3 style={{ color: 'white', font: '800 22px/1 var(--font-display)' }}>{t('ელვისებური აქცია', 'Flash sale')}</h3>
                  <div style={{ font: 'var(--text-body-tiny)', color: 'rgba(255,255,255,0.85)', marginTop: 2 }}>{t('სანამ მარაგი ამოიწურება', 'While stocks last')}</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ font: 'var(--text-body-secondary-md)', color: 'rgba(255,255,255,0.85)' }}>{t('სრულდება', 'Ends in')}</span>
                {['02', '14', '38'].map((v, i) => (
                  <React.Fragment key={i}>
                    <span className="num" style={{ font: '700 16px/1 var(--font-numbers)', color: 'var(--moveli-purple-700)', background: 'white', padding: '6px 8px', borderRadius: 6 }}>{v}</span>
                    {i < 2 && <span style={{ color: 'white', fontWeight: 700 }}>:</span>}
                  </React.Fragment>
                ))}
              </div>
            </div>
            <div style={{ padding: 20, display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 12 }}>
              {flashDeals.map((d, i) => (
                <div key={i} className="card" style={{ padding: 10, display: 'flex', flexDirection: 'column', gap: 8, cursor: 'pointer' }}>
                  <div style={{ position: 'relative' }}>
                    <div style={{ height: 130, borderRadius: 'var(--radius-md)', background: `url(${stockSrc(d.image, 260, 260)}) center/cover var(--neutral-050)` }} />
                    <span className="chip chip-tint-red" style={{ position: 'absolute', top: 6, left: 6, padding: '3px 8px', font: 'var(--text-body-tiny-md)' }}>{d.badge}</span>
                  </div>
                  <div style={{ font: 'var(--text-body-tiny-md)', color: 'var(--fg-primary)', minHeight: 32, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{d.title}</div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                    <span className="num" style={{ font: '700 16px/1 var(--font-numbers)', color: 'var(--negative-strong)' }}>₾{d.price}</span>
                    <span className="num" style={{ font: 'var(--text-body-tiny)', color: 'var(--fg-tertiary)', textDecoration: 'line-through' }}>₾{d.oldPrice}</span>
                  </div>
                  {/* Stock progress */}
                  <div>
                    <div style={{ height: 6, background: 'var(--neutral-100)', borderRadius: 999, overflow: 'hidden' }}>
                      <div style={{ width: `${d.sold}%`, height: '100%', background: d.sold > 80 ? 'var(--moveli-gradient-vivid)' : 'var(--moveli-gradient)' }} />
                    </div>
                    <div style={{ font: 'var(--text-body-tiny)', color: d.sold > 80 ? 'var(--negative-strong)' : 'var(--fg-tertiary)', marginTop: 4, display: 'flex', alignItems: 'center', gap: 3 }}>
                      {d.sold > 80 && <Icon name="fire" size={11} weight="fill" />}
                      <span className="num">{d.sold}%</span> {t('გაყიდულია', 'sold')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── DEAL CATEGORY BANNERS ─── */}
        <section style={{ padding: '0 40px 24px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
            {[
              { ka: 'ტექნიკა', en: 'Tech', off: t('40%-მდე', 'up to 40%'), img: 'laptop', tint: 'rgba(155,142,229,0.85)' },
              { ka: 'მოდა', en: 'Fashion', off: t('60%-მდე', 'up to 60%'), img: 'jacket', tint: 'rgba(125,206,234,0.85)' },
              { ka: 'სილამაზე', en: 'Beauty', off: t('50%-მდე', 'up to 50%'), img: 'serum', tint: 'rgba(228,64,175,0.8)' },
            ].map((b, i) => (
              <div key={i} style={{
                borderRadius: 'var(--radius-xl)', overflow: 'hidden', position: 'relative',
                height: 150, padding: 24, display: 'flex', flexDirection: 'column', justifyContent: 'center',
                background: `linear-gradient(100deg, ${b.tint}, rgba(255,255,255,0)), url(${stockSrc(b.img, 480, 300)}) right center/cover`,
                cursor: 'pointer',
              }}>
                <h3 style={{ color: 'white', font: '800 26px/1 var(--font-display)', textShadow: '0 1px 8px rgba(0,0,0,0.2)' }}>{t(b.ka, b.en)}</h3>
                <div style={{ font: 'var(--text-body-base-md)', color: 'white', marginTop: 6, textShadow: '0 1px 8px rgba(0,0,0,0.2)' }}>{t('ფასდაკლება', 'Save')} {b.off}</div>
                <span style={{ marginTop: 12, font: 'var(--text-label-secondary)', color: 'white', display: 'flex', alignItems: 'center', gap: 4 }}>{t('ნახე ყველა', 'Shop now')} <Icon name="arrow-right" size={14} /></span>
              </div>
            ))}
          </div>
        </section>

        {/* ─── BIGGEST DISCOUNTS GRID ─── */}
        <section style={{ padding: '8px 40px 48px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 16 }}>
            <div>
              <h2>{t('ყველაზე დიდი ფასდაკლება', 'Biggest discounts')}</h2>
              <p style={{ marginTop: 4 }}>{t('ხელიდან არ გაუშვა — შეზღუდული მარაგი', "Don't miss out — limited stock")}</p>
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <span style={{ font: 'var(--text-body-secondary)', color: 'var(--fg-secondary)' }}>{t('დახარისხება:', 'Sort:')}</span>
              <button className="btn btn-secondary btn-sm">{t('ფასდაკლება ↓', 'Discount ↓')} <Icon name="caret-down" size={14} /></button>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12 }}>
            {[
              { image: 'bag', title: t('ჩარმის ჩანთა · ბეჟი', 'Leather tote · Beige'), vendor: 'MOVELI Studio', price: '189', oldPrice: '249', rating: '4.5', reviews: '421', badge: '−24%' },
              { image: 'jacket', title: t('ზამთრის ქურთუკი', 'Winter jacket'), vendor: 'Zara', price: '149', oldPrice: '299', rating: '4.6', reviews: '512', badge: '−50%' },
              { image: 'lipstick', title: t('მეტ ტუჩსაცხი · ნაკრები', 'Matte lipstick · Set'), vendor: 'Lumière', price: '89', oldPrice: '149', rating: '4.7', reviews: '834', badge: '−40%' },
              { image: 'lamp', title: t('ხის ლუსტრა', 'Pendant lamp · Oak'), vendor: 'Nordic Home', price: '149', oldPrice: '249', rating: '4.7', reviews: '184', badge: '−40%' },
              { image: 'headphone', title: t('Sony WH-1000XM5', 'Sony WH-1000XM5'), vendor: 'Sony', price: '589', oldPrice: '789', rating: '4.8', reviews: '1,820', badge: '−25%' },
              { image: 'dress', title: t('საღამოს კაბა', 'Evening dress'), vendor: 'Mango', price: '129', oldPrice: '219', rating: '4.4', reviews: '267', badge: '−41%' },
              { image: 'perfume', title: t('სუნამო · 100ml', 'Eau de parfum · 100ml'), vendor: 'Dior', price: '249', oldPrice: '349', rating: '4.9', reviews: '1,402', badge: '−29%' },
              { image: 'yoga', title: t('იოგას ხალიჩა · პრემიუმ', 'Yoga mat · Premium'), vendor: 'Decathlon', price: '49', oldPrice: '89', rating: '4.6', reviews: '623', badge: '−45%' },
              { image: 'camera', title: t('Sony α7 IV', 'Sony α7 IV'), vendor: 'Sony', price: '4,290', oldPrice: '4,890', rating: '4.7', reviews: '231', badge: '−12%' },
              { image: 'sneakers2', title: t('Adidas Ultraboost', 'Adidas Ultraboost'), vendor: 'Adidas', price: '289', oldPrice: '389', rating: '4.8', reviews: '847', badge: '−26%' },
            ].map((p, i) => (
              <ProductCard key={i} image={p.image} title={p.title} vendor={p.vendor} priceLari={p.price} oldPriceLari={p.oldPrice} rating={p.rating} reviews={p.reviews} badge={p.badge} badgeTint="red" />
            ))}
          </div>
          <div style={{ marginTop: 24, textAlign: 'center' }}>
            <button className="btn btn-secondary btn-lg">{t('მეტი აქცია', 'Load more deals')}</button>
          </div>
        </section>
      </div>
    </div>
  );
};

Object.assign(window, { DealsScreen });
