export function onReady(callback) {
	console.log('onReady set');
	if (document.readyState === 'loaded' || document.readyState === 'complete'){
		console.log('Loaded already');
		callback();
	} else {
		document.addEventListener('readystatechange', event => { 
			if (event.target.readyState === 'complete') {
				console.log('Loaded after wait');
				callback();
			}
		});
	}
}


export function generateKey(pre){
	return `${ pre }_${ new Date().getTime() }`;
}

export function scrollTop(element, destination, duration = 200, easing = 'easeInOutCubic', callback){
	let easings = {
		linear(t) {
		  return t;
		},
		easeInQuad(t) {
		  return t * t;
		},
		easeOutQuad(t) {
		  return t * (2 - t);
		},
		easeInOutQuad(t) {
		  return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
		},
		easeInCubic(t) {
		  return t * t * t;
		},
		easeOutCubic(t) {
		  return (--t) * t * t + 1;
		},
		easeInOutCubic(t) {
		  return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
		},
		easeInQuart(t) {
		  return t * t * t * t;
		},
		easeOutQuart(t) {
		  return 1 - (--t) * t * t * t;
		},
		easeInOutQuart(t) {
		  return t < 0.5 ? 8 * t * t * t * t : 1 - 8 * (--t) * t * t * t;
		},
		easeInQuint(t) {
		  return t * t * t * t * t;
		},
		easeOutQuint(t) {
		  return 1 + (--t) * t * t * t * t;
		},
		easeInOutQuint(t) {
		  return t < 0.5 ? 16 * t * t * t * t * t : 1 + 16 * (--t) * t * t * t * t;
		}
	};

	let start = element.scrollTop;
	let startTime = Date.now();

	function scroll() {
		let now = Date.now();
		let time = Math.min(1, ((now - startTime) / duration));
		let timeFunction = easings[easing](time);
		element.scrollTop = (timeFunction * (destination - start)) + start;
	
		if (element.scrollTop === destination) {
		  callback;
		  return;
		}
		requestAnimationFrame(scroll);
	}
	
	scroll();
}

export function getWindowSize() {
	// Initialize state with undefined width/height so server and client renders match
	let windowSize = {
		width: undefined,
		height: undefined,
	};
  

	// only execute all the code below in client side
	if (typeof window !== 'undefined') {

		// Handler to call on window resize
		function handleResize() {
			// Set window width/height to state
			windowSize = {
				width: window.innerWidth,
				height: window.innerHeight,
			};
		}

		// Add event listener
		window.addEventListener("resize", handleResize);

		// Call handler right away so state gets updated with initial window size
		handleResize();

	}

	return windowSize;
}

export function shuffle(array){
	let currentIndex = array.length, temporaryValue, randomIndex;
	while (0 !== currentIndex) {
		randomIndex = Math.floor(Math.random() * currentIndex);
		currentIndex -= 1;
		temporaryValue = array[currentIndex];
		array[currentIndex] = array[randomIndex];
		array[randomIndex] = temporaryValue;
	}
	return array;
}

export function randomNumber(min,max){
	let rdmArray = [];
	for (i = 0; i < 1000; i++) { 
		rdmArray.push(Math.floor(Math.random()*(max-min+1)+min));
	}
	shuffle(rdmArray);
	return rdmArray[0];
}

export function splitCharacters(elements){
	elements.forEach(function (element, index) {
		let html = element.innerHTML;
		return element.innerHTML.replace(/\S/g, '<span class="split-character hidden-character">$&</span>');
	});
}