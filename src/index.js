import React from 'react'

function mapValues(obj, mapper) {
  const mapped = {}
  Object.keys(obj).forEach(key => (mapped[key] = mapper(obj[key])))
  return mapped
}

function reduce(obj, reducer, val) {
  return Object.keys(obj).reduce((acc, key) => reducer(acc, obj[key], key), val)
}

function addStore(children, store, key) {
  return acc => (
    <store.Context.Consumer>
      {value => children({ ...acc, [key]: value })}
    </store.Context.Consumer>
  )
}

export function connect(stores) {
  return Component => {
    const root = props => <Component {...props} />
    const Connector = reduce(stores, addStore, root)
    Connector.displayName = 'Connector'
    return Connector
  }
}

export function combineStores(...stores) {
  return function CombinedStore(props) {
    return stores.reduce(
      (combined, Store) => <Store>{combined}</Store>,
      props.children
    )
  }
}

const defaultHelpers = {
  getState() {
    return this.state
  },

  setState(state) {
    return this.setState(state)
  }
}

export function createStore(helpers) {
  return function store(state, actions) {
    const Context = React.createContext()

    return class Store extends Component {
      static Context = Context

      helpers = mapValues({ ...defaultHelpers, ...helpers }, helper =>
        helper.bind(this)
      )

      state = {
        ...state,
        ...actions(this.helpers)
      }

      render() {
        return (
          <Context.Provider value={this.state}>
            {this.props.children}
          </Context.Provider>
        )
      }
    }
  }
}
