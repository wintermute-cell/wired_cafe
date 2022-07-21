<script lang="ts">
  import {onMount} from 'svelte';
  import {IP_ADDR} from '../config';

  export let gotoFrontpage;
  export let gotoClientpage;
  export let gotoReceptionist;

  // the following interfaces/arrays hold information about the room.
  interface Message {
    sender: string;
    content: string;
  }
  let messages: Array<Message> = [];

  interface User {
    name: string;
  }
  let users: Array<User> = [];

  onMount(async () => {
    // fetch initial data from the server
    fetch(IP_ADDR + '/hello', {credentials:'include'}).then(() => {
      fetch(IP_ADDR + '/room/join', {credentials:'include'})
        .then(response => response.json())
        .then(data => {
          if (data['message'] === 'Success') {
            const frii = setInterval(fetchRoomInfo, 30000);
            fetchRoomInfo();
            return () => clearInterval(frii);
          } else {
            console.log(data)
          }
        })
        .catch(error => {
          console.log(error);
          return [];
        });
    }).catch(error => {
      console.log(error);
      return [];
    });

    // start periodical fetching of room info
    async function fetchRoomInfo() {
    fetch(IP_ADDR + '/room/info', {credentials:'include'})
      .then(response => response.json())
      .then(data => {
        console.log(data);
      })
      .catch(error => {
        console.log(error);
        return [];
      });
    }
  });
</script>

<main>
  <div id="user-list">
    {#each users as user}
      {user.name}
    {/each}
  </div>
  <div id="message-log">
    {#each messages as msg}
      {msg.content}
    {/each}
  </div>
</main>

<style>
  main {
    text-align: center;
    padding: 1em;
    margin: 0 auto;
  }
</style>
