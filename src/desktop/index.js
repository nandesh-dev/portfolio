const scrollOuterElement = document.getElementsByClassName("scroll-outer")[0]
const totalHeight = (scrollOuterElement.children.length - 1) * window.innerHeight

const elements = {
    home: {
        backgroundText: document.getElementsByClassName("home-background-text")[0],
        welcomeText: document.getElementsByClassName("home-welcome-text")[0]
    },
    about: {
        title: document.getElementsByClassName("about-title")[0],
        para1: document.getElementsByClassName("about-para-1")[0],
        para2: document.getElementsByClassName("about-para-2")[0],
    },
    language: {
        backgroundText1: document.getElementsByClassName("language-bg-text-1")[0],
        backgroundText2: document.getElementsByClassName("language-bg-text-2")[0],
        boxes: document.getElementsByClassName("language-box-inner")
    },
    projects:{
        title: document.getElementsByClassName("project-title-text")[0],
        strudygo:{
            timelineOuter: document.getElementsByClassName("strudygo-timeline-outer")[0],
            timelineCircle: document.getElementsByClassName("strudygo-timeline-circle-outer")[0],
            timelineLine: document.getElementsByClassName("strudygo-timeline-line")[0],
            infoTitle: document.getElementsByClassName("strudygo-info-title")[0],
            infoDescription: document.getElementsByClassName("strudygo-info-description")[0],
            stack: document.getElementsByClassName("strudygo-stack-outer")[0],
        },
        portfolio:{
            timelineOuter: document.getElementsByClassName("portfolio-timeline-outer")[0],
            timelineCircle: document.getElementsByClassName("portfolio-timeline-circle-outer")[0],
            timelineLine: document.getElementsByClassName("portfolio-timeline-line")[0],
            infoTitle: document.getElementsByClassName("portfolio-info-title")[0],
            infoDescription: document.getElementsByClassName("portfolio-info-description")[0],
            stack: document.getElementsByClassName("portfolio-stack-outer")[0],
        }
    },
    contact: {
        container:  document.getElementsByClassName("contact-inner")[0],
        texts: document.getElementsByClassName("contact-info-text")
    }
}

let scroll = {
    animated: 0,
    actual: 0
}

scrollOuterElement.addEventListener("scroll", ()=>{
    scroll.actual = scrollOuterElement.scrollTop
})


function loop(){
    requestAnimationFrame(loop)
    scroll.animated += Math.round((scroll.actual - scroll.animated)) / 10

    animate()
}

loop()

