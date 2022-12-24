<script lang="ts">
    import Login from "./lib/Login.svelte";
</script>

<main>
    <Login />
</main>

<style>
    :global(:root) {
        --bg_primary: #F7EBE6;
        --bg_secondary: #B39B8F;
        --bg_tertiary: #836C68;
        --fg_primary: #C7D1D6;
        --fg_secondary: #E5E5E5;
    }

    :global(body) {
        background-color: var(--bg_primary);
        color: var(--fg_primary);
    }
</style>
