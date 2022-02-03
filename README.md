# J-Quiz App
https://kind-liskov-38b895.netlify.app/ 

## Problem
My friends don't stay updated on me because I don't post on social media.

## Solution
Created a quiz that will not only test their knowledge about me but also update them about me. (Lil narcissistic, ik :} ) 

## Trade-Offs
- App doesn't support all screen sizes only big screens (laptop full-screen). CSS needs to be updated to support mobile screens.
- Backend uses express server, Node.Js, and MongoDB(atlas).
  - The reason I chose this stack for the backend is that I am familiar with the stack.
  
- Frontend uses the Svelte framework instead of React/Angular.
  #### *Pros*
  - Less code because svelte is a compiler and reloads the component automatically when the data changes.
  - First time doing FE project individually so Svelte was easier to learn than React.
  #### *Cons*
  - Can't use JSX.
  - Less popular so less community support.
 
- Used Heroku and Netlify to host backend and frontend instead of centralized cloud service like AWS.
  #### *Pros*
  - Heroku and Netlify provide you with a domain.
  - Easy and fast way to host.
  #### *Cons*
  - Setting up architecture in AWS makes it easy to integrate other cloud services they provide. 
  - Using IaC tools like terraform is easier with centralized cloud services.
    

## Backend Repo
https://github.com/JayantDevkar/svelte-app-backend

## Prod-Link
https://kind-liskov-38b895.netlify.app/ 
- Go play!!
