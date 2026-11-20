if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
// Logo como data URL: los canvas no se contaminan aunque se abra el HTML desde el disco
// Visibilidad de los canvas: si no se ven, no se redibujan
let heroVisible = true;
let fotoVisible = true;

// Proporción real del logo (viewBox del SVG): así no se deforma al dibujarlo
const LOGO_W = 752.06, LOGO_H = 468.58;
const LOGO_SVG_SRC = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(`<svg id="Capa_2" data-name="Capa 2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 752.06 468.58">  <g id="Capa_1-2" data-name="Capa 1">    <path d="m483.1,268.02c.25-2.42.54-4.33.62-6.25.46-11.98.84-23.96,1.31-35.94.07-1.79.17-3.69.79-5.34,1.26-3.37,4.53-3.83,6.78-.99,1.11,1.4,1.84,3.12,2.58,4.77,10.14,22.32,20.22,44.67,30.37,66.98,2.86,6.28,5.9,12.47,8.84,18.71.76,1.61,1.45,3.25,2.46,5.52-1.8.74-3.15,1.61-4.61,1.85-27.06,4.47-54.12,8.87-81.19,13.27-6.63,1.08-13.27,2.12-19.91,3.16-1.97.31-3.94.73-5.93.85-2.12.13-4.65.61-5.64-2.03-.98-2.62,1.05-3.99,2.9-5.2,1.97-1.29,4.02-2.48,6.06-3.67,10.84-6.28,21.7-12.54,32.54-18.83,1.65-.96,3.22-2.07,5.46-3.52-1.9-1.19-2.98-2.13-4.24-2.62-17.96-6.96-36.49-9.87-55.54-6.2-14.3,2.75-24.62,11.2-30.6,24.59-4.53,10.15-3.34,19.86,2.94,28.92,7.45,10.74,18.08,17.13,30.07,21.55,14.51,5.35,29.61,7.1,44.97,7.01,25.17-.15,49.34-5.41,72.94-13.95,16.65-6.02,32.52-13.48,47.17-23.49,10.5-7.18,19.39-15.84,25.67-27,9.66-17.18,10.39-34.82,2.61-52.86-4.82-11.16-12.05-20.66-20.43-29.36-16.63-17.26-36.59-29.71-58.03-39.96-35.56-17-72.85-28.91-111.21-37.71-27.47-6.3-55.14-11.39-83.18-14.15-16.97-1.67-34.03-2.6-51.07-3.53-17.94-.97-35.91-2.11-53.87-2.11-17.05,0-34.1,1.37-51.14,2.16-.7.03-1.39.29-2.65.56-.12,1.71-.34,3.44-.35,5.17-.56,50.67-1.04,101.35-1.66,152.02-.66,53.94-1.44,107.88-2.15,161.82-.07,5.06,0,10.13,0,15.82-2.18.19-4.26.55-6.33.53-15.44-.15-30.87-.31-46.31-.58-35.41-.62-70.83-1.29-106.24-1.96-1.97-.04-3.94-.18-6.68-.31-.35-3.54-.96-6.89-.95-10.23.04-14.17.37-28.33.39-42.5.08-53.94.17-107.89.07-161.83C.58,176.9.25,102.61.01,28.32-.01,19.63,0,10.94,0,1.71c4.68-.26,8.59-.56,12.51-.68C54.65-.32,96.78-.04,138.92.2c41.61.24,83.18.75,124.71,3.44,38.99,2.52,77.95,5.66,116.46,12.23,45.64,7.78,91.23,16.06,135.72,29.24,24.06,7.12,47.33,16.41,70.76,25.33,28.41,10.82,54.52,25.72,79.1,43.34,25.62,18.37,47.94,40.23,64.2,67.43,18.81,31.46,26.22,65.6,20.08,102.02-3.74,22.21-13.17,42.2-26.27,60.46-16.19,22.57-36.51,40.76-59.44,56.23-31.41,21.18-65.24,37.38-101.42,48.37-14.2,4.31-28.9,7.09-43.49,9.95-34.03,6.66-68.39,9.1-103.01,6.59-34.48-2.5-68-9.21-99.57-23.9-17.43-8.12-33.41-18.39-46.8-32.34-13.69-14.25-23.18-30.81-25.62-50.64-2.83-23.01,1.03-44.61,13.42-64.8,15.1-24.6,37.21-39.23,63.93-47.93,28.26-9.2,57.08-12.07,86.56-7.19,20.66,3.42,40.02,10.35,58.11,20.89,4.39,2.56,8.81,5.07,13.24,7.57.9.51,1.91.84,3.51,1.52Z"/>  </g></svg>`);

