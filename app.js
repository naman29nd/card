/**
 * Naman Daryani — iPhone Contact Poster & Digital Card
 * Core Application Engine
 */

let cardData = null;

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', async () => {
  await loadCardData();
  setupEventListeners();
document.getElementById("adminAuthView").style.display="none";document.getElementById("adminDashboardView").style.display="block";document.getElementById("cmsModal").classList.add("active");document.querySelector("[data-tab=\"adminTabBusinesses\"]").click();
});

/**
 * Load configuration from data.json and sync with localStorage overrides
 */
async function loadCardData() {
  try {
    const res = await fetch('data.json?t=' + Date.now());
    const fileData = await res.json();

    const cached = localStorage.getItem('naman_card_config');
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        cardData = { ...fileData, ...parsed };
      } catch (e) {
        cardData = fileData;
      }
    } else {
      cardData = fileData;
    }
  } catch (err) {
    console.error('Error loading config:', err);
    cardData = getDefaultData();
  }

  // Data Migration: If businesses is an object (old format), convert it to an array
  if (cardData.businesses && !Array.isArray(cardData.businesses)) {
    const bizArray = [];
    if (cardData.businesses.exharnet) {
      bizArray.push({ id: 'exharnet', ...cardData.businesses.exharnet, category: 'Architectural Wholesale', badge: 'All MP Wholesale', theme: '' });
    }
    if (cardData.businesses.geba) {
      bizArray.push({ id: 'geba', ...cardData.businesses.geba, category: 'Mindful Luxury Accessories', badge: 'Live Store', theme: 'geba-theme', description: cardData.businesses.geba.story });
    }
    cardData.businesses = bizArray;
  }

  renderCardData();
}

/**
 * Render all DOM elements with active config
 */
function setText(id, text) {
  const el = document.getElementById(id);
  if (el) el.textContent = text;
}

function setHref(id, url) {
  const el = document.getElementById(id);
  if (el) el.href = url;
}

