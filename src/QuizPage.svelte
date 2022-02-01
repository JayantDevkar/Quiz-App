<script>
	import {ProgressCircular,Button} from 'svelte-materialify';
    export let user = {}
    export let setUserState;
	import Question from "./Question.svelte"
	import { onMount } from "svelte";
	let questions;
	let answers = {}
	function setAnswer(qId, ans){
		answers[qId] = ans
		// console.log("THE ANSWER ARRAY NOW =",answers)
	}
	async function handleSubmitQuiz(){
		//call function to send answers to dataBase
		console.log("chackind",answers)
		const db_res = await fetch(`https://whispering-tor-80065.herokuapp.com/api/submit/quiz?answer=${JSON.stringify(answers)}`)
		const feed = await db_res.json();
		if (db_res.ok){
			console.log("Quiz Submitted",feed, typeof feed)
		}else{
			// throw new Error();
		}
		setUserState(false, feed)
	}

	onMount(async () => {
		console.log("gonna send",user)
		if (user.isNew){
			const db_res =  await fetch(`https://whispering-tor-80065.herokuapp.com/api/set/user?uuid=${user.uuid}&name=${user.name}`)
			const usr = await db_res.json();
			if (db_res.ok){
				console.log("User is created in DB",usr)
				user['_id'] = usr._id
			}else{
				throw new Error(usr);
			}
		}
		const params = {uuid: user.uuid, level : user.level, number: user.numberQ}
		const res = await fetch(`https://whispering-tor-80065.herokuapp.com/api/get/questions?uuid=${user.uuid}&level=${user.level}&number=${user.numberQ}`);
		const text = await res.json();
        console.log("data patao",JSON.stringify(text))
		if (res.ok) {
			questions = text.quiz
			answers['attemptId'] = text.attemptId
			return text;
		} else {
			throw new Error(text);
		}
  });
</script>



<!-- replace this element -->
{#await questions}
<div class="loader">
	<p>waiting for the promise to resolve...</p></div>
 wairt
{:then questions}
{#if questions}
{#each questions as question}
	<div class="question-card">
		<Question {question} {setAnswer}/>
	</div>
{/each}
<div class="submit-quiz-button">
	<Button rounded class="primary-color" size="x-large" on:click={handleSubmitQuiz}  >Submit Quiz</Button>
</div>
{/if}
{:catch error}
	<p style="color: red">{error.message}</p>
{/await}

<style>
	.submit-quiz-button{
		justify-self: center;
	}
	.question-card{
		padding: 2%;
	}
	.loader{
		color: aliceblue;
		font-weight: bolder;
	}
</style>