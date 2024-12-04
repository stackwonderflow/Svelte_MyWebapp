<!--home.svelte-->
<script>
    import '../public/global.css';
</script>

<svelte:head>
    <meta charset='utf-8'>
    <meta name='viewport' content='width=device-width,initial-scale=1'>
    <meta name="description" content="Welcome to Alexandra B Allard's portfolio website, showcasing technology projects and professional experience.">
    <title>ABA's Homepage</title>
    <link rel='icon' type='image/png' href='/favicon.png'>
    <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap" rel="stylesheet">
</svelte:head>

<main class="home-container">
    <h1>Welcome to My Portfolio</h1>
    <div class="intro" role="region" aria-label="Introduction">
        <p>Hello! I'm Alexandra B Allard, and this is my personal website.</p>
        <p>Feel free to explore my projects and get to know more about my journey in the world of technology.</p>
    </div>
    <nav class="cta-buttons" aria-label="External links">
        <a href="https://www.linkedin.com/in/aallard1/" 
           target="_blank" 
           rel="noopener noreferrer" 
           class="cta-button"
           aria-label="Connect on LinkedIn (opens in new tab)">
            Connect on LinkedIn
        </a>
        <a href="https://github.com/stackwonderflow" 
           target="_blank" 
           rel="noopener noreferrer" 
           class="cta-button"
           aria-label="View GitHub Projects (opens in new tab)">
            View GitHub Projects
        </a>
    </nav>
</main>

<style>
    .home-container {
        max-width: 600px;
        margin: 0 auto;
        /* Responsive padding */
        padding: clamp(20px, 5vw, 40px) clamp(15px, 3vw, 20px);
        text-align: center;
    }

    h1 {
        /* Responsive font size */
        font-size: clamp(1.8em, 5vw, 2.5em);
        margin-bottom: clamp(15px, 4vw, 20px);
        /* Prevent awkward text wrapping */
        word-wrap: break-word;
    }

    p {
        margin-bottom: clamp(15px, 4vw, 20px);
        /* Improve readability */
        font-size: clamp(1rem, 2.5vw, 1.1rem);
        line-height: 1.6;
    }

    .cta-buttons {
        display: flex;
        justify-content: center;
        gap: clamp(10px, 3vw, 20px);
        margin-top: clamp(20px, 4vw, 30px);
        /* Allow wrapping on small screens */
        flex-wrap: wrap;
    }

    .cta-button {
        display: inline-block;
        /* Responsive padding */
        padding: clamp(8px, 2vw, 10px) clamp(15px, 3vw, 20px);
        background-color: #4da6ff;
        color: white;
        border-radius: 5px;
        text-decoration: none;
        transition: background-color 0.3s ease;
        /* Improve touch target size */
        min-height: 44px;
        /* Center text vertically */
        display: flex;
        align-items: center;
        justify-content: center;
        /* Add focus styles for keyboard navigation */
        &:focus {
            outline: 3px solid #fff;
            outline-offset: 2px;
        }
        
        /* Ensure sufficient color contrast */
        background-color: #0066cc; /* Darker blue for better contrast */
    }
    
    .cta-button:hover {
        background-color: #0052a3; /* Darker hover state */
    }

    /* Mobile optimizations */
    @media (max-width: 480px) {
        .cta-button {
            /* Make buttons full width on very small screens */
            width: 100%;
            margin: 0;
        }

        .cta-buttons {
            /* Increase gap for stacked buttons */
            gap: 15px;
            /* Remove horizontal margin */
            margin-left: 0;
            margin-right: 0;
        }
    }

    /* Touch device optimizations */
    @media (hover: none) {
        .cta-button:hover {
            /* Disable hover effect on touch devices */
            background-color: #4da6ff;
        }
        
        /* Add active state for touch feedback */
        .cta-button:active {
            background-color: #3385ff;
            transform: scale(0.98);
        }
    }

</style>
