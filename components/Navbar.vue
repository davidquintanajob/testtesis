<template>
    <!-- Contenedor principal -->
    <div class="relative" ref="navRoot">
        <!-- Botón de toggle (SOLO DESKTOP) - Fijo en la pantalla -->
        <button @click="toggleNav"
            class="hidden md:flex items-center fixed z-50 bg-[#099ebf] text-white rounded-r-full h-16 pr-4 shadow-lg hover:bg-[#077a99] transition-all duration-300 ease-in-out"
            :style="{ left: isNavCollapsed ? '0px' : '255px', right: 'auto', width: isNavCollapsed ? 'auto' : 'auto', top: '200px' }">
            <div class="flex items-center justify-center w-8 h-16">
                <svg xmlns="http://www.w3.org/2000/svg" :class="['h-5 w-5', isChevronAnimating ? 'chevron-wobble' : '']" fill="none" viewBox="0 0 24 24"
                    stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        :d="isNavCollapsed ? 'M13 5l7 7-7 7' : 'M11 19l-7-7 7-7'" />
                </svg>
            </div>
        </button>

        <!-- Barra de navegación -->
        <nav class="fixed top-0 left-0 w-full bg-gradient-to-r from-[#099ebf] to-[#077a99] shadow-lg z-40 md:w-64 md:h-screen md:bg-gradient-to-b transition-all duration-300 ease-in-out"
            :class="{ 'md:transform md:-translate-x-full': isNavCollapsed }" style="--nav-width: 16rem;">

            <div
                class="container mx-auto flex justify-between items-center py-4 px-6 md:flex-col md:items-start md:justify-start md:py-6 md:h-full">
                <div class="hidden md:flex md:items-center relative">
                    <h1 @click="goHome" class="text-white text-3xl md:text-4xl font-sans font-bold tracking-tight mr-4 cursor-pointer select-none">
                        AFTUP
                    </h1>
                    <div class="relative flex flex-col items-center justify-center">
                        <a @click="handlePerfilClick"
                            class="w-12 h-12 rounded-full overflow-hidden border-2 border-white hover:bg-[#099ebf] hover:border-[#077a99] transition flex items-center justify-center cursor-pointer">
                            <img src="/usuario.png" alt="Usuario"
                                class="w-3/4 h-3/4 object-cover transition duration-300 hover:opacity-75 mix-blend-screen invert hover:invert(0)" />
                        </a>
                        <span v-if="isConnected" class="absolute left-1/2 top-full mt-0.5 -translate-x-1/2 px-2 py-0.5 rounded-full text-xs bg-green-600 text-white shadow z-10">Conectado</span>
                        <span v-else class="absolute left-1/2 top-full mt-0.5 -translate-x-1/2 px-2 py-0.5 rounded-full text-xs bg-red-600 text-white shadow z-10">Desconectado</span>
                    </div>
                </div>

                <!-- Logo / Nombre (Móvil) -->
                <h1 @click="goHome" class="text-white text-3xl font-sans font-bold tracking-tight md:hidden cursor-pointer select-none" role="button" tabindex="0">
                    AFTUP
                </h1>

                <!-- Menú hamburguesa (Móvil) -->
                <button @click.stop="toggleMenu"
                    class="md:hidden text-white focus:outline-none transition duration-300">
                    <svg v-if="!isMenuOpen" xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none"
                        viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                    <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24"
                        stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                <!-- Botón de usuario (Móvil) -->
                <a @click.stop="handlePerfilClick"
                    class="w-12 h-12 rounded-full overflow-hidden border-2 border-white hover:bg-[#099ebf] hover:border-[#077a99] transition ml-6 flex items-center justify-center cursor-pointer md:hidden">
                    <div class="relative w-full h-full flex items-center justify-center">
                        <img src="/usuario.png" alt="Usuario"
                            class="w-3/4 h-3/4 object-cover transition duration-300 hover:opacity-75 mix-blend-screen invert hover:invert(0)" />
                        <span v-if="isConnected" class="absolute left-1/2 top-full mt-0.5 -translate-x-1/2 px-2 py-0.5 rounded-full text-xs bg-green-600 text-white shadow z-10">Conectado</span>
                        <span v-else class="absolute left-1/2 top-full mt-0.5 -translate-x-1/2 px-2 py-0.5 rounded-full text-xs bg-red-600 text-white shadow z-10">Desconectado</span>
                    </div>
                </a>

                <!-- Botones de navegación (Escritorio) usando NuxtLink para navegación instantánea -->
                <div class="hidden md:flex flex-col w-full md:mt-4 overflow-y-auto" style="max-height: calc(100vh - 200px);">
                    <div class="flex flex-col space-y-4 w-full">
                        <NuxtLink v-for="(option, index) in visibleOptions" :key="index"
                            :to="option.link"
                            class="text-white flex items-center px-4 py-3 rounded-lg border border-white transition group hover:bg-[#099ebf] hover:text-white"
                            @click.prevent="handleProtectedNavigation(option.link)">
                            <svg v-if="option.src === 'home'" class="w-6 h-6 mr-2 text-white group-hover:text-[#099ebf] transition-all duration-300" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                            </svg>
                            <svg v-else-if="option.src === 'arrows'" class="w-6 h-6 mr-2 text-white group-hover:text-[#099ebf] transition-all duration-300" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                            </svg>
                            <svg v-else-if="option.src === 'trash'" class="w-6 h-6 mr-2 text-white group-hover:text-[#099ebf] transition-all duration-300" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            <svg v-else-if="option.src === 'checklist'" class="w-6 h-6 mr-2 text-white group-hover:text-[#099ebf] transition-all duration-300" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                            </svg>
                            <svg v-else-if="option.src === 'chat'" class="w-6 h-6 mr-2 text-white group-hover:text-[#099ebf] transition-all duration-300" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                            </svg>
                            <img v-else :src="option.src" alt="" class="w-6 h-6 mr-2 invert group-hover:invert-0 transition-all duration-300">
                            <span class="text-[15px]">{{ option.label }}</span>
                        </NuxtLink>
                    </div>

                    <div class="mt-6 pt-4 border-t border-white/20">
                        <button
                            type="button"
                            @click="handleLogout"
                            class="w-full flex items-center justify-center gap-3 rounded-xl bg-rose-600/90 px-4 py-3 text-sm font-semibold text-white shadow-lg ring-1 ring-white/20 hover:bg-rose-700 transition-all duration-200"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                            <span>Cerrar sesión</span>
                        </button>
                    </div>
                </div>
            </div>

            <!-- Overlay para el menú de usuario -->
            <div v-if="isUserMenuOpen" class="fixed inset-0 z-50" @click="isUserMenuOpen = false">
                <div class="fixed top-0 right-0 w-64 h-screen bg-[#077a99] p-4 space-y-2 transform transition-all duration-300 ease-in-out z-50"
                    :style="{ transform: isUserMenuOpen ? 'translateX(0)' : 'translateX(100%)' }" @click.stop>
                    <NuxtLink to="/perfil"
                        class="group flex items-center text-white py-2 rounded-lg hover:bg-[#099ebf] transition hover:text-white"
                        @click="handleMenuClose">
                        <img src="/perfil.png" alt="Perfil"
                            class="w-6 h-6 mr-2 invert group-hover:invert-0 transition-all duration-300" />
                        Mi Perfil
                    </NuxtLink>
                    <hr class="border-white/30" />
                    <a href="#"
                        class="group flex items-center text-white py-2 rounded-lg hover:bg-[#099ebf] transition hover:text-white"
                        @click.prevent="handleLogout">
                        <img src="/cerrar-sesion.png" alt="Cerrar Sesión"
                            class="w-6 h-6 mr-2 invert group-hover:invert-0 transition-all duration-300" />
                        Cerrar Sesión
                    </a>
                </div>
            </div>

            <!-- Menú desplegable (Móvil) usando NuxtLink -->
            <div v-if="isMenuOpen"
                class="md:hidden fixed top-16 left-0 w-full bg-[#077a99] p-4 space-y-2 transform transition-all duration-300 ease-in-out z-50 overflow-auto">
                <NuxtLink v-for="(option, index) in visibleOptions" :key="index"
                    :to="option.link"
                    class="flex items-center block text-white text-center py-2 rounded-lg transition group hover:bg-[#099ebf]"
                    @click.prevent="handleProtectedNavigation(option.link)">
                    <svg v-if="option.src === 'home'" class="w-6 h-6 mr-2 text-white group-hover:text-[#099ebf] transition-all duration-300" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                    <svg v-else-if="option.src === 'arrows'" class="w-6 h-6 mr-2 text-white group-hover:text-[#099ebf] transition-all duration-300" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                    </svg>
                    <svg v-else-if="option.src === 'trash'" class="w-6 h-6 mr-2 text-white group-hover:text-[#099ebf] transition-all duration-300" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    <svg v-else-if="option.src === 'checklist'" class="w-6 h-6 mr-2 text-white group-hover:text-[#099ebf] transition-all duration-300" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                    </svg>
                    <svg v-else-if="option.src === 'chat'" class="w-6 h-6 mr-2 text-white group-hover:text-[#099ebf] transition-all duration-300" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                    </svg>
                    <img v-else :src="option.src" alt="" class="w-6 h-6 mr-2 invert group-hover:invert-0 transition-all duration-300">
                    <span>{{ option.label }}</span>
                </NuxtLink>

                <div class="mt-4 pt-4 border-t border-white/20">
                    <button
                        type="button"
                        @click="handleLogout"
                        class="w-full flex items-center justify-center gap-3 rounded-xl bg-rose-600/90 px-4 py-3 text-sm font-semibold text-white shadow-lg ring-1 ring-white/20 hover:bg-rose-700 transition-all duration-200"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        <span>Cerrar sesión</span>
                    </button>
                </div>
            </div>
        </nav>
    </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from "vue";