function renderCardData() {
  const { profile = {}, businesses = [] } = cardData;

  // 1. Profile Core
  setText('profileName', profile.name);
  setText('profileTitle', profile.title);
  setText('profileLocation', profile.location);
  setText('profileBirthday', profile.birthdayDisplay);
  setText('profileInstagram', `@${profile.instagram}`);
  setText('profileBio', profile.bio);

  // Phone / Whatsapp Formatting
  const phoneDisplay = profile.phoneDisplay || profile.phone;
  setText('profilePhone', phoneDisplay);
  setHref('profilePhone', `tel:${profile.phone}`);
  
  setText('rowWhatsappLink', phoneDisplay);
  if (profile.whatsapp) {
    setHref('rowWhatsappLink', `https://wa.me/${profile.whatsapp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent('Hi Naman, got your contact via your NFC card!')}`);
  }

  // Poster Portrait Image
  const posterImg = document.getElementById('posterImage');
  if (posterImg) {
    if (profile.avatar && profile.avatar.trim() !== '') {
      posterImg.src = profile.avatar;
    } else {
      posterImg.src = 'assets/default-poster.svg';
    }
  }

  // Core Action Buttons
  setHref('callBtn', `tel:${profile.phone}`);
  if (profile.whatsapp) {
    setHref('whatsappBtn', `https://wa.me/${profile.whatsapp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent('Hi Naman, got your contact via your NFC card!')}`);
  }
  setHref('personalInstaBtn', `https://instagram.com/${profile.instagram}`);
  setHref('profileInstagram', `https://instagram.com/${profile.instagram}`);

  // 2. Dynamic Businesses Rendering
  const container = document.getElementById('dynamicBusinessesContainer');
  const template = document.getElementById('businessCardTemplate');
  
  if (container && template) {
    container.innerHTML = ''; // clear old instances

    businesses.forEach((biz) => {
      const clone = template.content.cloneNode(true);
      const cardEl = clone.querySelector('.business-card');
      if (biz.theme) cardEl.classList.add(biz.theme);
      if (biz.id === 'geba' || biz.theme === 'geba-theme') {
        clone.querySelector('.venture-clean-desc').classList.add('geba-quote-clean');
      }

      clone.querySelector('[data-bind="category"]').textContent = biz.category || 'Business';
      clone.querySelector('[data-bind="badge"]').textContent = biz.badge || 'Active';
      clone.querySelector('[data-bind="tagline"]').textContent = biz.tagline || '';
      clone.querySelector('[data-bind="description"]').textContent = biz.description || biz.story || '';

      // Logo handling
      const logoEl = clone.querySelector('[data-bind="logo"]');
      const nameEl = clone.querySelector('[data-bind="name"]');
      
      if (biz.logo) {
        logoEl.src = biz.logo;
        logoEl.style.display = 'block';
        if (biz.logoSize) logoEl.style.height = biz.logoSize + 'px';
        nameEl.style.display = 'none';
      } else {
        nameEl.textContent = biz.name;
        nameEl.style.display = 'block';
        logoEl.style.display = 'none';
      }

      // Offerings List
      const offeringsContainer = clone.querySelector('[data-bind="offeringsList"]');
      const items = biz.products || biz.collections || [];
      if (items.length > 0) {
        items.forEach((item, idx) => {
          const row = document.createElement('div');
          row.className = 'offering-row';
          row.innerHTML = `
            <span class="offering-bullet">0${idx + 1}</span>
            <div class="offering-details">
              <strong>${escapeHtml(item.name)}</strong>
              <span>${escapeHtml(item.desc)}</span>
            </div>
          `;
          offeringsContainer.appendChild(row);
        });
      }

      // Primary Button (Website)
      const primaryBtn = clone.querySelector('[data-bind="primaryBtn"]');
      const primaryBtnText = clone.querySelector('[data-bind="primaryBtnText"]');
      if (biz.website) {
        primaryBtn.style.display = 'inline-flex';
        primaryBtn.href = biz.website;
        if (biz.id === 'geba' || biz.theme === 'geba-theme') {
          primaryBtn.classList.replace('btn-glass-neon', 'btn-luxe-gold');
        }
        primaryBtnText.textContent = biz.primaryBtnText || 'Visit Website';
      }

      // Secondary Button (Instagram / Whatsapp)
      const secondaryBtn = clone.querySelector('[data-bind="secondaryBtn"]');
      const secondaryBtnText = clone.querySelector('[data-bind="secondaryBtnText"]');
      if (biz.instagram) {
        secondaryBtn.style.display = 'inline-flex';
        secondaryBtn.href = `https://instagram.com/${biz.instagram}`;
        secondaryBtnText.textContent = `Instagram: @${biz.instagram}`;
      } else if (biz.whatsappMessage && profile.whatsapp) {
        secondaryBtn.style.display = 'inline-flex';
        secondaryBtn.href = `https://wa.me/${profile.whatsapp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(biz.whatsappMessage)}`;
        secondaryBtnText.textContent = 'Inquire via WhatsApp';
      }

      container.appendChild(clone);
    });
  }

  // Auto-Update Footer Year
  setText('currentYear', new Date().getFullYear());
}

/**
 * Setup Event Listeners
 */
function setupEventListeners() {
  // Save Contact (vCard)
  document.getElementById('saveContactBtn').addEventListener('click', downloadVCard);

  // Web Share API
  document.getElementById('shareBtn').addEventListener('click', shareCard);

  // QR Modal
  const qrBtn = document.getElementById('qrBtn');
  const qrModal = document.getElementById('qrModal');
  const closeQrModal = document.getElementById('closeQrModal');
  const copyLinkBtn = document.getElementById('copyLinkBtn');

  qrBtn.addEventListener('click', () => {
    generateQRCode();
    qrModal.classList.add('active');
  });

  closeQrModal.addEventListener('click', () => qrModal.classList.remove('active'));
  qrModal.addEventListener('click', (e) => {
    if (e.target === qrModal) qrModal.classList.remove('active');
  });

  copyLinkBtn.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      copyLinkBtn.textContent = '✓ Copied Link!';
      setTimeout(() => {
        copyLinkBtn.textContent = 'Copy Card Link';
      }, 2000);
    } catch (err) {
      alert('Card URL: ' + window.location.href);
    }
  });
}

