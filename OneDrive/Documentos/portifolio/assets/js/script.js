// ═══════════════════════════════════════
//  ÁLVARO CÉSAR — PORTFOLIO SCRIPT
//  GitHub: alvarocsr2
// ═══════════════════════════════════════

const GITHUB_USER = 'alvarocsr2';

// ── Custom Cursor ──────────────────────
const cursor = document.getElementById('cursor');
const trail = document.getElementById('cursor-trail');

let mouseX = 0, mouseY = 0;
let trailX = 0, trailY = 0;

document.addEventListener('mousemove', (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
  if (cursor) {
    cursor.style.left = mouseX + 'px';
    cursor.style.top = mouseY + 'px';
  }
});

function animateTrail() {
  trailX += (mouseX - trailX) * 0.12;
  trailY += (mouseY - trailY) * 0.12;
  if (trail) {
    trail.style.left = trailX + 'px';
    trail.style.top = trailY + 'px';
  }
  requestAnimationFrame(animateTrail);
}
animateTrail();

// ── Navbar scroll ──────────────────────
const navbar = document.getElementById('navbar');

window.addEventListener('scroll', () => {
  if (!navbar) return;
  if (window.scrollY > 60) navbar.classList.add('scrolled');
  else navbar.classList.remove('scrolled');
});

// ── Hamburger menu ─────────────────────
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobile-menu');

if (hamburger && mobileMenu) {
  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    mobileMenu.classList.toggle('open');
  });

  document.querySelectorAll('.mobile-link').forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('active');
      mobileMenu.classList.remove('open');
    });
  });
}

// ── Scroll reveal ──────────────────────
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.1 }
);

document.querySelectorAll('.section-header, .about-grid, .contact-grid').forEach(el => {
  el.classList.add('reveal');
  revealObserver.observe(el);
});

// ── GitHub: perfil ─────────────────────
async function loadGitHubProfile() {
  try {
    const res = await fetch(`https://api.github.com/users/${GITHUB_USER}`);
    if (!res.ok) throw new Error('GitHub API error: ' + res.status);
    const data = await res.json();

    // Stats hero
    const reposEl = document.querySelector('#stat-repos .stat-num');
    const followersEl = document.querySelector('#stat-followers .stat-num');
    if (reposEl) reposEl.textContent = data.public_repos ?? '0';
    if (followersEl) followersEl.textContent = data.followers ?? '0';

    // Foto hero
    const heroPhoto = document.getElementById('hero-photo');
    if (heroPhoto && data.avatar_url) {
      heroPhoto.innerHTML = `<img src="${data.avatar_url}" alt="${data.name || GITHUB_USER}" style="width:100%; height:100%; object-fit:cover;">`;
    }

    // Avatar about
    const aboutAvatar = document.getElementById('about-avatar');
    if (aboutAvatar && data.avatar_url) {
      aboutAvatar.src = data.avatar_url;
      aboutAvatar.style.opacity = '1';
    }

  } catch (err) {
    console.warn('Perfil GitHub indisponível:', err.message);
  }
}


const LANG_ICONS = {
  JavaScript: 'javascript',
  TypeScript: 'typescript',
  Python: 'python',
  Java: 'java',
  HTML: 'html',
  CSS: 'css',
  PHP: 'php',
  'C#': 'csharp',
  Go: 'go',
  Kotlin: 'kotlin',
  Swift: 'swift',
  C: 'c',
  'C++': 'c_plus',
};

function formatRepoName(name) {
  return name
    .replace(/[-_]/g, ' ')
    .replace(/[^a-zA-Z0-9\s]/g, '')
    .toUpperCase();
}

function truncate(text, limit) {
  if (!text) return 'Projeto desenvolvido no GitHub';
  return text.length > limit ? text.substring(0, limit) + '...' : text;
}

