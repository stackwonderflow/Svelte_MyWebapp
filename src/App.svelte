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
	<li><a href="#/" on:click="{() => navigate('Home')}">Home</a></li>
	<li><a href="#/aboutme" on:click="{() => navigate('Aboutme')}">About Me</a></li>
	<li><a href="#/projects" on:click="{() => navigate('Projects')}">Projects</a></li>
	<li><a href="#/resume" on:click="{() => navigate('Resume')}">Resume</a></li>
	<li><a href="#/recommend" on:click="{() => navigate('Recommend')}">Recommend</a></li>
</nav>

<main>
    {#if currentPage === "Home"}
        <Home />
	{:else if currentPage === "Aboutme"}
		<Aboutme />
	{:else if currentPage === "Projects"}
		<Projects />
	{:else if currentPage === "Resume"}
		<Resume />
	{:else if currentPage === "Recommend"}
		<Recommend />
	{/if}
</main>