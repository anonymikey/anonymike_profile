'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import { motion } from 'motion/react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ArrowDownRight, ArrowUp, ArrowUpRight, Check, Download, ExternalLink, Globe2, Menu, Phone, X } from 'lucide-react'

const socialLinks = [
  { label: 'Instagram', href: 'https://www.instagram.com/mike_the_anon?stkn=MTI1dDhsNGExcDI3YQ==', icon: 'instagram' },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/michaelmshila?utm_source=share_via&utm_content=profile&utm_medium=member_android', icon: 'linkedin' },
  { label: 'X', href: 'https://x.com/mike_the_anon', icon: 'x' },
  { label: 'GitHub', href: 'https://github.com/anonymike', icon: 'github' },
  { label: 'Website', href: 'https://www.anonymiketech.space', icon: 'website' },
]

function SocialIcon({ name }: { name: string }) {
  if (name === 'website') return <Globe2 aria-hidden="true" />
  if (name === 'phone') return <Phone aria-hidden="true" />
  const paths: Record<string, React.ReactNode> = {
    instagram: <><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" /></>,
    linkedin: <><path d="M6 9v9" /><path d="M6 6.2v.1" strokeWidth="3" /><path d="M11 18v-5a4 4 0 0 1 8 0v5" /><path d="M11 9v9" /></>,
    x: <><path d="m5 4 14 16" /><path d="M19 4 5 20" /></>,
    github: <><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3.3-.4 6.7-1.6 6.7-7A5.5 5.5 0 0 0 19.2 4 5.1 5.1 0 0 0 19 0s-1.2-.4-4 1.5a13.4 13.4 0 0 0-6 0C6.2-.4 5 0 5 0a5.1 5.1 0 0 0-.2 4A5.5 5.5 0 0 0 3.3 7.5c0 5.4 3.4 6.6 6.7 7A4.8 4.8 0 0 0 9 18v4" /></>,
  }
  return <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">{paths[name]}</svg>
}

const buildKeyframes = (from: Record<string, unknown>, steps: Record<string, unknown>[]) => {
  const keys = new Set([...Object.keys(from), ...steps.flatMap((step) => Object.keys(step))])
  return Object.fromEntries([...keys].map((key) => [key, [from[key], ...steps.map((step) => step[key])]]))
}

gsap.registerPlugin(ScrollTrigger)

const foldHinges = { top: { origin: '50% 0%', rotateX: -92, rotateY: 0 }, bottom: { origin: '50% 100%', rotateX: 92, rotateY: 0 }, left: { origin: '0% 50%', rotateX: 0, rotateY: 92 }, right: { origin: '100% 50%', rotateX: 0, rotateY: -92 } }