// DOMContentLoaded (no load): no esperamos a que se descarguen las imágenes de los proyectos
document.addEventListener('DOMContentLoaded', async () => {
    // Plugins GSAP
    gsap.registerPlugin(ScrambleTextPlugin, ScrollTrigger);

    const loader = document.getElementById('loader');
    const logoWrapper = document.getElementById('logo-wrapper');
    const content = document.getElementById('content');
    const cursor = document.getElementById('custom-cursor');
    // Cosntante para saber si está en dispositivo móvil
    const esResponsive = window.matchMedia('(max-width: 1024px)').matches;

    // Recuperar del sessionStorage para saber si ya ha saido el loader y la posicion del scroll
    const yaHaCargado = sessionStorage.getItem('loaderEjecutado');
    // Solo se restaura la posición al volver de un proyecto (la página de proyecto deja marcada la vuelta)
    const volviendoDeProyecto = sessionStorage.getItem('volviendoDeProyecto') === '1';
    sessionStorage.removeItem('volviendoDeProyecto');
    const scrollGuardado = volviendoDeProyecto ? sessionStorage.getItem('posicionScroll') : null;
    if (!scrollGuardado) {
        if (location.hash) history.replaceState(null, '', location.pathname + location.search);
        window.scrollTo(0, 0);
        // Durante la carga se mantiene arriba (imágenes, animaciones) hasta que el usuario mueve la página
        let usuarioMueve = false;
        ['wheel', 'touchstart', 'keydown', 'pointerdown'].forEach((ev) => window.addEventListener(ev, () => { usuarioMueve = true; }, { passive: true, once: true }));
        const fijarArriba = () => { if (!usuarioMueve) window.scrollTo({ top: 0, behavior: 'instant' }); };
        window.addEventListener('load', fijarArriba);
        setTimeout(fijarArriba, 300);
    }

    // Cursor personalizado
    if (!esResponsive) {
        window.addEventListener('mousemove', (e) => {

            cursor.style.opacity = "1";

            gsap.to(cursor, {
                x: e.clientX,
                y: e.clientY,
                duration: 0.1,
                ease: "power2.out"
            });
        });

        window.addEventListener('mousedown', () => gsap.to(cursor, { scale: 0.7, duration: 0.15 }));
        window.addEventListener('mouseup', () => {
            const isHovering = document.querySelector('a:hover, button:hover, #carnet-wrapper:hover, canvas:hover, .project-card:hover');
            gsap.to(cursor, { scale: isHovering ? 3 : 1, duration: 0.2 });
        });
    }

    iniciarNavMovil(esResponsive);

    //Si ya ha salido el loader
    if (yaHaCargado) {
        if (loader) loader.style.display = 'none';
        if (content) {
            content.style.visibility = 'visible';
            content.style.opacity = '1';
        }

        // Si ya ha salido el loader se inician todos los componentes de la pagina
        iniciarLogoInteractivo(esResponsive);
        await cargarProyectos();
        iniciarEfectoEscritura();
        iniciarInteraccion3D(esResponsive);
        iniciarSkills();

        //Activar el efecto de puntos de la foto al llegar al sobre mi
        const triggerFoto = iniciarEfectoPuntosFoto();
        ScrollTrigger.create({
            trigger: "#sobre-mi",
            start: esResponsive ? "top 80%" : "top 60%",
            onEnter: () => triggerFoto()
        });

        actualizarEventosCursor(esResponsive);

        //Al volver atras desde un proyecto se mantiene donde estaba el scroll
        if (scrollGuardado) {
            window.scrollTo({
                top: parseInt(scrollGuardado),
                behavior: 'instant'
            });
        }

    } else {
        //Primera visita: el logo ya viene en el HTML (sin fetch), así el cargador se ve desde el primer frame
        const svg = logoWrapper.querySelector('svg');
        const finLoader = () => {
            loader.style.display = 'none';
            document.body.style.overflowY = 'scroll';
            sessionStorage.setItem('loaderEjecutado', 'true');
        };
        gsap.set(svg, { opacity: 0.2, fill: "white", scale: 0.8, transformOrigin: "50% 50%" });
        gsap.set(content, { visibility: "hidden", opacity: 0 });

        //Timeline del cargador: el logo aparece y después se va
        const tl = gsap.timeline();
        tl.to(svg, { opacity: 1, scale: 1, duration: 1.2, ease: "power2.inOut" });

        // El logo se deshace en partículas que se dispersan y se desvanecen, como el resto de la web
        tl.to({}, { duration: 0.4 })
            .add(() => { lanzarParticulasLoader(svg); })
            .to({}, { duration: 1.9 })
            .to(loader, { opacity: 0, duration: 0.6, ease: "power2.out", onComplete: finLoader });

        tl.add(async () => {
            iniciarLogoInteractivo(esResponsive);
            await cargarProyectos();
        }, "-=0.8");

        tl.fromTo(content,
            { visibility: "visible", opacity: 0, scale: 0.95 },
            {
                opacity: 1, scale: 1, duration: 1.2, ease: "power2.out",
                onComplete: () => {
                    // Quita el transform al terminar: si queda, rompe el fijado (pin) de la sección de skills
                    gsap.set(content, { clearProps: "transform" });
                    iniciarEfectoEscritura();
                    iniciarInteraccion3D(esResponsive);
                    iniciarSkills();
                    const triggerFoto = iniciarEfectoPuntosFoto();
                    ScrollTrigger.create({
                        trigger: "#sobre-mi",
                        start: esResponsive ? "top 80%" : "top 60%",
                        onEnter: () => triggerFoto()
                    });
                    actualizarEventosCursor(esResponsive);
                }
            }, "-=0.5"
        );
    }

    // Guardar el scroll en el sessionStorage para reanudarlo cuando actualizamos o volvemos hacia atras desde un proyecto
    let guardandoScroll = false;
    window.addEventListener('scroll', () => {
        if (guardandoScroll) return;
        guardandoScroll = true;
        requestAnimationFrame(() => {
            sessionStorage.setItem('posicionScroll', window.scrollY);
            guardandoScroll = false;
        });
    }, { passive: true });

    const hero = document.getElementById('hero-seccion');
    if (hero) new IntersectionObserver(([e]) => { heroVisible = e.isIntersecting; }).observe(hero);
    const canvasFoto = document.getElementById('canvas-foto-puntos');
    if (canvasFoto) new IntersectionObserver(([e]) => { fotoVisible = e.isIntersecting; }).observe(canvasFoto);
});

