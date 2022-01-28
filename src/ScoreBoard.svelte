<script>
    export let user ={}
    export let gameDetails;
</script>

{#if user.score}
<div class="primary-text">
    <h2>Score:
        <div class="sbText">
            10/100
        </div>
    </h2>
    <h2>Level Played:
        <div class="sbText">
            Hard
        </div>
    </h2>
    <h2>Time Taken Per Question:
        <div class="sbText">
            3 sec
        </div>
    </h2>
</div>
{:else}
<div class="primary-text">
<h2>No score to display. Take a quiz to see score board.</h2>
</div>
{/if}

<style>
    .sbText{
        color: white;
        font-weight: bold;
    }
    h2 {
    padding: 3%;
    font-size: 3em;
    font-family: "Lucida Sans", "Lucida Sans Regular", "Lucida Grande",
      "Lucida Sans Unicode", Geneva, Verdana, sans-serif;
    font-weight: 100;
    color: rgb(#0d1821);
	text-align: center;
  }
</style>