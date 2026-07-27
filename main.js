let translations = {};
document.addEventListener('DOMContentLoaded', () => {
  // Lucide icons initialization
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }

  // Translation initialization
  const langSelector = document.getElementById('lang-selector');
  const updateLanguage = (lang) => {
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (translations[lang] && translations[lang][key]) {
        el.textContent = translations[lang][key];
      }
    });
    // Handle elements where only inner text (not child elements) should change
    document.querySelectorAll('[data-i18n-text]').forEach(el => {
      const key = el.getAttribute('data-i18n-text');
      if (translations[lang] && translations[lang][key]) {
        // Find the last text node and update it
        const nodes = el.childNodes;
        for (let i = nodes.length - 1; i >= 0; i--) {
          if (nodes[i].nodeType === Node.TEXT_NODE) {
            nodes[i].textContent = ' ' + translations[lang][key];
            break;
          }
        }
      }
    });
  };

  fetch('data/data.json')
    .then(response => response.json())
    .then(data => {
      translations = data.translations || {};
      
      if (data.images) {
        document.querySelectorAll('[data-img]').forEach(el => {
          const key = el.getAttribute('data-img');
          if (data.images[key]) {
            el.src = data.images[key];
          }
        });
      }

      if (langSelector) {
        updateLanguage(langSelector.value || 'es');
      }
    })
    .catch(err => console.error('Error fetching data.json:', err));

  if (langSelector) {
    langSelector.addEventListener('change', (e) => {
      updateLanguage(e.target.value);
    });
  }

  // Header Scroll Effect
  const header = document.getElementById('header');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });

  // Reveal Animations on Scroll
  const revealOnScroll = () => {
    const revealElements = document.querySelectorAll('[data-reveal]');
    const triggerBottom = window.innerHeight * 0.9;
    
    revealElements.forEach(el => {
      const elementTop = el.getBoundingClientRect().top;
      
      if (elementTop < triggerBottom) {
        el.classList.add('revealed');
      }
    });
  };

  window.addEventListener('scroll', revealOnScroll);
  revealOnScroll(); // Trigger once on load

  // Mobile Menu (Small implementation for UX)
  const mobileMenuBtn = document.querySelector('.menu-mobile');
  const nav = document.querySelector('nav');
  let menuOpen = false;

  if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener('click', () => {
      if (!menuOpen) {
        nav.style.display = 'block';
        nav.style.position = 'absolute';
        nav.style.top = '100%';
        nav.style.left = '0';
        nav.style.width = '100%';
        nav.style.backgroundColor = 'rgba(10, 10, 10, 0.95)';
        nav.style.padding = '2rem';
        nav.style.textAlign = 'center';
        nav.querySelector('ul').style.flexDirection = 'column';
        nav.querySelector('ul').style.gap = '2rem';
        menuOpen = true;
      } else {
        nav.style.display = 'none';
        menuOpen = false;
      }
    });
  }

  // Click on Nav Link to Close Menu (for mobile)
  const navLinks = document.querySelectorAll('nav ul li a');
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      if (window.innerWidth <= 768) {
        nav.style.display = 'none';
        menuOpen = false;
      }
    });
  });

  // Smooth Scroll offset for fixed header
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        const headerOffset = 80;
        const elementPosition = target.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    });
  });
  // CMS CONTENT LOADER
  const loadCMSContent = async () => {
    try {
      const response = await fetch('data/content.json');
      if (!response.ok) return;
      const data = await response.json();
      
      // Update General / Logos
      if (data.logo) {
        const logoImg = document.querySelector('.logo img');
        if (logoImg) logoImg.src = data.logo;
      }
      if (data.footer_logo) {
        const footLogo = document.querySelector('.footer-logo img');
        if (footLogo) footLogo.src = data.footer_logo;
      }
      if (data.hostal_name) {
        document.querySelectorAll('.hero-brand').forEach(el => el.textContent = data.hostal_name);
      }

      // Update Hero
      if (data.hero) {
        if (data.hero.title) document.getElementById('hero-title').textContent = data.hero.title;
        if (data.hero.subtitle) document.getElementById('hero-subtitle').textContent = data.hero.subtitle;
        if (data.hero.background) document.getElementById('inicio').style.backgroundImage = `url('${data.hero.background}')`;
      }
      
      // Update Experience
      if (data.exp_section_title) {
        const expTag = document.querySelector('.experience .section-tag');
        if (expTag) expTag.textContent = data.exp_section_title;
      }
      if (data.experience) {
        if (data.experience.title) document.getElementById('exp-title-main').textContent = data.experience.title;
        const expContainer = document.getElementById('exp-features-container');
        if (expContainer && data.experience.items) {
          expContainer.innerHTML = data.experience.items.map(item => `
            <div class="exp-item">
              <i data-lucide="${item.icon}"></i>
              <span>${item.text}</span>
            </div>
          `).join('');
        }
      }

      // Update Rooms
      if (data.rooms_title_text) {
        const roomsTitle = document.querySelector('#habitaciones .section-title');
        if (roomsTitle) roomsTitle.textContent = data.rooms_title_text;
      }
      console.log('Rendering rooms...', data.rooms ? data.rooms.length : 0);
      if (data.rooms && data.rooms.length > 0) {
        const roomsContainer = document.getElementById('rooms-container');
        if (roomsContainer) {
          roomsContainer.innerHTML = data.rooms.map(room => {
            const phoneNumber = (data.contact?.whatsapp || '').replace(/\s+/g, '').replace(/\+/g, '');
            return `
              <div class="room-card revealed" data-reveal>
                <div class="room-image">
                  <img src="${room.image || ''}" alt="${room.title || ''}">
                </div>
                <div class="room-details">
                  <h3 data-i18n="${room.title_key || ''}">${room.title || 'Habitación'}</h3>
                  <p data-i18n="${room.desc_key || ''}">${room.description || ''}</p>
                  <ul class="room-bullets">
                    ${(room.features || []).map(f => `
                      <li><span>${f}</span></li>
                    `).join('')}
                  </ul>
                  <a href="https://wa.me/${phoneNumber}" class="btn btn-primary" data-i18n="btn_avail">Consultar disponibilidad</a>
                </div>
              </div>
            `;
          }).join('');
          console.log('Rooms HTML injected.');
        }
      } else {
        console.warn('No rooms data found to render.');
      }

      // Update Services
      if (data.services_title_text) {
        const servTitle = document.querySelector('#servicios .section-title');
        if (servTitle) servTitle.textContent = data.services_title_text;
      }
      if (data.services && data.services.length > 0) {
        const servicesContainer = document.getElementById('services-container');
        if (servicesContainer) {
          servicesContainer.innerHTML = data.services.map(ser => `
            <div class="service-item">
              <i data-lucide="${ser.icon}"></i>
              <h3>${ser.title}</h3>
              <p>${ser.text}</p>
            </div>
          `).join('');
        }
      }

      // Update Tips
      if (data.tips_title_main) {
        const tipsTitle = document.querySelector('#tips .section-title');
        if (tipsTitle) tipsTitle.textContent = data.tips_title_main;
      }
      if (data.tips_desc_main) {
        const tipsDesc = document.querySelector('.tips-intro');
        if (tipsDesc) tipsDesc.textContent = data.tips_desc_main;
      }
      if (data.tips && data.tips.length > 0) {
        const tipsContainer = document.getElementById('tips-container');
        if (tipsContainer) {
          tipsContainer.innerHTML = data.tips.map(tip => `
            <div class="tip-card">
              <i data-lucide="${tip.icon}"></i>
              <h3>${tip.title}</h3>
              <p>${tip.text}</p>
            </div>
          `).join('');
        }
      }

      // Update Gallery
      if (data.gallery && data.gallery.length > 0) {
        const galleryContainer = document.getElementById('gallery-container');
        if (galleryContainer) {
          galleryContainer.innerHTML = data.gallery.map(item => `
            <div class="gallery-item revealed" data-reveal>
              <img src="${item.image}" alt="Galería Di'Mogalo">
              <div class="gallery-overlay">
                <p>${item.caption}</p>
              </div>
            </div>
          `).join('');
        }
      }

      // Update Reviews
      if (data.reviews_title_text) {
        const revTitle = document.querySelector('.reviews-section .section-title');
        if (revTitle) revTitle.textContent = data.reviews_title_text;
      }
      if (data.reviews && data.reviews.length > 0) {
        const reviewsContainer = document.getElementById('reviews-container');
        if (reviewsContainer) {
          reviewsContainer.innerHTML = data.reviews.map(rev => `
            <div class="testimonial-card">
              <div class="stars">${rev.stars}</div>
              <p>${rev.text}</p>
              <span class="client">${rev.client}</span>
            </div>
          `).join('');
        }
      }

      // Update CTA Section
      if (data.cta_title) document.getElementById('cta-title').textContent = data.cta_title;
      if (data.cta_desc) document.getElementById('cta-desc').textContent = data.cta_desc;
      if (data.cta_button_text) {
        const ctaBtn = document.getElementById('cta-whatsapp-link');
        if (ctaBtn) ctaBtn.textContent = data.cta_button_text;
      }

      // Update Contact/WhatsApp
      if (data.contact && data.contact.whatsapp) {
        const waLink = `https://wa.me/${data.contact.whatsapp.replace(/\s+/g, '').replace('+', '')}`;
        document.querySelectorAll('a[href*="wa.me"]').forEach(link => {
          link.href = waLink;
        });
        if (document.getElementById('whatsapp-number-display')) {
          document.getElementById('whatsapp-number-display').textContent = data.contact.whatsapp;
        }
        if (data.contact.address) {
          if (document.getElementById('footer-address-main')) document.getElementById('footer-address-main').textContent = data.contact.address;
        }
        if (data.contact.gmaps_embed) {
          const mapIframe = document.getElementById('map-iframe');
          if (mapIframe) mapIframe.src = data.contact.gmaps_embed;
        }
      }

      // Re-initialize Lucide and Reveal for new elements
      if (typeof lucide !== 'undefined') {
        lucide.createIcons();
      }
      
      // Re-trigger reveal check and apply translations
      if (langSelector) {
        updateLanguage(langSelector.value || 'es');
      }
      revealOnScroll();

    } catch (err) {
      console.error('Error loading CMS data:', err);
    }
  };

  loadCMSContent();
});
