<!--home.svelte-->
<script>
    import '../public/global.css';
</script>

<svelte:head>
    <meta charset='utf-8'>
    <meta name='viewport' content='width=device-width,initial-scale=1'>
    <title>ABA's Homepage</title>
    <link rel='icon' type='image/png' href='/favicon.png'>
    <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap" rel="stylesheet">
</svelte:head>

<div class="home-container">
    <h1>Welcome to My Portfolio</h1>
    <p>Hello! I'm Alexandra B Allard, and this is my personal website.</p>
    <p>Feel free to explore my projects and get to know more about my journey in the world of technology.</p>
    <div class="cta-buttons">
        <a href="https://www.linkedin.com/in/aallard1/" target="_blank" rel="noopener noreferrer" class="cta-button">Connect on LinkedIn</a>
        <a href="https://github.com/stackwonderflow" target="_blank" rel="noopener noreferrer" class="cta-button">View GitHub Projects</a>
    </div>
</div>

<style>
    .home-container {
        max-width: 600px;
        margin: 0 auto;
        padding: 40px 20px;
        text-align: center;
    }

    h1 {
        font-size: 2.5em;
        margin-bottom: 20px;
    }

    p {
        margin-bottom: 20px;
    }

    .cta-buttons {
        display: flex;
        justify-content: center;
        gap: 20px;
        margin-top: 30px;
    }

    .cta-button {
        display: inline-block;
        padding: 10px 20px;
        background-color: #4da6ff;
        color: white;
        border-radius: 5px;
        text-decoration: none;
        transition: background-color 0.3s ease;
    }

    .cta-button:hover {
        background-color: #3385ff;
    }
</style>
