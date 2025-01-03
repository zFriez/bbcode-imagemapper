/** @type {HTMLCanvasElement} */
let startPosition
let userRectanglePos = {x: 0, y: 0, w: 0, h: 0, scaled: {}}

let moreUserInputState = false

let idCounter = 0
let rectanglesOnScreen = 0
let allRectangles = []

function createRect(x,y,w,h,scaled) {
    if (w == 0) return false

    allRectangles.push(
        {
            id: "rect" + idCounter++, 
            x: x, 
            y: y, 
            w: w, 
            h: h,
            scaled: scaled,
            userInput: 
            {
                title: "",
                redirectLink: ""
            },
        }
    )
    moreDataInput(scaled, allRectangles[allRectangles.length - 1])
    return true
}

function moreDataInput(scaled, rectangleData) {
    moreUserInputState = true
    rectangleData.scaled = scaled
    confirmAreaButton.style.display = "none"
    linkAreaButton.style.display = "none"

    let title = document.createElement("input")
    title.id = "title-input"
    title.type = "text"
    title.placeholder = "insert title"
    title.style.display = "block"
    mainContent.appendChild(title)
    
    let redirectLink = document.createElement("input")
    redirectLink.id = "redirect-url-input"
    redirectLink.type = "url"
    redirectLink.placeholder = "insert redirect link"
    redirectLink.style.display = "block"
    mainContent.appendChild(redirectLink)
    
    let confirmDataButton = document.createElement("button")
    confirmDataButton.id = "confirm-data-button"
    confirmDataButton.textContent = "confirm"
    confirmDataButton.style.marginRight = "0.50rem"
    mainContent.appendChild(confirmDataButton)

    redirectLink.after(displayMessage)
    
    confirmDataButton.addEventListener("click", () => {
        rectangleData.userInput.title = title.value
        rectangleData.userInput.redirectLink = redirectLink.value

        if (redirectLink.checkValidity() == false) {
            displayMessage.style.animation = "fade-in 0.5s forwards"
            displayMessage.style.display = "block"
            displayMessage.textContent = "Invalid URL."
            setTimeout(() => {displayMessage.style.animation = "fade-out 0.5s forwards"}, 2000)
            setTimeout(() => {displayMessage.style.display = "none"}, 2500)
            return
        }

        title.remove() 
        redirectLink.remove()
        confirmDataButton.remove()
        moreUserInputState = false
        
        confirmAreaButton.style.display = "inline-block"
        linkAreaButton.disabled = false
        linkAreaButton.style.display = "inline-block"

        createRectElement(allRectangles[allRectangles.length - 1])
    })
}

function createRectElement(rect) {
    ctxUserInput.clearRect(0, 0, canvasUserInput.width, canvasUserInput.height)
    
    let rectElement = document.createElement("div")
    rectElement.style.position = "absolute"
    rectElement.style.left = `calc(${rect.scaled.x}% - 4px)`
    rectElement.style.top = `calc(${rect.scaled.y}% - 4px)`
    rectElement.style.width = `calc(${rect.scaled.w}% + 8px)`
    rectElement.style.height = `calc(${rect.scaled.h}% + 8px)`
    rectElement.id = rect.id

    if (rect.userInput.title !== "") {
        let titleRect = document.createElement("span")
        titleRect.innerText = rect.userInput.title
        rectElement.appendChild(titleRect)
    }

    if (rect.userInput.redirectLink == "") {
        rect.userInput.redirectLink = "#"
    } 
    
    rectangleContainer.appendChild(rectElement)
    addRectInteraction(rectElement)
}

function addRectInteraction(rectElement) {
    rectangleContainer.style.zIndex = 10

    rectElement.addEventListener("pointerdown", e => {
        if (!moreUserInputState) {
            rightButton = (e.buttons & 2) >> 1 === 1
            if (!rightButton) return
            rectElement.remove()
            
            let rectIndex = allRectangles.findIndex(item => rectElement.id == item.id)
            allRectangles.splice(rectIndex, 1)
            
            if (rectanglesOnScreen == 1) {
                rectanglesOnScreen -= 1
                confirmAreaButton.style.display = "none"
            } else {
                rectanglesOnScreen -= 1
            }
        }
    })
}

function canvasInteraction(canvas) {
    canvas.addEventListener("mousedown", event => {
        if (linkAreaState) {
            startPosition = {x: event.offsetX, y: event.offsetY}
            holdClickState = true
            update(event)
        }
    })
    
    canvas.addEventListener("mousemove", event => {
        if (holdClickState) update(event)
    })
    
    canvas.addEventListener("mouseup", event => {
        if (startPosition.x == event.offsetX || startPosition.y == event.offsetY) {
            linkAreaState = false
            holdClickState = false
            linkAreaButton.disabled = false
        }
        
        if (linkAreaState) {
            if (createRect(userRectanglePos.x, userRectanglePos.y, userRectanglePos.w, userRectanglePos.h, userRectanglePos.scaled)) {
                linkAreaState = false
                holdClickState = false

                rectanglesOnScreen += 1
            } else {
                holdClickState = false
                linkAreaState = false
            }
        }
    })
}

function update(event) {
    userRectanglePos.x = startPosition.x
    userRectanglePos.y = startPosition.y
    userRectanglePos.w = event.offsetX - startPosition.x
    userRectanglePos.h = event.offsetY - startPosition.y

    userRectanglePos.scaled = convertionScale(userRectanglePos.x, userRectanglePos.y, userRectanglePos.w, userRectanglePos.h)
    animate(ctxUserInput)
}

function animate(ctx) {
    ctx.lineWidth = 3
    ctx.strokeStyle = "rgb(0,0,255)"
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
    ctx.strokeRect(
        userRectanglePos.scaled.x / 100 * ctx.canvas.width,
        userRectanglePos.scaled.y / 100 * ctx.canvas.height, 
        userRectanglePos.scaled.w / 100 * ctx.canvas.width,
        userRectanglePos.scaled.h / 100 * ctx.canvas.height
    )
    ctx.clearRect(userRectanglePos.x, userRectanglePos.y, userRectanglePos.w, userRectanglePos.h)
}