function animate(){
    const percentage = (scroll.animated %window.innerHeight) / window.innerHeight
    const inversePercentage = 1 - percentage
    const page = Math.floor(scroll.animated / window.innerHeight)

    switch(page){
        case 0:
            elements.home.backgroundText.style = `transform: translate(+${percentage * 150}vw,0)`
            elements.home.welcomeText.style = `transform: translate(-${percentage * 100}vw,0)`
            elements.about.title.style = `transform: rotate(-90deg) translate(-${inversePercentage * 150}%,0)`
            elements.about.para1.style = `transform: translate(${inversePercentage * 180}%,0)`
            elements.about.para2.style = `transform: translate(${inversePercentage * 220}%,0)`

            elements.language.backgroundText1.style = `transform: translate(${inversePercentage * 200}%,0)`
            elements.language.backgroundText2.style = `transform: translate(-${inversePercentage * 200}%,0)`
            elements.language.boxes[0].style = `opacity: 0`
            elements.language.boxes[1].style = `opacity: 0`
            elements.language.boxes[2].style = `opacity: 0`
            elements.language.boxes[3].style = `opacity: 0`
            elements.language.boxes[4].style = `opacity: 0`
            elements.language.boxes[5].style = `opacity: 0`
            break
        case 1:
            elements.home.backgroundText.style = `transform: translate(150vw,0)`
            elements.home.welcomeText.style = `transform: translate(-100vw,0)`

            elements.about.title.style = `transform: rotate(-90deg) translate(${percentage * 200}%,0)`
            elements.about.para1.style = `transform: translate(${percentage * 180}%,0)`
            elements.about.para2.style = `transform: translate(${percentage * 220}%,0)`

            elements.language.backgroundText1.style = `transform: translate(${inversePercentage * 200}%,0)`
            elements.language.backgroundText2.style = `transform: translate(-${inversePercentage * 200}%,0)`
            elements.language.boxes[0].style = `opacity: ${percentage/0.5}`
            elements.language.boxes[1].style = `opacity: ${percentage/0.6}`
            elements.language.boxes[2].style = `opacity: ${percentage/0.7}`
            elements.language.boxes[3].style = `opacity: ${percentage/0.8}`
            elements.language.boxes[4].style = `opacity: ${percentage/0.9}`
            elements.language.boxes[5].style = `opacity: ${percentage/1}`

            elements.projects.title.style = `transform: rotate(-90deg) translate(-200%,0)`
            elements.projects.strudygo.timelineCircle.style = `background-image: conic-gradient(var(--gray-text-color) 0, 0); opacity: -0.1`
            elements.projects.strudygo.timelineLine.style = `background-image: linear-gradient(var(--gray-text-color) ${(-0.5) * 200}%, transparent ${(-0.5) * 200}%);  opacity: ${-0.1}`
            elements.projects.strudygo.infoTitle.style = `transform: translate(500%)`
            elements.projects.strudygo.infoDescription.style = `transform: translate(600%)`
            elements.projects.strudygo.stack.style = `transform: translate(700%)`
            break
        case 2:
            elements.about.title.style = `transform: rotate(-90deg) translate(200%,0)`
            elements.about.para1.style = `transform: translate(180%,0)`
            elements.about.para2.style = `transform: translate(220%,0)`

            elements.language.backgroundText1.style = `transform: translate(-${percentage * 200}%,0)`
            elements.language.backgroundText2.style = `transform: translate(${percentage * 200}%,0)`
            elements.language.boxes[0].style = `opacity: ${inversePercentage/0.5}`
            elements.language.boxes[1].style = `opacity: ${inversePercentage/0.6}`
            elements.language.boxes[2].style = `opacity: ${inversePercentage/0.7}`
            elements.language.boxes[3].style = `opacity: ${inversePercentage/0.8}`
            elements.language.boxes[4].style = `opacity: ${inversePercentage/0.9}`
            elements.language.boxes[5].style = `opacity: ${inversePercentage/1}`

            elements.projects.title.style = `transform: rotate(-90deg) translate(-${inversePercentage * 200}%,0)`
            elements.projects.strudygo.timelineCircle.style = `background-image: conic-gradient(var(--gray-text-color) ${percentage * 100}%, transparent ${percentage * 100}%); opacity: ${percentage*2 - 0.1}`
            elements.projects.strudygo.timelineLine.style = `background-image: linear-gradient(var(--gray-text-color) ${(percentage - 0.5) * 200}%, transparent ${(percentage - 0.5) * 200}%);  opacity: ${percentage*2 - 0.1}`
            elements.projects.strudygo.infoTitle.style = `transform: translate(${inversePercentage * 500}%)`
            elements.projects.strudygo.infoDescription.style = `transform: translate(${inversePercentage * 600}%)`
            elements.projects.strudygo.stack.style = `transform: translate(${inversePercentage * 700}%)`
            
            elements.projects.strudygo.timelineOuter.style = `transform: translate(0,0)`
            elements.projects.strudygo.infoTitle.style = `transform: translate(0)`
            elements.projects.strudygo.infoDescription.style = `transform: translate(0)`
            elements.projects.strudygo.stack.style = `transform: translate(0)`
            elements.projects.portfolio.timelineOuter.style = `transform: translate(0,100vh)`
            elements.projects.portfolio.infoTitle.style = `transform: translate(0,500%)`
            elements.projects.portfolio.infoDescription.style = `transform: translate(0,600%)`
            elements.projects.portfolio.stack.style = `transform: translate(0,700%)`
            break
        case 3:
            elements.language.backgroundText1.style = `transform: translate(-200%,0)`
            elements.language.backgroundText2.style = `transform: translate(200%,0)`
            elements.language.boxes[0].style = `opacity: 0`
            elements.language.boxes[1].style = `opacity: 0`
            elements.language.boxes[2].style = `opacity: 0`
            elements.language.boxes[3].style = `opacity: 0`
            elements.language.boxes[4].style = `opacity: 0`
            elements.language.boxes[5].style = `opacity: 0`
            
            elements.projects.strudygo.timelineOuter.style = `transform: translate(0,-${percentage * 100}vh)`
            elements.projects.strudygo.infoTitle.style = `transform: translate(${percentage * 500}%)`
            elements.projects.strudygo.infoDescription.style = `transform: translate(${percentage * 600}%)`
            elements.projects.strudygo.stack.style = `transform: translate(${percentage * 700}%)`
            elements.projects.portfolio.timelineOuter.style = `transform: translate(0,${inversePercentage * 100}vh)`
            elements.projects.portfolio.infoTitle.style = `transform: translate(0,${inversePercentage * 500}%)`
            elements.projects.portfolio.infoDescription.style = `transform: translate(0,${inversePercentage * 600}%)`
            elements.projects.portfolio.stack.style = `transform: translate(0,${inversePercentage * 700}%)`

            elements.contact.container.style = `opacity: 0`
            break
        case 4:
            elements.projects.strudygo.timelineOuter.style = `transform: translate(0,-100vh)`
            elements.projects.strudygo.infoTitle.style = `transform: translate(500%)`
            elements.projects.strudygo.infoDescription.style = `transform: translate(600%)`
            elements.projects.strudygo.stack.style = `transform: translate(700%)`
            elements.projects.portfolio.timelineOuter.style = `transform: translate(0,0vh)`
            elements.projects.portfolio.infoTitle.style = `transform: translate(0,0%)`
            elements.projects.portfolio.infoDescription.style = `transform: translate(0,0%)`
            elements.projects.portfolio.stack.style = `transform: translate(0,0%)`

            elements.projects.portfolio.infoTitle.style = `transform: translate(${percentage * 500}%)`
            elements.projects.portfolio.infoDescription.style = `transform: translate(${percentage * 600}%)`
            elements.projects.portfolio.stack.style = `transform: translate(${percentage * 700}%)`
            elements.projects.portfolio.timelineCircle.style = `background-image: linear-gradient(var(--gray-text-color) ${inversePercentage * 200 - 100}%, transparent ${inversePercentage * 200 - 100}%); opacity: ${inversePercentage*2 - 0.1}`
            elements.projects.portfolio.timelineLine.style = `background-image: linear-gradient(var(--gray-text-color) ${inversePercentage * 200}%, transparent ${inversePercentage * 200}%);; opacity: ${inversePercentage*2}`
            elements.projects.title.style = `transform: rotate(-90deg) translate(${percentage * 200}%,0)`

            elements.contact.container.style = `opacity: ${percentage}`
    }
}