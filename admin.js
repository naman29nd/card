/**
 * Fast client-side image compressor using HTML5 canvas
 * Resizes huge smartphone photos (15MB+) down to ~100KB web-ready data URLs
 */
function compressImage(file, maxWidth = 800, maxHeight = 1000, quality = 0.82) {
  return new Promise((resolve, reject) => {
    if (file.type === 'image/svg+xml') {
      const reader = new FileReader();
      reader.onload = e => resolve(e.target.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        const compressed = canvas.toDataURL('image/jpeg', quality);
        resolve(compressed);
      };
      img.onerror = () => resolve(e.target.result);
      img.src = e.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}


/**
 * Naman Daryani - Owner Admin Panel & CMS Engine
 * Allows visual editing of all card content, photos, company details, and PIN
 */

document.addEventListener('DOMContentLoaded', () => {
  setupAdminCMS();
});

function setupAdminCMS() {
  const adminLoginBtn = document.getElementById('adminLoginBtn');
  const adminModal = document.getElementById('adminModal');
  const closeAdminModal = document.getElementById('closeAdminModal');
  const adminPinInput = document.getElementById('adminPinInput');
  const submitPinBtn = document.getElementById('submitPinBtn');
  const pinErrorMsg = document.getElementById('pinErrorMsg');
  const adminAuthView = document.getElementById('adminAuthView');
  const adminDashboardView = document.getElementById('adminDashboardView');
  const adminForm = document.getElementById('adminForm');

  // Open Admin Modal
  adminLoginBtn.addEventListener('click', () => {
    adminModal.classList.add('active');
    adminPinInput.value = '';
    pinErrorMsg.textContent = '';
    adminAuthView.style.display = 'block';
    adminDashboardView.style.display = 'none';
    setTimeout(() => adminPinInput.focus(), 150);
  });

  // Close Modal
  closeAdminModal.addEventListener('click', () => adminModal.classList.remove('active'));
  adminModal.addEventListener('click', (e) => {
    if (e.target === adminModal) adminModal.classList.remove('active');
  });

  // Submit PIN
  const verifyPin = () => {
    const enteredPin = adminPinInput.value.trim();
    const correctPin = (cardData && cardData.security && cardData.security.adminPin) ? cardData.security.adminPin : '2907';

    if (enteredPin === correctPin) {
      pinErrorMsg.textContent = '';
      adminAuthView.style.display = 'none';
      adminDashboardView.style.display = 'flex';
      populateAdminFields();
    } else {
      pinErrorMsg.textContent = 'Incorrect PIN. Default is 2907.';
      adminPinInput.value = '';
      adminPinInput.focus();
    }
  };

  submitPinBtn.addEventListener('click', verifyPin);
  adminPinInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      verifyPin();
    }
  });

  // Tab switching in Admin Dashboard
  const adminTabs = document.querySelectorAll('.cms-tab-btn, .admin-tab');
  adminTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      adminTabs.forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.cms-tab-pane, .admin-tab-content').forEach(c => c.classList.remove('active'));

      tab.classList.add('active');
      const targetContent = document.getElementById(tab.getAttribute('data-tab'));
      if (targetContent) targetContent.classList.add('active');
    });
  });

  // Profile Photo Upload Preview
  const profileImageInput = document.getElementById('profileImageInput');
  const adminAvatarPreview = document.getElementById('adminAvatarPreview');
  const removeAvatarBtn = document.getElementById('removeAvatarBtn');

  profileImageInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const notifyEl = document.getElementById('adminSaveNotification');

    try {
      if (notifyEl) {
        notifyEl.className = 'cms-toast notification-bar';
        notifyEl.style.display = 'block';
        notifyEl.style.backgroundColor = 'rgba(255,255,255,0.1)';
        notifyEl.style.color = '#fff';
        notifyEl.textContent = 'Optimizing photo...';
      }

      // Fast client-side compression (<150KB)
      const compressedDataUrl = await compressImage(file, 800, 1000, 0.82);
      adminAvatarPreview.innerHTML = `<img src="${compressedDataUrl}" alt="Avatar Preview">`;

      if (!cardData.profile) cardData.profile = {};
      cardData.profile.avatar = compressedDataUrl;

      // If running on local Node server, also persist image file to disk
      const isLocalServer = ['localhost', '127.0.0.1'].includes(window.location.hostname);
      if (isLocalServer) {
        try {
          const res = await fetch('/api/upload-image', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              filename: 'profile_' + Date.now() + '.jpg',
              base64Data: compressedDataUrl
            })
          });
          if (res.ok) {
            const data = await res.json();
            if (data.success) {
              cardData.profile.avatar = data.path + '?v=' + Date.now();
            }
          }
        } catch (serverErr) {
          console.log('Local server upload skipped, using optimized data URL');
        }
      }

      if (notifyEl) {
        notifyEl.className = 'cms-toast notification-bar success';
        notifyEl.style.backgroundColor = 'rgba(50, 200, 100, 0.2)';
        notifyEl.style.color = '#4ade80';
        notifyEl.textContent = '✓ Photo updated! Click "Save Changes" below to apply.';
        setTimeout(() => { notifyEl.style.display = 'none'; }, 3000);
      }
    } catch (err) {
      console.error('Photo optimization error:', err);
      if (notifyEl) {
        notifyEl.style.backgroundColor = 'rgba(255,50,50,0.2)';
        notifyEl.style.color = '#ff6666';
        notifyEl.textContent = 'Error loading image. Please try another image.';
        setTimeout(() => { notifyEl.style.display = 'none'; }, 3000);
      }
    }
  });

  removeAvatarBtn.addEventListener('click', () => {
    if (cardData.profile) cardData.profile.avatar = 'assets/default-poster.svg';
    adminAvatarPreview.innerHTML = '<img src="assets/default-poster.svg" alt="Preview">';
    profileImageInput.value = '';
  });

  // Save Admin Form
  adminForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    saveAdminData();
  });

  // Export data.json
  const exportConfigBtn = document.getElementById('exportConfigBtn');
  exportConfigBtn.addEventListener('click', exportConfigFile);

  // Reset Defaults
  const resetDefaultsBtn = document.getElementById('resetDefaultsBtn');
  resetDefaultsBtn.addEventListener('click', () => {
    if (confirm('Are you sure you want to reset all settings to default?')) {
      localStorage.removeItem('naman_card_config');
      location.reload();
    }
  });
}