// Cargar los proyectos desde el json
async function cargarProyectos() {
    const grid = document.getElementById('grid-proyectos');
    if (!grid) return;
    try {
        const proyectos = window.PROYECTOS || [];
        grid.innerHTML = "";

        proyectos.forEach(proyecto => {
            const card = document.createElement('a');
            card.href = `detalles-proyecto.html?id=${proyecto.id}`;
            card.className = `project-card ${proyecto.size || 'small'}`;
            card.style.textDecoration = "none";
            card.style.color = "inherit";

            // Boton de ver detalles
            const verDetallesBtn = `
                <div class="ver-detalles-btn">
                    <span>VER DETALLES</span>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M14.43 5.92999L20.5 12L14.43 18.07" stroke="#171717" stroke-width="1.5" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M3.5 12H20.33" stroke="#171717" stroke-width="1.5" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                </div>
            `;

            let cardVisualHtml;

            if (proyecto.tipo === 'video' && proyecto.video_url) {
                // YouTube necesita el ID también en playlist para que el loop funcione bien.
                const videoId = proyecto.video_url.split('/').pop().split('?')[0];
                // En portada se muestra la miniatura del vídeo: sin iframe no hay reproducción automática, ni foco que desplace la página, ni error de incrustación
                cardVisualHtml = `
                    <div class="card-visual card-visual--video">
                        <img class="card-video-miniatura" src="https://i.ytimg.com/vi/${videoId}/hqdefault.jpg" alt="${proyecto.titulo}" loading="lazy" decoding="async">
                        ${verDetallesBtn}
                    </div>
                `;
            } else {
                //Crear las imagenes del carrusel y deja activa la primera para que se vea al cargar
                const imagenesHtml = proyecto.imagenes.map((img, index) =>
                    `<img src="${img.replace(/\.(jpe?g|png|webp)$/i, '-card.webp')}" class="${index === 0 ? 'active' : ''}" alt="${proyecto.titulo}" loading="lazy" decoding="async">`
                ).join('');

                cardVisualHtml = `
                    <div class="card-visual slideshow">
                        ${imagenesHtml}
                        ${verDetallesBtn}
                    </div>
                `;
            }

            card.innerHTML = `
                ${cardVisualHtml}
                <div class="card-content">
                    <div class="card-meta">
                        <span>${proyecto.categoria}</span>
                        <span>${proyecto.año}</span>
                    </div>
                    <h3>${proyecto.titulo}</h3>
                    <p>${proyecto.descripcion_corta}</p>
                    <div class="tags">
                        ${proyecto.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                    </div>
                </div>
            `;
            grid.appendChild(card);
        });

        iniciarSlideshows();
        actualizarEventosCursor(window.matchMedia('(max-width: 1024px)').matches);

    } catch (error) {
        console.error("Error cargando proyectos:", error);
    }
}

