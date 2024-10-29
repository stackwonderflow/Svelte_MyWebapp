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
        /* Ensure nav stays on top */
        position: sticky;
        top: 0;
        z-index: 100;
        /* Add background color to prevent content showing through */
        background-color: #2c2c2c;
    }
    
    .active {
        border-bottom: 2px solid #4da6ff;
        /* Increase active indicator visibility on mobile */
        padding-bottom: clamp(2px, 1vw, 4px);
    }

	/* Mobile optimizations */
    @media (max-width: 480px) {
        nav {
            /* Adjust shadow for mobile */
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
        }
	}

    /* Touch device optimizations */
    @media (hover: none) {
        .active {
            /* Make active state more visible on touch devices */
            background-color: rgba(77, 166, 255, 0.1);
        }
    }
</style>