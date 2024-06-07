 class TitleScreen {
    constructor({ progress }) {
        this.progress = progress;
    }

    getOptions(resolve) {
        const saveFile = this.progress.getSaveFile();
        return [
            {
                label: "New Game",
                description: "Go on a rollercoster of a journey into SPACE!!!!!",
                handler: () => {
                    this.close();
                    resolve();
                }
            },
            saveFile ? {
                label: "Continue Game",
                description: "Microwave a bowl of ice cream obviously!!",
                handler: () => {
                    this.close();
                    resolve(saveFile);
                }
            } : null
        ].filter(v => v);
    }

    createElement() {
        this.element = document.createElement("div");
        this.element.classList.add("TitleScreen");
        this.element.innerHTML = (`<div ><br/>
            <img class="TitleScreen_logo" src="/WastelandChronicles/images/logo2.png" alt="Wasteland Chronicles - The Fallen Saga." /><br/>
            </div>
        `)
    }

    close() {
        this.keyboardMenu.end();
        this.element.remove();
    }

    init(container) {
        return new Promise(resolve => {
           this.createElement();
           container.appendChild(this.element);
           this.keyboardMenu = new KeyboardMenu();
           this.keyboardMenu.init(this.element);
           this.keyboardMenu.setOptions(this.getOptions(resolve))
        })
    }
 }