// Funcionalidad del carrusel
function iniciarSlideshows() {
    const slideshows = document.querySelectorAll('.card-visual.slideshow');
    slideshows.forEach(container => {
        let imgs = container.querySelectorAll('img');
        if (imgs.length <= 1) return;
        let index = 0;
        setInterval(() => {
            imgs[index].classList.remove('active');
            index = (index + 1) % imgs.length;
            imgs[index].classList.add('active');
        }, 3000);
    });
}

// Volver a enlazar el cursor cuando se añade algo interactivo nuevo
function actualizarEventosCursor(esResponsive = false) {
    if (esResponsive) return;
    const cursor = document.getElementById('custom-cursor');
    const interactivos = document.querySelectorAll('a, button, #carnet-wrapper, canvas, .skill-card, .project-card');
    interactivos.forEach(el => {
        el.addEventListener('mouseenter', () => gsap.to(cursor, { scale: 3, duration: 0.3 }));
        el.addEventListener('mouseleave', () => gsap.to(cursor, { scale: 1, duration: 0.3 }));
    });
}

// Crea el logo de partículas reactivo al cursor
function iniciarLogoInteractivo(esResponsive = false) {
    const canvas = document.getElementById('logo-particulas');
    if (!canvas) return;
    if (esResponsive) {
        iniciarLogoMovil(canvas);
        return;
    }
    const ctx = canvas.getContext('2d');
    let particles = [];
    const mouse = { x: null, y: null, radius: 100 };
    canvas.width = window.innerWidth; canvas.height = window.innerHeight;

    window.addEventListener('mousemove', (e) => {
        const rect = canvas.getBoundingClientRect();
        mouse.x = e.clientX - rect.left; mouse.y = e.clientY - rect.top;
    });

    class Particle {
        constructor(x, y, originX, originY) {
            this.x = x; this.y = y; this.originX = originX; this.originY = originY;
            this.vx = 0; this.vy = 0; this.ease = 0.1; this.friction = 0.85;
        }
        draw() { ctx.fillStyle = '#DD021E'; ctx.fillRect(this.x, this.y, 1.5, 1.5); }
        update() {
            let dx = mouse.x - this.x; let dy = mouse.y - this.y;
            let distance = Math.sqrt(dx * dx + dy * dy);
            if (distance < mouse.radius) {
                let angle = Math.atan2(dy, dx);
                let force = (mouse.radius - distance) / mouse.radius;
                this.vx -= Math.cos(angle) * force * 10; this.vy -= Math.sin(angle) * force * 10;
            }
            this.vx += (this.originX - this.x) * this.ease; this.vy += (this.originY - this.y) * this.ease;
            this.vx *= this.friction; this.vy *= this.friction;
            this.x += this.vx; this.y += this.vy;
        }
    }

    const img = new Image();
    img.src = LOGO_SVG_SRC;
    img.onload = () => {
        // Reserva espacio bajo el nav (arriba) y un margen inferior; el logo ocupa el resto
        const ARRIBA = 130, ABAJO = 40;
        const areaAlto = canvas.height - ARRIBA - ABAJO;
        const scale = Math.min((canvas.width * 0.78) / LOGO_W, areaAlto / LOGO_H);
        const xPos = (canvas.width - LOGO_W * scale) / 2;
        const yPos = ARRIBA + (areaAlto - LOGO_H * scale) / 2;
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = canvas.width; tempCanvas.height = canvas.height;
        const tempCtx = tempCanvas.getContext('2d');
        tempCtx.drawImage(img, xPos, yPos, LOGO_W * scale, LOGO_H * scale);
        const pixels = tempCtx.getImageData(0, 0, canvas.width, canvas.height).data;
        particles = [];
        for (let y = 0; y < canvas.height; y += 4) {
            for (let x = 0; x < canvas.width; x += 4) {
                if (pixels[((y * canvas.width + x) * 4) + 3] > 128) {
                    particles.push(new Particle(x, y, x, y));
                }
            }
        }
        function animate() {
            if (!heroVisible) { requestAnimationFrame(animate); return; }
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            particles.forEach(p => { p.update(); p.draw(); });
            requestAnimationFrame(animate);
        }
        animate();
    };
}

