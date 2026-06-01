<template>
  <aside
    class="fixed z-[60] flex flex-col overflow-hidden border border-slate-200 bg-white/95 shadow-[0_18px_60px_-24px_rgba(7,122,153,0.45)] backdrop-blur-sm"
    :class="isMobileView
      ? 'inset-0 rounded-none'
      : 'hidden md:flex top-4 right-4 h-[calc(100vh-2rem)] w-[min(380px,calc(100vw-2rem))] rounded-2xl'"
  >
    <div class="bg-gradient-to-r from-[#099ebf] to-[#077a99] px-4 py-3 text-white">
      <div class="flex items-center justify-between gap-3">
        <div>
          <p class="text-sm font-semibold">Chat de soporte</p>
          <p class="text-[11px] text-cyan-50/90">Selecciona un usuario y revisa el historial</p>
        </div>
        <div class="flex items-center gap-2">
          <button
            type="button"
            @click="isUserListExpanded = !isUserListExpanded"
            class="inline-flex items-center gap-1 rounded-full px-3 py-1 text-[11px] font-semibold text-white transition hover:bg-white/20"
          >
            <svg v-if="isUserListExpanded" xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
            </svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
            {{ isUserListExpanded ? 'Contraer' : 'Expandir' }}
          </button>
          <button
            type="button"
            @click="$emit('close')"
            class="rounded-full p-1.5 text-white/90 transition hover:bg-white/20"
            aria-label="Cerrar chat"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      <div class="mt-3 rounded-2xl bg-white/15 px-3 py-2">
        <p class="text-[11px] uppercase tracking-[0.2em] text-cyan-50/80">Conversando con</p>
        <div class="mt-1 flex items-center justify-between gap-3">
          <div>
            <p class="text-sm font-semibold">{{ activeUser?.name || 'Selecciona un usuario' }}</p>
            <p class="text-xs text-cyan-50/90">{{ activeUser?.role || 'Para abrir el chat' }}</p>
          </div>
          <span class="rounded-full bg-white/15 px-2.5 py-1 text-[11px] font-semibold text-white">
            {{ activeConversation?.messages.length || 0 }} mensajes
          </span>
        </div>
      </div>
    </div>

    <div class="border-b border-slate-100 bg-slate-50">
      <div class="flex items-center justify-between px-4 py-3">
        <p class="text-sm font-semibold text-slate-700">Usuarios disponibles</p>
        <span class="text-[11px] font-semibold text-slate-500">
          {{ isUserListExpanded ? 'Mostrando lista' : 'Lista ocultada' }}
        </span>
      </div>

      <div v-if="isUserListExpanded" class="px-4 pb-4">
        <div class="mb-3 flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 104.5 4.5a7.5 7.5 0 0012.15 12.15z" />
          </svg>
          <input
            id="chat-user-search"
            v-model="searchQuery"
            type="search"
            placeholder="Buscar por nombre"
            class="w-full border-0 bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
          />
        </div>

        <MessageBanner
          v-if="apiBanner"
          :title="apiBanner.title"
          :description="apiBanner.description"
          :type="apiBanner.type"
          @close="apiBanner = null"
          class="mb-3"
        />

        <div class="max-h-52 space-y-2 overflow-y-auto pr-1">
          <div v-if="isLoadingUsers" class="rounded-xl bg-white px-3 py-3 text-sm text-slate-500">
            Cargando usuarios...
          </div>

          <div v-else-if="filteredUsers.length === 0" class="rounded-xl bg-white px-3 py-3 text-sm text-slate-500">
            No se encontraron usuarios.
          </div>

          <button
            v-for="user in filteredUsers"
            :key="user.id"
            type="button"
            @click="onUserSelect(user.id)"
            class="flex w-full items-center gap-3 rounded-xl border px-3 py-2 text-left transition"
            :class="selectedUserId === user.id ? 'border-[#099ebf] bg-cyan-50' : 'border-transparent bg-white hover:border-cyan-100'"
          >
            <span class="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#099ebf] to-[#077a99] text-sm font-bold text-white">
              {{ user.initials }}
            </span>
            <span class="flex-1">
              <span class="block text-sm font-semibold text-slate-800">{{ user.name }}</span>
              <span class="block text-xs text-slate-500">{{ user.role }}</span>
            </span>
            <span class="flex flex-col items-end gap-1">
              <span class="rounded-full bg-emerald-100 px-2 py-1 text-[10px] font-semibold text-emerald-700">
                {{ user.status }}
              </span>
              <span
                v-if="getUserMessageCount(user.id) > 0"
                class="rounded-full bg-rose-100 px-2 py-1 text-[10px] font-bold text-rose-700"
              >
                {{ getUserMessageCount(user.id) }} mensaje{{ getUserMessageCount(user.id) > 1 ? 's' : '' }}
              </span>
            </span>
          </button>
        </div>
      </div>
    </div>

    <div class="flex-1 overflow-hidden bg-white">
      <div class="flex h-full flex-col">
        <div
          ref="messagesContainer"
          class="flex-1 overflow-y-auto bg-[radial-gradient(circle_at_top,_rgba(9,158,191,0.08),_transparent_45%)] px-4 py-4"
        >
          <div v-if="!selectedUserId" class="flex h-full items-center justify-center text-center text-sm text-slate-500">
            Selecciona a un usuario para ver el historial y comenzar a chatear.
          </div>

          <div v-else-if="isLoadingMessages" class="flex h-full items-center justify-center text-center text-sm text-slate-500">
            Cargando historial del usuario...
          </div>

          <div v-else-if="!activeConversation || !activeConversation.messages.length" class="flex h-full items-center justify-center text-center text-sm text-slate-500">
            No hay mensajes disponibles para este usuario.
          </div>

          <div v-else class="space-y-3">
            <div
              v-for="message in activeConversation.messages"
              :key="message.id"
              class="max-w-[90%]"
              :class="message.sender === 'me' ? 'ml-auto' : ''"
            >
              <div
                class="rounded-2xl px-3 py-2 text-sm shadow-sm"
                :class="message.specialType
                  ? 'border border-[#099ebf]/20 bg-gradient-to-br from-cyan-50 to-white text-slate-800'
                  : message.sender === 'me'
                    ? 'bg-[#099ebf] text-white'
                    : 'bg-slate-100 text-slate-800'"
              >
                <div v-if="message.specialType" class="space-y-2">
                  <div class="flex items-start gap-3">
                    <div class="mt-0.5 inline-flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-[#099ebf]/10 text-[#099ebf]">
                      <svg
                        v-if="message.specialType === 'Traslado'"
                        xmlns="http://www.w3.org/2000/svg"
                        class="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                      </svg>
                      <svg
                        v-else-if="message.specialType === 'Baja'"
                        xmlns="http://www.w3.org/2000/svg"
                        class="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path stroke-linecap="round" stroke-linejoin="round"
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      <svg
                        v-else
                        xmlns="http://www.w3.org/2000/svg"
                        class="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path stroke-linecap="round" stroke-linejoin="round"
                          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                      </svg>
                    </div>
                    <div class="flex-1">
                      <div class="flex flex-wrap items-center gap-2">
                        <p class="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#077a99]">{{ message.specialType }}</p>
                        <span class="rounded-full bg-white px-2 py-0.5 text-[10px] font-semibold text-slate-600">Mensaje especial</span>
                      </div>
                      <p v-if="message.text" class="mt-1 leading-relaxed">{{ message.text }}</p>
                      <p v-else class="mt-1 text-sm italic text-slate-500">Sin descripción disponible.</p>
                    </div>
                  </div>
                </div>
                <p v-else-if="message.text" class="leading-relaxed">{{ message.text }}</p>

                <div v-if="message.attachments?.length" class="mt-2 space-y-2">
                  <div
                    v-for="(attachment, attachmentIndex) in message.attachments"
                    :key="`${message.id}-${attachment.name}-${attachmentIndex}`"
                    class="space-y-2"
                  >
                    <div
                      v-if="attachment.type === 'image' && attachment.url"
                      class="overflow-hidden rounded-xl border border-white/40"
                    >
                      <button
                        type="button"
                        @click="openImagePreview(attachment.url, attachment.name)"
                        class="block w-full"
                      >
                        <img :src="attachment.url" alt="Adjunto" class="max-h-40 w-full object-cover" />
                      </button>
                      <div class="flex justify-end px-2 pb-2 pt-2">
                        <button
                          type="button"
                          @click="downloadAttachment(attachment.url, attachment.name)"
                          class="inline-flex items-center gap-1 rounded-lg bg-white/80 px-2 py-1 text-[11px] font-semibold text-slate-800 transition hover:bg-white"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5 5-5M12 15V3" />
                          </svg>
                          Descargar foto
                        </button>
                      </div>
                    </div>

                    <div
                      v-else
                      class="flex flex-wrap items-center gap-2 rounded-xl bg-white/15 px-3 py-2 text-xs"
                      :class="message.sender === 'me' ? 'text-cyan-50' : 'text-slate-700'"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                      <span class="truncate">{{ attachment.name }}</span>
                      <button
                        type="button"
                        @click="downloadAttachment(attachment.url, attachment.name)"
                        class="inline-flex items-center gap-1 rounded-lg bg-white/20 px-2 py-1 font-semibold transition hover:bg-white/30"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5 5-5M12 15V3" />
                        </svg>
                        Descargar
                      </button>
                    </div>
                  </div>
                </div>

                <div class="mt-2 flex items-end justify-between gap-3 text-[10px] opacity-80">
                  <div class="flex items-center gap-2">
                    <span>{{ message.time }}</span>
                    <span
                      v-if="message.sender === 'me'"
                      class="inline-flex items-center gap-0.5"
                      :title="message.status === 'visto' ? 'Visto' : 'No visto'"
                    >
                      <svg
                        v-if="message.status === 'visto'"
                        xmlns="http://www.w3.org/2000/svg"
                        class="h-3.5 w-3.5 text-cyan-100"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 18l7-7" />
                      </svg>
                      <svg
                        v-else
                        xmlns="http://www.w3.org/2000/svg"
                        class="h-3.5 w-3.5 text-cyan-100"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                      </svg>
                    </span>
                  </div>
                  <span>{{ message.senderName }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="border-t border-slate-100 bg-white px-4 py-3">
          <div v-if="pendingAttachments.length" class="mb-3 space-y-2">
            <div
              v-for="(attachment, index) in pendingAttachments"
              :key="attachment.id"
              class="rounded-xl border border-[#099ebf]/20 bg-cyan-50 px-3 py-2"
            >
              <div class="flex items-center justify-between gap-3">
                <div class="flex items-center gap-2 text-sm text-slate-700">
                  <span class="rounded-lg bg-white px-2 py-1 text-[10px] font-semibold text-[#099ebf]">
                    {{ attachment.type === 'image' ? 'Foto' : 'Archivo' }}
                  </span>
                  <span class="truncate">{{ attachment.name }}</span>
                </div>
                <button
                  type="button"
                  @click="removeAttachment(index)"
                  class="text-slate-500 transition hover:text-slate-800"
                  aria-label="Quitar adjunto"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <img
                v-if="attachment.type === 'image' && attachment.url"
                :src="attachment.url"
                alt="Vista previa"
                class="mt-2 h-20 w-full rounded-lg object-cover"
              />
            </div>
          </div>

          <div class="flex items-end gap-2">
            <div class="flex-1">
              <label for="chat-input" class="sr-only">Escribe un mensaje</label>
              <input
                id="chat-input"
                v-model="draftMessage"
                type="text"
                placeholder="Escribe un mensaje..."
                class="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-[#099ebf] focus:bg-white"
                @keydown.enter.exact.prevent="sendMessage"
              />
            </div>

            <div class="relative">
              <button
                type="button"
                @click="isAttachmentMenuOpen = !isAttachmentMenuOpen"
                class="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700 transition hover:bg-slate-200"
                title="Adjuntar foto o archivo"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.586-6.586a4 4 0 10-5.657-5.657l-6.586 6.586a6 6 0 108.485 8.485L19 14" />
                </svg>
              </button>

              <div
                v-if="isAttachmentMenuOpen"
                class="absolute bottom-full right-0 mb-2 w-48 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg"
              >
                <button
                  type="button"
                  @click="startCamera"
                  class="flex w-full items-center gap-2 px-3 py-2 text-sm text-slate-700 transition hover:bg-slate-50"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0111.07 4h1.86a2 2 0 011.664.89l.812 1.22A2 2 0 0017.07 7H18a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Tomar foto
                </button>
                <button
                  type="button"
                  @click="triggerFileInput"
                  class="flex w-full items-center gap-2 border-t border-slate-100 px-3 py-2 text-sm text-slate-700 transition hover:bg-slate-50"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  Subir archivo
                </button>
              </div>
            </div>

            <input
              ref="fileInput"
              type="file"
              multiple
              accept="image/*,.pdf,.doc,.docx,.xlsx,.csv,.txt"
              class="hidden"
              @change="handleAttachment"
            />

            <button
              type="button"
              @click="sendMessage"
              :disabled="isSending || (!draftMessage.trim() && !pendingAttachments.length)"
              class="inline-flex h-10 items-center justify-center rounded-xl bg-[#099ebf] px-4 text-sm font-semibold text-white transition hover:bg-[#077a99] disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              {{ isSending ? 'Enviando...' : 'Enviar' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </aside>

  <div
    v-if="isImagePreviewOpen"
    class="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/85 p-4"
  >
    <div class="w-full max-w-3xl rounded-2xl bg-white p-4 shadow-2xl">
      <div class="flex items-center justify-between gap-3">
        <div>
          <p class="text-sm font-semibold text-slate-800">Vista previa de imagen</p>
          <p class="text-xs text-slate-500">{{ previewImageName }}</p>
        </div>
        <button
          type="button"
          @click="closeImagePreview"
          class="rounded-full p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
          aria-label="Cerrar vista previa"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div class="mt-3 overflow-hidden rounded-2xl bg-slate-100">
        <img v-if="previewImageUrl" :src="previewImageUrl" :alt="previewImageName" class="max-h-[70vh] w-full object-contain" />
      </div>
    </div>
  </div>

  <div
    v-if="isCameraPreviewOpen"
    class="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/80 p-4"
  >
    <div class="w-full max-w-md rounded-2xl bg-white p-4 shadow-2xl">
      <div class="flex items-center justify-between gap-3">
        <div>
          <p class="text-sm font-semibold text-slate-800">Cámara</p>
          <p class="text-xs text-slate-500">Ajusta el encuadre y toma la foto.</p>
        </div>
        <button
          type="button"
          @click="closeCameraPreview"
          class="rounded-full p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
          aria-label="Cerrar cámara"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div class="mt-3 overflow-hidden rounded-2xl bg-slate-100">
        <video
          ref="cameraVideo"
          autoplay
          playsinline
          class="aspect-video w-full object-cover"
        ></video>
        <canvas ref="cameraCanvas" class="hidden"></canvas>
      </div>

      <p v-if="cameraError" class="mt-3 text-sm text-rose-600">{{ cameraError }}</p>

      <div class="mt-4 flex gap-2">
        <button
          type="button"
          @click="capturePhoto"
          class="flex-1 rounded-xl bg-[#099ebf] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#077a99]"
        >
          Capturar foto
        </button>
        <button
          type="button"
          @click="closeCameraPreview"
          class="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          Cancelar
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue';
import MessageBanner from './MessageBanner.vue';

const emit = defineEmits(['close', 'summary-updated']);
const config = useRuntimeConfig();

const users = ref([]);
const selectedUserId = ref(null);
const draftMessage = ref('');
const pendingAttachments = ref([]);
const isUserListExpanded = ref(true);
const isAttachmentMenuOpen = ref(false);
const isMobileView = ref(false);
const isCameraPreviewOpen = ref(false);
const isSending = ref(false);
const cameraError = ref('');
const searchQuery = ref('');
const isLoadingUsers = ref(false);
const isLoadingMessages = ref(false);
const apiBanner = ref(null);
const fileInput = ref(null);
const cameraVideo = ref(null);
const cameraCanvas = ref(null);
const cameraStream = ref(null);
const conversations = ref([]);
const messagesContainer = ref(null);
const isImagePreviewOpen = ref(false);
const previewImageUrl = ref('');
const previewImageName = ref('');

const currentUserName = ref('Tú');
const currentUserId = ref(null);
const chatSummary = ref({
  total: 0,
  datos: [],
  senderCounts: {}
});

const getStoredUserData = () => {
  try {
    const stored = localStorage.getItem('usuario');
    if (!stored) {
      return null;
    }

    return JSON.parse(stored);
  } catch {
    return null;
  }
};

const getStoredUserId = () => {
  const storedUser = getStoredUserData();

  return String(storedUser?.id_usuario ?? storedUser?.id ?? storedUser?.usuarioId ?? '').trim();
};

const normalizeUser = (user) => {
  const id = String(user?.id_usuario ?? user?.id ?? user?.usuarioId ?? '');
  const ldap = user?.id_usuario_LDAP?.toString().trim() || user?.username?.toString().trim() || user?.nombre_usuario?.toString().trim() || `Usuario ${id}`;
  const role = user?.rol?.toString().trim() || 'Usuario';
  const status = user?.activo === false ? 'Inactivo' : 'Disponible';
  const initials = ldap
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || 'U';

  return {
    id,
    name: ldap,
    role,
    status,
    initials
  };
};

const getAuthToken = () => localStorage.getItem('token') || '';

const formatMessageTime = (value) => {
  if (!value) {
    return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  return parsed.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const normalizeSender = (message) => {
  const sender = message?.remitente ?? message?.sender ?? message?.tipoRemitente ?? '';
  const senderText = String(sender || '').trim().toLowerCase();

  if (!senderText) {
    return 'other';
  }

  if (senderText === 'me' || senderText === currentUserName.value.toLowerCase() || senderText === String(currentUserId.value || '').toLowerCase()) {
    return 'me';
  }

  return 'other';
};

const normalizeMessageStatus = (message) => {
  const status = String(message?.estado ?? message?.status ?? '').trim().toLowerCase();

  if (status === 'visto' || status === 'seen') {
    return 'visto';
  }

  return 'enviado';
};

const isImageDocument = (document) => {
  const content = String(document?.contenido ?? document?.url ?? '').trim().toLowerCase();
  const direccion = String(document?.direccion ?? '').trim().toLowerCase();
  const name = String(document?.nombre ?? '').trim().toLowerCase();
  const mimeType = String(document?.tipo ?? document?.mime_type ?? document?.mimeType ?? '').trim().toLowerCase();

  if (content.startsWith('data:image/')) {
    return true;
  }

  if (mimeType.startsWith('image/')) {
    return true;
  }

  return /\.(png|jpe?g|gif|webp|bmp|svg)(\?.*)?$/i.test(name)
    || /\.(png|jpe?g|gif|webp|bmp|svg)(\?.*)?$/i.test(content)
    || /\.(png|jpe?g|gif|webp|bmp|svg)(\?.*)?$/i.test(direccion);
};

const getAttachmentName = (document, fallbackIndex) => {
  const rawName = String(document?.nombre ?? '').trim();
  const candidate = rawName || String(document?.direccion ?? '').trim() || String(document?.url ?? '').trim();

  if (!candidate) {
    return `Imagen ${fallbackIndex + 1}`;
  }

  try {
    const parsedUrl = new URL(candidate);
    const fileName = parsedUrl.pathname.split('/').filter(Boolean).pop() || candidate;
    return fileName || `Imagen ${fallbackIndex + 1}`;
  } catch {
    const fileName = candidate.split('/').filter(Boolean).pop() || candidate;
    return fileName || `Imagen ${fallbackIndex + 1}`;
  }
};

const getAttachmentUrl = (document) => {
  const content = String(document?.contenido ?? '').trim();
  const url = String(document?.url ?? '').trim();
  const direccion = String(document?.direccion ?? '').trim();
  const rawName = String(document?.nombre ?? '').trim();
  const baseBackendHost = String(config.public.backendHost || '').replace(/\/$/, '');

  const normalizePath = (value) => {
    if (!value) {
      return '';
    }

    if (/^data:/i.test(value) || /^https?:\/\//i.test(value) || value.startsWith('//')) {
      return value;
    }

    if (value.startsWith('/')) {
      return `${baseBackendHost}${value}`;
    }

    return `${baseBackendHost}/${value.replace(/^\/+/, '')}`;
  };

  if (content) {
    return normalizePath(content);
  }

  if (url) {
    return normalizePath(url);
  }

  if (direccion) {
    return normalizePath(direccion);
  }

  if (rawName) {
    return normalizePath(rawName);
  }

  return '';
};

const normalizeApiAttachments = (message) => {
  if (!Array.isArray(message?.documentos)) {
    return [];
  }

  return message.documentos
    .map((document, docIndex) => {
      const attachmentUrl = getAttachmentUrl(document);

      if (!attachmentUrl) {
        return null;
      }

      const attachmentName = getAttachmentName(document, docIndex);
      const attachmentType = isImageDocument(document) ? 'image' : 'file';

      return {
        name: attachmentName,
        type: attachmentType,
        url: attachmentUrl
      };
    })
    .filter(Boolean);
};

const getMessageTimestamp = (message) => {
  const rawValue = message?.createdAt ?? message?.fecha ?? message?.fecha_envio ?? message?.updatedAt ?? message?.fecha_hora ?? null;
  const parsed = rawValue ? new Date(rawValue) : new Date(0);

  if (Number.isNaN(parsed.getTime())) {
    return 0;
  }

  return parsed.getTime();
};

const getSpecialMessageType = (message) => {
  const rawType = String(message?.tipo ?? message?.type ?? '').trim();

  if (!rawType) {
    return null;
  }

  const normalizedType = rawType.toLowerCase();

  if (normalizedType === 'traslado') {
    return 'Traslado';
  }

  if (normalizedType === 'baja') {
    return 'Baja';
  }

  if (normalizedType === 'revisión' || normalizedType === 'revision') {
    return 'Revisión';
  }

  return null;
};

const normalizeMessages = (payload, targetUserId, currentUserId, usersList = []) => {
  const rawMessages = Array.isArray(payload)
    ? payload
    : Array.isArray(payload?.data)
      ? payload.data
      : Array.isArray(payload?.mensajes)
        ? payload.mensajes
        : [];

  // Crear un mapa de id_usuario -> nombre (id_usuario_LDAP)
  const userMap = new Map();
  usersList.forEach(user => {
    userMap.set(String(user.id), user.name);
  });

  return rawMessages
    .map((message, index) => {
      const attachments = normalizeApiAttachments(message);
      const description = String(message?.descripcion ?? message?.texto ?? message?.mensaje ?? message?.body ?? message?.message ?? '').trim();
      const shouldHidePlaceholderText = attachments.length > 0 && description.toLowerCase().startsWith('adjuntos:');
      const senderId = String(message?.id_usuario ?? '');
      const isMe = senderId === String(currentUserId);
      // Obtener el nombre del remitente desde el mapa, o usar un fallback
      const senderName = userMap.get(senderId) || `Usuario ${senderId}`;

      return {
        id: String(message?.id ?? message?.id_mensaje ?? `${targetUserId}-${index}-${Date.now()}`),
        sender: isMe ? 'me' : 'other',
        senderName, // Nuevo campo
        text: shouldHidePlaceholderText ? '' : description,
        time: formatMessageTime(message?.createdAt ?? message?.fecha ?? message?.fecha_envio ?? message?.updatedAt),
        status: normalizeMessageStatus(message),
        timestamp: getMessageTimestamp(message),
        specialType: getSpecialMessageType(message),
        attachments
      };
    })
    .sort((left, right) => left.timestamp - right.timestamp);
};

const persistChatSummary = (payload) => {
  try {
    const datos = Array.isArray(payload?.datos) ? payload.datos : [];
    const senderCounts = {};

    datos.forEach((message) => {
      const senderId = String(message?.id_usuario ?? '').trim();
      if (!senderId) {
        return;
      }

      senderCounts[senderId] = (senderCounts[senderId] || 0) + 1;
    });

    const summary = {
      total: datos.length,
      datos,
      senderCounts,
      fetchedAt: new Date().toISOString()
    };

    chatSummary.value = summary;
    localStorage.setItem('chatFilteredMessages', JSON.stringify(summary));
    localStorage.setItem('chatUnreadCount', String(datos.length));
    emit('summary-updated', { count: datos.length, data: datos, senderCounts });
  } catch {
    chatSummary.value = {
      total: 0,
      datos: [],
      senderCounts: {}
    };
    localStorage.setItem('chatUnreadCount', '0');
    emit('summary-updated', { count: 0, data: [], senderCounts: {} });
  }
};

const getUserMessageCount = (userId) => {
  const normalizedUserId = String(userId || '').trim();

  if (!normalizedUserId) {
    return 0;
  }

  return chatSummary.value.senderCounts?.[normalizedUserId] || 0;
};

const refreshChatSummary = async (remitenteId = null) => {
  const currentUserIdValue = getStoredUserId();
  const token = getAuthToken();

  if (!currentUserIdValue || !token) {
    persistChatSummary({ datos: [] });
    return;
  }

  const body = {
    estado: 'enviado', // ← Filtro para obtener solo mensajes no leídos
    id_usuario_receptor: Number(currentUserIdValue)
  };
  if (remitenteId) {
    body.id_usuario = Number(remitenteId);
  } else {
    // Si no se especifica remitente, se pueden obtener de todos (usar 0 o null según tu backend)
    body.id_usuario = 0;
  }

  try {
    const response = await fetch(`${config.public.backendHost}/mensajes/filtrar/1/999999`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: token
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const message = await getApiErrorDetails(response);
      throw new Error(message);
    }

    const payload = await response.json();
    persistChatSummary(payload);
  } catch (error) {
    console.error('Error cargando resumen del chat filtrado', error);
    persistChatSummary({ datos: [] });
  }
};

const markMessagesAsSeen = async (currentUserIdValue) => {
  if (!currentUserIdValue) {
    throw new Error('No se pudo identificar el usuario remitente.');
  }

  const token = getAuthToken();
  if (!token) {
    throw new Error('No hay sesión activa para marcar el chat como visto.');
  }
  console.log(currentUserIdValue);
  
  const response = await fetch(`${config.public.backendHost}/mensajes/usuario/${currentUserIdValue}/visto`, {
    method: 'PUT',
    headers: {
      Authorization: token
    }
  });

  if (!response.ok) {
    const message = await getApiErrorDetails(response);
    throw new Error(message);
  }

  const currentConversation = conversations.value.find((conversation) => conversation.userId === String(selectedUserId.value));
  if (!currentConversation) {
    return;
  }

  currentConversation.messages = currentConversation.messages.map((message) => {
    if (message.sender === 'me') {
      return message;
    }

    return {
      ...message,
      status: 'visto'
    };
  });
};

const scrollToBottom = () => {
  if (!messagesContainer.value) {
    return;
  }

  messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
};

const openImagePreview = (imageUrl, imageName) => {
  previewImageUrl.value = imageUrl;
  previewImageName.value = imageName;
  isImagePreviewOpen.value = true;
};

const closeImagePreview = () => {
  isImagePreviewOpen.value = false;
  previewImageUrl.value = '';
  previewImageName.value = '';
};

const downloadAttachment = async (attachmentUrl, attachmentName) => {
  if (!attachmentUrl) {
    return;
  }

  try {
    const response = await fetch(attachmentUrl, {
      headers: getAuthToken()
        ? {
            Authorization: getAuthToken()
          }
        : undefined
    });

    if (!response.ok) {
      throw new Error(`No se pudo descargar el archivo (${response.status}).`);
    }

    const blob = await response.blob();
    const blobUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = blobUrl;
    link.download = attachmentName || 'archivo';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    link.remove();

    window.setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
  } catch (error) {
    console.error('Error descargando adjunto', error);
    showApiError('Error al descargar archivo', error.message || 'No se pudo descargar el adjunto.');
  }
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
  () => activeConversation.value?.messages.length,
  async () => {
    await nextTick();
    scrollToBottom();
  }
);

const parseApiErrorMessage = (payload) => {
  if (!payload || typeof payload !== 'object') {
    return null;
  }

  if (typeof payload.error === 'string' && payload.error.trim()) {
    return payload.error.trim();
  }

  if (Array.isArray(payload.errors)) {
    const messages = payload.errors
      .map((item) => typeof item === 'string' ? item.trim() : null)
      .filter(Boolean);

    if (messages.length) {
      return messages.join('\n');
    }
  }

  if (typeof payload.message === 'string' && payload.message.trim()) {
    return payload.message.trim();
  }

  return null;
};

const getApiErrorDetails = async (response) => {
  const fallback = `No se pudo consumir el endpoint (${response.status}).`;

  try {
    const payload = await response.clone().json();
    const message = parseApiErrorMessage(payload);

    if (message) {
      return message;
    }
  } catch {
    // Ignoramos el error de parseo y usamos el fallback.
  }

  try {
    const text = await response.clone().text();
    if (text && text.trim()) {
      return text.trim();
    }
  } catch {
    // Ignoramos el error de lectura y usamos el fallback.
  }

  return fallback;
};

const showApiError = (title, description) => {
  apiBanner.value = {
    title,
    description,
    type: 'error'
  };
};

const clearApiError = () => {
  apiBanner.value = null;
};

const stopCameraStream = () => {
  if (cameraStream.value) {
    cameraStream.value.getTracks().forEach((track) => track.stop());
    cameraStream.value = null;
  }

  if (cameraVideo.value) {
    cameraVideo.value.srcObject = null;
  }
};

const closeCameraPreview = () => {
  stopCameraStream();
  isCameraPreviewOpen.value = false;
  cameraError.value = '';
};

const startCamera = async () => {
  isAttachmentMenuOpen.value = false;
  cameraError.value = '';

  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'environment' },
      audio: false
    });

    cameraStream.value = stream;
    isCameraPreviewOpen.value = true;
    await nextTick();

    if (cameraVideo.value) {
      cameraVideo.value.srcObject = stream;
      await cameraVideo.value.play();
    }
  } catch (error) {
    console.error('No se pudo abrir la cámara', error);
    cameraError.value = 'No fue posible acceder a la cámara en este dispositivo.';
    isCameraPreviewOpen.value = false;
  }
};

