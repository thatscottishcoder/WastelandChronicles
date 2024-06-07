    class OverworldMap {
        constructor(config) {
            this.overworld = null;
            this.gameObjects = config.gameObjects;
            this.cutsceneSpaces = config.cutsceneSpaces || {};
            this.walls = config.walls || {};

            this.lowerImage = new Image();
            this.lowerImage.src = config.lowerSrc;

            this.upperImage = new Image();
            this.upperImage.src = config.upperSrc;

            this.isCutscenePlaying = false;
            this.isPaused = false;
        }

        drawLowerImage(ctx, cameraPerson){
            ctx.drawImage(
                this.lowerImage, 
                utils.withGrid(10.5) - cameraPerson.x, 
                utils.withGrid(6) - cameraPerson.y
            )
        }

        drawUpperImage(ctx, cameraPerson){
            ctx.drawImage(
                this.upperImage,
                utils.withGrid(10.5) - cameraPerson.x, 
                utils.withGrid(6) - cameraPerson.y
            )
        }

        isSpaceTaken(currentX, currentY, direction) {
            const {x,y} = utils.nextPosition(currentX, currentY, direction);
            return this.walls[`${x},${y}`] || false;
        }

        mountObjects() {
            Object.keys(this.gameObjects).forEach(key => {
                let object = this.gameObjects[key];
                object.id = key;
                object.mount(this);
            })
        }

        async startCutscene(events) {
            this.isCutscenePlaying = true;

            for(let i=0; i<events.length; i++) {
                const eventHandler = new OverworldEvent({
                    event: events[i],
                    map: this, 
                })
                const result = await eventHandler.init();
                if (result === "LOST_BATTLE") {
                    break;
                } 
            }

            this.isCutscenePlaying = false;

            // Reset NPCs to do Idle behaviour
            Object.values(this.gameObjects).forEach(object => object.doBehaviorEvent(this));
        }

        checkForActionCutscene() {
            const hero = this.gameObjects["hero"];
            const nextCoords = utils.nextPosition(hero.x, hero.y, hero.direction);
            const match = Object.values(this.gameObjects).find(object => {
                return `${object.x},${object.y}` === `${nextCoords.x},${nextCoords.y}`
            });
            if (!this.isCutscenePlaying && match && match.talking.length) {

                const relevantScenario = match.talking.find(scenario => {
                    return(scenario.required || []).every(sf => {
                        return playerState.storyFlags[sf]
                    })
                })
                relevantScenario && this.startCutscene(relevantScenario.events)
            }
        }

        checkForFootstepCutscene() {
            const hero = this.gameObjects["hero"];
            const match = this.cutsceneSpaces[`${hero.x},${hero.y}`];
            if (!this.isCutscenePlaying && match) {
                this.startCutscene(match[0].events)
            }
        }

        addWall(x,y) {
            this.walls[`${x},${y}`] = true; 
        }
        removeWall(x,y) {
            delete this.walls[`${x},${y}`]
        }
        moveWall(wasX, wasY, direction) {
            this.removeWall(wasX, wasY);
            const {x,y} = utils.nextPosition(wasX, wasY, direction);
            this.addWall(x,y);
        }

    }

    window.OverworldMaps = {
        DemoRoom: {
            id: "DemoRoom",
            lowerSrc: "/WastelandChronicles/images/maps/DemoLower.png",
            upperSrc: "/WastelandChronicles/images/maps/DemoUpper.png",
            gameObjects:{
                hero: new Person({
                    isPlayerControlled: true,
                    x: utils.withGrid(5),
                    y: utils.withGrid(6),
                }),
                npc1: new Person({
                    x: utils.withGrid(7),
                    y: utils.withGrid(9),
                    src: "/WastelandChronicles/images/characters/people/npc1.png",
                    behaviorLoop: [
                        { type: "walk", direction: "left" },
                        { type: "stand", direction: "up", time: 800 },
                        { type: "walk", direction: "right" },
                        { type: "stand", direction: "down", time: 800 },
                    ],
                    talking: [
                        {
                            required: ["TALKED_TO_ERIO"],
                            events: [
                                { type: "textMessage", text: "Why did you talk to him, ain't I pretty enough for ya?", faceHero: "npc1" },
                            ] 
                        },
                        {
                            events: [
                                { type: "textMessage", text: "Don't talk to me!", faceHero: "npc1" },
                                { type: "battle", enemyId: "beth" },
                                { type: "addStoryFlag", flag: "BEAT_UP_BETH"},
                                { type: "textMessage", text: "You broke my gear stick!!", faceHero: "npc1" },
                            ]
                        }
                    ],
                }),
                npc2: new Person({
                    x: utils.withGrid(8),
                    y: utils.withGrid(5),
                    src: "/WastelandChronicles/images/characters/people/erio.png",
                    talking: [
                        {
                            events: [
                                { type: "textMessage", text: "I shall destroy you!", faceHero: "npc2" },
                                {type: "addStoryFlag", flag: "TALKED_TO_ERIO"},
                                { type: "battle", enemyId: "erio" }
                            ]
                        }
                    ],
                }),
                creatureStone: new CreatureStone({
                    x: utils.withGrid(2),
                    y: utils.withGrid(7),
                    storyFlag: "USED_STONE_DemoRoom",
                    creatures: ["s001", "s002", "s003"],
                }),
            },
            walls: {
                //Left End Wall
                [utils.asGridCoord(0,0)]: true,
                [utils.asGridCoord(0,1)]: true,
                [utils.asGridCoord(0,2)]: true,
                [utils.asGridCoord(0,3)]: true,
                [utils.asGridCoord(0,4)]: true,
                [utils.asGridCoord(0,5)]: true,
                [utils.asGridCoord(0,6)]: true,
                [utils.asGridCoord(0,7)]: true,
                [utils.asGridCoord(0,8)]: true,
                [utils.asGridCoord(0,9)]: true,
                [utils.asGridCoord(0,10)]: true,
                [utils.asGridCoord(0,11)]: true,
                //Right End Wall
                [utils.asGridCoord(11,0)]: true,
                [utils.asGridCoord(11,1)]: true,
                [utils.asGridCoord(11,2)]: true,
                [utils.asGridCoord(11,3)]: true,
                [utils.asGridCoord(11,4)]: true,
                [utils.asGridCoord(11,5)]: true,
                [utils.asGridCoord(11,6)]: true,
                [utils.asGridCoord(11,7)]: true,
                [utils.asGridCoord(11,8)]: true,
                [utils.asGridCoord(11,9)]: true,
                [utils.asGridCoord(11,10)]: true,
                [utils.asGridCoord(11,11)]: true,
                //Bottom End Wall
                [utils.asGridCoord(1,10)]: true,
                [utils.asGridCoord(2,10)]: true,
                [utils.asGridCoord(3,10)]: true,
                [utils.asGridCoord(4,10)]: true,
                [utils.asGridCoord(5,11)]: true,
                [utils.asGridCoord(6,10)]: true,
                [utils.asGridCoord(7,10)]: true,
                [utils.asGridCoord(8,10)]: true,
                [utils.asGridCoord(9,10)]: true,
                [utils.asGridCoord(10,10)]: true,
                [utils.asGridCoord(11,10)]: true,
                //Top End Wall
                [utils.asGridCoord(1,3)]: true,
                [utils.asGridCoord(2,3)]: true,
                [utils.asGridCoord(3,3)]: true,
                [utils.asGridCoord(4,3)]: true,
                [utils.asGridCoord(5,3)]: true,
                [utils.asGridCoord(6,4)]: true,
                [utils.asGridCoord(6,3)]: true,
                [utils.asGridCoord(7,2)]: true,
                [utils.asGridCoord(8,3)]: true,
                [utils.asGridCoord(8,4)]: true,
                [utils.asGridCoord(9,3)]: true,
                [utils.asGridCoord(10,3)]: true,
                [utils.asGridCoord(11,3)]: true,
                // Table
                [utils.asGridCoord(7,6)]: true,
                [utils.asGridCoord(8,6)]: true,
                [utils.asGridCoord(7,7)]: true,
                [utils.asGridCoord(8,7)]: true,
            },
            cutsceneSpaces: {
                [utils.asGridCoord(7,4)]: [
                    {
                        events: [
                            { who: "npc2", type: "walk", direction: "left" },
                            { who: "npc2", type: "stand", direction: "up", time: 200 },
                            { type: "textMessage", text: "You can't go in there!" },
                            { who: "npc2", type: "walk", direction: "right" },
                            { who: "hero", type: "walk", direction: "down" },
                            { who: "hero", type: "walk", direction: "left" },
                        ]
                    }
                ],
                [utils.asGridCoord(5,10)]: [
                    {
                    events: [
                        { 
                            type: "changeMap", 
                            map: "Kitchen", // Rebuild to Dining Room > Street at Alt Door 
                            // Postition Entering Map
                            x: utils.withGrid(5),
                            y: utils.withGrid(5),
                            direction: "down"
                        },
                        ]
                    }
                ]
            }
        },

        Kitchen: {
            id: "Kitchen",
            lowerSrc: "/WastelandChronicles/images/maps/KitchenLower.png",
            upperSrc: "/WastelandChronicles/images/maps/KitchenUpper.png",
            gameObjects:{
                hero: new Person({
                    isPlayerControlled: true,
                    x: utils.withGrid(5),
                    y: utils.withGrid(6),
                }),
                npc3: new Person({
                    x: utils.withGrid(10),
                    y: utils.withGrid(8),
                    src: "/WastelandChronicles/images/characters/people/npc3.png",
                    talking: [
                        {
                            events: [
                                { who: "npc3", type: "stand", direction: "left" },
                                { type: "textMessage", text: "Did you miss the first creation stone?", faceHero: "npc3" },
                                { type: "textMessage", text: "Make sure you use all the others.", faceHero: "npc3" },
                            ]
                        }
                    ]
                }),
                creatureStone: new CreatureStone({
                    x: utils.withGrid(4),
                    y: utils.withGrid(4),
                    storyFlag: "USED_STONE_Kitchen",
                    creatures: ["s001", "s002", "s003"],
                }),           
            },
            walls: {
            // Walls at y-3
            [utils.asGridCoord(1, 3)]: true,
            [utils.asGridCoord(2, 3)]: true,
            [utils.asGridCoord(3, 3)]: true,
            [utils.asGridCoord(4, 3)]: true,
            [utils.asGridCoord(5, 3)]: true,
            [utils.asGridCoord(6, 3)]: true,
            [utils.asGridCoord(7, 3)]: true,
            [utils.asGridCoord(8, 3)]: true,
            [utils.asGridCoord(9, 3)]: true,
            [utils.asGridCoord(10, 3)]: true,
            // Walls at y-4
            [utils.asGridCoord(0, 4)]: true,
            [utils.asGridCoord(11, 4)]: true,
            [utils.asGridCoord(12, 4)]: true,
            // Walls at y-5
            [utils.asGridCoord(1, 5)]: true,
            [utils.asGridCoord(13, 5)]: true,
            // Walls at y-6
            [utils.asGridCoord(1, 6)]: true,
            [utils.asGridCoord(13, 6)]: true,
            // Walls at y-7
            [utils.asGridCoord(1, 7)]: true,
            [utils.asGridCoord(6, 7)]: true,
            [utils.asGridCoord(7, 7)]: true,
            [utils.asGridCoord(9, 7)]: true,
            [utils.asGridCoord(10, 7)]: true,
            [utils.asGridCoord(13, 7)]: true,
            // Walls at -8
            [utils.asGridCoord(0, 8)]: true,
            [utils.asGridCoord(13, 8)]: true,
            // Walls at y-9
            [utils.asGridCoord(1, 9)]: true,
            [utils.asGridCoord(2, 9)]: true,
            [utils.asGridCoord(9, 9)]: true,
            [utils.asGridCoord(10, 9)]: true,
            [utils.asGridCoord(13, 9)]: true,
            // Walls at y-10
            [utils.asGridCoord(3, 10)]: true,
            [utils.asGridCoord(4, 10)]: true,
            [utils.asGridCoord(6, 10)]: true,
            [utils.asGridCoord(7, 10)]: true,
            [utils.asGridCoord(8, 10)]: true,
            [utils.asGridCoord(11, 10)]: true,
            [utils.asGridCoord(12, 10)]: true,
            // Walls at y-11
            [utils.asGridCoord(5, 11)]: true,
            },
            cutsceneSpaces: {
                // Postition Leaving Map
                [utils.asGridCoord(5,10)]: [
                    {
                    events: [
                        { 
                            type: "changeMap", 
                            map: "Street",
                            // Postition Entering Map
                            x: utils.withGrid(29),
                            y: utils.withGrid(9),
                            direction: "down"
                        }
                        ]
                    }
                ]
            }
        },

        DiningRoom: {
            id: "DiningRoom",
            lowerSrc: "/WastelandChronicles/images/maps/DiningRoomLower.png",
            upperSrc: "/WastelandChronicles/images/maps/DiningRoomUpper.png",
            gameObjects:{
                hero: new Person({
                    isPlayerControlled: true,
                    x: utils.withGrid(5),
                    y: utils.withGrid(6),
                }),
                npc3: new Person({
                    x: utils.withGrid(5),
                    y: utils.withGrid(5),
                    src: "/WastelandChronicles/images/characters/people/npc3.png",
                    behaviorLoop: [
                        { type: "stand", direction: "up", time: 800 },
                        { type: "stand", direction: "down", time: 3000 },
                    ],
                    talking: [
                        {
                            events: [
                                { who: "npc3", type: "stand", direction: "down" },
                                { type: "textMessage", text: "What do you want?", faceHero: "npc3" },
                                { type: "textMessage", text: "Go away! Can't you see we're full!" },
                                { type: "addStoryFlag", flag: "TALKED_TO_npc3"},
                                { type: "battle", enemyId: "npc3" }
                            ]
                        }
                    ]
                }),
                npc2: new Person({
                    x: utils.withGrid(8),
                    y: utils.withGrid(5),
                    src: "/WastelandChronicles/images/characters/people/npc2.png"
                    ,
                    behaviorLoop: [
                        { type: "stand", direction: "left", time: 800 },
                        { type: "stand", direction: "down", time: 800 },
                        { type: "stand", direction: "right", time: 800 },
                        { type: "stand", direction: "up", time: 800 },
                    ]
                })
            },
            walls: {
                //Left End Wall
                [utils.asGridCoord(0,0)]: true,
                [utils.asGridCoord(0,1)]: true,
                [utils.asGridCoord(0,2)]: true,
                [utils.asGridCoord(0,3)]: true,
                [utils.asGridCoord(0,4)]: true,
                [utils.asGridCoord(0,5)]: true,
                [utils.asGridCoord(0,6)]: true,
                [utils.asGridCoord(0,7)]: true,
                [utils.asGridCoord(0,8)]: true,
                [utils.asGridCoord(0,9)]: true,
                [utils.asGridCoord(0,10)]: true,
                [utils.asGridCoord(0,11)]: true,
            //     //Right End Wall
                [utils.asGridCoord(13,0)]: true,
                [utils.asGridCoord(13,1)]: true,
                [utils.asGridCoord(13,2)]: true,
                [utils.asGridCoord(13,3)]: true,
                [utils.asGridCoord(13,4)]: true,
                [utils.asGridCoord(13,5)]: true,
                [utils.asGridCoord(13,6)]: true,
                [utils.asGridCoord(13,7)]: true,
                [utils.asGridCoord(13,8)]: true,
                [utils.asGridCoord(13,9)]: true,
                [utils.asGridCoord(13,10)]: true,
                [utils.asGridCoord(13,11)]: true,
            //     //Bottom End Wall
                [utils.asGridCoord(1,12)]: true,
                [utils.asGridCoord(2,12)]: true,
                [utils.asGridCoord(3,12)]: true,
                [utils.asGridCoord(4,12)]: true,
                [utils.asGridCoord(5,12)]: true,
                [utils.asGridCoord(6,13)]: true,
                [utils.asGridCoord(6,14)]: true,
                [utils.asGridCoord(6,13)]: true,
                [utils.asGridCoord(7,12)]: true,
                [utils.asGridCoord(8,12)]: true,
                [utils.asGridCoord(9,12)]: true,
                [utils.asGridCoord(10,12)]: true,
                [utils.asGridCoord(11,12)]: true,
            //     //Top End Wall
                [utils.asGridCoord(1,3)]: true,
                [utils.asGridCoord(2,3)]: true,
                [utils.asGridCoord(3,3)]: true,
                [utils.asGridCoord(4,3)]: true,
                [utils.asGridCoord(5,3)]: true,
                [utils.asGridCoord(6,3)]: true,
                [utils.asGridCoord(7,2)]: true,
                [utils.asGridCoord(8,3)]: true,
                [utils.asGridCoord(9,4)]: true,
                [utils.asGridCoord(10,4)]: true,
                [utils.asGridCoord(11,4)]: true,
                [utils.asGridCoord(12,4)]: true,
                // Table Top Right
                [utils.asGridCoord(11,5)]: true,
                // Table Middle Right
                [utils.asGridCoord(8,7)]: true,
                // Table Bottom Right
                [utils.asGridCoord(8,10)]: true,

                // Table Middle Left
                [utils.asGridCoord(3,7)]: true,
                // Table Bottom Left
                [utils.asGridCoord(3,10)]: true,
                //Bar
                [utils.asGridCoord(1,5)]: true,
                [utils.asGridCoord(2,5)]: true,
                [utils.asGridCoord(3,5)]: true,
                [utils.asGridCoord(4,5)]: true,
                //Side Counter
                [utils.asGridCoord(6,5)]: true,
                [utils.asGridCoord(6,4)]: true,
                //Paddle Counter
                [utils.asGridCoord(11,7)]: true,
                [utils.asGridCoord(12,7)]: true,
            },
            cutsceneSpaces: {
                //Top Doorway - Blocked
                [utils.asGridCoord(7,3)]: [
                    {
                        events: [
                            { who: "npc2", type: "walk", direction: "left" },
                            { who: "npc2", type: "stand", direction: "up", time: 200 },
                            { type: "textMessage", text: "You can't go in there!" },
                            { who: "npc2", type: "walk", direction: "right" },
                            { who: "hero", type: "walk", direction: "down" },
                            { who: "hero", type: "walk", direction: "down" },
                            { who: "npc2", type: "stand", direction: "left" },
                            { who: "hero", type: "stand", direction: "right" },
                            { type: "textMessage", text: "I shall destroy you!", faceHero: "npc2" },
                            { type: "addStoryFlag", flag: "TALKED_TO_npc2"},
                            { type: "battle", enemyId: "npc2" }
                        ]
                    }
                ],
                // Bottom Doorway > Street
                [utils.asGridCoord(6,12)]: [
                    {
                    events: [
                        { 
                            type: "changeMap", 
                            map: "Street",
                            x: utils.withGrid(5),
                            y: utils.withGrid(10),
                            direction: "down"
                        }
                        ]
                    }
                ],
            }
        },
        Street: {
            id: "Street",
            lowerSrc: "/WastelandChronicles/images/maps/StreetLower.png",
            upperSrc: "/WastelandChronicles/images/maps/StreetUpper.png",
            gameObjects: {
                hero: new Person({
                    isPlayerControlled: true,
                    x: utils.withGrid(30),
                    y: utils.withGrid(10),
                }),
                npc4: new Person({
                    x: utils.withGrid(8),
                    y: utils.withGrid(10),
                    src: "/WastelandChronicles/images/characters/people/npc4.png",
                    behaviorLoop: [
                        { type: "stand", direction: "up", time: 800 },
                        { type: "stand", direction: "down", time: 3000 },
                    ],
                    talking: [
                        {
                            required: ["TALKED_TO_Chef"],
                            events: [
                                { type: "textMessage", text: "YUGIO! IT'S TIME TO DUEL!!" },
                                { type: "battle", enemyId: "npc4" },
                                { type: "addStoryFlag", flag: "BATTLED_YUGIO"},
                            ] 
                        },
                        {
                            events: [
                                { who: "npc4", type: "stand", direction: "down" },
                                { type: "textMessage", text: "Chef doesn't speak to anyone!", faceHero: "npc4" },
                                { type: "addStoryFlag", flag: "TALKED_TO_Chef"},
                            ]
                        },

                    ]                  
                }),
                npc5: new Person({
                    x: utils.withGrid(24),
                    y: utils.withGrid(8),
                    src: "/WastelandChronicles/images/characters/people/npc5.png"
                    ,
                    behaviorLoop: [
                        { type: "stand", direction: "right", time: 1800 },
                        { type: "stand", direction: "left", time: 1800 },
                    ],
                    talking: [
                        // {
                        //     required: ["BATTLED_YUGIO"],
                        //     events: [
                        //         { type: "stand", direction: "right", time: 800 },
                        //         { who: "npc5", type: "walk", direction: "right" },
                        //         { type: "stand", direction: "left", time: 800 },
                        //         // { who: "npc5", type: "walk", direction: "left" },
                        //         // { type: "stand", direction: "down", time: 800 },
                        //     ] 
                        // },                        
                        {
                            events: [
                                //{ who: "npc5", type: "stand", direction: "down" },
                                { type: "addStoryFlag", flag: "TALKED_TO_Chef"},
                                { type: "textMessage", text: "...", faceHero: "npc5" },
                            ]
                        }
                    ],
                })
            },
            cutsceneSpaces: {
                [utils.asGridCoord(29,9)]: [
                    {
                    events: [
                        { 
                            type: "changeMap", 
                            map: "Kitchen",
                            x: utils.withGrid(5),
                            y: utils.withGrid(10),
                            direction: "up"
                        }
                        ]
                    }
                ],
                [utils.asGridCoord(25,5)]: [
                    {
                    events: [
                        { 
                            type: "changeMap", 
                            map: "Wasteland1",
                            x: utils.withGrid(9),
                            y: utils.withGrid(0),
                            direction: "down"
                        }
                        ]
                    }
                ],
                [utils.asGridCoord(5,9)]: [
                    {
                    events: [
                        { 
                            type: "changeMap", 
                            map: "DiningRoom",
                            x: utils.withGrid(6),
                            y: utils.withGrid(12),
                            direction: "up"
                        }
                        ]
                    }
                ],
                [utils.asGridCoord(3,14)]: [
                    {
                    events: [
                        { 
                            type: "changeMap", 
                            map: "DemoRoom",
                            x: utils.withGrid(7),
                            y: utils.withGrid(3),
                            direction: "up"
                        }
                        ]
                    }
                ],
            },
            walls: {
                //Left End Wall
                [utils.asGridCoord(3,0)]: true,
                [utils.asGridCoord(3,1)]: true,
                [utils.asGridCoord(3,2)]: true,
                [utils.asGridCoord(3,3)]: true,
                [utils.asGridCoord(3,4)]: true,
                [utils.asGridCoord(3,5)]: true,
                [utils.asGridCoord(3,6)]: true,
                [utils.asGridCoord(3,7)]: true,
                [utils.asGridCoord(3,8)]: true,
                [utils.asGridCoord(3,9)]: true,
                [utils.asGridCoord(3,10)]: true,
                [utils.asGridCoord(3,11)]: true,

                [utils.asGridCoord(3,12)]: true,
                [utils.asGridCoord(3,13)]: true,
                [utils.asGridCoord(2,14)]: true,
                [utils.asGridCoord(3,15)]: true,
                [utils.asGridCoord(3,16)]: true,
                [utils.asGridCoord(3,17)]: true,
                [utils.asGridCoord(3,18)]: true,

            //     //Right End Wall
                [utils.asGridCoord(34,0)]: true,
                [utils.asGridCoord(34,1)]: true,
                [utils.asGridCoord(34,2)]: true,
                [utils.asGridCoord(34,3)]: true,
                [utils.asGridCoord(34,4)]: true,
                [utils.asGridCoord(34,5)]: true,
                [utils.asGridCoord(34,6)]: true,
                [utils.asGridCoord(34,7)]: true,
                [utils.asGridCoord(34,8)]: true,
                [utils.asGridCoord(34,9)]: true,
                [utils.asGridCoord(34,10)]: true,
                [utils.asGridCoord(34,11)]: true,
                [utils.asGridCoord(34,12)]: true,
                [utils.asGridCoord(34,13)]: true,
                [utils.asGridCoord(34,14)]: true,
                [utils.asGridCoord(34,15)]: true,
                [utils.asGridCoord(34,16)]: true,
                [utils.asGridCoord(34,17)]: true,
                [utils.asGridCoord(34,18)]: true,
            //     //Bottom End Wall
                [utils.asGridCoord(1,19)]: true,
                [utils.asGridCoord(2,19)]: true,
                [utils.asGridCoord(3,19)]: true,
                [utils.asGridCoord(4,19)]: true,
                [utils.asGridCoord(5,19)]: true,
                [utils.asGridCoord(6,19)]: true,
                [utils.asGridCoord(6,19)]: true,
                [utils.asGridCoord(6,19)]: true,
                [utils.asGridCoord(7,19)]: true,
                [utils.asGridCoord(8,19)]: true,
                [utils.asGridCoord(9,19)]: true,
                [utils.asGridCoord(10,19)]: true,
                [utils.asGridCoord(11,19)]: true,
                [utils.asGridCoord(12,19)]: true,
                [utils.asGridCoord(13,19)]: true,
                [utils.asGridCoord(14,19)]: true,
                [utils.asGridCoord(15,19)]: true,
                [utils.asGridCoord(16,19)]: true,
                [utils.asGridCoord(17,19)]: true,
                [utils.asGridCoord(18,19)]: true,
                [utils.asGridCoord(19,19)]: true,
                [utils.asGridCoord(20,19)]: true,
                [utils.asGridCoord(21,19)]: true,
                [utils.asGridCoord(22,19)]: true,
                [utils.asGridCoord(23,19)]: true,
                [utils.asGridCoord(24,19)]: true,
                [utils.asGridCoord(25,19)]: true,
                [utils.asGridCoord(26,19)]: true,
                [utils.asGridCoord(27,19)]: true,
                [utils.asGridCoord(28,19)]: true,
                [utils.asGridCoord(29,19)]: true,
                [utils.asGridCoord(30,19)]: true,
                [utils.asGridCoord(31,19)]: true,
                [utils.asGridCoord(32,19)]: true,
                [utils.asGridCoord(33,19)]: true,

            //   //Top End Wall
                [utils.asGridCoord(1,9)]: true,
                [utils.asGridCoord(2,9)]: true,
                [utils.asGridCoord(3,9)]: true,
                [utils.asGridCoord(4,9)]: true,
                [utils.asGridCoord(6,9)]: true,
                [utils.asGridCoord(7,9)]: true,
                [utils.asGridCoord(8,9)]: true,
                [utils.asGridCoord(9,9)]: true,
                [utils.asGridCoord(10,9)]: true,
                [utils.asGridCoord(11,9)]: true,
                [utils.asGridCoord(12,9)]: true,
                [utils.asGridCoord(13,8)]: true,
                [utils.asGridCoord(14,8)]: true,
                [utils.asGridCoord(15,7)]: true,
                [utils.asGridCoord(16,7)]: true,
                [utils.asGridCoord(17,7)]: true,
                [utils.asGridCoord(18,7)]: true,
                [utils.asGridCoord(19,7)]: true,
                [utils.asGridCoord(20,7)]: true,
                [utils.asGridCoord(21,7)]: true,
                [utils.asGridCoord(22,7)]: true,
                [utils.asGridCoord(23,7)]: true,
                [utils.asGridCoord(24,5)]: true,
                [utils.asGridCoord(24,6)]: true,
                [utils.asGridCoord(24,7)]: true,
                [utils.asGridCoord(25,4)]: true,
                [utils.asGridCoord(26,5)]: true,
                [utils.asGridCoord(26,6)]: true,
                [utils.asGridCoord(27,6)]: true,
                [utils.asGridCoord(26,7)]: true,
                [utils.asGridCoord(27,7)]: true,
                [utils.asGridCoord(28,8)]: true,
                [utils.asGridCoord(28,9)]: true,
                [utils.asGridCoord(29,8)]: true,
                [utils.asGridCoord(30,9)]: true,
                [utils.asGridCoord(31,9)]: true,
                [utils.asGridCoord(32,9)]: true,
                [utils.asGridCoord(33,9)]: true,

                // Sign near road
                [utils.asGridCoord(5,14)]: true,
                [utils.asGridCoord(6,14)]: true,
                [utils.asGridCoord(7,14)]: true,
                [utils.asGridCoord(8,14)]: true,

                // Raised Bed Right
                [utils.asGridCoord(25,9)]: true,
                [utils.asGridCoord(25,10)]: true,
                [utils.asGridCoord(25,11)]: true,
                [utils.asGridCoord(26,9)]: true,
                [utils.asGridCoord(26,10)]: true,
                [utils.asGridCoord(26,11)]: true,

                // Raised Bed Left
                [utils.asGridCoord(16,9)]: true,
                [utils.asGridCoord(16,10)]: true,
                [utils.asGridCoord(16,11)]: true,
                [utils.asGridCoord(17,9)]: true,
                [utils.asGridCoord(17,10)]: true,
                [utils.asGridCoord(17,11)]: true,

                // Paddle Counter
                [utils.asGridCoord(18,11)]: true,
                [utils.asGridCoord(19,11)]: true,
            },
        },
        Wasteland1: {
            id: "Wasteland1",
            lowerSrc: "/WastelandChronicles/images/maps/wasteland_3.png",
            upperSrc: "/WastelandChronicles/images/maps/wasteland_3_Upper.png",
            gameObjects: {
                hero: new Person({
                    isPlayerControlled: true,
                    x: utils.withGrid(9),
                    y: utils.withGrid(0),
                }),
                evilhero: new Person({
                    x: utils.withGrid(5),
                    y: utils.withGrid(5),
                    src: "/WastelandChronicles/images/characters/people/hero.png",
                    behaviorLoop: [
                        { type: "stand", direction: "up", time: 800 },
                        { type: "stand", direction: "down", time: 3000 },
                    ],
                    talking: [
                        {
                            required: ["DEMO_END"],
                            events: [
                                { type: "textMessage", text: "Demo Done!" },
                            ] 
                        },
                        {
                            events: [
                                { who: "hero", type: "stand", direction: "left", },
                                { type: "textMessage", text: "This is your final test...", faceHero: "evilhero" },
                                { type: "textMessage", text: "Prepare to DIE!!!" },
                                { type: "addStoryFlag", flag: "DEMO_END"},
                                { type: "battle", enemyId: "evilhero" },
                            ]
                        },
                    ]
                }),
                creatureStone: new CreatureStone({
                    x: utils.withGrid(18),
                    y: utils.withGrid(1),
                    storyFlag: "USED_STONE_Wasteland",
                    creatures: ["s001", "s002", "s003"],
                }),
            },
            walls: {
                //Left End Wall
                [utils.asGridCoord(-1,0)]: true,
                [utils.asGridCoord(-1,1)]: true,
                [utils.asGridCoord(-1,2)]: true,
                [utils.asGridCoord(-1,3)]: true,
                [utils.asGridCoord(-1,4)]: true,
                [utils.asGridCoord(-1,5)]: true,
                [utils.asGridCoord(0,6)]: true,
                [utils.asGridCoord(1,6)]: true,
                [utils.asGridCoord(0,7)]: true,
                [utils.asGridCoord(-1,8)]: true,
                [utils.asGridCoord(-1,9)]: true,
                [utils.asGridCoord(-1,10)]: true,
                [utils.asGridCoord(-1,11)]: true,

                // Bottom Wall
                [utils.asGridCoord(0,10)]: true,
                [utils.asGridCoord(1,11)]: true,
                [utils.asGridCoord(2,11)]: true,
                [utils.asGridCoord(3,11)]: true,
                [utils.asGridCoord(4,11)]: true,
                [utils.asGridCoord(5,11)]: true,
                [utils.asGridCoord(6,11)]: true,
                [utils.asGridCoord(7,11)]: true,
                [utils.asGridCoord(8,11)]: true,
                [utils.asGridCoord(9,11)]: true,
                [utils.asGridCoord(10,10)]: true,
                [utils.asGridCoord(11,10)]: true,
                [utils.asGridCoord(12,11)]: true,
                [utils.asGridCoord(13,11)]: true,
                [utils.asGridCoord(14,11)]: true,
                [utils.asGridCoord(15,11)]: true,
                [utils.asGridCoord(16,11)]: true,
                [utils.asGridCoord(17,10)]: true,
                [utils.asGridCoord(18,10)]: true,
                [utils.asGridCoord(19,9)]: true,

                // Right Wall
                [utils.asGridCoord(20,0)]: true,
                [utils.asGridCoord(20,1)]: true,
                [utils.asGridCoord(20,2)]: true,
                [utils.asGridCoord(20,3)]: true,
                [utils.asGridCoord(20,4)]: true,
                [utils.asGridCoord(20,5)]: true,
                [utils.asGridCoord(20,6)]: true,
                [utils.asGridCoord(20,7)]: true,
                [utils.asGridCoord(20,8)]: true,
                [utils.asGridCoord(20,9)]: true,

                // Top Wall
                [utils.asGridCoord(0,-1)]: true,
                [utils.asGridCoord(1,-1)]: true,
                [utils.asGridCoord(2,-1)]: true,
                [utils.asGridCoord(3,-1)]: true,
                [utils.asGridCoord(4,-1)]: true,
                [utils.asGridCoord(5,-1)]: true,
                [utils.asGridCoord(6,-1)]: true,
                [utils.asGridCoord(7,-1)]: true,
                [utils.asGridCoord(8,-1)]: true,
                [utils.asGridCoord(9,-2)]: true, // Exit
                [utils.asGridCoord(10,-1)]: true,
                [utils.asGridCoord(11,-1)]: true,
                [utils.asGridCoord(12,-1)]: true,
                [utils.asGridCoord(13,-1)]: true,
                [utils.asGridCoord(14,-1)]: true,
                [utils.asGridCoord(15,-1)]: true,
                [utils.asGridCoord(16,-1)]: true,
                [utils.asGridCoord(17,-1)]: true,
                [utils.asGridCoord(18,0)]: true,
                [utils.asGridCoord(19,0)]: true,              

                //Top Right Cliffs
                [utils.asGridCoord(18,2)]: true,
                [utils.asGridCoord(17,1)]: true,
                [utils.asGridCoord(17,0)]: true,
                [utils.asGridCoord(16,0)]: true,
                [utils.asGridCoord(16,3)]: true,
                [utils.asGridCoord(15,2)]: true,
                [utils.asGridCoord(14,1)]: true,
                [utils.asGridCoord(13,0)]: true,

                // Center Mound
                [utils.asGridCoord(10,2)]: true,
                [utils.asGridCoord(11,2)]: true,
                [utils.asGridCoord(11,3)]: true,
                [utils.asGridCoord(12,3)]: true,

                // Pond
                [utils.asGridCoord(15,7)]: true,
                [utils.asGridCoord(15,8)]: true,
                [utils.asGridCoord(16,6)]: true,
                [utils.asGridCoord(16,7)]: true,
                [utils.asGridCoord(16,8)]: true,
                [utils.asGridCoord(17,6)]: true,
                [utils.asGridCoord(17,7)]: true,

                // Big Tree
                [utils.asGridCoord(3,6)]: true,
                [utils.asGridCoord(3,5)]: true,
                //
                [utils.asGridCoord(7,10)]: true,
                // Bush near pond
                [utils.asGridCoord(13,9)]: true,
            },
            cutsceneSpaces: {
                [utils.asGridCoord(9,-1)]: [
                    {
                    events: [
                        { 
                            type: "changeMap", 
                            map: "Street",
                            x: utils.withGrid(25),
                            y: utils.withGrid(5),
                            direction: "down"
                        }
                        ]
                    }
                ],
            },
        }
    }