import { navigateTo } from 'nuxt/app';

const navRoot = ref(null);

// Estado del navbar colapsado (solo desktop)
const isNavCollapsed = ref(true);

// Controla el estado del menú de usuario y del menú móvil
const isMenuOpen = ref(false);
const isUserMenuOpen = ref(false);

// Estado de conexión
const isConnected = ref(false);

// Chevron wobble animation state
const isChevronAnimating = ref(false);
let chevronInterval = null;

// Función para alternar el estado del navbar
const toggleNav = () => {
    isNavCollapsed.value = !isNavCollapsed.value;
    if (!isNavCollapsed.value) startInactivityTimer(); else clearInactivityTimer();
};
//["Jefe de Área", "Responsable de Área", "Administrador", "Especialista"]

// Opciones de navegación (sin cambios en la lógica de negocio)
const options = [
    { label: "Mi Área", src: "home", link: "/miarea", roles: ["Jefe de Área", "Responsable de Área", "Administrador", "Especialista"] },
    { label: "Movimientos", src: "arrows", link: "/traslados", roles: ["Jefe de Área", "Responsable de Área", "Administrador", "Especialista"] },
    { label: "Bajas", src: "trash", link: "/bajas", roles: ["Jefe de Área", "Responsable de Área", "Administrador", "Especialista"] },
    { label: "Revisiones", src: "checklist", link: "/revisiones", roles: ["Jefe de Área", "Responsable de Área", "Administrador", "Especialista"] },
    { label: "Archivos enviados y recibidos", src: "chat", link: "/archivos", roles: ["Jefe de Área", "Responsable de Área", "Administrador", "Especialista"] },
    { label: "Usuario", src: "/usuarios.png", link: "/usuarios", roles: ["Administrador"] }
];

