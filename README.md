# Svelte_MyWebapp
#### Video Demo:  <URL HERE>
#### Description:  
This project is a Svelte web app hosted on GitHub Pages. Initially, I was just going to make this project simply using vanilla HTML, CSS, and JavaScript. I decided against this because I wanted to learn a new web framework. The content of the pages took surprisingly little time when compared with getting all of the components to function as expected and deploying them. I also contemplated doing something more complex with the styling, but ended up going quite minimal and coloring the website with a dark theme.

I ran into several problems while trying to get the project up and running. I was having a lot of problems with accidental file deletion due to attempting to deploy from the main branch, which were resolved by deploying to a separate branch (gh-pages). While dealing with this, I created and deleted multiple project repositories locally and on my GitHub. I also spent a lot of time attempting to host my web app at a custom domain, but eventually decided against doing so due to time constraints. I may attempt to host my project at a custom domain at a later date and do plan to keep this going.

Any files I do not include below are files that come included with the Svelte project during initial setup. If I do not mention them, assume that I did not need to alter them in any way and encountered no issues with them.

##### package.json
This file is one of the prebuilds that allows a Svelte project to function behind the scenes and is downloaded during initial project setup with Node.js. I had to add two commands to "scripts" within this file to provide predeploy and deployment instructions.

##### main.js
This is another file that comes prebuilt with any Svelte project setup with Node.js. I had to alter it to make it work with my project (I simply deleted a few unnecessary lines).

##### build folder
This folder contains the build files (bundle.css, bundle.js, bundle.js.map). Build files are made whenever the 'npm run build' command is run as part of the predeployment. I do not directly edit these and they are changed whenever the project is re-deployed to display changes as I update the project.

##### rollup.config.js
This is another file that comes prebuilt with any Svelte project setup with Node.js. I had to add a couple lines to fix an unresolved dependency after adding my own styling to global.css.

##### node_modules folder
This folder contains a lot of sub-folders with packages that make the Svelte app function as expected. It was added during initial project setup with Node.js. I did not alter anything within these files. I'm only mentioning it because it may still contain duplicate files due to problems I encountered while attempting to deploy. This should not cause any problems at this point.

##### index.html
This page is also part of the prebuild of the Svelte app made during initial setup with Node.js. I customized it to work with my project and included any needed links to build files and stylesheets.

##### global.css
This file is part of the prebuild of the Svelte app made during the initial setup with Node.js. I customized the colors to make the web app dark-themed with color selection help from ChatGPT. I contemplated doing something more flashy, but simple color styling is more accessible to the wider public.

##### App.svelte
This is the base page that holds the functionality for the Svelte web app. The other Svelte pages are imported to this page and the functionality for navigation within the web app is included. I had some difficulty implementing the navigation and came up with a functioning method with assistance from ChatGPT.

##### home.svelte
This is one of the pages that hosts web app content. It is the homepage that a visitor to the site is initially directed to. On this page, I briefly introduce myself and have links to my LinkedIn and GitHub.

##### aboutme.svelte
This is another one of the pages that hosts web app content. I list some of my interests here and have another link that directs to my LinkedIn.

##### projects.svelte
This is also another one of the pages that hosts web app content. It has several sections on coding projects that I have previously worked on. I include links to the projects on GitHub and elsewhere.

##### resume.svelte
This is the last page that contains web app content visible to users who visit the site. It hosts most of my professional and educational experience to this point. I will attempt to keep this up to date going forward, but I make no promises.

Thank you for taking the time to read this, and for visiting my web app! While it is fairly simple in appearance, it took a surprising amount of time and troubleshooting to get it to its current state.
