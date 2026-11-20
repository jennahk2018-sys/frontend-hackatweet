import { useEffect, useRef } from "react";
import styles from "../styles/ParticleLogo.module.css";

// =====================================
// RÉGLAGES DE L'ANIMATION

const LOGO_STEP = 2; // espacement entre les points du logo (plus petit = plus dense)
const MAX_PARTICLES = 6000; // limite de sécurité pour garder une animation fluide
const SAMPLE_SIZE = 260; // résolution utilisée pour lire le logo
const SPRING = 0.08; // force qui ramène chaque point vers sa cible
const FRICTION = 0.82; // frottement (plus petit = plus amorti)
const REPEL_STRENGTH = 5; // force du magnétisme de la souris
const ROTATION_SPEED = 0.004; // vitesse de rotation de la sphère
const MORPH_SPEED = 0.05; // vitesse de transformation sphère <-> logo
const LOGO_SCALE = 0.8; // taille du logo par rapport à la zone

// =====================================
// OUTILS

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const lerp = (a, b, t) => a + (b - a) * t;
const smoothstep = (t) => t * t * (3 - 2 * t);

// Petit point lumineux pré-dessiné une seule fois (beaucoup plus rapide
// que de dessiner un dégradé pour chaque particule à chaque image).
// Cœur blanc satiné + halo sombre très doux pour ressortir sur le fond coloré.
function createDotSprite() {
  const size = 32;
  const sprite = document.createElement("canvas");
  sprite.width = size;
  sprite.height = size;

  const ctx = sprite.getContext("2d");
  const gradient = ctx.createRadialGradient(
    size / 2,
    size / 2,
    0,
    size / 2,
    size / 2,
    size / 2,
  );
  gradient.addColorStop(0, "rgba(255, 255, 255, 1)");
  gradient.addColorStop(0.3, "rgba(248, 246, 240, 0.95)");
  gradient.addColorStop(0.45, "rgba(220, 218, 212, 0.55)");
  gradient.addColorStop(0.6, "rgba(10, 12, 24, 0.35)");
  gradient.addColorStop(1, "rgba(10, 12, 24, 0)");

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);

  return sprite;
}

// Lit les pixels du logo et renvoie les points opaques,
// en coordonnées normalisées (de -0.5 à 0.5)
function sampleLogo(image) {
  const canvas = document.createElement("canvas");
  canvas.width = SAMPLE_SIZE;
  canvas.height = SAMPLE_SIZE;
  const ctx = canvas.getContext("2d");

  // Le logo est retourné à 180° sur le site, on fait pareil ici
  ctx.translate(SAMPLE_SIZE / 2, SAMPLE_SIZE / 2);
  ctx.rotate(Math.PI);
  ctx.drawImage(
    image,
    -SAMPLE_SIZE / 2,
    -SAMPLE_SIZE / 2,
    SAMPLE_SIZE,
    SAMPLE_SIZE,
  );

  const { data } = ctx.getImageData(0, 0, SAMPLE_SIZE, SAMPLE_SIZE);
  const points = [];
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  for (let y = 0; y < SAMPLE_SIZE; y++) {
    for (let x = 0; x < SAMPLE_SIZE; x++) {
      const alpha = data[(y * SAMPLE_SIZE + x) * 4 + 3];
      if (alpha > 128) {
        points.push({ x, y });
        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x);
        maxY = Math.max(maxY, y);
      }
    }
  }

  // On recadre sur le logo (le PNG a des marges vides autour)
  const width = maxX - minX;
  const height = maxY - minY;
  const scale = Math.max(width, height);

  // Est-ce que le pixel (x, y) fait partie du logo ?
  const isOpaque = (x, y) =>
    x >= 0 &&
    y >= 0 &&
    x < SAMPLE_SIZE &&
    y < SAMPLE_SIZE &&
    data[(y * SAMPLE_SIZE + x) * 4 + 3] > 128;

  // Un pixel est sur le CONTOUR s'il touche un pixel transparent
  const isEdge = (x, y) =>
    !isOpaque(x - 1, y) ||
    !isOpaque(x + 1, y) ||
    !isOpaque(x, y - 1) ||
    !isOpaque(x, y + 1);

  // Espacement entre les points du logo
  const step = LOGO_STEP;

  // 1. Le contour, avec des points plus serrés : c'est lui qui rend le logo reconnaissable
  const edgeStep = Math.max(1, Math.round(step * 0.6));
  const edgePoints = points
    .filter(
      (p) => isEdge(p.x, p.y) && (p.x % edgeStep === 0 || p.y % edgeStep === 0),
    )
    .map((p) => ({ ...p, edge: true }));

  // 2. L'intérieur, sur une grille régulière (en évitant les pixels du contour)
  const innerPoints = points
    .filter((p) => p.x % step === 0 && p.y % step === 0 && !isEdge(p.x, p.y))
    .map((p) => ({ ...p, edge: false }));

  const allPoints = [...edgePoints, ...innerPoints];

  // On mélange pour que chaque point de la sphère parte vers un endroit
  // aléatoire du logo (transformation plus jolie)
  for (let i = allPoints.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [allPoints[i], allPoints[j]] = [allPoints[j], allPoints[i]];
  }

  // On coupe APRÈS le mélange : si on dépasse la limite, les points retirés
  // sont pris au hasard partout (et pas tous en bas du logo)
  const selected = allPoints.slice(0, MAX_PARTICLES);

  // Petit décalage aléatoire à l'intérieur pour casser l'effet "grille"
  const jitter = (amount) => (Math.random() - 0.5) * amount;

  return selected.map((p) => ({
    x: (p.x + (p.edge ? 0 : jitter(step * 0.6)) - minX - width / 2) / scale,
    y: (p.y + (p.edge ? 0 : jitter(step * 0.6)) - minY - height / 2) / scale,
    edge: p.edge,
  }));
}