const DEFAULT_ROLES = ["Administrador", "Comercial", "Invitado", "Vendedor"];

// Normalizar opciones
for (let i = 0; i < options.length; i++) {
    const opt = options[i];
    if (!opt || !opt.roles || !Array.isArray(opt.roles)) {
        options[i] = { ...opt, roles: DEFAULT_ROLES };
    }
}

const toggleUserMenu = () => {
    isUserMenuOpen.value = !isUserMenuOpen.value;
    if (isUserMenuOpen.value) startInactivityTimer(); else clearInactivityTimer();
};

const toggleMenu = () => {
    isMenuOpen.value = !isMenuOpen.value;
    if (isMenuOpen.value) startInactivityTimer(); else clearInactivityTimer();
};

const hasUserSession = () => {
    if (typeof window === 'undefined') return false;
    try {
        return Boolean(localStorage.getItem('usuario'));
    } catch (error) {
        return false;
    }
};

const handleProtectedNavigation = (targetPath) => {
    if (!hasUserSession()) {
        handleMenuClose();
        navigateTo('/login');
        return;
    }

    handleMenuClose();
    navigateTo(targetPath);
};

// Cierra todos los menús después de navegar (para una experiencia fluida)
const handleMenuClose = () => {
    isNavCollapsed.value = true;
    isMenuOpen.value = false;
    isUserMenuOpen.value = false;
    clearInactivityTimer();
};

function goHome() {
    if (!hasUserSession()) {
        navigateTo('/login');
    } else {
        navigateTo('/');
    }
    handleMenuClose();
}

function handleLogout() {
    localStorage.clear();
    isConnected.value = false;
    handleMenuClose();
    navigateTo('/login');
}

function handlePerfilClick() {
    const usuario = localStorage.getItem('usuario');
    handleMenuClose();
    if (usuario) {
        navigateTo('/perfil');
    } else {
        navigateTo('/login');
    }
}

// Verifica si el rol del usuario tiene acceso a la opción
const isOptionVisible = (option) => {
    try {
        const usuarioStr = localStorage.getItem('usuario');
        if (!usuarioStr) return true;
        if (!option) return false;
        const usuario = JSON.parse(usuarioStr);
        const rawRole = usuario && (usuario.rol || usuario.role || usuario.perfil?.rol || usuario.profile?.role);
        if (!rawRole) return true;
        const role = String(rawRole).trim().toLowerCase();
        let normalizedRoles;
        if (!option.roles || !Array.isArray(option.roles)) {
            normalizedRoles = DEFAULT_ROLES.map(r => String(r).trim().toLowerCase());
        } else {
            normalizedRoles = option.roles.map(r => String(r).trim().toLowerCase());
        }
        return normalizedRoles.includes(role);
    } catch (e) {
        console.warn('isOptionVisible error', e);
        return true;
    }
};

