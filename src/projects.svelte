<!--projects.svelte-->
<script>
    import '../public/global.css';
</script>

<svelte:head>
    <meta charset='utf-8'>
    <meta name='viewport' content='width=device-width,initial-scale=1'>
    <title>ABA's Projects</title>
    <link rel='icon' type='image/png' href='/favicon.png'>
</svelte:head>

<div class="projects-container">
    <h1>Projects</h1>
    <div class="project-grid">
        <div class="project-card">
            <h2>OSRS Shooting Star Tracker</h2>
            <p>An in-progress collaborative project featuring a scraper for Old School Runescape (OSRS). Plan to make a plugin integration for RuneLite.</p>
            <a href="https://github.com/stackwonderflow/osrs_shooting_star_tracker" target="_blank" rel="noopener noreferrer" class="project-link">View on GitHub</a>
        </div>
        <div class="project-card">
            <h2>Undergroundv2</h2>
            <p>An improved version of my original console-based game, Underground. This Flask-based web app represents my growth as a developer and includes various bug fixes and enhancements.</p>
            <a href="https://github.com/stackwonderflow/Undergroundv2" target="_blank" rel="noopener noreferrer" class="project-link">View on GitHub</a>
        </div>
        <div class="project-card">
            <h2>ConsoleArcade</h2>
            <p>A collaborative project featuring a series of console-based games written in Python. Includes popular games like hangman and tic-tac-toe, enhanced with ASCII visuals.</p>
            <a href="https://github.com/eantablin/ConsoleArcade" target="_blank" rel="noopener noreferrer" class="project-link">View on GitHub</a>
        </div>
        <div class="project-card">
            <h2>Underground</h2>
            <p>My first major coding project, created as the final project for Code In Place 2021. A console-based adventure game where players face progressively stronger enemies.</p>
            <div class="project-links">
                <a href="https://codeinplace-2021.netlify.app/2021/showcase/1340" target="_blank" rel="noopener noreferrer" class="project-link">View Showcase</a>
                <a href="https://github.com/stackwonderflow/Underground" target="_blank" rel="noopener noreferrer" class="project-link">View on GitHub</a>
            </div>
        </div>
    </div>
</div>

<style>
    .projects-container {
        max-width: 1200px;
        margin: 0 auto;
        padding: 40px 20px;
    }

    h1 {
        text-align: center;
        margin-bottom: 30px;
    }

    .project-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 20px;
    }

    .project-card {
        background-color: rgba(255, 255, 255, 0.05);
        border-radius: 8px;
        padding: 20px;
        transition: transform 0.3s ease;
    }

    .project-card:hover {
        transform: translateY(-5px);
    }

    .project-card h2 {
        margin-top: 0;
        color: #4da6ff;
    }

    .project-links {
        display: flex;
        justify-content: space-between;
        margin-top: 15px;
    }

    .project-link {
        display: inline-block;
        background-color: #4da6ff;
        color: white;
        padding: 8px 15px;
        border-radius: 5px;
        text-decoration: none;
        transition: background-color 0.3s ease;
    }

    .project-link:hover {
        background-color: #3385ff;
    }
</style>