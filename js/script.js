const mainContent = document.querySelector(".main-content")
const imageUrlButton = document.querySelector("#image-url-button")
const imageUrlInput = document.querySelector("#image-url")

const displayMessage = document.querySelector("#display-message")
const bbcodeContent = document.querySelector("#bbcode-container")

const helpButton = document.querySelector("#help-button")
const helpDialog = document.querySelector("#help-popup")
const closeDialog = document.querySelector("#help-popup > img")

let linkAreaState = false
let holdClickState = false
let linkAreaButton, confirmAreaButton

let canvasContainer
let rectangleContainer
let canvasImage, ctxImage
let canvasUserInput, ctxUserInput

imageUrlButton.addEventListener("click", () => {
    if (imageUrlInput.value == "") return

    if (imageUrlInput.checkValidity() == false) {
        displayMessage.style.animation = "fade-in 0.5s forwards"
        displayMessage.style.display = "block"
        displayMessage.textContent = "Invalid URL."
        setTimeout(() => {displayMessage.style.animation = "fade-out 0.5s forwards"}, 2000)
        setTimeout(() => {displayMessage.style.display = "none"}, 2500)
        return
    }

    if (checkIfStaticUrl(imageUrlInput.value) == false) {
        displayMessage.style.animation = "fade-in 0.5s forwards"
        displayMessage.style.display = "block"
        displayMessage.textContent = "URL is not static, try a URL that ends with an image extension."

        setTimeout(() => {displayMessage.style.animation = "fade-out 0.5s forwards"}, 2000)
        setTimeout(() => {
            displayMessage.style.display = "none"
            imageUrlInput.style.display = "inline-block"
            imageUrlButton.style.display = "inline-block"
        }, 2500)
    } else {
        imageUrlButton.style.display = "none"
        imageUrlInput.style.display = "none"
    
        createCanvas()
    }
})

helpButton.addEventListener("click", () => {
    helpDialog.showModal()
})

closeDialog.addEventListener("click", () => {
    helpDialog.close()
})

async function createCanvas() {
    const userImage = await loadUserImage(imageUrlInput.value)

    while (userImage.width >= 1280 || userImage.height >= 720) {
        userImage.width *= 0.9
        userImage.height *= 0.9
    }

    canvasContainer = document.createElement("div")
    canvasContainer.id = "canvas-container"
    mainContent.appendChild(canvasContainer)
    canvasContainer.after(displayMessage)
    
    canvasImage = document.createElement("canvas")
    ctxImage = canvasImage.getContext("2d")
    
    canvasImage.id = "main-canvas"
    canvasImage.width = userImage.width
    canvasImage.height = userImage.height
    canvasContainer.appendChild(canvasImage)
    
    canvasUserInput = document.createElement("canvas")
    ctxUserInput = canvasUserInput.getContext("2d")
    
    canvasUserInput.id = "interaction-canvas"
    canvasUserInput.width = canvasImage.width
    canvasUserInput.height = canvasImage.height
    canvasContainer.appendChild(canvasUserInput)
    
    rectangleContainer = document.createElement("div")
    rectangleContainer.id = "rectangle-container"
    rectangleContainer.style.width = `${userImage.width}px`
    canvasContainer.appendChild(rectangleContainer)
    
    canvasUserInput.oncontextmenu = e => e.preventDefault()
    canvasImage.oncontextmenu = e => e.preventDefault()
    document.body.oncontextmenu = e => e.preventDefault()
    
    ctxImage.drawImage(userImage, 0, 0, userImage.width, userImage.height)

    canvasInteraction(canvasUserInput)
    linkAreaInteraction()
}

function linkAreaInteraction() {
    linkAreaButton = document.createElement("button")
    linkAreaButton.id = "create-link-button"
    linkAreaButton.textContent = "Create Selection"
    linkAreaButton.style.display = "inline-block"

    confirmAreaButton = document.createElement("button")
    confirmAreaButton.id = "confirm-area-button"
    confirmAreaButton.textContent = "Generate BBCode"
    confirmAreaButton.style.display = "none"

    mainContent.appendChild(linkAreaButton)
    mainContent.appendChild(confirmAreaButton)

    canvasContainer.after(linkAreaButton)
    linkAreaButton.after(confirmAreaButton)
    
    linkAreaButtonFunction()
}

function linkAreaButtonFunction() {
    linkAreaButton.addEventListener("click", () => {
        if (linkAreaState) {
            linkAreaState = false
        } else {
            linkAreaState = true
            linkAreaButton.disabled = true
            confirmAreaButton.style.display = "none"
            if (rectangleContainer.style.zIndex == "10") rectangleContainer.style.zIndex = "0"
        }
    })

    confirmAreaButton.addEventListener("click", () => {
        canvasContainer.remove()
        linkAreaButton.remove()
        confirmAreaButton.remove()
        helpButton.remove()

        bbcodeContent.style.display = "inline-block"

        let coords, input
        let results = []

        allRectangles.forEach(rect => {
            coords = `${rect.scaled.x} ${rect.scaled.y} ${rect.scaled.w} ${rect.scaled.h}`
            input = ` ${rect.userInput.redirectLink} ${rect.userInput.title}`
            results.push(coords + input)
        })
        
        bbcodeContent.innerHTML = 
        `
        [imagemap]<br>
        ${imageUrlInput.value}<br>
        ${results.join("<br>")}<br>
        [/imagemap]
        `

        bbcodeInteractions()
    })
}

function bbcodeInteractions() {
    let svgCopy = document.createElement("img")
    svgCopy.src = "./assets/copy.svg"
    bbcodeContent.appendChild(svgCopy)

    svgCopy.addEventListener("click", () => {
        navigator.clipboard.writeText(bbcodeContent.innerText)
        displayMessage.style.animation = "fade-in 0.5s forwards"
        displayMessage.style.display = "block"
        displayMessage.style.marginTop = "1rem"
        displayMessage.textContent = "Copied to clipboard."
        setTimeout(() => {displayMessage.style.animation = "fade-out 0.5s forwards"}, 2000)
        setTimeout(() => {displayMessage.style.display = "none"}, 2500)
    })

    let reloadButton = document.createElement("button")
    reloadButton.textContent = "New Image"
    reloadButton.style.display = "block"
    reloadButton.style.marginTop = "1rem"

    mainContent.appendChild(reloadButton)
    reloadButton.addEventListener("click", () => location.reload())
}

function checkIfStaticUrl(src) {
    const imageRegex = /\.(jpg|jpeg|png|webp)$/i
    return imageRegex.test(src) && !src.includes('?')
}

async function loadUserImage(src) {

    return new Promise((res, rej) => {
        const image = new Image()
        image.addEventListener("load", () => res(image))
        
        image.addEventListener("error", () => {
            displayMessage.style.animation = "fade-in 0.5s forwards"
            displayMessage.style.display = "block"
            displayMessage.textContent = "Failed to read image. Please check if URL have an image."

            setTimeout(() => {displayMessage.style.animation = "fade-out 0.5s forwards"}, 2000)
            setTimeout(() => {
                displayMessage.style.display = "none"
                imageUrlInput.style.display = "inline-block"
                imageUrlButton.style.display = "inline-block"
            }, 2500)

            rej(new Error("Image failed to load."))
        })
        
        image.src = src
    })
}
