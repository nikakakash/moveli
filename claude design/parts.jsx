/* MOVELI — shared parts: Logo, TopBar, Footer, ProductCard, common bits */

const MoveliLogo = ({ size = 28, wordmark = true, style }) => {
  // Logo: a circular shopping bag on the V, MOVELI wordmark in gradient
  const gradId = React.useId();
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, ...style }}>
      <svg width={size * 1.1} height={size * 1.1} viewBox="0 0 44 44" fill="none" aria-hidden>
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="44" y2="44">
            <stop offset="0" stopColor="#9B8EE5" />
            <stop offset="1" stopColor="#7DCEEA" />
          </linearGradient>
        </defs>
        {/* arch */}
        <path d="M6 30 C 6 16, 38 16, 38 30" stroke={`url(#${gradId})`} strokeWidth="3" strokeLinecap="round" fill="none" />
        {/* bag */}
        <path d="M26 14 C 26 11, 32 11, 32 14" stroke={`url(#${gradId})`} strokeWidth="1.6" fill="none" />
        <rect x="23" y="14" width="12" height="14" rx="2.5" fill={`url(#${gradId})`} />
      </svg>
      {wordmark && (
        <span
          className="brand-text"
          style={{
            font: `800 ${Math.round(size * 0.92)}px/1 var(--font-display)`,
            letterSpacing: '-0.5px',
          }}
        >
          MOVELI
        </span>
      )}
    </span>
  );
};

const Avatar = ({ name = 'NM', size = 36, hue = 220 }) => (
  <span
    style={{
      width: size,
      height: size,
      borderRadius: '50%',
      background: `linear-gradient(135deg, hsl(${hue}, 70%, 78%), hsl(${(hue + 40) % 360}, 70%, 65%))`,
      color: 'white',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      font: '700 13px/1 var(--font-body)',
      flexShrink: 0,
    }}
  >
    {name}
  </span>
);

const Icon = ({ name, size = 18, style, weight = 'regular' }) => (
  <i className={`ph${weight === 'fill' ? '-fill' : weight === 'bold' ? '-bold' : ''} ph-${name}`} style={{ fontSize: size, lineHeight: 1, ...style }} />
);

