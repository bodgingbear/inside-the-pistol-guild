import { Wizard } from '../objects/Wizard';
import { Monster, MonsterType } from '../objects/Monster';
import { intersects } from '../utils/intersects';
import { MonstersScheduler } from '../objects/MonstersScheduler';

export default class GameScene extends Phaser.Scene {
  wizard: Wizard

  monsters: Monster[]

  monstersScheduler: MonstersScheduler

  public constructor() {
    super({
      key: 'MainMenuScene',
    });

    this.monsters = [];
  }

  create(): void {
    this.add.image(1280 / 2, 720 / 2, 'bg').setScale(5);

    this.wizard = new Wizard(this);

    this.wizard.setStaffAttackCb(this.onWizardStuffAttack);
    this.wizard.setFireAttackCb(this.onWizardFireAttack);

    this.monstersScheduler = new MonstersScheduler();
    this.monstersScheduler.setSpawnCb(this.spawnMonster);
    this.monstersScheduler.start();
  }

  onWizardStuffAttack = (): void => {
    const wizardX = this.wizard.sprite.x;
    this.monsters.sort((a, b) => Math.abs(b.sprite.x - wizardX) - Math.abs(a.sprite.x - wizardX));

    let monsterToKill = null;
    for (let i = 0; i < this.monsters.length; i += 1) {
      if (intersects(this.wizard.staffRangeCollider, this.monsters[i].sprite) && this.wizard.isFacing(this.monsters[i].sprite)) {
        monsterToKill = this.monsters[i];
        this.monsters.splice(i, 1);
        break;
      }
    }

    if (monsterToKill) {
      monsterToKill.kill();
    }
  }

  onWizardFireAttack = (): void => {
    this.monsters = this.monsters.filter((monster) => {
      console.log(this.wizard.fire.x, this.wizard.fire.displayWidth);
      if (intersects(this.wizard.fire, monster.sprite)) {
        monster.kill();
        return false;
      }
      return true;
    });
  }

  spawnMonster = (monsterType: MonsterType): void => {
    const monster = new Monster(this, this.wizard.sprite, monsterType);
    this.monsters.push(monster);
  }

  update(): void {
    this.wizard.update();

    this.monsters.forEach((monster) => {
      monster.update();

      if (intersects(monster.sprite, this.wizard.sprite, 50)) {
        this.wizard.kill();
      }
    });
  }
}