const capturePhoto = () => {
  if (!cameraVideo.value || !cameraCanvas.value) {
    return;
  }

  const video = cameraVideo.value;
  const canvas = cameraCanvas.value;
  const context = canvas.getContext('2d');

  canvas.width = video.videoWidth || 1280;
  canvas.height = video.videoHeight || 720;
  context.drawImage(video, 0, 0, canvas.width, canvas.height);

  pendingAttachments.value.push({
    id: `camera-${Date.now()}`,
    name: 'captura.png',
    type: 'image',
    url: canvas.toDataURL('image/png'),
    dataUrl: canvas.toDataURL('image/png')
  });

  closeCameraPreview();
};

const readFileAsBase64 = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = () => resolve(String(reader.result || ''));
  reader.onerror = () => reject(reader.error || new Error('No se pudo leer el archivo'));
  reader.readAsDataURL(file);
});

const compressImageToBase64 = async (file) => {
  const dataUrl = await readFileAsBase64(file);

  if (!/^data:image\/(png|jpeg|jpg)/i.test(dataUrl)) {
    return dataUrl;
  }

  const image = new Image();
  image.src = dataUrl;

  await new Promise((resolve, reject) => {
    image.onload = resolve;
    image.onerror = () => reject(new Error('No se pudo procesar la imagen'));
  });

  const canvas = document.createElement('canvas');
  canvas.width = image.naturalWidth;
  canvas.height = image.naturalHeight;

  const context = canvas.getContext('2d');
  if (!context) {
    throw new Error('No se pudo crear el contexto de la imagen');
  }

  context.drawImage(image, 0, 0);
  const mimeType = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
  return canvas.toDataURL(mimeType, 1);
};

