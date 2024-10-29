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
        /* Responsive padding */
        padding: clamp(20px, 5vw, 40px) clamp(15px, 3vw, 20px);
    }

    .about-content {
        background-color: rgba(255, 255, 255, 0.05);
        border-radius: 8px;
        /* Responsive padding */
        padding: clamp(15px, 3vw, 20px);
        margin-top: clamp(15px, 3vw, 20px);
        /* Ensure content doesn't overflow */
        word-wrap: break-word;
    }

    h1 {
        text-align: center;
        margin-bottom: clamp(20px, 4vw, 30px);
        /* Responsive font size */
        font-size: clamp(1.8rem, 4vw, 2.5rem);
    }

    ul {
        list-style-type: none;
        padding-left: 0;
        /* Add some spacing between list and paragraphs */
        margin: clamp(10px, 2vw, 15px) 0;
    }

    li {
        margin-bottom: clamp(8px, 2vw, 10px);
        position: relative;
        /* Responsive padding for bullet points */
        padding-left: clamp(20px, 4vw, 25px);
        /* Improve readability */
        line-height: 1.5;
    }

    li:before {
        content: "•";
        color: #4da6ff;
        /* Responsive bullet size */
        font-size: clamp(1.3em, 3vw, 1.5em);
        position: absolute;
        left: 0;
        /* Adjust bullet position */
        top: clamp(-4px, -1vw, -5px);
    }

    /* Mobile optimizations */
    @media (max-width: 480px) {
        li {
            /* Increase spacing between items on mobile */
            margin-bottom: 12px;
        }

        .about-content {
            /* Improve text readability on mobile */
            font-size: clamp(0.95rem, 2.5vw, 1rem);
            line-height: 1.6;
        }
    }

    /* High-DPI screen optimizations */
    @media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi) {
        .about-content {
            /* Sharper text rendering on high-DPI screens */
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
        }
    }
</style>
