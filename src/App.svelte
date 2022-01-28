<script>
    import { Tabs, Tab, Window, WindowItem, AppBar, MaterialApp } from 'svelte-materialify';
	import {v4 as uuidv4} from "uuid"
	import ScoreBoard from "./ScoreBoard.svelte"
	import UserForm from "./UserDetailForm.svelte"
    let value = 0; //variable to keep track of values
    let user ={}; 
	user['uuid'] = uuidv4()
    function setUser(usr){
        user=usr
    }
	$:console.log(user)
  </script>

	<MaterialApp theme="dark">
		<div class="bgDark">
			<AppBar  class="primary-color">
				<span slot="title" class="title"> 
						<h2>J-Quiz</h2>
				</span>
				<div slot="extension">
				<Tabs bind:value fixedTabs>
				  <div class="primary-text text-accent-1"  slot="tabs">
						<Tab>Player Details</Tab>
						<Tab>Score Board</Tab>
						<Tab>Leader Board</Tab>
						<Tab>About The Quiz</Tab>
				  </div>
				</Tabs>
			  </div>
			</AppBar>
			
			<Window {value} class="ma-4">
			  <WindowItem>
							  
					<UserForm {setUser} {user}/> 
					<!-- passing user and setUser -->
				 
			  </WindowItem>
			  <WindowItem>
				<div class="darkbg">
					<ScoreBoard {user}/>
				</div>
			  </WindowItem>
			  <WindowItem>
				<h4>Leader Board</h4>
				<p>
				  
				  
				</p>
			  </WindowItem>
			  <WindowItem>
				<h4>What is this is Quiz About?</h4>
				<p>
				  This is a silly quiz app that asks questions about Jay Devkar and then gives out a score out of 100.
				</p>
			  </WindowItem>
			</Window>
		</div>
	</MaterialApp>

  
  <style>
	:global(.dark) {
		background: #010b13;
	}
	
      .title{
      text-align: center;
      color: #010b13;
      font-size: 50px;
      }
  
      h2 {
      font-size: 1em;
	  font-family: Cambria, Cochin, Georgia, Times, 'Times New Roman', serif;
      font-weight: 100;
      color: rgb(#0d1821);
      text-align: center;
    }

  </style>