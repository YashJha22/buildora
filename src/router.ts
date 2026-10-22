import { renderProjectsPage, renderProjectDetail } from './pages/Projects';
import { renderNotFoundPage, renderStatusPage } from './pages/NotFound';
import { renderContactPage } from './pages/Contact';
import { PROJECTS } from './data/content';
import { st } from './state';
import type { SceneApi } from './scene';
import { initTypographyEngine } from './typography';

let currentGl: SceneApi | null = null;
let currentCleanup: (() => void) | null = null;
let globalHandleRoute: (() => void) | null = null;

export function navigateTo(href: string) {
  const currentFull = window.location.pathname + window.location.search;
  if (href !== currentFull) {
    window.history.pushState(null, '', href);
    if (globalHandleRoute) {
      globalHandleRoute();
    } else {
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
  }
}

function setMeta(title: string, description: string) {
  document.title = title;
  const metaDesc = document.querySelector<HTMLMetaElement>('meta[name="description"]');
  if (metaDesc) metaDesc.content = description;
  const ogTitle = document.querySelector<HTMLMetaElement>('meta[property="og:title"]');
  if (ogTitle) ogTitle.content = title;
  const ogDesc = document.querySelector<HTMLMetaElement>('meta[property="og:description"]');
  if (ogDesc) ogDesc.content = description;
  const twTitle = document.querySelector<HTMLMetaElement>('meta[name="twitter:title"]');
  if (twTitle) twTitle.content = title;
  const twDesc = document.querySelector<HTMLMetaElement>('meta[name="twitter:description"]');
  if (twDesc) twDesc.content = description;
}

export function setRouterSceneApi(api: SceneApi | null) {
  currentGl = api;
}

export function initRouter() {
  const subpageRoot = document.getElementById('subpage-root');
  const homeElements = [
    document.getElementById('w'),
    document.getElementById('l'),
    document.getElementById('ring'),
    document.querySelector('main'),
    document.getElementById('plan'),
    document.getElementById('bld'),
    document.querySelector('.foot'),
    document.querySelector('.vig'),
    document.querySelector('.grain'),
  ];
  const navProjectsLink = document.getElementById('nav-projects');
  const navContactLink = document.getElementById('nav-contact');
  const navStudioLink = document.getElementById('nav-studio');
  const navApproachLink = document.getElementById('nav-approach');
  const pullCordWrap = document.getElementById('pull-cord-wrap');

  const handleRoute = () => {
    globalHandleRoute = handleRoute;
    // Run cleanup for any previously mounted interactive subpage (e.g. contact animation loop or 404 game)
    if (currentCleanup) {
      currentCleanup();
      currentCleanup = null;
    }

    const path = window.location.pathname.replace(/\/+$/, '') || '/';
    const params = new URLSearchParams(window.location.search);

    // Apply query params to 3D scene if present (e.g. from case study "Open in 3D Studio" link)
    if (params.has('pal') && currentGl) {
      const palIdx = Number(params.get('pal'));
      if (!Number.isNaN(palIdx)) currentGl.setPalette(palIdx);
    }
    if (params.has('hour') && currentGl) {
      const hour = Number(params.get('hour'));
      if (!Number.isNaN(hour)) currentGl.setSolarHour(hour, true);
    }

    const landingFlow = document.getElementById('landing-flow');
    const projectsSection = document.getElementById('projects-section');
    const contactSection = document.getElementById('contact-section');

    // Ensure Sections in Landing Flow are rendered once
    if (projectsSection && !projectsSection.hasChildNodes()) {
      renderProjectsPage(projectsSection);
    }
    if (contactSection && !contactSection.hasChildNodes()) {
      renderContactPage(contactSection);
    }

    if (path === '/' || path === '' || path === '/studio' || path === '/approach' || path === '/projects' || path === '/project' || path === '/contact') {
      // Unified Connected Landing Page
      if (subpageRoot) {
        subpageRoot.style.display = 'none';
        subpageRoot.innerHTML = '';
      }
      if (landingFlow) {
        landingFlow.style.display = '';
      }
      homeElements.forEach((el) => {
        if (el) (el as HTMLElement).style.display = '';
      });
      document.body.style.overflow = 'auto';
      pullCordWrap?.classList.remove('is-hidden');

      if (path === '/approach') {
        const approachSection = document.getElementById('approach-section');
        approachSection?.scrollIntoView({ behavior: 'smooth' });
        navApproachLink?.classList.add('active');
        navProjectsLink?.classList.remove('active');
        navContactLink?.classList.remove('active');
        navStudioLink?.classList.remove('active');
        setMeta('Our Approach — Buildora · Build with Yash', 'From orthographic drawings to physical living spaces: Draw. Design. Experience. Technical precision meets spatial emotion.');
      } else if (path === '/projects' || path === '/project') {
        projectsSection?.scrollIntoView({ behavior: 'smooth' });
        navProjectsLink?.classList.add('active');
        navApproachLink?.classList.remove('active');
        navContactLink?.classList.remove('active');
        navStudioLink?.classList.remove('active');
        setMeta('Selected Works & Case Studies — Buildora · Build with Yash', 'Architectural commissions portfolio: The Nordic Pavilion, The Smoked Atelier, and The Monolithic Cloister.');
      } else if (path === '/contact') {
        contactSection?.scrollIntoView({ behavior: 'smooth' });
        navProjectsLink?.classList.remove('active');
        navApproachLink?.classList.remove('active');
        navContactLink?.classList.add('active');
        navStudioLink?.classList.remove('active');
        setMeta('Contact & Spatial Enquiries — Buildora · Build with Yash', 'Enquire regarding architectural commissions, residential renovations, and interactive living spaces with Build with Yash.');
      } else {
        const isStudioRoute = path === '/studio';
        window.scrollTo({ top: 0, behavior: 'smooth' });
        navProjectsLink?.classList.remove('active');
        navApproachLink?.classList.remove('active');
        navContactLink?.classList.remove('active');
        navStudioLink?.classList.toggle('active', isStudioRoute);

        if (isStudioRoute) {
          setMeta('Studio — Buildora · Build with Yash', 'Interactive architectural studio: solar daylight simulation, material palettes, and 3D space choreography.');
          const studioEl = document.getElementById('studio');
          if (studioEl) {
            studioEl.classList.add('open');
            studioEl.setAttribute('aria-hidden', 'false');
            st.studioOpen = true;
          }
        } else {
          setMeta('Buildora — Build with Yash', 'An interactive architectural experience by Build with Yash. Transforming orthographic architectural drawings into physical living spaces.');
        }
      }
      initTypographyEngine();
    } else if (path.startsWith('/projects/') || path.startsWith('/project/')) {
      // Dedicated Project Case Study overlay
      pullCordWrap?.classList.add('is-hidden');
      if (landingFlow) landingFlow.style.display = 'none';
      const parts = path.split('/');
      const slug = parts[2] || '';
      const project = PROJECTS.find((p) => p.slug === slug);

      if (subpageRoot) {
        subpageRoot.style.display = 'block';
        subpageRoot.scrollTop = 0;
        currentCleanup = renderProjectDetail(subpageRoot, slug);
      }
      homeElements.forEach((el) => {
        if (el) (el as HTMLElement).style.display = 'none';
      });
      document.body.style.overflow = 'auto';
      if (project) {
        setMeta(`${project.title} — Buildora · Build with Yash`, `${project.concept} Located in ${project.location}. Interactive architectural case study by Build with Yash.`);
      } else {
        setMeta('Case Study — Buildora · Build with Yash', 'Architectural case study detailing construction and design craft by Build with Yash.');
      }
      navProjectsLink?.classList.add('active');
      navContactLink?.classList.remove('active');
      navStudioLink?.classList.remove('active');
    } else if (path === '/status') {
      pullCordWrap?.classList.add('is-hidden');
      if (landingFlow) landingFlow.style.display = 'none';
      if (subpageRoot) {
        subpageRoot.style.display = 'block';
        subpageRoot.scrollTop = 0;
        renderStatusPage(subpageRoot);
      }
      homeElements.forEach((el) => {
        if (el) (el as HTMLElement).style.display = 'none';
      });
      document.body.style.overflow = 'auto';
      setMeta('System Status — Buildora · Build with Yash', 'Diagnostics and live status for Buildora architectural runtime, WebGL renderers, and spatial assets.');
      navProjectsLink?.classList.remove('active');
      navContactLink?.classList.remove('active');
      navStudioLink?.classList.remove('active');
    } else {
      // 404 Not Found route with interactive hammer game
      pullCordWrap?.classList.add('is-hidden');
      if (landingFlow) landingFlow.style.display = 'none';
      if (subpageRoot) {
        subpageRoot.style.display = 'block';
        subpageRoot.scrollTop = 0;
        currentCleanup = renderNotFoundPage(subpageRoot);
      }
      homeElements.forEach((el) => {
        if (el) (el as HTMLElement).style.display = 'none';
      });
      document.body.style.overflow = 'auto';
      setMeta('404 Page Not Found — Buildora · Build with Yash', 'The requested architectural drawing or spatial coordinate does not exist.');
      navProjectsLink?.classList.remove('active');
      navContactLink?.classList.remove('active');
      navStudioLink?.classList.remove('active');
    }
  };

  // Intercept local link clicks
  document.addEventListener('click', (e) => {
    const target = e.target as HTMLElement | null;

    // Handle Back to Top button
    if (target?.closest('#btn-back-to-top')) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    const anchor = target?.closest('a');
    if (!anchor) return;

    // Handle scroll-anchor links
    const scrollTarget = anchor.getAttribute('data-scroll');
    if (scrollTarget === 'studio') {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (scrollTarget === 'approach') {
      e.preventDefault();
      document.getElementById('approach-section')?.scrollIntoView({ behavior: 'smooth' });
      return;
    }
    if (scrollTarget === 'projects') {
      e.preventDefault();
      document.getElementById('projects-section')?.scrollIntoView({ behavior: 'smooth' });
      return;
    }
    if (scrollTarget === 'contact') {
      e.preventDefault();
      document.getElementById('contact-section')?.scrollIntoView({ behavior: 'smooth' });
      return;
    }

    const href = anchor.getAttribute('href');
    if (!href) return;

    if (href === '#approach-section') {
      e.preventDefault();
      document.getElementById('approach-section')?.scrollIntoView({ behavior: 'smooth' });
      return;
    }

    if (href === '#projects-section') {
      e.preventDefault();
      document.getElementById('projects-section')?.scrollIntoView({ behavior: 'smooth' });
      return;
    }

    // Check if link is an internal app route
    if (href.startsWith('/') || anchor.hasAttribute('data-link') || anchor.id === 'nav-projects' || anchor.id === 'nav-studio' || anchor.id === 'nav-contact') {
      e.preventDefault();
      const currentFull = window.location.pathname + window.location.search;
      if (href !== currentFull) {
        window.history.pushState(null, '', href);
        handleRoute();
      } else if (href === '/studio' || href === '/') {
        // Toggle studio drawer if already on home/studio
        const studioEl = document.getElementById('studio');
        if (studioEl) {
          st.studioOpen = !st.studioOpen;
          studioEl.classList.toggle('open', st.studioOpen);
          studioEl.setAttribute('aria-hidden', String(!st.studioOpen));
        }
      }
    }
  });

  // Setup scroll-spy to update nav active state during natural scroll
  const updateNavScrollSpy = () => {
    // Only spy on landing page routes
    const path = window.location.pathname.replace(/\/+$/, '') || '/';
    if (path.startsWith('/projects/') || path === '/404' || path === '/status') return;

    const scrollY = window.scrollY || window.pageYOffset;
    const studioSec = document.getElementById('studio-section');
    const approachSec = document.getElementById('approach-section');
    const projectsSec = document.getElementById('projects-section');
    const contactSec = document.getElementById('contact-section');

    const contactTop = contactSec ? contactSec.offsetTop : Infinity;
    const projectsTop = projectsSec ? projectsSec.offsetTop : Infinity;
    const approachTop = approachSec ? approachSec.offsetTop : Infinity;

    if (scrollY >= contactTop - 350) {
      navContactLink?.classList.add('active');
      navProjectsLink?.classList.remove('active');
      navApproachLink?.classList.remove('active');
      navStudioLink?.classList.remove('active');
    } else if (scrollY >= projectsTop - 350) {
      navProjectsLink?.classList.add('active');
      navContactLink?.classList.remove('active');
      navApproachLink?.classList.remove('active');
      navStudioLink?.classList.remove('active');
    } else if (scrollY >= approachTop - 350) {
      navApproachLink?.classList.add('active');
      navProjectsLink?.classList.remove('active');
      navContactLink?.classList.remove('active');
      navStudioLink?.classList.remove('active');
    } else {
      navStudioLink?.classList.add('active');
      navApproachLink?.classList.remove('active');
      navProjectsLink?.classList.remove('active');
      navContactLink?.classList.remove('active');
    }
  };

  window.addEventListener('scroll', updateNavScrollSpy, { passive: true });

  // Handle browser back and forward
  window.addEventListener('popstate', () => {
    handleRoute();
  });

  // Run on initial load
  handleRoute();
}
