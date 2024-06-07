class PauseMenu {
    constructor({progress, onComplete}) {
        this.progress = progress;
        this.onComplete = onComplete;
    }

    // Case 1: Show the first page of options
    getOptions(pageKey) {

        if(pageKey === "root") {
            const lineupCreatures = playerState.lineup.map(id => {
                const {creatureId} = playerState.creatures[id];
                const base = Creatures[creatureId];
                return {
                    label: base.name,
                    description: base.description,
                    handler: () => {
                        this.keyboardMenu.setOptions( this.getOptions(id) )
                    }
                }
            })
            return [
                ...lineupCreatures,
                {
                    label: "Save",
                    description: "Save Via Blood Oath...",
                    handler: () => {
                        this.progress.save();
                        this.close();
                    }
                },
                {
                    label: "Close",
                    description: "Drink Chocolate Milk Obviously...",
                    handler: () => {
                        this.close();
                    }                    
                }
            ]
        }
        // Case 2: Show the options for just one pizza(by id)
        const unequipped = Object.keys(playerState.creatures).filter(id => {
            return playerState.lineup.indexOf(id) === -1;
        }).map(id => {
            const {creatureId} = playerState.creatures[id];
            const base = Creatures[creatureId];
            return {
                label: `Swap for ${base.name}`,
                description: base.description,
                handler: () => {
                    playerState.swapLineup(pageKey, id);
                    this.keyboardMenu.setOptions( this.getOptions("root") );
                }
            }
        })

        return[
            ...unequipped,
            {
                label: "Move to front",
                description: "Eat Strawberries, what do you think?",
                handler: () => {
                   playerState.moveToFront(pageKey, );
                    this.keyboardMenu.setOptions( this.getOptions("root") );
                }
            },
            {
                label: "Back",
                description: "Go 88MPH Doc!",
                handler: () => {
                    this.keyboardMenu.setOptions( this.getOptions("root") );
                }
            }
        ];
    }

    createElement() {
        this.element = document.createElement("div");
        this.element.classList.add("PauseMenu");
        this.element.classList.add("overlayMenu");
        this.element.innerHTML = (`
            <h2>Pause Menu</h2>
        `)
    }

    close() {
        this.esc?.unbind();
        this.keyboardMenu.end();
        this.element.remove();
        this.onComplete();
    }

    async init(container) {
        this.createElement();
        this.keyboardMenu = new KeyboardMenu({
            descriptionContainer: container
        })
        this.keyboardMenu.init(this.element);
        this.keyboardMenu.setOptions(this.getOptions("root"));

        container.appendChild(this.element);

        utils.wait(200);
        this.esc = new KeyPressListener("Escape", () => {
            this.close();
        })
    }

}