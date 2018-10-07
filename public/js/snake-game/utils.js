
//Get Highest Z index
export const getNextHighestZIndex = myObj => {
    var highestIndex = 0,
        currentIndex = 0,
        ii;
    for (ii in myObj) {
        if (myObj[ii].elm.currentStyle) {
            currentIndex = parseFloat(myObj[ii].elm.style["z-index"], 10);
        } else if (window.getComputedStyle) {
            currentIndex = parseFloat(document.defaultView.getComputedStyle(myObj[ii].elm, null).getPropertyValue("z-index"), 10);
        }
        if (!isNaN(currentIndex) && currentIndex > highestIndex) {
            highestIndex = currentIndex;
        }
    }
    return (highestIndex + 1);
}

/**
* @method addEventListener
* @param {Object} obj The object to add an event listener to.
* @param {String} event The event to listen for.
* @param {Function} funct The function to execute when the event is triggered.
* @param {Boolean} evtCapturing True to do event capturing, false to do event bubbling.
*/
export const addEventListener = (obj, event, funct, evtCapturing) => {
    if (window.addEventListener) {
        return function (obj, event, funct, evtCapturing) {
            obj.addEventListener(event, funct, evtCapturing);
        };
    } else if (window.attachEvent) {
        return function (obj, event, funct) {
            obj.attachEvent("on" + event, funct);
        };
    }
};


/**
* @method removeEventListener
* @param {Object} obj The object to remove an event listener from.
* @param {String} event The event that was listened for.
* @param {Function} funct The function that was executed when the event is triggered.
* @param {Boolean} evtCapturing True if event capturing was done, false otherwise.
*/
export const removeEventListener = (obj, event, funct, evtCapturing) => {
    if (window.removeEventListener) {
        return function (obj, event, funct, evtCapturing) {
            obj.removeEventListener(event, funct, evtCapturing);
        };
    } else if (window.detachEvent) {
        return function (obj, event, funct) {
            obj.detachEvent("on" + event, funct);
        };
    }
};