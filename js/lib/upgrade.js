function Upgrade(game, name, effect, prereqs) {
  this.name = name;
  this.effect = effect;
  this.prereqs = prereqs || [];
}