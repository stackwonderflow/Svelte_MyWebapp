<!--aboutme.svelte-->
<script>
    import '../public/global.css';
</script>

<svelte:head>
    <meta charset='utf-8'>
    <meta name='viewport' content='width=device-width,initial-scale=1'>
    <title>About Me - Alexandra B Allard</title>
    <link rel='icon' type='image/png' href='/favicon.png'>
</svelte:head>

<div class="about-container">
    <h1>About Me</h1>
    <div class="about-content">
        <p>I'm a multifaceted individual with a passion for technology and a zest for life. My interests span a wide range of activities, including:</p>
        <ul>
            <li>Hiking and exploring nature</li>
            <li>Swimming</li>
            <li>Reading diverse genres</li>
            <li>Gaming and interactive storytelling</li>
            <li>Solving puzzles and brain teasers</li>
            <li>Continuous learning and self-improvement</li>
            <li>Coding and software development</li>
        </ul>
        <p>I'm always eager to connect with like-minded individuals and professionals in the tech industry. If you'd like to chat about shared interests or potential collaborations, feel free to connect with me on <a href="https://www.linkedin.com/in/aallard1/" target="_blank" rel="noopener noreferrer">LinkedIn</a>.</p>
    </div>
</div>

<style>
    .about-container {
        max-width: 800px;
        margin: 0 auto;
        padding: 40px 20px;
    }

    .about-content {
        background-color: rgba(255, 255, 255, 0.05);
        border-radius: 8px;
        padding: 20px;
        margin-top: 20px;
    }

    h1 {
        text-align: center;
        margin-bottom: 30px;
    }

    ul {
        list-style-type: none;
        padding-left: 0;
    }

    li {
        margin-bottom: 10px;
        position: relative;
        padding-left: 25px;
    }

    li:before {
        content: "•";
        color: #4da6ff;
        font-size: 1.5em;
        position: absolute;
        left: 0;
        top: -5px;
    }
</style>
