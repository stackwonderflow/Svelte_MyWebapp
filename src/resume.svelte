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
    
    <section>
        <h2>Education</h2>
        <div class="resume-item">
            <h3>Florida Institute of Technology (FIT), Melbourne, FL</h3>
            <p>B.S., Biochemistry (Chemistry Focus), 2017-2018</p>
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
                <h3>Programming Languages</h3>
                <ul>
                    <li>Python</li>
                    <li>C</li>
                    <li>SQL</li>
                    <li>HTML</li>
                    <li>CSS</li>
                </ul>
            </div>
            <div class="skill-category">
                <h3>Programming Tools</h3>
                <ul>
                    <li>Git</li>
                    <li>Github</li>
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
    <!-- Add other sections following a similar structure -->

</div>

<style>
    .resume-container {
        max-width: 800px;
        margin: 0 auto;
        padding: 40px 20px;
    }

    h1, h2 {
        text-align: center;
        margin-bottom: 30px;
    }

    section {
        margin-bottom: 40px;
    }

    .resume-item {
        background-color: rgba(255, 255, 255, 0.05);
        border-radius: 8px;
        padding: 20px;
        margin-bottom: 20px;
    }

    .resume-item h3 {
        color: #4da6ff;
        margin-top: 0;
    }

    .skills-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 20px;
    }

    .skill-category {
        background-color: rgba(255, 255, 255, 0.05);
        border-radius: 8px;
        padding: 15px;
    }

    .skill-category h3 {
        color: #4da6ff;
        margin-top: 0;
    }

    ul {
        list-style-type: none;
        padding-left: 0;
    }

    li {
        margin-bottom: 5px;
    }
</style>