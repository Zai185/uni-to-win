<template>
  <div class="min-h-screen flex flex-col">
    <!-- Header -->
    <header class="py-6 text-center">
      <h1 class="text-xl font-semibold tracking-tight">Uni → Win</h1>
      <p class="text-zinc-500 text-sm mt-1">Unicode to Win Innwa converter</p>
    </header>

    <!-- Main -->
    <main class="flex-1 flex flex-col gap-4 px-4 pb-6 max-w-5xl mx-auto w-full">
      <!-- Actions -->
      <div class="flex justify-center gap-3">
        <button
          class="text-sm px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 transition"
          @click="copyToClipboard"
        >
          Copy Output
        </button>
        <button
          class="text-sm px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 transition"
          @click="text = ''"
        >
          Clear
        </button>
      </div>

      <!-- Text areas -->
      <div class="flex flex-col md:flex-row gap-4 flex-1">
        <textarea
          class="flex-1 min-h-[35vh] md:min-h-0 resize-none rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-100 p-4 placeholder-zinc-600 focus:outline-none focus:border-zinc-600 transition"
          placeholder="Paste Unicode text here…"
          v-model="text"
        />
        <textarea
          class="flex-1 min-h-[35vh] md:min-h-0 resize-none rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-100 p-4 placeholder-zinc-600 focus:outline-none focus:border-zinc-600 transition text-lg"
          placeholder="Win Innwa output"
          ref="textBox"
          readonly
          v-model="textMod"
        />
      </div>
    </main>

    <!-- Toast -->
    <Transition name="toast">
      <div
        v-if="showToast"
        class="fixed bottom-6 left-1/2 -translate-x-1/2 px-4 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-sm text-zinc-200 shadow-lg"
      >
        Copied to clipboard
      </div>
    </Transition>

    <!-- Footer -->
    <footer class="py-4 text-center text-zinc-600 text-xs">
      Credit: <a href="https://github.com/thanlwinsoft" class="hover:text-zinc-400 transition">Thanlwinsoft</a>
      · <a href="https://github.com/zai185" class="hover:text-zinc-400 transition">Zai185</a>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, Ref } from "vue";
import { TlsMyanmarConverter } from "./assets/tlsMyanmarConverter";
import { tlsMyanmarConverterData } from "./assets/tlsMyanmarConverterData";

const text: Ref<string> = ref("");
const textBox: Ref<HTMLTextAreaElement | null> = ref(null);
const showToast = ref(false);
let toastTimer: ReturnType<typeof setTimeout>;

const textMod = computed(() => {
  let unicodeText = new TlsMyanmarConverter(
    tlsMyanmarConverterData["wwin_burmese1"],
  ).tlsConvert(text.value);
  return unicodeText
    .replaceAll("ßS", "Q")
    .replaceAll("ßG", "R")
    .replaceAll("ßT", "W")
    .replaceAll("êud", "BudK")
    .replaceAll("êdC", "BCdK")
    .replaceAll("êqd", "BqdK")
    .replaceAll("êod", "BodK")
    .replaceAll("êwd", "BwdK")
    .replaceAll("êxd", "BxdK")
    .replaceAll("êBd", "BBdK")
    .replaceAll("ê,d", "B,dK")
    .replaceAll("êvd", "BvdK")
    .replaceAll("êuH", "BuHK")
    .replaceAll("êCH", "BCHK")
    .replaceAll("êqH", "BqHK")
    .replaceAll("êoH", "BoHK")
    .replaceAll("êBH", "BHK")
    .replaceAll("êxH", "BxHK")
    .replaceAll("êBH", "BBHK")
    .replaceAll("ê,H", "B,HK")
    .replaceAll("êvH", "BvHK")
    .replaceAll("êu", "BuK")
    .replaceAll("êC", "BCK")
    .replaceAll("êq", "BqK")
    .replaceAll("êo", "BoK")
    .replaceAll("êw", "BwK")
    .replaceAll("êx", "BxK")
    .replaceAll("ê,", "B,K")
    .replaceAll("êv", "BvK")
    .replaceAll("ûcH", "jcHK")
    .replaceAll("û*H", "j*HK")
    .replaceAll("ûiH", "jiHK")
    .replaceAll("ûpH", "jpHK")
    .replaceAll("ûZH", "jZHK")
    .replaceAll("û'H", "j'HK")
    .replaceAll('û"H', 'j"HK')
    .replaceAll("ûuH", "juHK")
    .replaceAll("ûzH", "jzHK")
    .replaceAll("ûAH", "jAHK")
    .replaceAll("ûrH", "jrHK")
    .replaceAll("ûEH", "jEHK")
    .replaceAll("û0H", "j0HK")
    .replaceAll("ûyH", "jyHK")
    .replaceAll("ûcd", "jcdK")
    .replaceAll("û*d", "j*dK")
    .replaceAll("ûid", "jidK")
    .replaceAll("ûpd", "jpdK")
    .replaceAll("ûZd", "jZdK")
    .replaceAll("û'd", "j'dK")
    .replaceAll('û"d', 'j"dK')
    .replaceAll("ûud", "judK")
    .replaceAll("ûzd", "jzdK")
    .replaceAll("ûAd", "jAdK")
    .replaceAll("ûrd", "jrdK")
    .replaceAll("ûEd", "jEdK")
    .replaceAll("û0d", "j0dK")
    .replaceAll("ûyd", "jydK")
    .replaceAll("ûc", "jcK")
    .replaceAll("û*", "j*K")
    .replaceAll("ûi", "jiK")
    .replaceAll("ûp", "jpK")
    .replaceAll("ûZ", "jZK")
    .replaceAll("û'", "j'K")
    .replaceAll('û"', 'j"K')
    .replaceAll("ûu", "juK")
    .replaceAll("ûz", "jzK")
    .replaceAll("ûA", "jAK")
    .replaceAll("ûr", "jrK")
    .replaceAll("ûE", "jEK")
    .replaceAll("û0", "j0K")
    .replaceAll("ûy", "jyK");
});

async function copyToClipboard() {
  if (textBox.value) {
    await navigator.clipboard.writeText(textMod.value);
    clearTimeout(toastTimer);
    showToast.value = true;
    toastTimer = setTimeout(() => (showToast.value = false), 2000);
  }
}
</script>

<style scoped>
@font-face {
  font-family: wininnwa;
  src: url(./assets/WININNWA.TTF);
}

.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}
.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translate(-50%, 8px);
}
</style>
