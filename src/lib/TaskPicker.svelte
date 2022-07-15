<script lang="ts">
  import * as animateScroll from 'svelte-scrollto';
  import {onMount} from 'svelte';

  export let tasks: Array<string> = [];

  let inputField;

  // focus the input field as soon as its available
  onMount(() => inputField.focus());

  // when the field is focussed, move the cursor to the left
  function handleFocus() {
    inputField.setSelectionRange(0, 0, 'none');
  }

  function handleKeydown(e: KeyboardEvent) {
    // make enter and tab behave as 'add to list' buttons, but
    // don't modify their behaviour when the input is empty.
    if (!inputField.value.match(/^\s+$/) && inputField.value !== '') {
      if (e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault();
        tasks = [...tasks, inputField.value];
        inputField.value = '';
        animateScroll.scrollTo({element: '#new-task'});
      }
    }
  }
</script>

<main>
  <ul id="task-list">
    {#each tasks as task, idx}
      <li>
        {task}
        <div
          class="task-remove-button"
          on:click={() => {
            tasks.splice(idx, 1);
            tasks = tasks;
          }}
        >
          🗑
        </div>
      </li>
    {/each}
    <li>
      <input
        type="text"
        name="new-task"
        id="new-task"
        bind:this={inputField}
        on:focus={handleFocus}
        on:keydown={handleKeydown}
      />
    </li>
  </ul>
</main>

<style>
  #task-list {
    text-align: left;
    line-height: 1.6;
  }

  .task-remove-button {
    margin-left: 1vw;
    text-align: left;
    display: inline-block;
    color: var(--err-color);
    transition: transform 0.2s;
  }

  .task-remove-button:hover {
    transform: scale(1.2);
  }

  #new-task {
    width: 80%;
    background: none;
    border: 2px var(--laccent) solid;
    border-radius: 10px;
    text-align: center;
    font-size: 1em;
    font-family: 'Crimson Text';
    color: var(--daccent);
    font-weight: bold;
    transition: box-shadow 0.2s;
  }

  #new-task:focus {
    box-shadow: var(--shadow-elevation-medium);
    outline: none;
  }
</style>
