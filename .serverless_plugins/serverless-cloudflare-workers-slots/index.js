const slots = require('./integration/slots')

class SlotsPlugin {
  constructor(serverless, options) {
    this.serverless = serverless
    this.options = options

    this.commands = {
      'activate-slot': {
        usage: 'Activates the specified slot.',
        lifecycleEvents: ['run'],
        options: {
          function: {
            required: false,
            shortcut: 'f',
          },
          slot: {
            required: true,
            shortcut: 's',
          },
        },
      },
      rotate: {
        usage: 'Activates the next slot in rotation.',
        lifecycleEvents: ['run'],
        options: {
          function: {
            required: false,
            shortcut: 'f',
          },
        },
      },
      'current-slot': {
        usage: 'Gets the current active slot.',
        lifecycleEvents: ['run'],
        options: {
          function: {
            required: false,
            shortcut: 'f',
          },
        },
      },
    }

    this.hooks = {
      'before:deploy:deploy': async () =>
        await slots.configureForDeploy(this.serverless, this.options.function),
      'before:remove:remove': async () =>
        await slots.configureForRemove(this.serverless, this.options.function),
      'activate-slot:run': async () =>
        await slots.activateSlot(this.serverless, this.options.function, this.options.slot),
      'rotate:run': async () => await slots.rotateSlots(this.serverless, this.options.function),
      'current-slot:run': async () =>
        await slots.currentSlots(this.serverless, this.options.function),
    }
  }
}

module.exports = SlotsPlugin
