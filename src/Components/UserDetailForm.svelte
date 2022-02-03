<script>
  import {Radio, Alert,Icon, Button,TextField, Row, Col, MaterialApp } from 'svelte-materialify';
  import {v4 as uuidv4} from "uuid"
  export let user = {};
  export let setUser;
  import QuizPage from "./QuizPage.svelte"

    let name;
    let level //variable to store difficulty
    let numberQ = 1
    let alert = false;
    let isUserSet = false
    // $: sendUserDetail(user)

    function onDismiss() { //function to dimiss alert
        alert = false;
    }
    const setUserState= (state=false, feedback=false) =>{
        user['isSet'] = state
        if(feedback){
            console.log("The seeter", typeof feedback.feedBack, feedback)
            user['feedback'] = feedback.feedBack
            user['score'] = feedback.score
        }
        if(!state){
            user['screenNumber'] = 1
        }
        setUser(user)
        isUserSet = state
    }
    function handleSubmiUser (isNew=false){
        console.log(level,name)
        if (name && name.length>0 && level>0 ){
             //uuid to replace session. insecure, a scalable solution will require reddis-server.
            if(isNew){
                user['isNew'] = true
                user['uuid'] = uuidv4()
                delete user['score']
                console.log("New idd",user['uuid'])
            }else{
                if(isNew != "first"){
                    user['isNew'] = false
                }
            }
            user['name'] = name
            user['level'] = level
            user['numberQ'] = numberQ
            alert = false;
            isUserSet = true
            user['isSet'] = true
            console.log("the user after submit =",user,isUserSet)
            // QuizPages = get_QuizPages()
            setUser(user)
        }else{
            alert = true; 
        }
    }
    
</script>

    {#if alert}
    <div class="alert">
        <Alert class="primary-color" dismissible bind:visible={alert} on:dismiss={onDismiss}>
            Please fill out the form before starting the quiz.
          </Alert> 
          <!-- could make more specific alerts but there are only two input feilds so user should find it easy -->
    </div>
    {/if}
    {#if isUserSet}
        <QuizPage {setUserState} {user}/>
    {:else}
    <Row>
        <h2>
            <div class="FormHeadings">
                <div class="top-spacing">
                    Player Name:
                </div>
            </div>
        </h2>
        <div class="FormValues">
                <input type="text" class="inText" bind:value={name} >
        </div>
        <br />
    </Row>
    <Row>
            <div class="FormHeadings">
            <h2>
                    Difficulty Level:
            </h2>
            </div>
            <div class="FormValues2">
                <div class="d-flex justify-space-around">
                    <label>
                        <input type=radio bind:group={level} value={1}>
                        Stranger
                    </label>
                    
                    <label>
                        <input type=radio bind:group={level} value={2}>
                        Friend
                    </label>
                    
                    <label>
                        <input type=radio bind:group={level} value={3}>
                        Homie
                    </label>
                </div>
            </div>
    </Row>
    <Row>
        <div class="FormHeadings">
            <h2>
                    Number Of Questions:  
            </h2>
            </div>
            <div class="FormValues3">
                <input type=range bind:value={numberQ} min=1 max=5>
     
            </div>
            <div class="NumberQ">
                <h2>{numberQ}</h2>
            </div>
    
            
    </Row>
    <Row>
        {#if user.name}
        <div class="SubmitButton2">
            <Button rounded class="primary-color" size="x-large" on:click={()=>{handleSubmiUser(false)}} >Play as same player</Button>
        </div>
        <div class="SubmitButton3">
            <Button rounded class="primary-color" size="x-large" on:click={()=>{handleSubmiUser(true)}} >Submit New Player</Button>
        </div>
        {:else}
        <div  class="SubmitButton">
            <Button rounded class="primary-color" size="x-large" on:click={()=>{handleSubmiUser("first")}} >Start Quiz</Button>
        </div>
        {/if}
    </Row>    
    {/if}
    



<style>
    .FormHeadings{
        padding-top: 6%;
        padding-left: 20px;
        color: #6200EA;
        /* font-weight: ; */
    }
    .top-spacing{
        padding-top: 18%;
    }
    .SubmitButton{
        justify-self: center;
        padding-left: 45%;
        padding-top: 7%;
    }
    .SubmitButton2{
        justify-self: center;
        padding-left: 30%;
        padding-top: 7%; 
    }
    .SubmitButton3{
        justify-self: center;
        padding-left: 5%;
        padding-top: 7%; 
    }
    .FormValues {
        padding: 2%;
        padding-top: 5%;
        width: 50%;
    }
    .FormValues2 {
        padding: 5%;
        padding-top: 7%;
        width: 60%;
        font-size: x-large;
    }
    .FormValues3 {
        padding-left: 5%;
        padding-top: 7%;
    }
    .NumberQ{
        padding-left: 2%;
        padding-top: 5.7%;
    }
    .inText{
        font-size: x-large;
        color: #FFFFFF;
        background-color: rgb(47, 43, 43);
        text-align: center;
    }
    h2 {
    font-size: 3em;
    font-family: Cambria, Cochin, Georgia, Times, 'Times New Roman', serif;
    /* font-family:'Gill Sans', 'Gill Sans MT', Calibri, 'Trebuchet MS', sans-serif; */
    /* font-family: "Lucida Sans", "Lucida Sans Regular", "Lucida Grande",
      "Lucida Sans Unicode", Geneva, Verdana, sans-serif; */
    font-weight: medium;
	text-align: center;
  }
 input{
     accent-color:#6200EA ;  
 }

 .alert{
     width: 95%;
     padding:10px;
 }



</style>