<template>
    <div class="sky_titleBar">
        <slot></slot>
    </div>
</template>

<style scoped>
.sky_titleBar {
    -webkit-app-region: drag;
    width: 100%;
    height: 40px;
    position: sticky;
    top: 0;
    background-color: #FFFFFF;
}
</style>

<script setup lang="ts">

</script>


<style>
.sky_titleBar * {
    -webkit-app-region: no-drag;
}
</style>