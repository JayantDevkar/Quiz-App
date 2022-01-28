<script>
  import {Radio, Alert,Icon, Button,TextField, Row, Col, MaterialApp } from 'svelte-materialify';
  import {v4 as uuidv4} from "uuid"
  
  export let user = {};
    export let setUser;
    let name;
    let level //variable to store difficulty
    let numberQ = 1
    let alert = false;
    let isUserSet = false
    function onDismiss() { //function to dimiss alert
        alert = false;
    }
    const handleSubmiUser = (isNew=false)=>{
        console.log(level,name)
        if (name && name.length>0 && level>0 ){
             //uuid to replace session. insecure, a scalable solution will require reddis-server.
            if(isNew){
                user['uuid'] = uuidv4()
            }
             user['name'] = name
            user['level'] = level
            user['numberQ'] = numberQ
            user['score'] = 69
            // console.log(user)
            alert = false;
            isUserSet = true
            setUser(user)
        }else{
            alert = true; 
        }
    }
    
</script>

<div class="grad">

    {#if alert}
    <div class="alert">
        <Alert class="primary-color" dismissible bind:visible={alert} on:dismiss={onDismiss}>
            Please fill out the form before starting the quiz.
          </Alert> 
          <!-- could make more specific alerts but there are only two input feilds so user should find it easy -->
    </div>
    {/if}
    <Row>
        <h2>
            <div class="FormHeadings">
            Player Name:
            </div>
        </h2>
        <div class="FormValues">
            <TextField bind:value={name} dense>
            </TextField>
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
        {#if isUserSet}
        <div class="SubmitButton2">
            <Button class="primary-color" size="x-large" on:click={()=>{handleSubmiUser}} >Play as same player</Button>
        </div>
        <div class="SubmitButton3">
            <Button class="primary-color" size="x-large" on:click={()=>{handleSubmiUser(true)}} >Submit New Player</Button>
        </div>
    {:else}
    <div class="SubmitButton">
        <Button class="primary-color" size="x-large" on:click={handleSubmiUser} >Start Quiz</Button>
    </div>
        {/if}
    </Row>    
</div>



<style>
    .grad{
        /* background-color: #010b13;
		  height: 100%;
		  width: 100%; */
    }
    .FormHeadings{
        padding-top: 6%;
        padding-left: 20px;
        color: #6200EA;
        /* font-weight: ; */
    }

    .SubmitButton{
        justify-self: center;
        padding-left: 45%;
        padding-top: 10%;
        
    }
    .SubmitButton2{
        justify-self: center;
        padding-left: 30%;
        padding-top: 10%; 
    }
    .SubmitButton3{
        justify-self: center;
        padding-left: 5%;
        padding-top: 10%; 
    }
    .FormValues {
        padding: 2%;
        width: 50%;
    }
    .FormValues2 {
        padding: 5%;
        padding-top: 7.5%;
        width: 60%;
        font-size: large;
    }
    .FormValues3 {
        padding-left: 5%;
        padding-top: 7%;
    }
    .NumberQ{
        padding-left: 2%;
        padding-top: 5.7%;
    }
    h2 {
    font-size: 3em;
    font-family: Cambria, Cochin, Georgia, Times, 'Times New Roman', serif;
    /* font-family:'Gill Sans', 'Gill Sans MT', Calibri, 'Trebuchet MS', sans-serif; */
    /* font-family: "Lucida Sans", "Lucida Sans Regular", "Lucida Grande",
      "Lucida Sans Unicode", Geneva, Verdana, sans-serif; */
    font-weight: bolder;
    color: rgb(#0d1821);
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