<script lang="ts">
  import * as animateScroll from 'svelte-scrollto';
  import {onMount} from 'svelte';

  export let duration: string = 'hh:mm';
  export let callWhenValid;
  export let callWhenInvalid: () => void;

  animateScroll.scrollTo({element: '.duration-picker', offset: 200});
  let inputField: HTMLInputElement;

  // focus the input field as soon as its available
  onMount(() => inputField.focus());

  let isValid = false;
  function setValid() {
    isValid = true;
    callWhenValid(inputField.value);
  }
  function setInvalid() {
    isValid = false;
    callWhenInvalid();
  }
  let error = '';

  const validDurationRegex: string = '^(([01][0-9])|(2[0-3])):(([0-5][0-9]))$';

  function handleKeyup() {
    // insert a colon if the field was emptied
    if (inputField.value === '') {
      inputField.value = ':';
      inputField.setSelectionRange(0, 0, 'none');
    }
  }

  function handleBlur() {
    if (inputField.value.match(/^\s*$/)) {
      inputField.value = '00:00';
    }

    let s = inputField.value.split(':');
    let hours = s[0];
    let minutes = s[1];

    hours = '0'.repeat(2 - hours.length) + hours;
    minutes = '0'.repeat(2 - minutes.length) + minutes;
    inputField.value = hours + ':' + minutes;

    // check for validity
    setInvalid();
    if (inputField.value.match(validDurationRegex)) {
      setValid();
    } else if (inputField.value.match(/^\d{2}:\d{2}$/)) {
      error = 'Thats too long! Consider something below 24h.';
    }
  }

  // when the field is focussed, move the cursor to the left
  function handleFocus() {
    inputField.setSelectionRange(0, 0, 'none');
  }

  function handleKeypress(e: KeyboardEvent) {
    // prevent all default actions for non-digit keys (except tab, which is handled below)
    if (e.key.match(/^\D$/) && e.key !== 'Tab') {
      e.preventDefault();
    }

    // if empty, insert a colon
    if (inputField.value.match(/^\s*$/)) {
      inputField.value = ':';
      inputField.setSelectionRange(0, 0, 'none');
    }

    function colonPos(): number {
      return inputField.value.indexOf(':');
    }

    // handle backspace and delete
    if (inputField.selectionStart - inputField.selectionEnd === 0) {
      if (
        e.key === 'Backspace' &&
        inputField.selectionStart === colonPos() + 1
      ) {
        e.preventDefault();
        inputField.setSelectionRange(colonPos(), colonPos(), 'none');
        return;
      } else if (
        e.key === 'Delete' &&
        inputField.selectionStart === colonPos()
      ) {
        e.preventDefault();
        inputField.setSelectionRange(colonPos() + 1, colonPos() + 1, 'none');
        return;
      }
    }

    let s = inputField.value.split(':');
    let hours = s[0];
    let minutes = s[1];

    // handle entering more than two digits
    if (e.key.match(/^\d$/)) {
      // handle third digit in hours number.
      if (inputField.selectionStart <= colonPos() - 1 && hours.length >= 2) {
        inputField.setSelectionRange(0, colonPos(), 'backward');
      } else if (
        inputField.selectionStart === colonPos() &&
        hours.length >= 2
      ) {
        inputField.setSelectionRange(
          colonPos() + 1,
          inputField.value.length,
          'backward'
        );
      }
      if (inputField.selectionStart > colonPos() && minutes.length >= 2) {
        if (inputField.selectionEnd - inputField.selectionStart === 0) {
          inputField.setSelectionRange(
            colonPos() + 1,
            inputField.value.length,
            'backward'
          );
        }
      }
      return;
    }

    // handle colon (and similars like space, ...)
    if (
      e.key === ':' ||
      e.key === ' ' ||
      e.key === '.' ||
      e.key === '\\' ||
      e.key === '/'
    ) {
      if (inputField.selectionStart <= colonPos()) {
        inputField.setSelectionRange(
          colonPos() + 1,
          inputField.value.length,
          'backward'
        );
      }
      e.preventDefault();
      return;
    }

    // handle tab and shift+tab
    if (e.key === 'Tab') {
      if (e.shiftKey) {
        if (inputField.selectionStart > colonPos()) {
          inputField.setSelectionRange(0, colonPos(), 'backward');
          e.preventDefault();
        }
      } else {
        if (inputField.selectionStart <= colonPos()) {
          inputField.setSelectionRange(
            colonPos() + 1,
            inputField.value.length,
            'backward'
          );
          e.preventDefault();
        }
      }
      return;
    }
  }
</script>

<main>
  <div class="picker-wrapper {isValid ? 'valid' : ''}">
    <input
      type="text"
      name="duration-picker"
      class="duration-picker {isValid ? 'valid' : ''}"
      bind:value={duration}
      bind:this={inputField}
      on:focus={handleFocus}
      on:keydown={handleKeypress}
      on:keyup={handleKeyup}
      on:blur={handleBlur}
    />
  </div>
  {#if !isValid}
    <p id="input-error">{error}</p>
  {/if}
</main>

<style>
  #input-error {
    font-size: 0.7em;
    margin-top: 0;
    color: var(--err-color);
  }

  .duration-picker {
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

  .duration-picker:focus {
    box-shadow: var(--shadow-elevation-medium);
    outline: none;
  }

  .picker-wrapper::after {
    content: ' ✖';
    position: inline-block;
    color: var(--err-color);
    height: 100%;
  }

  .picker-wrapper.valid::after {
    position: inline-block;
    content: ' ✔';
    color: var(--correct-color);
    height: 100%;
  }
</style>
