<template>
  <div class="flex">
    <textarea placeholder="Uni to Win" v-model="text"></textarea>
    <textarea ref="textBox" readonly v-model="textMod"></textarea>
  </div>
  <button @click="copyToClipboard">Copy</button>
</template>

<script setup>

import { ref, computed } from 'vue'
const text = ref('')
const textBox = ref(null)
const textMod = computed(() => {
  return text.value
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

</script>
<style scoped>
.flex {
  display: flex;
  align-items: center;
}

textarea {
  margin: 0 24px;
  width: min(500px, 40vw);
  height: 80vh;
  border: 1px solid black;
  overflow-y: scroll;
  padding: 5px;
  text-align: left;
  word-wrap: break-word;
}
</style>
