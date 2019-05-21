codeBlocks = document.querySelectorAll("pre.highlight");
console.log("Found " + codeBlocks.length + " code blocks to add clipboard button to.");

for (var i = 0; i < codeBlocks.length; i++) {
  var preElement = codeBlocks[i];
  var divElement = preElement.parentNode;

  divElement.setAttribute('style', 'position: relative;');
  preElement.setAttribute('id', 'pre-' + i);
  copyButton = document.createElement('button');
  copyButton.classList.add('btn');
  copyButton.classList.add('clip-button');
  copyButton.setAttribute('data-clipboard-target', '#pre-' + i);
  copyButton.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet" class="dicon   " 
    viewBox="0 0 24 24">
      <g>
        <path fill="none" d="M0 0h24v24H0V0z"></path>
        <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"></path>
      </g>
    </svg>
  `;
  new ClipboardJS('.btn');
  divElement.appendChild(copyButton);
}