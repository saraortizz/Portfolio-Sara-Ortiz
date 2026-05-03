window.addEventListener('load', async () => {
    const cursor = document.getElementById('custom-cursor');
    const container = document.getElementById('detalle-contenido');
    const overlay = document.getElementById('overlay-foto');
    const fotoAmpliada = document.getElementById('foto-ampliada');
    const videoAmpliado = document.getElementById('video-ampliado');
    const btnCerrar = document.querySelector('.cerrar-foto');

    if (!cursor) return;

    // Cursor personalizado
    window.addEventListener('mousemove', (e) => {
        cursor.style.opacity = "1";
        gsap.to(cursor, {
            x: e.clientX,
            y: e.clientY,
            duration: 0.1,
            ease: "power2.out",
            overwrite: "auto"
        });
    });

    window.addEventListener('mousedown', () => gsap.to(cursor, { scale: 0.7, duration: 0.15, overwrite: "auto" }));

    window.addEventListener('mouseup', () => {
        const isHovering = document.querySelector('a:hover, button:hover, .back-btn:hover, img:hover, .cerrar-foto:hover, .galeria-item:hover');
        gsap.to(cursor, { scale: isHovering ? 3 : 1, duration: 0.2, overwrite: "auto" });
    });

    // Volver a enlazar el cursor cuando se añade algo interactivo nuevo
    function actualizarEventosCursor() {
        const interactivos = document.querySelectorAll('a, button, .back-btn, img, .cerrar-foto, .galeria-item');

        interactivos.forEach(el => {
            el.removeEventListener('mouseenter', mouseEnterHandler);
            el.removeEventListener('mouseleave', mouseLeaveHandler);
            el.addEventListener('mouseenter', mouseEnterHandler);
            el.addEventListener('mouseleave', mouseLeaveHandler);

            // Abrir imagenes en grande
            if (el.tagName === 'IMG' && el.closest('.galeria-masonry')) {
                el.onclick = () => abrirFoto(el.src);
            }

            // Abrir videos en grande
            if (el.classList.contains('galeria-item--video')) {
                el.onclick = () => abrirVideo(el.dataset.src);
            }
        });
    }

    function mouseEnterHandler() { gsap.to(cursor, { scale: 3, duration: 0.3, overwrite: "auto" }); }
    function mouseLeaveHandler() { gsap.to(cursor, { scale: 1, duration: 0.3, overwrite: "auto" }); }


    // Saca un fotograma de los videos para usarlos como portada
    function generarMiniaturas() {
        const items = document.querySelectorAll('.galeria-item--video');

        items.forEach(item => {
            const video = item.querySelector('video');
            if (!video) return;

            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            video.addEventListener('loadedmetadata', () => {
                video.currentTime = 2;
            });

            video.addEventListener('seeked', () => {
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

                item.style.backgroundImage = `url(${canvas.toDataURL('image/jpeg', 0.8)})`;
                item.style.backgroundSize = 'cover';
                item.style.backgroundPosition = 'center';

                video.style.opacity = '0';
            });
        });
    }


    // Abrir la imagen en grande
    function abrirFoto(src) {
        if (!overlay || !fotoAmpliada) return;

        if (videoAmpliado) {
            videoAmpliado.pause();
            videoAmpliado.src = '';
            videoAmpliado.classList.remove('visible');
        }
        fotoAmpliada.classList.add('visible');
        fotoAmpliada.src = src;

        overlay.classList.add('active');
        document.body.style.overflow = 'hidden';

        gsap.fromTo(overlay, { opacity: 0 }, { opacity: 1, duration: 0.3, ease: 'power2.out' });
        gsap.fromTo(fotoAmpliada, { scale: 0.88, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.4, ease: 'back.out(1.4)' });
    }

    // Abre un video en grande
    function abrirVideo(src) {
        if (!overlay || !videoAmpliado) return;

        fotoAmpliada.classList.remove('visible');
        fotoAmpliada.src = '';
        gsap.set(fotoAmpliada, { display: 'none' });

        videoAmpliado.classList.add('visible');
        videoAmpliado.src = src;
        videoAmpliado.load();

        overlay.classList.add('active');
        document.body.style.overflow = 'hidden';

        gsap.fromTo(overlay, { opacity: 0 }, { opacity: 1, duration: 0.3, ease: 'power2.out' });
        gsap.fromTo(videoAmpliado, { scale: 0.88, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.4, ease: 'back.out(1.4)' });

        videoAmpliado.play().catch(() => { });
    }

    // Cierra el overlay y limpia lo que pudiera estar abierto
    function cerrarModal() {
        if (!overlay || !overlay.classList.contains('active')) return;

        if (videoAmpliado) videoAmpliado.pause();

        const elementoVisible = (videoAmpliado && videoAmpliado.classList.contains('visible'))
            ? videoAmpliado
            : fotoAmpliada;

        gsap.to(elementoVisible, { scale: 0.92, opacity: 0, duration: 0.25, ease: 'power2.in' });
        gsap.to(overlay, {
            opacity: 0,
            duration: 0.3,
            ease: 'power2.in',
            onComplete: () => {
                overlay.classList.remove('active');
                document.body.style.overflow = 'auto';
                fotoAmpliada.src = '';
                fotoAmpliada.classList.remove('visible');
                gsap.set(fotoAmpliada, { clearProps: 'display' });
                if (videoAmpliado) {
                    videoAmpliado.src = '';
                    videoAmpliado.classList.remove('visible');
                }
                gsap.to(cursor, { scale: 1, duration: 0.2, overwrite: "auto" });
            }
        });
    }

    if (btnCerrar) btnCerrar.addEventListener('click', cerrarModal);

    if (overlay) {
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) cerrarModal();
        });
    }

    window.addEventListener('keydown', (e) => {
        if (e.key === "Escape") cerrarModal();
    });


    // El id de la URL decide que proyecto se pinta en la pagina
    const params = new URLSearchParams(window.location.search);
    const proyectoId = params.get('id');

    if (!proyectoId) {
        window.location.href = 'index.html';
        return;
    }

    try {
        const res = await fetch('assets/data/proyectos.json');
        const proyectos = await res.json();
        const proyecto = proyectos.find(p => p.id === proyectoId);

        if (!proyecto) {
            container.innerHTML = '<header class="header-proyecto"><h1>Proyecto no encontrado</h1></header>';
            return;
        }

        renderProyecto(proyecto);
        actualizarEventosCursor();

        generarMiniaturas();

    } catch (error) {
        console.error("Error crítico cargando el archivo JSON:", error);
    }
});


