<!--recommend.svelte-->
<script>
    import '../public/global.css';
</script>

<svelte:head>
    <meta charset='utf-8'>
    <meta name='viewport' content='width=device-width,initial-scale=1'>
    <title>ABA's Recommendations - Not Sponsored</title>
    <link rel='icon' type='image/png' href='/favicon.png'>
</svelte:head>

<div class="recommendations-container">
    <h1>My Recommendations</h1>
    <p class="disclaimer">Note: These recommendations are not sponsored. I'm sharing products and media that I personally use and enjoy.</p>
    
    <section>
        <h2>Product Recommendations</h2>
        <div class="recommendation-grid">
            {#each [{name: 'Vessi', link: 'https://vessi.com/'}, {name: 'Lume', link: 'https://lumedeodorant.com/'}, {name: 'Hairstory', link: 'https://hairstory.com/'}, {name: 'Ridge', link: 'https://ridge.com/'}, {name: 'Sundays', link: 'https://sundaysfordogs.com/'}, {name: 'SugarBunnyShop', link: 'https://www.sugarbunnyshop.com'}] as product}
                <div class="recommendation-card">
                    <h3>{product.name}</h3>
                    <a href={product.link} target="_blank" rel="noopener noreferrer" class="recommendation-link" tabindex="0">Visit Website</a>
                </div>
            {/each}
        </div>
    </section>
    
    <section>
        <h2>Media Recommendations</h2>
        <div class="recommendation-grid">
            {#each [{name: 'Dropout', link: 'https://www.dropout.tv/'}, {name: 'Not Another D&D Podcast', link: 'https://naddpod.com/'},{name: 'Fool & Scholar Productions', link: 'https://foolandscholar.com/'}, {name: 'The NoSleep Podcast', link: 'https://www.thenosleeppodcast.com/'}, {name: 'Rusty Quill', link: 'https://rustyquill.com/'}, {name: 'The Philip DeFranco Show', link: 'https://www.youtube.com/@PhilipDeFranco'}] as media}
                <div class="recommendation-card">
                    <h3>{media.name}</h3>
                    {#if media.link}
                        <a href={media.link} target="_blank" rel="noopener noreferrer" class="recommendation-link" tabindex="0">Visit Website</a>
                    {:else}
                        <p>Available on YouTube and most podcast platforms</p>
                    {/if}
                </div>
            {/each}
        </div>
    </section>
</div>

<style>
    .recommendations-container {
        max-width: 1200px;
        margin: 0 auto;
        /* Responsive padding */
        padding: clamp(20px, 5vw, 40px) clamp(15px, 3vw, 20px);
    }

    h1, h2 {
        text-align: center;
        margin-bottom: clamp(20px, 4vw, 30px);
    }

    h1 { font-size: clamp(1.8rem, 4vw, 2.5rem); }
    h2 { font-size: clamp(1.4rem, 3vw, 1.8rem); }

    .disclaimer {
        text-align: center;
        font-style: italic;
        margin-bottom: clamp(20px, 4vw, 30px);
        /* Improve readability */
        font-size: clamp(0.9rem, 2vw, 1rem);
        line-height: 1.6;
        /* Add padding for better text container */
        padding: 0 clamp(10px, 3vw, 20px);
    }

    section {
        margin-bottom: clamp(30px, 6vw, 50px);
    }

    .recommendation-grid {
        display: grid;
        /* Adjust minimum card width for smaller screens */
        grid-template-columns: repeat(auto-fit, minmax(min(100%, 250px), 1fr));
        gap: clamp(15px, 3vw, 20px);
    }

    .recommendation-card {
        background-color: rgba(255, 255, 255, 0.05);
        border-radius: 8px;
        /* Responsive padding */
        padding: clamp(15px, 3vw, 20px);
        text-align: center;
        transition: transform 0.3s ease;
        /* Ensure content doesn't overflow */
        word-wrap: break-word;
    }

    .recommendation-card h3 {
        font-size: clamp(1.1rem, 2.5vw, 1.3rem);
        margin-bottom: clamp(10px, 2vw, 15px);
    }

    .recommendation-card:hover {
        transform: translateY(-5px);
    }

    .recommendation-link {
        display: inline-block;
        background-color: #4da6ff;
        color: white;
        /* Responsive padding */
        padding: clamp(8px, 2vw, 10px) clamp(12px, 3vw, 15px);
        border-radius: 5px;
        text-decoration: none;
        transition: background-color 0.3s ease;
        margin-top: clamp(8px, 2vw, 10px);
        /* Improve touch target size */
        min-height: 44px;
        /* Center text vertically */
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .recommendation-link:hover {
        background-color: #3385ff;
    }

    /* Mobile optimizations */
    @media (max-width: 480px) {
        .recommendation-card {
            /* Disable hover effect on mobile */
            transform: none !important;
        }

        .recommendation-link {
            /* Make links more prominent on mobile */
            width: 100%;
            max-width: 200px;
            margin-left: auto;
            margin-right: auto;
        }
    }

    /* Touch device optimizations */
    @media (hover: none) {
        .recommendation-card:hover {
            transform: none;
        }

        .recommendation-link:hover {
            background-color: #4da6ff;
        }

        .recommendation-link:active {
            background-color: #3385ff;
            transform: scale(0.98);
        }
    }

    .recommendation-link:focus {
        outline: 2px solid #3385ff;
        outline-offset: 2px;
    }
</style>