function FoldText({ text, splitBy = 'char', duration = 0.65, stagger = 0.045, perspective = 700, creaseShading = 0.55, trigger = 'scroll', hinge = 'top', className = '' }: { text: string; splitBy?: 'char' | 'word' | 'line'; duration?: number; stagger?: number; perspective?: number; creaseShading?: number; trigger?: 'mount' | 'scroll'; hinge?: keyof typeof foldHinges; className?: string }) {
  const rootRef = useRef<HTMLSpanElement>(null)
  const segments = useMemo(() => splitBy === 'word' ? text.split(/(\\s+)/).map((part, index) => <span className={/^\\s+$/.test(part) ? 'fold-text-whitespace' : 'fold-text-segment'} key={`${part}-${index}`}>{/^\\s+$/.test(part) ? part.replace(/ /g, '\\u00a0') : <span className="fold-text-piece">{part}</span>}</span>) : Array.from(text).map((char, index) => char === ' ' ? <span className="fold-text-whitespace" key={`space-${index}`}>&nbsp;</span> : <span className="fold-text-segment" data-fold-split="char" key={`${char}-${index}`}><span className="fold-text-piece" data-fold-hinge={hinge} style={{ transformOrigin: foldHinges[hinge].origin }}>{char}</span></span>), [text, splitBy])
  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    const pieces = Array.from(root.querySelectorAll<HTMLElement>('.fold-text-piece'))
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const hingeConfig = foldHinges[hinge]
    const from = { opacity: 0, rotateX: reduceMotion ? 0 : hingeConfig.rotateX, rotateY: reduceMotion ? 0 : hingeConfig.rotateY, '--fold-crease': reduceMotion ? 0 : creaseShading, transformOrigin: hingeConfig.origin }
    const play = () => gsap.fromTo(pieces, from, { opacity: 1, rotateX: 0, rotateY: 0, '--fold-crease': 0, duration: reduceMotion ? Math.min(duration, .22) : duration, ease: reduceMotion ? 'power1.out' : 'power3.out', stagger: reduceMotion ? Math.min(stagger, .02) : stagger, clearProps: 'willChange' })
    let triggerInstance: ScrollTrigger | undefined
    if (trigger === 'scroll') { gsap.set(pieces, from); triggerInstance = ScrollTrigger.create({ trigger: root, start: 'top 82%', once: true, onEnter: play }) } else play()
    return () => { triggerInstance?.kill(); gsap.killTweensOf(pieces) }
  }, [text, splitBy, duration, stagger, perspective, creaseShading, trigger, hinge])
  return <span ref={rootRef} className={`fold-text ${className}`} style={{ '--fold-text-font-size': 'clamp(3rem, 7vw, 7rem)', '--fold-text-font-weight': 800, '--fold-text-color': '#f7f2e8', '--fold-perspective': `${perspective}px` } as React.CSSProperties}><span className="fold-text-sr-only">{text}</span><span className="fold-text-visual" aria-hidden="true">{segments}</span></span>
}

function PixelTransition({ firstContent, secondContent, gridSize = 10, pixelColor = '#b8ff00', animationStepDuration = 0.45, once = false, className = '' }: { firstContent: React.ReactNode; secondContent: React.ReactNode; gridSize?: number; pixelColor?: string; animationStepDuration?: number; once?: boolean; className?: string }) {
  const pixelGridRef = useRef<HTMLDivElement>(null)
  const activeRef = useRef<HTMLDivElement>(null)
  const [isActive, setIsActive] = useState(false)
  const isTouchDevice = typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0 || window.matchMedia('(pointer: coarse)').matches)
  useEffect(() => {
    const grid = pixelGridRef.current
    if (!grid) return
    grid.innerHTML = ''
    const size = 100 / gridSize
    for (let row = 0; row < gridSize; row += 1) for (let col = 0; col < gridSize; col += 1) {
      const pixel = document.createElement('div')
      pixel.className = 'pixelated-image-card__pixel'
      Object.assign(pixel.style, { backgroundColor: pixelColor, width: `${size}%`, height: `${size}%`, left: `${col * size}%`, top: `${row * size}%` })
      grid.appendChild(pixel)
    }
  }, [gridSize, pixelColor])
  const animatePixels = (activate: boolean) => {
    setIsActive(activate)
    const grid = pixelGridRef.current
    const active = activeRef.current
    if (!grid || !active) return
    const pixels = grid.querySelectorAll('.pixelated-image-card__pixel')
    gsap.killTweensOf(pixels)
    gsap.set(pixels, { display: 'none' })
    const staggerDuration = animationStepDuration / pixels.length
    gsap.to(pixels, { display: 'block', duration: 0, stagger: { each: staggerDuration, from: 'random' } })
    gsap.delayedCall(animationStepDuration, () => { active.style.display = activate ? 'block' : 'none'; active.style.pointerEvents = activate ? 'none' : '' })
    gsap.to(pixels, { display: 'none', duration: 0, delay: animationStepDuration, stagger: { each: staggerDuration, from: 'random' } })
  }
  return <div className={`pixelated-image-card ${className}`} tabIndex={0} onMouseEnter={!isTouchDevice ? () => !isActive && animatePixels(true) : undefined} onMouseLeave={!isTouchDevice ? () => isActive && !once && animatePixels(false) : undefined} onClick={isTouchDevice ? () => isActive && !once ? animatePixels(false) : animatePixels(true) : undefined} onFocus={!isTouchDevice ? () => !isActive && animatePixels(true) : undefined} onBlur={!isTouchDevice ? () => isActive && !once && animatePixels(false) : undefined}><div className="pixelated-image-card__default" aria-hidden={isActive}>{firstContent}</div><div className="pixelated-image-card__active" ref={activeRef} aria-hidden={!isActive}>{secondContent}</div><div className="pixelated-image-card__pixels" ref={pixelGridRef} /></div>
}