// Pinta el contenido del proyecto extraido del json
function renderProyecto(p) {
    const container = document.getElementById('detalle-contenido');

    let videoYoutubeHtml = '';
    if (p.tipo === 'video' && p.video_url) {
        const videoSrc = `${p.video_url}?autoplay=0&mute=0&controls=1&modestbranding=1&rel=0&playsinline=1`;
        videoYoutubeHtml = `
            <div class="video-detalle">
                <iframe
                    src="${videoSrc}"
                    frameborder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowfullscreen
                    tabindex="-1"
                ></iframe>
            </div>
        `;
    }

    const videosHtml = (p.videos || []).map(src => `
        <div class="galeria-item galeria-item--video" data-src="${src}">
            <video src="${src}" muted preload="metadata" playsinline tabindex="-1"></video>
            <div class="play-btn">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="12" r="11" stroke="currentColor" stroke-width="1.5"/>
                    <path d="M10 8.5L16 12L10 15.5V8.5Z" fill="currentColor"/>
                </svg>
            </div>
        </div>
    `).join('');

    const imagenesHtml = (p.imagenes || []).map(img =>
        `<img src="${img}" alt="${p.titulo}" loading="lazy">`
    ).join('');

    container.innerHTML = `
        <header class="header-proyecto">
            <div class="header-seccion">
                <div class="linea"></div>
                <span class="subtitulo">${p.categoria} • ${p.año}</span>
            </div>
            <h1>${p.titulo}</h1>
            <p class="descripcion">${p.descripcion}</p>
        </header>

        ${videoYoutubeHtml}

        <section class="galeria-masonry">
            ${videosHtml}
            ${imagenesHtml}
        </section>
    `;

    gsap.from('.header-proyecto > *', {
        y: 30,
        opacity: 0,
        duration: 1,
        stagger: 0.2,
        ease: "power2.out"
    });
}
