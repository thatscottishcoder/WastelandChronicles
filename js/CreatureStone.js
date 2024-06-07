    class CreatureStone extends GameObject {
        constructor(config) {
            super(config);
            this.sprite = new Sprite({
                gameObject: this,
                src: "/WastelandChronicles/images/characters/creature-stone.png",
                animations: {
                    "used-down": [ [0,0] ],
                    "unused-down": [ [1,0] ],
                },
                currentAnimation: "used-down"
            });
            this.storyFlag = config.storyFlag;
            this.creatures = config.creatures;

            this.talking = [
                {
                    required: [this.storyFlag],
                    events: [
                        { type: "textMessage", text: "Don't pick at it, we don't know where you've been!!"},
                    ]
                },
                {
                    events: [
                        { type: "textMessage", text: "Approach the 'Creature Stone' and grant life..."},
                        { type: "craftingMenu", creatures: this.creatures },
                        { type: "addStoryFlag", flag: this.storyFlag},
                    ]    
                }
            ]
        }

        update() {
            this.sprite.currentAnimation = playerState.storyFlags[this.storyFlag]
            ? "used-down"
            : "unused-down"
        }
    }