function BlurText({ text, delay = 120 }: { text: string; delay?: number }) {
  const ref = useRef<HTMLParagraphElement>(null)
  const [inView, setInView] = useState(false)
  const elements = useMemo(() => text.split(' '), [text])
  useEffect(() => {
    if (!ref.current) return
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setInView(true); observer.unobserve(entry.target) }
    }, { threshold: 0.1, rootMargin: '0px' })
    observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])
  const from = { filter: 'blur(10px)', opacity: 0, y: -50 }
  const to = [{ filter: 'blur(5px)', opacity: 0.5, y: 5 }, { filter: 'blur(0px)', opacity: 1, y: 0 }]
  const keyframes = buildKeyframes(from, to)
  return <p ref={ref} className="hero-word" aria-label={text}>{elements.map((word, index) => <motion.span className="blur-word" key={`${word}-${index}`} initial={from} animate={inView ? keyframes : from} transition={{ duration: 0.7, times: [0, .5, 1], delay: (index * delay) / 1000, ease: 'easeOut' }}>{word}{index < elements.length - 1 ? '\u00A0' : ''}</motion.span>)}</p>
}

const imageUrls = {
  hero: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image%20%284%29-Photoroom-ZhRHJ949JTSaZJN2rXUZRe3ZOEeLFo.png',
  ecoStructLogo: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/ECOSTRUCT-LOGO-jl2nRFmqs4lBh0pIhfcB1VlPMg8mT6.jpg',
  economicJusticeLogo: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/EJF-logo-OCq4CVuOVpYuqjc91GchCvZTta8IZS.png',
  portrait: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-VwAgaB0fIFzlxCi5890OUnjrZcRVZp.jpg',
}

const projects = [
  {
    id: 'economic-justice-forum', number: '01', title: 'Economic Justice Forum', category: 'Civic platform',
    description: 'A clear, accessible website for the Economic Justice Forum and its work toward a fairer economy.',
    url: 'https://www.economicjusticeforum.org', image: imageUrls.economicJusticeLogo, accent: 'orange', logo: true,
    services: ['Web development', 'Responsive design', 'Content structure'],
  },
  {
    id: 'ecostruct-dynamics', number: '02', title: 'EcoStruct Dynamics Ltd', category: 'Built environment',
    description: 'A professional digital presence for EcoStruct Dynamics Ltd, connecting its work with the people it serves.',
    url: 'https://www.ecostructdynamicsltd.com', image: imageUrls.ecoStructLogo, accent: 'lime', logo: true,
    services: ['Web development', 'Brand expression', 'User experience'],
  },
]

