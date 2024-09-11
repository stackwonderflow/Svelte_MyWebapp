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
        <h2>Products I Highly Recommend</h2>
        <div class="recommendation-grid">
            {#each [{name: 'Vessi', link: 'https://vessi.com/'}, {name: 'Lume', link: 'https://lumedeodorant.com/'}, {name: 'Hairstory', link: 'https://hairstory.com/'}, {name: 'Ridge', link: 'https://ridge.com/'}, {name: 'SugarBunnyShop', link: 'https://www.sugarbunnyshop.com'}] as product}
                <div class="recommendation-card">
                    <h3>{product.name}</h3>
                    <a href={product.link} target="_blank" rel="noopener noreferrer" class="recommendation-link">Visit Website</a>
                </div>
            {/each}
        </div>
    </section>
    
    <section>
        <h2>Media Recommendations</h2>
        <div class="recommendation-grid">
            {#each [{name: 'Dropout', link: 'https://www.dropout.tv/'}, {name: 'Fool & Scholar Productions', link: 'https://foolandscholar.com/'}, {name: 'The NoSleep Podcast', link: 'https://www.thenosleeppodcast.com/'}, {name: 'Rusty Quill', link: 'https://rustyquill.com/'}, {name: 'The Philip DeFranco Show', link: 'https://www.youtube.com/@PhilipDeFranco'}] as media}
                <div class="recommendation-card">
                    <h3>{media.name}</h3>
                    {#if media.link}
                        <a href={media.link} target="_blank" rel="noopener noreferrer" class="recommendation-link">Visit Website</a>
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
        padding: 40px 20px;
    }

    h1, h2 {
        text-align: center;
        margin-bottom: 30px;
    }

    .disclaimer {
        text-align: center;
        font-style: italic;
        margin-bottom: 30px;
    }

    section {
        margin-bottom: 50px;
    }

    .recommendation-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 20px;
    }

    .recommendation-card {
        background-color: rgba(255, 255, 255, 0.05);
        border-radius: 8px;
        padding: 20px;
        text-align: center;
        transition: transform 0.3s ease;
    }

    .recommendation-card:hover {
        transform: translateY(-5px);
    }

    .recommendation-link {
        display: inline-block;
        background-color: #4da6ff;
        color: white;
        padding: 8px 15px;
        border-radius: 5px;
        text-decoration: none;
        transition: background-color 0.3s ease;
        margin-top: 10px;
    }

    .recommendation-link:hover {
        background-color: #3385ff;
    }
</style>