class Overworld {
    constructor(config) {
        this.element = config.element;
        this.canvas = this.element.querySelector(".game-canvas");
        this.ctx = this.canvas.getContext("2d");
        this.map = null;
    }

    startGameLoop() {
        const step = () => {

            // Clear Canvas
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

            // Establish Camera View
            const cameraPerson = this.map.gameObjects.hero;

            // Update all objects
            Object.values(this.map.gameObjects).forEach(object => {
                object.update({
                    arrow: this.directionInput.direction,
                    map: this.map,
                });
            })

            // Draw Lower Layer
            this.map.drawLowerImage(this.ctx, cameraPerson);

            // Draw Game Objects
            Object.values(this.map.gameObjects).sort((a,b) => {
                return a.y - b.y;
            }).forEach(object => {
                object.sprite.draw(this.ctx, cameraPerson);
            })

            // Draw Upper Layer
            this.map.drawUpperImage(this.ctx, cameraPerson);

            if(!this.map.isPaused){
                requestAnimationFrame(() => {
                    step();
                }) 
            }
        }
        step();
    }

    bindActionInput() {
        new KeyPressListener("Enter", () => {
            // Is there a person here to talk to?
            this.map.checkForActionCutscene()
        })
        new KeyPressListener("Escape", () => {
            if(!this.map.isCutscenePlaying) {
                this.map.startCutscene([
                    {type: "pause"}
                ])
            }
        })
    }

    bindHeroPositionCheck() {
        document.addEventListener("PersonWalkingComplete", e => {
            if ( e.detail.whoId === "hero") {
                this.map.checkForFootstepCutscene()
            }
        }) 
    }

    startMap(mapConfig, heroInitialState=null){
        this.map = new OverworldMap(mapConfig);
        this.map.overworld = this;
        this.map.mountObjects();

        if (heroInitialState) {
            const {hero} = this.map.gameObjects;
            this.map.removeWall(hero.x, hero.y);
            hero.x = heroInitialState.x;
            hero.y = heroInitialState.y;
            hero.direction = heroInitialState.direction;
            this.map.addWall(hero.x, hero.y);
        }

        this.progress.mapId = mapConfig.id;
        this.progress.startingHeroX = this.map.gameObjects.hero.x;
        this.progress.startingHeroY = this.map.gameObjects.hero.y;
        this.progress.startingHeroDirection = this.map.gameObjects.hero.direction;

    }

    async init() {

        const container = document.querySelector(".game-container");

        /// Create new progress tracker
        this.progress = new Progress();

        // Show the Title Screen
        this.titleScreen = new TitleScreen({
            progress: this.progress
        })
        const useSaveFile = await this.titleScreen.init(container);

        //Check for save file data
        let initialHeroState = null;
        if (useSaveFile) {
            this.progress.load();
            initialHeroState = {
                x: this.progress.startingHeroX,
                y: this.progress.startingHeroY,
                direction: this.progress.startingHeroDirection,
            }
        }

        // Load the HUD
        this.hud = new Hud();
        this.hud.init(container);

        //Start the initial map
        this.startMap(window.OverworldMaps[this.progress.mapId], initialHeroState );

        // Create controls
        this.bindActionInput();
        this.bindHeroPositionCheck();

        this.directionInput = new DirectionInput();
        this.directionInput.init();

        //Start the actual game!
        this.startGameLoop();

        // this.map.startCutscene([  
        //     { type: "textMessage", text: "Welcome Adventurer!" },
        //     { type: "textMessage", text: "You're about to venture out into the wasteland." },
        //     { type: "textMessage", text: "It's a harsh and unforgiving environment!" },
        //     { type: "textMessage", text: "No-one would blame you if you quit NOW!" },
        // ])


    }
}