const createAttachmentPayload = async (attachment) => {
  if (attachment.type === 'image' && attachment.dataUrl) {
    return {
      contenido: attachment.dataUrl,
      nombre: attachment.name
    };
  }

  if (attachment.file) {
    const isImage = /^image\/(jpeg|jpg|png)$/i.test(attachment.file.type);
    const contenido = isImage
      ? await compressImageToBase64(attachment.file)
      : await readFileAsBase64(attachment.file);

    return {
      contenido,
      nombre: attachment.name
    };
  }

  return {
    contenido: attachment.url || '',
    nombre: attachment.name
  };
};

const loadUsers = async () => {
  const token = getAuthToken();
  if (!token) {
    showApiError('Error al cargar usuarios', 'No hay sesión activa para cargar usuarios.');
    return;
  }

  isLoadingUsers.value = true;
  clearApiError();

  try {
    const response = await fetch(`${config.public.backendHost}/usuarios`, {
      headers: {
        Authorization: token
      }
    });

    if (!response.ok) {
      const message = await getApiErrorDetails(response);
      throw new Error(message);
    }

    const data = await response.json();
    const normalizedUsers = Array.isArray(data) ? data.map(normalizeUser) : [];

    users.value = normalizedUsers;
    if (!normalizedUsers.some((user) => user.id === selectedUserId.value)) {
      selectedUserId.value = null;
    }
  } catch (error) {
    console.error('Error cargando usuarios del chat', error);
    showApiError('Error al cargar usuarios', error.message || 'No se pudieron cargar los usuarios del chat.');
    users.value = [];
  } finally {
    isLoadingUsers.value = false;
  }
};

