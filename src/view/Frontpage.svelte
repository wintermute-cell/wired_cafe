<script lang="ts">
  import {fade} from 'svelte/transition';
  import LoginForm from './FrontpageComponents/LoginForm.svelte';
  import RegistrationForm from './FrontpageComponents/RegistrationForm.svelte';

  export let gotoFrontpage;
  export let gotoClientpage;
  export let gotoReceptionist;

  let showLoginForm = false;
  function activateLoginForm() {
    showRegistrationForm = false;
    showLoginForm = true;
  }
  let showRegistrationForm = false;
  function activateRegistrationForm() {
    showLoginForm = false;
    showRegistrationForm = true;
  }
</script>

<main>
  <div id="client-type-card-container">
    <div class="client-type-card noselect" on:click={gotoReceptionist}>
      Guest
    </div>
    <div class="client-type-card noselect" on:click={activateLoginForm}>
      Login
    </div>
    <div class="client-type-card noselect" on:click={activateRegistrationForm}>
      Register
    </div>
  </div>
  {#if showLoginForm}
    <div in:fade>
      <LoginForm />
    </div>
  {/if}
  {#if showRegistrationForm}
    <div in:fade>
      <RegistrationForm />
    </div>
  {/if}
</main>

<style>
  main {
    text-align: center;
    padding: 1em;
    margin: 0 auto;
  }

  #client-type-card-container {
    position: relative;
    margin-top: 3em;
  }

  .client-type-card {
    display: inline-block;
    margin: 3vw;
    padding: 3vw 2vw 2vw 2vw;
    height: 4em;
    width: 19vw;
    border-radius: 24px;
    border: 3px var(--laccent) dotted;
    transition: box-shadow 0.2s;
    font-size: 2em;
  }

  .client-type-card:hover {
    box-shadow: var(--shadow-elevation-medium);
  }

  .client-type-card:active {
    box-shadow: var(--shadow-elevation-low);
  }
</style>