export function Portfolio() {
  const [activeProject, setActiveProject] = useState<(typeof projects)[number] | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [cvOpen, setCvOpen] = useState(false)
  const closeMenu = () => setMenuOpen(false)
  const openCv = () => { closeMenu(); setCvOpen(true) }

  return (
    <main className="portfolio-shell" id="top">
      <header className="portfolio-header">
        <a className="brand-lockup" href="#top" onClick={closeMenu} aria-label="ANONYMIKETECH home"><span>ANONYMIKE</span><b>TECH</b></a>
        <nav className={menuOpen ? 'portfolio-nav is-open' : 'portfolio-nav'} aria-label="Primary navigation">
          <a href="#about" onClick={closeMenu}>About</a><a href="#services" onClick={closeMenu}>Services</a><a href="#work" onClick={closeMenu}>Work</a><a href="#contact" onClick={closeMenu}>Contact</a><button className="mobile-cv-link" type="button" onClick={openCv}>View CV</button>
        </nav>
        <div className="header-actions">{socialLinks.slice(0, 3).map((link) => <a className="social-button" href={link.href} target="_blank" rel="noreferrer" aria-label={`Visit ANONYMIKETECH on ${link.label}`} key={link.label}><SocialIcon name={link.icon} /></a>)}<a className="social-button" href="tel:+254113313240" aria-label="Call ANONYMIKETECH"><SocialIcon name="phone" /></a><button className="cv-button" type="button" onClick={openCv}>DOWNLOAD CV</button><button className="menu-toggle" type="button" onClick={() => setMenuOpen(!menuOpen)} aria-expanded={menuOpen} aria-controls="portfolio-nav"><span className="sr-only">{menuOpen ? 'Close menu' : 'Open menu'}</span>{menuOpen ? <X /> : <Menu />}</button></div>
      </header>

      <section className="strategy-hero">
        <BlurText text="DEVELOPER" />
        <div className="hero-panel hero-intro-card"><p className="card-kicker">HELLO! I&apos;M MIKE.<br />AN INDEPENDENT<br />WEB DEVELOPER.</p><div className="service-links"><span>+ Web development</span><span>+ Responsive interfaces</span><span>+ Digital strategy</span><span>+ Frontend systems</span></div></div>
        <div className="hero-photo"><img src={imageUrls.hero} alt="ANONYMIKETECH founder in a dark suit" /></div>
        <div className="hero-panel hero-note-card"><strong>Websites that<br /><em>work hard.</em></strong><span>Thoughtful design, clean code and useful digital experiences.</span></div>
      </section>

      <section className="client-rail" aria-label="Selected client projects"><div className="client-rail-heading"><p className="section-label">Selected client work</p><span>Real organisations. Real websites.</span></div><div className="client-logo-grid"><a className="client-logo-card" href="https://www.economicjusticeforum.org" target="_blank" rel="noreferrer"><img src={imageUrls.economicJusticeLogo} alt="Economic Justice Forum logo" /></a><a className="client-logo-card" href="https://www.ecostructdynamicsltd.com" target="_blank" rel="noreferrer"><img src={imageUrls.ecoStructLogo} alt="EcoStruct Dynamics Ltd logo" /></a></div></section>

      <section className="outline-statement" id="about"><p className="section-label">01 / About the work</p><h1>DESIGN, STRATEGY AND WEB DEVELOPMENT MADE <span>BETTER.</span></h1><a className="round-link" href="#work">VIEW PROJECTS <ArrowDownRight /></a></section>

      <section className="about-strategy"><PixelTransition className="about-pixel-transition" firstContent={<img src={imageUrls.portrait} alt="ANONYMIKETECH founder working with a laptop" />} secondContent={<div className="pixel-reveal-content"><span className="section-label">ANONYMIKETECH</span><strong>Ideas into<br />useful things.</strong><span>Hover to explore the person behind the work.</span></div>} gridSize={10} pixelColor="#b8ff00" animationStepDuration={0.45} /><div><p className="section-label">02 / The approach</p><p className="about-copy">I build modern, user-centered digital experiences for people and organisations doing meaningful work. I bring together clear visual thinking and dependable frontend development to turn complex ideas into simple, useful websites.</p><p className="about-copy">Every project is shaped around its real audience, goals and identity — not a template. The result is a website that feels considered, performs well and gives people a clear next step.</p></div><div className="experience-badge"><strong>WEB<br />CRAFT</strong><span>from idea<br />to launch</span></div></section>

      <section className="services-section" id="services"><div className="marquee">— SERVICES — SERVICES — SERVICES —</div><p className="section-label">03 / What I do</p><div className="service-list-large"><div><span>01</span><h2>WEB DEVELOPMENT</h2><p>Responsive, accessible websites built with clean structure and purposeful interaction.</p></div><div><span>02</span><h2>DIGITAL DIRECTION</h2><p>Clear content and interface decisions that help the right people understand your work.</p></div><div><span>03</span><h2>FRONTEND SYSTEMS</h2><p>Flexible components and maintainable foundations that are easy to evolve later.</p></div></div></section>

      <section className="work-strategy" id="work"><div className="work-heading"><p className="section-label">04 / Selected work</p><p>REAL PROJECTS. LIVE ON THE WEB.</p></div><div className="project-stack">{projects.map((project) => <article className={`strategy-project ${project.accent}`} key={project.id}><div className="project-copy"><span className="project-number">{project.number} <ArrowDownRight /></span><h2>{project.title}</h2><div className="project-tags">{project.services.map((service) => <span key={service}>{service}</span>)}</div><p>{project.description}</p><button type="button" onClick={() => setActiveProject(project)}>View project <ArrowUpRight /></button></div><button className="project-visual" type="button" onClick={() => setActiveProject(project)} aria-label={`View details for ${project.title}`}><img className={project.logo ? 'project-logo' : undefined} src={project.image} alt={`${project.title} logo`} /><span>↗</span></button></article>)}</div></section>

      <section className="contact-strategy" id="contact"><div><p className="section-label">05 / Start a project</p><h2 className="fold-contact-heading"><FoldText text="LET'S BUILD" splitBy="char" trigger="scroll" hinge="top" /><br /><em><FoldText text="SOMETHING USEFUL." splitBy="char" trigger="scroll" hinge="top" /></em></h2><a className="contact-email" href="mailto:hello@anonymiketech.com">hello@anonymiketech.com <ArrowUpRight /></a><a className="contact-phone" href="tel:+254113313240"><Phone /> +254 113 313 240</a><div className="contact-socials" aria-label="Social profiles">{socialLinks.map((link) => <a className="contact-social-link" href={link.href} target="_blank" rel="noreferrer" key={link.label}><SocialIcon name={link.icon} /> <span>{link.label}</span><ArrowUpRight /></a>)}</div></div><div className="contact-card"><p>Have a project, a new idea or a website that needs a better foundation?</p><a href="mailto:hello@anonymiketech.com?subject=Project%20enquiry">Send an enquiry <ArrowUpRight /></a></div></section>
      <footer className="strategy-footer"><span>© {new Date().getFullYear()} ANONYMIKETECH</span><a href="#top"><ArrowUp /> Back to top</a></footer>

      {cvOpen && <div className="modal-backdrop cv-backdrop" role="presentation" onClick={() => setCvOpen(false)}><section className="cv-modal" role="dialog" aria-modal="true" aria-labelledby="cv-modal-title" onClick={(event) => event.stopPropagation()}><div className="cv-modal-header"><div><p className="section-label">Ready for work</p><h2 id="cv-modal-title">Michael Kifumbu Mshila — CV</h2></div><div className="cv-modal-actions"><a className="cv-download" href="/Michael-Kifumbu-Mshila-CV.pdf" download><Download /> Download</a><button className="modal-close" type="button" onClick={() => setCvOpen(false)} aria-label="Close CV viewer"><X /></button></div></div><iframe title="Michael Kifumbu Mshila CV" src="/Michael-Kifumbu-Mshila-CV.pdf#view=FitH" /></section></div>}{activeProject && <div className="modal-backdrop" role="presentation" onClick={() => setActiveProject(null)}><section className="project-modal" role="dialog" aria-modal="true" aria-labelledby="project-modal-title" onClick={(event) => event.stopPropagation()}><button className="modal-close" type="button" onClick={() => setActiveProject(null)} aria-label="Close project details"><X /></button><img src={activeProject.image} alt="" /><div className="modal-content"><p className="section-label">{activeProject.number} / {activeProject.category}</p><h2 id="project-modal-title">{activeProject.title}</h2><p>{activeProject.description}</p><div className="service-list">{activeProject.services.map((service) => <span key={service}><Check />{service}</span>)}</div><a className="modal-link" href={activeProject.url} target="_blank" rel="noreferrer">Visit live project <ExternalLink /></a></div></section></div>}
    </main>
  )
}

export { imageUrls }