const loadMessages = async (userId, shouldMarkAsSeen = true) => {
  const token = getAuthToken();
  if (!token) {
    showApiError('Error al cargar historial', 'No hay sesión activa para cargar el historial del chat.');
    return;
  }

  isLoadingMessages.value = true;
  clearApiError();
  selectedUserId.value = String(userId);

  try {
    const response = await fetch(`${config.public.backendHost}/mensajes/usuario/${userId}`, {
      headers: { Authorization: token }
    });

    if (response.status === 404) {
      conversations.value = conversations.value.filter(conv => conv.userId !== String(userId));
      conversations.value.push({ userId: String(userId), messages: [] });
      if (shouldMarkAsSeen) {
        await markMessagesAsSeen(currentUserId.value);
      }
      await refreshChatSummary(userId);
      return;
    }

    if (!response.ok) {
      const message = await getApiErrorDetails(response);
      throw new Error(message);
    }

    const data = await response.json();
    const allMessages = Array.isArray(data) ? data : Array.isArray(data?.mensajes) ? data.mensajes : [];
    const filteredMessages = allMessages.filter(msg => {
      const senderId = String(msg?.id_usuario ?? '');
      const receiverId = String(msg?.id_usuario_receptor ?? '');
      return (senderId === String(userId) && receiverId === String(currentUserId.value)) ||
             (senderId === String(currentUserId.value) && receiverId === String(userId));
    });

    const normalized = normalizeMessages(filteredMessages, String(userId), currentUserId.value, users.value);

    conversations.value = conversations.value.filter(conv => conv.userId !== String(userId));
    conversations.value.push({ userId: String(userId), messages: normalized });

    // Solo marcar como vistos si es la primera carga (al abrir el chat)
    if (shouldMarkAsSeen) {
      await markMessagesAsSeen(currentUserId.value);
    }
    await refreshChatSummary(userId);
    await nextTick();
    scrollToBottom();
  } catch (error) {
    console.error('Error cargando mensajes del chat', error);
    showApiError('Error al cargar historial', error.message || 'No se pudo cargar el historial del usuario seleccionado.');
    conversations.value = conversations.value.filter(conv => conv.userId !== String(userId));
  } finally {
    isLoadingMessages.value = false;
  }
};

