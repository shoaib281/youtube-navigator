let isCtrlDown = false;
let path = window.location.pathname.split('/')[1];
let mode = false;


class channel {
	constructor () {
	       this.element = false;
	       this.waitForElm("tabsContent").then((elm) => {
		       this.element = elm;

		       for (let i=0; i < this.element.children.length; i++){
			       let temp = this.element.children[i].children
			       for (let j=0; j<temp.length;j++ ) {
				       let tem = temp[j];
				       if (tem);
					       if (tem.tagName == "DIV") {
						       let text = tem.innerText.replace(" ","");
						       if (text == "HOME") {
							       this.home = tem;
						       } else if (text == "ABOUT") {
							       this.about = tem;
						       } else if (text == "VIDEOS") {
							       this.videos = tem;
						       } else if (text == "CHANNELS") {
							       this.channels = tem;
						       } else if (text == "COMMUNITY") {
							       this.community = tem;
						       } else if (text == "PLAYLISTS") {
							       this.playlists = tem;
						       } else {
						       }
					       }
				       }
			       }
		       })

		}
	
	waitForElm(selector) {
	    return new Promise(resolve => {
		let temp = document.getElementById(selector)
		if (temp) {
		    if (temp.children){return resolve(temp)};
		}

		const observer = new MutationObserver(mutations => {
		    let temp = document.getElementById(selector);
   		    if (temp) {
			    if (temp.children) {return resolve(temp)};
		    }
		});

		observer.observe(document.body, {
		    childList: true,
		    subtree: true
		});
	    });
	}


	keypress(key) {
		if (key == "h") {
			this.home.click();
		} else if (key == "v") {
			this.videos.click();
		} else if (key == "p") {
			this.playlists.click();
		} else if (key == "m") {
			this.community.click();
		} else if (key == "c") {
			this.channels.click();
		} else if (key == "a") {
			this.about.click();
		}
	}
}

class search {
	constructor(){
		this.element = false;
		this.count = -1;
		this.previousHighlighted = false;
		this.bg = "LightGray";


		this.waitForElm('ytd-item-section-renderer').then((elm) => {
			let it = elm.children;
			for (let item in it) {

				if (it[item].id == "contents"){

					this.element = it[item];
					this.getAllVideos();
					break;
				}
			}
		});
	}

	getAllVideos() {
		this.videos = document.querySelectorAll("ytd-video-renderer, ytd-channel-renderer");
	}
		
	waitForElm(selector) {
	    return new Promise(resolve => {
		let temp = document.getElementsByTagName(selector);
		let tempo = this.checks(temp);

		if (tempo){
		    return resolve(tempo);
		}
		const observer = new MutationObserver(mutations => {
			tempo = this.checks(temp);
			if (tempo){
				resolve(tempo);
				observer.disconnect();
			}
		});

		observer.observe(document.body, {
		    childList: true,
		    subtree: true
		});
	    });
	}
	focus(){
		if (this.previousHighlighted) {this.previousHighlighted.removeAttribute("style");}
		this.previousHighlighted = this.videos[this.count]
		this.previousHighlighted.style.backgroundColor = this.bg;


		if (this.previousHighlighted.getBoundingClientRect().top < 0) {
			this.previousHighlighted.scrollIntoView();
			window.scrollBy(0,-70);
		}
		else if (this.previousHighlighted.getBoundingClientRect().bottom > window.innerHeight) {
			this.previousHighlighted.scrollIntoView({block: "end"});
			window.scrollBy(0, 10);
		}
	}

	checks(temp){
		if (temp) {
		    for (let item in temp) {
			    if (temp[item]){
				    if (temp[item].children){
					    if (temp[item].parentElement.parentElement.parentElement.parentElement.tagName == "YTD-TWO-COLUMN-SEARCH-RESULTS-RENDERER") {
						return temp[item];
					    }
					}
			    }
		    }
		}
		return false;
	}

	keypress(key){
		this.getAllVideos();
		if (key == "j"){
			if (this.count - 1 < this.videos.length) {
				this.count ++;
				this.focus();
			}
		}
		else if (key == "k"){
			if (this.count > 0) {
				this.count --;
				this.focus();
				}
			}
		else if (key == "enter"){
			let target = this.videos[this.count];
			if (target) {
				let link = target.querySelector("#main-link") ||  target.querySelector("#video-title");
				openLink(link);
			}
		}		
	}
}

class video {
	constructor(){
		this.link = false;	
		this.waitForElm('.yt-simple-endpoint.style-scope.ytd-video-owner-renderer').then((elm) => {
			this.link = elm.href;
		});
	}
		
	waitForElm(selector) {
	    return new Promise(resolve => {
		let elm = document.querySelector(selector);
		if (elm) {
		    if (elm.href) { 
		    	return resolve(elm);
		    }
		}

		const observer = new MutationObserver(mutations => {
			let elm = document.querySelector(selector);
		    if (elm) {
			    if (elm.href) {
				resolve(elm);
				observer.disconnect();
			    }
		    }
		});

		observer.observe(document.body, {
		    childList: true,
		    subtree: true
		});
	    });
	}

	keypress(key){
		if (key == "enter") {
			openLink(this.link);
		}
	}
}

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    // listen for messages sent from background.js
    if (request.message === 'hello!') {
	    updateMode();
      }
});

function openLink(link){
	if (!isCtrlDown) {
		window.location.href = link;
	} else {
		window.open(link, '_blank').focus();
	}
}

function updateMode(){
	path = window.location.pathname.split("/")[1];
	mode = null;
	if (path == "results") {
		mode = new search;
	}
	else if (path == "watch") {
		mode = new video;
	}
	else if (path == "c" || path == "user" || path == "channel") {
		mode = new channel
	}
}

//keyboard input

document.addEventListener('keydown', function(event) {
    if(event.keyCode == 74) {
	    mode.keypress("j");
    }
    else if(event.keyCode == 75) {
	mode.keypress("k");
    }
    else if (event.keyCode == 72){
	    mode.keypress("h");
    }
    else if (event.keyCode == 67){
	    mode.keypress("c");
    }
    else if (event.keyCode == 65) {
	    mode.keypress("a");
    }
    else if (event.keyCode == 77) {
	    mode.keypress("m");
    }
    else if (event.keyCode == 80) {
	    mode.keypress("p");
    }
    else if (event.keyCode == 86) {
	    mode.keypress("v");
    }
    else if(event.keyCode == 13) {
	    mode.keypress("enter");
    }
    else if(event.keyCode == 17) {
	    isCtrlDown = true;
    }
});

document.addEventListener('keyup', function (event) {
	if (event.keyCode == 17) {
		isCtrlDown = false;
	}
});

updateMode();