/**
 * Safe helpers for element value manipulation
 */
function setVal(id, val) {
  const el = document.getElementById(id);
  if (el) el.value = val !== undefined && val !== null ? val : '';
}

function getVal(id) {
  const el = document.getElementById(id);
  return el ? el.value.trim() : '';
}

/**
 * Populate CMS form fields from active cardData
 */
function populateAdminFields() {
  if (!cardData) return;

  const { profile = {}, businesses = {}, security = {} } = cardData;

  // Profile
  setVal('inputName', profile.name);
  setVal('inputTitle', profile.title);
  setVal('inputPhone', profile.phone);
  setVal('inputWhatsapp', profile.whatsapp);
  setVal('inputLocation', profile.location);
  setVal('inputBirthday', profile.birthdayDisplay);
  setVal('inputPersonalInsta', profile.instagram);
  setVal('inputBio', profile.bio);

  // Avatar Preview
  const adminAvatarPreview = document.getElementById('adminAvatarPreview');
  if (adminAvatarPreview) {
    const avatarSrc = (profile.avatar && profile.avatar.trim() !== '') ? profile.avatar : 'assets/default-poster.svg';
    adminAvatarPreview.innerHTML = `<img src="${avatarSrc}" alt="Avatar">`;
  }

  renderBusinessForms();

  // Security
  setVal('inputNewPin', security.adminPin || '2907');
}

/**
 * Save CMS data to LocalStorage, memory, and sync with local Node server if available
 */
