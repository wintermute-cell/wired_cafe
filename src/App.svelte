<script lang="ts">
  import {fade} from 'svelte/transition';
  import Frontpage from './view/Frontpage.svelte';
  import Clientpage from './view/Clientpage.svelte';
  import Receptionist from './view/Receptionist.svelte';

  let currentView: any = Frontpage;

  // this is the function intended to be used to change the view.
  let targetView: any = currentView;
  function setView(view: any) {
    targetView = view;
  }

  // this actually changes the visible view. It is only called from within
  // the fade animation.
  function _setView() {
    currentView = targetView;
  }
</script>

<main>
  <button on:click={() => setView(Frontpage)}>Front</button>
  <button on:click={() => setView(Receptionist)}>Reception</button>
  <button on:click={() => setView(Clientpage)}>Client</button>
  {#if currentView == targetView}
    <div id="viewport" on:outroend={_setView} transition:fade>
      <svelte:component
        this={currentView}
        gotoFrontpage={() => setView(Frontpage)}
        gotoReceptionist={() => setView(Receptionist)}
        gotoClientpage={() => setView(Clientpage)}
      />
    </div>
  {/if}
</main>

<style>
  @font-face {
    font-family: 'Crimson Text';
    font-style: italic;
    font-weight: 400;
    src: local(''),
      url('./assets/font/crimson-text-v19-latin-italic.woff2') format('woff2'),
      /* Chrome 26+, Opera 23+, Firefox 39+ */
        url('./assets/font/crimson-text-v19-latin-italic.woff') format('woff'); /* Chrome 6+, Firefox 3.6+, IE 9+, Safari 5.1+ */
  }

  :root {
    font-family: 'Crimson Text';
    --laccent: #d9d2c2;
    --daccent: #7d7970;
    --bg-color: #fdf6e3;
    --bg-color-dark: #f8ecd0;
    --bg-texture: url('./assets/pattern/halftone.png');
    --correct-color: #989a49;
    --err-color: #d16553;
    --warn-color: #f4d47d;
    --shadow-color: 44deg 28% 59%;
    --shadow-inset-low: inset 0.3px 0.3px 0.5px hsl(var(--shadow-color) / 0.34);
    --shadow-inset-medium: inset 2.6px 2.6px 4.1px -1.7px hsl(var(
            --shadow-color
          ) / 0.36);
    --shadow-elevation-low: 0.3px 0.3px 0.5px hsl(var(--shadow-color) / 0.34),
      0.5px 0.5px 0.8px -1.2px hsl(var(--shadow-color) / 0.34),
      1.3px 1.3px 2.1px -2.5px hsl(var(--shadow-color) / 0.34);
    --shadow-elevation-medium: 0.3px 0.3px 0.5px hsl(var(--shadow-color) / 0.36),
      1px 1.1px 1.7px -0.8px hsl(var(--shadow-color) / 0.36),
      2.6px 2.6px 4.1px -1.7px hsl(var(--shadow-color) / 0.36),
      6.3px 6.4px 10.1px -2.5px hsl(var(--shadow-color) / 0.36);
    --shadow-elevation-high: 0.3px 0.3px 0.5px hsl(var(--shadow-color) / 0.34),
      1.8px 1.9px 2.9px -0.4px hsl(var(--shadow-color) / 0.34),
      3.4px 3.5px 5.5px -0.7px hsl(var(--shadow-color) / 0.34),
      5.6px 5.7px 9px -1.1px hsl(var(--shadow-color) / 0.34),
      8.9px 9.2px 14.4px -1.4px hsl(var(--shadow-color) / 0.34),
      14px 14.3px 22.5px -1.8px hsl(var(--shadow-color) / 0.34),
      21.2px 21.8px 34.2px -2.1px hsl(var(--shadow-color) / 0.34),
      31.3px 32.1px 50.4px -2.5px hsl(var(--shadow-color) / 0.34);
  }

  :global(body, html) {
    background-color: var(--bg-color);
    background-repeat: repeat;
    background-size: 50%;
    position: relative;
    z-index: 0;
    -ms-overflow-style: none; /* Internet Explorer 10+ */
    scrollbar-width: none; /* Firefox */
  }
  :global(body::-webkit-scrollbar, html::-webkit-scrollbar) {
    display: none; /* Safari and Chrome */
  }
  :global(::-moz-selection, ::selection) {
    /* Code for Firefox */
    color: var(--daccent);
    background: var(--laccent);
  }

  :global(.noselect) {
    -webkit-touch-callout: none; /* iOS Safari */
    -webkit-user-select: none; /* Safari */
    -khtml-user-select: none; /* Konqueror HTML */
    -moz-user-select: none; /* Old versions of Firefox */
    -ms-user-select: none; /* Internet Explorer/Edge */
    user-select: none; /* Non-prefixed version, currently
                                    supported by Chrome, Edge, Opera and Firefox */
  }
  main {
    text-align: center;
    margin: 0;
    padding: 0;
    color: var(--daccent);
    line-height: 1.9;
    font-size: 1.4em;
  }
</style>