// Versión móvil/tablet: la D aparece como masa sólida, se deshace en partículas y vuelve a componerse en masa
function iniciarLogoMovil(canvas) {
    const ctx = canvas.getContext('2d');
    const solido = document.createElement('canvas');
    const paso = 3;
    const DURACION = 7000;
    const img = new Image();
    img.src = LOGO_SVG_SRC;
    let ancho = 0, alto = 0, listo = false;
    let particulas = [];
    let t0 = performance.now();
    let ultimoT = 0;
    let explotoEnEsteCiclo = false;

    // Dibuja la masa y crea las partículas con el tamaño REAL de la caja del canvas.
    // Así no se estira aunque el navegador móvil cambie la altura al mostrar u ocultar la barra.
    function construir() {
        const w = canvas.clientWidth;
        const h = canvas.clientHeight;
        if (!w || !h || !img.naturalWidth) return;
        ancho = w; alto = h;
        canvas.width = ancho; canvas.height = alto;
        solido.width = ancho; solido.height = alto;
        const escala = Math.min((ancho * 0.85) / LOGO_W, (alto * 0.85) / LOGO_H);
        const lw = LOGO_W * escala;
        const lh = LOGO_H * escala;
        const sctx = solido.getContext('2d');
        sctx.clearRect(0, 0, ancho, alto);
        sctx.drawImage(img, (ancho - lw) / 2, (alto - lh) / 2, lw, lh);
        // Tiñe la masa del color de la marca
        sctx.globalCompositeOperation = 'source-in';
        sctx.fillStyle = '#DD021E';
        sctx.fillRect(0, 0, ancho, alto);
        sctx.globalCompositeOperation = 'source-over';
        const pixeles = sctx.getImageData(0, 0, ancho, alto).data;
        particulas = [];
        for (let y = 0; y < alto; y += paso) {
            for (let x = 0; x < ancho; x += paso) {
                if (pixeles[((y * ancho + x) * 4) + 3] > 128) {
                    particulas.push({ x, y, ox: x, oy: y, vx: 0, vy: 0 });
                }
            }
        }
        listo = true;
    }

    img.onload = construir;
    // Si cambia el tamaño de la caja (rotación, barra del navegador), se vuelve a construir
    let temporizador = null;
    new ResizeObserver(() => {
        clearTimeout(temporizador);
        temporizador = setTimeout(construir, 150);
    }).observe(canvas);

    // 0 = masa sólida, 1 = solo partículas
    function mezcla(t) {
        if (t < 2000) return 0;
        if (t < 2400) return (t - 2000) / 400;
        if (t < 4200) return 1;
        if (t < 4800) return 1 - (t - 4200) / 600;
        return 0;
    }

    // Cada partícula sale disparada y el muelle la devuelve a su sitio
    function desarmar() {
        particulas.forEach(p => {
            p.vx = (Math.random() - 0.5) * 36;
            p.vy = (Math.random() - 0.5) * 36;
        });
    }

    function bucle(ahora) {
        if (!heroVisible || !listo) { requestAnimationFrame(bucle); return; }
        const t = (ahora - t0) % DURACION;
        if (t < ultimoT) explotoEnEsteCiclo = false;
        ultimoT = t;
        if (t >= 2000 && !explotoEnEsteCiclo) {
            desarmar();
            explotoEnEsteCiclo = true;
        }

        const m = mezcla(t);
        ctx.clearRect(0, 0, ancho, alto);

        particulas.forEach(p => {
            p.vx += (p.ox - p.x) * 0.08;
            p.vy += (p.oy - p.y) * 0.08;
            p.vx *= 0.86;
            p.vy *= 0.86;
            p.x += p.vx;
            p.y += p.vy;
        });

        if (m < 1) {
            ctx.globalAlpha = 1 - m;
            ctx.drawImage(solido, 0, 0);
        }
        if (m > 0) {
            ctx.globalAlpha = m;
            ctx.fillStyle = '#DD021E';
            particulas.forEach(p => ctx.fillRect(p.x, p.y, 2, 2));
        }
        ctx.globalAlpha = 1;
        requestAnimationFrame(bucle);
    }

    // Al tocar, la D se deshace ya
    canvas.addEventListener('click', () => {
        t0 = performance.now() - 2000;
        explotoEnEsteCiclo = false;
    });

    requestAnimationFrame(bucle);
}