async function saveAdminData() {
  const notifyEl = document.getElementById('adminSaveNotification');

  try {
    if (!cardData) cardData = getDefaultData();
    if (!cardData.profile) cardData.profile = {};
    if (!cardData.businesses) cardData.businesses = { exharnet: {}, geba: {} };
    if (!cardData.businesses.exharnet) cardData.businesses.exharnet = {};
    if (!cardData.businesses.geba) cardData.businesses.geba = {};
    if (!cardData.security) cardData.security = {};

    // 1. Update Profile in cardData
    cardData.profile.name = getVal('inputName');
    cardData.profile.title = getVal('inputTitle');
    cardData.profile.phone = getVal('inputPhone');
    cardData.profile.phoneDisplay = cardData.profile.phone;
    cardData.profile.whatsapp = getVal('inputWhatsapp');
    cardData.profile.location = getVal('inputLocation');
    cardData.profile.birthdayDisplay = getVal('inputBirthday');
    cardData.profile.instagram = getVal('inputPersonalInsta').replace(/^@/, '');
    cardData.profile.bio = getVal('inputBio');


    // Update Dynamic Businesses
    document.querySelectorAll('.biz-admin-block').forEach((block, idx) => {
      const biz = cardData.businesses[idx];
      biz.name = block.querySelector('.biz-input-name').value;
      biz.category = block.querySelector('.biz-input-category').value;
      biz.tagline = block.querySelector('.biz-input-tagline').value;
      biz.badge = block.querySelector('.biz-input-badge').value;
      biz.description = block.querySelector('.biz-input-desc').value;
      biz.website = block.querySelector('.biz-input-website').value;
      biz.instagram = block.querySelector('.biz-input-insta').value.replace(/^@/, '');
      biz.whatsappMessage = block.querySelector('.biz-input-wa').value;
    });

    // 4. Update PIN if changed

    const newPin = getVal('inputNewPin');
    if (newPin) {
      cardData.security.adminPin = newPin;
    }

    // 5. Persist to LocalStorage for instant client responsiveness
    localStorage.setItem('naman_card_config', JSON.stringify(cardData));

    // 6. Sync with local server API (if server.js is running)
    let serverSynced = false;
    try {
      const response = await fetch('/api/save-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cardData)
      });
      if (response.ok) {
        serverSynced = true;
      }
    } catch (e) {
      // Running statically (GitHub Pages / Vercel), local server not present
    }

    // 7. Update Live UI
    renderCardData();

    // 8. Show notification
    notifyEl.className = 'cms-toast notification-bar success';
    notifyEl.style.display = 'block';
    notifyEl.innerHTML = serverSynced
      ? `<strong>✓ Saved & Synced!</strong> Updated data.json on disk and in your browser.`
      : `<strong>✓ Saved Successfully!</strong> Your changes are live in this browser. Use 'Export data.json' to persist globally on GitHub/Vercel.`;

    setTimeout(() => {
      notifyEl.style.display = 'none';
    }, 4000);

  } catch (err) {
    console.error('Save error:', err);
    notifyEl.className = 'cms-toast notification-bar error';
    notifyEl.style.display = 'block';
    notifyEl.textContent = 'Error saving changes: ' + err.message;
  }
}

/**
 * Export data.json file download
 */
