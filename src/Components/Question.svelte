<script>
  export let question;
  export let setAnswer;
  export let answer;
  $: setAnswer(question._id, answer);
  import {
    Card,
    CardText,
    CardActions,
    ButtonGroup,
    ButtonGroupItem,
    Row,
  } from "svelte-materialify";
  let opt = ["A", "B", "C", "D"];
  let answers = [0, 1, 2, 3];
</script>

<div class="d-flex justify-center mt-4 mb-4">
  <Card shaped raised style="width:800px;">
    <div class="pl-4 pr-4 pt-3">
      <div class="card-question">
        <span class="primary-text"
          >{JSON.stringify(question.ask).replace(/["]+/g, "")}</span
        >
      </div>
      <br />
    </div>
    <CardText>
      {#each answers as answer}
        <Row>
          <div class="card-text">
            {opt[answer]} : {JSON.stringify(question.options[answer]).replace(
              /["]+/g,
              ""
            )}
            <br />
          </div>
        </Row>
      {/each}
    </CardText>
    <CardActions>
      <ButtonGroup
        elevated
        mandatory
        activeClass="primary-color white-text"
        bind:value={answer}
      >
        <div class="choice-spacing">
          <ButtonGroupItem raised>A</ButtonGroupItem>
        </div>
        <div class="choice-spacing">
          <ButtonGroupItem raised>B</ButtonGroupItem>
        </div>
        <div class="choice-spacing">
          <ButtonGroupItem raised>C</ButtonGroupItem>
        </div>
        <div class="choice-spacing">
          <ButtonGroupItem raised>D</ButtonGroupItem>
        </div>
      </ButtonGroup>
      <br />
    </CardActions>
  </Card>
</div>

<style>
  .card-question {
    font-weight: medium;
    font-family: Cambria, Cochin, Georgia, Times, "Times New Roman", serif;
    font-size: 210%;
  }
  .card-text {
    font-family: Cambria, Cochin, Georgia, Times, "Times New Roman", serif;
    text-align: center;
    font-size: 180%;
    padding: 2%;
  }
  .choice-spacing {
    padding-left: 25%;
    padding-right: 25%;
    size: large;
    font-size: x-large;
    font-weight: bolder;
  }
</style>
