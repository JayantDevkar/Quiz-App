<script>
  import {
    Tabs,
    Tab,
    Window,
    WindowItem,
    AppBar,
    MaterialApp,
  } from "svelte-materialify";
  import { v4 as uuidv4 } from "uuid";
  import ScoreBoard from "./Components/ScoreBoard.svelte";
  import UserForm from "./Components/UserDetailForm.svelte";
  import LeaderBoard from "./Components/LeaderBoard.svelte";
  let value = 0; //variable to keep track of values
  let user = {};
  let attempts;
  function setScreen(number) {
    if (number) {
      console.log("THE Fnumbrsce", attempts);
      value = number;
      delete user["screenNumber"];
    }
  }
  function setFeedBack(feed) {
    if (feed) {
      attempts = feed;
      console.log(
        "THE FEEED BACK BOLTE",
        typeof Object.values(attempts),
        Object.values(attempts)
      );
      delete user["feedback"];
    }
  }
  $: firstHeading = !user.isSet ? "Player Details" : "Quiz";
  $: setFeedBack(user["feedback"]);
  $: setScreen(user["screenNumber"]);

  user["uuid"] = uuidv4();
  user["isNew"] = true;
  console.log("Initial set user id", user["uuid"]);
  function setUser(usr) {
    console.log("Setting User", user);
    if (!user.score) {
      attempts = undefined;
    }
    user = usr;
  }
  $: console.log("user", user);
</script>

<MaterialApp theme="dark">
  <div class="bgDark">
    <AppBar class="primary-color">
      <span slot="title" class="title">
        <h2>J-Quiz</h2>
      </span>
      <div slot="extension">
        <Tabs bind:value fixedTabs>
          <div class="primary-text text-accent-1" slot="tabs">
            <Tab>{firstHeading}</Tab>
            <Tab>Score Board</Tab>
            <Tab>Leader Board</Tab>
            <Tab>About The Quiz</Tab>
          </div>
        </Tabs>
      </div>
    </AppBar>

    <Window {value} class="ma-4">
      <WindowItem>
        <UserForm {setUser} {user} />
        <!-- passing user and setUser -->
      </WindowItem>
      <WindowItem>
        <div class="darkbg">
          <ScoreBoard {user} {attempts} />
        </div>
      </WindowItem>
      <WindowItem>
        <LeaderBoard {user} />
        <!-- <QuizPage/> -->
      </WindowItem>
      <WindowItem>
        <h3>What is this is Quiz About?</h3>
        <h3>
          <p>
            <span class="primary-text">
              This is a silly quiz app that asks questions about Jay Devkar and
              then gives out a score.
            </span>
          </p>
        </h3>
      </WindowItem>
    </Window>
  </div>
</MaterialApp>

<style>
  :global(.dark) {
    background: #010b13;
  }

  .title {
    text-align: center;
    color: #010b13;
    font-size: 50px;
  }
  h3 {
    font-size: 2em;
    font-family: Cambria, Cochin, Georgia, Times, "Times New Roman", serif;
    font-weight: 100;
    text-align: left;
  }

  h2 {
    font-size: 1em;
    font-family: Cambria, Cochin, Georgia, Times, "Times New Roman", serif;
    font-weight: 100;
    color: rgb(#0d1821);
    text-align: center;
  }
</style>