function exportConfigFile() {
  const jsonStr = JSON.stringify(cardData, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'data.json';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}


/**
 * Render dynamic business forms in CMS
 */
function renderBusinessForms() {
  const container = document.getElementById('adminBusinessAccordion');
  if (!container) return;
  container.innerHTML = '';
  
  const businesses = cardData.businesses || [];
  
  businesses.forEach((biz, index) => {
    const bizDiv = document.createElement('div');
    bizDiv.className = 'biz-admin-block';
    bizDiv.style.border = '1px solid rgba(255,255,255,0.1)';
    bizDiv.style.padding = '16px';
    bizDiv.style.marginBottom = '16px';
    bizDiv.style.borderRadius = '12px';
    bizDiv.style.background = 'rgba(255,255,255,0.02)';
    
    // Default values if missing
    const name = biz.name || '';
    const tagline = biz.tagline || '';
    const desc = biz.description || biz.story || '';
    const category = biz.category || '';
    const badge = biz.badge || '';
    const website = biz.website || '';
    const instagram = biz.instagram || '';
    const waMsg = biz.whatsappMessage || '';
    const logoSize = biz.logoSize || 64;
    const logo = biz.logo || '';
    
    bizDiv.innerHTML = `
      <h3 style="margin-top:0; border-bottom:1px solid rgba(255,255,255,0.1); padding-bottom:8px; margin-bottom:16px; font-size:14px; font-weight:600; display:flex; justify-content:space-between; align-items:center;">
        Business ${index + 1}: <span class="biz-title-preview" style="color:#fff;">${escapeHtml(name) || 'New Business'}</span>
        <button type="button" class="btn-delete-biz" data-index="${index}" style="background:transparent; border:none; color:#ff4d4d; font-size:12px; cursor:pointer;">Remove</button>
      </h3>
      
      <!-- LOGO UPLOAD & SIZE -->
      <div class="field-item">
        <label>Business Logo</label>
        <div style="display:flex; align-items:center; gap:12px; margin-bottom:8px;">
          <div class="biz-logo-preview" style="width:64px; height:64px; background:rgba(0,0,0,0.5); border-radius:8px; display:flex; align-items:center; justify-content:center; overflow:hidden;">
            ${logo ? `<img src="${logo}" style="max-width:100%; max-height:100%; object-fit:contain;">` : '<span style="font-size:10px; color:#666;">No Logo</span>'}
          </div>
          <div style="flex:1;">
            <input type="file" class="biz-logo-input" data-index="${index}" accept="image/png, image/jpeg, image/svg+xml" style="font-size:12px;">
            <div style="margin-top:8px; display:flex; align-items:center; gap:8px;">
              <span style="font-size:10px; color:#aaa;">Size:</span>
              <button type="button" class="btn-size-dec" data-index="${index}" style="background:rgba(255,255,255,0.1); border:none; color:#fff; width:24px; height:24px; border-radius:4px; cursor:pointer;">-</button>
              <span class="biz-size-display" style="font-size:12px; width:40px; text-align:center;">${logoSize}px</span>
              <button type="button" class="btn-size-inc" data-index="${index}" style="background:rgba(255,255,255,0.1); border:none; color:#fff; width:24px; height:24px; border-radius:4px; cursor:pointer;">+</button>
            </div>
          </div>
        </div>
      </div>
      
      <div class="field-2col">
        <div class="field-item">
          <label>Business Name</label>
          <input type="text" class="biz-input-name" data-index="${index}" value="${escapeHtml(name)}">
        </div>
        <div class="field-item">
          <label>Category (Top Left)</label>
          <input type="text" class="biz-input-category" data-index="${index}" value="${escapeHtml(category)}">
        </div>
      </div>
      
      <div class="field-2col">
        <div class="field-item">
          <label>Headline</label>
          <input type="text" class="biz-input-tagline" data-index="${index}" value="${escapeHtml(tagline)}">
        </div>
        <div class="field-item">
          <label>Badge (Top Right)</label>
          <input type="text" class="biz-input-badge" data-index="${index}" value="${escapeHtml(badge)}">
        </div>
      </div>
      
      <div class="field-item">
        <label>Description / Story</label>
        <textarea class="biz-input-desc" data-index="${index}" rows="3">${escapeHtml(desc)}</textarea>
      </div>
      
      <div class="field-2col">
        <div class="field-item">
          <label>Website URL</label>
          <input type="text" class="biz-input-website" data-index="${index}" value="${escapeHtml(website)}">
        </div>
        <div class="field-item">
          <label>Instagram (@)</label>
          <input type="text" class="biz-input-insta" data-index="${index}" value="${escapeHtml(instagram)}">
        </div>
      </div>
      
      <div class="field-item">
        <label>WhatsApp Default Message</label>
        <input type="text" class="biz-input-wa" data-index="${index}" value="${escapeHtml(waMsg)}">
      </div>
    `;
    
    container.appendChild(bizDiv);
  });
  
  // Attach Event Listeners to generated buttons
  
  // Delete Business
  document.querySelectorAll('.btn-delete-biz').forEach(btn => {
    btn.addEventListener('click', (e) => {
      if(confirm('Remove this business?')) {
        const idx = parseInt(e.target.getAttribute('data-index'));
        cardData.businesses.splice(idx, 1);
        renderBusinessForms();
      }
    });
  });
  
  // Increment / Decrement Size
  document.querySelectorAll('.btn-size-dec').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const idx = parseInt(e.target.getAttribute('data-index'));
      let size = cardData.businesses[idx].logoSize || 64;
      size = Math.max(16, size - 4);
      cardData.businesses[idx].logoSize = size;
      e.target.parentNode.querySelector('.biz-size-display').textContent = size + 'px';
    });
  });
  document.querySelectorAll('.btn-size-inc').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const idx = parseInt(e.target.getAttribute('data-index'));
      let size = cardData.businesses[idx].logoSize || 64;
      size = Math.min(256, size + 4);
      cardData.businesses[idx].logoSize = size;
      e.target.parentNode.querySelector('.biz-size-display').textContent = size + 'px';
    });
  });
  
  // Realtime Name preview
  document.querySelectorAll('.biz-input-name').forEach(input => {
    input.addEventListener('input', (e) => {
      const parent = e.target.closest('.biz-admin-block');
      const title = parent.querySelector('.biz-title-preview');
      title.textContent = e.target.value || 'New Business';
    });
  });
  
  // Logo Upload
  document.querySelectorAll('.biz-logo-input').forEach(input => {
    input.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      
      const idx = parseInt(e.target.getAttribute('data-index'));
      const notifyEl = document.getElementById('adminSaveNotification');
      const preview = e.target.closest('.field-item').querySelector('.biz-logo-preview');
      
      try {
        if (notifyEl) {
          notifyEl.className = 'cms-toast notification-bar';
          notifyEl.style.display = 'block';
          notifyEl.style.backgroundColor = 'rgba(255,255,255,0.1)';
          notifyEl.style.color = '#fff';
          notifyEl.textContent = 'Optimizing logo...';
        }

        const compressedDataUrl = await compressImage(file, 400, 400, 0.88);
        preview.innerHTML = `<img src="${compressedDataUrl}" style="max-width:100%; max-height:100%; object-fit:contain;">`;
        
        if (!cardData.businesses) cardData.businesses = [];
        if (!cardData.businesses[idx]) cardData.businesses[idx] = {};
        cardData.businesses[idx].logo = compressedDataUrl;

        const isLocalServer = ['localhost', '127.0.0.1'].includes(window.location.hostname);
        if (isLocalServer) {
          try {
            const res = await fetch('/api/upload-image', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                filename: 'biz_logo_' + Date.now() + '.png',
                base64Data: compressedDataUrl
              })
            });
            if (res.ok) {
              const data = await res.json();
              if (data.success) {
                cardData.businesses[idx].logo = data.path + '?v=' + Date.now();
              }
            }
          } catch (serverErr) {
            console.log('Local server upload skipped, using optimized data URL');
          }
        }

        if (notifyEl) {
          notifyEl.className = 'cms-toast notification-bar success';
          notifyEl.style.backgroundColor = 'rgba(50, 200, 100, 0.2)';
          notifyEl.style.color = '#4ade80';
          notifyEl.textContent = '✓ Logo updated! Click "Save Changes" below to apply.';
          setTimeout(() => { notifyEl.style.display = 'none'; }, 3000);
        }
      } catch (err) {
        console.error('Logo upload error:', err);
        if (notifyEl) {
          notifyEl.style.backgroundColor = 'rgba(255,50,50,0.2)';
          notifyEl.style.color = '#ff6666';
          notifyEl.textContent = 'Error loading logo.';
          setTimeout(() => { notifyEl.style.display = 'none'; }, 3000);
        }
      }
    });
  });
}

const btnAddBiz = document.getElementById('adminAddBusinessBtn');
if (btnAddBiz) {
  btnAddBiz.addEventListener('click', () => {
    if (!cardData.businesses) cardData.businesses = [];
    cardData.businesses.push({
      id: 'biz_' + Date.now(),
      name: '',
      logoSize: 64
    });
    renderBusinessForms();
  });
}
