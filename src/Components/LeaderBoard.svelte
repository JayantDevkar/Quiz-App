<script>
  import {Card} from 'svelte-materialify';
  export let user = {};
  let leaderBoard =[];
  import { onMount } from "svelte";

  const get_leaderboard= async(lol=false)=>{
    const res = await fetch(`https://whispering-tor-80065.herokuapp.com/api/get/leader/board`)
    const leaderboard = await res.json()
    if(res.ok){
        leaderBoard = leaderboard
        console.log(leaderBoard, typeof leaderBoard)
    }
  }
  onMount(()=>get_leaderboard)

  $: get_leaderboard(user['score'])
</script>
<div class="head">
  <h2>
      Leader Board
  </h2>
  <br/>
</div>
{#each leaderBoard as leader}
<div class="d-flex justify-center mt-4 mb-4">
  <div class="card-padding">
      <Card shaped raised style="width:700px;">
          <div class="pl-4 pr-4 pt-3">
              <div class="card-question">
                  <div class="d-flex justify-space-around">
                        <span class="primary-text">{leader.name}</span>
                        <span class="green-text">{leader.score}</span> 
                        <span>{leader.date}</span>
                  </div>
              </div>
            <br />
          </div>
          <!-- <script>count+=1</script> -->
        </Card>
  </div>
</div>
{/each}


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
/* .pad{
    padding: 2%;

} */

  .card-padding{
      padding: 2%;
      justify-self: center;
  }
  .card-question{
      font-weight: medium;
      font-family: Cambria, Cochin, Georgia, Times, 'Times New Roman', serif;
      font-size: 210%;
  }


</style>