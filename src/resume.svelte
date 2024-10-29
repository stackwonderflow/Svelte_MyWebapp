<!--resume.svelte-->
<script>
    import '../public/global.css';
</script>

<svelte:head>
    <meta charset='utf-8'>
    <meta name='viewport' content='width=device-width,initial-scale=1'>
    <title>ABA's Resume</title>
    <link rel='icon' type='image/png' href='/favicon.png'>
</svelte:head>

<div class="resume-container">
    <h1>Resume</h1>

    <section class="profile">
        <div class="resume-item">
            <p class="profile-text">Junior Software Engineer with a unique background in biochemistry and laboratory sciences. Combining analytical thinking from scientific research with modern software development practices to deliver efficient solutions.</p>
        </div>
    </section>
    
    <section>
        <h2>Education</h2>
        <div class="resume-item">
            <h3>Florida Institute of Technology (FIT), Melbourne, FL</h3>
            <p>B.S., Biochemistry - Chemistry Focus, 2017-2018</p>
        </div>
        <div class="resume-item">
            <h3>Eastern Florida State College (EFSC), Melbourne, FL</h3>
            <p>A.A., -2016</p>
        </div>
    </section>

    <section>
        <h2>Skills</h2>
        <div class="skills-grid">
            <div class="skill-category">
                <h3>Programming & Web</h3>
                <ul>
                    <li><span class="skill-highlight">Python</span></li>
                    <li><span class="skill-highlight">C</span></li>
                    <li>SQL</li>
                    <li>HTML/CSS</li>
                    <li>R</li>
                    <li>Flask</li>
                    <li>Svelte</li>
                </ul>
            </div>
            <div class="skill-category">
                <h3>Tools & Databases</h3>
                <ul>
                    <li>Git/Github</li>
                    <li>VSCode</li>
                    <li>PostgreSQL</li>
                    <li>SQLite3</li>
                </ul>
            </div>
            <div class="skill-category">
                <h3>Laboratory Skills & Equipment</h3>
                <ul>
                    <li>FPLC</li>
                    <li>HPLC</li>
                    <li>AKTA Explorer</li>
                    <li>Hewlett-Packard Agilent HPLC</li>
                    <li>Gator Label-Free Analysis</li>
                    <li>Expi293F Cells</li>
                    <li>SDS-PAGE</li>
                </ul>
            </div>
            <div class="skill-category">
                <h3>Laboratory Techniques</h3>
                <ul>
                    <li>Suspension cell culture</li>
                    <li>Bacterial transfection & transformation</li>
                    <li>Aseptic technique</li>
                    <li>Petrifilm plating & Spread plating</li>
                    <li>Clean Room protocols</li>
                </ul>
            </div>
        </div>
    </section>

    <section>
        <h2>Work Experience</h2>
        <div class="resume-item">
            <h3>Junior Software Engineer</h3>
            <p>Private Client, Jan 2024-Present</p>
            <ul>
                <li>Develop software and websites using C, Python, SQLite3, HTML, CSS, Flask, and Svelte</li>
                <li>Maintain and manage internal data lake using PostgreSQL and Python</li>
                <li>Continuously expand knowledge of new languages and technologies</li>
            </ul>
        </div>
        <div class="resume-item">
            <h3>Microbiology Technician</h3>
            <p>Food Safety Net Services, Bentonville, AR Jun 2023-Jan 2024</p>
            <ul>
                <li>Prepared samples for testing to determine presence of indicator organisms and pathogens while utilizing aseptic technique</li>
                <li>Participated in quality control monitoring by taking incubator temperatures, inoculating control organisms, and running media controls</li>
                <li>Maintained laboratory condition, to include equipment, supplies, and kept accurate records throughout all procedures</li>
            </ul>
        </div>
        <div class="resume-item">
            <h3>Assistant Scientist</h3>
            <p>Amberstone Biosciences, Irvine, CA Jan 2022-Sept 2022</p>
            <p>Protein Science Team</p>
            <ul>
                <li>Produced super-coiled plasmid DNA through plasmid purification of E. coli for use in transfections</li>
                <li>Obtained condition media for use in protein purification by maintaining, passaging, transfecting, and harvesting Expi293F cell cultures</li>
                <li>Produced 99% pure proteins by performing various types of purification procedures (Batch Purification, FPLC IMAC Nickel-NTA) successfully producing base product for further testing</li>
                <li>Ensured proper implementation of more recent one-step purification procedures by testing new protein purification techniques via experimentation (M1, Heparin Sepharose)</li>
            </ul>
        </div>
        <!-- Add other work experiences -->
    </section>

    <section>
        <h2>Research Experience</h2>
        <div class="resume-item">
            <h3>Research Assistant</h3>
            <p>FIT, Melbourne, FL Aug 2017-Dec 2018</p>
            <p>Dr. Norito Takenaka's Lab</p>
            <ul>
                <li>Synthesized Lewis Base catalyst through column chromatography and other lab techniques for production of value added products.</li>
                <li>Developed artificial enzymes for use in catalytic reaction, demonstrating catalyst's utility in production of pharmaceutical compounds.</li>
            </ul>
        </div>
    </section>

    <section>
        <h2>Additional Education</h2>
        <div class="resume-item">
            <h3>CS50 2024</h3>
            <p>Harvard University, Cambridge, MA 2024</p>
            <p>CS50 is Harvard's introductory computer science course, offered online. It guides students through several coding languages and tools, including Scratch, C, Python, SQL, HTML, CSS, JavaScript, and Flask. The class culminates in a final project of the student's choice, allowing them to demonstrate their learning and explore new languages and technologies.</p>
        </div>
        <div class="resume-item">
            <h3>Code In Place 2021</h3>
            <p>Stanford University, Stanford, CA 2021</p>
            <p>Code In Place is a 5-week online introductory Python course based on material from the first half of Stanford’s introductory programming course, CS106A. The class culminates in a final project where students demonstrate their newly acquired skills. Final projects are showcased online.</p>
        </div>
    </section>

    <section>
        <h2>Posters</h2>
        <div class="resume-item">
            <h3>Takenaka Lab</h3>
            <p>FIT, Melbourne, FL April 2018</p>
            <p>Presented evidence proving viability of research catalyst as a green alternative to commonly used synthetic metal-based catalysts at Northrop Grumman Engineering & Science Student Design Showcase</p>
        </div>
    </section>

    <section>
        <h2>Awards</h2>
        <div class="resume-item">
            <h3>Outstanding Two-Year College Student Award</h3>
            <p>ACS Orlando Section, Melbourne, FL Dec 2015</p>
        </div>
    </section>

    <section>
        <h2>Memberships</h2>
        <div class="resume-item">
            <h3>American Chemical Society</h3>
            <p>Member, 2017-2019</p>
        </div>
        <div class="resume-item">
            <h3>American Chemical Society Student Affiliates FIT</h3>
            <p>Member, Melbourne, FL Jan 2017-Dec 2018</p>
            <ul>
                <li>Organized and volunteered at community outreach events.</li>
                <li>Attended and organized conferences with other ACS club branches from nearby colleges.</li>
            </ul>
        </div>
    </section>

    <section>
        <h2>Volunteer & Outreach Experience</h2>
        <div class="resume-item">
            <h3>Volunteer</h3>
            <p>FIT, ACS Student Affiliates, Tea Event, Melbourne, FL Aug 2018</p>
            <p>Demonstrated the color changing properties with varied pH of Butterfly Pea Flower Tea</p>
        </div>
        <div class="resume-item">
            <h3>Volunteer</h3>
            <p>FIT, ACS Student Affiliates, Halloween Slime Event, Melbourne, FL Oct 2018</p>
            <p>Community outreach event in which visitors made and played with their own polymers (various types of slime)</p>
        </div>
        <div class="resume-item">
            <h3>Volunteer</h3>
            <p>FIT, ACS Student Affiliates, Snow-globe Event, Melbourne, FL Dec 201</p>
            <p>Community outreach event in which visitors customised their own snow-globes and learned about supersaturated solutions (used benzoic acid solutions)</p>
        </div>
    </section>

    <!-- Add other sections following a similar structure -->

