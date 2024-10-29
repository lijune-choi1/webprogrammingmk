// Global variables
let jobsData = [];
const API_URL = 'https://leapfrog.vercel.app';
let currentPage = 1;
const jobsPerPage = 12;
let activeTags = new Set();

// Fetch job data from Google Sheets
async function fetchJobData() {
    const sheetUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vT7aguo-ATRlHOwmGyA2QFN7_ng-4vGe3GM_VImFFof55h3xpYMcGdeAzS9Z6MvDllHzo19suCDGbsh/pub?output=csv';
    try {
        const response = await fetch(sheetUrl);
        const csvText = await response.text();
        const parsedData = parseCSV(csvText);
        logParsedData(parsedData); // For debugging
        return parsedData;
    } catch (error) {
        console.error('Error fetching job data:', error);
        return [];
    }
}

// Parse CSV data
function parseCSV(csvText) {
    const lines = csvText.split('\n');
    const headers = lines[0].split(',');
    return lines.slice(1).map(line => {
        const values = line.match(/(".*?"|[^",]+)(?=\s*,|\s*$)/g);
        const job = {};
        headers.forEach((header, index) => {
            let value = values[index] ? values[index].trim() : '';
            value = value.replace(/^[""]|[""]$/g, '').replace(/[""]/g, '"');
            job[header.trim()] = value;
        });

        // Determine application status and emoji
        const applicantCount = parseInt(job['Applicant Count'] || '0', 10);
        let applicationStatus, applicationEmoji;

        if (applicantCount > 200) {
            applicationStatus = 'outnumbered';
            applicationEmoji = '<img src="./images/sad-frog.png" style="width:100px;"';
        } else if (applicantCount < 20) {
            applicationStatus = 'apply now';
            applicationEmoji = '<img src="./images/happy-frog.png" style="width:100px;"';
        } else {
            applicationStatus = 'apply as soon as you can';
            applicationEmoji = '<img src="./images/normal-frog.png" style="width:100px;"';
        }

        // Return parsed job object
        return {
            company: job['Company Name'],
            pay: job['Pay'],
            reaction: job['Reaction'],
            visualRole: job['Description'],
            applyLink: job['Apply'],
            tags: job['Tags'] ? job['Tags'].split(',').map(tag => tag.trim()) : [],
            frogState: job['Frog State'],
            applicantCount: applicantCount,
            applicationStatus: applicationStatus,
            applicationEmoji: applicationEmoji
        };
    });
}

// Display jobs on the page
function displayJobs(page, jobsToDisplay = jobsData) {
    const start = (page - 1) * jobsPerPage;
    const end = start + jobsPerPage;
    const paginatedJobs = jobsToDisplay.slice(start, end);
    
    const resultsContainer = document.getElementById('results');
    if (!resultsContainer) return;
    resultsContainer.innerHTML = '';
    
    paginatedJobs.forEach((job, index) => {
        const jobElement = createJobElement(job, index);
        resultsContainer.appendChild(jobElement);
    });
}
// Create a job element with updated tag handling
function createJobElement(job, index) {
    const formalTags = ['LA Based', 'NY Based', 'Identity', 'Art Direction', 'Marketing Social Media', 'UI UX', 'Motion', 'Digital Content', 'Non-profit', 'Web', 'Research'];
    
    // Function to check if a tag is formal
    const isFormatTag = (tag) => {
        return formalTags.some(formalTag => 
            tag.toLowerCase().includes(formalTag.toLowerCase())
        );
    };
    
    // Create tag HTML with proper styling

    function createTagHTML(tag) {
        const formalTags = ['LA Based', 'NY Based', 'Identity', 'Art Direction', 'Marketing Social Media', 
                           'UI UX', 'Motion', 'Digital Content', 'Non-profit', 'Web', 'Research'];
        
        const isFormal = formalTags.some(formalTag => 
            tag.toLowerCase().includes(formalTag.toLowerCase())
        );
        
        return `<span class="job-tag" 
                      data-${isFormal ? 'formal' : 'casual'}="true">${tag}</span>`;
    }

    const jobElement = document.createElement('div');
    jobElement.classList.add('result-item');
    
    // Determine the hover icon
    let hoverIcon;
    if (job.applicantCount > 200) {
        hoverIcon = '<img src="./images/f2-s.png" style="width:50px;">';
    } else if (job.applicantCount < 20) {
        hoverIcon = '<img src="./images/f2-f.png" style="width:50px;">';
    } else {
        hoverIcon = '<img src="./images/f2-m.png" style="width:50px;">';
    }

    jobElement.innerHTML = `
        <div class="rate-container">
            <p class="rate-label">Rate per year</p>
            <div class="frog-icon ${job.frogState.toLowerCase()}">
                <img src="./images/${job.frogState.toLowerCase()}-frog.png" style="width:50px;">
            </div>
        </div>
        <p class="rate">${job.pay}</p>
        <h3 class="company-name">${job.company}</h3>
        <p class="job-description">${job.visualRole}</p>
        <div class="job-tags">
            ${job.tags.map(tag => createTagHTML(tag)).join('')}
        </div>
        <div class="application-status" title="${job.applicationStatus}: ${job.applicantCount} applicants">
            ${hoverIcon}
        </div>
    `;
    
    jobElement.addEventListener('click', () => showJobDetails(job, index));
    return jobElement;
}


// Close modal function
function closeModal() {
    const modal = document.getElementById('jobModal');
    if (modal) {
        modal.style.display = 'none';
        // Clear the emoji background when closing
        const emojiBackground = document.getElementById('emoji-background');
        if (emojiBackground) {
            emojiBackground.innerHTML = '';
        }
    }
}

// Show job details in a modal
function showJobDetails(job, index) {
    const modal = document.getElementById('jobModal');
    if (!modal) return;

    // Function to create tag HTML (reusing the same logic)
    const formalTags = ['LA Based', 'NY Based', 'Identity', 'Art Direction', 'Marketing Social Media', 'UI UX', 'Motion', 'Digital Content', 'Non-profit', 'Web', 'Research'];
    const isFormatTag = (tag) => formalTags.some(formalTag => tag.toLowerCase().includes(formalTag.toLowerCase()));
    const createTagHTML = (tag) => {
        const isFormal = isFormatTag(tag);
        const tagClass = isFormal ? 'formal' : 'casual';
        const tagStyle = isFormal ? 
            'background-color: #000; color: white; font-family: Inter, sans-serif;' : 
            'background-color: rgba(255, 255, 255, 0.413); color: black; font-family: "Coming Soon", cursive; box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);';
        
        return `<span class="job-tag ${tagClass}" style="${tagStyle}">${tag}</span>`;
    };

    // Clear previous content
    modal.querySelector('.modal-content').innerHTML = '';

    // Create and append new content
    const content = `
        <span class="close">&times;</span>
        <div id="emoji-background"></div>
        <div id="modalApplicationStatus">
            <div style="display: flex; align-items: center; justify-content: center; gap: 20px;">
                <img src="./images/${job.frogState.toLowerCase()}-frog.png" style="width:50px;">
                <div>
                    <p>Application Status: ${job.applicationStatus}</p>
                    <p>Applicant Count: ${job.applicantCount}</p>
                </div>
            </div>
        </div>
        <h2 id="modalJobTitle">${job.company}</h2>
        <p id="modalJobPay">${job.pay}</p>
        <p id="modalJobRole">${job.visualRole}</p>
        <div id="modalJobTags">
            ${job.tags.map(tag => createTagHTML(tag)).join('')}
        </div>
        <button id="applyButton">Apply Now</button>
        <div class="conversation-thread">
            <h3>Conversation Thread</h3>
            <div id="threadComments"></div>
        </div>
    `;
    modal.querySelector('.modal-content').innerHTML = content;
    

    // Set up emoji background
    const emojiBackground = document.getElementById('emoji-background');
    let emojiHtml;
    if (job.applicantCount > 200) {
        emojiHtml = '<img src="./images/f2-s.png" class="background-emoji-img">';
    } else if (job.applicantCount < 20) {
        emojiHtml = '<img src="./images/f2-f.png" class="background-emoji-img">';
    } else {
        emojiHtml = '<img src="./images/f2-m.png" class="background-emoji-img">';
    }

    // Create and append emoji elements
    for (let i = 0; i < 20; i++) {
        const emojiElement = document.createElement('div');
        emojiElement.className = 'background-emoji';
        emojiElement.innerHTML = emojiHtml;
        emojiElement.style.left = `${Math.random() * 100}%`;
        emojiElement.style.animationDelay = `${Math.random() * 2}s`;
        emojiBackground.appendChild(emojiElement);
    }

    // Set up apply button
    const applyBtn = document.getElementById('applyButton');
    if (applyBtn) {
        applyBtn.onclick = () => window.open(job.applyLink, '_blank');
    }

    // Set up close button
    const closeBtn = modal.querySelector('.close');
    if (closeBtn) {
        closeBtn.addEventListener('click', closeModal);
    }

    // Add click outside modal to close
    window.addEventListener('click', function(event) {
        if (event.target === modal) {
            closeModal();
        }
    });

    loadComments(job, index);
    modal.style.display = 'block';
}

// Load comments for a job
function loadComments(job, index) {
    const commentsContainer = document.getElementById('threadComments');
    if (!commentsContainer) return;
    
    commentsContainer.innerHTML = '';

    const utterancesScript = document.createElement('script');
    utterancesScript.src = 'https://utteranc.es/client.js';
    utterancesScript.setAttribute('repo', 'lijune-choi1/leapfrogcomments');
    utterancesScript.setAttribute('issue-term', `job-${index}-${job.company}`);
    utterancesScript.setAttribute('label', 'comment');
    utterancesScript.setAttribute('theme', 'github-light');
    utterancesScript.setAttribute('crossorigin', 'anonymous');
    utterancesScript.async = true;

    commentsContainer.appendChild(utterancesScript);
}

// Show loading indicator
function showLoading() {
    const resultsContainer = document.getElementById('results');
    resultsContainer.innerHTML = '<div class="loading">Loading job data...</div>';
}

// Hide loading indicator
function hideLoading() {
    const loadingElement = document.querySelector('.loading');
    if (loadingElement) loadingElement.remove();
}

// Search jobs based on input
function searchJobs() {
    const searchInput = document.querySelector('.search-input');
    const searchTerm = searchInput.value.toLowerCase();
    
    const filteredJobs = jobsData.filter(job => {
        return job.company.toLowerCase().includes(searchTerm) ||
               job.visualRole.toLowerCase().includes(searchTerm) ||
               job.tags.some(tag => tag.toLowerCase().includes(searchTerm));
    });
    
    displayJobs(1, filteredJobs);
}

// Filter jobs based on active tags
function filterJobs() {
    const filteredJobs = jobsData.filter(job => {
        if (activeTags.size === 0) return true;
        return job.tags.some(tag => 
            Array.from(activeTags).some(activeTag => 
                tag.toLowerCase().includes(activeTag.toLowerCase())
            )
        );
    });
    
    displayJobs(1, filteredJobs);
}


// Update setupEventListeners function
function setupEventListeners() {
    const prevPageBtn = document.getElementById('prevPage');
    const nextPageBtn = document.getElementById('nextPage');
    const searchInput = document.querySelector('.search-input');

    prevPageBtn?.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            displayJobs(currentPage);
        }
    });

    nextPageBtn?.addEventListener('click', () => {
        if (currentPage < Math.ceil(jobsData.length / jobsPerPage)) {
            currentPage++;
            displayJobs(currentPage);
        }
    });

    searchInput?.addEventListener('input', searchJobs);

    document.querySelectorAll('.tag').forEach(tag => {
        tag.addEventListener('click', () => {
            tag.classList.toggle('active');
            const tagText = tag.textContent.trim();
            
            if (tag.classList.contains('active')) {
                activeTags.add(tagText);
            } else {
                activeTags.delete(tagText);
            }
            
            filterJobs();
        });
    });
}

