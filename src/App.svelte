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
<nav aria-label="Main navigation">
    <ul role="menubar">
        <li role="none">
            <a href="#/" 
               role="menuitem" 
               class:active={currentPage === 'Home'} 
               on:click="{() => navigate('Home')}"
               aria-current={currentPage === 'Home' ? 'page' : undefined}>
                Home
            </a>
        </li>
        <li role="none">
            <a href="#/aboutme" 
               role="menuitem" 
               class:active={currentPage === 'Aboutme'} 
               on:click="{() => navigate('Aboutme')}"
               aria-current={currentPage === 'Aboutme' ? 'page' : undefined}>
                About Me
            </a>
        </li>
        <li role="none">
            <a href="#/projects" 
               role="menuitem" 
               class:active={currentPage === 'Projects'} 
               on:click="{() => navigate('Projects')}"
               aria-current={currentPage === 'Projects' ? 'page' : undefined}>
                Projects
            </a>
        </li>
        <li role="none">
            <a href="#/recommend" 
               role="menuitem" 
               class:active={currentPage === 'Recommend'} 
               on:click="{() => navigate('Recommend')}"
               aria-current={currentPage === 'Recommend' ? 'page' : undefined}>
                Recommend
            </a>
        </li>
        <li role="none">
            <a href="#/resume" 
               role="menuitem" 
               class:active={currentPage === 'Resume'} 
               on:click="{() => navigate('Resume')}"
               aria-current={currentPage === 'Resume' ? 'page' : undefined}>
                Resume
            </a>
        </li>
    </ul>
</nav>

<main id="main-content" aria-live="polite">
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

    /* Add focus styles for keyboard navigation */
    a:focus {
        outline: 3px solid #4da6ff;
        outline-offset: 2px;
    }

    /* Ensure sufficient color contrast for links */
    a {
        color: #ffffff;
        text-decoration: none;
        padding: 0.5rem 1rem;
    }
</style>