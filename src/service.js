import makeDebug from 'debug'
import { convert } from '@feathersjs/errors'

const debug = makeDebug('feathers-distributed:service')

// This is the Feathers service abstraction for a cote requester on remote
class RemoteService {
  constructor (app, options) {
    // Keep track of partition key
    this.key = options.key
    this.requester = app.serviceRequesters[options.key]
    this.path = options.path
    // This flag indicates to the plugin this is a remote service
    this.remote = true
    this.events = options.events
    this.remoteEvents = options.events || ['created', 'updated', 'patched', 'removed']
    this.docs = options.docs
  }

  setup (app, path) {
    // Create the request manager to remote ones for this service
    this.requester = new app.cote.Requester({
      name: path + ' requester',
      namespace: path,
      key: path,
      requests: ['find', 'get', 'create', 'update', 'patch', 'remove']
    }, app.coteOptions)
    this.path = path
    debug('Requester created for remote service on path ' + this.path)

    if (app.distributionOptions.publishEvents && this.remoteEvents.length) {
      // Create the subscriber to listen to events from other nodes
      this.serviceEventsSubscriber = new app.cote.Subscriber({
        name: path + ' events subscriber',
        namespace: path,
        key: path,
        subscribesTo: this.remoteEvents
      }, app.coteOptions)
      this.remoteEvents.forEach(event => {
        this.serviceEventsSubscriber.on(event, object => {
          debug(`Dispatching ${event} remote service event on path ` + path, object)
          this.emit(event, object)
        })
      })
      debug('Subscriber created for remote service events on path ' + this.path, this.remoteEvents)
    }
  }

  // Perform requests to other nodes
  async find (params) {
    debug('Requesting find() remote service on path ' + this.path + ' with key ' + this.key, params)
    try {
      const result = await this.requester.send({ type: 'find', key: this.key, path: this.path, params })
      debug('Successfully find() remote service on path ' + this.path + ' with key ' + this.key)
      return result
    } catch (error) {
      throw convert(error)
    }
  }

  async get (id, params) {
    debug('Requesting get() remote service on path ' + this.path + ' with key ' + this.key, id, params)
    try {
      const result = await this.requester.send({ type: 'get', key: this.key, path: this.path, id, params })
      debug('Successfully get() remote service on path ' + this.path + ' with key ' + this.key)
      return result
    } catch (error) {
      throw convert(error)
    }
  }

  async create (data, params) {
    debug('Requesting create() remote service on path ' + this.path + ' with key ' + this.key, data, params)
    try {
      const result = await this.requester.send({ type: 'create', key: this.key, path: this.path, data, params })
      debug('Successfully create() remote service on path ' + this.path + ' with key ' + this.key)
      return result
    } catch (error) {
      throw convert(error)
    }
  }

  async update (id, data, params) {
    debug('Requesting update() remote service on path ' + this.path + ' with key ' + this.key, id, data, params)
    try {
      const result = await this.requester.send({ type: 'update', key: this.key, path: this.path, id, data, params })
      debug('Successfully update() remote service on path ' + this.path + ' with key ' + this.key)
      return result
    } catch (error) {
      throw convert(error)
    }
  }

  async patch (id, data, params) {
    debug('Requesting patch() remote service on path ' + this.path + ' with key ' + this.key, id, data, params)
    try {
      const result = await this.requester.send({ type: 'patch', key: this.key, path: this.path, id, data, params })
      debug('Successfully patch() remote service on path ' + this.path + ' with key ' + this.key)
      return result
    } catch (error) {
      throw convert(error)
    }
  }

  async remove (id, params) {
    debug('Requesting remove() remote service on path ' + this.path + ' with key ' + this.key, id, params)
    try {
      const result = await this.requester.send({ type: 'remove', key: this.key, path: this.path, id, params })
      debug('Successfully remove() remote service on path ' + this.path + ' with key ' + this.key)
      return result
    } catch (error) {
      throw convert(error)
    }
  }
}

export default RemoteService
