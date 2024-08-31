<template>
  <div>
    <div class="my-4 flex justify-center items-center gap-4">
      <button class="border hover:bg-white hover:text-black transition py-2 px-4" @click="copyToClipboard">Copy The
        Win</button>
      <button class="border hover:bg-white hover:text-black transition py-2 px-4" @click="deleteText">Clear All</button>
    </div>

    <div class="flex items-center justify-center gap-2 md:gap-8 flex-col md:flex-row px-4">
      <textarea class="border h-[40vh] md:h-[80vh] resize-none w-full md:w-[40%] bg-transparent text-white p-4"
        placeholder="Enter Your Win Here" v-model="text"></textarea>
      <textarea
        class="font-[wininnwa] border h-[40vh] md:h-[80vh] resize-none w-full md:w-[40%] bg-transparent text-white p-4"
        placeholder="uc*XipZn" ref="textBox" readonly v-model="textMod"></textarea>
    </div>
  </div>
</template>

<script setup>

import { ref, computed, onMounted } from 'vue'

const text = ref('ကခဂဃအဈည')
const textBox = ref(null)
const consonents = [
  "u", "c", "*", "C", "i",
  "p", "q", "Z", "ps", "O", "n",
  "#", "X", "!", "¡", "P",
  "w", "x", "'", '"', "e",
  "y", "z", "A", "b", "r",
  ",", "&", "v", "0", "o",
  "[", "V", "t",]
//! from 4096 to 4129

const textMod = computed(() => {
  let unicodeText = tlsConvert(text.value)
  return unicodeText
    .replaceAll('ßS', 'Q')
    .replaceAll('ßG', 'R')
    .replaceAll('ßT', 'W')
    .replaceAll('êud', 'BudK')
    .replaceAll('êdC', 'BCdK')
    .replaceAll('êqd', 'BqdK')
    .replaceAll('êod', 'BodK')
    .replaceAll('êwd', 'BwdK')
    .replaceAll('êxd', 'BxdK')
    .replaceAll('êBd', 'BBdK')
    .replaceAll('ê,d', 'B,dK')
    .replaceAll('êvd', 'BvdK')//end
    .replaceAll('êuH', 'BuHK')
    .replaceAll('êCH', 'BCHK')
    .replaceAll('êqH', 'BqHK')
    .replaceAll('êoH', 'BoHK')
    .replaceAll('êBH', 'BHK')
    .replaceAll('êxH', 'BxHK')
    .replaceAll('êBH', 'BBHK')
    .replaceAll('ê,H', 'B,HK')
    .replaceAll('êvH', 'BvHK')
    .replaceAll('êu', 'BuK')
    .replaceAll('êC', 'BCK')
    .replaceAll('êq', 'BqK')
    .replaceAll('êo', 'BoK')
    .replaceAll('êw', 'BwK')
    .replaceAll('êx', 'BxK')
    .replaceAll('ê,', 'B,K')
    .replaceAll('êv', 'BvK') //end
    .replaceAll('ûcH', 'jcHK')
    .replaceAll('û*H', 'j*HK')
    .replaceAll('ûiH', 'jiHK')
    .replaceAll('ûpH', 'jpHK')
    .replaceAll('ûZH', 'jZHK')
    .replaceAll("û'H", "j'HK")
    .replaceAll('û"H', 'j"HK')
    .replaceAll('ûuH', 'juHK')
    .replaceAll('ûzH', 'jzHK')
    .replaceAll('ûAH', 'jAHK')
    .replaceAll('ûrH', 'jrHK')
    .replaceAll('ûEH', 'jEHK')
    .replaceAll('û0H', 'j0HK')//Hend
    .replaceAll('ûyH', 'jyHK')//Hend
    .replaceAll('ûcd', 'jcdK')
    .replaceAll('û*d', 'j*dK')
    .replaceAll('ûid', 'jidK')
    .replaceAll('ûpd', 'jpdK')
    .replaceAll('ûZd', 'jZdK')
    .replaceAll("û'd", "j'dK")
    .replaceAll('û"d', 'j"dK')
    .replaceAll('ûud', 'judK')
    .replaceAll('ûzd', 'jzdK')
    .replaceAll('ûAd', 'jAdK')
    .replaceAll('ûrd', 'jrdK')
    .replaceAll('ûEd', 'jEdK')
    .replaceAll('û0d', 'j0dK')//Hend
    .replaceAll('ûyd', 'jydK')//Hend
    .replaceAll('ûc', 'jcK')
    .replaceAll('û*', 'j*K')
    .replaceAll('ûi', 'jiK')
    .replaceAll('ûp', 'jpK')
    .replaceAll('ûZ', 'jZK')
    .replaceAll("û'", "j'K")
    .replaceAll('û"', 'j"K')
    .replaceAll('ûu', 'juK')
    .replaceAll('ûz', 'jzK')
    .replaceAll('ûA', 'jAK')
    .replaceAll('ûr', 'jrK')
    .replaceAll('ûE', 'jEK')
    .replaceAll('û0', 'j0K')//Hend
    .replaceAll('ûy', 'jyK')//Hend
})


function copyToClipboard() {
  textBox.value.select()
  textBox.value.setSelectionRange(0, text.value.length + 1)
  navigator.clipboard.writeText(text.value)
}

function deleteText() {
  text.value = ""
}

onMounted(() => {

})

</script>

<style scoped>
@font-face {
  font-family: wininnwa;
  src: url(./assets/WININNWA.TTF);
}
</style>