// Barra de navegación: se esconde al bajar y aparece al subir (y con el ratón arriba en escritorio)
function iniciarNavMovil(esResponsive) {
    const nav = document.querySelector('.nav-movil');
    if (!nav) return;
    const capsula = nav.querySelector('.nav-capsula');
    const indicador = nav.querySelector('.nav-indicador');
    const enlaces = [...nav.querySelectorAll('.nav-capsula a')];

    // La pastilla magenta se desliza hasta el enlace pulsado
    const moverIndicador = (enlace) => {
        enlaces.forEach(a => a.classList.toggle('activo', a === enlace));
        // Se mide el elemento de la lista (li), que es el que ocupa la posición en la cápsula
        const item = enlace.parentElement;
        capsula.style.setProperty('--x', item.offsetLeft + 'px');
        capsula.style.setProperty('--ancho', item.offsetWidth + 'px');
        capsula.style.setProperty('--visible', 1);
    };
    enlaces.forEach(a => a.addEventListener('pointerdown', () => moverIndicador(a)));

    // Se oculta al bajar y reaparece al subir
    let ultimoY = window.scrollY;
    window.addEventListener('scroll', () => {
        const y = window.scrollY;
        if (y < 80) nav.classList.remove('oculto');
        else if (y > ultimoY + 6) nav.classList.add('oculto');
        else if (y < ultimoY - 6) nav.classList.remove('oculto');
        ultimoY = y;
    }, { passive: true });

    if (!esResponsive) {
        window.addEventListener('mousemove', (e) => {
            if (e.clientY < 70) nav.classList.remove('oculto');
        }, { passive: true });
        nav.addEventListener('mouseenter', () => nav.classList.remove('oculto'));
    }
}

// Deshace el logo del cargador en partículas que se dispersan y se desvanecen
function lanzarParticulasLoader(svg) {
    const loader = document.getElementById('loader');
    if (!loader || !svg) return;
    const rect = svg.getBoundingClientRect();
    const ancho = Math.round(rect.width);
    const alto = Math.round(rect.height);
    if (!ancho || !alto) return;

    gsap.set(svg, { opacity: 0 });

    // El lienzo cubre toda la pantalla para que las partículas puedan salir del logo
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(vw * dpr);
    canvas.height = Math.round(vh * dpr);
    canvas.style.cssText = 'position:fixed;left:0;top:0;width:100%;height:100%;pointer-events:none;z-index:1';
    loader.appendChild(canvas);
    const ctx = canvas.getContext('2d');

    // Posición del logo en pantalla y su centro
    const origenX = rect.left;
    const origenY = rect.top;
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;

    const img = new Image();
    img.onload = () => {
        const tmp = document.createElement('canvas');
        tmp.width = ancho; tmp.height = alto;
        const tctx = tmp.getContext('2d');
        tctx.drawImage(img, 0, 0, ancho, alto);
        const pixeles = tctx.getImageData(0, 0, ancho, alto).data;
        const particulas = [];
        for (let y = 0; y < alto; y += 3) {
            for (let x = 0; x < ancho; x += 3) {
                if (pixeles[((y * ancho + x) * 4) + 3] > 128) {
                    const px = origenX + x;
                    const py = origenY + y;
                    const dx = px - cx, dy = py - cy;
                    const d = Math.hypot(dx, dy) || 1;
                    // Velocidad suficiente para cruzar la pantalla
                    const v = 3 + Math.random() * 7;
                    particulas.push({ x: px, y: py, vx: (dx / d) * v + (Math.random() - 0.5) * 2.5, vy: (dy / d) * v + (Math.random() - 0.5) * 2.5 });
                }
            }
        }
        const inicio = performance.now();
        const DURACION = 2000;
        const frame = (ahora) => {
            const t = (ahora - inicio) / DURACION;
            if (t >= 1) { canvas.remove(); return; }
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            ctx.clearRect(0, 0, vw, vh);
            // Se mantienen visibles casi todo el recorrido y se desvanecen al final
            ctx.globalAlpha = Math.max(0, 1 - Math.pow(t, 2.2));
            ctx.fillStyle = '#ffffff';
            particulas.forEach(p => {
                p.x += p.vx; p.y += p.vy;
                p.vx *= 0.985; p.vy *= 0.985;
                ctx.fillRect(p.x, p.y, 3, 3);
            });
            requestAnimationFrame(frame);
        };
        requestAnimationFrame(frame);
    };
    img.src = LOGO_SVG_SRC;
}

