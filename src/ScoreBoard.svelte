

<script>
      import {Card, CardText,Row, Button} from 'svelte-materialify';
    export let user ={}
    export let attempts;
    let count = 0
    async function get_scores(){   
        const db_res = await fetch(`https://whispering-tor-80065.herokuapp.com/api/get/scores?uuid=${user.uuid.toString()}`)
        const feed = await db_res.json();
        if (db_res.ok){
			attempts = feed
		}
    }
    function log_attmp(attempts){
        if(attempts){
            console.log(Object.keys(attempts).length)
            attempts.map((x)=>{
            console.log("Key" , x, typeof x,"keys of x", Object.keys(x) )
        })
        }
    }
    $:log_attmp(attempts)

</script>

{#if attempts}
<div class="head">
    <h2>
        Score : {user.score} Out of {attempts.length}
    </h2>
</div>
{#each attempts as attmp}
<div class="d-flex justify-center mt-4 mb-4">
    <div class="card-padding">
        <Card shaped raised style="width:600px;">
            <div class="pl-4 pr-4 pt-3">
                <div class="card-question">
                  <span class="primary-text">Q : {attmp.asked.replace(/['"]+/g, '')}</span>
                </div>
              <br />
            </div>
            <CardText>
              <Row>
                  {#if !attmp.isCorrect}
                  <div class="card-score">
                    <span class="red-text">You answered: {attmp.answered.replace(/['"]+/g, '')}</span>
                    <br/>
                    <br/>
                    <span class="green-text">Correct Answer: {attmp.correct.replace(/['"]+/g, '')}</span>
                  </div>
                  {:else}
                  <div class="card-score">
                    <span class="green-text">Correct Answer: {attmp.answered.replace(/['"]+/g, '')}</span>
                  </div>
                  {/if}
              </Row>
            </CardText>
            <!-- <script>count+=1</script> -->
          </Card>
    </div>
</div>
{/each}
{:else}
<h3>
    <span class="red-text">
        No score to show. Please take the quiz first.
    </span>
</h3>
{/if}


<style>
        h2 {
    font-size: 3em;
    font-family: Cambria, Cochin, Georgia, Times, 'Times New Roman', serif;
    /* font-family:'Gill Sans', 'Gill Sans MT', Calibri, 'Trebuchet MS', sans-serif; */
    /* font-family: "Lucida Sans", "Lucida Sans Regular", "Lucida Grande",
      "Lucida Sans Unicode", Geneva, Verdana, sans-serif; */
    font-weight: medium;
	text-align: center;
  }
  h3 {
    font-size: 3em;
    font-family: Cambria, Cochin, Georgia, Times, 'Times New Roman', serif;
    /* font-family:'Gill Sans', 'Gill Sans MT', Calibri, 'Trebuchet MS', sans-serif; */
    /* font-family: "Lucida Sans", "Lucida Sans Regular", "Lucida Grande",
      "Lucida Sans Unicode", Geneva, Verdana, sans-serif; */
    font-weight: medium;
	text-align: left;
  }
    .card-padding{
        padding: 2%;
        justify-self: center;
    }
    .SubmitButton{
        padding-left: 35%;
        padding-top: 10%;
		justify-self: center;
    }
    .card-question{
        font-weight: medium;
        font-family: Cambria, Cochin, Georgia, Times, 'Times New Roman', serif;
        font-size: 210%;
    }
    .card-score{
        font-family:Cambria, Cochin, Georgia, Times, 'Times New Roman', serif;
        text-align: left;
        font-size: 180%;
        padding: 2%;
    }

</style>