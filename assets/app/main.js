window.addEventListener('load', async () => {
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
    const scrollGuardado = sessionStorage.getItem('posicionScroll');

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
            const isHovering = document.querySelector('a:hover, button:hover, .pill:hover, #carnet-wrapper:hover, canvas:hover, .project-card:hover');
            gsap.to(cursor, { scale: isHovering ? 3 : 1, duration: 0.2 });
        });
    }

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
        iniciarScrollHorizontal(esResponsive);

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
        //Si es la primera visita a la pagina aparece el loader con el logo antes de enseñar el contenido
        try {
            const responseLogo = await fetch('assets/img/otros_recursos/logo_demonspirale.svg');
            const svgText = await responseLogo.text();
            logoWrapper.innerHTML = svgText;
        } catch (e) { console.error("Error cargando logo:", e); }
        //ajustar el logo para el loader
        const svg = logoWrapper.querySelector('svg');
        gsap.set(svg, { opacity: 0.2, fill: "white", scale: 0.8 });
        gsap.set(content, { visibility: "hidden", opacity: 0 });
        //Timeline de hace la animacion del loader y carga posteriormente la pagina
        const tl = gsap.timeline();
        tl.to(svg, { opacity: 1, scale: 1, duration: 1.2, ease: "power2.inOut" })
            .add(() => { crearFragmentos(svg); }, "+=0.2")
            .to(svg, { opacity: 0, duration: 0.1 }, "<")
            .to(logoWrapper, { scale: 250, duration: 1.5, ease: "power2.in" }, "<")
            .to(loader, { backgroundColor: "#ffffff", duration: 0.7, ease: "power2.in" }, "-=1.7")
            .to(loader, {
                opacity: 0, duration: 0.5,
                onComplete: () => {
                    loader.style.display = 'none';
                    document.body.style.overflowY = 'scroll';
                    sessionStorage.setItem('loaderEjecutado', 'true');
                }
            });

        tl.add(async () => {
            iniciarLogoInteractivo(esResponsive);
            await cargarProyectos();
        }, "-=0.8");

        tl.fromTo(content,
            { visibility: "visible", opacity: 0, scale: 0.95 },
            {
                opacity: 1, scale: 1, duration: 1.2, ease: "power2.out",
                onComplete: () => {
                    iniciarEfectoEscritura();
                    iniciarInteraccion3D(esResponsive);
                    iniciarScrollHorizontal(esResponsive);
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
    window.addEventListener('scroll', () => {
        sessionStorage.setItem('posicionScroll', window.scrollY);
    });
});

// Cargar los proyectos desde el json
async function cargarProyectos() {
    const grid = document.getElementById('grid-proyectos');
    if (!grid) return;
    try {
        const res = await fetch('assets/data/proyectos.json');
        const proyectos = await res.json();
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
                const videoSrc = `${proyecto.video_url}?autoplay=1&mute=1&loop=1&controls=0&playlist=${videoId}&modestbranding=1&rel=0&playsinline=1`;

                cardVisualHtml = `
                    <div class="card-visual card-visual--video">
                        <iframe
                            src="${videoSrc}"
                            frameborder="0"
                            allow="autoplay; encrypted-media"
                            tabindex="-1"
                        ></iframe>
                        ${verDetallesBtn}
                    </div>
                `;
            } else {
                //Crear las imagenes del carrusel y deja activa la primera para que se vea al cargar
                const imagenesHtml = proyecto.imagenes.map((img, index) =>
                    `<img src="${img}" class="${index === 0 ? 'active' : ''}" alt="${proyecto.titulo}">`
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

// Scroll horizontal en la skills
function iniciarScrollHorizontal(esResponsive = false) {
    const section = document.querySelector('#skills-section');
    const container = document.querySelector('.horizontal-container');
    const wrapper = document.querySelector('.horizontal-wrapper');

    if (!section || !wrapper || !container) return;
    if (esResponsive) {
        section.style.height = 'auto';
        wrapper.style.transform = 'none';
        return;
    }

    const setX = gsap.quickSetter(wrapper, 'x', 'px');

    //Calcular el alto necesario para recorrer las skills en horizontal
    const calcularDimensiones = () => {
        if (window.innerWidth <= 1024) {
            section.style.removeProperty('height');
            return;
        }
        const scrollWidth = wrapper.scrollWidth;
        const windowWidth = window.innerWidth;
        section.style.height = `${scrollWidth - windowWidth + window.innerHeight}px`;
    };

    calcularDimensiones();
    window.addEventListener('resize', calcularDimensiones);

    window.addEventListener('scroll', () => {
        const sectionTop = section.offsetTop;
        const scrollTop = window.scrollY;
        const distance = scrollTop - sectionTop;
        const maxScroll = section.offsetHeight - window.innerHeight;

        if (distance >= 0 && distance <= maxScroll) {
            setX(-distance);
        } else if (distance < 0) {
            setX(0);
        } else {
            setX(-maxScroll);
        }
    });
}

// Volver a enlazar el cursor cuando se añade algo interactivo nuevo
function actualizarEventosCursor(esResponsive = false) {
    if (esResponsive) return;
    const cursor = document.getElementById('custom-cursor');
    const interactivos = document.querySelectorAll('a, button, .pill, #carnet-wrapper, canvas, .skill-card, .project-card');
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
        canvas.style.display = 'none';
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
    img.src = 'assets/img/otros_recursos/logo_demonspirale.svg';
    img.onload = () => {
        const scale = (canvas.width * 0.7) / img.width;
        const xPos = (canvas.width - img.width * scale) / 2;
        const yPos = (canvas.height - img.height * scale) / 2;
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = canvas.width; tempCanvas.height = canvas.height;
        const tempCtx = tempCanvas.getContext('2d');
        tempCtx.drawImage(img, xPos, yPos, img.width * scale, img.height * scale);
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
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            particles.forEach(p => { p.update(); p.draw(); });
            requestAnimationFrame(animate);
        }
        animate();
    };
}

// Crea los fragmentos blancos de la animación de explosión del loader
function crearFragmentos(target) {
    const contenedor = document.getElementById('logo-wrapper');
    if (!contenedor) return;
    for (let i = 0; i < 45; i++) {
        const div = document.createElement('div');
        const size = Math.random() * 25 + 5;
        div.style.width = `${size}px`; div.style.height = `${size}px`;
        div.style.backgroundColor = "white"; div.style.position = "absolute";
        div.style.left = `50%`; div.style.top = `50%`;
        div.style.transform = "translate(-50%, -50%)";
        const p = () => `${Math.random() * 100}% ${Math.random() * 100}%`;
        div.style.clipPath = `polygon(${p()}, ${p()}, ${p()}, ${p()})`;
        contenedor.appendChild(div);
        gsap.to(div, {
            duration: 1.5, x: (Math.random() - 0.5) * 600, y: (Math.random() - 0.5) * 600,
            rotation: Math.random() * 720, opacity: 0, scale: 0.5, ease: "power3.out",
            onComplete: () => div.remove()
        });
    }
}

// Usar el plugin de scramble para cambiar el texto del inicio
function iniciarEfectoEscritura() {
    const el = document.getElementById('text-reveal');
    if (!el) return;
    gsap.timeline({ repeat: -1, repeatDelay: 2 })
        .to(el, { duration: 1.5, scrambleText: { text: "DEMONSPIRALE", chars: "upperCase", speed: 1 } })
        .to(el, { duration: 1.5, delay: 2, scrambleText: { text: "SOY SARA ORTIZ", chars: "upperCase", speed: 0.3 } });
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
    img.src = 'assets/img/otros_recursos/fotoCarne_SaraOrtizCardo.jpg';
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