// Usar el plugin de scramble para cambiar el texto del inicio
function iniciarEfectoEscritura() {
    const el = document.getElementById('text-reveal');
    if (!el) return;
    gsap.timeline({ repeat: -1, repeatDelay: 2 })
        .to(el, { duration: 1.5, scrambleText: { text: "DEMONSPIRALE", chars: "upperCase", speed: 1 } })
        .to(el, { duration: 1.5, delay: 2, scrambleText: { text: "SARA ORTIZ", chars: "upperCase", speed: 0.3 } });
}

// Inclinación del carnet según la posición del cursor
function iniciarInteraccion3D(esResponsive = false) {
    const card = document.getElementById('carnet-wrapper');
    if (!card) return;
    if (esResponsive) {
        gsap.set(card, { clearProps: 'transform' });
        return;
    }
    document.addEventListener('mousemove', (e) => {
        const x = (window.innerWidth / 2 - e.clientX) / 25;
        const y = (window.innerHeight / 2 - e.clientY) / 25;
        gsap.to(card, { rotationY: -x, rotationX: y, duration: 0.5 });
    });
}

// Aplicar animación de puntos en la foto del carnet
function iniciarEfectoPuntosFoto() {
    const canvasPuntos = document.getElementById('canvas-foto-puntos');
    const canvasFixed = document.getElementById('canvas-foto-fixed');
    if (!canvasPuntos || !canvasFixed) return () => { };
    const ctxPuntos = canvasPuntos.getContext('2d');
    const ctxFixed = canvasFixed.getContext('2d');
    const img = new Image();
    img.src = window.FOTO_CARNET_SRC || 'assets/img/otros_recursos/fotoCarne_SaraOrtizCardo.jpg';
    img.onerror = () => { img.onerror = null; img.src = 'assets/img/otros_recursos/fotoCarne_SaraOrtizCardo.jpg'; };
    let particles = []; let animacionIniciada = false; let fase = 'fotoNítida'; let progresoReunion = 0;

    img.onload = () => {
        const altoDeseado = 310;
        const proporcion = img.naturalWidth / img.naturalHeight;
        const anchoCalculado = altoDeseado * proporcion;
        canvasPuntos.width = canvasFixed.width = anchoCalculado;
        canvasPuntos.height = canvasFixed.height = altoDeseado;
        ctxFixed.drawImage(img, 0, 0, anchoCalculado, altoDeseado);
        const data = ctxFixed.getImageData(0, 0, anchoCalculado, altoDeseado).data;
        particles = [];
        for (let y = 0; y < altoDeseado; y += 4) {
            for (let x = 0; x < Math.floor(anchoCalculado); x += 4) {
                const index = (y * Math.floor(anchoCalculado) + x) * 4;
                if (data[index + 3] > 128) {
                    particles.push({
                        x: x, y: y, dx: x, dy: y,
                        caosX: Math.random() * anchoCalculado, caosY: Math.random() * altoDeseado,
                        r: data[index], g: data[index + 1], b: data[index + 2]
                    });
                }
            }
        }
    };

    return () => {
        if (animacionIniciada) return;
        animacionIniciada = true;
        function anim() {
            if (!fotoVisible) { requestAnimationFrame(anim); return; }
            ctxPuntos.clearRect(0, 0, canvasPuntos.width, canvasPuntos.height);
            particles.forEach(p => {
                ctxPuntos.fillStyle = `rgb(${p.r},${p.g},${p.b})`;
                ctxPuntos.beginPath(); ctxPuntos.arc(p.x, p.y, 1.2, 0, Math.PI * 2); ctxPuntos.fill();
                if (fase === 'dispersion') { p.x += (p.caosX - p.x) * 0.05; p.y += (p.caosY - p.y) * 0.05; }
                else if (fase === 'caos') { p.x += (Math.random() - 0.5) * 0.5; p.y += (Math.random() - 0.5) * 0.5; }
                else if (fase === 'reunion') {
                    p.x += (p.dx - p.x) * 0.12; p.y += (p.dy - p.y) * 0.12;
                    if (Math.abs(p.x - p.dx) < 0.2) progresoReunion++;
                }
            });
            if (fase === 'fotoNítida') {
                canvasFixed.style.opacity = 1; canvasPuntos.style.opacity = 0;
                setTimeout(() => { fase = 'dispersion'; canvasFixed.style.opacity = 0; canvasPuntos.style.opacity = 1; }, 4000);
                fase = 'esperandoDispersion';
            } else if (fase === 'dispersion') { setTimeout(() => { fase = 'caos'; }, 2000); fase = 'esperandoCaos'; }
            else if (fase === 'caos') { setTimeout(() => { fase = 'reunion'; progresoReunion = 0; }, 2000); fase = 'esperandoReunion'; }
            else if (fase === 'reunion' && progresoReunion > particles.length * 0.95) {
                canvasFixed.style.opacity = 1; canvasPuntos.style.opacity = 0;
                setTimeout(() => { fase = 'fotoNítida'; }, 1500); fase = 'esperandoFadeNítido';
            }
            requestAnimationFrame(anim);
        }
        anim();
    };
}