</div>

<style>
    .resume-container {
        max-width: 800px;
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
    h3 { font-size: clamp(1.1rem, 2.5vw, 1.3rem); }    

    section {
        margin-bottom: clamp(30px, 5vw, 40px);
    }

    .resume-item {
        background-color: rgba(255, 255, 255, 0.05);
        border-radius: 8px;
        /* Responsive padding */
        padding: clamp(15px, 3vw, 20px);
        margin-bottom: clamp(15px, 3vw, 20px);
        transition: transform 0.2s ease-in-out;
        /* Ensure content doesn't overflow */
        word-wrap: break-word;
    }

    .resume-item:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

    .resume-item h3 {
        color: #4da6ff;
        margin-top: 0;
        margin-bottom: clamp(8px, 2vw, 12px);
    }

    .skills-grid {
        display: grid;
        /* Responsive grid */
        grid-template-columns: repeat(auto-fit, minmax(min(100%, 200px), 1fr));
        gap: clamp(15px, 3vw, 20px);
    }

    .skill-category {
        background-color: rgba(255, 255, 255, 0.05);
        border-radius: 8px;
        /* Responsive padding */
        padding: clamp(12px, 2.5vw, 15px);
    }

    .skill-category h3 {
        color: #4da6ff;
        margin-top: 0;
        margin-bottom: clamp(8px, 2vw, 10px);
    }

    ul {
        list-style-type: none;
        padding-left: 0;
        /* Add margin for better spacing */
        margin: 0.5em 0;
    }

    li {
        margin-bottom: clamp(4px, 1.5vw, 5px);
        line-height: 1.4;
        /* Add padding for better touch targets */
        padding: 2px 0;
    }

    /* Mobile optimizations */
    @media (max-width: 480px) {
        .resume-item {
            /* Disable hover effect on mobile */
            transform: none !important;
        }

        .resume-item:hover {
            box-shadow: none;
        }

        /* Improve list readability */
        li {
            padding: 4px 0;
        }

        /* Adjust job descriptions */
        .resume-item ul {
            padding-left: 10px;
        }

        /* Make dates more visible */
        .resume-item > p:nth-child(2) {
            font-size: 0.9em;
            color: #888;
            margin: 5px 0;
        }
    }

    /* Touch device optimizations */
    @media (hover: none) {
        .resume-item:hover {
            transform: none;
            box-shadow: none;
        }
    }

    /* Print styles */
    @media print {
        .resume-container {
            padding: 0;
        }

        .resume-item, .skill-category {
            break-inside: avoid;
            background-color: transparent;
            box-shadow: none;
        }

        h1, h2, h3 {
            color: #000;
        }
    }
</style>