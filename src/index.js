import React from 'react'

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

export function connect(stores, selector = v => v) {
  return Component => {
    const root = props => <Component {...selector(props)} />
    const Connector = reduce(stores, addStore, root)
    Connector.displayName = 'Connector'
    return Connector
  }
}

export function combineStores(...stores) {
  return function CombinedStore({ children }) {
    return stores.reduce(
      (combined, Store) => <Store children={combined} />,
      children
    )
  }
}

export function createStore(state, actions) {
  const context = React.createContext()

  return class Store extends React.Component {
    static Context = context

    state = {
      ...state,
      ...this.registerActions(actions),
      setState: update => this.setState(update)
    }

    registerActions(methods) {
      return reduce(methods, (registered, method, name) => ({
        ...registered,
        [name]: (...params) => method.apply(this.state, params)
      }))
    }

    render() {
      return (
        <context.Provider value={this.state} children={this.props.children} />
      )
    }
  }
}