// Skills: botones de programas + tarjeta seleccionada (se sincronizan al deslizar)
let skillsIniciado = false;
function iniciarSkills() {
    if (skillsIniciado) return;
    const visor = document.querySelector('.skills-visor');
    if (!visor) return;
    skillsIniciado = true;

    const botones = [...visor.querySelectorAll('.skill-btn')];
    const pista = visor.querySelector('.skills-pista');
    const tarjetas = [...pista.querySelectorAll('.skill-card')];
    let frame = null;

    const flechas = [...visor.querySelectorAll('.skills-flecha')];
    const actualizarFlechas = (i) => {
        flechas.forEach((f) => {
            const dir = Number(f.dataset.dir);
            f.disabled = (dir < 0 && i === 0) || (dir > 0 && i === tarjetas.length - 1);
        });
    };

    const marcar = (i) => {
        actualizarFlechas(i);
        botones.forEach((b, j) => {
            const on = j === i;
            b.classList.toggle('activo', on);
            b.setAttribute('aria-pressed', on ? 'true' : 'false');
        });
    };

    // Tarjeta más cercana a la posición actual del deslizador
    const masCercana = () => {
        let mejor = 0;
        let distancia = Infinity;
        tarjetas.forEach((t, i) => {
            const d = Math.abs(t.offsetLeft - pista.scrollLeft);
            if (d < distancia) {
                distancia = d;
                mejor = i;
            }
        });
        return mejor;
    };

    pista.addEventListener('scroll', () => {
        if (frame) return;
        frame = requestAnimationFrame(() => {
            frame = null;
            marcar(masCercana());
        });
    }, { passive: true });

    botones.forEach((b, i) => {
        b.addEventListener('click', () => {
            marcar(i);
            pista.scrollTo({ left: tarjetas[i].offsetLeft, behavior: 'smooth' });
        });
    });

    flechas.forEach((f) => {
        f.addEventListener('click', () => {
            const destino = Math.min(tarjetas.length - 1, Math.max(0, masCercana() + Number(f.dataset.dir)));
            marcar(destino);
            pista.scrollTo({ left: tarjetas[destino].offsetLeft, behavior: 'smooth' });
        });
    });

    // Arrastrar con el ratón sobre el carrusel (en táctil ya funciona el deslizado nativo)
    let arrastre = null;
    pista.addEventListener('pointerdown', (e) => {
        if (e.pointerType !== 'mouse' || e.button !== 0) return;
        arrastre = { x: e.clientX, left: pista.scrollLeft, movido: false };
        pista.classList.add('arrastrando');
    });
    window.addEventListener('pointermove', (e) => {
        if (!arrastre) return;
        const dx = e.clientX - arrastre.x;
        if (Math.abs(dx) > 3) arrastre.movido = true;
        pista.scrollLeft = arrastre.left - dx;
    });
    const soltar = () => {
        if (!arrastre) return;
        const movido = arrastre.movido;
        arrastre = null;
        pista.classList.remove('arrastrando');
        if (movido) pista.scrollTo({ left: tarjetas[masCercana()].offsetLeft, behavior: 'smooth' });
    };
    window.addEventListener('pointerup', soltar);
    window.addEventListener('pointercancel', soltar);

    window.addEventListener('resize', () => marcar(masCercana()));
    marcar(0);
}

// Ilustración del hero en móvil: se dibuja sola, se disuelve al tocarla y vuelve a dibujarse
