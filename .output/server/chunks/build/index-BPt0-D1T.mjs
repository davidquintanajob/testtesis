import { ref, computed, mergeProps, watch, nextTick, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrRenderAttr, ssrRenderClass, ssrRenderList, ssrIncludeBooleanAttr } from 'vue/server-renderer';
import { _ as _imports_0 } from './logo-B2DBqTv1.mjs';
import { N as Navbar } from './Navbar-Ds5Ji1IO.mjs';
import { S as SeoMeta, _ as _sfc_main$2 } from './MessageBanner-C3gOLDB5.mjs';
import { _ as _export_sfc } from './server.mjs';
import '../routes/renderer.mjs';
import 'vue-bundle-renderer/runtime';
import '../_/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'node:url';
import 'unhead/server';
import 'devalue';
import 'unhead/utils';
import 'unhead/plugins';
import './nuxt-link-DyRFq4kt.mjs';
import './v3-CPu3I7iP.mjs';
import 'vue-router';

const _sfc_main$1 = {
  __name: "DesktopChatPanel",
  __ssrInlineRender: true,
  emits: ["close", "summary-updated"],
  setup(__props, { emit: __emit }) {
    const users = ref([]);
    const selectedUserId = ref(null);
    const draftMessage = ref("");
    const pendingAttachments = ref([]);
    const isUserListExpanded = ref(true);
    const isAttachmentMenuOpen = ref(false);
    const isMobileView = ref(false);
    const isCameraPreviewOpen = ref(false);
    const isSending = ref(false);
    const cameraError = ref("");
    const searchQuery = ref("");
    const isLoadingUsers = ref(false);
    const isLoadingMessages = ref(false);
    const apiBanner = ref(null);
    ref(null);
    ref(null);
    ref(null);
    ref(null);
    const conversations = ref([]);
    const messagesContainer = ref(null);
    const isImagePreviewOpen = ref(false);
    const previewImageUrl = ref("");
    const previewImageName = ref("");
    ref("T\xFA");
    ref(null);
    const chatSummary = ref({
      total: 0,
      datos: [],
      senderCounts: {}
    });
    const getUserMessageCount = (userId) => {
      var _a;
      const normalizedUserId = String(userId || "").trim();
      if (!normalizedUserId) {
        return 0;
      }
      return ((_a = chatSummary.value.senderCounts) == null ? void 0 : _a[normalizedUserId]) || 0;
    };
    const scrollToBottom = () => {
      if (!messagesContainer.value) {
        return;
      }
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
    };
    const activeUser = computed(() => users.value.find((user) => user.id === selectedUserId.value) || null);
    const activeConversation = computed(() => conversations.value.find((conversation) => conversation.userId === selectedUserId.value) || null);
    const filteredUsers = computed(() => {
      const query = searchQuery.value.trim().toLowerCase();
      if (!query) {
        return users.value;
      }
      return users.value.filter((user) => user.name.toLowerCase().includes(query));
    });
    watch(
      () => {
        var _a;
        return (_a = activeConversation.value) == null ? void 0 : _a.messages.length;
      },
      async () => {
        await nextTick();
        scrollToBottom();
      }
    );
    return (_ctx, _push, _parent, _attrs) => {
      var _a, _b, _c;
      _push(`<!--[--><aside class="${ssrRenderClass([isMobileView.value ? "inset-0 rounded-none" : "hidden md:flex top-4 right-4 h-[calc(100vh-2rem)] w-[min(380px,calc(100vw-2rem))] rounded-2xl", "fixed z-[60] flex flex-col overflow-hidden border border-slate-200 bg-white/95 shadow-[0_18px_60px_-24px_rgba(7,122,153,0.45)] backdrop-blur-sm"])}"><div class="bg-gradient-to-r from-[#099ebf] to-[#077a99] px-4 py-3 text-white"><div class="flex items-center justify-between gap-3"><div><p class="text-sm font-semibold">Chat de soporte</p><p class="text-[11px] text-cyan-50/90">Selecciona un usuario y revisa el historial</p></div><div class="flex items-center gap-2"><button type="button" class="inline-flex items-center gap-1 rounded-full px-3 py-1 text-[11px] font-semibold text-white transition hover:bg-white/20">`);
      if (isUserListExpanded.value) {
        _push(`<svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7"></path></svg>`);
      } else {
        _push(`<svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>`);
      }
      _push(` ${ssrInterpolate(isUserListExpanded.value ? "Contraer" : "Expandir")}</button><button type="button" class="rounded-full p-1.5 text-white/90 transition hover:bg-white/20" aria-label="Cerrar chat"><svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg></button></div></div><div class="mt-3 rounded-2xl bg-white/15 px-3 py-2"><p class="text-[11px] uppercase tracking-[0.2em] text-cyan-50/80">Conversando con</p><div class="mt-1 flex items-center justify-between gap-3"><div><p class="text-sm font-semibold">${ssrInterpolate(((_a = activeUser.value) == null ? void 0 : _a.name) || "Selecciona un usuario")}</p><p class="text-xs text-cyan-50/90">${ssrInterpolate(((_b = activeUser.value) == null ? void 0 : _b.role) || "Para abrir el chat")}</p></div><span class="rounded-full bg-white/15 px-2.5 py-1 text-[11px] font-semibold text-white">${ssrInterpolate(((_c = activeConversation.value) == null ? void 0 : _c.messages.length) || 0)} mensajes </span></div></div></div><div class="border-b border-slate-100 bg-slate-50"><div class="flex items-center justify-between px-4 py-3"><p class="text-sm font-semibold text-slate-700">Usuarios disponibles</p><span class="text-[11px] font-semibold text-slate-500">${ssrInterpolate(isUserListExpanded.value ? "Mostrando lista" : "Lista ocultada")}</span></div>`);
      if (isUserListExpanded.value) {
        _push(`<div class="px-4 pb-4"><div class="mb-3 flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2"><svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 104.5 4.5a7.5 7.5 0 0012.15 12.15z"></path></svg><input id="chat-user-search"${ssrRenderAttr("value", searchQuery.value)} type="search" placeholder="Buscar por nombre" class="w-full border-0 bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"></div>`);
        if (apiBanner.value) {
          _push(ssrRenderComponent(_sfc_main$2, {
            title: apiBanner.value.title,
            description: apiBanner.value.description,
            type: apiBanner.value.type,
            onClose: ($event) => apiBanner.value = null,
            class: "mb-3"
          }, null, _parent));
        } else {
          _push(`<!---->`);
        }
        _push(`<div class="max-h-52 space-y-2 overflow-y-auto pr-1">`);
        if (isLoadingUsers.value) {
          _push(`<div class="rounded-xl bg-white px-3 py-3 text-sm text-slate-500"> Cargando usuarios... </div>`);
        } else if (filteredUsers.value.length === 0) {
          _push(`<div class="rounded-xl bg-white px-3 py-3 text-sm text-slate-500"> No se encontraron usuarios. </div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<!--[-->`);
        ssrRenderList(filteredUsers.value, (user) => {
          _push(`<button type="button" class="${ssrRenderClass([selectedUserId.value === user.id ? "border-[#099ebf] bg-cyan-50" : "border-transparent bg-white hover:border-cyan-100", "flex w-full items-center gap-3 rounded-xl border px-3 py-2 text-left transition"])}"><span class="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#099ebf] to-[#077a99] text-sm font-bold text-white">${ssrInterpolate(user.initials)}</span><span class="flex-1"><span class="block text-sm font-semibold text-slate-800">${ssrInterpolate(user.name)}</span><span class="block text-xs text-slate-500">${ssrInterpolate(user.role)}</span></span><span class="flex flex-col items-end gap-1"><span class="rounded-full bg-emerald-100 px-2 py-1 text-[10px] font-semibold text-emerald-700">${ssrInterpolate(user.status)}</span>`);
          if (getUserMessageCount(user.id) > 0) {
            _push(`<span class="rounded-full bg-rose-100 px-2 py-1 text-[10px] font-bold text-rose-700">${ssrInterpolate(getUserMessageCount(user.id))} mensaje${ssrInterpolate(getUserMessageCount(user.id) > 1 ? "s" : "")}</span>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</span></button>`);
        });
        _push(`<!--]--></div></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div><div class="flex-1 overflow-hidden bg-white"><div class="flex h-full flex-col"><div class="flex-1 overflow-y-auto bg-[radial-gradient(circle_at_top,_rgba(9,158,191,0.08),_transparent_45%)] px-4 py-4">`);
      if (!selectedUserId.value) {
        _push(`<div class="flex h-full items-center justify-center text-center text-sm text-slate-500"> Selecciona a un usuario para ver el historial y comenzar a chatear. </div>`);
      } else if (isLoadingMessages.value) {
        _push(`<div class="flex h-full items-center justify-center text-center text-sm text-slate-500"> Cargando historial del usuario... </div>`);
      } else if (!activeConversation.value || !activeConversation.value.messages.length) {
        _push(`<div class="flex h-full items-center justify-center text-center text-sm text-slate-500"> No hay mensajes disponibles para este usuario. </div>`);
      } else {
        _push(`<div class="space-y-3"><!--[-->`);
        ssrRenderList(activeConversation.value.messages, (message) => {
          var _a2;
          _push(`<div class="${ssrRenderClass([message.sender === "me" ? "ml-auto" : "", "max-w-[90%]"])}"><div class="${ssrRenderClass([message.specialType ? "border border-[#099ebf]/20 bg-gradient-to-br from-cyan-50 to-white text-slate-800" : message.sender === "me" ? "bg-[#099ebf] text-white" : "bg-slate-100 text-slate-800", "rounded-2xl px-3 py-2 text-sm shadow-sm"])}">`);
          if (message.specialType) {
            _push(`<div class="space-y-2"><div class="flex items-start gap-3"><div class="mt-0.5 inline-flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-[#099ebf]/10 text-[#099ebf]">`);
            if (message.specialType === "Traslado") {
              _push(`<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"></path></svg>`);
            } else if (message.specialType === "Baja") {
              _push(`<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>`);
            } else {
              _push(`<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path></svg>`);
            }
            _push(`</div><div class="flex-1"><div class="flex flex-wrap items-center gap-2"><p class="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#077a99]">${ssrInterpolate(message.specialType)}</p><span class="rounded-full bg-white px-2 py-0.5 text-[10px] font-semibold text-slate-600">Mensaje especial</span></div>`);
            if (message.text) {
              _push(`<p class="mt-1 leading-relaxed">${ssrInterpolate(message.text)}</p>`);
            } else {
              _push(`<p class="mt-1 text-sm italic text-slate-500">Sin descripci\xF3n disponible.</p>`);
            }
            _push(`</div></div></div>`);
          } else if (message.text) {
            _push(`<p class="leading-relaxed">${ssrInterpolate(message.text)}</p>`);
          } else {
            _push(`<!---->`);
          }
          if ((_a2 = message.attachments) == null ? void 0 : _a2.length) {
            _push(`<div class="mt-2 space-y-2"><!--[-->`);
            ssrRenderList(message.attachments, (attachment, attachmentIndex) => {
              _push(`<div class="space-y-2">`);
              if (attachment.type === "image" && attachment.url) {
                _push(`<div class="overflow-hidden rounded-xl border border-white/40"><button type="button" class="block w-full"><img${ssrRenderAttr("src", attachment.url)} alt="Adjunto" class="max-h-40 w-full object-cover"></button><div class="flex justify-end px-2 pb-2 pt-2"><button type="button" class="inline-flex items-center gap-1 rounded-lg bg-white/80 px-2 py-1 text-[11px] font-semibold text-slate-800 transition hover:bg-white"><svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5 5-5M12 15V3"></path></svg> Descargar foto </button></div></div>`);
              } else {
                _push(`<div class="${ssrRenderClass([message.sender === "me" ? "text-cyan-50" : "text-slate-700", "flex flex-wrap items-center gap-2 rounded-xl bg-white/15 px-3 py-2 text-xs"])}"><svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path></svg><span class="truncate">${ssrInterpolate(attachment.name)}</span><button type="button" class="inline-flex items-center gap-1 rounded-lg bg-white/20 px-2 py-1 font-semibold transition hover:bg-white/30"><svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5 5-5M12 15V3"></path></svg> Descargar </button></div>`);
              }
              _push(`</div>`);
            });
            _push(`<!--]--></div>`);
          } else {
            _push(`<!---->`);
          }
          _push(`<div class="mt-2 flex items-end justify-between gap-3 text-[10px] opacity-80"><div class="flex items-center gap-2"><span>${ssrInterpolate(message.time)}</span>`);
          if (message.sender === "me") {
            _push(`<span class="inline-flex items-center gap-0.5"${ssrRenderAttr("title", message.status === "visto" ? "Visto" : "No visto")}>`);
            if (message.status === "visto") {
              _push(`<svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5 text-cyan-100" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 18l7-7"></path></svg>`);
            } else {
              _push(`<svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5 text-cyan-100" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>`);
            }
            _push(`</span>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div><span>${ssrInterpolate(message.senderName)}</span></div></div></div>`);
        });
        _push(`<!--]--></div>`);
      }
      _push(`</div><div class="border-t border-slate-100 bg-white px-4 py-3">`);
      if (pendingAttachments.value.length) {
        _push(`<div class="mb-3 space-y-2"><!--[-->`);
        ssrRenderList(pendingAttachments.value, (attachment, index2) => {
          _push(`<div class="rounded-xl border border-[#099ebf]/20 bg-cyan-50 px-3 py-2"><div class="flex items-center justify-between gap-3"><div class="flex items-center gap-2 text-sm text-slate-700"><span class="rounded-lg bg-white px-2 py-1 text-[10px] font-semibold text-[#099ebf]">${ssrInterpolate(attachment.type === "image" ? "Foto" : "Archivo")}</span><span class="truncate">${ssrInterpolate(attachment.name)}</span></div><button type="button" class="text-slate-500 transition hover:text-slate-800" aria-label="Quitar adjunto"><svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg></button></div>`);
          if (attachment.type === "image" && attachment.url) {
            _push(`<img${ssrRenderAttr("src", attachment.url)} alt="Vista previa" class="mt-2 h-20 w-full rounded-lg object-cover">`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div>`);
        });
        _push(`<!--]--></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<div class="flex items-end gap-2"><div class="flex-1"><label for="chat-input" class="sr-only">Escribe un mensaje</label><input id="chat-input"${ssrRenderAttr("value", draftMessage.value)} type="text" placeholder="Escribe un mensaje..." class="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-[#099ebf] focus:bg-white"></div><div class="relative"><button type="button" class="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700 transition hover:bg-slate-200" title="Adjuntar foto o archivo"><svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.586-6.586a4 4 0 10-5.657-5.657l-6.586 6.586a6 6 0 108.485 8.485L19 14"></path></svg></button>`);
      if (isAttachmentMenuOpen.value) {
        _push(`<div class="absolute bottom-full right-0 mb-2 w-48 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg"><button type="button" class="flex w-full items-center gap-2 px-3 py-2 text-sm text-slate-700 transition hover:bg-slate-50"><svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0111.07 4h1.86a2 2 0 011.664.89l.812 1.22A2 2 0 0017.07 7H18a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path></svg> Tomar foto </button><button type="button" class="flex w-full items-center gap-2 border-t border-slate-100 px-3 py-2 text-sm text-slate-700 transition hover:bg-slate-50"><svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path></svg> Subir archivo </button></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div><input type="file" multiple accept="image/*,.pdf,.doc,.docx,.xlsx,.csv,.txt" class="hidden"><button type="button"${ssrIncludeBooleanAttr(isSending.value || !draftMessage.value.trim() && !pendingAttachments.value.length) ? " disabled" : ""} class="inline-flex h-10 items-center justify-center rounded-xl bg-[#099ebf] px-4 text-sm font-semibold text-white transition hover:bg-[#077a99] disabled:cursor-not-allowed disabled:bg-slate-300">${ssrInterpolate(isSending.value ? "Enviando..." : "Enviar")}</button></div></div></div></div></aside>`);
      if (isImagePreviewOpen.value) {
        _push(`<div class="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/85 p-4"><div class="w-full max-w-3xl rounded-2xl bg-white p-4 shadow-2xl"><div class="flex items-center justify-between gap-3"><div><p class="text-sm font-semibold text-slate-800">Vista previa de imagen</p><p class="text-xs text-slate-500">${ssrInterpolate(previewImageName.value)}</p></div><button type="button" class="rounded-full p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800" aria-label="Cerrar vista previa"><svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg></button></div><div class="mt-3 overflow-hidden rounded-2xl bg-slate-100">`);
        if (previewImageUrl.value) {
          _push(`<img${ssrRenderAttr("src", previewImageUrl.value)}${ssrRenderAttr("alt", previewImageName.value)} class="max-h-[70vh] w-full object-contain">`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div></div></div>`);
      } else {
        _push(`<!---->`);
      }
      if (isCameraPreviewOpen.value) {
        _push(`<div class="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/80 p-4"><div class="w-full max-w-md rounded-2xl bg-white p-4 shadow-2xl"><div class="flex items-center justify-between gap-3"><div><p class="text-sm font-semibold text-slate-800">C\xE1mara</p><p class="text-xs text-slate-500">Ajusta el encuadre y toma la foto.</p></div><button type="button" class="rounded-full p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800" aria-label="Cerrar c\xE1mara"><svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg></button></div><div class="mt-3 overflow-hidden rounded-2xl bg-slate-100"><video autoplay playsinline class="aspect-video w-full object-cover"></video><canvas class="hidden"></canvas></div>`);
        if (cameraError.value) {
          _push(`<p class="mt-3 text-sm text-rose-600">${ssrInterpolate(cameraError.value)}</p>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<div class="mt-4 flex gap-2"><button type="button" class="flex-1 rounded-xl bg-[#099ebf] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#077a99]"> Capturar foto </button><button type="button" class="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"> Cancelar </button></div></div></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<!--]-->`);
    };
  }
};
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/DesktopChatPanel.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const _sfc_main = {
  __name: "index",
  __ssrInlineRender: true,
  setup(__props) {
    const isChatOpen = ref(false);
    const closeChat = () => {
      isChatOpen.value = false;
    };
    const isVendedor = computed(() => {
      try {
        if (true) return false;
        const usuarioStr = localStorage.getItem("usuario");
        if (!usuarioStr) return false;
        const usuarioObj = JSON.parse(usuarioStr);
        const rawRole = (usuarioObj == null ? void 0 : usuarioObj.rol) || (usuarioObj == null ? void 0 : usuarioObj.role) || (usuarioObj == null ? void 0 : usuarioObj.perfil) || (usuarioObj == null ? void 0 : usuarioObj.profile);
        if (!rawRole) return false;
        return String(rawRole).trim().toLowerCase() === "vendedor";
      } catch (e) {
        return false;
      }
    });
    const verificationBanner = ref(null);
    const activosProximosCount = ref(0);
    const chatMessagesCount = ref(0);
    const handleChatSummaryUpdate = (summary) => {
      chatMessagesCount.value = Number((summary == null ? void 0 : summary.count) || 0);
    };
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "min-h-screen flex flex-col bg-gradient-to-br from-[#e6f7f9] via-[#f0fafc] to-white" }, _attrs))} data-v-5f6bf274>`);
      _push(ssrRenderComponent(SeoMeta, {
        title: "AFTUP - Gesti\xF3n de Activos Fijos Tangibles y \xDAtiles | Universidad de Sancti Sp\xEDritus",
        description: "Plataforma integral para la gesti\xF3n de los procesos de los activos fijos tangibles y \xFAtiles de la Universidad Jos\xE9 Mart\xED P\xE9rez de Sancti Sp\xEDritus.",
        canonical: "/"
      }, null, _parent));
      _push(ssrRenderComponent(Navbar, null, null, _parent));
      _push(`<button type="button" class="fixed z-[55] right-4 top-16 inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#099ebf] text-white shadow-lg transition hover:bg-[#077a99] md:top-4" aria-label="Abrir chat" data-v-5f6bf274><svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" data-v-5f6bf274><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h8M8 14h5m4 5l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3z" data-v-5f6bf274></path></svg>`);
      if (chatMessagesCount.value > 0) {
        _push(`<span class="absolute -right-1 -top-1 inline-flex min-w-6 items-center justify-center rounded-full bg-rose-600 px-1.5 py-0.5 text-[10px] font-bold text-white" data-v-5f6bf274>${ssrInterpolate(chatMessagesCount.value)}</span>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</button>`);
      if (isChatOpen.value) {
        _push(ssrRenderComponent(_sfc_main$1, {
          onClose: closeChat,
          onSummaryUpdated: handleChatSummaryUpdate
        }, null, _parent));
      } else {
        _push(`<!---->`);
      }
      if (verificationBanner.value) {
        _push(`<div class="fixed top-6 left-1/2 transform -translate-x-1/2 z-[9999] w-full max-w-md px-4 pointer-events-none" data-v-5f6bf274>`);
        _push(ssrRenderComponent(_sfc_main$2, {
          title: verificationBanner.value.title,
          description: verificationBanner.value.description,
          type: verificationBanner.value.type,
          persistent: verificationBanner.value.persistent,
          onClose: ($event) => verificationBanner.value = null,
          class: "pointer-events-auto"
        }, null, _parent));
        _push(`</div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<div class="mt-8 md:mt-0 flex-1 flex flex-col" data-v-5f6bf274><header class="flex flex-col items-center justify-center py-12" data-v-5f6bf274><img${ssrRenderAttr("src", _imports_0)} alt="Logo Universidad de Sancti Sp\xEDritus" class="h-40 w-40 shadow-md mb-4" data-v-5f6bf274><h1 class="text-3xl md:text-4xl lg:text-5xl font-extrabold text-[#099ebf] mb-2 text-center drop-shadow" data-v-5f6bf274> Activos Fijos Tangibles y \xDAtiles Procesos </h1><h2 class="text-xl md:text-2xl text-[#077a99] text-center" data-v-5f6bf274> Software para la gesti\xF3n integral de los procesos </h2></header><section class="flex-1 flex flex-col items-center justify-center px-4" data-v-5f6bf274><div class="grid grid-cols-1 md:grid-cols-5 gap-8 max-w-7xl w-full mb-12" data-v-5f6bf274><div class="${ssrRenderClass([isVendedor.value ? "pointer-events-none opacity-60 cursor-not-allowed" : "cursor-pointer hover:shadow-lg", "bg-white rounded-xl shadow p-6 flex flex-col items-center transition group"])}" data-v-5f6bf274><svg class="h-12 w-12 text-[#099ebf] mb-4 group-hover:text-[#077a99] transition" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" data-v-5f6bf274><path stroke-linecap="round" stroke-linejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" data-v-5f6bf274></path></svg><h3 class="text-xl font-semibold text-[#099ebf] mb-2" data-v-5f6bf274>Mi \xC1rea</h3><p class="text-gray-600 text-center" data-v-5f6bf274>Accede a tu espacio personal y gesti\xF3n de activos.</p></div><div class="${ssrRenderClass([isVendedor.value ? "pointer-events-none opacity-60 cursor-not-allowed" : "cursor-pointer hover:shadow-lg", "bg-white rounded-xl shadow p-6 flex flex-col items-center transition group relative"])}" data-v-5f6bf274>`);
      if (activosProximosCount.value > 0) {
        _push(`<div class="absolute -top-2 -right-2 bg-red-600 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center shadow-lg" data-v-5f6bf274>${ssrInterpolate(activosProximosCount.value)}</div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<svg class="h-12 w-12 text-[#099ebf] mb-4 group-hover:text-[#077a99] transition" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" data-v-5f6bf274><path stroke-linecap="round" stroke-linejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" data-v-5f6bf274></path></svg><h3 class="text-xl font-semibold text-[#099ebf] mb-2" data-v-5f6bf274>Movimientos</h3><p class="text-gray-600 text-center" data-v-5f6bf274>Gestiona movimientos y transferencias de activos.</p></div><div class="${ssrRenderClass([isVendedor.value ? "pointer-events-none opacity-60 cursor-not-allowed" : "cursor-pointer hover:shadow-lg", "bg-white rounded-xl shadow p-6 flex flex-col items-center transition group"])}" data-v-5f6bf274><svg class="h-12 w-12 text-[#099ebf] mb-4 group-hover:text-[#077a99] transition" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" data-v-5f6bf274><path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" data-v-5f6bf274></path></svg><h3 class="text-xl font-semibold text-[#099ebf] mb-2" data-v-5f6bf274>Bajas</h3><p class="text-gray-600 text-center" data-v-5f6bf274>Registra y administra activos dados de baja.</p></div><div class="bg-white rounded-xl shadow p-6 flex flex-col items-center hover:shadow-lg transition cursor-pointer group" data-v-5f6bf274><svg class="h-12 w-12 text-[#099ebf] mb-4 group-hover:text-[#077a99] transition" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" data-v-5f6bf274><path stroke-linecap="round" stroke-linejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" data-v-5f6bf274></path></svg><h3 class="text-xl font-semibold text-[#099ebf] mb-2" data-v-5f6bf274>Revisiones</h3><p class="text-gray-600 text-center" data-v-5f6bf274>Control de inspecciones y mantenimiento.</p></div><div class="${ssrRenderClass([isVendedor.value ? "pointer-events-none opacity-60 cursor-not-allowed" : "cursor-pointer hover:shadow-lg", "bg-white rounded-xl shadow p-6 flex flex-col items-center transition group"])}" data-v-5f6bf274><svg class="h-12 w-12 text-[#099ebf] mb-4 group-hover:text-[#077a99] transition" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" data-v-5f6bf274><path stroke-linecap="round" stroke-linejoin="round" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" data-v-5f6bf274></path></svg><h3 class="text-xl font-semibold text-[#099ebf] mb-2" data-v-5f6bf274>Archivos enviados y recibidos</h3><p class="text-gray-600 text-center" data-v-5f6bf274>Documentaci\xF3n y correspondencia de activos.</p></div></div><button class="mt-4 px-8 py-3 bg-[#099ebf] text-white text-lg font-semibold rounded-full shadow hover:bg-[#077a99] transition" data-v-5f6bf274>Iniciar sesi\xF3n</button></section><footer class="w-full py-6 text-center text-gray-500 text-sm bg-transparent mt-auto" data-v-5f6bf274> \xA9 ${ssrInterpolate((/* @__PURE__ */ new Date()).getFullYear())} AFTUP - Universidad de Sancti Sp\xEDritus \u201CJos\xE9 Mart\xED P\xE9rez\u201D. </footer></div></div>`);
    };
  }
};
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const index = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-5f6bf274"]]);

export { index as default };
//# sourceMappingURL=index-BPt0-D1T.mjs.map
