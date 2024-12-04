<!--aboutme.svelte-->
<script>
    import '../public/global.css';
</script>

<svelte:head>
    <meta charset='utf-8'>
    <meta name='viewport' content='width=device-width,initial-scale=1'>
    <meta name="description" content="Learn more about Alexandra B Allard, her interests, and professional connections.">
    <title>About Me - Alexandra B Allard</title>
    <link rel='icon' type='image/png' href='/favicon.png'>
</svelte:head>

<div class="about-container">
    <h1>About Me</h1>
    <div class="about-content" role="region" aria-labelledby="about-heading">
        <p>My interests span a wide range of activities, including:</p>
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
        padding: clamp(20px, 5vw, 40px) clamp(15px, 3vw, 20px);
    }

    .about-content {
        background-color: rgba(255, 255, 255, 0.05);
        border-radius: 8px;
        padding: clamp(15px, 3vw, 20px);
        margin-top: clamp(15px, 3vw, 20px);
        word-wrap: break-word;
    }

    h1 {
        text-align: center;
        margin-bottom: clamp(20px, 4vw, 30px);
        font-size: clamp(1.8rem, 4vw, 2.5rem);
    }

    ul {
        list-style-type: none;
        padding-left: 0;
        margin: clamp(10px, 2vw, 15px) 0;
    }

    li {
        margin-bottom: clamp(8px, 2vw, 10px);
        position: relative;
        padding-left: clamp(20px, 4vw, 25px);
        line-height: 1.5;
    }

    li:before {
        content: "•";
        color: #4da6ff;
        font-size: clamp(1.3em, 3vw, 1.5em);
        position: absolute;
        left: 0;
        top: clamp(-4px, -1vw, -5px);
    }

    @media (max-width: 480px) {
        li {
            margin-bottom: 12px;
        }

        .about-content {
            font-size: clamp(0.95rem, 2.5vw, 1rem);
            line-height: 1.6;
        }
    }

    @media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi) {
        .about-content {
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
        }
    }
</style>
