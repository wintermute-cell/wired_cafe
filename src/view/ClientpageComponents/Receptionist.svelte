<script lang="ts">
  import {onDestroy} from 'svelte';
  import {fade} from 'svelte/transition';
  import {ProgressType} from '../../stores';
  import {progressType, taskList} from '../../stores.js';

  function setProgressType(type: ProgressType) {
    progressType.update(() => type);
  }

  let progressTypeValue: ProgressType;
  progressType.subscribe(val => {
    progressTypeValue = val;
  });

  let taskListValue: Array<string>;
  taskList.subscribe(val => {
    taskListValue = val;
  });

  onDestroy(() => {
    setProgressType(ProgressType.UNDEFINED);
  });
</script>

<main>
  <h2>Welcome to the wired.café</h2>
  <div id="questions">
    <div id="question-1">
      <!-- WHAT TYPE OF PROGRESS TRACKING -->
      <p>
        Do you wish to stay and work for a certain
        <button
          on:click={() => {
            setProgressType(ProgressType.TIME);
          }}>time</button
        >
        <br /> or until you have finished all of your
        <button
          on:click={() => {
            setProgressType(ProgressType.TASK);
          }}>tasks</button
        >
        ?
      </p>
    </div>
    <div id="question-2">
      <!-- HOW MUCH THE USER WANTS TO ACHIEVE -->
      {#if progressTypeValue == ProgressType.TIME}
        <div in:fade>
          Great! How long are you planning on staying here then? <br />
        </div>
      {:else if progressTypeValue == ProgressType.TASK}
        <div in:fade>
          Great! What is it you are planning on accomplishing this time? <br />
        </div>
      {/if}
    </div>
  </div>
</main>

<style>
  #questions button {
    background: none;
    border: 2px var(--laccent) solid;
    border-radius: 10px;
    padding: 0.1em 0.4em 0.1em 0.4em;
    font-family: 'Crimson Text';
    font-size: 1em;
    font-weight: bold;
    color: var(--daccent);
    transition: box-shadow 0.2s;
  }

  #questions button:hover {
    box-shadow: var(--shadow-elevation-medium);
  }

  #questions button:active {
    box-shadow: var(--shadow-elevation-low);
  }

  #questions button:focus {
    box-shadow: var(--shadow-inset-medium);
    background-color: var(--bg-color-dark);
  }
</style>