const onUserSelect = (userId) => {
  isUserListExpanded.value = false;
  loadMessages(userId);
};

const triggerFileInput = () => {
  isAttachmentMenuOpen.value = false;
  fileInput.value?.click();
};

const handleAttachment = (event) => {
  const files = Array.from(event.target.files || []);
  if (!files.length) {
    return;
  }

  files.forEach((file) => {
    const isImage = file.type.startsWith('image/');
    pendingAttachments.value.push({
      id: `${file.name}-${file.lastModified}-${Math.random().toString(36).slice(2, 8)}`,
      name: file.name,
      type: isImage ? 'image' : 'file',
      url: isImage ? URL.createObjectURL(file) : '',
      file
    });
  });

  event.target.value = '';
};

const removeAttachment = (index) => {
  const attachment = pendingAttachments.value[index];
  if (attachment?.url?.startsWith('blob:')) {
    URL.revokeObjectURL(attachment.url);
  }
  pendingAttachments.value.splice(index, 1);
};

const clearPendingAttachments = () => {
  pendingAttachments.value.forEach((attachment) => {
    if (attachment?.url?.startsWith('blob:')) {
      URL.revokeObjectURL(attachment.url);
    }
  });
  pendingAttachments.value = [];
};

const sendMessage = async () => {
  const messageText = draftMessage.value.trim();
  const currentUserIdValue = String(currentUserId.value || '');

  if (!selectedUserId.value) {
    showApiError('Error al enviar mensaje', 'Selecciona un usuario antes de enviar el mensaje.');
    return;
  }

  if (!messageText && !pendingAttachments.value.length) {
    return;
  }

  if (!currentUserIdValue) {
    showApiError('Error al enviar mensaje', 'No se pudo identificar el usuario remitente.');
    return;
  }

  isSending.value = true;
  clearApiError();

  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error('No hay sesión activa para enviar el mensaje.');
    }

    const documentos = await Promise.all(pendingAttachments.value.map((attachment) => createAttachmentPayload(attachment)));

    const payload = {
      fecha_hora: new Date().toISOString(),
      tipo: 'Mensaje',
      descripcion: messageText || (documentos.length ? `Adjuntos: ${documentos.map((documento) => documento.nombre).join(', ')}` : ''),
      estado: 'enviado',
      id_usuario: Number(currentUserIdValue),
      id_usuario_receptor: Number(selectedUserId.value),
      documentos
    };

    const response = await fetch(`${config.public.backendHost}/mensajes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: token
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const message = await getApiErrorDetails(response);
      throw new Error(message);
    }

    draftMessage.value = '';
clearPendingAttachments();
await loadMessages(selectedUserId.value, false); 
  } catch (error) {
    console.error('Error enviando mensaje', error);
    showApiError('Error al enviar mensaje', error.message || 'No se pudo enviar el mensaje.');
  } finally {
    isSending.value = false;
  }
};

onMounted(() => {
  isMobileView.value = window.innerWidth < 768;

  try {
    const stored = localStorage.getItem('usuario');
    if (stored) {
      const parsed = JSON.parse(stored);
      const name = parsed?.nombre || parsed?.name || parsed?.usuario || '';
      currentUserId.value = parsed?.id_usuario ?? parsed?.id ?? parsed?.usuarioId ?? null;
      if (name) {
        currentUserName.value = name;
      }
    }
  } catch {
    currentUserName.value = 'Tú';
  }

  loadUsers();
  void refreshChatSummary();
});

onUnmounted(() => {
  closeCameraPreview();
});
</script>
