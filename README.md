# Svelte_MyWebapp
#### Video Demo:  <URL HERE>
#### Description:  
This project is a svelte web app hosted on GitHub Pages. Initially, I was just going to make this project simply using vanilla HTML, CSS, and JavaScript. I decided against this because I wanted to learn a new webframework. The content of the pages took surprisingly little time when compared with getting all of the components to function as expected and deploy. I was having a lot of problems with file deletion due to attempting to deploy from the main branch, which were resolved by deploying to a separate branch (gh-pages). While dealing with this, I created and deleted multiple project repositories locally and on my GitHub. I also spent a lot of time attempting to host my web app at a custom domain.

Any files I do not include below are files that come included with the svelte project during initial setup. If I do not mention them, assume that I did not need to alter them in any way.

##### package.json
This file is one of the prebuilds that allows a svelte project to function behind the scenes and is downloaded during inital project setup with node.js. I had to add two commands to "scripts" within this file to provide predeploy and deployment instructions.

##### main.js
This is another file that comes prebuilt with any svelte project setup with node.js. I had to alter it to make it work with my project (I simply deleted a few unnecessary lines).

##### build folder
This folder contains the build files (bundle.css, bundle.js, bundle.js.map). Build files are made whenever the 'npm run build' command is run as part of the predeployment. I do not directly edit these and they are changed whenever the project is re-deployed to display changes as I update the project.

##### index.html
This page is also part of the prebuild of the svelte app made during initial setup with node.js. I customized it to work with my project and included any needed links to build files and stylesheets.

##### global.css

##### App.svelte
This is the base svelte page that holds the functionality for the svelte web app. The other svelte pages are imported to this page and the functionality for navigation within the web app is included. I had some difficulty implementing the navigation and came up with a functioning method with assistance from ChatGPT.

##### home.svelte
This is one of the pages that hosts web app content. It is the homepage that a visitor to the site is initially  directed to. On this page, I briefly introduce myself and have links to my LinkedIn and GitHub.

##### aboutme.svelte
This is another one of the pages that hosts web app content. I list some of my interests here and have another link that directs to my LinkedIn.

##### projects.svelte
This is also another one of the pages that hosts web app content. It has several sections on coding projects that I have previously worked on. I include links to the projects on GitHub and elsewhere.

##### resume.svelte
This is the last page that contains web app content visible to users who visit the site. It hosts most of my professional and educational experience to this point. I will attempt to keep this up to date going forward, but I make no promises.

##### CNAME
This page hold the custom url for my web app. It is hosted using porkbun and is linked to another site.