// Initialize the application
async function initializeApp() {
    showLoading();
    jobsData = await fetchJobData();
    hideLoading();
    displayJobs(currentPage);
    setupEventListeners();
    setActiveSidebarLink();
}

// Post-it note functionality
document.addEventListener('DOMContentLoaded', function() {
    const addButton = document.getElementById('add-post-it');
    const postItContainer = document.getElementById('post-it-container');
    const postItTemplate = document.getElementById('post-it-template');
    
    let zIndex = 1000;
  
    createFixedPostIt();
    addButton.addEventListener('click', createNewPostIt);

    // Create fixed post-its
    function createFixedPostIt() {
        // Create welcome post-it
        createWelcomePostIt();
        // Create key post-it
        createKeyPostIt();
    }

    function createWelcomePostIt() {
        const fixedPostIt = postItTemplate.firstElementChild.cloneNode(true);
        fixedPostIt.classList.add('fixed-post-it');
        
        const postItWidth = 300;
        const postItHeight = 350;
        const left = (window.innerWidth - postItWidth) / 2;
        const top = (window.innerHeight - postItHeight) / 2;
        
        fixedPostIt.style.left = `${left}px`;
        fixedPostIt.style.top = `${top}px`;
        fixedPostIt.style.zIndex = zIndex++;

        const header = fixedPostIt.querySelector('.post-it-header');
        header.innerHTML = `
            <span class="post-it-drag-handle">☰</span>
            <span class="post-it-minimize">_</span>
        `;

        const content = fixedPostIt.querySelector('.post-it-content');
        content.innerHTML = `
            <h3>Welcome to LeapFrog!</h3>
            <p>This is a fixed reminder. You can add new editable notes by clicking the button in the bottom right corner.</p>
            <p>You can also hover over the emojis to see the number of applicants.</p>
            <div style="display: flex; align-items: center; margin-top: 10px;">
                <img src="./images/f2-s.png" style="width: 30px; height: 30px; margin-right: 10px;">
                <span>= 200+ Applicants</span>
            </div>
            <div style="display: flex; align-items: center; margin-top: 10px;">
                <img src="./images/f2-m.png" style="width: 30px; height: 30px; margin-right: 10px;">
                <span>= 20~200 Applicants</span>
            </div>
            <div style="display: flex; align-items: center; margin-top: 10px;">
                <img src="./images/f2-f.png" style="width: 30px; height: 30px; margin-right: 10px;">
                <span>= Less than 20 Applicants</span>
            </div>
        `;
        content.contentEditable = false;

        setupPostItListeners(fixedPostIt, true);
        postItContainer.appendChild(fixedPostIt);
    }


    function createKeyPostIt() {
        const keyPostIt = postItTemplate.firstElementChild.cloneNode(true);
        keyPostIt.classList.add('fixed-post-it', 'key-post-it');
        
        // Position post-it
        keyPostIt.style.right = '20px';
        keyPostIt.style.top = '20px';
        keyPostIt.style.zIndex = zIndex++;
    
        const header = keyPostIt.querySelector('.post-it-header');
        header.innerHTML = `
            <span class="post-it-drag-handle">☰</span>
            <span class="post-it-minimize">_</span>
        `;
    
        const content = keyPostIt.querySelector('.post-it-content');
        content.innerHTML = `
            <h3>Tag Guide</h3>
            <div class="tag-guide-content">
                <div class="tag-section">
                    <h4>Formal Tags</h4>
                    <div class="tag-item">
                        <span class="key-tag formal">LA/NY Based</span>
                        <p>Roles specific to Los Angeles or New York locations</p>
                    </div>
                    <div class="tag-item">
                        <span class="key-tag formal">Identity/Art Direction</span>
                        <p>Brand identity and creative direction positions</p>
                    </div>
                    <div class="tag-item">
                        <span class="key-tag formal">UI UX/Web</span>
                        <p>Digital interface and web development roles</p>
                    </div>
                    <div class="tag-item">
                        <span class="key-tag formal">Motion/Digital Content</span>
                        <p>Animation and digital content creation</p>
                    </div>
                    <div class="tag-item">
                        <span class="key-tag formal">Non-profit/Research</span>
                        <p>Impact-focused and research-oriented positions</p>
                    </div>
                </div>
                <div class="tag-section">
                    <h4>Casual Tags</h4>
                    <div class="tag-item">
                        <span class="key-tag casual">Vibes/Drip/HOT</span>
                        <p>Contemporary, trendy, and cutting-edge work</p>
                    </div>
                    <div class="tag-item">
                        <span class="key-tag casual">Social Media Sorcerer/Detective</span>
                        <p>Data-driven social media and analytics roles</p>
                    </div>
                    <div class="tag-item">
                        <span class="key-tag casual">Pixel Poet/Crusader</span>
                        <p>Creative and mission-driven digital design</p>
                    </div>
                    <div class="tag-item">
                        <span class="key-tag casual">Growth Navigator/Flow Finder</span>
                        <p>Process optimization and growth strategy</p>
                    </div>
                    <div class="tag-item">
                        <span class="key-tag casual">Quirky/Nebulous/Weird</span>
                        <p>Unique and unconventional opportunities</p>
                    </div>
                </div>
            </div>
        `;
        content.contentEditable = false;
    
        setupPostItListeners(keyPostIt, true);
        postItContainer.appendChild(keyPostIt);
    }

    // Update the setupPostItListeners function
    function setupPostItListeners(postIt, isFixed) {
        const closeBtn = postIt.querySelector('.post-it-close');
        const minimizeBtn = postIt.querySelector('.post-it-minimize');
        const content = postIt.querySelector('.post-it-content');
        let isDragging = false;
        let startX, startY, initialX, initialY;

        postIt.addEventListener('mousedown', dragStart);
        document.addEventListener('mousemove', drag);
        document.addEventListener('mouseup', dragEnd);

        if (!isFixed) {
            closeBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                postIt.remove();
            });
            content.contentEditable = true;
        }

        if (minimizeBtn) {
            minimizeBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                postIt.classList.toggle('shrink');
            });
        }

        postIt.addEventListener('click', function() {
            postIt.style.zIndex = zIndex++;
        });

        // ... rest of the existing drag functionality ...
    }

  
    function createNewPostIt() {
        const newPostIt = postItTemplate.firstElementChild.cloneNode(true);
        newPostIt.style.left = `${Math.random() * (window.innerWidth - 200)}px`;
        newPostIt.style.top = `${Math.random() * (window.innerHeight - 200)}px`;
        newPostIt.style.zIndex = zIndex++;
        
        setupPostItListeners(newPostIt, false);
        
        postItContainer.appendChild(newPostIt);
        
    }
  
    function setupPostItListeners(postIt, isFixed) {
        const closeBtn = postIt.querySelector('.post-it-close');
        const content = postIt.querySelector('.post-it-content');
        let isDragging = false;
        let startX, startY, initialX, initialY;
    
        postIt.addEventListener('mousedown', dragStart);
        document.addEventListener('mousemove', drag);
        document.addEventListener('mouseup', dragEnd);
    
        if (!isFixed) {
            closeBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                postIt.remove();
            });
    
            content.contentEditable = true;
        }
    
        postIt.addEventListener('dblclick', function(e) {
            if (e.target !== closeBtn && e.target !== content) {
                postIt.classList.toggle('shrink');
            }
        });
    
        postIt.addEventListener('click', function() {
            postIt.style.zIndex = zIndex++;
        });
    
        function dragStart(e) {
            if (e.target === closeBtn) return;
            
            initialX = postIt.offsetLeft;
            initialY = postIt.offsetTop;
            startX = e.clientX;
            startY = e.clientY;
    
            isDragging = true;
            postIt.style.zIndex = zIndex++;
        }
    
        function drag(e) {
            if (isDragging) {
                e.preventDefault();
                const dx = e.clientX - startX;
                const dy = e.clientY - startY;
                
                postIt.style.left = `${initialX + dx}px`;
                postIt.style.top = `${initialY + dy}px`;
            }
        }
    
        function dragEnd(e) {
            isDragging = false;
        }
    }

    function setActiveSidebarLink() {
        // Get current page filename
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        
        // Find and set active link
        const sidebarLinks = document.querySelectorAll('.sidebar a');
        sidebarLinks.forEach(link => {
            const href = link.getAttribute('href');
            if (href === currentPage) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    }
});

// Initialize the app when the DOM is loaded
document.addEventListener('DOMContentLoaded', initializeApp,);

// Debugging function
function logParsedData(jobsData) {
    console.log("Parsed Job Data:");
    jobsData.forEach((job, index) => {
        console.log(`Job ${index + 1}:`);
        console.log(`  Company: ${job.company}`);
        console.log(`  Applicant Count: ${job.applicantCount}`);
        console.log(`  Application Status: ${job.applicationStatus}`);
        console.log(`  Application Emoji: ${job.applicationEmoji}`);
        console.log('---');
    });
}