function buildCard(repo) {
  const lang = repo.language || 'GitHub';

  const iconFileName = LANG_ICONS[lang] || 'github';
  

  const iconUrl = `./assets/icons/languages/${iconFileName}.svg`;

  const name = formatRepoName(repo.name);
  const desc = truncate(repo.description, 90);
  const topics = repo.topics ? repo.topics.slice(0, 3) : [];
  
  const tagsHtml = topics.length
    ? topics.map(t => `<span class="project-tag">${t}</span>`).join('')
    : `<span class="project-tag">${lang}</span>`;

  const deployBtn = repo.homepage
    ? `<a href="${repo.homepage}" target="_blank" class="project-btn project-btn-ghost">Deploy ↗</a>`
    : '';

  return `
    <div class="swiper-slide">
      <article class="project-card">
        <div class="project-header">
          <img src="${iconUrl}" 
               alt="${lang}" 
               class="project-lang-icon"
               onerror="this.src='https://cdn.jsdelivr.net/gh/devicons/devicon/icons/github/github-original.svg'">
          <span class="project-lang-badge">${lang}</span>
        </div>
        <div class="project-body">
          <h3 class="project-name">${name}</h3>
          <p class="project-desc">${desc}</p>
          <div class="project-tags">${tagsHtml}</div>
        </div>
        <div class="project-footer">
          <a href="${repo.html_url}" target="_blank" class="project-btn project-btn-primary">GitHub ↗</a>
          ${deployBtn}
        </div>
      </article>
    </div>`;
}

async function loadProjects() {
  const loader = document.getElementById('projects-loader');
  const wrapper = document.getElementById('swiper-wrapper');

  try {
    const res = await fetch(
      `https://api.github.com/users/${GITHUB_USER}/repos?sort=updated&per_page=9`
    );
    
    if (!res.ok) throw new Error('GitHub API error: ' + res.status);
    const repos = await res.json();

    // Remove o loader assim que os dados chegam
    if (loader) loader.classList.add('hidden');

    if (!Array.isArray(repos) || repos.length === 0) {
      if (wrapper) wrapper.innerHTML = '<p style="color:var(--gray-2); width:100%; text-align:center;">Nenhum repositório encontrado.</p>';
      return;
    }

    if (wrapper) {
      wrapper.innerHTML = repos.map(buildCard).join('');
      initSwiper();
    }

  } catch (err) {
    console.error('Erro ao carregar projetos:', err.message);
    if (loader) {
      loader.innerHTML = `
        <p style="color:var(--gray-2);font-size:.85rem; text-align:center;">
          Não foi possível carregar os projetos.<br>
          Verifique sua conexão ou o limite da API do GitHub.
        </p>`;
    }
  }
}

// ── Swiper ─────────────────────────────
function initSwiper() {
  if (typeof Swiper === 'undefined') return;
  
  new Swiper('.projects-swiper', {
    slidesPerView: 1,
    spaceBetween: 24,
    loop: true,
    grabCursor: true,
    breakpoints: {
      600: { slidesPerView: 2, slidesPerGroup: 2 },
      960: { slidesPerView: 3, slidesPerGroup: 3 },
    },
    navigation: {
      nextEl: '.swiper-button-next',
      prevEl: '.swiper-button-prev',
    },
    pagination: {
      el: '.swiper-pagination',
      clickable: true,
      dynamicBullets: true,
    },
    autoplay: {
      delay: 4500,
      pauseOnMouseEnter: true,
      disableOnInteraction: false,
    },
  });
}


const EMAIL_REGEX = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
const contactForm = document.getElementById('contact-form');

if (contactForm) {
  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    document.querySelectorAll('.form-error').forEach(el => (el.textContent = ''));
    const nome = document.getElementById('nome');
    const email = document.getElementById('email');
    const assunto = document.getElementById('assunto');
    const mensagem = document.getElementById('mensagem');

    let valid = true;
    if (nome.value.trim().length < 3) { valid = false; document.getElementById('err-nome').textContent = 'Mínimo 3 caracteres'; }
    if (!EMAIL_REGEX.test(email.value.trim())) { valid = false; document.getElementById('err-email').textContent = 'E-mail inválido'; }

    if (valid) contactForm.submit();
  });
}

const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-link');

const sectionObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        navLinks.forEach(link => {
          link.style.color = link.getAttribute('href') === `#${id}` ? 'var(--red)' : '';
        });
      }
    });
  },
  { threshold: 0.4 }
);
sections.forEach(s => sectionObserver.observe(s));

// ── Init ────────────────────────────────
loadGitHubProfile();
loadProjects();