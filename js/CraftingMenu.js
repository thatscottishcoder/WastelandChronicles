class CraftingMenu {
    constructor({ creatures, onComplete}) {
        this.creatures = creatures;
        this.onComplete = onComplete;
    }

    getOptions() {
        return this.creatures.map(id => {
            const base = Creatures[id];
            return {
                label: base.name,
                description: base.description,
                handler: () => {
                    // Add Creature to PlayerState
                    playerState.addCreature(id);

                    this.close();
                }
            }
        })
    }

    createElement() {
        this.element = document.createElement("div");
        this.element.classList.add("CraftingMenu");
        this.element.classList.add("overlayMenu");
        this.element.innerHTML = (`
            <h2>Create a Creature:</h2>
        `)
    }

    close() {
        this.keyboardMenu.end();
        this.element.remove();
        this.onComplete();
    }

    init(container) {
        this.createElement();
        this.keyboardMenu = new KeyboardMenu({
            descriptionContainer: container
        })
        this.keyboardMenu.init(this.element)
        this.keyboardMenu.setOptions(this.getOptions())

        container.appendChild(this.element);
    }
}