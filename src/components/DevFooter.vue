<template>
    <div class="px-4 text-center" @load="size">
        <p> Unicode to Win Innwa Convertor</p>
        <p>Credit to <a href="https://github.com/thanlwinsoft" class="text-yellow-400 hover:underline">Thanliwnsoft</a> </p>
        <div class="flex items-center justify-center">
            <p> Reuploaded By </p>
            <a href="https://github.com/zai185" class="flex items-center text-yellow-400 hover:underline">
                <GithubIcon />
                Zai185
            </a>
        </div>
    </div>
</template>


<script setup>

import GithubIcon from './icons/GithubIcon.vue';

function size(e){
    console.log(e)
}
</script>