const TopBar = ({ lang = 'ka', onLang, active = 'home', cartCount = 3, onSearchFocus }) => {
  const navKa = [
    { id: 'home', label: 'მთავარი' },
    { id: 'cat', label: 'კატეგორიები' },
    { id: 'deals', label: 'ფასდაკლება' },
    { id: 'new', label: 'ახალი მოსული' },
    { id: 'help', label: 'დახმარება' },
  ];
  const navEn = [
    { id: 'home', label: 'Home' },
    { id: 'cat', label: 'Categories' },
    { id: 'deals', label: 'Deals' },
    { id: 'new', label: 'New' },
    { id: 'help', label: 'Help' },
  ];
  const nav = lang === 'ka' ? navKa : navEn;
  const t = (ka, en) => (lang === 'ka' ? ka : en);

  return (
    <div style={{ background: 'var(--white)', borderBottom: '1px solid var(--border-default)', position: 'relative', zIndex: 5 }}>
      {/* utility strip */}
      <div style={{
        background: 'var(--neutral-050)',
        borderBottom: '1px solid var(--border-default)',
        padding: '6px 40px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        font: 'var(--text-body-tiny)',
        color: 'var(--fg-secondary)',
      }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Icon name="truck" size={14} />
          {t('უფასო მიწოდება ₾80-დან · 24 საათში', 'Free delivery from ₾80 · in 24 hours')}
        </span>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <Icon name="map-pin" size={14} /> {t('თბილისი', 'Tbilisi')}
          </span>
          <span>{t('ჩემი შეკვეთები', 'My orders')}</span>
          <button
            onClick={() => onLang && onLang(lang === 'ka' ? 'en' : 'ka')}
            style={{ background: 'transparent', border: 0, color: 'var(--fg-secondary)', cursor: 'pointer', font: 'var(--text-body-tiny-md)', display: 'flex', alignItems: 'center', gap: 4 }}
          >
            <Icon name="globe" size={14} /> {lang === 'ka' ? 'ქართული' : 'English'}
          </button>
        </div>
      </div>

      {/* main bar */}
      <div style={{ padding: '14px 40px', display: 'flex', alignItems: 'center', gap: 32 }}>
        <MoveliLogo size={26} />
        <div style={{
          flex: 1, maxWidth: 580, display: 'flex', alignItems: 'center', gap: 8,
          padding: '10px 14px',
          background: 'var(--neutral-050)',
          borderRadius: 'var(--radius-pill)',
          border: '1px solid transparent',
          cursor: 'text',
        }} onClick={onSearchFocus}>
          <Icon name="magnifying-glass" size={18} style={{ color: 'var(--fg-tertiary)' }} />
          <span style={{ flex: 1, color: 'var(--fg-tertiary)', font: 'var(--text-body-base)' }}>
            {t('მოძებნე პროდუქტი, ბრენდი ან კატეგორია…', 'Search products, brands or categories…')}
          </span>
          <kbd style={{
            font: 'var(--text-body-tiny-md)', color: 'var(--fg-secondary)',
            background: 'var(--white)', border: '1px solid var(--border-default)',
            borderRadius: 6, padding: '2px 6px',
          }}>⌘K</kbd>
        </div>

        <nav style={{ display: 'flex', gap: 4 }}>
          {nav.map(n => (
            <a key={n.id} style={{
              padding: '8px 12px', borderRadius: 'var(--radius-md)',
              color: active === n.id ? 'var(--moveli-purple-700)' : 'var(--fg-primary)',
              background: active === n.id ? 'var(--moveli-purple-050)' : 'transparent',
              font: 'var(--text-label-secondary)',
              cursor: 'pointer',
            }}>{n.label}</a>
          ))}
        </nav>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button className="btn btn-ghost btn-sm" style={{ borderRadius: 999, padding: 8 }}>
            <Icon name="heart" size={20} />
          </button>
          <button className="btn btn-ghost btn-sm" style={{ borderRadius: 999, padding: 8, position: 'relative' }}>
            <Icon name="shopping-bag" size={20} />
            {cartCount > 0 && (
              <span style={{
                position: 'absolute', top: 2, right: 2,
                background: 'var(--moveli-gradient)',
                color: 'white', borderRadius: 999,
                font: '700 10px/1 var(--font-body)',
                padding: '2px 5px', minWidth: 16, textAlign: 'center',
              }}>{cartCount}</span>
            )}
          </button>
          <Avatar name="NM" hue={260} />
        </div>
      </div>

      {/* categories strip */}
      <div style={{
        padding: '0 40px 12px',
        display: 'flex', gap: 6, alignItems: 'center',
        overflow: 'hidden',
      }}>
        {[
          { en: 'All categories', ka: 'ყველა კატეგორია', icon: 'squares-four' },
          { en: 'Electronics', ka: 'ელექტრონიკა', icon: 'devices' },
          { en: 'Clothing', ka: 'ტანსაცმელი', icon: 't-shirt' },
          { en: 'Home', ka: 'სახლი', icon: 'house-line' },
          { en: 'Beauty', ka: 'სილამაზე', icon: 'sparkle' },
          { en: 'Sports', ka: 'სპორტი', icon: 'basketball' },
          { en: 'Kids', ka: 'ბავშვები', icon: 'baby' },
          { en: 'Books', ka: 'წიგნები', icon: 'book-open' },
          { en: 'Food', ka: 'საკვები', icon: 'fork-knife' },
        ].map((c, i) => (
          <button key={c.en} className="chip" style={i === 0 ? { background: 'var(--neutral-900)', color: 'var(--white)' } : {}}>
            <Icon name={c.icon} size={14} />
            {t(c.ka, c.en)}
          </button>
        ))}
      </div>
    </div>
  );
};

/* Realistic stock image helper — uses Unsplash source */
const stock = (id, w = 400, h = 400) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&h=${h}&q=80`;

/* Product image set — curated photo IDs */
const PRODUCT_IMAGES = {
  airpods:   '1606220588913-b3aacb4d2f46', // earbuds
  iphone:    '1592286927505-1def25115558',
  watch:     '1546868871-7041f2a55e12',    // watch
  sneakers:  '1542291026-7eec264c27ff',    // sneaker red
  sneakers2: '1595950653106-6c9ebd614d3a', // sneaker white
  bag:       '1548036328-c9fa89d128fa',    // bag
  jacket:    '1551028719-00167b16eac5',    // jacket
  dress:     '1591047139829-d91aecb6caea', // dress
  sofa:      '1555041469-a586c61ea9bc',    // sofa
  lamp:      '1507473885765-e6ed057f782c', // lamp
  plant:     '1485955900006-10f4d324d411', // plant
  candle:    '1602874801006-2bd09c8a8a8d', // candle (might fail)
  serum:     '1556228720-195a672e8a03',    // skincare
  lipstick:  '1586495777744-4413f21062fa', // lipstick
  perfume:   '1541643600914-78b084683601', // perfume
  yoga:      '1518611012118-696072aa579a', // yoga mat
  ball:      '1614632537190-23e4146777db', // ball
  toy:       '1558877385-81a1c7e67d72',    // toy
  book:      '1544947950-fa07a98d237f',    // book
  laptop:    '1517336714731-489689fd1ca8', // laptop
  camera:    '1502920917128-1aa500764cbd', // camera
  headphone: '1505740420928-5e560c06d30e',
  speaker:   '1608043152269-423dbba4e7e1',
  drone:     '1473968512647-3e447244af8f',
  console:   '1606144042614-b2417e99c4e3',
  coffee:    '1572119865084-43c285814d63',
  bread:     '1568471173242-461f0a730452',
  wine:      '1547595628-c61a29f496f0',
  cheese:    '1452195100486-9cc805987862',
  honey:     '1587049352846-4a222e784d38',
  shoes:     '1549298916-b41d501d3772',
  shirt:     '1583743814966-8936f5b7be1a',
  jeans:     '1542272604-787c3835535d',
  hat:       '1521369909029-2afed882baee',
  scarf:     '1584736286279-75e54935d2c0',
  desk:      '1555041469-a586c61ea9bc',
  chair:     '1592078615290-033ee584e267',
  ruglight:  '1505693416388-ac5ce068fe85',
};

const stockSrc = (key, w = 400, h = 400) => stock(PRODUCT_IMAGES[key] || PRODUCT_IMAGES.sneakers, w, h);

const ProductCard = ({ image, title, vendor, priceLari, oldPriceLari, rating, reviews, badge, badgeTint = 'purple', size = 'md', onClick }) => {
  const [hovered, setHovered] = React.useState(false);
  const dims = size === 'lg' ? { card: 280, img: 220 } : size === 'sm' ? { card: 200, img: 160 } : { card: 240, img: 190 };
  return (
    <div
      className="card-soft"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onClick}
      style={{
        width: dims.card, padding: 12, display: 'flex', flexDirection: 'column', gap: 10,
        cursor: 'pointer', transition: 'transform var(--dur-base) var(--ease-out), box-shadow var(--dur-base) var(--ease-out)',
        transform: hovered ? 'translateY(-2px)' : 'none',
        boxShadow: hovered ? 'var(--shadow-md)' : 'var(--shadow-sm)',
      }}>
      <div style={{
        height: dims.img, borderRadius: 'var(--radius-md)',
        background: `var(--neutral-050) url(${stockSrc(image, dims.card * 2, dims.img * 2)}) center/cover`,
        position: 'relative', overflow: 'hidden',
      }}>
        {badge && (
          <span className={`chip chip-tint-${badgeTint}`} style={{
            position: 'absolute', top: 8, left: 8, padding: '4px 8px',
            font: 'var(--text-label-tertiary-bold)',
          }}>{badge}</span>
        )}
        <button style={{
          position: 'absolute', top: 8, right: 8, width: 32, height: 32, borderRadius: 999,
          background: 'rgba(255,255,255,0.92)', border: 0, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          backdropFilter: 'blur(4px)',
        }}>
          <Icon name="heart" size={16} style={{ color: 'var(--fg-secondary)' }} />
        </button>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <span style={{ font: 'var(--text-body-tiny)', color: 'var(--fg-tertiary)' }}>{vendor}</span>
        <span style={{ font: 'var(--text-body-secondary-md)', color: 'var(--fg-primary)', minHeight: 36, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {title}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Icon name="star" size={12} weight="fill" style={{ color: '#FFB800' }} />
          <span style={{ font: 'var(--text-body-tiny-md)', color: 'var(--fg-primary)' }} className="num">{rating}</span>
          <span style={{ font: 'var(--text-body-tiny)', color: 'var(--fg-tertiary)' }} className="num">({reviews})</span>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 'auto' }}>
        <span style={{ font: '700 18px/1 var(--font-numbers)', color: 'var(--fg-primary)' }} className="num">₾{priceLari}</span>
        {oldPriceLari && (
          <span style={{ font: 'var(--text-body-tiny)', color: 'var(--fg-tertiary)', textDecoration: 'line-through' }} className="num">₾{oldPriceLari}</span>
        )}
      </div>
    </div>
  );
};

Object.assign(window, {
  MoveliLogo, Avatar, Icon, TopBar, ProductCard, stock, stockSrc, PRODUCT_IMAGES,
});
