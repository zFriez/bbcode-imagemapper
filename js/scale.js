function convertionScale(x,y,w,h) {
    x = Math.min(x,x+w)
    y = Math.min(y,y+h)
    w = Math.abs(w)
    h = Math.abs(h)

    let coordsToScale = [x,y,w,h]
    let size = { maxWidth: canvasUserInput.width, maxHeight: canvasUserInput.height }
    let result = { x: 0, y: 0, w: 0, h: 0 }
   
    let xAux = (coordsToScale[0] * 100) / size.maxWidth
    result.x = Number(xAux.toFixed(2))

    let yAux = (coordsToScale[1] * 100) / size.maxHeight
    result.y = Number(yAux.toFixed(2))

    let wAux = (coordsToScale[2] * 100) / size.maxWidth
    result.w = Number(wAux.toFixed(2))

    let hAux = (coordsToScale[3] * 100) / size.maxHeight
    result.h = Number(hAux.toFixed(2))

    return result
}