const visibleOptions = computed(() => {
    try {
        return options.filter(opt => isOptionVisible(opt));
    } catch (e) {
        console.warn('visibleOptions compute error', e);
        return options;
    }
});

// Inactivity timer (10 segundos)
let inactivityTimeout = null;
const INACTIVITY_MS = 10000;

function clearInactivityTimer() {
    if (inactivityTimeout) {
        clearTimeout(inactivityTimeout);
        inactivityTimeout = null;
    }
}

function startInactivityTimer() {
    clearInactivityTimer();
    if (!isNavCollapsed.value || isMenuOpen.value || isUserMenuOpen.value) {
        inactivityTimeout = setTimeout(() => {
            isNavCollapsed.value = true;
            isMenuOpen.value = false;
            isUserMenuOpen.value = false;
            inactivityTimeout = null;
        }, INACTIVITY_MS);
    }
}

function resetInactivityTimer() {
    if (!isNavCollapsed.value || isMenuOpen.value || isUserMenuOpen.value) {
        startInactivityTimer();
    }
}

let onDocClick = null;
let onKeydown = null;

onMounted(() => {
    const hasVisited = localStorage.getItem('hasVisitedNavbar');
    if (!hasVisited) {
        isNavCollapsed.value = false;
        localStorage.setItem('hasVisitedNavbar', 'true');
    }
    isConnected.value = hasUserSession();

    onDocClick = (e) => {
        if (!navRoot.value) return;
        const target = e.target || e;
        if (!navRoot.value.contains(target)) {
            if (!isNavCollapsed.value) isNavCollapsed.value = true;
            if (isMenuOpen.value) isMenuOpen.value = false;
            if (isUserMenuOpen.value) isUserMenuOpen.value = false;
        }
    };

    onKeydown = (e) => {
        if (e.key === 'Escape' || e.key === 'Esc') {
            if (!isNavCollapsed.value) isNavCollapsed.value = true;
            if (isMenuOpen.value) isMenuOpen.value = false;
            if (isUserMenuOpen.value) isUserMenuOpen.value = false;
        }
    };

    document.addEventListener('click', onDocClick);
    document.addEventListener('touchstart', onDocClick);
    document.addEventListener('keydown', onKeydown);
    if (navRoot.value && navRoot.value.addEventListener) {
        navRoot.value.addEventListener('click', resetInactivityTimer);
        navRoot.value.addEventListener('touchstart', resetInactivityTimer);
    }

    chevronInterval = setInterval(() => {
        if (isNavCollapsed.value) {
            isChevronAnimating.value = true;
            setTimeout(() => { isChevronAnimating.value = false; }, 1200);
        }
    }, 5000);
});

onUnmounted(() => {
    if (onDocClick) {
        document.removeEventListener('click', onDocClick);
        document.removeEventListener('touchstart', onDocClick);
    }
    if (onKeydown) {
        document.removeEventListener('keydown', onKeydown);
    }
    if (navRoot.value && navRoot.value.removeEventListener) {
        navRoot.value.removeEventListener('click', resetInactivityTimer);
        navRoot.value.removeEventListener('touchstart', resetInactivityTimer);
    }
    clearInactivityTimer();
    if (chevronInterval) {
        clearInterval(chevronInterval);
        chevronInterval = null;
    }
});
</script>

<style scoped>
.chevron-wobble {
    animation: chevron-wobble 1.2s cubic-bezier(.36, .07, .19, .97);
    transform-origin: center;
    filter: drop-shadow(0 6px 8px rgba(0,0,0,0.15));
}

@keyframes chevron-wobble {
    0% { transform: translateX(0) rotate(0deg) scale(1); }
    12% { transform: translateX(-6px) rotate(-12deg) scale(1.05); }
    25% { transform: translateX(10px) rotate(14deg) scale(1.08); }
    45% { transform: translateX(-8px) rotate(-8deg) scale(1.03); }
    65% { transform: translateX(6px) rotate(6deg) scale(1.02); }
    85% { transform: translateX(-3px) rotate(-3deg) scale(1.01); }
    100% { transform: translateX(0) rotate(0deg) scale(1); }
}

/* Estilos para la barra de scroll */
.overflow-y-auto::-webkit-scrollbar {
    width: 8px;
}

.overflow-y-auto::-webkit-scrollbar-track {
    background: rgba(7, 122, 153, 0.3);
    border-radius: 10px;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
    background-color: #099ebf;
    border-radius: 10px;
    border: 2px solid rgba(7, 122, 153, 0.3);
}

.overflow-y-auto {
    scrollbar-width: thin;
    scrollbar-color: #099ebf rgba(7, 122, 153, 0.3);
}
</style>