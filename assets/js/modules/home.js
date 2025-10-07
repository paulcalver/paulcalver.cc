export default class Home {
	constructor() {
		this.state = null; // Current app state
		this.basePath = document.body.getAttribute("data-basepath") === "https://paulcalver.co" || document.body.getAttribute("data-basepath") === "https://paulcalver.cc" ? document.body.getAttribute("data-basepath") : new URL(document.body.getAttribute("data-basepath") || window.location.origin).pathname; // Extract the path portion of the base URL

		// this.basePath = document.body.getAttribute("data-basepath"); // Extract the path portion of the base URL

		this.supportsWebP = this.checkWebPSupport();

		this.isSafari = navigator.userAgent.indexOf('Safari') != -1 && navigator.userAgent.indexOf('Chrome') == -1;


		this.initialRoute = true;
		this.currentIndex = 0; // Initialize the currentIndex at 0
		this.pageTransitionTime = window.matchMedia("(max-width: 768px)").matches ? 10 : 500; // Duration of the page transition animation

		this.scale = 1; // Default scale
        this.scrollSpeed = 3; // Global scroll sensitivity
        this.draggableInstance = null;

        // Bind event listeners to ensure they can be properly added/removed
        this.handleMouseWheel = this.handleMouseWheel.bind(this);
        this.updateBounds = this.updateBounds.bind(this);
        this.handleMouseMove = this.handleMouseMove.bind(this);


		if (navigator.userAgent.indexOf('Safari') != -1 && navigator.userAgent.indexOf('Chrome') == -1) {
			document.querySelector('html').classList.add('is-safari');
		}
		
		// Determine initial state based on the current URL
		const fullPath = window.location.pathname;
		let relativePath = fullPath.startsWith(this.basePath)
			? fullPath.slice(this.basePath.length)
			: fullPath;
		
		// Remove trailing slash if present (except for root "/")
		relativePath = relativePath.endsWith("/") && relativePath !== "/"
			? relativePath.slice(0, -1)
			: relativePath;
		
		// Prepare initial state data
		let initialState = { path: relativePath };
		if (relativePath === "/" || relativePath === "") {
			initialState = { state: "featured" };
		} else if (relativePath.startsWith("/filter/")) {
			const filter = relativePath.split("/filter/")[1];
			initialState = { state: "filter", filter };
		} else if (relativePath === "/projects") {
			initialState = { state: "index" };
		} else if (relativePath.startsWith("/projects/")) {
			const project = relativePath.split("/projects/")[1];
			// console.log(project);
			initialState = { state: "project", project };
		} else if (relativePath === "/about") {
			initialState = { state: "about" };
		} else {
			window.location.href = this.basePath; // Redirect to basePath for unknown routes
		}

		// Set the initial state in history
		history.replaceState(initialState, "", window.location.href);

		this.initializeRouter();
		this.handleStateChange();
	}

	isMobile() {
		return window.matchMedia("(max-width: 768px)").matches;
	}

	isTouch() {
		return 'ontouchstart' in window || navigator.maxTouchPoints > 0 || navigator.msMaxTouchPoints > 0;
	}

	initializeRouter() {
		window.addEventListener("popstate", (event) => {
			this.handleStateChange();
			// console.log("Popstate triggered with state:", event.state);
		});
	}

	// navigate(url, state = {}) {
	// 	try {
	// 		const fullUrl = this.basePath + url;
	// 		// console.log(fullUrl, this.basePath, url);
	// 		history.pushState(state, "", fullUrl);

	// 		// Trigger `handleStateChange` only if not on the initial route
	// 		if (!this.initialRoute) {
	// 			this.handleStateChange();
	// 		}
	// 	} catch (error) {
	// 		console.error("Failed to navigate:", error);
	// 	}
	// }

navigate(url, state = {}) {
  try {
    // Resolve the target against a safe base (works local + live)
    const base   = document.body.dataset.basepath || window.location.origin;
    const target = new URL(url, base);

    // Push a same-origin relative URL to avoid cross-origin pushState errors
    const relative = target.pathname + target.search + target.hash;
    history.pushState(state, "", relative);

    if (!this.initialRoute) this.handleStateChange();
  } catch (error) {
    console.error("Failed to navigate:", error);
  }
}

	handleStateChange() {
		const fullPath = window.location.pathname;

		// Strip the base path from the current pathname
		let relativePath = fullPath.startsWith(this.basePath)
			? fullPath.slice(this.basePath.length)
			: fullPath;

		relativePath = relativePath.endsWith("/") && relativePath !== "/"
		? relativePath.slice(0, -1)
		: relativePath;
			

		if (relativePath === "/" || relativePath === "") {
			this.setState("featured");
			if(!this.initialRoute) {
				this.closeIndex();
				this.closeProject();
				this.closeAbout();
			}
			this.showFeatured(this.initialRoute); // Only call `showHome` here
		} else if (relativePath.startsWith("/filter/")) {
			const filter = relativePath.split("/filter/")[1];
			this.setState("filter", { filter });
			if(!this.initialRoute) {
				this.closeFeatured();
				this.closeProject();
				this.closeAbout();
			}
			this.showFilter(filter, this.initialRoute); // Only call `showFilter` here
		} else if (relativePath === "/projects") {
			this.setState("index");
			if(!this.initialRoute) {
				this.closeFeatured();
				this.closeProject();
				this.closeAbout();
			}
			this.showIndex(this.initialRoute); // Only call `showProjects` here
		} else if (relativePath.startsWith("/projects/")) {
			const project = relativePath.split("/projects/")[1];
			this.setState("project", { project });
			if(!this.initialRoute) {
				this.closeFeatured();
				this.closeIndex();
				this.closeAbout();
			}
			this.showProject(project, null, null, this.initialRoute); // Pass no clicked item
		} else if (relativePath === "/about") {
			this.setState("about");
			if(!this.initialRoute) {
				this.closeFeatured();
				this.closeIndex();
				this.closeProject();
			}
			this.showAbout(this.initialRoute); // Only call `showAbout` here
		} else {
			console.error("Unknown state for relative path:", relativePath);
		}


		// Set initialRoute to false after the first run
		if (this.initialRoute) {
			this.initialRoute = false;
			// console.log("Initial route setup complete");
		}
	}

	setState(state, additionalData = null) {
		if (this.state === state && JSON.stringify(this.additionalData) === JSON.stringify(additionalData)) {
			return; // Avoid redundant updates
		}

		this.state = state;
		this.additionalData = additionalData;

		// Log state changes for debugging
		// console.log("State updated:", state, additionalData);
	}

	setActiveButton(activeButton) {
		const buttons = document.querySelectorAll('.menu a');
		buttons.forEach(button => button.classList.remove('active-button'));
		activeButton.classList.add('active-button');
	}


    // Methods to handle visuals for each state
    showFeatured(initialRoute = false) {
		let timeout = initialRoute ? 0 : this.pageTransitionTime;

		if (initialRoute) {
			// console.log("Initial route detected");


			this.initializePage();


			
		} else {

			
		}

		document.querySelector('.featured').classList.add('active-section');
		document.body.classList.add('featured-active');
		this.setActiveButton(document.querySelector('.featured-link'));

		


		setTimeout(() => {


			document.querySelectorAll('.featured figure').forEach(figure => {
				figure.classList.remove('hide');
				setTimeout(() => {
					figure.classList.remove('unfiltered-figure');
				}, 10);
				setTimeout(() => {
					figure.classList.remove('stagger');
				}, Math.random() * 1200);
			});

			if(!this.isMobile()) {
				this.initializeCanvas(document.querySelector('.featured-items'), initialRoute);
			}


			this.loadMedia(document.querySelector('.featured'));
		}, timeout);

    }

	showIndex(initialRoute = false) {
		let timeout = initialRoute ? 0 : this.pageTransitionTime;
		if (initialRoute) {
			// console.log("Initial route detected");


			this.initializePage();

			
		} else {

			
		}
		
		// setTimeout(() => {
		if(!this.isMobile()) {
			this.showAdditionalMenu(document.querySelector('.filters'));
		}
		// }, 1000);

		document.querySelector('.index').classList.add('active-section');
		document.body.classList.add('index-active');
		this.setActiveButton(document.querySelector('.index-link'));

		document.querySelectorAll('.index figure').forEach(figure => {
			figure.classList.add('unfiltered-figure');
			figure.classList.add('stagger');
		});



		setTimeout(() => {

			document.querySelectorAll('.index figure').forEach(figure => {
				figure.classList.add('hide');
				figure.classList.remove('hide');
				setTimeout(() => {
					figure.classList.remove('unfiltered-figure');
				}, 10);
				setTimeout(() => {
					figure.classList.remove('stagger');
				}, Math.random() * 1200);
			});

			if(!this.isMobile()) {
				this.initializeCanvas(document.querySelector('.index-items'));
			}

			this.loadMedia(document.querySelector('.index'));
		}, timeout);

    }

    showFilter(filter, initialRoute = false) {
		let timeout = initialRoute ? 0 : this.pageTransitionTime;
		if (initialRoute) {
			// console.log("Initial route detected");


			this.initializePage();

			
		} else {

			
		}

		// setTimeout(() => {
		if(!this.isMobile()) {
			this.showAdditionalMenu(document.querySelector('.filters'));
		}
		// }, 1000);

        document.querySelector('.index').classList.add('active-section');
		document.body.classList.add('index-active');
		this.setActiveButton(document.querySelector('.filter-button[data-filter="' + filter + '"]'));

		document.querySelectorAll('.index figure').forEach(figure => {
			figure.classList.add('unfiltered-figure');
			figure.classList.add('stagger');
		});

		
		
		setTimeout(() => {

			if(this.isMobile()) {

				document.querySelector('.index').scrollTo(0, 0);

			}

			document.querySelectorAll('.index figure').forEach(figure => {

				figure.classList.add('hide');

				const categories = figure.dataset.categories ? figure.dataset.categories.split(',') : [];
				const shouldShow = !filter || categories.includes(filter);
	
				if (shouldShow) {
					figure.classList.remove('hide');
					setTimeout(() => {
						figure.classList.remove('unfiltered-figure');
					}, 10);
					setTimeout(() => {
						figure.classList.remove('stagger');
					}, Math.random() * 300);
				} 
			});

			if(!this.isMobile()) {
				this.initializeCanvas(document.querySelector('.index-items'));
			}


			this.loadMedia(document.querySelector('.index'));
		}, timeout);
		
    }

    showProject(projectSlug, clickedFigure = null, allFigures = null, initialRoute = false) {
		let timeout = initialRoute ? 0 : this.pageTransitionTime;
		if (initialRoute) {
			// console.log("Initial route detected");

			this.initializePage(initialRoute);
			
		} else {

			
		}

		

		setTimeout(() => {
			const gallery = document.querySelector('.gallery');
			gallery.classList.add('active-section');
			this.initializeGallery(projectSlug, clickedFigure, allFigures, initialRoute);
			if(!document.body.classList.contains('hidden-page')) {
				// this.initializeGallery(projectSlug, clickedFigure, allFigures, initialRoute);
			} else {
				this.initializeHiddenGallery();
				this.checkForCaption();
			}
			document.body.classList.add('gallery-active');
		}, timeout);
	}

    showAbout(initialRoute = false) {
		let timeout = initialRoute ? 0 : this.pageTransitionTime;
		if (initialRoute) {
			// console.log("Initial route detected");

			this.initializePage();
			
		} else {

			
		}

		// setTimeout(() => {
		if(!this.isMobile()) {
			this.showAdditionalMenu(document.querySelector('.external-links'));
		}
		// }, 1000);

		setTimeout(() => {
			document.querySelector('.about').classList.add('active-section');
			document.body.classList.add('about-active');
			this.setActiveButton(document.querySelector('.about-link'));
		}, timeout);


    }

	

	closeFeatured() {
		// console.log('close featured');
		

		setTimeout(() => {
			document.querySelector('.featured').classList.remove('active-section');
			document.body.classList.remove('featured-active');
		}, this.pageTransitionTime);

		document.querySelectorAll('.featured figure').forEach(figure => {
			figure.classList.add('unfiltered-figure');
			figure.classList.add('stagger');
			setTimeout(() => {
				figure.classList.add('hide');
			}, this.pageTransitionTime);
		});
	}

	closeIndex() {
		// console.log('close projects');

		setTimeout(() => {
			document.querySelector('.index').classList.remove('active-section');
			document.body.classList.remove('index-active');
		}, this.pageTransitionTime);

		// setTimeout(() => {
			if(!this.isMobile()) {
				this.hideAdditionalMenu(document.querySelector('.filters'));
			}
		// }, 1000);

		document.querySelectorAll('.index figure').forEach(figure => {
			figure.classList.add('unfiltered-figure');
			figure.classList.add('stagger');
			setTimeout(() => {
				figure.classList.add('hide');
			}, this.pageTransitionTime);
		});
	}

	closeProject() {
		document.querySelector('.gallery').classList.remove('active-section');
		document.body.classList.remove('gallery-active');
		setTimeout(() => {
			document.querySelector('.gallery-inner').innerHTML = '';
		}, this.pageTransitionTime);
	}

	closeAbout() {
		document.querySelector('.about').classList.remove('active-section');
		document.body.classList.remove('about-active');

		// setTimeout(() => {
		if(!this.isMobile()) {
			this.hideAdditionalMenu(document.querySelector('.external-links'));
		}
		// }, 1000);
	}

	showAdditionalMenu(menu) {
		if (!menu || menu.style.width === 'auto') return;
		menu.style.width = 'auto';
		const fullWidth = menu.offsetWidth;

		// Reset width to 0 to prepare for animation
		menu.style.width = '0';

		// Animate the width using GSAP
		gsap.to(menu, {
			width: fullWidth,
			duration: 0.5,
			ease: 'power4.out',
			onComplete: () => {
				// Optional: Clean up inline styles if necessary
				menu.style.width = 'auto';

				const menuButtons = menu.querySelectorAll('a');
				gsap.to(menuButtons, {
					opacity: 1,
					duration: 0.5,
					stagger: 0.1, // Stagger animation for each button
				});
			}
		});
	}

	hideAdditionalMenu(menu) {
		if (!menu) return;
		const menuButtons = menu.querySelectorAll('a');

		gsap.to(menuButtons, {
			opacity: 0,
			duration: 0.5,
			stagger: -0.1, // Stagger animation for each button
			onComplete: () => {
				gsap.to(menu, {
					width: 0,
					duration: 0.5,
					ease: 'power4.out',
				});
			}
		});
	}

	initializeMobileEvents(){
		document.querySelector('.mobile-button-filters').addEventListener('click', () => {
			document.body.classList.add('mobile-filters-open');
		});

		document.querySelector('.mobile-button-menu').addEventListener('click', () => {
			document.body.classList.add('mobile-menu-open');
		});

		document.querySelector('.mobile-button-close').addEventListener('click', () => {
			this.closeMobileMenus();
		});
	}

	closeMobileMenus() {
		if(document.body.classList.contains('gallery-active')) {
			const closeButton = document.querySelector('.project-controls .close');
			closeButton.dispatchEvent(new Event('click', { bubbles: true }));
		} else {
			document.body.classList.remove('mobile-menu-open');
			document.body.classList.remove('mobile-filters-open');
		}
	}

	initializePage(initialRoute = false) {

		gsap.registerPlugin(Draggable, InertiaPlugin);
		gsap.config({
			nullTargetWarn: false,
		});

		if(!this.isMobile()) {
			this.initializeFeaturedLayout();
			this.initializeObserver();
		} else {
			this.initializeMobileEvents();
		}

		this.initializeNavigation(initialRoute);
	}

	initializeObserver() {
		const observer = new IntersectionObserver((entries) => {
			entries.forEach(entry => {
				if (entry.isIntersecting) {
					// Image is in view, set opacity to 1 and scale to 1
					gsap.to(entry.target, { 
						opacity: 1, 
						scale: 1,  // Scale to 1 when visible
						duration: 1,
						ease: "power2.out"
					});
	
				} else {
					// Image is out of view, set opacity to 0.5 and scale to 0.75
					gsap.to(entry.target, { 
						opacity: 0.25, 
						scale: 0.9,  // Scale down when not visible
						duration: 1,
						ease: "power2.out"
					});
	
				}
			});
		}, {
			root: null,  // Track visibility relative to the viewport
			threshold: 0.1 // Trigger when at least 10% of the image is visible
		});

		document.querySelectorAll('.index .project-link-inner, .featured .project-link-inner').forEach(item => {
			observer.observe(item);
		});
	}

	calculateBounds(container) {
        const maxX = -container.offsetWidth * this.scale + window.innerWidth;
        const maxY = -container.offsetHeight * this.scale + window.innerHeight;
        return { minX: maxX, minY: maxY, maxX: 0, maxY: 0 };
    }

    handleMouseWheel(event) {
        if (!this.draggableInstance) return;

        const container = this.draggableInstance.target;
        const currentX = gsap.getProperty(container, 'x');
        const currentY = gsap.getProperty(container, 'y');

        let newX = currentX - event.deltaX * this.scrollSpeed;
        let newY = currentY - event.deltaY * this.scrollSpeed;

        const bounds = this.calculateBounds(container);

        newX = gsap.utils.clamp(bounds.minX, bounds.maxX, newX);
        newY = gsap.utils.clamp(bounds.minY, bounds.maxY, newY);

        gsap.to(container, {
            x: newX,
            y: newY,
            duration: 0.3,
            ease: "power2.out",
			onUpdate: () => this.draggableInstance.update(),
    		onComplete: () => this.draggableInstance.update(),
        });

		this.updateBounds();
    }

    updateBounds() {
        if (this.draggableInstance) {
            const container = this.draggableInstance.target;
            this.draggableInstance.applyBounds(this.calculateBounds(container));
        }
    }

    handleMouseMove(e) {
        if (!this.draggableInstance) return;

        const containerInner = this.draggableInstance.target.closest('.container-inner');
        const maxNudge = 50;
        const mouseX = e.clientX;
        const mouseY = e.clientY;

        const nudgeAmountX = ((mouseX / window.innerWidth) - 0.5) * maxNudge;
        const nudgeAmountY = ((mouseY / window.innerHeight) - 0.5) * maxNudge;

        gsap.to(containerInner, {
            x: nudgeAmountX,
            y: nudgeAmountY,
            duration: 1.5,
            ease: 'power3.out',
        });
    }

    initializeCanvas(container, initialRoute = false) {
        const containerInner = container.closest('.container-inner');

        // Remove previous Draggable instance
        if (this.draggableInstance) {
            this.draggableInstance.kill();
        }

        // Remove existing event listeners
        window.removeEventListener('wheel', this.handleMouseWheel);
        window.removeEventListener('resize', this.updateBounds);
        window.removeEventListener('mousemove', this.handleMouseMove);

        this.draggableInstance = Draggable.create(container, {
			type: "x,y",
			edgeResistance: 0.85,
			inertia: true,
			bounds: this.calculateBounds(container),
			throwProps: true,
			throwResistance: 20000,
			maxDuration: 3,
			minDuration: 0.5,
			onDrag: () => {
				const bounds = this.calculateBounds(container);
				gsap.utils.clamp(bounds.minX, bounds.maxX, gsap.getProperty(container, 'x'));
				gsap.utils.clamp(bounds.minY, bounds.maxY, gsap.getProperty(container, 'y'));
			},
			onThrowUpdate: () => {
				this.updateBounds();
			}
		})[0];

        // Add event listeners
        window.addEventListener('wheel', this.handleMouseWheel);
        window.addEventListener('resize', this.updateBounds);
        window.addEventListener('mousemove', this.handleMouseMove);

        // Center the container
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        const containerWidth = container.offsetWidth;
        const containerHeight = container.offsetHeight;

        const initialX = (viewportWidth - containerWidth) / 2;
        const initialY = (viewportHeight - containerHeight) / 2;

        gsap.set(container, {
            x: initialX,
            y: initialY,
        });

		if(container.classList.contains('featured-items') && initialRoute) {
			// this.preventInteraction = true;
			const targetScale = 0.7;
			gsap.to(container, {
				scale: targetScale,
				duration: 0,
				ease: 'power3.out',
				onUpdate: this.updateBounds()
			});

			setTimeout(() => {
				const animationDuration = 2; // Total duration of the animation in seconds
			
				// Scale animation
				gsap.to(container, {
					scale: 1,
					duration: animationDuration,
					ease: 'power3.out',
					onUpdate: () => this.updateBounds(),
				});

			}, 50);
		};
    }

	
	

	initializeFeaturedLayout() {
		let totalWidth = 0;
		let totalHeight = 0;
		let totalArea = 0;
	
		const items = document.querySelectorAll('.featured img, .featured video');
		const totalItems = items.length;
	
		const margins = 40; // Example margin size (left and right)
	
		items.forEach((img) => {
			const figure = img.closest('figure');
			const link = figure.querySelector('.project-link-inner');
			const imgWidth = parseInt(img.attributes.width.value, 10);
			const imgHeight = parseInt(img.attributes.height.value, 10);
	
			const ratio = imgWidth / imgHeight; // Aspect ratio (width divided by height)
	
			// Random size for the long edge between 240 and 480
			const min = 240;
			const max = 480;
			const randomSizeLongEdge = Math.floor(Math.random() * (max - min + 1) + min);
	
			let itemWidth, itemHeight;
	
			// Determine if width or height is the longest edge
			if (imgWidth >= imgHeight) {
				// Width is the longest edge
				itemWidth = randomSizeLongEdge;
				itemHeight = Math.floor(randomSizeLongEdge / ratio);
			} else {
				// Height is the longest edge
				itemHeight = randomSizeLongEdge;
				itemWidth = Math.floor(randomSizeLongEdge * ratio);
			}
	
			// Add the item's width and height, including margins
			totalWidth += itemWidth + margins;
			totalHeight += itemHeight + margins;
	
			totalArea += (itemWidth + margins) * (itemHeight + margins);
	
			link.style.width = `${itemWidth}px`;
			link.style.height = `${itemHeight}px`;
	
			const minPadding = 40;
			const maxPadding = 80;
	
			figure.style.padding = `${Math.floor(Math.random() * (maxPadding - minPadding + 1) + minPadding)}px`;
	
			figure.dataset.parallax = (Math.random() * 0.4 + 0.1).toFixed(2);
		});
	
		// Calculate grid dimensions based on 4:3 ratio
		const approximateRows = Math.ceil(Math.sqrt(totalItems * (3 / 4))); // More rows due to 4:3
		const approximateCols = Math.ceil(totalItems / approximateRows);
	
		// Calculate the container width based on the grid
		const containerWidth = approximateCols * (totalWidth / totalItems);
		const containerHeight = approximateRows * (totalHeight / totalItems);
	
		// Ensure container height roughly matches 4:3 ratio
		const adjustedContainerWidth = Math.max(containerWidth, containerHeight * (4 / 3));
	
		const featuredContainer = document.querySelector('.featured-items');
		// featuredContainer.style.width = `${adjustedContainerWidth}px`;
	
		// Initialize Packery layout
		var iso = new Packery('.featured-items', {
			itemSelector: 'figure',
			resize: false
		});

		featuredContainer.style.width = document.querySelector('.featured-items').offsetWidth + 'px';
	}


	initializeNavigation(initialRoute = false) {
		// console.log('initialize navigation');
		this.setNavigationListeners(initialRoute);
	}

	setNavigationListeners(initialRoute = false) {
		this.initializeNavEvents();
		this.initializeProjectsEvents();
		this.initializeGalleryEvents(initialRoute);
	}

	initializeNavEvents() {
		document.querySelector('.home-link').addEventListener('click', (e) => {
			e.preventDefault();
			if(this.isMobile){
				setTimeout(() => {
					this.closeMobileMenus();
				}, 200);
			}
			this.navigate('/', { state: 'featured' });
		});

		document.querySelector('.featured-link').addEventListener('click', (e) => {
			e.preventDefault();
			if(this.isMobile){
				setTimeout(() => {
					this.closeMobileMenus();
				}, 200);
			}
			this.navigate('/', { state: 'featured' });
		});

		document.querySelector('.index-link').addEventListener('click', (e) => {
			e.preventDefault();
			if(this.isMobile){
				setTimeout(() => {
					this.closeMobileMenus();
				}, 200);
			}
			this.navigate('/projects', { state: 'index' });
		});

		document.querySelector('.about-link').addEventListener('click', (e) => {
			e.preventDefault();
			if(this.isMobile){
				setTimeout(() => {
					this.closeMobileMenus();
				}, 200);
			}
			this.navigate('/about', { state: 'about' });
		});

		const filterLinks = document.querySelectorAll('.filter-button');
		filterLinks.forEach(link => {
			link.addEventListener('click', (e) => {
				e.preventDefault();
				const filter = link.dataset.filter;
				if(this.isMobile){
					this.closeMobileMenus();
				}
				if(link.classList.contains('active-filter') || filter === 'all') {
					this.navigate('/projects', { state: 'index' });
				} else {
					this.navigate(`/filter/${filter}`, { state: 'filter', filter });
				}
			});
		});
		
		if(!this.isMobile() && !this.isTouch()) {
			let navTimeout; // To store the timeout ID
			const nav = document.querySelector('nav'); // Replace with the actual nav selector
			nav.addEventListener('mouseenter', () => {
				clearTimeout(navTimeout);
				navTimeout = setTimeout(() => {
					document.body.classList.add('highlight-nav');
				}, 500);
			});

			nav.addEventListener('mouseleave', () => {
				clearTimeout(navTimeout);
				document.body.classList.remove('highlight-nav');
			});
		}
	}

	initializeProjectsEvents() {
		const projectLinks = document.querySelectorAll('.project-link');
		const pageTitle = document.querySelector('.page-title'); // Target the page title element
		let hoverTimeout = null; // Variable to store the timeout ID
	
		projectLinks.forEach(link => {
			const figure = link.closest('figure'); // Get the figure associated with the link
			

			if(!this.isMobile() && !this.isTouch()) {
				// Hover event with a 200ms delay
				link.addEventListener('mouseenter', () => {

					if(this.preventInteraction) return;

					hoverTimeout = setTimeout(() => {
						const title = figure.dataset.title; // Get the data-title attribute
						if (title) {
							pageTitle.textContent = title; // Set the page title to the figure's title
							document.body.classList.add('show-title');
						}
		
						// Add 'not-selected' to other figures in the parent container
						const parentContainer = figure.closest('.index, .featured');
						if (parentContainer) {
							const otherFigures = parentContainer.querySelectorAll('figure');
							otherFigures.forEach(otherFigure => {
								if (otherFigure !== figure && otherFigure.dataset.projectSlug !== figure.dataset.projectSlug) {
									otherFigure.classList.add('not-selected');
								}
							});
						}
					}, 500); // Delay of 200ms
				});
		
				// Clear the timeout and reset classes on mouseleave
				link.addEventListener('mouseleave', () => {
					clearTimeout(hoverTimeout);
					hoverTimeout = null;
					document.body.classList.remove('show-title');
		
					// Remove 'not-selected' from all figures in the parent container
					const parentContainer = figure.closest('.index, .featured');
					if (parentContainer) {
						const allFigures = parentContainer.querySelectorAll('figure');
						allFigures.forEach(otherFigure => otherFigure.classList.remove('not-selected'));
					}
				});

			}
	
			// Clear the timeout on click
			link.addEventListener('click', (e) => {
				clearTimeout(hoverTimeout);
				hoverTimeout = null;
				e.preventDefault(); // Prevent default navigation
				
				const title = figure.dataset.title; // Get the data-title attribute
				if (title) {
					pageTitle.textContent = title; // Set the page title to the figure's title
					// document.body.classList.add('show-title');
				}

				const projectSlug = figure.dataset.projectSlug;
				let allFigures = null;

				if(document.querySelector('.featured').classList.contains('active-section')) {
					allFigures = document.querySelectorAll('.index figure[data-categories*="featured"]');
				} else {
					allFigures = document.querySelectorAll('.index figure:not(.unfiltered-figure)');
				}

				document.body.classList.add('hold-title');
				setTimeout(() => {
					document.body.classList.remove('hold-title');
				}, 1000);
	
				// Navigate to the gallery and pass the clicked `figure`
				this.navigate(`/projects/${projectSlug}`, { state: 'project', project: projectSlug });
				this.showProject(projectSlug, figure, allFigures);
			});
		});
	}

	initializeGalleryEvents(initialRoute = false) {
		const prevButton = document.querySelector('.project-controls .previous');
		const nextButton = document.querySelector('.project-controls .next');
		const closeButton = document.querySelector('.project-controls .close');
		const galleryInner = document.querySelector('.gallery-inner');
	
		const updateGallery = (direction) => {
			const slides = Array.from(galleryInner.querySelectorAll('.gallery-slide'));
		
			// Hide all slides to ensure only one is visible
			slides.forEach(slide => slide.classList.add('hide-slide'));
		
			// Update the current index based on the direction
			if (direction === 'next') {
				this.currentIndex = (this.currentIndex + 1) % slides.length;
				this.loadAdjacentSlides(slides[this.currentIndex]);
			} else if (direction === 'prev') {
				this.currentIndex = (this.currentIndex - 1 + slides.length) % slides.length;
				this.loadAdjacentSlides(slides[this.currentIndex]);
			}
		
			// Show the new current slide
			const currentSlide = slides[this.currentIndex];
			currentSlide.classList.remove('hide-slide');

			const currentFigures = currentSlide.querySelectorAll('figure');
			currentFigures.forEach(figure => {
				
				

				if (this.isSafari) {
					this.setGalleryFigureWidthSafari(figure);

					if (figure.querySelector('video')) {
						setTimeout(() => {
							const loadedVideo = figure.querySelector('video');
							this.setVideoDimensions(loadedVideo);
						}, 100);
					}
				}

				
			});
		
			// Update the page title with the title of the current slide
			const currentSlideFirstFigure = slides[this.currentIndex].querySelector('figure:nth-child(1)');
			const currentSlideTitle = currentSlideFirstFigure.dataset.title;

			if (!this.isMobile() && !document.body.classList.contains('hidden-page')) {
				const pageTitle = document.querySelector('.page-title');
				if (currentSlideTitle && pageTitle && pageTitle.textContent !== currentSlideTitle) {
					// Use GSAP for fade-out and fade-in
					gsap.timeline()
						.to(pageTitle, {
							opacity: 0, // Fade out
							duration: 0.2, // Quicker animation
							ease: "power1.out",
						})
						.add(() => {
							pageTitle.textContent = currentSlideTitle; // Update title text
						})
						.to(pageTitle, {
							opacity: 1, // Fade in
							duration: 0.2, // Quicker animation
							ease: "power1.in",
						});
				}
			} else {
				const pageTitle = document.querySelector('.page-title');
				if (currentSlideTitle && pageTitle) {
					pageTitle.textContent = currentSlideTitle;
				}
			}
		
			// Update the gallery-index for the current project's slide count
			const currentProjectSlug = currentSlideFirstFigure.dataset.projectSlug;
			const projectSlides = slides.filter(slide => 
				slide.querySelector('figure:nth-child(1)').dataset.projectSlug === currentProjectSlug
			);
			const projectIndex = (projectSlides.indexOf(currentSlide) + 1).toString().padStart(2, '0'); // Ensures 2 digits
			const projectTotal = projectSlides.length.toString().padStart(2, '0'); // Ensures 2 digits
			
		
			const galleryIndexElement = document.querySelector('.project-index');
			if (galleryIndexElement) {
				galleryIndexElement.textContent = `${projectIndex} | ${projectTotal}`;
			}
		
			// Check if the slug of the new slide is different from the current active slide
			const newSlug = currentSlideFirstFigure.dataset.projectSlug;
			const currentActiveSlug = slides[this.currentIndex].dataset.projectSlug;
		
			if (newSlug && newSlug !== currentActiveSlug) {
				const newUrl = `${this.basePath}/projects/${newSlug}`;
				history.replaceState({ state: 'project', project: newSlug }, '', newUrl);
			}
		
			// If it's a hidden page, check caption
			if (document.body.classList.contains('hidden-page')) {
				this.checkForCaption();
			}
		};

		let clearInitialRoute = false;

		if(!this.isMobile()) {
			document.querySelector('.gallery').addEventListener('click', (e) => {
				// Check if the target is a video or inside a video element
				if (e.target.tagName.toLowerCase() === 'video' || e.target.closest('video')) {
					return; // Do nothing if it's a video
				}
			
				// Find the closest slide
				const slide = e.target.closest('.gallery-slide');
				if (slide) {
					const clickX = e.clientX; // Get the horizontal click position
					const screenWidth = window.innerWidth; // Get the viewport width
			
					if (clickX < screenWidth / 2) {
						updateGallery('prev'); // Clicked on the left side
					} else {
						updateGallery('next'); // Clicked on the right side
					}
				}
			});
		}

		const hammer = new Hammer(document.querySelector('.gallery'));
		hammer.on('swiperight', () => {
			updateGallery('prev');
		});
		hammer.on('swipeleft', () => {
			updateGallery('next');
		});
	
		prevButton.addEventListener('click', () => updateGallery('prev'));
		nextButton.addEventListener('click', () => updateGallery('next'));
		closeButton.addEventListener('click', () => {
			if((initialRoute && !clearInitialRoute) || document.body.classList.contains('hidden-page')) {
				// this.navigate('/', { state: 'featured' });
				// clearInitialRoute = true;
				window.location.href = document.body.getAttribute('data-basepath');
			} else {
				history.back();
			}
		});

		document.addEventListener('keydown', (event) => {
			switch (event.key) {
				case 'ArrowLeft': // Navigate to the previous slide
					updateGallery('prev');
					break;
				case 'ArrowRight': // Navigate to the next slide
					updateGallery('next');
					break;
				case 'Escape': // Close the gallery
					history.back();
					break;
				default:
					break; // Ignore other keys
			}
		});
	}

	checkForCaption() {
		const activeSlide = document.querySelector('.gallery-slide:not(.hide-slide)');
		if(!activeSlide) return;
		const figures = activeSlide.querySelectorAll('figure');
		const hiddenCaption = document.querySelector('.hidden-caption');

		// Initialize caption as empty
		let caption = '';

		// Loop through the figures to find the first data-caption
		figures.forEach(figure => {
			if (figure.dataset.caption) {
				caption = figure.dataset.caption;
			}
		});

		// Set the content and display of .hidden-caption
		if (caption) {
			hiddenCaption.textContent = caption;
			hiddenCaption.style.display = 'block';
		} else {
			hiddenCaption.textContent = '';
			hiddenCaption.style.display = 'none';
		}

	}

	initializeGallery(projectSlug, clickedFigure = null, allFigures, initialRoute = false) {

		// console.log(initialRoute);

		const galleryInner = document.querySelector('.gallery-inner');
		const figures = Array.from(document.querySelectorAll('.index figure'));

		
		const activeFigures = allFigures ? allFigures : document.querySelectorAll('.index figure');
		galleryInner.innerHTML = ''; // Clear existing gallery content
		const slides = [];
		let currentSlide = [];
	
		const activeFiguresArray = Array.from(activeFigures); // Convert NodeList to an array for mutability
		const processedIndices = new Set(); // Keep track of indices that have been added to slides

		activeFiguresArray.forEach((figure, index) => {
			if (processedIndices.has(index)) return; // Skip figures that have already been added to a slide

			const isDiptych = figure.dataset.isDiptych === 'true';
			const nextFigure = activeFiguresArray[index + 1];
			const sameProject = nextFigure?.dataset.projectSlug === figure.dataset.projectSlug;

			if (isDiptych && sameProject) {
				// Add the current figure and the next figure as a diptych
				slides.push([figure, nextFigure]);
				processedIndices.add(index); // Mark the current figure as processed
				processedIndices.add(index + 1); // Mark the next figure as processed
			} else {
				// Add the current figure as a single slide
				slides.push([figure]);
				processedIndices.add(index); // Mark the current figure as processed
			}
		});
	
		// Generate slides dynamically
		slides.forEach(slideFigures => {
			const slide = document.createElement('div');
			slide.classList.add('gallery-slide');
	
			slideFigures.forEach(figure => {
				const figureElement = document.createElement('figure');
	
				// Map camelCase attributes back to kebab-case
				const attributeMap = {
					title: 'data-title',
					client: 'data-client',
					projectUrl: 'data-project-url',
					projectSlug: 'data-project-slug',
					gallery: 'data-gallery',
					galleryjpeg: 'data-galleryjpeg',
					galleryWidth: 'data-gallery-width',
					galleryHeight: 'data-gallery-height',
					isDiptych: 'data-is-diptych',
					videoUrl: 'data-video-url',
					isPortrait: 'data-is-portrait',
					autoplay: 'data-autoplay',
					caption: 'data-caption',
				};
			
				// Copy relevant data attributes from the index figure to the gallery figure
				Object.entries(attributeMap).forEach(([camelCase, kebabCase]) => {
					if (figure.dataset[camelCase]) {
						figureElement.setAttribute(kebabCase, figure.dataset[camelCase]);
					}
				});
	
				const isVideo = figure.dataset.videoUrl !== undefined;
				const mediaUrl = figure.dataset.gallery;
				const mediaWidth = figure.dataset.galleryWidth;
				const mediaHeight = figure.dataset.galleryHeight;
	
				if (isVideo) {
					const videoElement = document.createElement('video');
					videoElement.src = figure.dataset.videoUrl;
					videoElement.poster = figure.dataset.galleryjpeg || '';
					videoElement.width = mediaWidth ? parseInt(mediaWidth, 10) : undefined;
					videoElement.height = mediaHeight ? parseInt(mediaHeight, 10) : undefined;
					videoElement.loop = true;
					videoElement.playsInline = true;
					videoElement.preload = 'metadata';
					if (figure.dataset.autoplay) {
						videoElement.autoplay = true;
						videoElement.muted = true;
					} else {
						videoElement.controls = true;
						videoElement.controlsList = 'nodownload';
					}
					videoElement.style.aspectRatio = `${mediaWidth}/${mediaHeight}`;
					figureElement.appendChild(videoElement);
				} else if (mediaUrl) {
					const imgElement = document.createElement('img');
					imgElement.src = 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=';
					imgElement.dataset.src = mediaUrl;
					imgElement.dataset.srcjpeg = figure.dataset.galleryjpeg;
					imgElement.width = mediaWidth ? parseInt(mediaWidth, 10) : undefined;
					imgElement.height = mediaHeight ? parseInt(mediaHeight, 10) : undefined;
					figureElement.appendChild(imgElement);
				}
	
				slide.appendChild(figureElement);
			});
	
			galleryInner.appendChild(slide);
		});
	
		// Ensure all slides are hidden initially
		const slidesInGallery = galleryInner.querySelectorAll('.gallery-slide');
		slidesInGallery.forEach(slide => (slide.classList.add('hide-slide')));
	
		// Determine the starting slide index
		let startIndex = 0;
		// if (clickedFigure && clickedFigure.closest('.index')) {
		if (clickedFigure) {
			const clickedGallery = clickedFigure.dataset.gallery;
			startIndex = slides.findIndex(slide =>
				Array.from(slide).some(figure => figure.dataset.gallery === clickedGallery)
			);
			if (startIndex === -1) startIndex = 0;
		} else {
			startIndex = slides.findIndex(slide =>
				slide.some(figure => figure.dataset.projectSlug === projectSlug)
			);
			if (startIndex === -1) startIndex = 0;
		}
	
		// Show the starting slide
		if (slidesInGallery[startIndex]) {
			const startingSlideTitle = slidesInGallery[startIndex].querySelector('figure').dataset.title;
			const pageTitle = document.querySelector('.page-title');
			if (startingSlideTitle && pageTitle) {
				pageTitle.textContent = startingSlideTitle;
			}
	
			slidesInGallery[startIndex].classList.remove('hide-slide');

			this.loadMedia(slidesInGallery[startIndex]);
			this.loadAdjacentSlides(slidesInGallery[startIndex]);
	
			// Synchronize currentIndex with the starting slide
			this.currentIndex = startIndex;

			const currentFigures = slidesInGallery[startIndex].querySelectorAll('figure');
			currentFigures.forEach(figure => {
				

				if (this.isSafari) {
					this.setGalleryFigureWidthSafari(figure);

					if (figure.querySelector('video')) {
						const loadedVideo = figure.querySelector('video');

						setTimeout(() => {
							this.setVideoDimensions(loadedVideo);
						}, 100);
					}
				}

				

				// if (this.isSafari) {
				// 	this.setGalleryFigureWidthSafari(figure);
				// }
			});
		}

		// Show the total number of slides
		if (slidesInGallery[startIndex]) {
			const startingSlideTitle = slidesInGallery[startIndex].querySelector('figure').dataset.title;
			const pageTitle = document.querySelector('.page-title');
			if (startingSlideTitle && pageTitle) {
				pageTitle.textContent = startingSlideTitle;
			}
		
			slidesInGallery[startIndex].classList.remove('hide-slide');
		
			this.loadMedia(slidesInGallery[startIndex]);
			this.loadAdjacentSlides(slidesInGallery[startIndex]);
		
			// Synchronize currentIndex with the starting slide
			this.currentIndex = startIndex;
		
			// Update the gallery-index
			const currentSlide = slides[startIndex];
			const currentProjectSlug = currentSlide[0].dataset.projectSlug;
			const projectSlides = slides.filter(slide =>
				slide.some(figure => figure.dataset.projectSlug === currentProjectSlug)
			);
			const projectIndex = String(projectSlides.indexOf(currentSlide) + 1).padStart(2, '0'); // Ensures 2 digits
			const projectTotal = String(projectSlides.length).padStart(2, '0'); // Ensures 2 digits
		
			const galleryIndexElement = document.querySelector('.project-index');
			if (galleryIndexElement) {
				galleryIndexElement.textContent = `${projectIndex} | ${projectTotal}`;
			}
		}
	}

	initializeHiddenGallery() {

		const firstSlide = document.querySelector('.gallery .gallery-slide:first-child');
		
		this.loadAdjacentSlides(document.querySelector('.gallery .gallery-slide:first-child'));

		const currentFigures = firstSlide.querySelectorAll('figure');
		currentFigures.forEach(figure => {

			if (this.isSafari) {
				this.setGalleryFigureWidthSafari(figure);

				if (figure.querySelector('video')) {
					const loadedVideo = figure.querySelector('video');

					setTimeout(() => {
						this.setVideoDimensions(loadedVideo);
					}, 100);
				}
			}

			

			
		});
	}

	startVideos(videos) {

		videos.forEach(video => {
			video.play();
		});

	}

	stopVideos(videos) {
		
		videos.forEach(video => {
			video.pause();
		});

	}

	loadAdjacentSlides(currentSlide) {
		const slides = Array.from(document.querySelectorAll('.gallery-slide'));
		const currentIndex = slides.findIndex(slide => slide === currentSlide);
		const totalSlides = slides.length;
	
		// Calculate indices for two before and two after with looping
		const indicesToLoad = [
			(currentIndex - 2 + totalSlides) % totalSlides,
			(currentIndex - 1 + totalSlides) % totalSlides,
			currentIndex,
			(currentIndex + 1) % totalSlides,
			(currentIndex + 2) % totalSlides,
		];
	
		// Load media for the required slides
		indicesToLoad.forEach(index => {
			this.loadMedia(slides[index]);
		});
	
		// Stop all videos except for those on the current slide
		slides.forEach((slide, index) => {
			const videos = slide.querySelectorAll('video');
			if (index === currentIndex) {
				// Start videos for the current slide
				// if the video has attr autoplay
				videos.forEach(video => {
					if(video.hasAttribute('autoplay')) {
						video.play();
					}
				});
				// this.startVideos(videos);
			} else {
				// Stop videos for other slides
				this.stopVideos(videos);
			}
		});
	}

	checkWebPSupport() {
		const canvas = document.createElement('canvas');
		return canvas.getContext && canvas.getContext('2d')
			? canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0
			: false;
	}

	loadMedia(container) {

		if (!container) {
			console.error('Container element not found');
			return;
		}

		
		const figures = container.querySelectorAll('figure:not(.loaded):not(.loading)');
		if (!figures.length) return;
	
	
		figures.forEach(figure => {
			figure.classList.add('loading'); // Add loading class
	
			const video = figure.querySelector('video[data-src]');
			const img = figure.querySelector('img[data-src]');
	
			const mediaElements = [];
			if (video) {
				video.src = video.dataset.src;
	
				// if (isSafari) {
				// 	video.addEventListener('loadeddata', () => {
				// 		video.currentTime = 1; // Set to first frame in Safari
				// 	}, { once: true });
				// }
				mediaElements.push(video);
			}
			if (img) {
				// Use data-src for WebP if supported, otherwise data-srcjpeg
				img.src = this.checkWebPSupport ? img.dataset.src : img.dataset.srcjpeg;
				mediaElements.push(img);
			}
	
			// Wait for all media to load
			Promise.all(mediaElements.map(media => new Promise(resolve => {
				if (media.tagName === 'VIDEO') {
					media.onloadeddata = resolve;
				} else {
					media.onload = resolve;
				}
				media.onerror = resolve; // Handle errors gracefully
			}))).then(() => {
				figure.classList.remove('loading');
				figure.classList.add('previously-loaded');
				figure.classList.add('loaded');
			
			});
		});
	}

	setVideoDimensions(video) {
		requestAnimationFrame(() => {
			const containerWidth = video.parentElement.clientWidth; // Width of the parent container
			const containerHeight = video.parentElement.clientHeight; // Height of the parent container
			const intrinsicWidth = parseInt(video.getAttribute('width')); // Intrinsic width of the video
			const intrinsicHeight = parseInt(video.getAttribute('height')); // Intrinsic height of the video
	
			if (!intrinsicWidth || !intrinsicHeight) return; // Fail-safe if intrinsic dimensions are unavailable
	
			// Calculate effective dimensions based on object-fit: contain
			const widthRatio = containerWidth / intrinsicWidth;
			const heightRatio = containerHeight / intrinsicHeight;
			const scale = Math.min(widthRatio, heightRatio); // Scale to fit within container
	
			const finalWidth = Math.round(intrinsicWidth * scale); // Final rendered width
			const finalHeight = Math.round(intrinsicHeight * scale); // Final rendered height
	
			// Set the video element's width and height attributes to match its rendered size
			video.style.width = `${finalWidth}px`;
			video.style.height = `${finalHeight}px`;
	
		});
	}

	setGalleryFigureWidthSafari(figure) {
		// if (!figure.dataset.isDiptych) return;
		if (figure.dataset.isDiptych !== "true") return;
	
		const media = figure.querySelector('img, video');
		if (!media) return;
	
		// const containerWidth = figure.clientWidth;
		const containerWidth = this.isMobile ? (window.innerWidth - 40)/2 : (window.innerWidth - 180)/2;
		// const containerHeight = figure.clientHeight;
		const containerHeight = this.isMobile ? (window.innerHeight - 100) : (window.innerHeight - 190);

		const intrinsicWidth = parseInt(media.getAttribute('width')); // Intrinsic width
		const intrinsicHeight = parseInt(media.getAttribute('height')); // Intrinsic height

		// console.log(containerWidth, containerHeight, intrinsicWidth, intrinsicHeight);


		if (!intrinsicWidth || !intrinsicHeight) return; // Fail-safe if intrinsic dimensions are unavailable

		// Calculate effective dimensions based on object-fit: contain
		const widthRatio = containerWidth / intrinsicWidth;
		const heightRatio = containerHeight / intrinsicHeight;
		const scale = Math.min(widthRatio, heightRatio); // Scale to fit within container

		const finalWidth = intrinsicWidth * scale; // Final rendered width
		figure.style.width = `${finalWidth}px`;

		// Check and adjust the next sibling figure if it also has data-is-diptych
		const nextFigure = figure.nextElementSibling;
		if (nextFigure) {
			const nextMedia = nextFigure.querySelector('img, video');
			if (nextMedia) {
				const nextIntrinsicWidth = parseInt(nextMedia.getAttribute('width'));
				const nextIntrinsicHeight = parseInt(nextMedia.getAttribute('height'));

				const nextWidthRatio = containerWidth / nextIntrinsicWidth;
				const nextHeightRatio = containerHeight / nextIntrinsicHeight;
				const nextScale = Math.min(nextWidthRatio, nextHeightRatio);

				const nextFinalWidth = nextIntrinsicWidth * nextScale;
				nextFigure.style.width = `${nextFinalWidth}px`;
			}
		}
	}

}