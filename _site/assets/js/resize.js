function addShrinkListener(divElement) {
    console.log("Adding listener")

    let parent = divElement.parentElement;
    let children = divElement.childNodes;

    function shrinkToChildren() {

        let availableWidth = parent.offsetWidth;
        var runningWidth = 0;
        var preferredWidth = 0;
        var minWidth = 0;
        
        for (var i = 0; i < children.length; i++) {
            runningWidth += children[i].offsetWidth+20;
            minWidth = Math.max(minWidth, children[i].offsetWidth+20);
            if (runningWidth <= availableWidth) {
                preferredWidth = Math.max(preferredWidth, runningWidth);
            } else {
                runningWidth = 0;
            }
        }

        divElement.style.width = preferredWidth+"px";

        console.log(divElement.style.width);
    }

    // shrinkToChildren();

    children[0].onresize = shrinkToChildren;
}