// Répartit N points de façon régulière sur une sphère (spirale de Fibonacci)
function spherePoint(index, total) {
  const y = 1 - (index / (total - 1)) * 2;
  const radius = Math.sqrt(1 - y * y);
  const theta = index * Math.PI * (3 - Math.sqrt(5));

  return { x: Math.cos(theta) * radius, y, z: Math.sin(theta) * radius };
}

// =====================================
// COMPOSANT

function ParticleLogo({ src, alt = "Logo" }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const sprite = createDotSprite();
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    let particles = [];
    let logoPoints = [];
    let width = 0;
    let height = 0;
    let dpr = 1;
    let animationId = null;
    // Passe à true quand le composant est démonté. En développement, React
    // (StrictMode) lance l'effet deux fois : sans ce drapeau, le premier
    // chargement d'image démarrait une 2e boucle "fantôme" qui ignorait la souris
    // et redessinait la sphère par-dessus le logo.
    let cancelled = false;

    const mouse = { x: -9999, y: -9999, inside: false };
    let touchLocked = false; // sur mobile : un tap bascule sphère <-> logo
    let morph = reducedMotion ? 1 : 0; // 0 = sphère, 1 = logo
    let angle = 0;

    // (Re)calcule les positions quand la taille change
    const layout = () => {
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      dpr = window.devicePixelRatio || 1;

      // Canvas en haute résolution pour les écrans Retina
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const centerX = width / 2;
      const centerY = height / 2;
      const logoSize = Math.min(width, height) * LOGO_SCALE;
      const isFirstLayout = particles.length === 0;

      particles = logoPoints.map((point, i) => {
        const old = particles[i];

        return {
          logoX: centerX + point.x * logoSize,
          logoY: centerY + point.y * logoSize,
          sphere: spherePoint(i, logoPoints.length),
          // Au premier affichage, les points partent de partout (effet d'entrée)
          x: old
            ? old.x
            : isFirstLayout && !reducedMotion
              ? Math.random() * width
              : centerX,
          y: old
            ? old.y
            : isFirstLayout && !reducedMotion
              ? Math.random() * height
              : centerY,
          vx: 0,
          vy: 0,
          edge: point.edge, // true si le point est sur le contour du logo
          size: 0.5 + Math.random() * 0.8,
          delay: Math.random(), // décalage pour une transformation plus organique
        };
      });
    };

    // Une image de l'animation
    const draw = (time) => {
      ctx.clearRect(0, 0, width, height);

      const centerX = width / 2;
      const centerY = height / 2;
      const radius = Math.min(width, height) * 0.32;
      const logoSize = Math.min(width, height) * LOGO_SCALE;
      // Quand le logo est formé, la souris pousse moins fort et moins loin,
      // sinon elle creuse un trou au milieu et on ne reconnaît plus le logo
      const repelRadius = Math.min(width, height) * lerp(0.12, 0.07, morph);
      const repelStrength = REPEL_STRENGTH * lerp(1, 0.5, morph);

      // La souris proche du centre (ou un tap sur mobile) fait apparaître le logo
      const distanceToCenter = Math.hypot(mouse.x - centerX, mouse.y - centerY);
      const wantsLogo =
        touchLocked || (mouse.inside && distanceToCenter < radius * 1.6);
      if (!reducedMotion) {
        morph += ((wantsLogo ? 1 : 0) - morph) * MORPH_SPEED;
      }

      angle += ROTATION_SPEED;
      const cosA = Math.cos(angle);
      const sinA = Math.sin(angle);
      const tilt = 0.35; // la sphère est légèrement penchée vers nous
      const cosT = Math.cos(tilt);
      const sinT = Math.sin(tilt);

      for (const p of particles) {
        // --- Position sur la sphère qui tourne (rotation Y puis inclinaison X)
        const x1 = p.sphere.x * cosA - p.sphere.z * sinA;
        const z1 = p.sphere.x * sinA + p.sphere.z * cosA;
        const y2 = p.sphere.y * cosT - z1 * sinT;
        const z2 = p.sphere.y * sinT + z1 * cosT;

        const perspective = 1 / (1 - z2 * 0.35);
        const sphereX = centerX + x1 * radius * perspective;
        const sphereY = centerY + y2 * radius * perspective;
        const sphereDepth = (z2 + 1) / 2; // 0 = derrière, 1 = devant

        // --- Mélange sphère -> logo, avec un léger décalage par point
        const t = smoothstep(clamp(morph * 1.4 - p.delay * 0.4, 0, 1));
        const targetX = lerp(sphereX, p.logoX, t);
        const targetY = lerp(sphereY, p.logoY, t);
        const depth = lerp(sphereDepth, 1, t);

        // --- Physique : ressort vers la cible
        p.vx += (targetX - p.x) * SPRING;
        p.vy += (targetY - p.y) * SPRING;

        // --- Magnétisme : la souris repousse les points proches
        const dx = p.x - mouse.x;
        const dy = p.y - mouse.y;
        const distance = Math.hypot(dx, dy);
        if (distance < repelRadius && distance > 0.01) {
          const force = (1 - distance / repelRadius) * repelStrength;
          p.vx += (dx / distance) * force;
          p.vy += (dy / distance) * force;
        }

        p.vx *= FRICTION;
        p.vy *= FRICTION;
        p.x += p.vx;
        p.y += p.vy;

        // --- Reflet satiné : une bande de lumière qui balaie en diagonale
        const band = Math.sin(
          ((p.x + p.y * 0.6) / logoSize) * Math.PI * 2 - time * 0.0012,
        );
        const sheen = Math.pow(Math.max(0, band), 8);

        // --- En mode logo : contour mis en valeur, intérieur un peu atténué
        const edgeBoost = p.edge ? t : 0;
        const innerDim = p.edge ? 0 : t;

        // --- Dessin : plus gros et plus lumineux devant, discret derrière
        const size =
          p.size *
          (3 + depth * 4) *
          (1 + sheen * 0.4) *
          (1 + edgeBoost * 0.3 - innerDim * 0.05);
        ctx.globalAlpha = clamp(
          0.15 + depth * 0.75 + sheen * 0.3 + edgeBoost * 0.25 - innerDim * 0.1,
          0,
          1,
        );
        ctx.drawImage(sprite, p.x - size / 2, p.y - size / 2, size, size);
      }

      ctx.globalAlpha = 1;
    };

    const loop = (time) => {
      if (cancelled) return;
      draw(time);
      animationId = requestAnimationFrame(loop);
    };

    // --- Souris / doigt
    const updatePointer = (e) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
      mouse.inside = true;
    };

    const handlePointerLeave = () => {
      mouse.x = -9999;
      mouse.y = -9999;
      mouse.inside = false;
    };

    const handlePointerDown = (e) => {
      updatePointer(e);

      if (e.pointerType === "touch") {
        touchLocked = !touchLocked;
        return;
      }

      // Clic : explosion, puis les points se reforment tout seuls
      for (const p of particles) {
        const a = Math.random() * Math.PI * 2;
        const speed = 8 + Math.random() * 18;
        p.vx += Math.cos(a) * speed;
        p.vy += Math.sin(a) * speed;
      }
    };

    // --- Démarrage : on charge le logo, puis on lance l'animation
    const image = new Image();
    image.onload = () => {
      if (cancelled) return; // composant déjà démonté : on ne lance rien
      logoPoints = sampleLogo(image);
      layout();

      if (reducedMotion) {
        // Animations désactivées : on place les points sur le logo et on dessine une fois
        particles.forEach((p) => {
          p.x = p.logoX;
          p.y = p.logoY;
        });
        draw(0);
      } else {
        animationId = requestAnimationFrame(loop);
      }
    };
    image.src = src;

    const resizeObserver = new ResizeObserver(() => {
      if (logoPoints.length) {
        layout();
        if (reducedMotion) draw(0);
      }
    });
    resizeObserver.observe(canvas);

    canvas.addEventListener("pointermove", updatePointer);
    canvas.addEventListener("pointerleave", handlePointerLeave);
    canvas.addEventListener("pointerdown", handlePointerDown);

    // Nettoyage quand on quitte la page
    return () => {
      cancelled = true;
      image.onload = null;
      cancelAnimationFrame(animationId);
      resizeObserver.disconnect();
      canvas.removeEventListener("pointermove", updatePointer);
      canvas.removeEventListener("pointerleave", handlePointerLeave);
      canvas.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [src]);

  return (
    <div className={styles.wrapper}>
      <canvas
        ref={canvasRef}
        className={styles.canvas}
        role="img"
        aria-label={alt}
      />
    </div>
  );
}

export default ParticleLogo;