/**
 * Generate RFC-compliant vCard 3.0 file
 */
function downloadVCard() {
  if (!cardData) return;
  const { profile, businesses } = cardData;

  const vcard = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `N:Daryani;Naman;;;`,
    `FN:${profile.name}`,
    `ORG:Exharnet;Geba India`,
    `TITLE:${profile.title}`,
    `TEL;TYPE=CELL,VOICE,PREF:${profile.phone}`,
    `TEL;TYPE=WORK,VOICE:${profile.phone}`,
    `URL;TYPE=WORK:${businesses.geba.website}`,
    `URL;TYPE=WORK:${businesses.exharnet.website}`,
    `URL;TYPE=INSTAGRAM:https://instagram.com/${profile.instagram}`,
    `ADR;TYPE=WORK:;;${profile.location};;;India`,
    `BDAY:${profile.birthday}`,
    `NOTE:${profile.bio}`,
    'END:VCARD'
  ].join('\r\n');

  const blob = new Blob([vcard], { type: 'text/vcard;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${profile.name.replace(/\s+/g, '_')}.vcf`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Native Web Share API
 */
async function shareCard() {
  const shareData = {
    title: `${cardData.profile.name} — Contact Card`,
    text: `Naman Daryani (Founder: Exharnet & Geba India)`,
    url: window.location.href
  };

  if (navigator.share) {
    try {
      await navigator.share(shareData);
    } catch (e) {
      console.log('Share dismissed');
    }
  } else {
    try {
      await navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    } catch (e) {
      prompt('Copy card link:', window.location.href);
    }
  }
}

/**
 * QR Code Generator
 */
function generateQRCode() {
  const container = document.getElementById('qrCanvasContainer');
  const url = window.location.href;
  container.innerHTML = `
    <img src="https://api.qrserver.com/v1/create-qr-code/?size=170x170&data=${encodeURIComponent(url)}&color=000000" alt="QR Code" width="170" height="170" style="display:block; border-radius: 8px;">
  `;
}

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function getDefaultData() {
  return {
    profile: {
      name: "Naman Daryani",
      title: "Founder & Director",
      birthday: "2001-07-29",
      birthdayDisplay: "29 July 2001",
      location: "Indore, Madhya Pradesh, India",
      phone: "+918602679814",
      phoneDisplay: "+91 86026 79814",
      whatsapp: "+918602679814",
      instagram: "naman_daryani",
      bio: "Entrepreneur based in Indore, MP. Leading Exharnet (Architectural & Interior Surfaces Wholesale across MP) and Geba India (Handcrafted Sustainable Luxury Accessories).",
      avatar: "assets/default-poster.svg"
    },
    businesses: {
      exharnet: {
        name: "Exharnet",
        tagline: "Architectural & Interior Surfaces Wholesale",
        coverage: "Wholesale Distribution Across Madhya Pradesh",
        description: "Premier wholesale hub in Indore supplying high-pressure Mica & Laminates, Fluted & Acoustic Louvers, ASA Weather-Resistant Sheets, and Acrylic Panels to architects, interior designers, and retail dealers all over MP.",
        website: "https://exharnet.com",
        instagram: "exharnet",
        whatsappMessage: "Hi Naman, I would like to inquire about wholesale catalog and pricing for Exharnet products in Madhya Pradesh."
      },
      geba: {
        name: "Geba India",
        tagline: "Conscious Luxury • Upcycled Handcrafted Bags",
        story: "Born from a family passion for mindful design, Geba gives beautiful discarded fabrics a stunning second chapter. We meticulously handcraft single-edition pieces, turning rescued designer threads into personal, everyday luxury companions that belong only to you.",
        website: "https://gebaindia.com",
        instagram: "geba_official",
        whatsappMessage: "Hi Naman, I loved the Geba collection and would like to order or know more!"
      }
    },
    security: {
      adminPin: "2907"
    }
  };
}




