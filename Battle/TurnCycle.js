    class TurnCycle{
        constructor({ battle, onNewEvent, onWinner }) {
            this.battle = battle;
            this.onNewEvent = onNewEvent;
            this.onWinner = onWinner;
            this.currentTeam = "player"; //or "enemy"
        }

        async turn() {
            //Get the caster
            const casterId = this.battle.activeCombatants[this.currentTeam];
            const caster = this.battle.combatants[casterId];
            const enemyId = this.battle.activeCombatants[caster.team === "player" ? "enemy" : "player"]
            const enemy = this.battle.combatants[enemyId];
            
            const submission = await this.onNewEvent({
                type: "submissionMenu",
                caster,
                enemy
            })

            if(submission.replacement) {
                await this.onNewEvent({
                    type: "replace",
                    replacement: submission.replacement
                })
                await this.onNewEvent({
                    type: "textMessage",
                    text: `${submission.replacement.name} has entered the battle!`
                })
                this.nextTurn();
                return;
            }

            if(submission.instanceId) {
                //Add to list to persist to player state later
                this.battle.usedInstanceIds[submission.instanceId] = true; 

                //Remove item from battle state
                this.battle.items = this.battle.items.filter((i) => i.instanceId !== submission.instanceId )
            }
            
            const resultingEvents = caster.getReplacedEvents(submission.action.success);
            
            for (let i=0; i<resultingEvents.length; i++) {
               const event = {
                ...resultingEvents[i],
                submission,
                action: submission.action,
                caster,
                target: submission.target,
               } 
               await this.onNewEvent(event);
            }

            // Did Creature die?
            const targetDead = submission.target.hp <= 0;
            if(targetDead) {
                await this.onNewEvent({
                    type: "textMessage", 
                    text: `${submission.target.name} has been defeated!`
                })

                if(submission.target.team === "enemy") {

                    const playerActiveCreatureId = this.battle.activeCombatants.player;
                    const xp = submission.target.givesXp;

                    await this.onNewEvent({
                        type: "textMessage",
                        text: `Gained ${xp} XP!`
                    })    
                    
                    await this.onNewEvent({
                        type: "giveXp",
                        xp,
                        combatant: this.battle.combatants[playerActiveCreatureId]
                    })
                }
            }

            // Did a team win?
            const winner = this.getWinningTeam();
            if(winner) {
                await this.onNewEvent({
                    type: "textMessage",
                    text: `${submission.target.team} has lost!`
                })
                this.onWinner(winner);

                return;
            }
            // Replacement Creature found so switching!

                if(targetDead) {
                    const replacement = await this.onNewEvent({
                       type: "replacementMenu",
                       team: submission.target.team 
                    })
                     await this.onNewEvent({
                        type: "replace",
                        replacement: replacement
                     })
                     await this.onNewEvent({
                        type: "textMessage",
                        text: `${replacement.name} has arrived!`
                     })
                }


            // Check for post events
            
            const postEvents = caster.getPostEvents();
            for(let i=0; i < postEvents.length; i++ ) {
                const event = {
                    ...postEvents[i],
                    submission,
                    action: submission.action,
                    caster,
                    target: submission.target,
                }
                await this.onNewEvent(event);
            }

            // Check if status has expired
            const expiredEvent = caster.decrementStatus();
            if (expiredEvent) {
                await this.onNewEvent(expiredEvent)
            }
            this.nextTurn();
        }

        nextTurn() {
            this.currentTeam = this.currentTeam === "player" ? "enemy" : "player";
            this.turn();
        }

        getWinningTeam() {
            let aliveTeams = {};
            Object.values(this.battle.combatants).forEach(c => {
                if (c.hp > 0) {
                    aliveTeams[c.team] = true;
                }
            })
            if (!aliveTeams["player"]) {return "enemy"}
            if (!aliveTeams["enemy"]) {return "player"}
            return null;
        }

        async init() {
            await this.onNewEvent({
                type: "textMessage",
                text: `${this.battle.enemy.name} has challenged you to a battle!`
            })

            // Start the first turn!
            this.turn();
        }
    }