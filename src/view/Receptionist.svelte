<script lang="ts">
  import {onDestroy} from 'svelte';
  import {fade} from 'svelte/transition';
  import {ProgressType} from '../stores';
  import {progressType, workTime, taskList, checkup} from '../stores.js';
  import DurationPicker from '../lib/DurationPicker.svelte';
  import TaskPicker from '../lib/TaskPicker.svelte';
  import * as animateScroll from 'svelte-scrollto';

  export let gotoFrontpage;
  export let gotoClientpage;
  export let gotoReceptionist;

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

  let tasks; // stores the array coming from the TaskPicker component.
  function setTaskList(tasks: Array<string>) {
    taskList.update(() => tasks);
  }

  function setWorkTime(timeInMinutes: number) {
    workTime.update(() => timeInMinutes);
  }

  let checkupValue: boolean;
  checkup.subscribe(val => {
    checkupValue = val;
  });
  let hasSelectedCheckup = false;
  function setCheckup(should: boolean) {
    hasSelectedCheckup = true;
    checkup.update(() => should);
  }

  onDestroy(() => {
    setProgressType(ProgressType.UNDEFINED);
  });

  function onValidTimeInput(timeInput: string) {
    let split = timeInput.split(':');
    let timeInMinutes = parseInt(split[0]) * 60 + parseInt(split[1]);
    setWorkTime(timeInMinutes);
    onValidProgressAmount();
  }
  function onInvalidTimeInput() {
    renderableMessages = 4;
    isValidProgressAmount = false;
  }

  let isValidProgressAmount = false;
  function onValidProgressAmount() {
    isValidProgressAmount = true;
    //renderableMessages = 4;
  }

  // this is used to delay the rendering of multiple messages
  const MSG_RENDER_DELAY = 2000;
  let renderableMessages = 1;
  function onMessageLoad() {
    console.log('onload');
    animateScroll.scrollToBottom();
    setTimeout(() => {
      renderableMessages += 1;
    }, MSG_RENDER_DELAY);
  }
</script>

<main>
  <h2>Welcome to the wired.café</h2>
  <div id="messages">
    <div id="question-answer-1">
      <div class="question">
        <!-- WHAT TYPE OF PROGRESS TRACKING -->
        Do you wish to stay and work for a certain
        <button
          on:click={() => {
            setProgressType(ProgressType.TIME);
            renderableMessages = 1;
            isValidProgressAmount = false;
          }}>time</button
        >
        <br /> or until you have finished all of your
        <button
          on:click={() => {
            setProgressType(ProgressType.TASK);
            renderableMessages = 1;
            isValidProgressAmount = false;
          }}>tasks</button
        >
        ?
      </div>
      {#if progressTypeValue === ProgressType.TIME && renderableMessages >= 1}
        <div class="answer" in:fade on:introstart={onMessageLoad}>
          <h3>Time</h3>
        </div>
      {:else if progressTypeValue === ProgressType.TASK}
        <div class="answer">
          <div in:fade on:introstart={onMessageLoad}>
            <h3>Tasks</h3>
          </div>
        </div>
      {/if}
    </div>
    <div id="question-answer-2">
      <!-- HOW MUCH THE USER WANTS TO ACHIEVE -->
      {#if progressTypeValue === ProgressType.TIME && renderableMessages >= 2}
        <div in:fade on:introstart={onMessageLoad}>
          <div class="question" id="question-2">
            Great! How long do you plan to stay?<br />
          </div>
        </div>
        {#if renderableMessages >= 3}
          <div in:fade on:introstart={onMessageLoad}>
            <div class="answer">
              <DurationPicker
                duration="hh:mm"
                callWhenValid={onValidTimeInput}
                callWhenInvalid={onInvalidTimeInput}
              />
            </div>
          </div>
        {/if}
      {:else if progressTypeValue === ProgressType.TASK && renderableMessages >= 2}
        <div class="question" id="question-2">
          <div in:fade on:introstart={onMessageLoad}>
            Great! What do you plan to accomplish?<br />
          </div>
        </div>
        {#if renderableMessages >= 3}
          <div class="answer">
            <div in:fade on:introstart={onMessageLoad}>
              The following tasks...<br />
              <TaskPicker bind:tasks />
              <button
                on:click={() => {
                  if (tasks.length > 0) {
                    onValidProgressAmount();
                    setTaskList(tasks);
                  }
                }}>Done</button
              >
            </div>
          </div>
        {/if}
      {/if}
    </div>
    <div id="question-answer-3">
      <!-- HOW MUCH PRESSURE THE USER WANTS -->
      {#if isValidProgressAmount && renderableMessages >= 4}
        <div class="question" id="question-2">
          <div in:fade on:introstart={onMessageLoad}>
            Last Question. Do you want me to
            <button
              on:click={() => {
                setCheckup(true);
              }}>check on your progress</button
            >
            every hour, or
            <button
              on:click={() => {
                setCheckup(false);
              }}>leave you alone</button
            >
            ?<br />
          </div>
        </div>
        {#if hasSelectedCheckup && renderableMessages >= 5}
          <div class="answer">
            <div in:fade on:introstart={onMessageLoad}>
              <h3>
                {#if checkupValue === true}
                  Check on progress
                {:else}
                  Leave alone
                {/if}
              </h3>
            </div>
          </div>
        {/if}
      {/if}
    </div>
    <div id="question-answer-4">
      <!-- FINAL MESSAGE; OFFER TO ENTER THE CAFE -->
      {#if hasSelectedCheckup && renderableMessages >= 6}
        <div class="question" id="question-2">
          <div in:fade on:introstart={onMessageLoad}>
            Thank you, that's all for now. Please go ahead and
            <button
              on:click={() => {
                gotoClientpage();
              }}>enter the café</button
            >
            !
          </div>
        </div>
      {/if}
    </div>
  </div>
</main>

<style>
  h2 {
    text-decoration: underline;
  }

  .question,
  .answer {
    position: relative;
    border-radius: 24px;
    border: 3px var(--laccent) solid;
    padding: 0.8em 1.4em 0.8em 1.4em;
    margin: 2em 34vw 2em 10vw;
  }
  .answer {
    margin-left: 34vw;
    margin-right: 10vw;
  }

  .answer::before,
  .answer::after,
  .question::before,
  .question::after {
    content: '\0020';
    display: block;
    position: absolute;
    bottom: -15px;
    left: 20px;
    z-index: 2;
    width: 0;
    height: 0;
    overflow: hidden;
    border: solid 20px transparent;
    border-bottom: 0;
    border-top-color: var(--bg-color);
  }

  .answer::before,
  .question::before {
    bottom: -20px;
    z-index: 1;
    border-top-color: var(--laccent);
  }

  .answer::before,
  .answer::after {
    right: 20px;
    left: auto;
  }

  #messages button {
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

  #messages button:hover {
    box-shadow: var(--shadow-elevation-medium);
  }

  #messages button:active {
    box-shadow: var(--shadow-elevation-low);
  }

  #messages h3 {
    color: var(--daccent);
    margin: 0;
  }
  #messages h3::before {
    content: '„';
    padding: 0 3px 0 3px;
  }
  #messages h3::after {
    content: '“';
    padding: 0 3px 0 3px;
  }
</style>
