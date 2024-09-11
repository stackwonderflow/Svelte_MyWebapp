<script>
    import Home from "./home.svelte"
	import Aboutme from "./aboutme.svelte";
	import Projects from "./projects.svelte";
	import Resume from "./resume.svelte";
	import Recommend from "./recommend.svelte";

	let currentPage = "Home";

	// Added function for navigation -- was unsure of how to do this, looked up with ChatGPT
	function navigate(page) {
		currentPage = page;
	}
</script>

<!--Implemented nav bar with help from Chat GPT-->
<nav>
    <ul>
        <li><a href="#/" class:active={currentPage === 'Home'} on:click="{() => navigate('Home')}">Home</a></li>
        <li><a href="#/aboutme" class:active={currentPage === 'Aboutme'} on:click="{() => navigate('Aboutme')}">About Me</a></li>
        <li><a href="#/projects" class:active={currentPage === 'Projects'} on:click="{() => navigate('Projects')}">Projects</a></li>
        <li><a href="#/recommend" class:active={currentPage === 'Recommend'} on:click="{() => navigate('Recommend')}">Recommend</a></li>
		<li><a href="#/resume" class:active={currentPage === 'Resume'} on:click="{() => navigate('Resume')}">Resume</a></li>
    </ul>
</nav>

<main>
    {#if currentPage === "Home"}
        <Home />
	{:else if currentPage === "Aboutme"}
		<Aboutme />
	{:else if currentPage === "Projects"}
		<Projects />
	{:else if currentPage === "Recommend"}
		<Recommend />
	{:else if currentPage === "Resume"}
		<Resume />
	{/if}
</main>

<style>
    nav {
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
    
    .active {
        border-bottom: 2px solid #4da6ff;
    }
</style>